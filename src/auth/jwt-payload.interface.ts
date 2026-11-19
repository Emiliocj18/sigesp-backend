// Payload contenido dentro del token JWT
export interface JwtPayload {
  sub: number | string;
  username: string;
  // Campos de tenant (login multitenant). Opcionales para no romper el login de admin.
  tenantId?: number;
  tenantName?: string;
  // Identidad del usuario dentro de la empresa (scope de escritura del perfil).
  idUsuario?: number;
  idEmpresa?: number;
  // id_personal = 0 significa que la cuenta no tiene ficha en sno_personal.
  idPersonal?: number;
  nombre?: string;
  apellido?: string;
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
  idUsuario?: number;
  idEmpresa?: number;
  idPersonal?: number;
  nombre?: string;
  apellido?: string;
}
