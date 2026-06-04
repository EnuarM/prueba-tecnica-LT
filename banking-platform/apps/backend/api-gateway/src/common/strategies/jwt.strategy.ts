import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

export interface JwtPayload {
  govIssueIdent: {
    govIssueIdentType: string;
    identSerialNum: string;
  };
  personName: {
    fullName: string;
  };
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = Buffer.from(configService.getOrThrow<string>('JWT_SECRET'), 'base64');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
