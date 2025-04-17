import { Module } from '@nestjs/common';
import { RecordModule } from './modules/records/record.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { OrdersModule } from './modules/orders/orders.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUrl),
    RecordModule,
    OrdersModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore,
        url: 'redis://localhost:6379',
        ttl: 60,
      }),
    }),
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          noAck: true,
          urls: ['amqp://localhost:5672'],
          queue: 'orders-queue',
        },
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
