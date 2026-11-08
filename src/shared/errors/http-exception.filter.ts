import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Filtro global que estandariza el formato de las respuestas de error.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error('[HttpExceptionFilter]', exception);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Error interno del servidor';

    // Normaliza el mensaje a string para que el cliente siempre reciba texto
    // legible (el ValidationPipe devuelve un objeto {message: [...]}).
    let message: string;
    if (typeof rawMessage === 'string') {
      message = rawMessage;
    } else if (
      rawMessage &&
      typeof rawMessage === 'object' &&
      'message' in rawMessage
    ) {
      const inner = (rawMessage as { message?: unknown }).message;
      if (typeof inner === 'string') {
        message = inner;
      } else if (Array.isArray(inner)) {
        message = inner.filter((m) => typeof m === 'string').join('; ');
      } else {
        message = JSON.stringify(rawMessage);
      }
    } else {
      message = JSON.stringify(rawMessage);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
