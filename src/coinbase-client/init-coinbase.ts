import CryptoJS from 'crypto-js';
import { Method } from 'axios';
import https from 'https';
import { DepositAddressDto } from '../exchange/dto/deposit-address-dto';
import { CreateOrderDto } from '../orders/dto/order.dto';
import { OrderDto, OrderStatus } from '../orders/dto/order-response.dto';
import { FetchOrderDto } from '../orders/dto/fetch-order.dto';

const REST_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

const statusMap: { [key: string]: OrderStatus } = {
  OPEN: OrderStatus.Open,
  FILLED: OrderStatus.Closed,
  CANCELLED: OrderStatus.Canceled,
  EXPIRED: OrderStatus.Canceled,
  FAILED: OrderStatus.Canceled,
  PENDING: OrderStatus.Open,
};

type RestMethod = (typeof REST_METHODS)[keyof typeof REST_METHODS];

export class CoinbasePrimeAPI {
  private signingKey: string;
  private accessKey: string;
  private passphrase: string;
  private entityId: string;
  private portfolioId: string;
  private baseUrl: string;

  constructor() {
    this.signingKey = process.env.COINBASEPRO_SECRET as string;
    this.accessKey = process.env.COINBASEPRO_API_KEY as string;
    this.passphrase = process.env.COINBASEPRO_PASSWORD as string;
    this.entityId = process.env.ENTITY_ID as string;
    this.portfolioId = process.env.COINBASEPRO_PORTFOLIO_ID as string;
    this.baseUrl = 'api.prime.coinbase.com';
  }

  private getCurrentTimeInSecs(): number {
    return Math.floor(Date.now() / 1000);
  }

  private buildPayload(
    ts: number,
    method: RestMethod,
    requestPath: string,
    body: string,
  ): string {
    return `${ts}${method}${requestPath}${body}`;
  }

  private sign(str: string, secret: string): string {
    const hash = CryptoJS.HmacSHA256(str, secret);
    return hash.toString(CryptoJS.enc.Base64);
  }

  private getHeaders(method: RestMethod, requestPath: string, body: string) {
    const currentTimeInSecs = this.getCurrentTimeInSecs();
    const strToSign = this.buildPayload(
      currentTimeInSecs,
      method,
      requestPath,
      body,
    );
    const signature = this.sign(strToSign, this.signingKey);

    const headers = new Map();
    headers.set('X-CB-ACCESS-KEY', this.accessKey);
    headers.set('X-CB-ACCESS-PASSPHRASE', this.passphrase);
    headers.set('X-CB-ACCESS-SIGNATURE', signature);
    headers.set('X-CB-ACCESS-TIMESTAMP', currentTimeInSecs.toString());
    headers.set('Content-Type', 'application/json');
    return headers;
  }

