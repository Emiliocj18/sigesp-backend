import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { TokenIssuerService } from './token-issuer.service';

describe('TokenIssuerService', () => {
  let service: TokenIssuerService;
  const jwtService = {
    signAsync: jest.fn((payload: JwtPayload) => Promise.resolve(`token-${payload.type}`)),
  };
  const config = {
    get: jest.fn((key: string) => (key === 'REFRESH_TOKEN_TTL' ? '7d' : 'refresh-secret')),
  };

  const payload: JwtPayload = {
    sub: 10,
    username: 'amoreno',
    tenantId: 1,
    tenantName: 'EMPRESA',
    empresaNombre: 'EMPRESA SA',
    idUsuario: 10,
    idEmpresa: 1,
    idPersonal: 8870,
    nombre: 'Ana',
    apellido: 'Pérez',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TokenIssuerService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = moduleRef.get(TokenIssuerService);
  });

  it('B-T01 issueTokens firma access y refresh con type, jti y perfil', async () => {
    const result = await service.issueTokens(payload);

    expect(result.access_token).toBe('token-access');
    expect(result.refresh_token).toBe('token-refresh');
    expect(result.usuario.usuario).toBe('amoreno');
    expect(result.usuario.empresa).toBe('EMPRESA SA');

    const calls = jwtService.signAsync.mock.calls as unknown as [JwtPayload, unknown?][];
    const [accessPayload, refreshPayload] = [calls[0][0], calls[1][0]];

    expect(accessPayload).toMatchObject({ type: 'access', username: 'amoreno' });
    expect(refreshPayload).toMatchObject({ type: 'refresh', username: 'amoreno' });
    expect(accessPayload.empresaNombre).toBe('EMPRESA SA');
    expect(refreshPayload.empresaNombre).toBe('EMPRESA SA');
    expect(accessPayload.jti).toBeTruthy();
    expect(accessPayload.jti).toBe(refreshPayload.jti);
    expect(calls[1][1]).toEqual({ secret: 'refresh-secret', expiresIn: '7d' });
  });

  it('issueAccess descarta iat/exp del token verificado', async () => {
    const verificado = { ...payload, iat: 1, exp: 2 } as JwtPayload;

    await service.issueAccess(verificado, 'jti-x');

    const calls = jwtService.signAsync.mock.calls as unknown as [JwtPayload][];
    expect(calls[0][0]).not.toHaveProperty('iat');
    expect(calls[0][0]).not.toHaveProperty('exp');
    expect(calls[0][0]).toMatchObject({ type: 'access', jti: 'jti-x' });
  });

  it('B-T02 toUsuario devuelve el perfil sin conexionDB', () => {
    const usuario = service.toUsuario(payload);

    expect(usuario).toEqual({
      usuario: 'amoreno',
      empresa: 'EMPRESA SA',
      nombre: 'Ana',
      apellido: 'Pérez',
      tenantId: 1,
      tenantName: 'EMPRESA',
      idUsuario: 10,
      idEmpresa: 1,
      idPersonal: 8870,
    });
    expect('conexionDB' in usuario).toBe(false);
  });

  it('empresa cae al tenantName en tokens emitidos antes del cambio', () => {
    const sinEmpresa = { ...payload };
    delete sinEmpresa.empresaNombre;

    expect(service.toUsuario(sinEmpresa).empresa).toBe('EMPRESA');
  });
});
