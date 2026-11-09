import { Entity, PrimaryColumn, Column } from 'typeorm';

// Bancos de la BD de la empresa (esquema public) — módulo SIGESP scb (tesorería)
@Entity({ name: 'scb_banco', schema: 'public' })
export class Banco {
  @PrimaryColumn({ name: 'id_banco', type: 'int' })
  idBanco: number;

  @Column({ name: 'nomban', type: 'varchar' })
  nomban: string;

  @Column({ name: 'dirban', type: 'varchar' })
  dirban: string;

  @Column({ name: 'codsudeban', type: 'varchar' })
  codsudeban: string;
}
