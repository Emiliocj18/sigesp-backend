import { Injectable } from '@nestjs/common';
import { DatasourceResolver } from '../datasource/datasource-resolver.service';
import { AuthenticatedUser } from '../../auth/jwt-payload.interface';
import { UsuarioListaDto } from './dto/usuario-lista.dto';
import { BancoListaDto } from './dto/banco-lista.dto';
import { SolicitudListaDto } from './dto/solicitud-lista.dto';
import { PaginacionDto } from './dto/paginacion.dto';

// Servicio protegido que consulta la BD de la empresa del token.
@Injectable()
export class TenantService {
  constructor(private readonly datasourceResolver: DatasourceResolver) {}

  // Lista los usuarios de la BD de la empresa seleccionada en el login.
  async getUsuarios(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<UsuarioListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }

    const rows = await this.runTenantQuery(
      user.tenantId,
      'SELECT id_usuario, codusu, usuadm FROM sss_usuario ORDER BY id_usuario ASC',
      query,
    );

    return rows.map((r: Record<string, unknown>) => ({
      idUsuario: r.id_usuario as number,
      codusu: r.codusu as string,
      usuadm: r.usuadm as number,
    }));
  }

  // Lista los bancos de la BD de la empresa seleccionada en el login.
  async getBancos(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<BancoListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }

    const rows = await this.runTenantQuery(
      user.tenantId,
      'SELECT id_banco, nomban, dirban, codsudeban FROM scb_banco ORDER BY id_banco ASC',
      query,
    );

    return rows.map((r: Record<string, unknown>) => ({
      idBanco: r.id_banco as number,
      nomban: r.nomban as string,
      dirban: r.dirban as string,
      codsudeban: r.codsudeban as string,
    }));
  }

  // Lista las solicitudes de la BD de la empresa seleccionada en el login.
  async getSolicitudes(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<SolicitudListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }

    const rows = await this.runTenantQuery(
      user.tenantId,
      'SELECT id_solicitud, consol, montot, estsol FROM sep_solicitud ORDER BY id_solicitud ASC',
      query,
    );

    return rows.map((r: Record<string, unknown>) => ({
      idSolicitud: r.id_solicitud as number,
      consol: r.consol as string,
      montot: r.montot as number,
      estado: this.mapEstado(r.estsol as string),
    }));
  }

  // Ejecuta SQL contra el DataSource del tenant con reintento ante caída de conexión (B5).
  // Aplica paginación opcional de forma parametrizada (B6, sin concatenar el input del usuario).
  private async runTenantQuery(
    tenantId: number,
    sql: string,
    query?: PaginacionDto,
  ): Promise<unknown[]> {
    const params: unknown[] = [];
    let suffix = '';
    if (query?.limit != null) {
      suffix += ` LIMIT $${params.push(query.limit)}`;
      if (query.offset != null) {
        suffix += ` OFFSET $${params.push(query.offset)}`;
      }
    }

    const dataSource = await this.datasourceResolver.resolve(tenantId);
    try {
      return await dataSource.query(sql + suffix, params); //Intenta la consulta 
    } catch (err) {
      // Si la conexión al tenant cayó, descarta el DataSource y reintenta una vez.
      if (this.isConnectionError(err)) { //si es error de conaxión manda a eliminar la tenant del cache
        this.datasourceResolver.evict(tenantId);
        const retried = await this.datasourceResolver.resolve(tenantId); //intenta reconectar la bd nuevamente
        return await retried.query(sql + suffix, params); //retoma la consulta
      }
      throw err;
    }
  }

  // Detecta errores de nivel de conexión (no errores de SQL) para decidir el reintento (B5).
  private isConnectionError(err: unknown): boolean {
    const code = (err as { code?: string })?.code;
    const message = (err as { message?: string })?.message ?? '';
    return (
      code === 'ECONNRESET' ||
      code === 'EPIPE' ||
      code === 'ETIMEDOUT' ||
      code === '57P01' || // admin shutdown
      code === '57P02' || // crash shutdown
      code === '08000' ||
      code === '08003' ||
      code === '08006' ||
      code === '08001' ||
      code === '08004' ||
      /connection.*(terminated|closed|reset)|terminating connection/i.test(message)
    );
  }

  // Traduce el código de estado (estsol) a texto legible.
  private mapEstado(cod: string): string {
    switch (cod) {
      case 'E':
        return 'Emitida';
      case 'A':
        return 'Anulada';
      case 'P':
        return 'Procesada';
      case 'C':
        return 'Contabilizada';
      default:
        return cod ?? 'Desconocido';
    }
  }
}
