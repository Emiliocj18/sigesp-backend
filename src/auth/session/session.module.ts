import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

// Módulo de sesión para módulos SSO. Reutiliza JwtService y la denylist global.
@Module({
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
