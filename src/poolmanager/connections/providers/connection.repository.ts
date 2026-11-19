import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from '../entities/connection.entity';
import { throwDbConnectionError } from '../../../shared/errors/database-error';

// Implementacion concreta del repositorio de conexiones (catalogo de empresas)
@Injectable()
export class ConnectionRepository {
  constructor(
    @InjectRepository(Connection) //Esto inyecta la entidad
    private readonly repo: Repository<Connection>, // Esto la instancia
  ) {}

  // B2: búsqueda por solo id (la empresa puede haber sido renombrada).
  async findById(connectionId: number): Promise<Connection | null> {
    try {
      return await this.repo.findOne({ where: { connectionId } });
    } catch (err) {
      throwDbConnectionError('ConnectionRepository.findById', err);
    }
  }

  async findAll(): Promise<Connection[]> {
    try {
      // TODO(active): filtrar por active = 1 cuando el campo esté mantenido.
      // Hoy las 3 empresas del entorno tienen active = 0 y el login quedaría
      // sin catálogo. Ver plan de acción §6.3.
      return await this.repo.find({ order: { name: 'ASC' } });
    } catch (err) {
      throwDbConnectionError('ConnectionRepository.catalogo', err);
    }
  }
}
