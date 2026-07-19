import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || exception.message;
        errors = res.errors || null;

        // Handle class-validator errors
        if (Array.isArray(res.message)) {
          message = 'Validation failed';
          errors = res.message;
        }
      }
    } else if (exception instanceof Error) {
      console.error('[UnhandledException]', exception.message, exception.stack);
      message = exception.message;
    } else {
      console.error('[UnknownException]', exception);
    }

    // Ensure response hasn't been sent yet
    if (!response.headersSent) {
      response.status(status).json({
        success: false,
        statusCode: status,
        message,
        errors,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
