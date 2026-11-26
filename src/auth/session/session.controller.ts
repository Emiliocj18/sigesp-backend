import { Controller, Get, HttpCode, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { SesionDto, SessionService } from './session.service';

// Puerta de entrada de cada módulo: lee la cookie "rt" y no la reescribe.
@Controller('auth')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // El kit puede llamar varias veces por pestaña; 60/min evita 429 falsos.
  @Get('session')
  @HttpCode(200)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async session(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SesionDto> {
    // La respuesta contiene un access token: no debe cachearse.
    res.setHeader('Cache-Control', 'no-store');
    const refreshToken = (req.cookies?.rt as string) ?? '';
    return this.sessionService.getSession(refreshToken);
  }
}
