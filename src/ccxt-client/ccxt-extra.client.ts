import { binance } from 'ccxt';
import CcxtBaseClient from './ccxt-base.client';

class CcxtExtraClient extends CcxtBaseClient {
  async fetchDepositAddress(currency: string, options: any = {}): Promise<any> {
    const deposit_address = await this.exchange.fetchDepositAddress(
      currency,
      options,
    );
    return deposit_address;
  }

  async fetchBalance(options = {}) {
    const balance = await this.exchange.fetchBalance(options);
    return balance;
  }

  async getFees() {
    const balance = await (<binance>this.exchange).sapiGetCapitalConfigGetall();
    return balance;
  }
}
export default CcxtExtraClient;
