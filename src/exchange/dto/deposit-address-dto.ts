// src/exchange/dto/deposit-address.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DepositAddressDto {
  @ApiProperty({
    example: '0x123abc456def789gh',
    description: 'The deposit address for the specified currency and exchange',
  })
  address: string;
}
