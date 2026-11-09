import { IsInt, IsString } from 'class-validator';

// DTO de respuesta: usuario consultado vía /queries/sss/usuarios
export class UsuarioListaDto {
  @IsInt()
  idUsuario: number;

  @IsString()
  codusu: string;

  // 1 = administrador, 0 = usuario
  @IsInt()
  usuadm: number;
}
