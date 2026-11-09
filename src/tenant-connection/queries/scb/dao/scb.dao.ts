import { Inject, Injectable } from '@nestjs/common';
import { Banco } from '../entities/banco.entity';
import { BancoListaDto } from '../dto/banco-lista.dto';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';
import { ITenantRepositoryFactory } from '../../shared/interfaces/tenant-repository-factory.interface';

// Acceso a datos de scb_banco vía repositorio TypeORM (sin SQL crudo).
@Injectable()
export class ScbDao {
  constructor(
    @Inject('ITenantRepositoryFactory')
    private readonly repositoryFactory: ITenantRepositoryFactory,
  ) {}

  // Lista los bancos ordenados por id con paginación opcional (take/skip, B6).
  async findBancos(
    tenantId: number,
    pag?: PaginacionDto,
  ): Promise<BancoListaDto[]> {
    const bancos = await this.repositoryFactory.withRepository(
      tenantId,
      Banco,
      (repo) =>
        repo.find({
          order: { idBanco: 'ASC' },
          take: pag?.limit,
          skip: pag?.offset,
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
