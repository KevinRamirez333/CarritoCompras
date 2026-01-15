import {ClienteRepositoryMySQL} from './repositories/implements/mysql/cliente.repository.mysql';
import { Cliente } from './repositories/domain/cliente';
export class ClienteService {
    private repository= new ClienteRepositoryMySQL();
    async CreateCliente(cliente: Cliente): Promise<any>{
        if (!cliente.nombre || !cliente.email) {
            throw new Error("El nombre y el email son obligatorios");
        }
        else{
            return this.repository.CreateCliente(cliente);
        }
    }
    async findAll(): Promise<Cliente[]>{
        const result =  this.repository.findAll();
        if(!result){
            throw new Error("No hay clientes registrados");
        }
        return this.repository.findAll();
    }
    async findById(id_cliente: number): Promise<Cliente | null>{
        const client = await this.repository.findById(id_cliente);
        if(!client){
            throw new Error("El cliente no existe");
        }
        return client;
    }
    async updateCliente(id_cliente:number,client:Cliente): Promise<any>{
        const exists = await this.repository.findAll();
        if(!exists.find(c => c.id_cliente === id_cliente)){
            throw new Error("El cliente no existe");
        }
       return this.repository.updateCliente(id_cliente,client);
    }
    async deleteCliente(id:number): Promise<any>{
        // Verificar si el cliente existe
        const exists = await this.repository.findById(id);
        if (!exists) {
            throw new Error("El cliente no existe");
        }
        return this.repository.deleteCliente(id);
    }
    // Buscar clientes por nombre o email
// En tu ClienteService
async searchClientes(termino: string): Promise<any[]> {
    console.log('🔍 INICIO - Service searchClientes llamado con:', termino);
    
    // Validación robusta
    if (!termino || typeof termino !== 'string') {
        console.error('❌ Service - Término inválido:', termino);
        throw new Error('Término de búsqueda inválido');
    }
    
    const terminoLimpio = termino.trim();
    if (terminoLimpio.length === 0) {
        console.warn('⚠️ Service - Término vacío después de trim');
        return [];
    }
    
    console.log('🔍 Service - Llamando a repository con:', terminoLimpio);
    return await this.repository.findByTerm(terminoLimpio);
}

    // Dar de baja (cambiar estado a inactivo)
    async darDeBajaCliente(id: number): Promise<void> {
        const cliente = await this.repository.findById(id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        
        await this.repository.updateEstado(id, 'inactivo');
    }

    // Reactivar cliente
    async reactivarCliente(id: number): Promise<void> {
        const cliente = await this.repository.findById(id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        
        await this.repository.updateEstado(id, 'activo');
    }

    // Obtener clientes con paginación
    async getClientesPaginados(pagina: number = 1, limite: number = 10): Promise<{ clientes: any[]; total: number }> {
        const offset = (pagina - 1) * limite;
        return await this.repository.findWithPagination(offset, limite);
    }
}