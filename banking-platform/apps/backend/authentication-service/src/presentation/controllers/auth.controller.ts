import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginRequestDto } from '../../application/dtos/login-request.dto';
import { LoginResponseDto } from '../../application/dtos/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(dto);
  }
}
