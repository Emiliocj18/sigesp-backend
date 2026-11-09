import { Module } from '@nestjs/common';
import { QueriesSharedModule } from '../shared/queries-shared.module';
import { SssController } from './sss.controller';
import { SssService } from './sss.service';
import { SssDao } from './dao/sss.dao';

// Módulo del prefijo SIGESP sss (seguridad).
@Module({
  imports: [QueriesSharedModule],
  controllers: [SssController],
  providers: [SssService, SssDao],
})
export class SssModule {}
