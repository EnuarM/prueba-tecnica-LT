import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenGenerator,
  TokenPayload,
} from '../../application/ports/token-generator.port';

@Injectable()
export class JwtTokenGenerator extends TokenGenerator {
  private readonly logger = new Logger(JwtTokenGenerator.name);

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  generate(payload: TokenPayload): string {
    try {
      const token = this.jwtService.sign(payload);
      this.logger.log(
        `JWT generated successfully for identSerialNum ${payload.govIssueIdent.identSerialNum}`,
      );
      return token;
    } catch (error) {
      this.logger.error(
        `JWT generation failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
