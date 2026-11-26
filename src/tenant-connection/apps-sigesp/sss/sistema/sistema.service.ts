import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { ITenantQueryRunner } from '../../shared/interfaces/tenant-query-runner.interface';
import { SistemaListaDto } from './dto/sistema-lista.dto';

type SistemaRow = Omit<SistemaListaDto, 'url'>;

// Convierte SSO_MODULE_URLS ("SSS=http://localhost:4201,SCB=...") en un mapa
// codsis -> url. Una entrada malformada se ignora con warning: nunca debe
// tumbar el arranque ni dejar fuera al resto de los módulos.
export function parseSsoModuleUrls(raw?: string): Map<string, string> {
  const urls = new Map<string, string>();
  if (!raw) return urls;

  for (const entry of raw.split(',')) {
    const value = entry.trim();
    if (!value) continue;

    const separator = value.indexOf('=');
    const code = separator > 0 ? value.slice(0, separator).trim().toUpperCase() : '';
    const url = separator > 0 ? value.slice(separator + 1).trim() : '';

    if (!code || !/^https?:\/\/\S+$/i.test(url)) {
      console.warn(`[SSO] Entrada de SSO_MODULE_URLS ignorada: "${value}"`);
      continue;
    }

    urls.set(code, url);
  }

  return urls;
}

// Reglas de negocio del recurso sistema (menú home). SQL crudo parametrizado
// vía ITenantQueryRunner (B5 reintento); identidad del usuario resuelta del JWT,
// nunca de parámetros del cliente (§7.1 de menu.md).
@Injectable()
export class SistemaService implements OnModuleInit {
  private readonly moduleUrls: Map<string, string>;

  constructor(
    @Inject('ITenantQueryRunner')
    private readonly queryRunner: ITenantQueryRunner,
    config: ConfigService,
  ) {
    this.moduleUrls = parseSsoModuleUrls(config.get<string>('SSO_MODULE_URLS'));
  }

  // Visibilidad operativa: un mapa mal configurado se detecta al arrancar.
  onModuleInit(): void {
    const entries = [...this.moduleUrls.entries()];
    const detail = entries.length
      ? entries.map(([code, url]) => `${code} -> ${url}`).join(', ')
      : '(ninguno)';
    console.log(`[SSO] módulos habilitados: ${detail}`);
  }

  // Lista los sistemas activos asignados al usuario del token, ordenados por
  // tipsis y codsis (el orden ya no se hace en el cliente).
  async getSistemas(user: AuthenticatedUser): Promise<SistemaListaDto[]> {
    if (user.tenantId == null) {
      throw new Error('El token no contiene información de la empresa (tenant)');
    }
    if (user.idEmpresa == null) {
      throw new Error('El token no contiene el id de la empresa del usuario');
    }
    const rows = await this.queryRunner.query<SistemaRow>(
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

    // La URL sale solo del mapa: sin match no hay fallback por accsis.
    return rows.map((row) => ({
      ...row,
      url: this.moduleUrls.get(row.codsis?.trim().toUpperCase()) ?? null,
    }));
  }
}
