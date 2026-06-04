import { ProductRequestStatus } from '../enums/product-request-status.enum';
import { ProductType } from '../enums/product-type.enum';

export class ProductRequest {
  id: string;
  clientDocNumber: string;
  clientName: string;
  productType: ProductType;
  status: ProductRequestStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    clientDocNumber: string;
    clientName: string;
    productType: ProductType;
    status: ProductRequestStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.clientDocNumber = params.clientDocNumber;
    this.clientName = params.clientName;
    this.productType = params.productType;
    this.status = params.status;
    this.createdAt = params.createdAt!;
    this.updatedAt = params.updatedAt!;
  }
}
