import { IsNumber, IsString } from 'class-validator';

// DTO de respuesta: solicitud consultada vía /queries/sep/solicitudes
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
