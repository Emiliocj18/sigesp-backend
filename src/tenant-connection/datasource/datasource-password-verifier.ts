import { Injectable, Inject, NotImplementedException } from '@nestjs/common';
import { IPasswordHasher } from '../../auth/password-hasher.interface';
import { IDatasourcePasswordVerifier } from './interfaces/datasource-password-verifier.interface';

// Verifica la clave de un usuario de empresa.
// pwdusu es hibrido: bcrypt ($2...) o cifrado legacy SIGESP (base64 88 chars).
@Injectable()
export class DatasourcePasswordVerifier implements IDatasourcePasswordVerifier {
  constructor(
    @Inject('IPasswordHasher') private readonly passwordHasher: IPasswordHasher,
  ) {}

  async verify(plain: string, stored: string): Promise<boolean> {
    // Caso bcrypt (ej. SIGESP / adminerp)
    if (stored.startsWith('$2')) {
      return this.passwordHasher.compare(plain, stored);
    }

    // Caso legacy SIGESP: pendiente de implementar (stub).
    // Por ahora se rechaza explicitamente para no dar un falso positivo.
    throw new NotImplementedException(
      'Verificacion de clave legacy SIGESP no implementada todavia',
    );
  }
}
