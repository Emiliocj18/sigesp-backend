import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordHasher } from './password-hasher';

// Modulo de autenticacion JWT (estrategia, guard y servicio de tokens) - global
@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        // A6: la validación estricta ya ocurre en validateEnv (bootstrap)
        if (!secret) {
          throw new Error('JWT_SECRET no esta definido en las variables de entorno');
        }
        // A5: token de acceso de corta duración (por defecto 15 minutos)
        const expiresIn = config.get<string>('ACCESS_TOKEN_TTL') ?? '15m';
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, { provide: 'IPasswordHasher', useClass: PasswordHasher }],
  exports: [JwtModule, JwtAuthGuard, 'IPasswordHasher'],
})
export class JwtAuthModule {}
