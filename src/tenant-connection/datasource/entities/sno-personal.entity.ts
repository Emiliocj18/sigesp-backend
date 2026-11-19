import { Entity, PrimaryColumn, Column } from 'typeorm';

// Personal en la BD de la empresa (esquema public). Solo se mapean las columnas
// que usan el login y el perfil; el resto (87 en total) pertenece a nómina.
@Entity({ name: 'sno_personal', schema: 'public' })
export class SnoPersonal {
  @PrimaryColumn({ name: 'id_personal', type: 'int' })
  idPersonal: number;

  @Column({ name: 'id_empresa', type: 'int' })
  idEmpresa: number;

  @Column({ name: 'nomper', type: 'varchar' })
  nomper: string;

  @Column({ name: 'apeper', type: 'varchar' })
  apeper: string;

  @Column({ name: 'cedper', type: 'varchar' })
  cedper: string;

  @Column({ name: 'coreleper', type: 'varchar', nullable: true })
  coreleper: string | null;

  // Teléfono editable desde el perfil.
  @Column({ name: 'telmovper', type: 'varchar', nullable: true })
  telmovper: string | null;

  // Teléfono de habitación: dato de nómina, el perfil no lo modifica.
  @Column({ name: 'telhabper', type: 'varchar' })
  telhabper: string;

  @Column({ name: 'fecnacper', type: 'date' })
  fecnacper: string;

  @Column({ name: 'fotper', type: 'varchar', nullable: true })
  fotper: string | null;

  @Column({ name: 'codusu', type: 'varchar', nullable: true })
  codusu: string | null;
}
