import { Test, TestingModule } from '@nestjs/testing';
import { ProductRequestsController } from './product-requests.controller';
import { CreateProductRequestUseCase } from '../../application/use-cases/create-product-request.use-case';
import { GetProductRequestUseCase } from '../../application/use-cases/get-product-request.use-case';
import { ListProductRequestsUseCase } from '../../application/use-cases/list-product-requests.use-case';
import { UpdateProductRequestStatusUseCase } from '../../application/use-cases/update-product-request-status.use-case';
import { DeleteProductRequestUseCase } from '../../application/use-cases/delete-product-request.use-case';
import { ProductRequest } from '../../domain/entities/product-request.entity';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';
import { ProductRequestResponseDto } from '../../application/dtos/product-request-response.dto';

const makeEntity = (id = 'some-uuid'): ProductRequest =>
  new ProductRequest({
    id,
    clientDocNumber: '123456',
    clientName: 'Test User',
    productType: 'SAVINGS',
    status: ProductRequestStatus.CREATED,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

describe('ProductRequestsController', () => {
  let controller: ProductRequestsController;
  let createUseCase: jest.Mocked<CreateProductRequestUseCase>;
  let getUseCase: jest.Mocked<GetProductRequestUseCase>;
  let listUseCase: jest.Mocked<ListProductRequestsUseCase>;
  let updateStatusUseCase: jest.Mocked<UpdateProductRequestStatusUseCase>;
  let deleteUseCase: jest.Mocked<DeleteProductRequestUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductRequestsController],
      providers: [
        { provide: CreateProductRequestUseCase, useValue: { execute: jest.fn() } },
        { provide: GetProductRequestUseCase, useValue: { execute: jest.fn() } },
        { provide: ListProductRequestsUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateProductRequestStatusUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteProductRequestUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ProductRequestsController>(ProductRequestsController);
    createUseCase = module.get(CreateProductRequestUseCase);
    getUseCase = module.get(GetProductRequestUseCase);
    listUseCase = module.get(ListProductRequestsUseCase);
    updateStatusUseCase = module.get(UpdateProductRequestStatusUseCase);
    deleteUseCase = module.get(DeleteProductRequestUseCase);
  });

  describe('create', () => {
    it('should return a ProductRequestResponseDto', async () => {
      const entity = makeEntity();
      createUseCase.execute.mockResolvedValue(entity);

      const result = await controller.create({
        clientDocNumber: '123456',
        clientName: 'Test User',
        productType: 'SAVINGS',
      });

      expect(createUseCase.execute).toHaveBeenCalledWith({
        clientDocNumber: '123456',
        clientName: 'Test User',
        productType: 'SAVINGS',
      });
      expect(result).toBeInstanceOf(ProductRequestResponseDto);
      expect(result.id).toBe(entity.id);
    });
  });

  describe('findOne', () => {
    it('should return a ProductRequestResponseDto for the given id', async () => {
      const entity = makeEntity();
      getUseCase.execute.mockResolvedValue(entity);

      const result = await controller.findOne('some-uuid');

      expect(getUseCase.execute).toHaveBeenCalledWith('some-uuid');
      expect(result).toBeInstanceOf(ProductRequestResponseDto);
      expect(result.id).toBe('some-uuid');
    });
  });

  describe('findAll', () => {
    it('should return an array of ProductRequestResponseDto', async () => {
      const entities = [makeEntity('id-1'), makeEntity('id-2')];
      listUseCase.execute.mockResolvedValue(entities);

      const result = await controller.findAll('123456');

      expect(listUseCase.execute).toHaveBeenCalledWith('123456');
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ProductRequestResponseDto);
    });

    it('should return empty array when no requests found', async () => {
      listUseCase.execute.mockResolvedValue([]);

      const result = await controller.findAll('999');

      expect(result).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should return updated ProductRequestResponseDto', async () => {
      const entity = makeEntity();
      entity.status = ProductRequestStatus.IN_REVIEW;
      updateStatusUseCase.execute.mockResolvedValue(entity);

      const result = await controller.updateStatus('some-uuid', {
        status: ProductRequestStatus.IN_REVIEW,
      });

      expect(updateStatusUseCase.execute).toHaveBeenCalledWith({
        id: 'some-uuid',
        newStatus: ProductRequestStatus.IN_REVIEW,
      });
      expect(result.status).toBe(ProductRequestStatus.IN_REVIEW);
    });
  });

  describe('remove', () => {
    it('should call deleteUseCase with the given id', async () => {
      deleteUseCase.execute.mockResolvedValue();

      await controller.remove('some-uuid');

      expect(deleteUseCase.execute).toHaveBeenCalledWith('some-uuid');
    });
  });
});
