import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/jwt-payload.interface';
import { TenantService } from './tenant.service';
import { PaginacionDto } from './dto/paginacion.dto';

// Endpoints de ejemplo protegidos por JWT que operan sobre la BD del tenant.
@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // Lista los usuarios de la BD de la empresa seleccionada en el login
  @Get('usuarios')
  getUsuarios(@Req() req: Request, @Query() query: PaginacionDto) {
    const user = req.user as AuthenticatedUser;
    return this.tenantService.getUsuarios(user, query);
  }

  // Lista los bancos de la BD de la empresa seleccionada en el login
  @Get('bancos')
  getBancos(@Req() req: Request, @Query() query: PaginacionDto) {
    const user = req.user as AuthenticatedUser;
    return this.tenantService.getBancos(user, query);
  }

  // Lista las solicitudes de la BD de la empresa seleccionada en el login
  @Get('solicitudes')
  getSolicitudes(@Req() req: Request, @Query() query: PaginacionDto) {
    const user = req.user as AuthenticatedUser;
    return this.tenantService.getSolicitudes(user, query);
  }
}
