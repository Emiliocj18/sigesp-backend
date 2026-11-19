import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../../../auth/jwt-payload.interface';
import { PerfilService } from './perfil.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

// Perfil del usuario autenticado. La identidad sale del JWT, no del cliente.
@Controller('queries/sss')
@UseGuards(JwtAuthGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get('perfil')
  getPerfil(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.perfilService.getPerfil(user);
  }

  @Put('perfil')
  updatePerfil(@Req() req: Request, @Body() dto: UpdatePerfilDto) {
    const user = req.user as AuthenticatedUser;
    return this.perfilService.updatePerfil(user, dto);
  }
}
