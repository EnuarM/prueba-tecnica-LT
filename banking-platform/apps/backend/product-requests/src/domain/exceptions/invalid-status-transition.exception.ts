import { ProductRequestStatus } from '../enums/product-request-status.enum';

export class InvalidStatusTransitionException extends Error {
  constructor(from: ProductRequestStatus, to: ProductRequestStatus) {
    super(`Cannot transition from '${from}' to '${to}'`);
    this.name = 'InvalidStatusTransitionException';
  }
}
