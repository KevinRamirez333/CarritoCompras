// usuario.ts
export interface Usuario {
  id?: number;  // Opcional para creación (se genera en BD)
  email: string;
  password_hash: string;
  nombre?: string;  // Opcional si no siempre se usa
}



// Interfaces para login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

// Interfaces para creación de usuario
export interface CreateUserRequest {
  id_usuario?: string,
  email: string;
  password: string;
  nombre?: string;  // Agrega campos opcionales según tu tabla
}

export interface CreateUserResponse {
  message: string;
  id: number;  // ID del usuario creado
}