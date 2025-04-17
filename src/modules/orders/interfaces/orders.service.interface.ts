import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { Orders } from '../schemas/orders.schema';

export interface IOrdersService {
  create(payload: CreateOrderRequestDTO): Promise<Orders>;
}
