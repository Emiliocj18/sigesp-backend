import { Module } from '@nestjs/common';
import { AppsSigespSharedModule } from '../../shared/apps-sigesp-shared.module';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

// Módulo del recurso usuario (sss_usuario) del prefijo sss.
@Module({
  imports: [AppsSigespSharedModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
