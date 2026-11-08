import { Module } from '@nestjs/common';
import { ConnectionsModule } from '../../poolmanager/connections/connection.module';
import { DatasourceModule } from '../datasource/datasource.module';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';

// Modulo orquestador de login multitenant (login)
@Module({
  imports: [ConnectionsModule, DatasourceModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
