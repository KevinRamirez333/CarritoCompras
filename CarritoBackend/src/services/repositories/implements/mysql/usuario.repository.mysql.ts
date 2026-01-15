// usuarioRepositoryMysql.ts
import connector from "../../../../common/persistence/persistence.mysql";  // Ajusta la ruta según tu proyecto
import { Usuario } from "../../domain/usuario";  // Importa la interfaz Usuario
import { UsuarioRepository } from "./usuario.repository";  // Importa la interfaz del repositorio

export class UsuarioRepositoryMySQL implements UsuarioRepository {
  // ... (agrega tus métodos existentes si los tienes, ej: findAll, findById para usuarios)

  async findByEmail(email: string): Promise<Usuario | null> {
    const [rows] = await connector.query("SELECT id_usuario AS id, email, password_hash, nombre FROM usuarios WHERE email = ?", [email]);  // Usa AS id para mapear
    const result = (rows as Usuario[])[0];
    return result || null;
  }

  async create(user: Usuario): Promise<number> {
    // Logging para depurar
    console.log('Campos del user a insertar:', Object.keys(user));
    console.log('Valores:', [user.email, user.password_hash, user.nombre]);

    const query = "INSERT INTO usuarios (email, password_hash, nombre) VALUES (?, ?, ?)";  // No incluye id_usuario, ya que es auto-increment
    const values = [user.email, user.password_hash, user.nombre];
    const [result] = await connector.query(query, values);
    return (result as any).insertId;  // Retorna el ID generado (id_usuario)
  }
}
