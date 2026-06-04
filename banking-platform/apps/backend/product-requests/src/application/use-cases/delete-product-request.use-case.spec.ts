import { DeleteProductRequestUseCase } from './delete-product-request.use-case';
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

describe('DeleteProductRequestUseCase', () => {
  let useCase: DeleteProductRequestUseCase;
  let repository: jest.Mocked<ProductRequestRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByClientDocNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ProductRequestRepository>;

    useCase = new DeleteProductRequestUseCase(repository);
  });

  it('should call repository.delete when entity exists', async () => {
    repository.findById.mockResolvedValue(makeEntity('some-uuid'));
    repository.delete.mockResolvedValue();

    await useCase.execute('some-uuid');

    expect(repository.delete).toHaveBeenCalledWith('some-uuid');
  });

  it('should throw ProductRequestNotFoundException when entity does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(
      ProductRequestNotFoundException,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
