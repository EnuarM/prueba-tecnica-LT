import { Inject, Injectable } from '@nestjs/common';
import { CORE_BANKING_AUTH, TOKEN_GENERATOR } from '../../auth.constants';
import {
  CoreBankingAuthPort,
  MulesoftUserData,
} from '../ports/core-banking-auth.port';
import { TokenGenerator } from '../ports/token-generator.port';
import { LoginRequestDto } from '../dtos/login-request.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(CORE_BANKING_AUTH)
    private readonly coreBankingAuth: CoreBankingAuthPort,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const userData: MulesoftUserData = await this.coreBankingAuth.authenticate(
      dto.docNumber,
      dto.password,
    );

    const token = this.tokenGenerator.generate(userData);

    return LoginResponseDto.create(token);
  }
}
