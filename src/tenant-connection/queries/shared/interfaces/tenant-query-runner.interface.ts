import { PaginacionDto } from '../dto/paginacion.dto';

// Abstracción del ejecutor de SQL crudo contra la BD del tenant (I + D de SOLID).
// Camino legacy para consultas muy específicas; el camino principal es la
// fábrica de repositorios (ITenantRepositoryFactory).
export interface ITenantQueryRunner {
  // Ejecuta SQL parametrizado sobre el DataSource de la empresa indicada,
  // con paginación opcional (B6) y reintento ante caída de conexión (B5).
  query<T = unknown>(
    tenantId: number,
    sql: string,
    params?: unknown[],
    pag?: PaginacionDto,
  ): Promise<T[]>;
}
