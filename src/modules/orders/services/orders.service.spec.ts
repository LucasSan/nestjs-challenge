import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { Orders } from '../schemas/orders.schema';
import { CreateOrderRequestDTO } from '../dtos/create-order.request.dto';
import { of } from 'rxjs';

const mockOrderModel = {
  create: jest.fn(),
};

const mockClientProxy = {
  send: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersModel: Model<Orders>;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken('Orders'), useValue: mockOrderModel },
        { provide: 'ORDERS_SERVICE', useValue: mockClientProxy },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersModel = module.get<Model<Orders>>(getModelToken('Orders'));
    clientProxy = module.get<ClientProxy>('ORDERS_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an order', async () => {
      const payload: CreateOrderRequestDTO = { recordId: 'record123', qty: 2 };
      const orderResult = {
        _id: '1',
        recordId: 'record123',
        qty: 2,
        toObject: () => ({ _id: '1', recordId: 'record123', qty: 2 }),
      };

      jest.spyOn(clientProxy, 'send').mockReturnValueOnce(of(true));
      jest.spyOn(clientProxy, 'send').mockReturnValueOnce(of(true));
      jest
        .spyOn(ordersModel, 'create')
        .mockResolvedValueOnce(orderResult as any);

      const result = await service.create(payload);

      expect(clientProxy.send).toHaveBeenCalledWith(
        { cmd: 'order:check_availability' },
        payload,
      );
      expect(clientProxy.send).toHaveBeenCalledWith(
        { cmd: 'order:order_placed' },
        payload,
      );
      expect(ordersModel.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual(orderResult);
    });

    it('should throw an error if the record is not available', async () => {
      const payload: CreateOrderRequestDTO = { recordId: 'record123', qty: 2 };

      jest.spyOn(clientProxy, 'send').mockReturnValueOnce(of(false));
      await expect(service.create(payload)).rejects.toThrow(
        'Record is not available',
      );

      expect(clientProxy.send).toHaveBeenCalledWith(
        { cmd: 'order:check_availability' },
        payload,
      );
    });
  });
});
