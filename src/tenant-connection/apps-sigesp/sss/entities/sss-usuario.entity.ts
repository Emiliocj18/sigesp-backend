import { Entity, PrimaryColumn, Column } from 'typeorm';

// Usuarios del sistema en la BD de la empresa (esquema public) — módulo SIGESP
// sss (seguridad). Entidad compartida: el listado /queries/sss/usuarios usa
// idUsuario y usuadm; el login usa codusu/pwdusu/estusu/id_empresa/id_personal.
@Entity({ name: 'sss_usuario', schema: 'public' })
export class SssUsuario {
  @PrimaryColumn({ name: 'codusu', type: 'varchar' })
  codusu: string;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario: number;

  @Column({ name: 'usuadm', type: 'int' })
  usuadm: number;

  @Column({ name: 'pwdusu', type: 'text' })
  pwdusu: string;

  @Column({ name: 'estusu', type: 'varchar' })
  estusu: string;

  @Column({ name: 'id_empresa', type: 'int' })
  idEmpresa: number;

  @Column({ name: 'id_personal', type: 'int' })
  idPersonal: number;
}
