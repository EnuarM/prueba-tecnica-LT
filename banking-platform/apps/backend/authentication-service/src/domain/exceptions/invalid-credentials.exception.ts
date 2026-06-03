export class InvalidCredentialsException extends Error {
  constructor() {
    super('Invalid document number or password');
    this.name = 'InvalidCredentialsException';
  }
}
