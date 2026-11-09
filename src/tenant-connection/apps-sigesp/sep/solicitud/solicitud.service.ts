import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../auth/jwt-payload.interface';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudListaDto } from './dto/solicitud-lista.dto';
import { PaginacionDto } from '../shared/dto/paginacion.dto';
import { ITenantRepositoryFactory } from '../shared/interfaces/tenant-repository-factory.interface';

// Reglas de negocio del módulo sep (solicitudes). Consulta el repositorio
// TypeORM del tenant directamente vía withRepository (B5 + B6); la traducción
// de estado es regla de negocio del módulo.
@Injectable()
export class SepService {
  constructor(
    @Inject('ITenantRepositoryFactory')
    private readonly repositoryFactory: ITenantRepositoryFactory,
  ) {}

  // Lista las solicitudes de la BD de la empresa seleccionada en el login.
  async getSolicitudes(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<SolicitudListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }

    const solicitudes = await this.repositoryFactory.withRepository(
      user.tenantId,
      Solicitud,
      (repo) =>
        repo.find({
          order: { idSolicitud: 'ASC' },
          take: query?.limit,
          skip: query?.offset,
        }),
    );
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
