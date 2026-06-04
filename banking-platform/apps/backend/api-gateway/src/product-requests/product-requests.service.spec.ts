import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ProductRequestsService } from './product-requests.service';
import { ProductRequestType } from './types/product-request.type';
import { ProductRequestStatus } from './enums/product-request-status.enum';
import { CreateProductRequestInput } from './dto/create-product-request.input';
import { UpdateProductRequestStatusInput } from './dto/update-product-request-status.input';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const makeRaw = (overrides = {}) => ({
  id: 'uuid-1',
  clientDocNumber: '1110571450',
  clientName: 'John Doe',
  productType: 'MORTGAGE',
  status: ProductRequestStatus.CREATED,
  createdAt: '2026-03-01T07:00:00.000Z',
  updatedAt: '2026-03-15T16:00:00.000Z',
  ...overrides,
});

const expectDates = (item: ProductRequestType) => {
  expect(item.createdAt).toBeInstanceOf(Date);
  expect(item.updatedAt).toBeInstanceOf(Date);
};

describe('ProductRequestsService', () => {
  let service: ProductRequestsService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3002'),
    } as unknown as jest.Mocked<ConfigService>;

    service = new ProductRequestsService(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of product requests with parsed dates', async () => {
      mockedAxios.get.mockResolvedValue({ data: [makeRaw()] });

      const result = await service.findAll('1110571450');

      expect(result).toHaveLength(1);
      expectDates(result[0]);
    });

    it('should call product-requests service with clientDocNumber param', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      await service.findAll('1110571450');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3002/product-requests',
        { params: { clientDocNumber: '1110571450' } },
      );
    });
  });

  describe('findOne', () => {
    it('should return a product request with parsed dates', async () => {
      mockedAxios.get.mockResolvedValue({ data: makeRaw() });

      const result = await service.findOne('uuid-1');

      expectDates(result);
      expect(result.id).toBe('uuid-1');
    });

    it('should throw NotFoundException when service returns 404', async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

      await expect(service.findOne('uuid-1')).rejects.toThrow(NotFoundException);
    });

    it('should rethrow non-404 errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.findOne('uuid-1')).rejects.toThrow('Network error');
    });
  });

  describe('create', () => {
    const input: CreateProductRequestInput = {
      clientDocNumber: '1110571450',
      clientName: 'John Doe',
      productType: 'MORTGAGE',
    };

    it('should return created product request with parsed dates', async () => {
      mockedAxios.post.mockResolvedValue({ data: makeRaw() });

      const result = await service.create(input);

      expectDates(result);
    });

    it('should post the input to product-requests service', async () => {
      mockedAxios.post.mockResolvedValue({ data: makeRaw() });

      await service.create(input);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3002/product-requests',
        input,
      );
    });
  });

  describe('updateStatus', () => {
    const input: UpdateProductRequestStatusInput = {
      status: ProductRequestStatus.APPROVED,
    };

    it('should return updated product request with parsed dates', async () => {
      mockedAxios.patch.mockResolvedValue({
        data: makeRaw({ status: ProductRequestStatus.APPROVED }),
      });

      const result = await service.updateStatus('uuid-1', input);

      expectDates(result);
      expect(result.status).toBe(ProductRequestStatus.APPROVED);
    });

    it('should throw NotFoundException when service returns 404', async () => {
      mockedAxios.patch.mockRejectedValue({ response: { status: 404 } });

      await expect(service.updateStatus('uuid-1', input)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should return true on successful deletion', async () => {
      mockedAxios.delete.mockResolvedValue({});

      const result = await service.remove('uuid-1');

      expect(result).toBe(true);
    });

    it('should throw NotFoundException when service returns 404', async () => {
      mockedAxios.delete.mockRejectedValue({ response: { status: 404 } });

      await expect(service.remove('uuid-1')).rejects.toThrow(NotFoundException);
    });
  });
});
