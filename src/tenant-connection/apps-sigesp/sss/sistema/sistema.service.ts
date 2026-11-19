import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { ITenantQueryRunner } from '../../shared/interfaces/tenant-query-runner.interface';
import { SistemaListaDto } from './dto/sistema-lista.dto';

// Reglas de negocio del recurso sistema (menú home). SQL crudo parametrizado
// vía ITenantQueryRunner (B5 reintento); identidad del usuario resuelta del JWT,
// nunca de parámetros del cliente (§7.1 de menu.md).
@Injectable()
export class SistemaService {
  constructor(
    @Inject('ITenantQueryRunner')
    private readonly queryRunner: ITenantQueryRunner,
  ) {}

  // Lista los sistemas activos asignados al usuario del token, ordenados por
  // tipsis y codsis (el orden ya no se hace en el cliente).
  async getSistemas(user: AuthenticatedUser): Promise<SistemaListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }
    if (user.idEmpresa == null) {
      throw new Error('El token no contiene el id de la empresa del usuario');
    }
    return this.queryRunner.query<SistemaListaDto>(
      user.tenantId,
      `SELECT us.id_empresa, us.id_usuario, us.codsis,
              s.nomsis, s.estsis, s.imgsis, s.accsis, s.tipsis
       FROM sss_usuario_sistema us
       INNER JOIN sss_sistema s ON s.codsis = us.codsis
       INNER JOIN sss_usuario u ON u.id_empresa = us.id_empresa
           AND u.id_usuario = us.id_usuario
       WHERE u.codusu = $1
         AND u.id_empresa = $2
         AND s.estsis = '1'
       ORDER BY s.tipsis ASC, us.codsis ASC`,
      [user.username, user.idEmpresa],
    );
  }
}
