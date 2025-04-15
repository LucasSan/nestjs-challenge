import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [MongooseModule.forRoot(AppConfig.mongoUrl), OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
