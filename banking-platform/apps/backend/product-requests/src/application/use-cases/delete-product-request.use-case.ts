import { Inject, Injectable } from '@nestjs/common';
import { ProductRequestNotFoundException } from '../../domain/exceptions/product-request-not-found.exception';
import { ProductRequestRepository } from '../../domain/repositories/product-request.repository';
import { PRODUCT_REQUEST_REPOSITORY } from '../../product-requests.constants';

@Injectable()
export class DeleteProductRequestUseCase {
  constructor(
    @Inject(PRODUCT_REQUEST_REPOSITORY)
    private readonly repository: ProductRequestRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const productRequest = await this.repository.findById(id);
    if (!productRequest) {
      throw new ProductRequestNotFoundException(id);
    }
    await this.repository.delete(id);
  }
}
