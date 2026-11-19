import { HttpException, HttpStatus } from '@nestjs/common';

// Devuelve el mensaje crudo del error de conexión a la BD. Solo para logs:
// puede incluir host, puerto, usuario y versión del driver.
export function describeDbError(err: unknown): string {
  return err instanceof Error ? err.message : String(err ?? 'desconocido');
}

// Lanza un HttpException 503 con un mensaje genérico. El detalle del motor
// (pg/TypeORM) queda únicamente en el log del servidor.
export function throwDbConnectionError(context: string, err: unknown): never {
  console.error(`[${context}] ${describeDbError(err)}`, err);
  throw new HttpException(
    'No se pudo conectar con la base de datos',
    HttpStatus.SERVICE_UNAVAILABLE,
  );
}
