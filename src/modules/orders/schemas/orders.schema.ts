import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Orders extends Document {
  @Prop({ required: true })
  recordId: string;

  @Prop({ required: true })
  qty: number;
}

export const OrdersSchema = SchemaFactory.createForClass(Orders);
