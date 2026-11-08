import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IPasswordHasher } from './password-hasher.interface';

// Hasheo hibrido de contrasenas:
// - hash(): para sigesp_admin se almacena en texto plano (diseno solicitado),
//   por lo que devuelve el texto tal cual.
// - compare(): si el valor almacenado es un hash bcrypt ($2...), usa bcrypt
//   (mantiene la verificacion de claves de empresas/tenants); de lo contrario
//   compara igualdad de texto plano (sigesp_admin).
@Injectable()
export class PasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  hash(plain: string): Promise<string> {
    return Promise.resolve(plain);
  }

  compare(plain: string, stored: string): Promise<boolean> {
    if (stored && stored.startsWith('$2')) {
      return bcrypt.compare(plain, stored);
    }
    return Promise.resolve(plain === stored);
  }
}
