import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './types/auth-response.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

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
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { user };
  }
}
