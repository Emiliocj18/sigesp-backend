import { Module } from '@nestjs/common';
import { PerfilModule } from './perfil/perfil.module';
import { SistemaModule } from './sistema/sistema.module';
import { UsuarioModule } from './usuario/usuario.module';

// Agregador del prefijo sss: una subcarpeta por tipo de consulta; añadir un
// recurso = crear su carpeta (module · controller · service · spec · dto/) y
// sumarla aquí. entities/ es común a todos los recursos del prefijo.
@Module({
  imports: [SistemaModule, UsuarioModule, PerfilModule],
})
export class SssModule {}
