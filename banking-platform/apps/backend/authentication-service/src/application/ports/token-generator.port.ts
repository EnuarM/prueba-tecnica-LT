import { MulesoftUserData } from './core-banking-auth.port';

export type TokenPayload = MulesoftUserData;

export abstract class TokenGenerator {
  abstract generate(payload: TokenPayload): string;
}
