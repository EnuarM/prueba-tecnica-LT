import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProductRequest } from '../../domain/entities/product-request.entity';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';
import { ProductType } from '../../domain/enums/product-type.enum';
import { ProductRequestRepository } from '../../domain/repositories/product-request.repository';
import { PRODUCT_REQUEST_REPOSITORY } from '../../product-requests.constants';

export interface CreateProductRequestData {
  clientDocNumber: string;
  clientName: string;
  productType: ProductType;
}

@Injectable()
export class CreateProductRequestUseCase {
  constructor(
    @Inject(PRODUCT_REQUEST_REPOSITORY)
    private readonly repository: ProductRequestRepository,
  ) {}

  async execute(data: CreateProductRequestData): Promise<ProductRequest> {
    const productRequest = new ProductRequest({
      id: randomUUID(),
      clientDocNumber: data.clientDocNumber,
      clientName: data.clientName,
      productType: data.productType,
      status: ProductRequestStatus.CREATED,
    });

    return this.repository.save(productRequest);
  }
}
