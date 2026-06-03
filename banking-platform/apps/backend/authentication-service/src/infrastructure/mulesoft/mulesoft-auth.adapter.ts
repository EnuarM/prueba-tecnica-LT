import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  CoreBankingAuthPort,
  MulesoftUserData,
} from '../../application/ports/core-banking-auth.port';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

@Injectable()
export class MulesoftAuthAdapter extends CoreBankingAuthPort {
  private readonly logger = new Logger(MulesoftAuthAdapter.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    super();
    this.baseUrl = configService.get<string>('MULESOFT_BASE_URL', '');
  }

  async authenticate(
    docNumber: string,
    password: string,
  ): Promise<MulesoftUserData> {
    const url = `${this.baseUrl}/authentication-management/v1/user`;

    this.logger.log(
      `Sending authentication request to core banking for docNumber ${docNumber}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<MulesoftUserData>(url, { docNumber, password }),
      );
      this.logger.log(
        `Core banking authentication succeeded for docNumber ${docNumber}`,
      );
      return response.data;
    } catch (error) {
      this.logger.warn(
        `Core banking authentication failed for docNumber ${docNumber}: ${(error as Error).message}`,
      );
      throw new InvalidCredentialsException();
    }
  }
}
