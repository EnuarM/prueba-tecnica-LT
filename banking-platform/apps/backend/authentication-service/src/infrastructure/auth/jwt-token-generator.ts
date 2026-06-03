import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  TokenGenerator,
  TokenPayload,
} from '../../application/ports/token-generator.port';

@Injectable()
export class JwtTokenGenerator extends TokenGenerator {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  generate(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }
}
