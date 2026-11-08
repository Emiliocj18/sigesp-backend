import { Test } from '@nestjs/testing';
import { DatasourceService } from './datasource.service';
import { Connection } from '../../poolmanager/connections/entities/connection.entity';

// Reemplaza solo DataSource por un fake; el resto de exports de typeorm quedan reales
// (las entidades usan decoradores @Entity/@Column que deben funcionar).
jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return new Proxy(actual, {
    get: (target, prop) => {
      if (prop === 'DataSource') {
        return jest.fn().mockImplementation(() => ({
          isInitialized: true,
          initialize: jest.fn().mockResolvedValue(undefined),
          query: jest.fn(),
          destroy: jest.fn().mockResolvedValue(undefined),
        }));
      }
      return target[prop as string];
    },
  });
});

describe('DatasourceService', () => {
  let service: DatasourceService;
  const conn = Object.assign(new Connection(), {
    connectionId: 1,
    server: 'h',
    port: 5432,
    login: 'u',
    password: 'p',
    database: 'd',
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [DatasourceService],
    }).compile();
    service = moduleRef.get(DatasourceService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  // B3: el cache devuelve la misma instancia en llamadas sucesivas.
  it('getDataSource cachea por connectionId (no recrea el DataSource)', async () => {
    const ds1 = await service.getDataSource(conn);
    const ds2 = await service.getDataSource(conn);
    expect(ds1).toBe(ds2);
  });

  // B5: evict destruye y fuerza una nueva conexión en el siguiente resolve.
  it('evict descarta el DataSource y crea uno nuevo al reconectar', async () => {
    const ds = await service.getDataSource(conn);
    service.evict(1);
    const dsNew = await service.getDataSource(conn);
    expect(dsNew).not.toBe(ds);
  });
});
