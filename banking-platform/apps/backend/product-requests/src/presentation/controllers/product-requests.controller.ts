import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { CreateProductRequestDto } from '../../application/dtos/create-product-request.dto';
import { ProductRequestResponseDto } from '../../application/dtos/product-request-response.dto';
import { UpdateProductRequestStatusDto } from '../../application/dtos/update-product-request-status.dto';
import { CreateProductRequestUseCase } from '../../application/use-cases/create-product-request.use-case';
import { DeleteProductRequestUseCase } from '../../application/use-cases/delete-product-request.use-case';
import { GetProductRequestUseCase } from '../../application/use-cases/get-product-request.use-case';
import { ListProductRequestsUseCase } from '../../application/use-cases/list-product-requests.use-case';
import { UpdateProductRequestStatusUseCase } from '../../application/use-cases/update-product-request-status.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

@Controller('product-requests')
@UseFilters(DomainExceptionFilter)
export class ProductRequestsController {
  constructor(
    private readonly createUseCase: CreateProductRequestUseCase,
    private readonly getUseCase: GetProductRequestUseCase,
    private readonly listUseCase: ListProductRequestsUseCase,
    private readonly updateStatusUseCase: UpdateProductRequestStatusUseCase,
    private readonly deleteUseCase: DeleteProductRequestUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateProductRequestDto,
  ): Promise<ProductRequestResponseDto> {
    const entity = await this.createUseCase.execute(dto);
    return ProductRequestResponseDto.fromEntity(entity);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductRequestResponseDto> {
    const entity = await this.getUseCase.execute(id);
    return ProductRequestResponseDto.fromEntity(entity);
  }

  @Get()
  async findAll(
    @Query('clientDocNumber') clientDocNumber: string,
  ): Promise<ProductRequestResponseDto[]> {
    const entities = await this.listUseCase.execute(clientDocNumber);
    return entities.map((e) => ProductRequestResponseDto.fromEntity(e));
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductRequestStatusDto,
  ): Promise<ProductRequestResponseDto> {
    const entity = await this.updateStatusUseCase.execute({
      id,
      newStatus: dto.status,
    });
    return ProductRequestResponseDto.fromEntity(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
