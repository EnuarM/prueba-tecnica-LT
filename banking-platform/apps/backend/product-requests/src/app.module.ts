import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3002),
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRATION: Joi.string().default('1h'),
        MULESOFT_BASE_URL: Joi.string().uri().required(),
        MULESOFT_CLIENT_ID: Joi.string().required(),
        MULESOFT_CLIENT_SECRET: Joi.string().required(),
        MULESOFT_TIMEOUT_MS: Joi.number().default(5000),
        ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
        THROTTLE_TTL_MS: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(100),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => [
        { ttl: 1000, limit: 10 }, // 10 req/seg
        { ttl: 60000, limit: 100 }, // 100 req/min
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
