import { IsInt, IsString } from 'class-validator';

// DTO de respuesta: banco de la empresa (tenant) seleccionada en el login
export class BancoListaDto {
  @IsInt()
  idBanco: number;

  @IsString()
  nomban: string;

  @IsString()
  dirban: string;

  @IsString()
  codsudeban: string;
}
