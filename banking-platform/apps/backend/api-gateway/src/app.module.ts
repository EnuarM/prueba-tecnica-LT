import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { join } from 'path';
import { HealthResolver } from './health.resolver';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { ProductRequestsModule } from './product-requests/product-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('1h'),
        CORS_ORIGIN: Joi.string().default('http://localhost:4200'),
        CUSTOMER_SERVICE_URL: Joi.string().required(),
        PRODUCT_REQUESTS_URL: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot([
      { ttl: 1000, limit: 10 },
      { ttl: 60000, limit: 100 },
    ]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: true,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    CommonModule,
    AuthModule,
    ProductRequestsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    HealthResolver,
  ],
})
export class AppModule {}
