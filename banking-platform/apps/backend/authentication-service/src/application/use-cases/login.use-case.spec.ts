import { LoginUseCase } from './login.use-case';
import {
  CoreBankingAuthPort,
  MulesoftUserData,
} from '../ports/core-banking-auth.port';
import { TokenGenerator } from '../ports/token-generator.port';
import { LoginRequestDto } from '../dtos/login-request.dto';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

const mockUserData: MulesoftUserData = {
  govIssueIdent: { govIssueIdentType: 'CC', identSerialNum: '12345678' },
  personName: {
    fullName: 'John Doe',
    lastAuthInfo: { lastTrnDt: '2024-01-01T00:00:00' },
  },
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let coreBankingAuth: jest.Mocked<CoreBankingAuthPort>;
  let tokenGenerator: jest.Mocked<TokenGenerator>;

  beforeEach(() => {
    coreBankingAuth = {
      authenticate: jest.fn(),
    };
    tokenGenerator = { generate: jest.fn() };
    useCase = new LoginUseCase(coreBankingAuth, tokenGenerator);
  });

  describe('execute', () => {
    const dto: LoginRequestDto = { docNumber: '12345678', password: 'secret' };

    it('should return accessToken when credentials are valid', async () => {
      coreBankingAuth.authenticate.mockResolvedValue(mockUserData);
      tokenGenerator.generate.mockReturnValue('signed.jwt.token');

      const result = await useCase.execute(dto);

      expect(result.accessToken).toBe('signed.jwt.token');
    });

    it('should call coreBankingAuth with docNumber and password', async () => {
      coreBankingAuth.authenticate.mockResolvedValue(mockUserData);
      tokenGenerator.generate.mockReturnValue('token');

      await useCase.execute(dto);

      expect(coreBankingAuth.authenticate).toHaveBeenCalledWith(
        '12345678',
        'secret',
      );
    });

    it('should call tokenGenerator with the full userData from core banking', async () => {
      coreBankingAuth.authenticate.mockResolvedValue(mockUserData);
      tokenGenerator.generate.mockReturnValue('token');

      await useCase.execute(dto);

      expect(tokenGenerator.generate).toHaveBeenCalledWith(mockUserData);
    });

    it('should throw InvalidCredentialsException when core banking fails', async () => {
      coreBankingAuth.authenticate.mockRejectedValue(
        new InvalidCredentialsException(),
      );

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });

    it('should not call tokenGenerator when core banking fails', async () => {
      coreBankingAuth.authenticate.mockRejectedValue(
        new InvalidCredentialsException(),
      );

      await expect(useCase.execute(dto)).rejects.toThrow();
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
    });
  });
});
