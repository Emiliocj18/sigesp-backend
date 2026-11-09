import { Module } from '@nestjs/common';
import { AppsSigespSharedModule } from '../shared/apps-sigesp-shared.module';
import { ScbController } from './scb.controller';
import { ScbService } from './scb.service';

// Módulo del prefijo SIGESP scb (cuentas bancarias / tesorería).
@Module({
  imports: [AppsSigespSharedModule],
  controllers: [ScbController],
  providers: [ScbService],
})
export class ScbModule {}
