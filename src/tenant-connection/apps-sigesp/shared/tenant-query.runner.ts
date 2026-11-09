import { Injectable } from '@nestjs/common';
import { DatasourceResolver } from '../../datasource/datasource-resolver.service';
import { PaginacionDto } from './dto/paginacion.dto';
import { isConnectionError } from './is-connection-error';
import { ITenantQueryRunner } from './interfaces/tenant-query-runner.interface';

// Ejecuta SQL crudo contra el DataSource del tenant con reintento ante caída
// de conexión (B5) y paginación parametrizada (B6, sin concatenar el input del
// usuario). Convive con la fábrica de repositorios para consultas legacy.
@Injectable()
export class TenantQueryRunner implements ITenantQueryRunner {
  constructor(private readonly datasourceResolver: DatasourceResolver) {}

  async query<T = unknown>(
    tenantId: number,
    sql: string,
    params: unknown[] = [],
    pag?: PaginacionDto,
  ): Promise<T[]> {
    const allParams = [...params];
    let suffix = '';
    if (pag?.limit != null) {
      suffix += ` LIMIT $${allParams.push(pag.limit)}`;
      if (pag?.offset != null) {
        suffix += ` OFFSET $${allParams.push(pag.offset)}`;
      }
    }

    const dataSource = await this.datasourceResolver.resolve(tenantId);
    try {
      return (await dataSource.query(sql + suffix, allParams)) as T[];
    } catch (err) {
      // Si la conexión al tenant cayó, descarta el DataSource y reintenta una vez.
      if (isConnectionError(err)) {
        this.datasourceResolver.evict(tenantId);
        const retried = await this.datasourceResolver.resolve(tenantId);
        return (await retried.query(sql + suffix, allParams)) as T[];
      }
      throw err;
    }
  }
}
