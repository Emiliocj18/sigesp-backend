// DTO reducido y público del catálogo: expone SOLO lo necesario para el
// desplegable del login (sin filtrar datos de infraestructura de la BD).
export class ConnectionCatalogDto {
  connectionId: number;
  name: string;

  constructor(partial: Partial<ConnectionCatalogDto>) {
    Object.assign(this, partial);
  }
}
