import { IsNumber, IsOptional, IsString } from 'class-validator';

// DTO de respuesta del usuario autenticado (perfil basico)
export class UsuarioConectadoDto {
  @IsString()
  usuario: string;

  @IsString()
  empresa: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsNumber()
  tenantId: number;

  @IsString()
  tenantName: string;

  // Identidad dentro de la empresa: la usa el perfil para acotar sus consultas.
  @IsOptional()
  @IsNumber()
  idUsuario?: number;

  @IsOptional()
  @IsNumber()
  idEmpresa?: number;

  @IsOptional()
  @IsNumber()
  idPersonal?: number;
}
