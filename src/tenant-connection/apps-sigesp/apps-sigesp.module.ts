import { Module } from '@nestjs/common';
import { ScbModule } from './scb/scb.module';
import { SepModule } from './sep/sep.module';
import { SssModule } from './sss/sss.module';

// Agregador de la capa de consultas por módulo ERP (§6 de planestructura.md):
// añadir un módulo = crear su carpeta y sumarlo aquí.
@Module({
  imports: [ScbModule, SepModule, SssModule],
})
export class AppsSigespModule {}
