import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { JwtTokenGenerator } from './infrastructure/auth/jwt-token-generator';
import { MulesoftAuthAdapter } from './infrastructure/mulesoft/mulesoft-auth.adapter';
import { TOKEN_GENERATOR, CORE_BANKING_AUTH } from './auth.constants';

@Module({
  imports: [
    HttpModule.register({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h') as never,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    { provide: CORE_BANKING_AUTH, useClass: MulesoftAuthAdapter },
  ],
})
export class AuthModule {}
