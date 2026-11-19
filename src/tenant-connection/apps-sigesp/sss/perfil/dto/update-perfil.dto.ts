import { IsOptional, IsString, MaxLength } from 'class-validator';

// Datos editables del perfil. Se corresponden con las columnas telmovper
// (teléfono móvil) y coreleper (correo) de sno_personal.
export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;
}
