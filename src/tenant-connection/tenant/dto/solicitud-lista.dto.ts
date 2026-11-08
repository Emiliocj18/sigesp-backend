import { IsNumber, IsString } from 'class-validator';

// DTO de respuesta: solicitud de la empresa (tenant) seleccionada en el login
export class SolicitudListaDto {
  @IsNumber()
  idSolicitud: number;

  @IsString()
  consol: string;

  @IsNumber()
  montot: number;

  @IsString()
  estado: string;
}
