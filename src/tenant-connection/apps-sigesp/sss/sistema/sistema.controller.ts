import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { SistemaService } from './sistema.service';

// Consultas del recurso sistema (menú home) sobre la BD del tenant autenticado.
@Controller('queries/sss')
@UseGuards(JwtAuthGuard)
export class SistemaController {
  constructor(private readonly sistemaService: SistemaService) {}

  // Menú de sistemas activos del usuario del token (contrato snake_case del PHP).
  @Get('sistemas')
  getSistemas(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.sistemaService.getSistemas(user);
  }
}
