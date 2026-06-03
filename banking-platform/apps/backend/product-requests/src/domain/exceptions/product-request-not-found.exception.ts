export class ProductRequestNotFoundException extends Error {
  constructor(id: string) {
    super(`Product request with id '${id}' not found`);
    this.name = 'ProductRequestNotFoundException';
  }
}
