export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

// Coincide con UserListDTO
export interface UserList {
  id: number;
  nombreCompleto: string;
  cedula: string;
  login: string;
  email?: string;
  telefono?: string;
  rolNombre: string;
  estado: string; // ACTIVO/INACTIVO
}

// Coincide con UserDetailDTO
export interface UserDetail {
  id: number;
  nombreCompleto: string;
  cedula: string;
  login: string;
  email?: string;
  telefono?: string;
  rolId: number;
  rolNombre: string;
  sucursalId: number;
  estado: string; // ACTIVO/INACTIVO
  intentosFallidos: number;
  fechaBloqueo: string | null;
  fechaCreacion: string;
  ultimoAcceso: string | null;
}

// Coincide con CreateUserDTO
export interface CreateUserRequest {
  nombreCompleto: string;
  cedula: string;
  login: string;
  email: string;      // ✨ NUEVO - requerido por el backend
  telefono: string;   // ✨ NUEVO - requerido por el backend
  rolId: number;
  sucursalId: number;
  password?: string;
}

// Coincide con UpdateUserDTO
export interface UpdateUserRequest {
  nombreCompleto: string;
  cedula: string;
  rolId: number;
  estado: string;
  password?: string;
}
