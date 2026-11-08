import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Connection } from '../../poolmanager/connections/entities/connection.entity';
import { SssUsuario } from './entities/sss-usuario.entity';
import { CfgEmpresa } from './entities/cfg-empresa.entity';
import { SnoPersonal } from './entities/sno-personal.entity';
import { throwDbConnectionError } from '../../shared/errors/database-error';

// B3: límites del pool y de la caché de DataSources.
const MAX_DATA_SOURCES = 50;
const DATA_SOURCE_IDLE_MS = 30 * 60 * 1000; // 30 min sin uso -> se descarta
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // cada 10 min

interface DatasourceCacheEntry {
  dataSource: DataSource;
  lastUsedAt: number;
}

// Fabrica de DataSources dinamicos por empresa (datasource), con cache por connectionId.
@Injectable()
export class DatasourceService implements OnModuleDestroy {
  private readonly cache = new Map<number, DatasourceCacheEntry>();
  private readonly cleanup = setInterval(() => this.destroyIdle(), CLEANUP_INTERVAL_MS); // setinterval 'funcion nativa de js' setInterval(callback, ms) y entrega un id_temporizador solo la 1era vez que se ejecuta 

  // Abre (o reutiliza del cache) un DataSource contra la BD de la empresa indicada.
  // La contrasena se toma de la tabla sigesp_connections (conn.password), no del .env.
  async getDataSource(conn: Connection): Promise<DataSource> {
    const cached = this.cache.get(conn.connectionId); //verfica que el idconn exista en el cache sino queda undefined
    if (cached?.dataSource.isInitialized) { //La lastUsedAt se refresca en cada consulta a la bd, al estrar a este if
      cached.lastUsedAt = Date.now();
      return cached.dataSource;
    }

    const dataSource = new DataSource({
      type: 'postgres',
      host: conn.server,
      port: conn.port,
      username: conn.login,
      password: conn.password ?? '',
      database: conn.database,
      entities: [SssUsuario, CfgEmpresa, SnoPersonal],
      synchronize: false,
      // B3: pool de conexiones acotado para no agotar los sockets de la BD del tenant.
      extra: {
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    });

    try {
      await dataSource.initialize();
    } catch (err) {
      throwDbConnectionError(`Datasource(${conn.name ?? conn.connectionId})`, err);
    }

    this.evictIfNeeded();
    this.cache.set(conn.connectionId, { dataSource, lastUsedAt: Date.now() });
    return dataSource;
  }

  // B5: elimina el DataSource cacheado de una empresa para forzar reconexión.
  evict(connectionId: number): void {
    const entry = this.cache.get(connectionId);
    if (entry?.dataSource.isInitialized) {
      void entry.dataSource.destroy(); //Libera la conexión
    }
    this.cache.delete(connectionId); //Elimmina del cache
  }

  // B3: si se supera el máximo, elimina el DataSource menos usado recientemente.
  private evictIfNeeded(): void {
    if (this.cache.size <= MAX_DATA_SOURCES) return; //Se verifica que el cache no supere el limite de registros 'MAX_DATA_SOURCES'
    let oldestId: number | null = null;
    let oldestTime = Infinity;
    for (const [id, entry] of this.cache) { //Recorre todo el cache y consigue al registro con mas tiempo inactivo
      if (entry.lastUsedAt < oldestTime) {
        oldestTime = entry.lastUsedAt;
        oldestId = id;
      }
    }
    if (oldestId != null) {
      this.evict(oldestId); //Pasas el id del registro con mayor tiempo inactivo para eliminarlo
    }
  }

  // B3: cierra los DataSources sin uso prolongado para liberar conexiones.
  private destroyIdle(): void {
    const now = Date.now();
    for (const [id, entry] of this.cache) { //Recorre el cache y elimina el registro que tenga mas de 30min sin uso
      if (now - entry.lastUsedAt > DATA_SOURCE_IDLE_MS) {
        this.evict(id);
      }
    }
  }

  // Cierra todos los DataSources al apagar para evitar fugas de conexiones
  async onModuleDestroy(): Promise<void> {
    clearInterval(this.cleanup);
    for (const entry of this.cache.values()) {// Recorre cache y elimina las conexiones y despues limpia el cache
      if (entry.dataSource.isInitialized) {
        await entry.dataSource.destroy();
      }
    }
    this.cache.clear();
  }
}
