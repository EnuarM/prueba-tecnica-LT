import { ProductRequestsResolver } from './product-requests.resolver';
import { ProductRequestsService } from './product-requests.service';
import { ProductRequestType } from './types/product-request.type';
import { ProductRequestStatus } from './enums/product-request-status.enum';
import { CreateProductRequestInput } from './dto/create-product-request.input';
import { UpdateProductRequestStatusInput } from './dto/update-product-request-status.input';

const makeItem = (overrides = {}): ProductRequestType => ({
  id: 'uuid-1',
  clientDocNumber: '1110571450',
  clientName: 'John Doe',
  productType: 'MORTGAGE',
  status: ProductRequestStatus.CREATED,
  createdAt: new Date('2026-03-01T07:00:00.000Z'),
  updatedAt: new Date('2026-03-15T16:00:00.000Z'),
  ...overrides,
});

describe('ProductRequestsResolver', () => {
  let resolver: ProductRequestsResolver;
  let service: jest.Mocked<ProductRequestsService>;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ProductRequestsService>;

    resolver = new ProductRequestsResolver(service);
  });

  describe('productRequests', () => {
    it('should return list of product requests for a client', async () => {
      const items = [makeItem()];
      service.findAll.mockResolvedValue(items);

      const result = await resolver.productRequests('1110571450');

      expect(result).toEqual(items);
      expect(service.findAll).toHaveBeenCalledWith('1110571450');
    });

    it('should return empty array when no requests exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await resolver.productRequests('9999999');

      expect(result).toEqual([]);
    });
  });

  describe('productRequest', () => {
    it('should return a single product request by id', async () => {
      const item = makeItem();
      service.findOne.mockResolvedValue(item);

      const result = await resolver.productRequest('uuid-1');

      expect(result).toEqual(item);
      expect(service.findOne).toHaveBeenCalledWith('uuid-1');
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new Error('Not found'));

      await expect(resolver.productRequest('uuid-missing')).rejects.toThrow(
        'Not found',
      );
    });
  });

  describe('createProductRequest', () => {
    const input: CreateProductRequestInput = {
      clientDocNumber: '1110571450',
      clientName: 'John Doe',
      productType: 'MORTGAGE',
    };

    it('should return the created product request', async () => {
      const item = makeItem();
      service.create.mockResolvedValue(item);

      const result = await resolver.createProductRequest(input);

      expect(result).toEqual(item);
      expect(service.create).toHaveBeenCalledWith(input);
    });
  });

  describe('updateProductRequestStatus', () => {
    const input: UpdateProductRequestStatusInput = {
      status: ProductRequestStatus.APPROVED,
    };

    it('should return the updated product request', async () => {
      const item = makeItem({ status: ProductRequestStatus.APPROVED });
      service.updateStatus.mockResolvedValue(item);

      const result = await resolver.updateProductRequestStatus('uuid-1', input);

      expect(result.status).toBe(ProductRequestStatus.APPROVED);
      expect(service.updateStatus).toHaveBeenCalledWith('uuid-1', input);
    });
  });

  describe('deleteProductRequest', () => {
    it('should return true on successful deletion', async () => {
      service.remove.mockResolvedValue(true);

      const result = await resolver.deleteProductRequest('uuid-1');

      expect(result).toBe(true);
      expect(service.remove).toHaveBeenCalledWith('uuid-1');
    });
  });
});
