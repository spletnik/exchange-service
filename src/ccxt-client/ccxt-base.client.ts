import { Exchange, huobi } from 'ccxt';
import { ConfigService } from '@nestjs/config';
import { initExchange } from './init-exchange';
import { FetchOrderDto } from '../orders/dto/fetch-order.dto';
import { OrderDto } from '../orders/dto/order-response.dto';

const exchangesList: { [key: string]: Exchange } = {};

class CcxtBaseOrderClient {
  protected exchange_code: string;
  protected priceAgeLimit: number;
  protected exchange: Exchange;
  // protected binance: Binance;

  constructor(
    exchange: string,
    private readonly configService: ConfigService,
  ) {
    this.exchange_code = exchange;
    this.priceAgeLimit = 30 * 1000;

    if (!exchangesList[this.exchange_code]) {
      exchangesList[this.exchange_code] = initExchange(
        this.configService,
        this.exchange_code,
      );
    }

    this.exchange = exchangesList[this.exchange_code];
  }

  async fetchOrder(params: FetchOrderDto): Promise<OrderDto> {
    console.log('fetch order: ' + params.orderId);

    let order: OrderDto | null = null;

    if (this.exchange.id === 'bitmex') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const orders = await this.exchange.fetchOrders(
        undefined,
        undefined,
        500,
        {
          count: 500,
          reverse: true,
        },
      );

      console.log('count: ' + orders.length);
      for (const i in orders) {
        if (orders[i].id === params.orderId) {
          order = orders[i];
        }
      }
    } else if (
      this.exchange.id === 'binance' ||
      this.exchange.id === 'kraken' ||
      this.exchange.id === 'bitstamp' ||
      this.exchange.id === 'cex' ||
      this.exchange.id === 'okex' ||
      this.exchange.id === 'kucoin' ||
      this.exchange.id === 'gateio' ||
      this.exchange.id === 'bitmart' ||
      this.exchange.id === 'coinbasepro'
    ) {
      order = await this.exchange.fetchOrder(
        params.orderId,
        params.options.currencyPair,
      );
    } else if (this.exchange.id === 'huobipro') {
      await this.exchange.loadMarkets();
      const response = await (<huobi>this.exchange).privateGetOrderOrdersId(
        this.exchange.extend(
          {
            id: params.orderId,
          },
          {},
        ),
      );

      order = this.exchange.parseOrder(response['data']);
    }

    return order;
  }
}

export default CcxtBaseOrderClient;
