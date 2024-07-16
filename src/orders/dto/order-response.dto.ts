// src/exchange/dto/order.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeeDto, FeeInterfaceDto, TradeDto } from './description.dto';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  Open = 'open',
  Closed = 'closed',
  Canceled = 'canceled',
}

export enum OrderSide {
  Buy = 'buy',
  Sell = 'sell',
}

export class OrderDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  clientOrderId: string;

  @ApiProperty()
  @IsString()
  datetime: string;

  @ApiProperty()
  @IsNumber()
  timestamp: number;

  @ApiProperty()
  @IsNumber()
  lastTradeTimestamp: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  lastUpdateTimestamp?: number;

  @ApiProperty()
  @IsEnum(OrderStatus)
  status: OrderStatus | string;

  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  timeInForce?: string;

  @ApiProperty()
  @IsEnum(OrderSide)
  side: OrderSide | string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  average?: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNumber()
  filled: number;

  @ApiProperty()
  @IsNumber()
  remaining: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  stopPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  triggerPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  takeProfitPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  stopLossPrice?: number;

  @ApiProperty()
  @IsNumber()
  cost: number;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => TradeDto)
  trades: TradeDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => FeeInterfaceDto)
  fee: FeeDto;

  // @IsBoolean()
  // reduceOnly: boolean;

  // @IsBoolean()
  // postOnly: boolean;

  @ApiProperty()
  @IsObject()
  info: any;
}
