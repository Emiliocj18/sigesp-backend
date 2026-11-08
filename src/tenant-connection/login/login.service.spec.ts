import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginService } from './login.service';
import { ConnectionService } from '../../poolmanager/connections/connection.service';
import { DatasourceService } from '../datasource/datasource.service';

describe('LoginService', () => {
  let service: LoginService;
  const connectionService = { getConnectionById: jest.fn() };
  const datasourceService = { getDataSource: jest.fn() };
  const verifier = { verify: jest.fn() };
  const jwtService = { signAsync: jest.fn().mockResolvedValue('tok') };
  const config = {
    get: jest.fn().mockImplementation((k: string) =>
      k === 'JWT_REFRESH_SECRET' ? 'ref-secret' : '7d',
    ),
  };

  const queryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };
  const fakeDs = {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    }),
  };

  const conn = { connectionId: 1, name: 'EMPRESA' } as any;
  const dto = { connectionId: 1, username: 'u', password: 'p' } as any;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoginService,
        { provide: ConnectionService, useValue: connectionService },
        { provide: DatasourceService, useValue: datasourceService },
        { provide: 'IDatasourcePasswordVerifier', useValue: verifier },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = moduleRef.get(LoginService);
  });

  it('login retorna access_token + refresh_token + usuario con credenciales validas', async () => {
    connectionService.getConnectionById.mockResolvedValue(conn);
    datasourceService.getDataSource.mockResolvedValue(fakeDs);
    queryBuilder.getRawOne.mockResolvedValue({
      idPersonal: 1,
      codusu: 'u',
      pwdusu: 'h',
      estusu: '1',
      nomemp: 'E',
      nomper: 'N',
      apeper: 'A',
    });
    verifier.verify.mockResolvedValue(true);

    const result = await service.login(dto);
    expect(result.access_token).toBe('tok');
    expect(result.refresh_token).toBe('tok');
    expect(result.usuario.usuario).toBe('u');
  });

  it('login lanza UnauthorizedException si el usuario no existe', async () => {
    connectionService.getConnectionById.mockResolvedValue(conn);
    datasourceService.getDataSource.mockResolvedValue(fakeDs);
    queryBuilder.getRawOne.mockResolvedValue(null);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login lanza UnauthorizedException si la clave es invalida', async () => {
    connectionService.getConnectionById.mockResolvedValue(conn);
    datasourceService.getDataSource.mockResolvedValue(fakeDs);
    queryBuilder.getRawOne.mockResolvedValue({
      idPersonal: 1,
      codusu: 'u',
      pwdusu: 'h',
      estusu: '1',
    });
    verifier.verify.mockResolvedValue(false);

    await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
