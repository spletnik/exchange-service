import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

// delete process.env.KRAKEN_API_KEY;
// delete process.env.KRAKEN_SECRET;

// delete process.env.CEXIO_USER_ID;

// delete process.env.BINANCE_API_KEY;
// delete process.env.BINANCE_API_KEY_1;
// delete process.env.BINANCE_SECRET;

// delete process.env.HUOBI_API_KEY;
// delete process.env.HUOBI_SECRET;

// delete process.env.BITSTAMP_USER_ID;
// delete process.env.BITSTAMP_API_KEY;
// delete process.env.BITSTAMP_SECRET;

// delete process.env.BITMEX_API_KEY;
// delete process.env.BITMEX_SECRET;

// delete process.env.OKEX_API_KEY;
// delete process.env.OKEX_SECRET;
// delete process.env.OKEX_PASSWORD;

// delete process.env.KUCOIN_API_KEY;
// delete process.env.KUCOIN_SECRET;
// delete process.env.KUCOIN_PASSWORD;

// delete process.env.GATEIO_API_KEY;
// delete process.env.GATEIO_SECRET;

// delete process.env.BITMART_API_KEY;
// delete process.env.BITMART_SECRET;
// delete process.env.BITMAP_USER_ID;
console.log(process.env.GATEIO_API_KEY);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Exchange API')
    .setDescription('The exchange API description')
    .setVersion('1.0')
    .addTag('exchange')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
