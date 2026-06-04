import { Inject, Injectable } from '@nestjs/common';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';
import { ProductRequestNotFoundException } from '../../domain/exceptions/product-request-not-found.exception';
import { ProductRequestRepository } from '../../domain/repositories/product-request.repository';
import { ProductRequestStateMachine } from '../../domain/value-objects/product-request-state-machine';
import { PRODUCT_REQUEST_REPOSITORY } from '../../product-requests.constants';
import { ProductRequest } from '../../domain/entities/product-request.entity';

export interface UpdateProductRequestStatusData {
  id: string;
  newStatus: ProductRequestStatus;
}

@Injectable()
export class UpdateProductRequestStatusUseCase {
  constructor(
    @Inject(PRODUCT_REQUEST_REPOSITORY)
    private readonly repository: ProductRequestRepository,
  ) {}

  async execute(data: UpdateProductRequestStatusData): Promise<ProductRequest> {
    const productRequest = await this.repository.findById(data.id);
    if (!productRequest) {
      throw new ProductRequestNotFoundException(data.id);
    }

    ProductRequestStateMachine.transition(
      productRequest.status,
      data.newStatus,
    );

    return this.repository.update(data.id, data.newStatus);
  }
}
