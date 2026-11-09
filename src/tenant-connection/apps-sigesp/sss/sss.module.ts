import { Module } from '@nestjs/common';
import { UsuarioModule } from './usuario/usuario.module';

// Agregador del prefijo sss: una subcarpeta por tipo de consulta; añadir un
// recurso = crear su carpeta (module · controller · service · spec · dto/) y
// sumarla aquí. entities/ es común a todos los recursos del prefijo.
@Module({
  imports: [UsuarioModule],
})
export class SssModule {}
