import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlThrottlerGuard } from './gql-throttler.guard';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: { create: jest.fn() },
}));

describe('GqlThrottlerGuard', () => {
  let guard: GqlThrottlerGuard;

  beforeEach(() => {
    guard = new GqlThrottlerGuard(
      {} as never,
      {} as never,
      {} as never,
    );
  });

  describe('getRequestResponse', () => {
    it('should extract req and res from GraphQL context', () => {
      const mockReq = { ip: '127.0.0.1' };
      const mockRes = { setHeader: jest.fn() };

      (GqlExecutionContext.create as jest.Mock).mockReturnValue({
        getContext: () => ({ req: mockReq, res: mockRes }),
      });

      const context = {} as ExecutionContext;
      const result = guard.getRequestResponse(context);

      expect(result.req).toBe(mockReq);
      expect(result.res).toBe(mockRes);
    });
  });
});
