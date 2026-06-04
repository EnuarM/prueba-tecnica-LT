import { ListProductRequestsUseCase } from './list-product-requests.use-case';
import { ProductRequestRepository } from '../../domain/repositories/product-request.repository';
import { ProductRequest } from '../../domain/entities/product-request.entity';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';

const makeEntity = (id: string, clientDocNumber: string): ProductRequest =>
  new ProductRequest({
    id,
    clientDocNumber,
    clientName: 'Test User',
    productType: 'SAVINGS',
    status: ProductRequestStatus.CREATED,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ListProductRequestsUseCase', () => {
  let useCase: ListProductRequestsUseCase;
  let repository: jest.Mocked<ProductRequestRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByClientDocNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ProductRequestRepository>;

    useCase = new ListProductRequestsUseCase(repository);
  });

  it('should return all requests for a given client', async () => {
    const entities = [makeEntity('id-1', '111'), makeEntity('id-2', '111')];
    repository.findByClientDocNumber.mockResolvedValue(entities);

    const result = await useCase.execute('111');

    expect(repository.findByClientDocNumber).toHaveBeenCalledWith('111');
    expect(result).toHaveLength(2);
    expect(result).toBe(entities);
  });

  it('should return empty array when client has no requests', async () => {
    repository.findByClientDocNumber.mockResolvedValue([]);

    const result = await useCase.execute('999');

    expect(result).toEqual([]);
  });
});
