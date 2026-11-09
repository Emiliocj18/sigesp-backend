import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/errors/http-exception.filter';

// Punto de entrada de la aplicacion
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite un apagado controlado (SIGTERM/SIGINT) para cerrar los DataSources
  // de tenant sin fugas de conexiones durante un deploy/reciclado.
  app.enableShutdownHooks();

  // Encabezados de seguridad (protege contra vulnerabilidades web comunes)
  app.use(helmet());

  // Habilita el parseo de cookies (requerido para la cookie HttpOnly del refresh token)
  app.use(cookieParser()); // Interpreta las cookies al recibidas del el front

  // CORS configurable por entorno (CORS_ORIGIN separado por comas).
  // Con cookies HttpOnly se requiere origen explícito + credentials (no se permite '*').
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    console.warn(
      '[CORS] CORS_ORIGIN no definido. Las cookies de sesión requieren un origen explícito.',
    );
  }
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : false,
    credentials: true,
  });

  // Valida y sanitiza los DTOs entrantes (whitelist elimina campos no declarados)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Formato estandarizado de errores en toda la aplicacion
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
  console.log('SIGESP Management corriendo en http://localhost:3000');
}
bootstrap();
