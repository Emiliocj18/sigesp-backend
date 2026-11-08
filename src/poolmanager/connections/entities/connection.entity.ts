import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

// Entidad que mapea la tabla sigesp_connections de sigesp_db_manager (catálogo de empresas)
@Entity({ name: 'sigesp_connections' })
@Index('idx_sigesp_connections_name', ['name'])
export class Connection {
  @PrimaryColumn({ name: 'connection_id', type: 'int' })
  connectionId: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'database' })
  database: string;

  @Column({ name: 'server' })
  server: string;

  @Column({ name: 'port', type: 'int' })
  port: number;

  @Column({ name: 'login' })
  login: string;

  // Clave de la BD de la empresa (texto plano, segun el diseno solicitado)
  @Column({ name: 'password', type: 'varchar', length: 500, nullable: true })
  password: string | null;

  // 1 = activo, 0 = inactivo (default 0)
  @Column({ type: 'int2', nullable: true, default: 0 })
  active: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
