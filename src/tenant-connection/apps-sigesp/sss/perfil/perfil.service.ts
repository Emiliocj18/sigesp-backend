import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { SnoPersonal } from '../../../datasource/entities/sno-personal.entity';
import { ITenantQueryRunner } from '../../shared/interfaces/tenant-query-runner.interface';
import { ITenantRepositoryFactory } from '../../shared/interfaces/tenant-repository-factory.interface';
import { PerfilDto } from './dto/perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

// Perfil del usuario autenticado: lee sss_usuario + sno_personal y solo
// actualiza telmovper y coreleper. Nunca toca sss_usuario ni telhabper.
@Injectable()
export class PerfilService {
  constructor(
    @Inject('ITenantQueryRunner')
    private readonly queryRunner: ITenantQueryRunner,
    @Inject('ITenantRepositoryFactory')
    private readonly repositoryFactory: ITenantRepositoryFactory,
  ) {}

  async getPerfil(user: AuthenticatedUser): Promise<PerfilDto> {
    const perfil = await this.findPerfil(user);
    if (!perfil) {
      throw new NotFoundException('Usuario no encontrado en la empresa');
    }
    if (!perfil.idPersonal) {
      throw new BadRequestException(
        'El usuario no tiene ficha de personal asociada',
      );
    }
    return perfil;
  }

  async updatePerfil(
    user: AuthenticatedUser,
    dto: UpdatePerfilDto,
  ): Promise<PerfilDto> {
    if (dto.telefono === undefined && dto.email === undefined) {
      throw new BadRequestException('No hay campos para actualizar');
    }

    // Valida existencia y obtiene el id de la ficha antes de escribir.
    const actual = await this.getPerfil(user);

    const patch: Partial<SnoPersonal> = {};
    if (dto.telefono !== undefined) patch.telmovper = dto.telefono;
    if (dto.email !== undefined) patch.coreleper = dto.email;

    await this.repositoryFactory.withRepository(
      user.tenantId as number,
      SnoPersonal,
      (repo) =>
        repo.update(
          { idPersonal: actual.idPersonal, idEmpresa: actual.idEmpresa },
          patch,
        ),
    );

    return this.getPerfil(user);
  }

  // Devuelve null si el usuario no existe; idPersonal = 0 si no tiene ficha.
  private async findPerfil(
    user: AuthenticatedUser,
  ): Promise<PerfilDto | null> {
    if (user.tenantId == null) {
      throw new BadRequestException(
        'El token no contiene información de la empresa (tenant)',
      );
    }
    if (user.idEmpresa == null) {
      throw new BadRequestException(
        'El token no contiene el id de la empresa del usuario',
      );
    }

    const rows = await this.queryRunner.query<PerfilDto>(
      user.tenantId,
      `SELECT u.id_usuario AS "idUsuario",
              u.id_empresa AS "idEmpresa",
              u.id_personal AS "idPersonal",
              u.codusu AS "codusu",
              p.nomper AS "nombre",
              p.apeper AS "apellido",
              p.cedper AS "cedula",
              p.coreleper AS "email",
              p.telmovper AS "telefono",
              p.telhabper AS "telefonoHabitacion",
              to_char(p.fecnacper, 'YYYY-MM-DD') AS "fechaNacimiento",
              p.fotper AS "foto"
         FROM sss_usuario u
         LEFT JOIN sno_personal p ON p.id_personal = u.id_personal
        WHERE u.codusu = $1
          AND u.id_empresa = $2`,
      [user.username, user.idEmpresa],
    );

    return rows[0] ?? null;
  }
}
