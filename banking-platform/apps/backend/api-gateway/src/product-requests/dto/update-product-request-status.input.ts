import { Field, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { ProductRequestStatus } from '../enums/product-request-status.enum';

@InputType()
export class UpdateProductRequestStatusInput {
  @Field(() => ProductRequestStatus)
  @IsEnum(ProductRequestStatus)
  status: ProductRequestStatus;
}
