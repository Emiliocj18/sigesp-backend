import { Module } from '@nestjs/common';
import { DatasourceModule } from '../../datasource/datasource.module';
import { TenantQueryRunner } from './tenant-query.runner';
import { TenantRepositoryFactory } from './tenant-repository.factory';

// Infra común de la capa queries/: reusa DatasourceModule (DatasourceResolver)
// y registra las abstracciones por string token (convención del repo para
// inyectar interfaces, como 'IDatasourcePasswordVerifier' e 'IUserRepository').
@Module({
  imports: [DatasourceModule],
  providers: [
    { provide: 'ITenantQueryRunner', useClass: TenantQueryRunner },
    { provide: 'ITenantRepositoryFactory', useClass: TenantRepositoryFactory },
  ],
  exports: ['ITenantQueryRunner', 'ITenantRepositoryFactory'],
})
export class QueriesSharedModule {}
