import { IsNumber, IsString } from 'class-validator';

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
}
