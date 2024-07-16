import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DepositAddressDto } from './dto/deposit-address-dto';

@ApiTags('exchange')
@Controller()
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get system status' })
  @ApiQuery({
    name: 'timeout',
    required: false,
    description: 'Timeout value in seconds',
  })
  @ApiResponse({ status: 200, description: 'System status', type: Object })
  getStatus(@Query('timeout') timeout: number): any {
    return { status: 'UP', timeout };
  }

  @Get('portfolios')
  @ApiOperation({ summary: 'Get portfolio status' })
  @ApiResponse({ status: 200, description: 'Portfolio status', type: Object })
  getPortfolios(): any {
    return this.exchangeService.getPortfolios();
  }

  @Get('balances/:exchange')
  @ApiOperation({ summary: 'Get balances for a specific exchange' })
  @ApiParam({ name: 'exchange', description: 'The code of the exchange' })
  @ApiResponse({ status: 200, description: 'Exchange balances', type: Object })
  getBalances(@Param('exchange') exchange: string): any {
    return this.exchangeService.getBalances(exchange);
  }

  @Get('deposit_address/:exchange/:currency/0')
  @ApiOperation({
    summary: 'Get deposit address for a currency on an exchange',
  })
  @ApiParam({
    name: 'exchange',
    description: 'The name of the exchange',
    type: String,
  })
  @ApiParam({
    name: 'currency',
    description: 'The code of the currency, will be converted to uppercase',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description:
      'The deposit address for the specified currency on the given exchange',
    type: DepositAddressDto,
  })
  getDepositAddress(
    @Param('exchange') exchange: string,
    @Param('currency') currency: string,
  ): Promise<DepositAddressDto> {
    // Here, you would typically call a service method to fetch the deposit address
    // The following is a placeholder return for demonstration purposes
    return this.exchangeService.fetchDepositAddress(
      exchange,
      currency?.toUpperCase(),
    );
  }

  @Get('exchange/get_fees')
  @ApiOperation({ summary: 'Get transaction fees' })
  @ApiResponse({ status: 200, description: 'Fees details', type: Object })
  getFees(): any {
    return this.exchangeService.getFees();
  }
}
