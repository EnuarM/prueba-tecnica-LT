import { Inject, Injectable } from '@nestjs/common';
import { ProductRequest } from '../../domain/entities/product-request.entity';
import { ProductRequestRepository } from '../../domain/repositories/product-request.repository';
import { PRODUCT_REQUEST_REPOSITORY } from '../../product-requests.constants';

@Injectable()
export class ListProductRequestsUseCase {
  constructor(
    @Inject(PRODUCT_REQUEST_REPOSITORY)
    private readonly repository: ProductRequestRepository,
  ) {}

  async execute(clientDocNumber?: string): Promise<ProductRequest[]> {
    if (clientDocNumber) {
      return this.repository.findByClientDocNumber(clientDocNumber);
    }
    return this.repository.findAll();
  }
}
