import connector from "../../../../common/persistence/persistence.mysql";
import { ClienteRepository } from "../../cliente.repository";
import { Cliente } from "../../domain/cliente";

export class ClienteRepositoryMySQL implements ClienteRepository {
    async CreateCliente(cliente: Cliente): Promise<any> {
        const emailExistente = await connector.query("SELECT * FROM clientes WHERE email = ?", [cliente.email]);
        if((emailExistente as any)[0].length > 0) {
            throw new Error("El email ya está registrado");
        }
        else{
            const [result]= await connector.query("INSERT INTO clientes (nombre, email,direccion, telefono,password) VALUES (?, ?,?,?,?)", [cliente.nombre, cliente.email, cliente.direccion, cliente.telefono, cliente.password]);
            console.log((result as any).insertId);
            return (result as any).insertId;
            
        }
    }
    async findAll(): Promise<Cliente[]> {
        const [rows] = await connector.query("SELECT * FROM clientes");
        return rows as Cliente[];
    }
    async updateCliente(id_cliente: number, client: Cliente): Promise<any> {
        const emailExistente = await connector.query("SELECT * FROM clientes WHERE email = ? AND id_cliente != ?", [client.email, id_cliente]);
        if((emailExistente as any)[0].length > 0) {
            throw new Error("El email ya está registrado");
        }
        else{   
            await connector.query("UPDATE clientes SET nombre = ?, email = ?, direccion = ?, telefono = ?, password = ? WHERE id_cliente = ?", [client.nombre, client.email, client.direccion, client.telefono, client.password, id_cliente]);
        }
    }
    async findById(id_cliente: number): Promise<Cliente | null> {
        const [result]= await connector.query("SeLECT * FROM clientes WHERE id_cliente = ?", [id_cliente]);
        const cliente = (result as Cliente[])[0];
        return cliente || null;
    }
    async deleteCliente(id: number): Promise<any> {
        // Verificar si el cliente tiene ventas asociadas
        const [ventas] = await connector.query("SELECT COUNT(*) as count FROM ventas WHERE id_cliente = ?", [id]);
        const count = (ventas as any)[0].count;
        if (count > 0) {
            throw new Error("No se puede eliminar el cliente porque tiene ventas asociadas");
        }
        await connector.query("DELETE FROM clientes WHERE id_cliente = ?", [id]);
        return;
    }
  async findByTerm(termino: string): Promise<Cliente[]> {
    console.log('🔍 Repository - Término recibido:', termino, 'Tipo:', typeof termino);
    
    if (!termino || typeof termino !== 'string') {
        console.error('❌ Repository - Término inválido:', termino);
        throw new Error('Término de búsqueda inválido');
    }

    const terminoLimpio = termino.trim();
    console.log('🔍 Repository - Término limpio:', terminoLimpio);
    
    if (terminoLimpio.length === 0) {
        console.warn('⚠️ Repository - Término vacío, retornando array vacío');
        return [];
    }

    try {
        const query = `
            SELECT id_cliente, nombre, email, direccion, telefono, estado 
            FROM clientes 
            WHERE (nombre LIKE ? OR email LIKE ?) AND estado = 'activo'
        `;
        const searchTerm = `%${terminoLimpio}%`;
        console.log('🔍 Repository - Ejecutando query con searchTerm:', searchTerm);
        
        const [rows] = await connector.query(query, [searchTerm, searchTerm]);
        console.log('✅ Repository - Resultados encontrados:', (rows as Cliente[]).length);
        
        return rows as Cliente[];
    } catch (error) {
        console.error('❌ Repository - Error en findByTerm:', error);
        throw new Error('Error al buscar clientes en la base de datos');
    }
}

    async updateEstado(id: number, estado: 'activo' | 'inactivo'): Promise<void> {
        const query = 'UPDATE clientes SET estado = ? WHERE id_cliente = ?';
        await connector.query(query, [estado, id]);
    }

    async findWithPagination(offset: number, limit: number): Promise<{ clientes: Cliente[]; total: number }> {
        const [clientes] = await connector.query(
            'SELECT id_cliente, nombre, email, direccion, telefono, estado FROM clientes LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        const [totalResult] = await connector.query(
            'SELECT COUNT(*) as total FROM clientes'
        );
        
        const total = (totalResult as any[])[0].total;
        
        return {
            clientes: clientes as Cliente[],
            total: total
        };
    }
}