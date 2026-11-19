// Contrato de salida del perfil del usuario autenticado.
export class PerfilDto {
  idUsuario: number;
  idEmpresa: number;
  idPersonal: number;
  codusu: string;
  nombre: string;
  apellido: string;
  // Habilita el botón Guardar en la plantilla (identification != null).
  cedula: string;
  email: string | null;
  telefono: string | null;
  telefonoHabitacion: string;
  // Solo lectura: el perfil no actualiza la fecha de nacimiento.
  fechaNacimiento: string | null;
  foto: string | null;
}
