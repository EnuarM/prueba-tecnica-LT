import { ProductRequestStatus } from '../enums/product-request-status.enum';
import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition.exception';

const VALID_TRANSITIONS: Record<ProductRequestStatus, ProductRequestStatus[]> =
  {
    [ProductRequestStatus.CREATED]: [
      ProductRequestStatus.IN_REVIEW,
      ProductRequestStatus.ABANDONED,
    ],
    [ProductRequestStatus.IN_REVIEW]: [
      ProductRequestStatus.APPROVED,
      ProductRequestStatus.REJECTED,
      ProductRequestStatus.ABANDONED,
    ],
    [ProductRequestStatus.APPROVED]: [
      ProductRequestStatus.COMPLETED,
      ProductRequestStatus.ABANDONED,
    ],
    [ProductRequestStatus.REJECTED]: [],
    [ProductRequestStatus.COMPLETED]: [],
    [ProductRequestStatus.ABANDONED]: [],
  };

export class ProductRequestStateMachine {
  static transition(
    current: ProductRequestStatus,
    next: ProductRequestStatus,
  ): void {
    const allowed = VALID_TRANSITIONS[current];
    if (!allowed.includes(next)) {
      throw new InvalidStatusTransitionException(current, next);
    }
  }
}
