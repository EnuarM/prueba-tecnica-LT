import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { LoginInput } from './dto/login.input';
import { UserProfile } from './types/auth-response.type';

export interface AuthServiceResult {
  accessToken: string;
  user: UserProfile;
}

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
    )!;
  }

  async login(input: LoginInput): Promise<AuthServiceResult> {
    try {
      const response = await axios.post<AuthServiceResult>(
        `${this.authServiceUrl}/auth/login`,
        { docNumber: input.docNumber, password: input.password },
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }
}
