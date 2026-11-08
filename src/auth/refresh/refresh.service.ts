import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { JwtPayload } from '../jwt-payload.interface';
import { UsuarioConectadoDto } from '../../tenant-connection/login/dto/usuario-conectado.dto';
import { TokenDenylistService } from '../../shared/security/token-denylist.service';

// A5: renueva el access token usando un refresh token (rotación) y permite revocarlo (logout).
@Injectable()
export class RefreshService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly denylist: TokenDenylistService,
  ) {}

  async refresh(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string; usuario: UsuarioConectadoDto }> {
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
    if (this.denylist.isRevoked(payload.jti)) {
      throw new UnauthorizedException('Refresh token revocado');
    }
    if (!payload.jti) {
      throw new UnauthorizedException('Refresh token sin jti');
    }

    // Rotación: revoca el jti actual y emite uno nuevo
    this.denylist.revoke(payload.jti);

    const newJti = randomUUID();
    const base: JwtPayload = {
      sub: payload.sub,
      username: payload.username,
      tenantId: payload.tenantId,
      tenantName: payload.tenantName,
    };

    const accessToken = await this.jwtService.signAsync({
      ...base,
      jti: newJti,
      type: 'access',
    });

    const refreshTtl = this.config.get<string>('REFRESH_TOKEN_TTL') ?? '7d';
    const newRefreshToken = await this.jwtService.signAsync(
      { ...base, jti: newJti, type: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshTtl },
    );

    // Reconstruye el perfil a partir del payload (el refresh token viaja en cookie HttpOnly).
    const usuario: UsuarioConectadoDto = {
      usuario: payload.username,
      empresa: payload.tenantName ?? '',
      nombre: '',
      apellido: '',
      tenantId: payload.tenantId ?? 0,
      tenantName: payload.tenantName ?? '',
    };

    return { access_token: accessToken, refresh_token: newRefreshToken, usuario };
  }

  logout(refreshToken: string): void {
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
      if (payload?.jti) {
        this.denylist.revoke(payload.jti);
      }
    } catch {
      // token ya inválido; nada que revocar
    }
  }
}
