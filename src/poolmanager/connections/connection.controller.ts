import { Controller, Get } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionCatalogDto } from './dto/connection-catalog.dto';

// Endpoints del catalogo de empresas
@Controller('connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  // Catálogo público (pre-login): alimenta el desplegable del frontend con
  // connectionId + name, sin requerir autenticación.
  @Get('catalogo')
  async catalogo(): Promise<ConnectionCatalogDto[]> {
    return this.connectionService.listCatalog();
  }
}
