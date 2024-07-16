import { Controller, Get, Post, Body, Param } from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/order.dto';
import { OrdersService } from './orders.service';
import { OrderDto } from './dto/order-response.dto';
import { FetchOrderDto } from './dto/fetch-order.dto';

@ApiTags('orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 200, description: 'Order created', type: OrderDto })
  @ApiBody({ type: CreateOrderDto })
  createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderDto> {
    return this.ordersService.createOrder(
      createOrderDto.exchange,
      createOrderDto,
    );
  }

  @Get('orders/:exchange/:currency_pair/:id')
  @ApiOperation({ summary: 'Get an order by Exchange and ID' })
  @ApiResponse({ status: 200, description: 'Order details', type: OrderDto })
  @ApiParam({
    name: 'exchange',
    description: 'The Exchange from where to retreive order',
  })
  @ApiParam({
    name: 'currency_pair',
    description: 'The Currency Pair of the order.',
  })
  @ApiParam({ name: 'id', description: 'The ID of the order to retrieve' })
  getOrder(
    @Param('exchange') exchange: string,
    @Param('currency_pair') currency_pair: string,
    @Param('id') id: string,
  ): Promise<OrderDto> {
    const params: FetchOrderDto = {
      orderId: id,
      options: { currencyPair: currency_pair },
    };
    return this.ordersService.fetchOrder(exchange, params);
  }
}
