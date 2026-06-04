import { ProductRequest } from '../entities/product-request.entity';

export abstract class ProductRequestRepository {
  abstract save(productRequest: ProductRequest): Promise<ProductRequest>;
  abstract findById(id: string): Promise<ProductRequest | null>;
  abstract findByClientDocNumber(docNumber: string): Promise<ProductRequest[]>;
  abstract update(productRequest: ProductRequest): Promise<ProductRequest>;
  abstract delete(id: string): Promise<void>;
}
