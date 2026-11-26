import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ConnectionService } from '../../poolmanager/connections/connection.service';
import { DatasourceService } from '../datasource/datasource.service';
import { IDatasourcePasswordVerifier } from '../datasource/interfaces/datasource-password-verifier.interface';
import { SssUsuario } from '../apps-sigesp/sss/entities/sss-usuario.entity';
import { CfgEmpresa } from '../datasource/entities/cfg-empresa.entity';
import { SnoPersonal } from '../datasource/entities/sno-personal.entity';
import { ConexDto } from './dto/conex.dto';
import { UsuarioConectadoDto } from './dto/usuario-conectado.dto';
import { JwtPayload } from '../../auth/jwt-payload.interface';
import { TokenIssuerService } from '../../auth/token-issuer.service';

// Logica de login multitenant: orquesta connections + tenant
@Injectable()
export class LoginService {
  constructor(
    private readonly connectionService: ConnectionService,
    private readonly datasourceService: DatasourceService,
    @Inject('IDatasourcePasswordVerifier')
    private readonly datasourcePasswordVerifier: IDatasourcePasswordVerifier,
    private readonly tokenIssuer: TokenIssuerService,
  ) {}

  async login(
    dto: ConexDto,
  ): Promise<{ access_token: string; refresh_token: string; usuario: UsuarioConectadoDto }> {
    try {
      // (1) Confirma que la empresa existe(devuelve parametros para conexión)
      const conn = await this.connectionService.getConnectionById(dto.connectionId);

      // (2) Abre/cachea el DataSource a la BD de la empresa(También crea la conexión en caso de que no exista)
      const ds = await this.datasourceService.getDataSource(conn);

      // (3) Busca el usuario con JOIN a empresa y personal
      const row = await ds
        .getRepository(SssUsuario)
        .createQueryBuilder('u')
        .leftJoin(CfgEmpresa, 'e', 'e.id_empresa = u.id_empresa')
        .leftJoin(SnoPersonal, 'p', 'p.id_personal = u.id_personal')
        .select('u.codusu', 'codusu')
        .addSelect('u.pwdusu', 'pwdusu')
        .addSelect('u.estusu', 'estusu')
        .addSelect('u.id_usuario', 'idUsuario')
        .addSelect('u.id_empresa', 'idEmpresa')
        .addSelect('u.id_personal', 'idPersonal')
        .addSelect('e.nomemp', 'nomemp')
        .addSelect('p.nomper', 'nomper')
        .addSelect('p.apeper', 'apeper')
        .where('u.codusu = :username', { username: dto.username })
        .getRawOne();

      // (4) Usuario inexistente o inactivo
      if (!row || row.estusu !== '1') {
        throw new UnauthorizedException('Usuario no registrado');
      }

      // (5) Verifica la clave contra la BD de la empresa
      let valid = false;
      try {
        valid = await this.datasourcePasswordVerifier.verify(dto.password, row.pwdusu);
      } catch {
        valid = false;
      }
      if (!valid) {
        throw new UnauthorizedException('Clave invalida!');
      }

      // (6) Creo el payload con la info de la base de datos
      const payload: JwtPayload = {
        sub: row.idPersonal ?? row.codusu,
        username: row.codusu,
        tenantId: conn.connectionId,
        tenantName: conn.name,
        empresaNombre: row.nomemp?.trim() || conn.name,
        idUsuario: row.idUsuario,
        idEmpresa: row.idEmpresa,
        idPersonal: row.idPersonal,
        nombre: row.nomper ?? '',
        apellido: row.apeper ?? '',
      };

      // A5: emisión común (access 15m + refresh 7d) con el perfil sin conexionDB
      return this.tokenIssuer.issueTokens(payload);
    } catch (err) {
      console.error('[LoginService.login]', err);
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        `Error en login de empresa: ${err?.message ?? 'desconocido'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
