import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Sale extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  soldBy: Types.ObjectId;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
