import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../../auth/jwt-payload.interface';
import { SssService } from './sss.service';
import { PaginacionDto } from '../shared/dto/paginacion.dto';

// Consultas del módulo sss (seguridad) sobre la BD del tenant autenticado.
@Controller('queries/sss')
@UseGuards(JwtAuthGuard)
export class SssController {
  constructor(private readonly sssService: SssService) {}

  // Lista los usuarios de la BD de la empresa seleccionada en el login
  @Get('usuarios')
  getUsuarios(@Req() req: Request, @Query() query: PaginacionDto) {
    const user = req.user as AuthenticatedUser;
    return this.sssService.getUsuarios(user, query);
  }
}
