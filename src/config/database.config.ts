import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Lee una variable de entorno obligatoria o lanza un error claro en arranque
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable de entorno ${key} no esta definida`);
  }
  return value;
};

// Configuracion de conexion a la base de datos sigesp_db_manager (desde variables de entorno)
export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: required('DB_PASSWORD'),
  database: process.env.DB_NAME || 'sigesp_db_manager',
  autoLoadEntities: true,
  synchronize: false,
  logging: false,
});
