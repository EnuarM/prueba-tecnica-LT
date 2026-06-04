import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './types/auth-response.type';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: jest.Mocked<AuthService>;

  const loginInput: LoginInput = { docNumber: '1110571450', password: 'secret' };
  const authResponse: AuthResponse = { accessToken: 'jwt.token' };

  beforeEach(() => {
    authService = { login: jest.fn() } as unknown as jest.Mocked<AuthService>;
    resolver = new AuthResolver(authService);
  });

  describe('login', () => {
    it('should return AuthResponse from AuthService', async () => {
      authService.login.mockResolvedValue(authResponse);

      const result = await resolver.login(loginInput);

      expect(result).toEqual(authResponse);
    });

    it('should delegate to AuthService with the provided input', async () => {
      authService.login.mockResolvedValue(authResponse);

      await resolver.login(loginInput);

      expect(authService.login).toHaveBeenCalledWith(loginInput);
    });

    it('should propagate errors from AuthService', async () => {
      authService.login.mockRejectedValue(new Error('Service unavailable'));

      await expect(resolver.login(loginInput)).rejects.toThrow(
        'Service unavailable',
      );
    });
  });
});
