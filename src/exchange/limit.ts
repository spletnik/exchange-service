const BINANCE: string = 'binance';
const KRAKEN: string = 'kraken';
const HUOBI: string = 'huobi';
const HUOBIPRO: string = 'huobipro';
const KUCOIN: string = 'kucoin';

class Limit {
  static getLimit(exchangeName: string): number {
    switch (exchangeName) {
      case HUOBI: {
        return 150;
      }
      case KRAKEN: {
        return 10;
      }
      case BINANCE: {
        return 5;
      }
      case KUCOIN: {
        return 20;
      }
      case HUOBIPRO: {
        return 5;
      }
      default:
        return 5;
    }
  }

  static getBuyLimit(exchangeName: string): number {
    switch (exchangeName) {
      case BINANCE: {
        return 5;
      }
      case KUCOIN: {
        return 20;
      }
      case HUOBI: {
        return 5;
      }
      case HUOBIPRO: {
        return 5;
      }
      default:
        return 1;
    }
  }
}

export default Limit;
