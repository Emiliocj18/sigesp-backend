import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { Banco } from '../entities/banco.entity';
import { BancoListaDto } from './dto/banco-lista.dto';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';
import { ITenantRepositoryFactory } from '../../shared/interfaces/tenant-repository-factory.interface';

// Reglas de negocio del recurso banco (scb_banco). Consulta el repositorio
// TypeORM del tenant directamente vía withRepository (B5 reintento + B6 paginación).
@Injectable()
export class BancoService {
  constructor(
    @Inject('ITenantRepositoryFactory')
    private readonly repositoryFactory: ITenantRepositoryFactory,
  ) {}

  // Lista los bancos de la BD de la empresa seleccionada en el login.
  async getBancos(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<BancoListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }
    const bancos = await this.repositoryFactory.withRepository( //Paso el id de la bd a la que me conecte, la entidad que deseo usar y la (función/Consulta) que voy a ejecutar y el me devuelve el resultado
      user.tenantId,
      Banco,
      (repo) =>
        repo.find({
          order: { idBanco: 'ASC' },
          take: query?.limit,
          skip: query?.offset,
        }),
    );
    return bancos.map((banco) => ({
      idBanco: banco.idBanco,
      nomban: banco.nomban,
      dirban: banco.dirban,
      codsudeban: banco.codsudeban,
    }));
  }
}
