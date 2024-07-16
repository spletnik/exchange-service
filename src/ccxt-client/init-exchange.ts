import { ConfigService } from '@nestjs/config';
import {
  Exchange,
  binance,
  kraken,
  bitstamp,
  cex,
  okx,
  kucoin,
  gateio,
  bitmart,
  huobi,
  bitmex,
  coinbasepro,
} from 'ccxt';
import { HttpsProxyAgent } from 'https-proxy-agent';

export function initExchange(
  configService: ConfigService,
  exchange_code: string,
): Exchange {
  let exchange = null;
  const exchUpCase = exchange_code?.toUpperCase();
  const apiKey = configService.get<string>(`${exchUpCase}_API_KEY`);
  const secret = configService.get<string>(`${exchUpCase}_SECRET`);
  const password = configService.get<string>(`${exchUpCase}_PASSWORD`);
  const uid = configService.get<string>(`${exchUpCase}_USER_ID`);

  interface ExchangeConfig {
    apiKey: any;
    secret: any;
    agent?: any;
    options?: { fetchMinOrderAmounts: boolean };
  }

  let exchangeConfig: ExchangeConfig = {
    apiKey: apiKey,
    secret: secret,
  };

  if (process.env.useProxyForOrders === 'true') {
    if (process.env.proxyServer4) {
      exchangeConfig = {
        ...exchangeConfig,
        agent: new HttpsProxyAgent(process.env.proxyServer4),
        options: {
          fetchMinOrderAmounts: false,
        },
      };
    }
  }

  if (exchange_code === 'binance') {
    exchange = new binance({
      enableRateLimit: false,
      ...exchangeConfig,
    });
  }

  if (exchange_code === 'kraken') {
    exchange = new kraken({
      enableRateLimit: false,
      ...exchangeConfig,
    });
  }

  if (exchange_code === 'cexio') {
    exchange = new cex({
      uid: uid,
      ...exchangeConfig,
    });
  }

  if (exchange_code === 'bitstamp') {
    exchange = new bitstamp({
      uid: uid,
      ...exchangeConfig,
    });
  }

  if (exchange_code === 'huobi') {
    exchange = new huobi(exchangeConfig);
  }

  if (exchange_code === 'bitmex') {
    console.log('Init bitmex');

    exchange = new bitmex(exchangeConfig);
  }

  if (exchange_code === 'okex') {
    console.log('Init okex');
    exchange = new okx({
      password: password,
      ...exchangeConfig,
    });
  }

  if (exchange_code === 'kucoin') {
    console.log('Init kucoin');
    exchange = new kucoin({
      password: password,
      ...exchangeConfig,
    });
  }

  if (exchange_code === 'gateio') {
    console.log('Init gateio');
    exchange = new gateio(exchangeConfig);
  }

  if (exchange_code === 'bitmart') {
    console.log('Init bitmart');
    exchange = new bitmart({
      uid: uid,
      ...exchangeConfig,
    });
  }

  if (exchange_code === 'coinbasepro') {
    console.log('Init coinbasepro');
    exchange = new coinbasepro({
      password: password,
      ...exchangeConfig,
    });
  }

  return exchange;
}
