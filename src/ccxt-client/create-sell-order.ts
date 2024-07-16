import { CreateOrderDto } from '../orders/dto/order.dto';
import { OrderDto } from '../orders/dto/order-response.dto';
import CcxtBaseClient from './ccxt-base.client';

class CcxtSellOrderClient extends CcxtBaseClient {
  async createLimitSellOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDto> {
    console.log('input price: ', createOrderDto.price);
    let trade_data = null;
    const amount = createOrderDto.amount;
    const symbol = createOrderDto.ccy_pair;

    if (this.exchange.id === 'bitmex') {
      trade_data = await this.exchange.createMarketSellOrder(
        symbol,
        undefined,
        {
          simpleOrderQty: amount,
        },
      );
    } else if (
      this.exchange.id === 'kraken' ||
      this.exchange.id === 'binance' ||
      this.exchange.id === 'bitstamp' ||
      this.exchange.id === 'bitmart'
    ) {
      trade_data = await this.exchange.createMarketSellOrder(symbol, amount);
    } else if (this.exchange.id === 'gateio') {
      const bookPrice = await this._calculateSellLimitPrice(symbol, 0.003);
      const sellCryptoAmount = amount / bookPrice;

      if (
        isNaN(sellCryptoAmount) ||
        isNaN(bookPrice) ||
        sellCryptoAmount <= 0 ||
        bookPrice <= 0
      ) {
        throw new Error('Price or amount is not a valid number');
      }

      console.log(
        `Limit buy order ${symbol} / ${amount} / ${sellCryptoAmount} / ${bookPrice}`,
      );
      trade_data = await this.exchange.createLimitSellOrder(
        symbol,
        amount,
        bookPrice,
        {},
      );
      trade_data.book_price = bookPrice;
      console.log('trade_data: ' + JSON.stringify(trade_data));
    } else {
      trade_data = await this.exchange.createMarketSellOrder(symbol, amount);
    }

    return trade_data;
  }

  private async _calculateSellLimitPrice(
    symbol: string,
    factor: number,
  ): Promise<number> {
    const limit = 1;
    const orders = await this.exchange.fetchOrderBook(symbol, limit, {
      limit: '1',
      size: '2',
    });
    const milliseconds = new Date().getTime();
    const timeDiff = milliseconds - orders.timestamp;
    let bookPrice = orders.bids[0][0];

    console.log('Order Book Price:', bookPrice);
    console.log('Order Book Timestamp:', orders.timestamp);
    console.log(`Price time offset: ${timeDiff} ms`);

    if (timeDiff > this.priceAgeLimit) {
      throw new Error('Price is too old: ' + timeDiff + ' ms');
    }

    bookPrice -= bookPrice * factor;
    return bookPrice;
  }
}

export default CcxtSellOrderClient;
