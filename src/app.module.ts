import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { databaseConfig } from './config/database.config';
import { validateEnv } from './config/validation';
import { JwtAuthModule } from './auth/jwt-auth.module';
import { ConnectionsModule } from './poolmanager/connections/connection.module';
import { LoginModule } from './tenant-connection/login/login.module';
import { TenantInfoModule } from './tenant-connection/tenant/tenant.module';
import { RefreshModule } from './auth/refresh/refresh.module';

// Modulo raiz de la aplicacion
@Module({
  imports: [
    // A6: valida JWT_SECRET/JWT_REFRESH_SECRET fuertes al arranque
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRoot(databaseConfig()),
    // A2: rate-limiting global (login usa un límite más estricto vía @Throttle)
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60000, limit: 20 }],
    }),
    JwtAuthModule,
    ConnectionsModule,
    LoginModule,
    TenantInfoModule,
    RefreshModule,
  ],
  providers: [
    // A2: aplica el guard de throttler a todas las rutas
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
