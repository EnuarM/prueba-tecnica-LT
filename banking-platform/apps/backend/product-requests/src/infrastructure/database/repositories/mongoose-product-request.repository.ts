import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductRequest } from '../../../domain/entities/product-request.entity';
import { ProductRequestRepository } from '../../../domain/repositories/product-request.repository';
import {
  ProductRequestDocument,
  ProductRequestSchemaClass,
} from '../mongoose/product-request.schema';

@Injectable()
export class MongooseProductRequestRepository extends ProductRequestRepository {
  private readonly logger = new Logger(MongooseProductRequestRepository.name);

  constructor(
    @InjectModel(ProductRequestSchemaClass.name)
    private readonly model: Model<ProductRequestDocument>,
  ) {
    super();
  }

  async save(productRequest: ProductRequest): Promise<ProductRequest> {
    const doc = new this.model({
      _id: productRequest.id,
      clientDocNumber: productRequest.clientDocNumber,
      clientName: productRequest.clientName,
      productType: productRequest.productType,
      status: productRequest.status,
      createdAt: productRequest.createdAt,
      updatedAt: productRequest.updatedAt,
    });

    await doc.save();
    this.logger.log(`ProductRequest saved with id ${productRequest.id}`);
    return this.toEntity(doc);
  }

  async findById(id: string): Promise<ProductRequest | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByClientDocNumber(docNumber: string): Promise<ProductRequest[]> {
    const docs = await this.model.find({ clientDocNumber: docNumber }).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(productRequest: ProductRequest): Promise<ProductRequest> {
    const doc = await this.model
      .findByIdAndUpdate(
        productRequest.id,
        { status: productRequest.status, updatedAt: productRequest.updatedAt },
        { new: true },
      )
      .exec();

    this.logger.log(`ProductRequest updated with id ${productRequest.id}`);
    return this.toEntity(doc!);
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
    this.logger.log(`ProductRequest deleted with id ${id}`);
  }

  private toEntity(doc: ProductRequestDocument): ProductRequest {
    return new ProductRequest({
      id: doc._id,
      clientDocNumber: doc.clientDocNumber,
      clientName: doc.clientName,
      productType: doc.productType,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
