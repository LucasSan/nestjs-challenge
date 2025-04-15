import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Orders } from '../schemas/orders.schema';
import { ClientProxy } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let model: Model<Orders>;
  let client: ClientProxy;

  const mockOrder: Partial<Orders> = {
    recordId: '123',
    qty: 2,
  };

  const mockOrderModel = {
    create: jest.fn(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken('Orders'),
          useValue: mockOrderModel,
        },
        {
          provide: 'ORDERS_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    model = module.get<Model<Orders>>(getModelToken('Orders'));
    client = module.get<ClientProxy>('ORDERS_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order and emit event', async () => {
      const dto: CreateOrderRequestDTO = {
        recordId: '123',
        qty: 2,
      };

      const createdOrder = { _id: 'abc', ...dto };

      mockOrderModel.create.mockResolvedValue(createdOrder);

      const result = await service.create(dto);

      expect(result).toEqual(createdOrder);
      expect(model.create).toHaveBeenCalledWith(dto);
      expect(client.emit).toHaveBeenCalledWith('order-placed', dto);
    });

    it('should throw if creation fails', async () => {
      const dto: CreateOrderRequestDTO = {
        recordId: 'error-id',
        qty: 1,
      };

      mockOrderModel.create.mockRejectedValue(new Error('Mock create error'));

      await expect(service.create(dto)).rejects.toThrow(
        'Error creating order: Mock create error',
      );
    });
  });
});
