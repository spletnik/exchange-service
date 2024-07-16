// src/exchange/dto/create-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number; // Since the example has it as string; consider changing to @IsNumber() if it's supposed to be numeric.

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  price: string; // Same note as above for being string type.

  @ApiProperty({ enum: ['buy', 'sell', 'buy_for_crypto'] })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['buy', 'sell', 'buy_for_crypto'])
  type: 'buy' | 'sell' | 'buy_for_crypto';

  @ApiProperty({ example: 'EUR/BTC' })
  @IsNotEmpty()
  @IsString()
  ccy_pair: string;

  @ApiProperty({ example: 'kraken' })
  @IsNotEmpty()
  @IsString()
  exchange: string;
}
