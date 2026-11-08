// Contrato para verificar la contrasena de un usuario de empresa (tenant)
export interface IDatasourcePasswordVerifier {
  verify(plain: string, stored: string): Promise<boolean>;
}
