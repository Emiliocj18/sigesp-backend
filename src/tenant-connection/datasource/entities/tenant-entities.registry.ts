import { CfgEmpresa } from './cfg-empresa.entity';
import { SnoPersonal } from './sno-personal.entity';
import { SCB_ENTITIES } from '../../queries/scb/entities/scb.entities';
import { SEP_ENTITIES } from '../../queries/sep/entities/sep.entities';
import { SSS_ENTITIES } from '../../queries/sss/entities/sss.entities';

// Registro único de entidades que recibe el DataSource de cada tenant (§7.2 y
// §7.3 de planestructura.md). Entidades de login (§7.5): CfgEmpresa y
// SnoPersonal viven aquí; sss_usuario migró a queries/sss/entities (Fase 2a) y
// entra por el array de su módulo.
export const TENANT_ENTITIES = [
  CfgEmpresa,
  SnoPersonal,
  ...SCB_ENTITIES,
  ...SEP_ENTITIES,
  ...SSS_ENTITIES,
];
