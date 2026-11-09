import { Inject, Injectable } from '@nestjs/common';
import { Solicitud } from '../entities/solicitud.entity';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';
import { ITenantRepositoryFactory } from '../../shared/interfaces/tenant-repository-factory.interface';

// Acceso a datos de sep_solicitud vía repositorio TypeORM (sin SQL crudo).
// Devuelve entidades: la traducción estsol → estado es regla de negocio del
// service, no del DAO.
@Injectable()
export class SepDao {
  constructor(
    @Inject('ITenantRepositoryFactory')
    private readonly repositoryFactory: ITenantRepositoryFactory,
  ) {}

  // Lista las solicitudes ordenadas por id con paginación opcional (take/skip, B6).
  async findSolicitudes(
    tenantId: number,
    pag?: PaginacionDto,
  ): Promise<Solicitud[]> {
    return this.repositoryFactory.withRepository(tenantId, Solicitud, (repo) =>
      repo.find({
        order: { idSolicitud: 'ASC' },
        take: pag?.limit,
        skip: pag?.offset,
      }),
    );
  }
}
