import { HttpException, HttpStatus } from '@nestjs/common';

// Devuelve el mensaje crudo exacto del error de conexión a la BD (motor pg/
// TypeORM) para que el cliente lo muestre tal cual en el formulario de login.
export function describeDbError(err: unknown): string {
  return err instanceof Error ? err.message : String(err ?? 'desconocido');
}

// Lanza un HttpException 503 con mensaje claro y registra el error original en consola.
export function throwDbConnectionError(context: string, err: unknown): never {
  const detail = describeDbError(err);
  console.error(`[${context}] ${detail}`, err);
  throw new HttpException(detail, HttpStatus.SERVICE_UNAVAILABLE);
}
