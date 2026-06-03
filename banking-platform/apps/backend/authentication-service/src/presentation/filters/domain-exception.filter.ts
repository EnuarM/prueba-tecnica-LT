import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

@Catch(InvalidCredentialsException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: InvalidCredentialsException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.UNAUTHORIZED).json({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'Unauthorized',
      message: exception.message,
    });
  }
}
