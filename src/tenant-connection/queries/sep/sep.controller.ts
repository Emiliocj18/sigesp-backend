import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../../auth/jwt-payload.interface';
import { SepService } from './sep.service';
import { PaginacionDto } from '../shared/dto/paginacion.dto';

// Consultas del módulo sep (solicitudes) sobre la BD del tenant autenticado.
@Controller('queries/sep')
@UseGuards(JwtAuthGuard)
export class SepController {
  constructor(private readonly sepService: SepService) {}

  // Lista las solicitudes de la BD de la empresa seleccionada en el login
  @Get('solicitudes')
  getSolicitudes(@Req() req: Request, @Query() query: PaginacionDto) {
    const user = req.user as AuthenticatedUser;
    return this.sepService.getSolicitudes(user, query);
  }
}
