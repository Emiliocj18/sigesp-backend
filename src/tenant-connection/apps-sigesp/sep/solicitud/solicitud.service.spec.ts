import { Test } from '@nestjs/testing';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { SolicitudService } from './solicitud.service';

// Prueba unitaria sin BD real: mockea 'ITenantRepositoryFactory' (patrón de los
// specs existentes de login/datasource).
describe('SolicitudService', () => {
  let service: SolicitudService;
  const repositoryFactory = { withRepository: jest.fn(), getRepository: jest.fn() };
  const find = jest.fn();

  const user: AuthenticatedUser = { userId: 1, username: 'u', tenantId: 7 };
  const solicitudes = [
    { idSolicitud: 1, consol: 'COMPRA DE INSUMOS', montot: 1500, estsol: 'E' },
    { idSolicitud: 2, consol: 'SERVICIO DE MANTENIMIENTO', montot: 300, estsol: 'A' },
    { idSolicitud: 3, consol: 'SOLICITUD PROVISORIA', montot: 0, estsol: 'X' },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SolicitudService,
        { provide: 'ITenantRepositoryFactory', useValue: repositoryFactory },
      ],
    }).compile();
    service = moduleRef.get(SolicitudService);
    repositoryFactory.withRepository.mockImplementation(
      async (_tenantId, _Entity, fn) => fn({ find }),
    );
  });

  it('getSolicitudes lista y traduce el estado de las solicitudes del tenant', async () => {
    find.mockResolvedValue(solicitudes);

    const result = await service.getSolicitudes(user, { limit: 10, offset: 0 });

    expect(result).toEqual([
      { idSolicitud: 1, consol: 'COMPRA DE INSUMOS', montot: 1500, estado: 'Emitida' },
      { idSolicitud: 2, consol: 'SERVICIO DE MANTENIMIENTO', montot: 300, estado: 'Anulada' },
      { idSolicitud: 3, consol: 'SOLICITUD PROVISORIA', montot: 0, estado: 'X' },
    ]);
    expect(repositoryFactory.withRepository).toHaveBeenCalledWith(
      7,
      expect.anything(),
      expect.any(Function),
    );
  });

  it('getSolicitudes aplica la paginación con take/skip (B6)', async () => {
    find.mockResolvedValue([]);

    await service.getSolicitudes(user, { limit: 5, offset: 10 });

    expect(find).toHaveBeenCalledWith({
      order: { idSolicitud: 'ASC' },
      take: 5,
      skip: 10,
    });
  });

  it('getSolicitudes lanza error si el token no trae tenantId', async () => {
    await expect(
      service.getSolicitudes({ userId: 1, username: 'u' }),
    ).rejects.toThrow('El token no contiene información de la empresa (tenant)');
    expect(repositoryFactory.withRepository).not.toHaveBeenCalled();
  });
});