  public makeRequest(
    method: Method,
    path: string,
    body: string = '',
    queryParams: string = '',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestPath = `/v1/` + path;
      const headers = this.getHeaders(
        method.toUpperCase() as RestMethod,
        requestPath,
        body,
      );

      const requestOptions: https.RequestOptions = {
        hostname: this.baseUrl,
        path: requestPath + queryParams,
        method: method.toUpperCase(),
        headers: Object.fromEntries(headers),
      };

      const req = https.request(requestOptions, (res) => {
        const data: Uint8Array[] = [];
        console.log('Status Code:', res.statusCode);
        res.on('data', (chunk) => {
          data.push(chunk);
        });
        res.on('end', () => {
          console.log('Response ended: ');
          const responseString = Buffer.concat(data).toString();
          try {
            const parsedResponse = JSON.parse(responseString);
            console.log(parsedResponse);
            resolve(parsedResponse);
          } catch (error) {
            console.error('Error parsing response:', responseString);
            reject(`Failed to parse response: ${responseString}`);
          }
        });
      });

      req.on('error', (err) => {
        console.log('Error: ', err.message);
        reject(err.message);
      });

      if (method.toUpperCase() !== 'GET' && body) {
        req.write(body);
      }

      req.end();
    });
  }

  public fetchPortfolios(): Promise<any> {
    // return this.makeRequest(REST_METHODS.GET, 'portfolios');
    const path = `portfolios/${this.portfolioId}/balances`;
    return this.makeRequest(REST_METHODS.GET, path);
  }

  async fetchProducts(): Promise<any> {
    // return this.makeRequest(REST_METHODS.GET, 'portfolios');
    const path = `portfolios/${this.portfolioId}/products`;
    const products = await this.makeRequest(
      REST_METHODS.GET,
      path,
      '',
      '?limit=10000',
    );
    return products.products.find((item) => item.id === 'BTC-EUR');
  }

  async fetchBalance(): Promise<any> {
    const path = `portfolios/${this.portfolioId}/balances`;
    return this.makeRequest(REST_METHODS.GET, path);
  }

  async getWallets(currency: string): Promise<any> {
    const path = `portfolios/${this.portfolioId}/wallets`;
    let queryParams = '?type=TRADING';
    if (currency) {
      queryParams = queryParams + `&symbols=${currency}`;
    }
    return this.makeRequest(REST_METHODS.GET, path, '', queryParams);
  }

  async fetchDepositAddress(currency: string): Promise<DepositAddressDto> {
    const response = await this.getWallets(currency);
    const depositAddress = response.wallets.find(
      (item) => item.symbol === currency,
    );

    if (!depositAddress) {
      throw new Error(
        'Wallet not found, you probably need to create a TRADING wallet for ' +
          currency,
      );
    }

    const walleId = depositAddress.id;

    const path = `portfolios/${this.portfolioId}/wallets/${walleId}/deposit_instructions`;
    const reqResponse = await this.makeRequest(
      REST_METHODS.GET,
      path,
      '',
      '?deposit_type=CRYPTO',
    );

    if (!reqResponse.crypto_instructions) {
      throw new Error('Deposit instructions not found');
    }

    return { address: reqResponse.crypto_instructions?.address };
  }

  convertPairToProduct(pair: string): string {
    const [base, quote] = pair.split('/');
    return `${base}-${quote}`;
  }

  convertProductToPair(pair: string): string {
    const [base, quote] = pair.split('-');
    return `${base}/${quote}`;
  }

  /**
   * Reduces a number to the nearest multiple of the specified minimum size.
   * @param {number} amount - The original amount to be reduced.
   * @param {number} minSize - The minimum size to which the amount should be reduced.
   * @returns {number} - The reduced amount.
   */
  reduceToMinSize(amount, minSize) {
    // Calculate the number of decimal places in the minimum size
    const decimalPlaces = Math.floor(Math.log10(1 / minSize));

    // Round down the amount to the nearest multiple of the minimum size
    const reducedAmount = Math.floor(amount / minSize) * minSize;

    // Fix the precision to the number of decimal places in the minimum size
    return parseFloat(reducedAmount.toFixed(decimalPlaces));
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderDto> {
    console.log(createOrderDto);
    const product = this.convertPairToProduct(createOrderDto.ccy_pair);

    const path = `portfolios/${this.portfolioId}/order`;

    const originalAmount = createOrderDto.amount;
    const minSize = 0.00000001;
    const reducedAmount = this.reduceToMinSize(originalAmount, minSize);
    console.log(reducedAmount); // Output: 0.00031717

    const jsonData = {
      portfolio_id: this.portfolioId,
      product_id: product,
      side: createOrderDto.type?.toUpperCase(),
      client_order_id: 'test1',
      type: 'MARKET',
    };

    if (createOrderDto.type.toUpperCase() === 'BUY') {
      jsonData['quote_value'] = createOrderDto.amount.toString();
    } else {
      jsonData['base_quantity'] = reducedAmount.toString();
    }

    const data = JSON.stringify(jsonData);

    const reqResponse = await this.makeRequest(REST_METHODS.POST, path, data);
    return reqResponse;
  }

  convertStatus(status: string): OrderStatus {
    return statusMap[status] || OrderStatus.Open; // Default to 'Open' if status is not in the map
  }

  async fetchOrder(params: FetchOrderDto): Promise<OrderDto> {
    console.log(params);
    //const product = this.convertPairToProduct(createOrderDto.ccy_pair);

    const path = `portfolios/${this.portfolioId}/orders/${params.orderId}`;

    const reqResponse = await this.makeRequest(REST_METHODS.GET, path);
    const respOrder = reqResponse.order;

    const order: OrderDto = {
      id: respOrder.id,
      clientOrderId: respOrder.client_order_id,
      datetime: respOrder.created_at,
      timestamp: new Date(respOrder.created_at).getTime(),
      status: this.convertStatus(respOrder.status) as OrderStatus,
      symbol: this.convertProductToPair(respOrder.product_id),
      side: respOrder.side?.toLowerCase(),
      type: respOrder.type?.toLowerCase(),
      price: respOrder.quote_value / respOrder.filled_quantity, //respOrder.average_filled_price,
      stopPrice: respOrder.stop_price,
      cost: respOrder.filled_value, //filled_value is value wihout fee, with fee included use reqResponse.quote_value
      amount: respOrder.filled_quantity,
      fee: {
        cost: respOrder.commission,
        currency: respOrder.product_id.split('-')[1],
      },
      lastTradeTimestamp: 0,
      filled: respOrder.filled_quantity,
      average: respOrder.average_filled_price,
      remaining: respOrder.remaining_quantity,
      trades: [],
      info: {},
    };

    return order;
  }
}

//  "price": "62981.0017501372572267",
// "price": 63056.57895223742,

// "id"=>"OIBFF6-T2PQK-BCR5LE",
// "clientOrderId"=>"0",
// "timestamp"=>1721043334181,
// "datetime"=>"2024-07-15T11:35:34.181Z",
// "status"=>"closed",
// "symbol"=>"MATIC/EUR",
// "type"=>"limit",
// "side"=>"buy",

