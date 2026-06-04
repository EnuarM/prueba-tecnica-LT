import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ProductRequestStatus } from '../enums/product-request-status.enum';

@ObjectType()
export class ProductRequestType {
  @Field(() => ID)
  id: string;

  @Field()
  clientDocNumber: string;

  @Field()
  clientName: string;

  @Field()
  productType: string;

  @Field(() => ProductRequestStatus)
  status: ProductRequestStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
