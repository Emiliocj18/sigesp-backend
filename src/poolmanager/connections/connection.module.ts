import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './entities/connection.entity';
import { ConnectionRepository } from './providers/connection.repository';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';

// Modulo del catalogo de empresas (connections)
@Module({
  imports: [TypeOrmModule.forFeature([Connection])],
  controllers: [ConnectionController],
  providers: [ConnectionRepository, ConnectionService],
  exports: [ConnectionService],
})
export class ConnectionsModule {}
