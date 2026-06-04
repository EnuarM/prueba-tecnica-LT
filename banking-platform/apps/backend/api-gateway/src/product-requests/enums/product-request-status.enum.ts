import { registerEnumType } from '@nestjs/graphql';

export enum ProductRequestStatus {
  CREATED = 'CREATED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

registerEnumType(ProductRequestStatus, {
  name: 'ProductRequestStatus',
});
