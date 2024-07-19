import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as ccxt from 'ccxt';
import CcxtExtraClient from '../ccxt-client/ccxt-extra.client';
import { ConfigService } from '@nestjs/config';
import { DepositAddressDto } from './dto/deposit-address-dto';
import { CoinbasePrimeAPI } from '../coinbase-client/init-coinbase';

@Injectable()
export class ExchangeService {
  private exchange: ccxt.Exchange;

  constructor(private readonly configService: ConfigService) {}

  async getPortfolios(): Promise<any> {
    // Example usage
    const api = new CoinbasePrimeAPI();
    const response = await api.fetchProducts('BTC-EUR');
    return response;
  }

  async fetchDepositAddress(
    exchange: string,
    currency: string,
  ): Promise<DepositAddressDto> {
    try {
      if (exchange === 'coinbase') {
        const api = new CoinbasePrimeAPI();
        const depositAddress = await api.fetchDepositAddress(currency);
        return { address: depositAddress.address };
      } else {
        const extraClient = new CcxtExtraClient(exchange, this.configService);
        const depositAddress = await extraClient.fetchDepositAddress(currency);
        return { address: depositAddress.address };
      }
    } catch (error) {
      throw new HttpException(
        'Failed to fetch deposit address: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getBalances(exchange: string): Promise<any> {
    try {
      if (exchange === 'coinbase') {
        const api = new CoinbasePrimeAPI();
        const balances = await api.fetchBalance();
        return balances;
      } else {
        const extraClient = new CcxtExtraClient(exchange, this.configService);
        const balances = await extraClient.fetchBalance();
        return balances;
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      throw new HttpException(
        'Failed to fetch balances',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFees(): Promise<any> {
    try {
      const extraClient = new CcxtExtraClient('binance', this.configService);
      const fees = await extraClient.getFees();
      return fees;
    } catch (error) {
      console.error('Failed to fetch binance fees:', error);
      throw new HttpException(
        'Failed to fetch balances',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
