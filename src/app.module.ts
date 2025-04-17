import { Module } from '@nestjs/common';
import { RecordModule } from './modules/records/record.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { OrdersModule } from './modules/orders/orders.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUrl),
    RecordModule,
    OrdersModule,
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          noAck: false,
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
