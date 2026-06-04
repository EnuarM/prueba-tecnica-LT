import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import {
  ProductRequestDocument,
  ProductRequestSchemaClass,
} from '../infrastructure/database/mongoose/product-request.schema';
import { ProductRequestStatus } from '../domain/enums/product-request-status.enum';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(ProductRequestSchemaClass.name)
    private readonly model: Model<ProductRequestDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.model.countDocuments();
    if (count > 0) {
      this.logger.log(`Seed skipped: ${count} records already exist`);
      return;
    }

    await this.seed();
  }

  private async seed(): Promise<void> {
    const CLIENT_DOC_NUMBER = '1110571450';
    const CLIENT_NAME = 'John Doe';

    const seeds = [
      {
        _id: randomUUID(),
        clientDocNumber: CLIENT_DOC_NUMBER,
        clientName: CLIENT_NAME,
        productType: 'SAVINGS_ACCOUNT',
        status: ProductRequestStatus.CREATED,
        createdAt: new Date('2026-05-01T10:00:00Z'),
        updatedAt: new Date('2026-05-01T10:00:00Z'),
      },
      {
        _id: randomUUID(),
        clientDocNumber: CLIENT_DOC_NUMBER,
        clientName: CLIENT_NAME,
        productType: 'CREDIT_CARD',
        status: ProductRequestStatus.IN_REVIEW,
        createdAt: new Date('2026-05-10T09:00:00Z'),
        updatedAt: new Date('2026-05-12T14:30:00Z'),
      },
      {
        _id: randomUUID(),
        clientDocNumber: CLIENT_DOC_NUMBER,
        clientName: CLIENT_NAME,
        productType: 'PERSONAL_LOAN',
        status: ProductRequestStatus.APPROVED,
        createdAt: new Date('2026-04-15T08:00:00Z'),
        updatedAt: new Date('2026-04-20T11:00:00Z'),
      },
      {
        _id: randomUUID(),
        clientDocNumber: CLIENT_DOC_NUMBER,
        clientName: CLIENT_NAME,
        productType: 'MORTGAGE',
        status: ProductRequestStatus.REJECTED,
        createdAt: new Date('2026-03-01T07:00:00Z'),
        updatedAt: new Date('2026-03-15T16:00:00Z'),
      },
    ];

    await this.model.insertMany(seeds);
    this.logger.log(`Seed complete: ${seeds.length} records inserted`);
  }
}
