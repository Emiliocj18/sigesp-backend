import { Module } from '@nestjs/common';
import { AppsSigespSharedModule } from '../shared/apps-sigesp-shared.module';
import { SepController } from './sep.controller';
import { SepService } from './sep.service';

// Módulo del prefijo SIGESP sep (solicitudes de ejecución presupuestaria).
@Module({
  imports: [AppsSigespSharedModule],
  controllers: [SepController],
  providers: [SepService],
})
export class SepModule {}
