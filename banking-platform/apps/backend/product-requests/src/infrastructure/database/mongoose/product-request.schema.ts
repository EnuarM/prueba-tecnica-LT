import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProductRequestStatus } from '../../../domain/enums/product-request-status.enum';
import { ProductType } from '../../../domain/enums/product-type.enum';

export type ProductRequestDocument =
  HydratedDocument<ProductRequestSchemaClass>;

@Schema({ collection: 'product_requests', versionKey: false, timestamps: true })
export class ProductRequestSchemaClass {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true, index: true })
  clientDocNumber: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true, enum: ProductType })
  productType: ProductType;

  @Prop({ required: true, enum: ProductRequestStatus })
  status: ProductRequestStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const ProductRequestSchema = SchemaFactory.createForClass(
  ProductRequestSchemaClass,
);
