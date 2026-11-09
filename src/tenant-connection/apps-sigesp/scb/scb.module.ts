import { Module } from '@nestjs/common';
import { BancoModule } from './banco/banco.module';

// Agregador del prefijo scb: una subcarpeta por tipo de consulta; añadir un
// recurso = crear su carpeta (module · controller · service · spec · dto/) y
// sumarla aquí. entities/ es común a todos los recursos del prefijo.
@Module({
  imports: [BancoModule],
})
export class ScbModule {}
