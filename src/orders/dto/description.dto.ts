// src/common/dto/min-max.dto.ts
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsObject,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';

export class MinMaxDto {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

// src/common/dto/fee-interface.dto.ts

export class FeeInterfaceDto {
  @IsString()
  currency: string;

  @IsNumber()
  cost: number;

  @IsOptional()
  @IsNumber()
  rate?: number;
}

// src/common/dto/trading-fee-interface.dto.ts

export class TradingFeeInterfaceDto {
  @IsObject()
  info: any;

  @IsString()
  symbol: string;

  @IsNumber()
  maker: number;

  @IsNumber()
  taker: number;

  @IsBoolean()
  percentage: boolean;

  @IsBoolean()
  tierBased: boolean;
}

export declare type FeeDto = FeeInterfaceDto | undefined;

export enum TradeSide {
  Buy = 'buy',
  Sell = 'sell',
}

export class TradeDto {
  @IsObject()
  info: any;

  @IsNumber()
  amount: number;

  @IsString()
  datetime: string;

  @IsString()
  id: string;

  @IsString()
  order?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  timestamp: number;

  @IsString()
  type?: string;

  @IsEnum(TradeSide)
  side: TradeSide | string;

  @IsString()
  symbol: string;

  @IsString()
  takerOrMaker: 'taker' | 'maker' | string;

  @IsNumber()
  cost: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FeeInterfaceDto)
  fee?: FeeInterfaceDto;
}
