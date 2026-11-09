import { Module } from '@nestjs/common';
import { AppsSigespSharedModule } from '../shared/apps-sigesp-shared.module';
import { SssController } from './sss.controller';
import { SssService } from './sss.service';

// Módulo del prefijo SIGESP sss (seguridad).
@Module({
  imports: [AppsSigespSharedModule],
  controllers: [SssController],
  providers: [SssService],
})
export class SssModule {}
