import { ConfigService } from '@nestjs/config';

// Opciones para la cookie del refresh token (opción c del plan Parte B).
// HttpOnly: el JS del navegador no puede leerla, por lo que es inmune a robo por XSS.
// sameSite/secure se configuran por entorno (en producción: none + true).
export function buildRefreshCookieOptions(config: ConfigService) {
  const sameSite = (config.get<string>('COOKIE_SAMESITE') ?? 'lax') as // acá se define lo permisiva que será la cookie (a que sitios se puede enviar) 
    | 'lax'
    | 'none'
    | 'strict';
  const secure = config.get<string>('COOKIE_SECURE') === 'true';
  const ttl = config.get<string>('REFRESH_TOKEN_TTL') ?? '7d';

  return {
    httpOnly: true,
    sameSite,
    secure,
    path: '/auth',
    maxAge: parseTtlToMs(ttl),
  };
}

function parseTtlToMs(ttl: string): number {
  const match = ttl.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const factor =
    match[2] === 'ms'
      ? 1
      : match[2] === 's'
        ? 1000
        : match[2] === 'm'
          ? 60_000
          : match[2] === 'h'
            ? 3_600_000
            : 86_400_000;
  return value * factor;
}
