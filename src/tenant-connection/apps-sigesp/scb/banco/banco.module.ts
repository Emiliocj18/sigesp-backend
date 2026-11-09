import { Module } from '@nestjs/common';
import { AppsSigespSharedModule } from '../../shared/apps-sigesp-shared.module';
import { BancoController } from './banco.controller';
import { BancoService } from './banco.service';

// Módulo del recurso banco (scb_banco) del prefijo scb.
@Module({
  imports: [AppsSigespSharedModule],
  controllers: [BancoController],
  providers: [BancoService],
})
export class BancoModule {}
