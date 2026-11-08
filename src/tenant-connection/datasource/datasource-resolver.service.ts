import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConnectionService } from '../../poolmanager/connections/connection.service';
import { DatasourceService } from './datasource.service';

// Resuelve el DataSource de la empresa (datasource) a partir del token de la petición.
// Reutiliza la conexión cacheada por connectionId (no reconecta en cada request).
@Injectable()
export class DatasourceResolver {
  constructor(
    private readonly connectionService: ConnectionService,
    private readonly datasourceService: DatasourceService,
  ) {}

  // B2: resuelve por solo connectionId (la empresa puede haber sido renombrada).
  async resolve(tenantId: number): Promise<DataSource> {
    const connection = await this.connectionService.getConnectionById(tenantId);
    return this.datasourceService.getDataSource(connection);
  }

  // B5: descarta el DataSource cacheado para forzar una reconexión en el siguiente resolve.
  evict(tenantId: number): void {
    this.datasourceService.evict(tenantId);
  }
}
