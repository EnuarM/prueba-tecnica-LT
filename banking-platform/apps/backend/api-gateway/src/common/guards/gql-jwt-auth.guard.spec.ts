import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from './gql-jwt-auth.guard';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: { create: jest.fn() },
}));

describe('GqlJwtAuthGuard', () => {
  let guard: GqlJwtAuthGuard;

  beforeEach(() => {
    guard = new GqlJwtAuthGuard();
  });

  describe('getRequest', () => {
    it('should extract req from GraphQL context', () => {
      const mockReq = { headers: { authorization: 'Bearer token' } };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue({
        getContext: () => ({ req: mockReq }),
      });

      const context = {} as ExecutionContext;
      const result = guard.getRequest(context);

      expect(result).toBe(mockReq);
    });
  });
});
