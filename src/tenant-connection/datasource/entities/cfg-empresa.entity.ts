import { Entity, PrimaryColumn, Column } from 'typeorm';

// Empresas en la BD de la empresa (esquema public)
@Entity({ name: 'cfg_empresa', schema: 'public' })
export class CfgEmpresa {
  @PrimaryColumn({ name: 'id_empresa', type: 'int' })
  idEmpresa: number;

  @Column({ name: 'nomemp', type: 'varchar' })
  nomemp: string;
}
