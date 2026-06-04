import { CreateProductRequestUseCase } from './create-product-request.use-case';
import { ProductRequestRepository } from '../../domain/repositories/product-request.repository';
import { ProductRequest } from '../../domain/entities/product-request.entity';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';

describe('CreateProductRequestUseCase', () => {
  let useCase: CreateProductRequestUseCase;
  let repository: jest.Mocked<ProductRequestRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByClientDocNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ProductRequestRepository>;

    useCase = new CreateProductRequestUseCase(repository);
  });

  it('should create a product request with CREATED status', async () => {
    const data = {
      clientDocNumber: '123456789',
      clientName: 'John Doe',
      productType: 'SAVINGS_ACCOUNT',
    };

    const savedEntity = new ProductRequest({
      id: 'some-uuid',
      ...data,
      status: ProductRequestStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.save.mockResolvedValue(savedEntity);

    const result = await useCase.execute(data);

    expect(repository.save).toHaveBeenCalledTimes(1);
    const savedArg: ProductRequest = repository.save.mock.calls[0][0];
    expect(savedArg.clientDocNumber).toBe(data.clientDocNumber);
    expect(savedArg.clientName).toBe(data.clientName);
    expect(savedArg.productType).toBe(data.productType);
    expect(savedArg.status).toBe(ProductRequestStatus.CREATED);
    expect(savedArg.id).toBeDefined();
    expect(result).toBe(savedEntity);
  });

  it('should assign a UUID as id', async () => {
    const data = {
      clientDocNumber: '999',
      clientName: 'Jane',
      productType: 'CREDIT_CARD',
    };

    repository.save.mockImplementation((entity) => Promise.resolve(entity));

    await useCase.execute(data);

    const savedArg: ProductRequest = repository.save.mock.calls[0][0];
    expect(savedArg.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});
