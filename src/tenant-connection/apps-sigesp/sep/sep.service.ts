import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../auth/jwt-payload.interface';
import { SolicitudListaDto } from './dto/solicitud-lista.dto';
import { PaginacionDto } from '../shared/dto/paginacion.dto';
import { SepDao } from './dao/sep.dao';

// Reglas de negocio del módulo sep (solicitudes). Orquesta y delega el acceso a
// datos al DAO; la traducción de estado es regla de negocio del módulo.
@Injectable()
export class SepService {
  constructor(private readonly sepDao: SepDao) {}

  // Lista las solicitudes de la BD de la empresa seleccionada en el login.
  async getSolicitudes(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<SolicitudListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }

    const solicitudes = await this.sepDao.findSolicitudes(user.tenantId, query);
    return solicitudes.map((solicitud) => ({
      idSolicitud: solicitud.idSolicitud,
      consol: solicitud.consol,
      montot: solicitud.montot,
      estado: this.mapEstado(solicitud.estsol),
    }));
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
