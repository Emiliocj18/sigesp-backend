import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser, JwtPayload } from './jwt-payload.interface';

// Estrategia JWT para validar el token en las peticiones
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no esta definido en las variables de entorno');
    }
    super({
      // Extrae el token del encabezado Authorization (Bearer)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Esto lee el token
      ignoreExpiration: false, // Esto indica que si el token ya expiro no lo iginore (devuelve al usuario)
      secretOrKey: secret, // Esto le indica que lea el 'JWT_SECRET'
    });
  }

  // Valida y expone el payload en la peticion (req.user), incluyendo el tenant
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return {
      userId: payload.sub,
      username: payload.username,
      tenantId: payload.tenantId,
      tenantName: payload.tenantName,
    };
  }
}
