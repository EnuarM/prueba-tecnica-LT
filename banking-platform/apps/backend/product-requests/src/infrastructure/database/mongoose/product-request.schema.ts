import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProductRequestStatus } from '../../../domain/enums/product-request-status.enum';

export type ProductRequestDocument =
  HydratedDocument<ProductRequestSchemaClass>;

@Schema({ collection: 'product_requests', versionKey: false })
export class ProductRequestSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true, index: true })
  clientDocNumber: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  productType: string;

  @Prop({ required: true, enum: ProductRequestStatus })
  status: ProductRequestStatus;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export const ProductRequestSchema = SchemaFactory.createForClass(
  ProductRequestSchemaClass,
);
