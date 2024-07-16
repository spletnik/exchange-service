import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as ccxt from 'ccxt';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/order.dto';
import { OrderDto } from './dto/order-response.dto';
import { FetchOrderDto } from './dto/fetch-order.dto';
import CcxtSellOrderClient from '../ccxt-client/create-sell-order';
import CcxtBuyOrderClient from '../ccxt-client/create-buy-order';
import CcxtBaseOrderClient from '../ccxt-client/ccxt-base.client';
import { CoinbasePrimeAPI } from '../coinbase-client/init-coinbase';

@Injectable()
export class OrdersService {
  private exchange: ccxt.Exchange;

  constructor(private readonly configService: ConfigService) {}

  async createOrder(
    exchange: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDto> {
    try {
      if (exchange === 'coinbase') {
        const api = new CoinbasePrimeAPI();
        const result = await api.createOrder(createOrderDto);
        return result;
      } else {
        const buyClient = new CcxtBuyOrderClient(exchange, this.configService);
        const sellClient = new CcxtSellOrderClient(
          exchange,
          this.configService,
        );
        const type = createOrderDto.type;
        let result = null;
        switch (type) {
          case 'buy': {
            result = await buyClient.createLimitBuyOrder(createOrderDto);
            break;
          }
          case 'sell': {
            result = await sellClient.createLimitSellOrder(createOrderDto);
            break;
          }
          case 'buy_for_crypto': {
            result = await buyClient.createLimitBuyOrder(createOrderDto);
            break;
          }
          default: {
            result = {
              error: 'Order Type undefined.',
            };
          }
        }

        return result;
      }
    } catch (error) {
      throw new HttpException(
        'Failed to create order: ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchOrder(exchange: string, params: FetchOrderDto): Promise<OrderDto> {
    try {
      if (exchange === 'coinbase') {
        const api = new CoinbasePrimeAPI();
        const order = await api.fetchOrder(params);
        return order;
      } else {
        const orderClient = new CcxtBaseOrderClient(
          exchange,
          this.configService,
        );
        const order = await orderClient.fetchOrder(params);
        return order;
      }
    } catch (error) {
      throw new HttpException(
        'Failed to fetch order: ' + error.message,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
