import { IsInt, IsString } from 'class-validator';

// DTO de respuesta: usuario de la empresa (tenant) seleccionada en el login
export class UsuarioListaDto {
  @IsInt()
  idUsuario: number;

  @IsString()
  codusu: string;

  @IsInt()
  usuadm: number;
}
