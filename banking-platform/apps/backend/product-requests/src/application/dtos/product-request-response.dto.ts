import { ProductRequest } from '../../domain/entities/product-request.entity';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';
import { ProductType } from '../../domain/enums/product-type.enum';

export class ProductRequestResponseDto {
  id: string;
  clientDocNumber: string;
  clientName: string;
  productType: ProductType;
  status: ProductRequestStatus;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: ProductRequest): ProductRequestResponseDto {
    const dto = new ProductRequestResponseDto();
    dto.id = entity.id;
    dto.clientDocNumber = entity.clientDocNumber;
    dto.clientName = entity.clientName;
    dto.productType = entity.productType;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
