import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductRequestSchemaClass,
  ProductRequestSchema,
} from './infrastructure/database/mongoose/product-request.schema';
import { MongooseProductRequestRepository } from './infrastructure/database/repositories/mongoose-product-request.repository';
import { ProductRequestsController } from './presentation/controllers/product-requests.controller';
import { CreateProductRequestUseCase } from './application/use-cases/create-product-request.use-case';
import { GetProductRequestUseCase } from './application/use-cases/get-product-request.use-case';
import { ListProductRequestsUseCase } from './application/use-cases/list-product-requests.use-case';
import { UpdateProductRequestStatusUseCase } from './application/use-cases/update-product-request-status.use-case';
import { DeleteProductRequestUseCase } from './application/use-cases/delete-product-request.use-case';
import { PRODUCT_REQUEST_REPOSITORY } from './product-requests.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductRequestSchemaClass.name,
        schema: ProductRequestSchema,
      },
    ]),
  ],
  controllers: [ProductRequestsController],
  providers: [
    {
      provide: PRODUCT_REQUEST_REPOSITORY,
      useClass: MongooseProductRequestRepository,
    },
    CreateProductRequestUseCase,
    GetProductRequestUseCase,
    ListProductRequestsUseCase,
    UpdateProductRequestStatusUseCase,
    DeleteProductRequestUseCase,
  ],
})
export class ProductRequestsModule {}
