import { Test } from '@nestjs/testing';
import { AuthenticatedUser } from '../../../auth/jwt-payload.interface';
import { SssService } from './sss.service';

// Prueba unitaria sin BD real: mockea 'ITenantRepositoryFactory' (patrón de los
// specs existentes de login/datasource).
describe('SssService', () => {
  let service: SssService;
  const repositoryFactory = { withRepository: jest.fn(), getRepository: jest.fn() };
  const find = jest.fn();

  const user: AuthenticatedUser = { userId: 1, username: 'u', tenantId: 7 };
  const usuarios = [
    { idUsuario: 1, codusu: 'admin', usuadm: 1 },
    { idUsuario: 2, codusu: 'operador', usuadm: 0 },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SssService,
        { provide: 'ITenantRepositoryFactory', useValue: repositoryFactory },
      ],
    }).compile();
    service = moduleRef.get(SssService);
    repositoryFactory.withRepository.mockImplementation(
      async (_tenantId, _Entity, fn) => fn({ find }),
    );
  });

  it('getUsuarios lista los usuarios del tenant vía withRepository', async () => {
    find.mockResolvedValue(usuarios);

    const result = await service.getUsuarios(user, { limit: 10, offset: 0 });

    expect(result).toEqual(usuarios);
    expect(repositoryFactory.withRepository).toHaveBeenCalledWith(
      7,
      expect.anything(),
      expect.any(Function),
    );
  });

  it('getUsuarios aplica la paginación con take/skip (B6)', async () => {
    find.mockResolvedValue([]);

    await service.getUsuarios(user, { limit: 5, offset: 10 });

    expect(find).toHaveBeenCalledWith({
      order: { idUsuario: 'ASC' },
      take: 5,
      skip: 10,
    });
  });

  it('getUsuarios lanza error si el token no trae tenantId', async () => {
    await expect(
      service.getUsuarios({ userId: 1, username: 'u' }),
    ).rejects.toThrow('El token no contiene información de la empresa (tenant)');
    expect(repositoryFactory.withRepository).not.toHaveBeenCalled();
  });
});
