import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../jwt-payload.interface';
import { TokenIssuerService } from '../token-issuer.service';
import { TokenDenylistService } from '../../shared/security/token-denylist.service';
import { UsuarioConectadoDto } from '../../tenant-connection/login/dto/usuario-conectado.dto';

export interface SesionDto {
  access_token: string;
  usuario: UsuarioConectadoDto;
}

// Traduce la cookie HttpOnly "rt" en un access token en memoria.
// No es login: no crea sesión, no rota la cookie y no emite refresh token.
@Injectable()
export class SessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly denylist: TokenDenylistService,
    private readonly tokenIssuer: TokenIssuerService,
  ) {}

  async getSession(refreshToken: string): Promise<SesionDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    return {
      access_token: await this.tokenIssuer.issueAccess(payload),
      usuario: this.tokenIssuer.toUsuario(payload),
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    if (!refreshToken) {
      throw new UnauthorizedException('Cookie de sesion ausente');
    }

    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('El token no es de refresco');
    }
    if (!payload.jti) {
      throw new UnauthorizedException('Refresh token sin jti');
    }
    if (this.denylist.isRevoked(payload.jti)) {
      throw new UnauthorizedException('Refresh token revocado');
    }
    // El tenant viene firmado en el token; sin él no hay sesión válida.
    if (payload.tenantId == null) {
      throw new UnauthorizedException('Sesion sin tenant');
    }

    return payload;
  }
}
