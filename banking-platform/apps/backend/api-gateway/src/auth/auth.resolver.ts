import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './types/auth-response.type';

function jwtExpiresInToMs(value: string): number {
  const match = value.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 3600 * 1000; // default 1h
  const amount = parseInt(match[1], 10);
  const unit: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * unit[match[2]];
}

@Resolver()
export class AuthResolver {
  private readonly cookieMaxAge: number;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1h');
    this.cookieMaxAge = jwtExpiresInToMs(expiresIn);
  }

  @Mutation(() => AuthResponse, {
    description: 'Authenticate with docNumber and password',
  })
  async login(
    @Args('input') input: LoginInput,
    @Context('res') res: Response,
  ): Promise<AuthResponse> {
    const { accessToken, user } = await this.authService.login(input);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.cookieMaxAge,
    });
    return { user };
  }
}
