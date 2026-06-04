import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { CreateProductRequestInput } from './dto/create-product-request.input';
import { UpdateProductRequestStatusInput } from './dto/update-product-request-status.input';
import { ProductRequestsService } from './product-requests.service';
import { ProductRequestType } from './types/product-request.type';

@Resolver(() => ProductRequestType)
@UseGuards(GqlJwtAuthGuard)
export class ProductRequestsResolver {
  constructor(private readonly service: ProductRequestsService) {}

  @Query(() => [ProductRequestType], {
    description: 'List product requests for a client',
  })
  async productRequests(
    @Args('clientDocNumber') clientDocNumber: string,
  ): Promise<ProductRequestType[]> {
    return this.service.findAll(clientDocNumber);
  }

  @Query(() => ProductRequestType, {
    description: 'Get a single product request by ID',
  })
  async productRequest(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProductRequestType> {
    return this.service.findOne(id);
  }

  @Mutation(() => ProductRequestType, {
    description: 'Create a new product request',
  })
  async createProductRequest(
    @Args('input') input: CreateProductRequestInput,
  ): Promise<ProductRequestType> {
    return this.service.create(input);
  }

  @Mutation(() => ProductRequestType, {
    description: 'Update the status of a product request',
  })
  async updateProductRequestStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductRequestStatusInput,
  ): Promise<ProductRequestType> {
    return this.service.updateStatus(id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete a product request' })
  async deleteProductRequest(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.service.remove(id);
  }
}
