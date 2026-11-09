import { IsInt, IsString } from 'class-validator';

// DTO de respuesta: banco consultado vía /queries/scb/bancos
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
