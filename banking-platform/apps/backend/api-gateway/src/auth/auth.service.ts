import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>(
      'CUSTOMER_SERVICE_URL',
    )!;
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const response = await axios.post<{ accessToken: string }>(
        `${this.authServiceUrl}/auth/login`,
        { docNumber: input.docNumber, password: input.password },
      );
      return { accessToken: response.data.accessToken };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }
}
