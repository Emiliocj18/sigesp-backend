import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard que protege las rutas mediante el token JWT
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
