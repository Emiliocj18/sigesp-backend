import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../jwt-payload.interface';
import { TokensEmitidos, TokenIssuerService } from '../token-issuer.service';
import { TokenDenylistService } from '../../shared/security/token-denylist.service';

// A5: renueva el access token usando un refresh token (rotación) y permite revocarlo (logout).
@Injectable()
export class RefreshService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly denylist: TokenDenylistService,
    private readonly tokenIssuer: TokenIssuerService,
  ) {}

  async refresh(refreshToken: string): Promise<TokensEmitidos> {
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

    // Rotación: revoca el jti actual y emite uno nuevo para ambos tokens
    this.denylist.revoke(payload.jti);

    return this.tokenIssuer.issueTokens(payload);
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
