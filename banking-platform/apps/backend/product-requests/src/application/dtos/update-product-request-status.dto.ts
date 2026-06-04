import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';

export class UpdateProductRequestStatusDto {
  @IsEnum(ProductRequestStatus)
  @IsNotEmpty()
  status: ProductRequestStatus;
}
