import { UpdateProductRequestStatusUseCase } from './update-product-request-status.use-case';
import { ProductRequestRepository } from '../../domain/repositories/product-request.repository';
import { ProductRequest } from '../../domain/entities/product-request.entity';
import { ProductRequestStatus } from '../../domain/enums/product-request-status.enum';
import { ProductRequestNotFoundException } from '../../domain/exceptions/product-request-not-found.exception';
import { InvalidStatusTransitionException } from '../../domain/exceptions/invalid-status-transition.exception';

const makeEntity = (status: ProductRequestStatus): ProductRequest =>
  new ProductRequest({
    id: 'some-uuid',
    clientDocNumber: '123',
    clientName: 'Test',
    productType: 'SAVINGS',
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('UpdateProductRequestStatusUseCase', () => {
  let useCase: UpdateProductRequestStatusUseCase;
  let repository: jest.Mocked<ProductRequestRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByClientDocNumber: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ProductRequestRepository>;

    useCase = new UpdateProductRequestStatusUseCase(repository);
  });

  it('should update status when transition is valid', async () => {
    const entity = makeEntity(ProductRequestStatus.CREATED);
    const updatedEntity = makeEntity(ProductRequestStatus.IN_REVIEW);
    repository.findById.mockResolvedValue(entity);
    repository.update.mockResolvedValue(updatedEntity);

    const result = await useCase.execute({
      id: 'some-uuid',
      newStatus: ProductRequestStatus.IN_REVIEW,
    });

    expect(repository.update).toHaveBeenCalledTimes(1);
    const updatedArg: ProductRequest = repository.update.mock.calls[0][0];
    expect(updatedArg.status).toBe(ProductRequestStatus.IN_REVIEW);
    expect(result).toBe(updatedEntity);
  });

  it('should throw ProductRequestNotFoundException when not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing', newStatus: ProductRequestStatus.IN_REVIEW }),
    ).rejects.toThrow(ProductRequestNotFoundException);
  });

  it('should throw InvalidStatusTransitionException for invalid transition', async () => {
    const entity = makeEntity(ProductRequestStatus.REJECTED);
    repository.findById.mockResolvedValue(entity);

    await expect(
      useCase.execute({ id: 'some-uuid', newStatus: ProductRequestStatus.APPROVED }),
    ).rejects.toThrow(InvalidStatusTransitionException);
  });

  it('should update the updatedAt timestamp', async () => {
    const entity = makeEntity(ProductRequestStatus.CREATED);
    const before = entity.updatedAt;
    repository.findById.mockResolvedValue(entity);
    repository.update.mockImplementation((e) => Promise.resolve(e));

    await useCase.execute({
      id: 'some-uuid',
      newStatus: ProductRequestStatus.IN_REVIEW,
    });

    const updatedArg: ProductRequest = repository.update.mock.calls[0][0];
    expect(updatedArg.updatedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });
});
