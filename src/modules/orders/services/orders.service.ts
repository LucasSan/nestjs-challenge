import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { Model } from 'mongoose';
import { Orders } from '../schemas/orders.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IOrdersService } from '../interfaces/orders.service.interface';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly rabbitQueueClient: ClientProxy,
    @InjectModel('Orders') private readonly ordersModel: Model<Orders>,
  ) {}

  async create(payload: CreateOrderRequestDTO): Promise<Orders> {
    try {
      const recordData = { ...payload };

      const isRecordAvailable = await firstValueFrom(
        this.rabbitQueueClient.send(
          { cmd: 'order:check_availability' },
          recordData,
        ),
      );

      if (!isRecordAvailable) {
        throw new BadRequestException('Record is not available');
      }

      await firstValueFrom(
        this.rabbitQueueClient.send({ cmd: 'order:order_placed' }, recordData),
      );

      const createOrderRecord = await this.ordersModel.create(recordData);
      return createOrderRecord;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error creating order: ${error.message}`,
      );
    }
  }
}
