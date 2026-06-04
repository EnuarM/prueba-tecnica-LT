import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProductType } from '../../domain/enums/product-type.enum';

export class CreateProductRequestDto {
  @IsString()
  @IsNotEmpty()
  clientDocNumber: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsEnum(ProductType, {
    message: `productType must be one of: ${Object.values(ProductType).join(', ')}`,
  })
  productType: ProductType;
}
