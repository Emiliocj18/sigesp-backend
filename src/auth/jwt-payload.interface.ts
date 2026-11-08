// Payload contenido dentro del token JWT
export interface JwtPayload {
  sub: number | string;
  username: string;
  // Campos de tenant (login multitenant). Opcionales para no romper el login de admin.
  tenantId?: number;
  tenantName?: string;
  // A5: identificador único del token para permitir revocación (jti)
  jti?: string;
  // A5: distingue token de acceso de token de refresco
  type?: 'access' | 'refresh';
}

// Usuario autenticado expuesto en req.user tras validar el JWT
export interface AuthenticatedUser {
  userId: number | string;
  username: string;
  tenantId?: number;
  tenantName?: string;
}
