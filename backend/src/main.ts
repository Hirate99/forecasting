import { NestFactory } from '@nestjs/core';
import {
  type NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';

import compression from '@fastify/compress';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.setGlobalPrefix('api');

  await app.register(compression, {
    threshold: 128,
  });

  const port = parseInt(process.env.PORT ?? '3000');

  await app.listen({
    host: '0.0.0.0',
    port,
  });
}
bootstrap();
