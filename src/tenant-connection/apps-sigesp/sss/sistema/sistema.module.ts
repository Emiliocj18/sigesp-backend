import { Module } from '@nestjs/common';
import { AppsSigespSharedModule } from '../../shared/apps-sigesp-shared.module';
import { SistemaController } from './sistema.controller';
import { SistemaService } from './sistema.service';

// Módulo del recurso sistema (menú home) del prefijo sss.
@Module({
  imports: [AppsSigespSharedModule],
  controllers: [SistemaController],
  providers: [SistemaService],
})
export class SistemaModule {}
