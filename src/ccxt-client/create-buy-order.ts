import Limit from '../exchange/limit';
import { CreateOrderDto } from '../orders/dto/order.dto';
import { OrderDto } from '../orders/dto/order-response.dto';
import CcxtBaseClient from './ccxt-base.client';

class CcxtBuyOrderClient extends CcxtBaseClient {
  async createLimitBuyOrder(createOrderDto: CreateOrderDto): Promise<OrderDto> {
    const amount = createOrderDto.amount;
    console.log('buying: ' + amount);
    console.log('price: ' + createOrderDto.price);

    let orders = null;
    //const limit = Limit.getBuyLimit(this.exchange.id);

    orders = await this.exchange.fetchOrderBook(createOrderDto.ccy_pair, 20, {
      count: 3,
    });

    const milliseconds = new Date().getTime();
    let book_price = orders.asks[0][0];
    const time_diff = milliseconds - orders.timestamp;
    console.log('Order Book Price:', book_price);
    console.log('Order Book Timestamp:', orders.timestamp);
    console.log(`Price time offset ${time_diff} ms`);

    const oldPrice = book_price;
    console.log('Order Book Price:', oldPrice);

    const fixed_book_proce = book_price * 1.005;
    console.log('fixed_book_proce Book Price:', fixed_book_proce);

    // Track the starting price
    const starting_price = book_price;
    console.log(`Starting price from the order book: ${starting_price}`);

    // Adding a buffer of 50%
    const bufferMultiplier = 1.5;
    const targetAmountWithBuffer = amount * bufferMultiplier;
    console.log(`Target amount with buffer (50%): ${targetAmountWithBuffer}`);

    // Initialize accumulated value in USDT
    let accumulated_value_in_usdt = 0;

    console.log(
      'Starting to accumulate needed amount in USDT from the asks...',
    );

    for (const [price, qty] of orders.asks) {
      const value_in_usdt = price * qty; // Convert qty to USDT value
      accumulated_value_in_usdt += value_in_usdt;

      console.log(`Checking ask with price ${price} and quantity ${qty}...`);
      console.log(
        `Value in USDT for this ask: ${value_in_usdt}. Total accumulated value in USDT: ${accumulated_value_in_usdt}`,
      );

      if (accumulated_value_in_usdt >= targetAmountWithBuffer) {
        book_price = price; // Set book_price to the current price where the condition meets

        console.log(
          `Target amount in USDT with buffer reached. Book price set to ${book_price}. Breaking out of the loop.`,
        );

        break;
      }
    }

    // Calculate the percentage increase from the starting price to the final calculated book price
    const price_increase_percentage =
      ((book_price - starting_price) / starting_price) * 100;
    console.log(
      `Your buy order for ${amount} USDT increased the price of the token by ${price_increase_percentage.toFixed(2)}% from the starting price of ${starting_price} to the final price of ${book_price}.`,
    );

    let buy_crypto_amount = 0;

    if (this.exchange.id === 'bitstamp') {
      if (createOrderDto.ccy_pair == 'BTC/EUR') {
        book_price = Math.round(book_price);
      }
    }

    buy_crypto_amount = amount / book_price;
    // if (this.exchange.id === 'kraken') {
    //   book_price = book_price * 1.002;
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'bitstamp') {
    //   book_price = book_price * 1.002;
    //   if (createOrderDto.ccy_pair == 'BTC/EUR') {
    //     book_price = Math.round(book_price);
    //   }
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'binance') {
    //   book_price = book_price * 1.003;
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'coinbasepro') {
    //   book_price = book_price * 1.003;
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'bitmex') {
    //   buy_crypto_amount = amount;
    // } else if (this.exchange.id === 'cex') {
    //   book_price = parseFloat((book_price * 1.002).toFixed(1));
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'huobipro') {
    //   book_price = book_price * 1.008;
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'okex') {
    //   book_price = book_price * 1.005;
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'kucoin') {
    //   book_price = book_price * 1.005;
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'gateio') {
    //   book_price = book_price * 1.005;
    //   buy_crypto_amount = amount / book_price;
    // } else if (this.exchange.id === 'bitmart') {
    //   console.log('Bitmart original price: ' + book_price);
    //   book_price = book_price * 1.04;
    //   console.log('Bitmart slippage price: ' + book_price);
    //   buy_crypto_amount = amount / book_price;
    // }

    if (time_diff > 30 * 1000) {
      throw new Error('Price is too old: ' + time_diff + ' ms');
    }

    if (
      isNaN(buy_crypto_amount) ||
      isNaN(book_price) ||
      buy_crypto_amount <= 0 ||
      book_price <= 0
    ) {
      throw new Error('Price or amount is not a valid number');
    }

    console.log(
      'Limit buy order: ' +
        createOrderDto.ccy_pair +
        ' / ' +
        buy_crypto_amount +
        ' / ' +
        book_price,
    );

    const trade_data = await this.exchange.createLimitBuyOrder(
      createOrderDto.ccy_pair,
      buy_crypto_amount,
      book_price,
      {},
    );
    trade_data['book_price'] = book_price;

    console.log('trade_data: ' + JSON.stringify(trade_data));

    return trade_data;
  }
}
export default CcxtBuyOrderClient;
