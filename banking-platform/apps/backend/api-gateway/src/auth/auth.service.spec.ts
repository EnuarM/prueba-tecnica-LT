import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  let service: AuthService;
  let configService: jest.Mocked<ConfigService>;

  const loginInput: LoginInput = { docNumber: '1110571450', password: 'secret' };

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3001'),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AuthService(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return accessToken on successful authentication', async () => {
      mockedAxios.post.mockResolvedValue({ data: { accessToken: 'jwt.token' } });

      const result = await service.login(loginInput);

      expect(result).toEqual({ accessToken: 'jwt.token' });
    });

    it('should call authentication-service with docNumber and password', async () => {
      mockedAxios.post.mockResolvedValue({ data: { accessToken: 'token' } });

      await service.login(loginInput);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        { docNumber: '1110571450', password: 'secret' },
      );
    });

    it('should throw UnauthorizedException when authentication-service returns 401', async () => {
      const error = { response: { status: 401 } };
      mockedAxios.post.mockRejectedValue(error);

      await expect(service.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should rethrow non-401 errors as-is', async () => {
      const error = { response: { status: 503 } };
      mockedAxios.post.mockRejectedValue(error);

      await expect(service.login(loginInput)).rejects.toEqual(error);
    });
  });
});
