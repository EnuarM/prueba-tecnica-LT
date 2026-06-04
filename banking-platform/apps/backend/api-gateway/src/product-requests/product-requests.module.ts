import { Module } from '@nestjs/common';
import { ProductRequestsResolver } from './product-requests.resolver';
import { ProductRequestsService } from './product-requests.service';

@Module({
  providers: [ProductRequestsResolver, ProductRequestsService],
})
export class ProductRequestsModule {}
