import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { JwtPayload } from './jwt-payload.interface';
import { UsuarioConectadoDto } from '../tenant-connection/login/dto/usuario-conectado.dto';

export interface TokensEmitidos {
  access_token: string;
  refresh_token: string;
  usuario: UsuarioConectadoDto;
}

// Única fábrica de tokens: login, refresh y sesión comparten la misma emisión
// para que firmas, TTL y perfil no diverjan entre endpoints.
@Injectable()
export class TokenIssuerService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async issueTokens(
    payload: JwtPayload,
    jti: string = randomUUID(),
  ): Promise<TokensEmitidos> {
    return {
      access_token: await this.issueAccess(payload, jti),
      refresh_token: await this.issueRefresh(payload, jti),
      usuario: this.toUsuario(payload),
    };
  }

  // Access token de corta duración. La sesión lo emite sin tocar el refresh.
  issueAccess(payload: JwtPayload, jti: string = randomUUID()): Promise<string> {
    return this.jwtService.signAsync({ ...this.toClaims(payload), jti, type: 'access' });
  }

  // El perfil expone solo identidad: nunca conexionDB ni credenciales de BD.
  // empresa usa el nombre visible del token y cae al tenant en tokens antiguos.
  toUsuario(payload: JwtPayload): UsuarioConectadoDto {
    return {
      usuario: payload.username,
      empresa: payload.empresaNombre ?? payload.tenantName ?? '',
      nombre: payload.nombre ?? '',
      apellido: payload.apellido ?? '',
      tenantId: payload.tenantId ?? 0,
      tenantName: payload.tenantName ?? '',
      idUsuario: payload.idUsuario,
      idEmpresa: payload.idEmpresa,
      idPersonal: payload.idPersonal,
    };
  }

  private issueRefresh(payload: JwtPayload, jti: string): Promise<string> {
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const refreshTtl = this.config.get<string>('REFRESH_TOKEN_TTL') ?? '7d';
    return this.jwtService.signAsync(
      { ...this.toClaims(payload), jti, type: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshTtl },
    );
  }

  // Un token verificado trae iat/exp/jti/type; al firmar de nuevo hay que
  // descartarlos porque jsonwebtoken rechaza el expiresIn junto a un exp.
  private toClaims(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      username: payload.username,
      tenantId: payload.tenantId,
      tenantName: payload.tenantName,
      empresaNombre: payload.empresaNombre,
      idUsuario: payload.idUsuario,
      idEmpresa: payload.idEmpresa,
      idPersonal: payload.idPersonal,
      nombre: payload.nombre,
      apellido: payload.apellido,
    };
  }
}
