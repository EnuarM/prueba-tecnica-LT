import { ConfigService } from '@nestjs/config';
import { JwtStrategy, JwtPayload } from './jwt.strategy';

jest.mock('@nestjs/passport', () => ({
  PassportStrategy: (Strategy: new (...args: unknown[]) => object) => {
    return class extends Strategy {
      constructor(...args: unknown[]) {
        super(...args);
      }
    };
  },
}));

jest.mock('passport-jwt', () => ({
  ExtractJwt: { fromAuthHeaderAsBearerToken: jest.fn(() => jest.fn()) },
  Strategy: class MockStrategy {
    constructor(public options: unknown) {}
  },
}));

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  describe('validate', () => {
    it('should return the payload as-is', () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        docNumber: '1110571450',
        iat: 1000000,
        exp: 2000000,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual(payload);
    });

    it('should work with minimal payload (only sub)', () => {
      const payload: JwtPayload = { sub: 'user-123' };

      const result = strategy.validate(payload);

      expect(result.sub).toBe('user-123');
    });
  });
});
