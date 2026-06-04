/**
 * Seed script: inserts sample product requests for the mock client
 * used in the authentication-service (CC 12345678 / John Doe).
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/database/seed.ts
 *
 * Requires MONGODB_URI environment variable (or a .env file at project root).
 */

import 'dotenv/config';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

const ProductRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    clientDocNumber: { type: String, required: true },
    clientName: { type: String, required: true },
    productType: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: 'product_requests', versionKey: false },
);

const ProductRequestModel = mongoose.model(
  'ProductRequest',
  ProductRequestSchema,
);

const CLIENT_DOC_NUMBER = '12345678';
const CLIENT_NAME = 'John Doe';

const seeds = [
  {
    _id: randomUUID(),
    clientDocNumber: CLIENT_DOC_NUMBER,
    clientName: CLIENT_NAME,
    productType: 'SAVINGS_ACCOUNT',
    status: 'CREATED',
    createdAt: new Date('2026-05-01T10:00:00Z'),
    updatedAt: new Date('2026-05-01T10:00:00Z'),
  },
  {
    _id: randomUUID(),
    clientDocNumber: CLIENT_DOC_NUMBER,
    clientName: CLIENT_NAME,
    productType: 'CREDIT_CARD',
    status: 'IN_REVIEW',
    createdAt: new Date('2026-05-10T09:00:00Z'),
    updatedAt: new Date('2026-05-12T14:30:00Z'),
  },
  {
    _id: randomUUID(),
    clientDocNumber: CLIENT_DOC_NUMBER,
    clientName: CLIENT_NAME,
    productType: 'PERSONAL_LOAN',
    status: 'APPROVED',
    createdAt: new Date('2026-04-15T08:00:00Z'),
    updatedAt: new Date('2026-04-20T11:00:00Z'),
  },
  {
    _id: randomUUID(),
    clientDocNumber: CLIENT_DOC_NUMBER,
    clientName: CLIENT_NAME,
    productType: 'MORTGAGE',
    status: 'REJECTED',
    createdAt: new Date('2026-03-01T07:00:00Z'),
    updatedAt: new Date('2026-03-15T16:00:00Z'),
  },
  {
    _id: randomUUID(),
    clientDocNumber: CLIENT_DOC_NUMBER,
    clientName: CLIENT_NAME,
    productType: 'INVESTMENT_FUND',
    status: 'COMPLETED',
    createdAt: new Date('2026-02-01T06:00:00Z'),
    updatedAt: new Date('2026-02-28T18:00:00Z'),
  },
];

async function seed(): Promise<void> {
  await mongoose.connect(MONGODB_URI as string);
  console.log('Connected to MongoDB');

  await ProductRequestModel.deleteMany({ clientDocNumber: CLIENT_DOC_NUMBER });
  console.log(`Cleared existing records for client ${CLIENT_DOC_NUMBER}`);

  await ProductRequestModel.insertMany(seeds);
  console.log(
    `Inserted ${seeds.length} product requests for client ${CLIENT_DOC_NUMBER} (${CLIENT_NAME})`,
  );

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
