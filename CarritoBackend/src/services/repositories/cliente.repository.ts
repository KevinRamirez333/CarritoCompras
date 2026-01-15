import { Cliente } from "./domain/cliente";

export interface ClienteRepository {
    CreateCliente(cliente: Cliente ): Promise<any>;
    findAll(): Promise<Cliente[]>;
    findById(id_cliente: number): Promise<Cliente | null>;
    updateCliente(id_cliente:number,client:Cliente): Promise<any>;
    deleteCliente(id:number): Promise<any>;
    findByTerm(termino:string): Promise<Cliente[]>;
    updateEstado(id:number, estado: 'activo' | 'inactivo'): Promise<any>;
    findWithPagination(offset: number, limit: number): Promise<{clientes:Cliente[];total: number}>
    
}