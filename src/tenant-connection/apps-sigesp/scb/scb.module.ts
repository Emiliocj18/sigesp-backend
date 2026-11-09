import { Module } from '@nestjs/common';
import { QueriesSharedModule } from '../shared/queries-shared.module';
import { ScbController } from './scb.controller';
import { ScbService } from './scb.service';
import { ScbDao } from './dao/scb.dao';

// Módulo del prefijo SIGESP scb (cuentas bancarias / tesorería).
@Module({
  imports: [QueriesSharedModule],
  controllers: [ScbController],
  providers: [ScbService, ScbDao],
})
export class ScbModule {}
