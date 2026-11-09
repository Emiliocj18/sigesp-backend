import { Module } from '@nestjs/common';
import { QueriesSharedModule } from '../shared/queries-shared.module';
import { SepController } from './sep.controller';
import { SepService } from './sep.service';
import { SepDao } from './dao/sep.dao';

// Módulo del prefijo SIGESP sep (solicitudes de ejecución presupuestaria).
@Module({
  imports: [QueriesSharedModule],
  controllers: [SepController],
  providers: [SepService, SepDao],
})
export class SepModule {}
