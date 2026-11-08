import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RefreshService } from './refresh.service';
import { buildRefreshCookieOptions } from '../../shared/security/cookie-options';

// Endpoints públicos de refresco y cierre de sesión (A5 / opción c de la Parte B)
@Controller('auth')
export class RefreshController {
  constructor(
    private readonly refreshService: RefreshService,
    private readonly config: ConfigService,
  ) {}

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // El refresh token se lee de la cookie HttpOnly (no del body).
    const refreshToken = (req.cookies?.rt as string) ?? '';
    const { access_token, refresh_token, usuario } = await this.refreshService.refresh(refreshToken);
    // Rotación: reescribimos la cookie con el nuevo refresh token.
    res.cookie('rt', refresh_token, buildRefreshCookieOptions(this.config));
    return { access_token, usuario };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies?.rt as string) ?? '';
    this.refreshService.logout(refreshToken);
    res.clearCookie('rt', { path: '/auth' });
    return { message: 'Sesion cerrada' };
  }
}
