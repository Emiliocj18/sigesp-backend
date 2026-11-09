import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { BancoService } from './banco.service';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';

// Consultas del recurso banco (scb_banco) sobre la BD del tenant autenticado.
@Controller('queries/scb')
@UseGuards(JwtAuthGuard)
export class BancoController {
  constructor(private readonly bancoService: BancoService) {}

  // Lista los bancos de la BD de la empresa seleccionada en el login
  @Get('bancos')
  getBancos(@Req() req: Request, @Query() query: PaginacionDto) {
    const user = req.user as AuthenticatedUser;
    return this.bancoService.getBancos(user, query);
  }
}
