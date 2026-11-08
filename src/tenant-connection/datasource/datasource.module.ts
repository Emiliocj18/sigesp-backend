import { Module } from '@nestjs/common';
import { ConnectionsModule } from '../../poolmanager/connections/connection.module';
import { DatasourceService } from './datasource.service';
import { DatasourcePasswordVerifier } from './datasource-password-verifier';
import { DatasourceResolver } from './datasource-resolver.service';

// Modulo de infra de conexion dinamica a las BD de empresas (datasource)
@Module({
  imports: [ConnectionsModule],
  providers: [
    DatasourceService,
    DatasourceResolver,
    { provide: 'IDatasourcePasswordVerifier', useClass: DatasourcePasswordVerifier },
  ],
  exports: [
    DatasourceService,
    DatasourceResolver,
    'IDatasourcePasswordVerifier',
  ],
})
export class DatasourceModule {}
