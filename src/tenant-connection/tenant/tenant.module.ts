import { Module } from '@nestjs/common';
import { DatasourceModule } from '../datasource/datasource.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

// Modulo de ejemplo que demuestra el enrutamiento multi-tenant por token.
@Module({
  imports: [DatasourceModule],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantInfoModule {}
