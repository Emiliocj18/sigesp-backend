import { Module } from '@nestjs/common';
import { SolicitudModule } from './solicitud/solicitud.module';

// Agregador del prefijo sep: una subcarpeta por tipo de consulta; añadir un
// recurso = crear su carpeta (module · controller · service · spec · dto/) y
// sumarla aquí. entities/ es común a todos los recursos del prefijo.
@Module({
  imports: [SolicitudModule],
})
export class SepModule {}
