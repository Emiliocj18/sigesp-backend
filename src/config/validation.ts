// Valida variables críticas de seguridad al arranque de la aplicación.
// Lanza un error si JWT_SECRET / JWT_REFRESH_SECRET faltan, son el placeholder
// de ejemplo o son demasiado cortos. Esto cumple la mitigación A6.
export function validateEnv(config: Record<string, unknown>) {
  const errors: string[] = [];

  const jwtSecret = config['JWT_SECRET'];
  if (!jwtSecret || typeof jwtSecret !== 'string' || jwtSecret.length < 16) {
    errors.push('JWT_SECRET debe definirse y tener al menos 16 caracteres.');
  } else if (jwtSecret.includes('change_me')) {
    errors.push("JWT_SECRET no debe ser el valor de ejemplo ('change_me...').");
  }

  const jwtRefresh = config['JWT_REFRESH_SECRET'];
  if (!jwtRefresh || typeof jwtRefresh !== 'string' || jwtRefresh.length < 16) {
    errors.push('JWT_REFRESH_SECRET debe definirse y tener al menos 16 caracteres.');
  } else if (jwtRefresh.includes('change_me')) {
    errors.push("JWT_REFRESH_SECRET no debe ser el valor de ejemplo ('change_me...').");
  }

  if (jwtSecret && jwtRefresh && jwtSecret === jwtRefresh) {
    errors.push('JWT_SECRET y JWT_REFRESH_SECRET no deben ser iguales.');
  }

  if (errors.length) {
    throw new Error(`Configuración inválida:\n- ${errors.join('\n- ')}`);
  }

  return config;
}
