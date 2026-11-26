import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../jwt-payload.interface';
import { RefreshService } from '../refresh/refresh.service';
import { TokenDenylistService } from '../../shared/security/token-denylist.service';
import { TokenIssuerService } from '../token-issuer.service';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

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
  jti: 'jti-1',
  type: 'refresh',
};

describe('SessionService', () => {
  let service: SessionService;
  const jwtService = { verifyAsync: jest.fn() };
  const config = { get: jest.fn(() => 'refresh-secret') };
  const denylist = { isRevoked: jest.fn() };
  const tokenIssuer = { issueAccess: jest.fn(), toUsuario: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
        { provide: TokenDenylistService, useValue: denylist },
        { provide: TokenIssuerService, useValue: tokenIssuer },
      ],
    }).compile();
    service = moduleRef.get(SessionService);

    jwtService.verifyAsync.mockResolvedValue(payload);
    denylist.isRevoked.mockReturnValue(false);
    tokenIssuer.issueAccess.mockResolvedValue('access-nuevo');
    tokenIssuer.toUsuario.mockReturnValue({ usuario: 'amoreno' });
  });

  it('B-T03 con cookie valida devuelve access_token y usuario', async () => {
    const result = await service.getSession('cookie-rt');

    expect(result).toEqual({
      access_token: 'access-nuevo',
      usuario: { usuario: 'amoreno' },
    });
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('cookie-rt', {
      secret: 'refresh-secret',
    });
  });

  it('B-T04 sin cookie responde 401', async () => {
    await expect(service.getSession('')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('B-T05 con jti revocado responde 401', async () => {
    denylist.isRevoked.mockReturnValue(true);

    await expect(service.getSession('cookie-rt')).rejects.toThrow('Refresh token revocado');
    expect(tokenIssuer.issueAccess).not.toHaveBeenCalled();
  });

  it('B-T06 con type access responde 401', async () => {
    jwtService.verifyAsync.mockResolvedValue({ ...payload, type: 'access' });

    await expect(service.getSession('cookie-rt')).rejects.toThrow(
      'El token no es de refresco',
    );
    expect(tokenIssuer.issueAccess).not.toHaveBeenCalled();
  });

  it('B-T07 no emite refresh token ni rota la sesion', async () => {
    const result = await service.getSession('cookie-rt');

    expect(Object.keys(result).sort()).toEqual(['access_token', 'usuario']);
    expect(tokenIssuer.issueAccess).toHaveBeenCalledTimes(1);
    expect(tokenIssuer.issueAccess).toHaveBeenCalledWith(payload);
  });

  it('responde 401 si el token no trae tenant', async () => {
    const sinTenant = { ...payload };
    delete sinTenant.tenantId;
    jwtService.verifyAsync.mockResolvedValue(sinTenant);

    await expect(service.getSession('cookie-rt')).rejects.toThrow('Sesion sin tenant');
  });
});

describe('SessionController', () => {
  let controller: SessionController;
  const sessionService = { getSession: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [{ provide: SessionService, useValue: sessionService }],
    }).compile();
    controller = moduleRef.get(SessionController);
    sessionService.getSession.mockResolvedValue({ access_token: 'a', usuario: {} });
  });

  it('B-T08 agrega Cache-Control no-store y lee la cookie rt', async () => {
    const req = { cookies: { rt: 'cookie-rt' } } as never;
    const res = { setHeader: jest.fn(), cookie: jest.fn() } as never;

    const result = await controller.session(req, res);

    expect(result).toEqual({ access_token: 'a', usuario: {} });
    expect(sessionService.getSession).toHaveBeenCalledWith('cookie-rt');
    expect((res as { setHeader: jest.Mock }).setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store',
    );
    expect((res as { cookie: jest.Mock }).cookie).not.toHaveBeenCalled();
  });
});

describe('B-T15 denylist compartida y contrato de empresa', () => {
  it('login, refresh y sesion comparten denylist y devuelven el mismo empresa', async () => {
    const realConfig = {
      get: (key: string) =>
        key === 'JWT_REFRESH_SECRET' ? 'refresh-secret-value' : '7d',
    };
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'access-secret-value' })],
      providers: [
        RefreshService,
        SessionService,
        TokenIssuerService,
        TokenDenylistService,
        { provide: ConfigService, useValue: realConfig },
      ],
    }).compile();

    const jwtService = moduleRef.get(JwtService);
    const refreshService = moduleRef.get(RefreshService);
    const sessionService = moduleRef.get(SessionService);
    const token = await jwtService.signAsync(
      { ...payload },
      { secret: 'refresh-secret-value', expiresIn: '7d' },
    );

    const refreshDenylist = (refreshService as unknown as { denylist: unknown }).denylist;
    const sessionDenylist = (sessionService as unknown as { denylist: unknown }).denylist;
    expect(refreshDenylist).toBe(sessionDenylist);

    // El refresh token verificado trae iat/exp: la sesión debe poder firmar.
    const sesion = await sessionService.getSession(token);
    expect(sesion.access_token).toEqual(expect.any(String));
    expect(sesion.usuario.usuario).toBe('amoreno');
    expect(sesion.usuario.empresa).toBe('EMPRESA SA');

    // La rotación conserva el mismo nombre de empresa en el refresh.
    const renovado = await refreshService.refresh(token);
    expect(renovado.usuario.empresa).toBe(sesion.usuario.empresa);

    const sesionRotada = await sessionService.getSession(renovado.refresh_token);
    expect(sesionRotada.usuario.empresa).toBe(sesion.usuario.empresa);

    refreshService.logout(renovado.refresh_token);

    await expect(sessionService.getSession(renovado.refresh_token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
