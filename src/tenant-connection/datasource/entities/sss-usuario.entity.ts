import { Entity, PrimaryColumn, Column } from 'typeorm';

// Usuarios del sistema en la BD de la empresa (esquema public)
@Entity({ name: 'sss_usuario', schema: 'public' })
export class SssUsuario {
  @PrimaryColumn({ name: 'codusu', type: 'varchar' })
  codusu: string;

  @Column({ name: 'pwdusu', type: 'text' })
  pwdusu: string;

  @Column({ name: 'estusu', type: 'varchar' })
  estusu: string;

  @Column({ name: 'id_empresa', type: 'int' })
  idEmpresa: number;

  @Column({ name: 'id_personal', type: 'int' })
  idPersonal: number;
}
