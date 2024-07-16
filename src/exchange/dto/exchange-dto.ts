import { ArrayNotEmpty, IsArray, IsIn } from 'class-validator';

const exchanges = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export class ExchangeDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(exchanges)
  exchange: string;
}
