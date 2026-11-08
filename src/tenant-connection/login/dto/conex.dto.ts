import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// DTO de entrada para el login multitenant (espejo de id_bd, nombre, fl_usuario, fl_clave)
export class ConexDto {
  @IsNumber()
  connectionId: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
