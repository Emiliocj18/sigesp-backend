import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionRepository } from './providers/connection.repository';
import { Connection } from './entities/connection.entity';
import { ConnectionCatalogDto } from './dto/connection-catalog.dto';

describe('ConnectionService', () => {
  let service: ConnectionService;
  const repo: Partial<ConnectionRepository> = {
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ConnectionService, { provide: ConnectionRepository, useValue: repo }],
    }).compile();
    service = moduleRef.get(ConnectionService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('getConnectionById cachea y solo consulta el repo una vez (B4)', async () => {
    const conn = Object.assign(new Connection(), { connectionId: 1, name: 'A' });
    (repo.findById as jest.Mock).mockResolvedValue(conn);

    const first = await service.getConnectionById(1);
    const second = await service.getConnectionById(1);

    expect(first).toBe(conn);
    expect(second).toBe(conn);
    expect(repo.findById).toHaveBeenCalledTimes(1);
  });

  it('getConnectionById lanza NotFound si no existe', async () => {
    (repo.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.getConnectionById(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('listCatalog mapea a ConnectionCatalogDto', async () => {
    (repo.findAll as jest.Mock).mockResolvedValue([
      Object.assign(new Connection(), { connectionId: 1, name: 'A' }),
    ]);
    const result = await service.listCatalog();
    expect(result[0]).toBeInstanceOf(ConnectionCatalogDto);
    expect(result[0].connectionId).toBe(1);
  });
});
