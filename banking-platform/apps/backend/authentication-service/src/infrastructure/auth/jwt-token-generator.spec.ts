import { JwtService } from '@nestjs/jwt';
import { JwtTokenGenerator } from './jwt-token-generator';
import { TokenPayload } from '../../application/ports/token-generator.port';

const mockPayload: TokenPayload = {
  govIssueIdent: { govIssueIdentType: 'CC', identSerialNum: '12345678' },
  personName: {
    fullName: 'John Doe',
    lastAuthInfo: { lastTrnDt: '2024-01-01T00:00:00' },
  },
};

describe('JwtTokenGenerator', () => {
  let generator: JwtTokenGenerator;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    jwtService = { sign: jest.fn() } as unknown as jest.Mocked<JwtService>;
    generator = new JwtTokenGenerator(jwtService);
  });

  describe('generate', () => {
    it('should return the signed token from JwtService', () => {
      jwtService.sign.mockReturnValue('signed.jwt.token');

      const result = generator.generate(mockPayload);

      expect(result).toBe('signed.jwt.token');
    });

    it('should call JwtService.sign with the full payload', () => {
      jwtService.sign.mockReturnValue('token');

      generator.generate(mockPayload);

      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload);
    });

    it('should rethrow any error from JwtService', () => {
      jwtService.sign.mockImplementation(() => {
        throw new Error('Signing failed');
      });

      expect(() => generator.generate(mockPayload)).toThrow('Signing failed');
    });
  });
});
