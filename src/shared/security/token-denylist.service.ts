import { Injectable } from '@nestjs/common';

// A5: lista en memoria de jti de refresh tokens revocados (logout / rotación).
// Válida para una sola instancia; en multi-instancia usar Redis/BD externa.
@Injectable()
export class TokenDenylistService {
  private readonly revoked = new Set<string>();

  revoke(jti: string): void {
    this.revoked.add(jti);
  }

  isRevoked(jti?: string): boolean {
    return jti ? this.revoked.has(jti) : false;
  }
}
