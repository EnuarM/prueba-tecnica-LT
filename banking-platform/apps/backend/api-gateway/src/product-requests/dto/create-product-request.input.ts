import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateProductRequestInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  clientDocNumber: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  productType: string;
}
