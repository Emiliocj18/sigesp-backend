import { Test } from '@nestjs/testing';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { BancoService } from './banco.service';

// Prueba unitaria sin BD real: mockea 'ITenantRepositoryFactory' (patrón de los
// specs existentes de login/datasource).
describe('BancoService', () => {
  let service: BancoService;
  const repositoryFactory = { withRepository: jest.fn(), getRepository: jest.fn() };
  const find = jest.fn();

  const user: AuthenticatedUser = { userId: 1, username: 'u', tenantId: 7 };
  const bancos = [
    { idBanco: 1, nomban: 'BANCO NACION', dirban: 'AV 1', codsudeban: '0108' },
    { idBanco: 2, nomban: 'BANCO PROVINCIAL', dirban: 'AV 2', codsudeban: '0102' },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        BancoService,
        { provide: 'ITenantRepositoryFactory', useValue: repositoryFactory },
      ],
    }).compile();
    service = moduleRef.get(BancoService);
    repositoryFactory.withRepository.mockImplementation(
      async (_tenantId, _Entity, fn) => fn({ find }),
    );
  });

  it('getBancos lista los bancos del tenant vía withRepository', async () => {
    find.mockResolvedValue(bancos);

    const result = await service.getBancos(user, { limit: 10, offset: 0 });

    expect(result).toEqual(bancos);
    expect(repositoryFactory.withRepository).toHaveBeenCalledWith(
      7,
      expect.anything(),
      expect.any(Function),
    );
  });

  it('getBancos aplica la paginación con take/skip (B6)', async () => {
    find.mockResolvedValue([]);

    await service.getBancos(user, { limit: 5, offset: 10 });

    expect(find).toHaveBeenCalledWith({
      order: { idBanco: 'ASC' },
      take: 5,
      skip: 10,
    });
  });

  it('getBancos lanza error si el token no trae tenantId', async () => {
    await expect(
      service.getBancos({ userId: 1, username: 'u' }),
    ).rejects.toThrow('El token no contiene información de la empresa (tenant)');
    expect(repositoryFactory.withRepository).not.toHaveBeenCalled();
  });
});
