import { InvalidCredentialsException } from './invalid-credentials.exception';

describe('InvalidCredentialsException', () => {
  let exception: InvalidCredentialsException;

  beforeEach(() => {
    exception = new InvalidCredentialsException();
  });

  it('should be an instance of Error', () => {
    expect(exception).toBeInstanceOf(Error);
  });

  it('should have the correct message', () => {
    expect(exception.message).toBe('Invalid document number or password');
  });

  it('should have the correct name', () => {
    expect(exception.name).toBe('InvalidCredentialsException');
  });
});
