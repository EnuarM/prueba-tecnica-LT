import { ProductRequestStatus } from '../enums/product-request-status.enum';
import { InvalidStatusTransitionException } from '../exceptions/invalid-status-transition.exception';
import { ProductRequestStateMachine } from './product-request-state-machine';

describe('ProductRequestStateMachine', () => {
  describe('valid transitions', () => {
    it('should allow CREATED -> IN_REVIEW', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.CREATED,
          ProductRequestStatus.IN_REVIEW,
        ),
      ).not.toThrow();
    });

    it('should allow CREATED -> ABANDONED', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.CREATED,
          ProductRequestStatus.ABANDONED,
        ),
      ).not.toThrow();
    });

    it('should allow IN_REVIEW -> APPROVED', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.IN_REVIEW,
          ProductRequestStatus.APPROVED,
        ),
      ).not.toThrow();
    });

    it('should allow IN_REVIEW -> REJECTED', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.IN_REVIEW,
          ProductRequestStatus.REJECTED,
        ),
      ).not.toThrow();
    });

    it('should allow IN_REVIEW -> ABANDONED', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.IN_REVIEW,
          ProductRequestStatus.ABANDONED,
        ),
      ).not.toThrow();
    });

    it('should allow APPROVED -> COMPLETED', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.APPROVED,
          ProductRequestStatus.COMPLETED,
        ),
      ).not.toThrow();
    });

    it('should allow APPROVED -> ABANDONED', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.APPROVED,
          ProductRequestStatus.ABANDONED,
        ),
      ).not.toThrow();
    });
  });

  describe('invalid transitions', () => {
    it('should throw when transitioning CREATED -> APPROVED', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.CREATED,
          ProductRequestStatus.APPROVED,
        ),
      ).toThrow(InvalidStatusTransitionException);
    });

    it('should throw when transitioning REJECTED -> any status', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.REJECTED,
          ProductRequestStatus.IN_REVIEW,
        ),
      ).toThrow(InvalidStatusTransitionException);
    });

    it('should throw when transitioning COMPLETED -> any status', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.COMPLETED,
          ProductRequestStatus.APPROVED,
        ),
      ).toThrow(InvalidStatusTransitionException);
    });

    it('should throw when transitioning ABANDONED -> any status', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.ABANDONED,
          ProductRequestStatus.CREATED,
        ),
      ).toThrow(InvalidStatusTransitionException);
    });

    it('should include the from/to statuses in the error message', () => {
      expect(() =>
        ProductRequestStateMachine.transition(
          ProductRequestStatus.REJECTED,
          ProductRequestStatus.APPROVED,
        ),
      ).toThrow(`Cannot transition from 'REJECTED' to 'APPROVED'`);
    });
  });
});
