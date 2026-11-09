import { Module } from '@nestjs/common';
import { AppsSigespSharedModule } from '../../shared/apps-sigesp-shared.module';
import { SolicitudController } from './solicitud.controller';
import { SolicitudService } from './solicitud.service';

// Módulo del recurso solicitud (sep_solicitud) del prefijo sep.
@Module({
  imports: [AppsSigespSharedModule],
  controllers: [SolicitudController],
  providers: [SolicitudService],
})
export class SolicitudModule {}