// "price"=>0.4878,
// "stopPrice"=>0,
// "cost"=>13.250770437057,
// "amount"=>27.22574571,
// "filled"=>27.22574571,
// "average"=>0.4867,
// "remaining"=>0,
// "fee"=>{"cost"=>0.053014, "currency"=>"EUR"},
// "trades"=>[{"id"=>"TH3EIP-BCVSK-MHTC5W", "order"=>"OIBFF6-T2PQK-BCR5LE", "info"=>"TH3EIP-BCVSK-MHTC5W", "symbol"=>"MATIC/EUR", "type"=>"limit", "side"=>"buy", "fee"=>{}, "fees"=>[]}],
// "fees"=>[{"cost"=>0.053014, "currency"=>"EUR"}]}

// export class OrderDto {
//   @ApiProperty()
//   @IsString()
//   id: string;

//   @ApiProperty()
//   @IsString()
//   clientOrderId: string;

//   @ApiProperty()
//   @IsString()
//   datetime: string;

//   @ApiProperty()
//   @IsNumber()
//   timestamp: number;

//   @ApiProperty()
//   @IsNumber()
//   lastTradeTimestamp: number;

//   @ApiProperty()
//   @IsOptional()
//   @IsNumber()
//   lastUpdateTimestamp?: number;

//   @ApiProperty()
//   @IsEnum(OrderStatus)
//   status: OrderStatus | string;

//   @ApiProperty()
//   @IsString()
//   symbol: string;

//   @ApiProperty()
//   @IsString()
//   type: string;

//   @ApiProperty()
//   @IsOptional()
//   @IsString()
//   timeInForce?: string;

//   @ApiProperty()
//   @IsEnum(OrderSide)
//   side: OrderSide | string;

//   @ApiProperty()
//   @IsNumber()
//   price: number;

//   @ApiProperty()
//   @IsOptional()
//   @IsNumber()
//   average?: number;

//   @ApiProperty()
//   @IsNumber()
//   amount: number;

//   @ApiProperty()
//   @IsNumber()
//   filled: number;

//   @ApiProperty()
//   @IsNumber()
//   remaining: number;

//   @ApiProperty()
//   @IsOptional()
//   @IsNumber()
//   stopPrice?: number;

//   @ApiProperty()
//   @IsOptional()
//   @IsNumber()
//   triggerPrice?: number;

//   @ApiProperty()
//   @IsOptional()
//   @IsNumber()
//   takeProfitPrice?: number;

//   @ApiProperty()
//   @IsOptional()
//   @IsNumber()
//   stopLossPrice?: number;

//   @ApiProperty()
//   @IsNumber()
//   cost: number;

//   @ApiProperty()
//   @ValidateNested({ each: true })
//   @Type(() => TradeDto)
//   trades: TradeDto[];

//   @ApiProperty()
//   @ValidateNested()
//   @Type(() => FeeInterfaceDto)
//   fee: FeeDto;

//   // @IsBoolean()
//   // reduceOnly: boolean;

//   // @IsBoolean()
//   // postOnly: boolean;

//   @ApiProperty()
//   @IsObject()
//   info: any;
// }

// Response ended:
// {
//   order: {
//     id: '15fbb240-7ecd-4787-9989-ead13db438e6',
//     user_id: 'f3427ea1-57bd-5de7-8da3-3ac2b747ace4',
//     portfolio_id: 'cbceabfd-3f36-4b66-9f8e-144819987df0',
//     product_id: 'BTC-USDT',
//     side: 'BUY',
//     client_order_id: 'test1',
//     type: 'MARKET',
//     base_quantity: '',
//     quote_value: '20',
//     limit_price: '',
//     start_time: null,
//     expiry_time: null,
//     status: 'FILLED',
//     time_in_force: 'IMMEDIATE_OR_CANCEL',
//     created_at: '2024-07-15T14:35:25.196579Z',
//     filled_quantity: '0.000317175468957',
//     filled_value: '19.9760287654814223',
//     average_filled_price: '62981.0017501372572267',
//     commission: '0.0239712345185777',
//     exchange_fee: '',
//     historical_pov: '',
//     stop_price: ''
//   }

// Response ended:
// { order_id: '15fbb240-7ecd-4787-9989-ead13db438e6' }

// @ApiProperty()
// @IsNotEmpty()
// @IsNumber()
// amount: number; // Since the example has it as string; consider changing to @IsNumber() if it's supposed to be numeric.

// @ApiProperty()
// @IsNotEmpty()
// @IsString()
// price: string; // Same note as above for being string type.

// @ApiProperty({ enum: ['buy', 'sell', 'buy_for_crypto'] })
// @IsNotEmpty()
// @IsString()
// @IsEnum(['buy', 'sell', 'buy_for_crypto'])
// type: 'buy' | 'sell' | 'buy_for_crypto';

// @ApiProperty({ example: 'EUR/BTC' })
// @IsNotEmpty()
// @IsString()
// ccy_pair: string;
