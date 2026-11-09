import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../../auth/jwt-payload.interface';
import { ScbService } from './scb.service';
import { PaginacionDto } from '../shared/dto/paginacion.dto';

// Consultas del módulo scb (cuentas bancarias) sobre la BD del tenant autenticado.
@Controller('queries/scb')
@UseGuards(JwtAuthGuard)
export class ScbController {
  constructor(private readonly scbService: ScbService) {}

  // Lista los bancos de la BD de la empresa seleccionada en el login
  @Get('bancos')
  getBancos(@Req() req: Request, @Query() query: PaginacionDto) {
    const user = req.user as AuthenticatedUser;
    return this.scbService.getBancos(user, query);
  }
}
