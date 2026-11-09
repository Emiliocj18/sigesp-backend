import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

// Abstracción del acceso a repositorios TypeORM del DataSource dinámico del
// tenant (I + D de SOLID). Reemplaza a TypeOrmModule.forFeature, que no aplica
// a datasources creados en runtime (ver §7.4 de planestructura.md).
export interface ITenantRepositoryFactory {
  // Camino principal: ejecuta fn(repo) con evict + reintento ante caída de
  // conexión (B5, paridad con el runner de SQL crudo).
  withRepository<E extends ObjectLiteral, T>(
    tenantId: number,
    Entity: EntityTarget<E>,
    fn: (repo: Repository<E>) => Promise<T>,
  ): Promise<T>;

  // Casos simples, sin reintento: devuelve el repositorio del DataSource resuelto.
  getRepository<E extends ObjectLiteral>(
    tenantId: number,
    Entity: EntityTarget<E>,
  ): Promise<Repository<E>>;
}
