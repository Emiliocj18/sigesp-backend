// Contrato de salida del menú de sistemas: claves snake_case idénticas al PHP
// para que el front mapee directo a MUsuarioSistema (sin adapter).
export class SistemaListaDto {
  id_empresa: number;
  id_usuario: number;
  codsis: string;
  nomsis: string;
  estsis: string;
  imgsis: string;
  accsis: string;
  tipsis: number;
  // URL raíz del módulo resuelta por entorno (SSO_MODULE_URLS); null = mantenimiento.
  url: string | null;
}
