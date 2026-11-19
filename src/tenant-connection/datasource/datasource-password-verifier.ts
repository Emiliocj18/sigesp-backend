import { Injectable, Inject } from '@nestjs/common';
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

    // Caso legacy SIGESP: ya no se admite. Todas las cuentas migradas a bcrypt;
    // un valor no-bcrypt se trata como clave invalida (no como error 501).
    console.warn('[login] pwdusu con formato no soportado (se esperaba bcrypt)');
    return false;
  }
}
