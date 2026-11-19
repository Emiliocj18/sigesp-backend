import { Module } from '@nestjs/common';
import { AppsSigespSharedModule } from '../../shared/apps-sigesp-shared.module';
import { PerfilController } from './perfil.controller';
import { PerfilService } from './perfil.service';

// Módulo del recurso perfil del prefijo sss.
@Module({
  imports: [AppsSigespSharedModule],
  controllers: [PerfilController],
  providers: [PerfilService],
})
export class PerfilModule {}
