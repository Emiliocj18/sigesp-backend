# AGENTS.md

NestJS (TypeScript) backend for managing users in the external `sigesp_db_manager` database. Uses PostgreSQL via TypeORM, Passport/JWT auth, and bcrypt for password hashing.

## Commands

- `npm run start:dev` — watch mode dev server on port 3000
- `npm run build` — compile to `dist/` (`nest build`)
- `npm test` — run all tests (Jest, `rootDir: src`)
- `npm run lint` — ESLint with `--fix` (auto-applies fixes; runs on `src/**/*.ts`)

Run a single spec by name (Jest regex over `src`):

- `npx jest auth.service.spec`
- `npx jest user.service.spec`

## Critical gotchas

- TypeORM `synchronize: false` (src/config/database.config.ts:21). The app does **not** create or alter tables. The `sigesp_db_manager` database and its `sigesp_admin` table must already exist; there are no migrations in this repo. Schema changes must happen outside the app.
- Entities map to an existing external table with non-default column names: `sigesp_admin` (`id_admin`, `password`, `active`, `created_at`, `updated_at`) and `sigesp_connections` (`connection_id`, `password`, `active`, ...). Do not assume snake_case columns match property names.
- **Passwords in `sigesp_admin` are stored in plaintext** (design decision); `sigesp_connections.password` holds the tenant DB password in plaintext too. The shared `IPasswordHasher` is **hybrid**: `hash()` returns the text as-is, and `compare()` uses bcrypt only when the stored value starts with `$2` (tenant `sss_usuario` hashes); otherwise it does plain equality. Do not "fix" this to always bcrypt without revisiting the DB columns.
- `DB_PASSWORD` (and `JWT_SECRET`) are required at boot; missing them throws on startup (src/config/database.config.ts:4). Copy `.env.example` to `.env` and fill them.
- `CORS_ORIGIN` is a comma-separated list; an empty value allows **any** origin (intended for dev only) (src/main.ts:15).
- Global `ValidationPipe({ whitelist: true, transform: true })`: unknown DTO fields are silently stripped, not rejected (src/main.ts:21).

## Conventions

- JWT security infrastructure is **global** and lives at the project root in `src/auth/` (`@Global() JwtAuthModule`: `jwt.strategy.ts`, `jwt-auth.guard.ts`, `jwt-auth.module.ts`, `jwt-payload.interface.ts`). It is imported once in `AppModule` and is available app-wide — do **not** import it into feature modules.
- The administrator login (specific to the `sigesp_db_manager` DB) is its own cohesive feature module in `src/poolmanager/logadmin/` (`LogadminModule`: `logadmin.controller.ts`, `logadmin.service.ts`, `logadmin.module.ts`, `dto/logadmin.dto.ts`). It signs JWTs using the global `JwtAuthModule`.
- `UsersModule` (`src/poolmanager/users/`) is flattened: `users.controller.ts`, `users.service.ts`, `users.module.ts` at the module root, with `dto/`, `entities/`, `interfaces/`, `providers/` subfolders. It exports `IUserRepository`/`IPasswordHasher` so `LogadminModule` can reuse them.
- DTOs follow the NestJS convention: kebab-case filenames with `.dto.ts` suffix (e.g. `create-user.dto.ts`, `logadmin.dto.ts`).
- Repositories and password hasher are abstracted behind interfaces (`IUserRepository`, `IPasswordHasher`) and injected by string token — see `src/poolmanager/users/interfaces/user-repository.interface.ts` and `src/shared/interfaces/`.
- DTOs live in `src/poolmanager/users/dto/` and `src/poolmanager/logadmin/dto/`; follow `class-validator`/`class-transformer` conventions.
- Consultas de negocio del ERP por módulo SIGESP: capa `src/tenant-connection/apps-sigesp/` (agregada por `AppsSigespModule` en `app.module.ts`; antes `queries/`, las rutas HTTP conservan ese prefijo). Cada módulo es una carpeta por prefijo (`scb/`, `sep/`, `sss/`; futuros: `scg`, ...) con `entities/` común al prefijo y una subcarpeta por tipo de consulta (`module · controller · service · spec · dto/`) registrada en el agregador `<prefix>.module.ts`; protegidos por `JwtAuthGuard` y rutas `GET /queries/<prefix>/<recurso>`. scb ya usa esta forma (`banco/`); sep/sss quedan planos (`module · controller · service · spec · entities/ · dto/` en la raíz del prefijo) pendientes de migrar:
  - `GET /queries/scb/bancos` — lista de `scb_banco` vía repositorio TypeORM (`BancoListaDto`).
  - `GET /queries/sep/solicitudes` — lista de `sep_solicitud` (`SolicitudListaDto`; `estado` traducido de `estsol`: E=Emitida, A=Anulada, P=Procesada, C=Contabilizada — regla de negocio en `SepService`).
  - `GET /queries/sss/usuarios` — lista de `sss_usuario` (`UsuarioListaDto`: `{ idUsuario, codusu, usuadm }`; usuadm: 1=admin, 0=usuario). La entidad `SssUsuario` vive en `apps-sigesp/sss/entities/` y la comparte el login (`login.service.ts` la importa desde ahí): TypeORM no permite dos entidades mapeando la misma tabla en un DataSource.
  - Nuevo listado: crear carpeta `apps-sigesp/<prefix>/<recurso>/` (module · controller · service · spec · dto/) con service que inyecta `'ITenantRepositoryFactory'` y usa `withRepository` + `repo.find({ order, take, skip })` (sin capa DAO) y DTO `*-lista.dto.ts`; la entidad va en `entities/` común del prefijo (`@Entity({ name: '<tabla>', schema: 'public' })`, columnas con `name:` real, array `<PREFIX>_ENTITIES`). Registrar el módulo del recurso en el agregador `<prefix>.module.ts` + su array en `datasource/entities/tenant-entities.registry.ts` (`TENANT_ENTITIES`). SQL crudo legacy solo vía `'ITenantQueryRunner'`.
  - El DataSource del tenant se crea en runtime, así que **no** sirve `TypeOrmModule.forFeature` para tablas del tenant; los repositorios se obtienen con `TenantRepositoryFactory.withRepository` (reintento B5 + paginación B6).
  - Plan de referencia: `Estructura/planestructura.md` (general), `Estructura/Mapaproyect.md` (mapa del proyecto) y `Estructura/FlujoConsultas.md` (flujo petición→respuesta + estructura de la capa).
- Tests mock repositories, hasher y `'ITenantRepositoryFactory'` via provider tokens (no real DB needed for unit tests).
