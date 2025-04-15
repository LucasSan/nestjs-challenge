import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../services/orders.service';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { Orders } from '../schemas/orders.schema';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate creation to the service and return result', async () => {
      const dto: CreateOrderRequestDTO = {
        recordId: '123',
        qty: 3,
      };

      mockService.create.mockResolvedValue(dto);

      const result = await controller.create(dto);

      expect(result).toEqual(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
});
