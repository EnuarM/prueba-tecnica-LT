import { ProductRequestStatus } from '../enums/product-request-status.enum';
import { ProductRequest } from '../entities/product-request.entity';

export abstract class ProductRequestRepository {
  abstract save(productRequest: ProductRequest): Promise<ProductRequest>;
  abstract findById(id: string): Promise<ProductRequest | null>;
  abstract findByClientDocNumber(docNumber: string): Promise<ProductRequest[]>;
  abstract update(id: string, status: ProductRequestStatus): Promise<ProductRequest>;
  abstract delete(id: string): Promise<void>;
}
