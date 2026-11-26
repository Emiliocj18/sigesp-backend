import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { SistemaService } from './sistema.service';

// Prueba unitaria sin BD real: mockea 'ITenantQueryRunner' (patrón de los
// specs existentes de usuario/banco).
describe('SistemaService', () => {
  let service: SistemaService;
  const queryRunner = { query: jest.fn() };
  const config = { get: jest.fn() };

  const user: AuthenticatedUser = {
    userId: 1,
    username: 'admin',
    tenantId: 7,
    idEmpresa: 1,
  };
  const sistemas = [
    {
      id_empresa: 1,
      id_usuario: 5,
      codsis: 'BAN',
      nomsis: 'Banco',
      estsis: '1',
      imgsis: 'banco.png',
      accsis: 'banco',
      tipsis: 1,
    },
    {
      id_empresa: 1,
      id_usuario: 5,
      codsis: 'CON',
      nomsis: 'Contabilidad',
      estsis: '1',
      imgsis: 'contabilidad.png',
      accsis: 'contabilidad',
      tipsis: 2,
    },
  ];

  async function createService(ssoModuleUrls?: string): Promise<SistemaService> {
    config.get.mockImplementation((key: string) =>
      key === 'SSO_MODULE_URLS' ? ssoModuleUrls : undefined,
    );
    const moduleRef = await Test.createTestingModule({
      providers: [
        SistemaService,
        { provide: 'ITenantQueryRunner', useValue: queryRunner },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    return moduleRef.get(SistemaService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getSistemas lista los sistemas del usuario vía SQL crudo parametrizado', async () => {
    service = await createService();
    queryRunner.query.mockResolvedValue(sistemas);

    const result = await service.getSistemas(user);

    expect(result).toEqual(sistemas.map((row) => ({ ...row, url: null })));
    expect(queryRunner.query).toHaveBeenCalledWith(
      7,
      expect.stringContaining('sss_usuario_sistema'),
      ['admin', 1],
    );
  });

  it('B-T10 devuelve la URL configurada para el codsis del mapa', async () => {
    service = await createService('BAN=http://localhost:4202');
    queryRunner.query.mockResolvedValue(sistemas);

    const result = await service.getSistemas(user);

    expect(result[0].url).toBe('http://localhost:4202');
  });

  it('B-T11 devuelve url null cuando el codsis no está en el mapa', async () => {
    service = await createService('SSS=http://localhost:4201');
    queryRunner.query.mockResolvedValue(sistemas);

    const result = await service.getSistemas(user);

    expect(result.map((s) => s.url)).toEqual([null, null]);
  });

  it('B-T12 ignora entradas malformadas y sigue con las válidas', async () => {
    service = await createService(
      'SSS, BAN=http://localhost:4202, CON=http://con localhost:4203',
    );
    queryRunner.query.mockResolvedValue(sistemas);

    const result = await service.getSistemas(user);

    expect(result[0].url).toBe('http://localhost:4202');
    expect(result[1].url).toBeNull();
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it('B-T13 no hace fallback por accsis', async () => {
    service = await createService();
    queryRunner.query.mockResolvedValue(sistemas);

    const result = await service.getSistemas(user);

    expect(result[0].accsis).toBe('banco');
    expect(result[0].url).toBeNull();
  });

  it('B-T14 filtra estsis activo y ordena en el servidor (tipsis, codsis)', async () => {
    service = await createService();
    queryRunner.query.mockResolvedValue([]);

    await service.getSistemas(user);

    const sql = queryRunner.query.mock.calls[0][1] as string;
    expect(sql).toContain("s.estsis = '1'");
    expect(sql).toContain('ORDER BY s.tipsis ASC, us.codsis ASC');
  });

  it('normaliza la clave del mapa sin distinguir mayúsculas', async () => {
    service = await createService('ban=http://localhost:4202');
    queryRunner.query.mockResolvedValue(sistemas);

    const result = await service.getSistemas(user);

    expect(result[0].url).toBe('http://localhost:4202');
  });

  it('registra al arrancar los módulos habilitados', async () => {
    service = await createService('BAN=http://localhost:4202');

    service.onModuleInit();

    expect(console.log).toHaveBeenCalledWith(
      '[SSO] módulos habilitados: BAN -> http://localhost:4202',
    );
  });

  it('getSistemas lanza error si el token no trae tenantId', async () => {
    service = await createService();

    await expect(
      service.getSistemas({ userId: 1, username: 'admin' }),
    ).rejects.toThrow('El token no contiene información de la empresa (tenant)');
    expect(queryRunner.query).not.toHaveBeenCalled();
  });

  it('getSistemas lanza error si el token no trae idEmpresa', async () => {
    service = await createService();

    await expect(
      service.getSistemas({ userId: 1, username: 'admin', tenantId: 7 }),
    ).rejects.toThrow('El token no contiene el id de la empresa del usuario');
    expect(queryRunner.query).not.toHaveBeenCalled();
  });

  it('getSistemas propaga los errores de la BD del tenant', async () => {
    service = await createService();
    queryRunner.query.mockRejectedValue(new Error('conexion caida'));

    await expect(service.getSistemas(user)).rejects.toThrow('conexion caida');
  });
});
