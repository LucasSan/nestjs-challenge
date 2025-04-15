import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './app.config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Import Swagger
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Agent, interceptors, setGlobalDispatcher } from 'undici';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Interceptors to add response caching, DNS caching and retrying to the dispatcher
  const { cache, dns, retry } = interceptors;
  const defaultDispatcher = new Agent({
    connections: 100, // Limit concurrent kept-alive connections to not run out of resources
    headersTimeout: 10_000, // 10 seconds; set as appropriate for the remote servers you plan to connect to
    bodyTimeout: 10_000,
  }).compose(cache(), dns(), retry());
  setGlobalDispatcher(defaultDispatcher); // Add these interceptors to all `fetch` and Undici `request` calls

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Record API')
    .setDescription('The record management API')
    .build();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(AppConfig.port);

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [AppConfig.rabbitMQUrl],
      queue: AppConfig.rabbitMQQueue,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.startAllMicroservices();
}
bootstrap();
