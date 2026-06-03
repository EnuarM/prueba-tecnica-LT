import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockGetResponse: jest.Mock;
  let mockSwitchToHttp: jest.Mock;
  let mockHost: { switchToHttp: jest.Mock };

  beforeEach(() => {
    filter = new DomainExceptionFilter();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    mockSwitchToHttp = jest
      .fn()
      .mockReturnValue({ getResponse: mockGetResponse });
    mockHost = { switchToHttp: mockSwitchToHttp };
  });

  it('should respond with 401 status', () => {
    const exception = new InvalidCredentialsException();

    filter.catch(exception, mockHost as unknown as ArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should respond with the correct JSON body', () => {
    const exception = new InvalidCredentialsException();

    filter.catch(exception, mockHost as unknown as ArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'Unauthorized',
      message: 'Invalid document number or password',
    });
  });
});
