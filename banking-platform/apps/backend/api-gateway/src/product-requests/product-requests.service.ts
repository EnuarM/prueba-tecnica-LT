import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { CreateProductRequestInput } from './dto/create-product-request.input';
import { UpdateProductRequestStatusInput } from './dto/update-product-request-status.input';
import { ProductRequestType } from './types/product-request.type';

@Injectable()
export class ProductRequestsService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('PRODUCT_REQUESTS_URL')!;
  }

  async findAll(clientDocNumber: string): Promise<ProductRequestType[]> {
    const response = await axios.get<ProductRequestType[]>(
      `${this.baseUrl}/product-requests`,
      { params: { clientDocNumber } },
    );
    return response.data.map((item) => this.parseDates(item));
  }

  async findOne(id: string): Promise<ProductRequestType> {
    try {
      const response = await axios.get<ProductRequestType>(
        `${this.baseUrl}/product-requests/${id}`,
      );
      return this.parseDates(response.data);
    } catch (error) {
      this.handleNotFound(error, id);
    }
  }

  async create(input: CreateProductRequestInput): Promise<ProductRequestType> {
    const response = await axios.post<ProductRequestType>(
      `${this.baseUrl}/product-requests`,
      input,
    );
    return this.parseDates(response.data);
  }

  async updateStatus(
    id: string,
    input: UpdateProductRequestStatusInput,
  ): Promise<ProductRequestType> {
    try {
      const response = await axios.patch<ProductRequestType>(
        `${this.baseUrl}/product-requests/${id}/status`,
        input,
      );
      return this.parseDates(response.data);
    } catch (error) {
      this.handleNotFound(error, id);
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/product-requests/${id}`);
      return true;
    } catch (error) {
      this.handleNotFound(error, id);
    }
  }

  private parseDates(item: ProductRequestType): ProductRequestType {
    return {
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    };
  }

  private handleNotFound(error: unknown, id: string): never {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      throw new NotFoundException(`ProductRequest ${id} not found`);
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}
