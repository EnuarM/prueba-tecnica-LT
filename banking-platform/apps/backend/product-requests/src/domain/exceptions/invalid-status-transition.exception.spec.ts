import { InvalidStatusTransitionException } from './invalid-status-transition.exception';
import { ProductRequestStatus } from '../enums/product-request-status.enum';

describe('InvalidStatusTransitionException', () => {
  it('should have the correct message', () => {
    const exception = new InvalidStatusTransitionException(
      ProductRequestStatus.REJECTED,
      ProductRequestStatus.APPROVED,
    );
    expect(exception.message).toBe(
      `Cannot transition from 'REJECTED' to 'APPROVED'`,
    );
  });

  it('should have name InvalidStatusTransitionException', () => {
    const exception = new InvalidStatusTransitionException(
      ProductRequestStatus.CREATED,
      ProductRequestStatus.COMPLETED,
    );
    expect(exception.name).toBe('InvalidStatusTransitionException');
  });

  it('should be an instance of Error', () => {
    const exception = new InvalidStatusTransitionException(
      ProductRequestStatus.COMPLETED,
      ProductRequestStatus.IN_REVIEW,
    );
    expect(exception).toBeInstanceOf(Error);
  });
});
