import { Module } from '@nestjs/common';
import { RecordModule } from './modules/records/record.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';

@Module({
  imports: [MongooseModule.forRoot(AppConfig.mongoUrl), RecordModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
