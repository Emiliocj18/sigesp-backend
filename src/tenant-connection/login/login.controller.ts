import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { LoginService } from './login.service';
import { ConexDto } from './dto/conex.dto';
import { UsuarioConectadoDto } from './dto/usuario-conectado.dto';
import { buildRefreshCookieOptions } from '../../shared/security/cookie-options';

// Endpoints de login multitenant
@Controller('login')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly config: ConfigService,
  ) {}

  // Login de entrada (publico): autentica contra la BD de la empresa seleccionada
  // A2: límite más estricto que el global para mitigar fuerza bruta (5 intentos / min)
  @Post('connect')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async conex(
    @Body() dto: ConexDto,
    @Res({ passthrough: true }) res: Response, //Acá inyecto el Response(de la bibliot express) y el decorador @Res es el que me lo permite 
  ): Promise<{ access_token: string; usuario: UsuarioConectadoDto }> {
    const { access_token, refresh_token, usuario } = await this.loginService.login(dto);
    // Opción c (Parte B): el refresh token viaja en cookie HttpOnly (invisible al JS).
    res.cookie('rt', refresh_token, buildRefreshCookieOptions(this.config));
    return { access_token, usuario };
  }
}
