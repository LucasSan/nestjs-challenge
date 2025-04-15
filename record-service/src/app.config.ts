import * as dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT || 3000,
  rabbitMQUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  rabbitMQQueue: process.env.RABBITMQ_QUEUE || 'orders-queue',
};
