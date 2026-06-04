import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidStatusTransitionException } from '../../domain/exceptions/invalid-status-transition.exception';
import { ProductRequestNotFoundException } from '../../domain/exceptions/product-request-not-found.exception';

@Catch(ProductRequestNotFoundException, InvalidStatusTransitionException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | ProductRequestNotFoundException
      | InvalidStatusTransitionException,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof ProductRequestNotFoundException
        ? HttpStatus.NOT_FOUND
        : HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
