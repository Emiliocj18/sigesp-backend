import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { UsuarioService } from './usuario.service';
import { PaginacionDto } from '../../shared/dto/paginacion.dto';

// Consultas del recurso usuario (sss_usuario) sobre la BD del tenant autenticado.
@Controller('queries/sss')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // Lista los usuarios de la BD de la empresa seleccionada en el login
  @Get('usuarios')
  getUsuarios(@Req() req: Request, @Query() query: PaginacionDto) {
    const user = req.user as AuthenticatedUser;
    return this.usuarioService.getUsuarios(user, query);
  }
}
