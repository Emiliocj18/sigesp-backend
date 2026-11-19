import { Test } from '@nestjs/testing';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { SistemaService } from './sistema.service';

// Prueba unitaria sin BD real: mockea 'ITenantQueryRunner' (patrón de los
// specs existentes de usuario/banco).
describe('SistemaService', () => {
  let service: SistemaService;
  const queryRunner = { query: jest.fn() };

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

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SistemaService,
        { provide: 'ITenantQueryRunner', useValue: queryRunner },
      ],
    }).compile();
    service = moduleRef.get(SistemaService);
  });

  it('getSistemas lista los sistemas del usuario vía SQL crudo parametrizado', async () => {
    queryRunner.query.mockResolvedValue(sistemas);

    const result = await service.getSistemas(user);

    expect(result).toEqual(sistemas);
    expect(queryRunner.query).toHaveBeenCalledWith(
      7,
      expect.stringContaining('sss_usuario_sistema'),
      ['admin', 1],
    );
  });

  it('getSistemas filtra estsis activo y ordena en el servidor (tipsis, codsis)', async () => {
    queryRunner.query.mockResolvedValue([]);

    await service.getSistemas(user);

    const sql = queryRunner.query.mock.calls[0][1] as string;
    expect(sql).toContain("s.estsis = '1'");
    expect(sql).toContain('ORDER BY s.tipsis ASC, us.codsis ASC');
  });

  it('getSistemas lanza error si el token no trae tenantId', async () => {
    await expect(
      service.getSistemas({ userId: 1, username: 'admin' }),
    ).rejects.toThrow('El token no contiene información de la empresa (tenant)');
    expect(queryRunner.query).not.toHaveBeenCalled();
  });

  it('getSistemas lanza error si el token no trae idEmpresa', async () => {
    await expect(
      service.getSistemas({ userId: 1, username: 'admin', tenantId: 7 }),
    ).rejects.toThrow('El token no contiene el id de la empresa del usuario');
    expect(queryRunner.query).not.toHaveBeenCalled();
  });

  it('getSistemas propaga los errores de la BD del tenant', async () => {
    queryRunner.query.mockRejectedValue(new Error('conexion caida'));

    await expect(service.getSistemas(user)).rejects.toThrow('conexion caida');
  });
});
