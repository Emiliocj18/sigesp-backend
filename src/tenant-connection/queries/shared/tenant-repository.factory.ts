import { Injectable } from '@nestjs/common';
import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { DatasourceResolver } from '../../datasource/datasource-resolver.service';
import { isConnectionError } from './is-connection-error';
import { ITenantRepositoryFactory } from './interfaces/tenant-repository-factory.interface';

// Resuelve repositorios TypeORM del DataSource dinámico del tenant en runtime
// (donde TypeOrmModule.forFeature no aplica, ver §7.4 de planestructura.md).
@Injectable()
export class TenantRepositoryFactory implements ITenantRepositoryFactory {
  constructor(private readonly datasourceResolver: DatasourceResolver) {}

  // Camino principal: ejecuta fn(repo) con evict + reintento ante caída de
  // conexión (B5, misma paridad que el runner de SQL crudo).
  async withRepository<E extends ObjectLiteral, T>(
    tenantId: number,
    Entity: EntityTarget<E>,
    fn: (repo: Repository<E>) => Promise<T>,
  ): Promise<T> {
    const run = async () =>
      fn((await this.datasourceResolver.resolve(tenantId)).getRepository(Entity));
    try {
      return await run();
    } catch (err) {
      if (isConnectionError(err)) {
        // Descarta el DataSource cacheado y reintenta una vez (B5).
        this.datasourceResolver.evict(tenantId);
        return await run();
      }
      throw err;
    }
  }

  // Casos simples, sin reintento.
  async getRepository<E extends ObjectLiteral>(
    tenantId: number,
    Entity: EntityTarget<E>,
  ): Promise<Repository<E>> {
    return (await this.datasourceResolver.resolve(tenantId)).getRepository(Entity);
  }
}
