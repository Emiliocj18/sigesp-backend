import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../auth/jwt-payload.interface';
import { UsuarioListaDto } from './dto/usuario-lista.dto';
import { PaginacionDto } from '../shared/dto/paginacion.dto';
import { SssDao } from './dao/sss.dao';

// Reglas de negocio del módulo sss (seguridad). Orquesta y delega el acceso a
// datos al DAO; no contiene SQL.
@Injectable()
export class SssService {
  constructor(private readonly sssDao: SssDao) {}

  // Lista los usuarios de la BD de la empresa seleccionada en el login.
  async getUsuarios(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<UsuarioListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }
    return this.sssDao.findUsuarios(user.tenantId, query);
  }
}
