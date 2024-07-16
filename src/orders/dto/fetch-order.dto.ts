import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class OrderOptionsDto {
  @IsString()
  currencyPair: string;
}

export class FetchOrderDto {
  @IsString()
  orderId: string;

  @ValidateNested()
  @Type(() => OrderOptionsDto)
  options: OrderOptionsDto;
}
