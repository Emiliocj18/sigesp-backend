import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { SssUsuario } from '../entities/sss-usuario.entity';
import { UsuarioListaDto } from './dto/usuario-lista.dto';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';
import { ITenantRepositoryFactory } from '../../shared/interfaces/tenant-repository-factory.interface';

// Reglas de negocio del recurso usuario (sss_usuario). Consulta el repositorio
// TypeORM del tenant directamente vía withRepository (B5 reintento + B6 paginación).
@Injectable()
export class UsuarioService {
  constructor(
    @Inject('ITenantRepositoryFactory')
    private readonly repositoryFactory: ITenantRepositoryFactory,
  ) {}

  // Lista los usuarios de la BD de la empresa seleccionada en el login.
  async getUsuarios(
    user: AuthenticatedUser,
    query?: PaginacionDto,
  ): Promise<UsuarioListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }
    const usuarios = await this.repositoryFactory.withRepository(
      user.tenantId,
      SssUsuario,
      (repo) =>
        repo.find({
          order: { idUsuario: 'ASC' },
          take: query?.limit,
          skip: query?.offset,
        }),
    );
    return usuarios.map((usuario) => ({
      idUsuario: usuario.idUsuario,
      codusu: usuario.codusu,
      usuadm: usuario.usuadm,
    }));
  }
}
