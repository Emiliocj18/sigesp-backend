import { Entity, PrimaryColumn, Column } from 'typeorm';

// Personal en la BD de la empresa (esquema public)
@Entity({ name: 'sno_personal', schema: 'public' })
export class SnoPersonal {
  @PrimaryColumn({ name: 'id_personal', type: 'int' })
  idPersonal: number;

  @Column({ name: 'nomper', type: 'varchar' })
  nomper: string;

  @Column({ name: 'apeper', type: 'varchar' })
  apeper: string;
}
