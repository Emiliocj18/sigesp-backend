import { Inject, Injectable } from '@nestjs/common';
import { SssUsuario } from '../entities/sss-usuario.entity';
import { UsuarioListaDto } from '../dto/usuario-lista.dto';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';
import { ITenantRepositoryFactory } from '../../shared/interfaces/tenant-repository-factory.interface';

// Acceso a datos de sss_usuario vía repositorio TypeORM (sin SQL crudo).
@Injectable()
export class SssDao {
  constructor(
    @Inject('ITenantRepositoryFactory')
    private readonly repositoryFactory: ITenantRepositoryFactory,
  ) {}

  // Lista los usuarios ordenados por id con paginación opcional (take/skip, B6).
  async findUsuarios(
    tenantId: number,
    pag?: PaginacionDto,
  ): Promise<UsuarioListaDto[]> {
    const usuarios = await this.repositoryFactory.withRepository(
      tenantId,
      SssUsuario,
      (repo) =>
        repo.find({
          order: { idUsuario: 'ASC' },
          take: pag?.limit,
          skip: pag?.offset,
        }),
    );
    return usuarios.map((usuario) => ({
      idUsuario: usuario.idUsuario,
      codusu: usuario.codusu,
      usuadm: usuario.usuadm,
    }));
  }
}
