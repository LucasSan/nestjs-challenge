import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { Orders } from '../schemas/orders.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() payload: CreateOrderRequestDTO): Promise<Orders> {
    return this.ordersService.create(payload);
  }
}
