import { Entity, PrimaryColumn, Column } from 'typeorm';

// Solicitudes de ejecución presupuestaria de la BD de la empresa — módulo SIGESP sep
@Entity({ name: 'sep_solicitud', schema: 'public' })
export class Solicitud {
  @PrimaryColumn({ name: 'id_solicitud', type: 'int' })
  idSolicitud: number;

  @Column({ name: 'consol', type: 'varchar' })
  consol: string;

  @Column({ name: 'montot', type: 'numeric' })
  montot: number;

  @Column({ name: 'estsol', type: 'varchar' })
  estsol: string;
}
