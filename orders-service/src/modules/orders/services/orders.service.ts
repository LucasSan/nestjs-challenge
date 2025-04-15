import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { Model } from 'mongoose';
import { Orders } from '../schemas/orders.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly rabbitQueueClient: ClientProxy,
    @InjectModel('Orders') private readonly ordersModel: Model<Orders>,
  ) {}

  async create(payload: CreateOrderRequestDTO): Promise<Orders> {
    try {
      const recordData = { ...payload };
      const order = await this.ordersModel.create(recordData);
      this.rabbitQueueClient.emit('order-placed', recordData);
      return order;
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }
}
