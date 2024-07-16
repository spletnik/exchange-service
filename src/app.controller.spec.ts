import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExchangeController } from './exchange/exchange.controller';
import { ExchangeService } from './exchange/exchange.service';
import { ConfigService } from '@nestjs/config';
import { MockConfigService } from './config.service.mock';

describe('AppController', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let appController: AppController;
  let exchangeController: ExchangeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController, ExchangeController],
      providers: [
        AppService,
        ExchangeService,
        { provide: ConfigService, useClass: MockConfigService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    exchangeController = app.get<ExchangeController>(ExchangeController);
  });

  describe('status', () => {
    it('should return "UP!"', () => {
      expect(exchangeController.getStatus(10)).toStrictEqual({
        status: 'UP',
        timeout: 10,
      });
    });
  });
});
