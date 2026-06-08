import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'An unexpected error occurred. Please try again.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        if (Array.isArray(b['message'])) {
          message = (b['message'] as string[]).map((m) => String(m));
        } else if (typeof b['message'] === 'string') {
          message = b['message'];
        }
      }
    } else if (exception instanceof Error) {
      const rawMessage = exception.message;
      this.logger.error(rawMessage, exception.stack);

      if (rawMessage.includes('Authentication failed against database server')) {
        message = 'Database login failed. Verify your database user, password, and host settings.';
      } else if (rawMessage.includes('connect ECONNREFUSED') || rawMessage.includes('timed out')) {
        message = 'Database connection error. Ensure the database server is running and reachable.';
      } else if (process.env.NODE_ENV !== 'production') {
        message = rawMessage;
      } else {
        message = 'A server error occurred. Please try again shortly.';
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
