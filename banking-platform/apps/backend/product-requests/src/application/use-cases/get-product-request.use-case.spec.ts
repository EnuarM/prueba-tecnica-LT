import { GetProductRequestUseCase } from './get-product-request.use-case';
import { ProductRequestRepository } from '../../domain/repositories/product-request.repository';
import { ProductRequest } from '../../domain/entities/product-request.entity';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';
import { ProductRequestNotFoundException } from '../../domain/exceptions/product-request-not-found.exception';

const makeEntity = (id: string): ProductRequest =>
  new ProductRequest({
    id,
    clientDocNumber: '123',
    clientName: 'Test',
    productType: 'SAVINGS',
    status: ProductRequestStatus.CREATED,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('GetProductRequestUseCase', () => {
  let useCase: GetProductRequestUseCase;
  let repository: jest.Mocked<ProductRequestRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByClientDocNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ProductRequestRepository>;

    useCase = new GetProductRequestUseCase(repository);
  });

  it('should return the entity when found', async () => {
    const entity = makeEntity('some-uuid');
    repository.findById.mockResolvedValue(entity);

    const result = await useCase.execute('some-uuid');

    expect(repository.findById).toHaveBeenCalledWith('some-uuid');
    expect(result).toBe(entity);
  });

  it('should throw ProductRequestNotFoundException when not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(
      ProductRequestNotFoundException,
    );
  });

  it('should include the id in the not-found error message', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(
      `Product request with id 'missing-id' not found`,
    );
  });
});
