import { Module } from '@nestjs/common';
import { RefreshController } from './refresh.controller';
import { RefreshService } from './refresh.service';
import { TokenDenylistService } from '../../shared/security/token-denylist.service';

// Módulo de refresco/revocación de tokens (A5). Reutiliza JwtService global.
@Module({
  controllers: [RefreshController],
  providers: [RefreshService, TokenDenylistService],
})
export class RefreshModule {}
