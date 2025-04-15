import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateOrderRequestDTO } from '../src/modules/orders/dtos/create-order.request.dto';
import { Model } from 'mongoose';
import { Orders } from '../src/modules/orders/schemas/orders.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let orderModel: Model<Orders>;

  const mockOrderModel = {
    create: jest.fn(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken('Orders'))
      .useValue(mockOrderModel)
      .overrideProvider('ORDERS_SERVICE') // 👈 mock do RabbitMQ
      .useValue(mockClientProxy)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    orderModel = moduleFixture.get(getModelToken('Orders'));
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create an order and return 201', async () => {
    const payload: CreateOrderRequestDTO = {
      recordId: 'abc123',
      qty: 2,
    };

    const createdOrder = {
      _id: 'orderid',
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrderModel.create.mockResolvedValue(createdOrder);

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(payload)
      .expect(201);

    expect(response.body.recordId).toBe(payload.recordId);
    expect(response.body.qty).toBe(payload.qty);
  });

  it('should fail validation with invalid qty', async () => {
    const payload = {
      recordId: 'abc123',
      qty: 1000,
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(payload)
      .expect(400);

    expect(response.body.message).toContain('qty must not be greater than 100');
  });
});
