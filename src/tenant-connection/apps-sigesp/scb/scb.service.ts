import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../auth/jwt-payload.interface';
import { BancoListaDto } from './dto/banco-lista.dto';
import { PaginacionDto } from '../shared/dto/paginacion.dto';
import { ScbDao } from './dao/scb.dao';

// Reglas de negocio del módulo scb (cuentas bancarias). Orquesta y delega el
// acceso a datos al DAO; no contiene SQL.
@Injectable()
export class ScbService {
  constructor(private readonly scbDao: ScbDao) {}

  // Lista los bancos de la BD de la empresa seleccionada en el login.
  async getBancos(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<BancoListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }
    return this.scbDao.findBancos(user.tenantId, query);
  }
}
