import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { PerfilService } from './perfil.service';

// Prueba unitaria sin BD real: mockea 'ITenantQueryRunner' y
// 'ITenantRepositoryFactory' (mismo patrón que el resto de specs).
describe('PerfilService', () => {
  let service: PerfilService;
  const queryRunner = { query: jest.fn() };
  const repo = { update: jest.fn() };
  const repositoryFactory = {
    withRepository: jest.fn(
      (_tenantId: number, _entity: unknown, fn: (r: typeof repo) => unknown) =>
        fn(repo),
    ),
  };

  const user: AuthenticatedUser = {
    userId: 1,
    username: 'AMORENO',
    tenantId: 7,
    idEmpresa: 1,
    idPersonal: 8870,
  };

  const perfil = {
    idUsuario: 5,
    idEmpresa: 1,
    idPersonal: 8870,
    codusu: 'AMORENO',
    nombre: 'Alejandro',
    apellido: 'Moreno',
    cedula: '7145017',
    email: 'coordinacionoga2025@gmail.com',
    telefono: '04121055656',
    telefonoHabitacion: '02120000000',
    fechaNacimiento: '1990-05-10',
    foto: 'default.png',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PerfilService,
        { provide: 'ITenantQueryRunner', useValue: queryRunner },
        { provide: 'ITenantRepositoryFactory', useValue: repositoryFactory },
      ],
    }).compile();
    service = moduleRef.get(PerfilService);
  });

  it('getPerfil consulta por codusu e id_empresa del token', async () => {
    queryRunner.query.mockResolvedValue([perfil]);

    const result = await service.getPerfil(user);

    expect(result).toEqual(perfil);
    expect(queryRunner.query).toHaveBeenCalledWith(
      7,
      expect.stringContaining('sno_personal'),
      ['AMORENO', 1],
    );
  });

  it('getPerfil devuelve la cédula para habilitar el botón Guardar', async () => {
    queryRunner.query.mockResolvedValue([perfil]);

    const result = await service.getPerfil(user);

    expect(result.cedula).toBe('7145017');
  });

  it('getPerfil falla si el usuario no existe en la empresa', async () => {
    queryRunner.query.mockResolvedValue([]);

    await expect(service.getPerfil(user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getPerfil falla si el usuario no tiene ficha de personal', async () => {
    queryRunner.query.mockResolvedValue([{ ...perfil, idPersonal: 0 }]);

    await expect(service.getPerfil(user)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('getPerfil exige idEmpresa en el token', async () => {
    await expect(
      service.getPerfil({ ...user, idEmpresa: undefined }),
    ).rejects.toThrow('El token no contiene el id de la empresa del usuario');
    expect(queryRunner.query).not.toHaveBeenCalled();
  });

  it('updatePerfil actualiza solo telmovper y coreleper de la ficha', async () => {
    queryRunner.query.mockResolvedValue([perfil]);
    repo.update.mockResolvedValue({ affected: 1 });

    await service.updatePerfil(user, {
      telefono: '04140000000',
      email: 'nuevo@correo.com',
    });

    expect(repo.update).toHaveBeenCalledWith(
      { idPersonal: 8870, idEmpresa: 1 },
      { telmovper: '04140000000', coreleper: 'nuevo@correo.com' },
    );
  });

  it('updatePerfil permite actualizar un solo campo', async () => {
    queryRunner.query.mockResolvedValue([perfil]);
    repo.update.mockResolvedValue({ affected: 1 });

    await service.updatePerfil(user, { telefono: '04140000000' });

    expect(repo.update).toHaveBeenCalledWith(
      { idPersonal: 8870, idEmpresa: 1 },
      { telmovper: '04140000000' },
    );
  });

  it('updatePerfil rechaza un cuerpo vacío sin escribir', async () => {
    await expect(service.updatePerfil(user, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});
