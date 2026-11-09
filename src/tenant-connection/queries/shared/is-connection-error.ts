// Detecta errores de nivel de conexión (no errores de SQL) para decidir el
// reintento (B5). Fuente única del criterio desde la Fase 2b: la copia que
// vivía en tenant.service.ts se eliminó junto con la carpeta tenant/.
export function isConnectionError(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  const message = (err as { message?: string })?.message ?? '';
  return (
    code === 'ECONNRESET' ||
    code === 'EPIPE' ||
    code === 'ETIMEDOUT' ||
    code === '57P01' || // admin shutdown
    code === '57P02' || // crash shutdown
    code === '08000' ||
    code === '08003' ||
    code === '08006' ||
    code === '08001' ||
    code === '08004' ||
    /connection.*(terminated|closed|reset)|terminating connection/i.test(message)
  );
}
