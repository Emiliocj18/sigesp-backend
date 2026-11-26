import { Module } from '@nestjs/common';
import { RefreshController } from './refresh.controller';
import { RefreshService } from './refresh.service';

// Módulo de refresco/revocación de tokens (A5). Reutiliza JwtService y la
// denylist globales; no declara su propia instancia.
@Module({
  controllers: [RefreshController],
  providers: [RefreshService],
})
export class RefreshModule {}
