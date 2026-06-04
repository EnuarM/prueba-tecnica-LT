import { ProductRequestNotFoundException } from './product-request-not-found.exception';

describe('ProductRequestNotFoundException', () => {
  it('should have the correct message', () => {
    const exception = new ProductRequestNotFoundException('some-uuid');
    expect(exception.message).toBe(
      `Product request with id 'some-uuid' not found`,
    );
  });

  it('should have name ProductRequestNotFoundException', () => {
    const exception = new ProductRequestNotFoundException('abc');
    expect(exception.name).toBe('ProductRequestNotFoundException');
  });

  it('should be an instance of Error', () => {
    const exception = new ProductRequestNotFoundException('xyz');
    expect(exception).toBeInstanceOf(Error);
  });
});
