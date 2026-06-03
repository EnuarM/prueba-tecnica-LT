import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { MulesoftAuthAdapter } from './mulesoft-auth.adapter';
import { MulesoftUserData } from '../../application/ports/core-banking-auth.port';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

const mockUserData: MulesoftUserData = {
  govIssueIdent: { govIssueIdentType: 'CC', identSerialNum: '12345678' },
  personName: {
    fullName: 'John Doe',
    lastAuthInfo: { lastTrnDt: '2024-01-01T00:00:00' },
  },
};

describe('MulesoftAuthAdapter', () => {
  let adapter: MulesoftAuthAdapter;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    httpService = { post: jest.fn() } as unknown as jest.Mocked<HttpService>;
    configService = {
      get: jest.fn().mockReturnValue('https://mock.postman.io'),
    } as unknown as jest.Mocked<ConfigService>;

    adapter = new MulesoftAuthAdapter(httpService, configService);
  });

  describe('authenticate', () => {
    it('should return MulesoftUserData on successful response', async () => {
      const axiosResponse = {
        data: mockUserData,
      } as AxiosResponse<MulesoftUserData>;
      httpService.post.mockReturnValue(of(axiosResponse));

      const result = await adapter.authenticate('12345678', 'secret');

      expect(result).toEqual(mockUserData);
    });

    it('should POST to the correct URL', async () => {
      const axiosResponse = {
        data: mockUserData,
      } as AxiosResponse<MulesoftUserData>;
      httpService.post.mockReturnValue(of(axiosResponse));

      await adapter.authenticate('12345678', 'secret');

      expect(httpService.post).toHaveBeenCalledWith(
        'https://mock.postman.io/authentication-management/v1/user',
        { docNumber: '12345678', password: 'secret' },
      );
    });

    it('should throw InvalidCredentialsException on HTTP error', async () => {
      httpService.post.mockReturnValue(
        throwError(() => new Error('401 Unauthorized')),
      );

      await expect(adapter.authenticate('12345678', 'wrong')).rejects.toThrow(
        InvalidCredentialsException,
      );
    });

    it('should throw InvalidCredentialsException on network error', async () => {
      httpService.post.mockReturnValue(
        throwError(() => new Error('Network Error')),
      );

      await expect(adapter.authenticate('12345678', 'secret')).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });
});
