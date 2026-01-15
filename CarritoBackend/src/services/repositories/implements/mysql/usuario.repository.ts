// usuario.repository.ts
import { Usuario } from "../../domain/usuario"; // Importa la interfaz

export interface UsuarioRepository {
  // ... (tus métodos existentes, ej: findAll, findById)
  findByEmail(email: string): Promise<Usuario | null>;  // Para login
  create(user: Usuario): Promise<number>;  // Para creación, retorna ID
}