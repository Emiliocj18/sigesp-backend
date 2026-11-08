// Migración idempotente para sigesp_db_manager.
// Adapta las tablas de `public` al modelo solicitado (estilo public2),
// conservando los registros existentes. No crea un esquema public2 separado.
//
// Uso: node scripts/db-restructure.js
// (lee la configuración desde .env o usa los valores por defecto)

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Cargar .env manualmente (sin dependencias extra)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'jesus1227',
  database: process.env.DB_NAME || 'sigesp_db_manager',
};

const statements = [
  // 1. sigesp_admin: renombrar password_hash -> password si existe
  `DO $$ BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name='sigesp_admin' AND column_name='password_hash'
     ) THEN
       ALTER TABLE public.sigesp_admin RENAME COLUMN password_hash TO password;
     END IF;
   END $$;`,

  // 2. sigesp_admin: asegurar tipo y NOT NULL de password
  `ALTER TABLE public.sigesp_admin ALTER COLUMN password TYPE VARCHAR(255);`,
  `ALTER TABLE public.sigesp_admin ALTER COLUMN password SET NOT NULL;`,

  // 3. sigesp_admin: agregar active
  `ALTER TABLE public.sigesp_admin ADD COLUMN IF NOT EXISTS active INT2 DEFAULT 0;`,

  // 4. sigesp_admin: restricciones (AK unicos y check de active)
  `ALTER TABLE public.sigesp_admin DROP CONSTRAINT IF EXISTS CKC_ACTIVE_SIGESP_A;`,
  `ALTER TABLE public.sigesp_admin ADD CONSTRAINT CKC_ACTIVE_SIGESP_A
     CHECK (active IS NULL OR active IN (0,1));`,
  `ALTER TABLE public.sigesp_admin DROP CONSTRAINT IF EXISTS AK_KEY_2_SIGESP_A;`,
  `ALTER TABLE public.sigesp_admin ADD CONSTRAINT AK_KEY_2_SIGESP_A UNIQUE (username);`,
  `ALTER TABLE public.sigesp_admin DROP CONSTRAINT IF EXISTS AK_KEY_3_SIGESP_A;`,
  `ALTER TABLE public.sigesp_admin ADD CONSTRAINT AK_KEY_3_SIGESP_A UNIQUE (email);`,

  // 5. sigesp_admin: fijar contraseña plana en registros existentes
  `UPDATE public.sigesp_admin SET password = 'jesus1227' WHERE password IS DISTINCT FROM 'jesus1227';`,

  // 6. sigesp_connections: agregar password
  `ALTER TABLE public.sigesp_connections ADD COLUMN IF NOT EXISTS password VARCHAR(500);`,

  // 7. sigesp_connections: agregar active
  `ALTER TABLE public.sigesp_connections ADD COLUMN IF NOT EXISTS active INT2 DEFAULT 0;`,

  // 8. sigesp_connections: indice por name
  `CREATE INDEX IF NOT EXISTS idx_sigesp_connections_name ON public.sigesp_connections (name);`,

  // 9. sigesp_connections: fijar password plano en registros existentes
  `UPDATE public.sigesp_connections SET password = 'jesus1227' WHERE password IS DISTINCT FROM 'jesus1227';`,

  // 10. funcion set_updated_at (corrige el DDL original: RETURN NEW + LANGUAGE)
  `CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
   BEGIN
     NEW.updated_at = now();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;`,

  // 11. triggers updated_at en ambas tablas
  `DROP TRIGGER IF EXISTS trg_sigesp_admin_updated_at ON public.sigesp_admin;`,
  `CREATE TRIGGER trg_sigesp_admin_updated_at BEFORE UPDATE ON public.sigesp_admin
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();`,
  `DROP TRIGGER IF EXISTS trg_sigesp_connections_updated_at ON public.sigesp_connections;`,
  `CREATE TRIGGER trg_sigesp_connections_updated_at BEFORE UPDATE ON public.sigesp_connections
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();`,
];

async function inspect(client, table) {
  const res = await client.query(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1
     ORDER BY ordinal_position`,
    [table],
  );
  return res.rows;
}

async function main() {
  const client = new Client(config);
  await client.connect();
  console.log(`Conectado a ${config.database} en ${config.host}:${config.port}`);

  console.log('\n== ANTES ==');
  console.log('sigesp_admin:', await inspect(client, 'sigesp_admin'));
  console.log('sigesp_connections:', await inspect(client, 'sigesp_connections'));

  for (const [i, sql] of statements.entries()) {
    try {
      await client.query(sql);
      console.log(`OK  [${i + 1}/${statements.length}]`);
    } catch (err) {
      console.error(`ERR [${i + 1}/${statements.length}]`, err.message);
      // Continuamos con el resto (la mayoría es idempotente);
      // los errores esperados (ej. tabla inexistente) se reportan arriba.
    }
  }

  console.log('\n== DESPUÉS ==');
  console.log('sigesp_admin:', await inspect(client, 'sigesp_admin'));
  console.log('sigesp_connections:', await inspect(client, 'sigesp_connections'));

  await client.end();
  console.log('\nMigración finalizada.');
}

main().catch((e) => {
  console.error('Fallo la migración:', e);
  process.exit(1);
});
