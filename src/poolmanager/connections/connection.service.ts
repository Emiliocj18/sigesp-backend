import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { Connection } from './entities/connection.entity';
import { ConnectionRepository } from './providers/connection.repository';
import { ConnectionCatalogDto } from './dto/connection-catalog.dto';

// Entrada de caché de conexiones por connectionId (B4).
interface ConnectionCacheEntry {
  conn: Connection;
  expiresAt: number;
}

// TTL de la caché de conexiones (evita consultar sigesp_connections en cada request). 5 min
const CONNECTION_CACHE_TTL_MS = 5 * 60 * 1000;

// Logica de negocio del catalogo de empresas (connections)
@Injectable()
export class ConnectionService implements OnModuleDestroy {
  private readonly cache = new Map<number, ConnectionCacheEntry>();
  private readonly cleanup = setInterval(
    () => this.clearExpiredCache(),
    CONNECTION_CACHE_TTL_MS,
  );

  constructor(private readonly connectionRepository: ConnectionRepository) {}

  // B2/B4: resolución por solo id (la empresa puede haber sido renombrada) con caché
  // en memoria (TTL CONNECTION_CACHE_TTL_MS). Usado en login y en el resolver de /tenant/*.
  async getConnectionById(connectionId: number): Promise<Connection> {
    const cached = this.cache.get(connectionId); //verifica que exista un registro con ese id en cache
    if (cached && cached.expiresAt > Date.now()) {//Si cache no esta undefined y mientras expiresAt sea mayor a Date.now()
      return cached.conn; 
    }
    const conn = await this.connectionRepository.findById(connectionId);
    if (!conn) {
      throw new NotFoundException('La empresa (conexion) no existe');
    }
    this.cache.set(connectionId, { conn, expiresAt: Date.now() + CONNECTION_CACHE_TTL_MS });
    return conn;
  }

  // Catálogo público del login: solo connectionId + name (sin datos de infraestructura)
  async listCatalog(): Promise<ConnectionCatalogDto[]> {
    const connections = await this.connectionRepository.findAll();
    return connections.map(
      (c) => new ConnectionCatalogDto({ connectionId: c.connectionId, name: c.name }),
    );
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [id, entry] of this.cache) {
      if (entry.expiresAt <= now) this.cache.delete(id);
    }
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanup);
    this.cache.clear();
  }
}
