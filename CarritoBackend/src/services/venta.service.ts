import { VentaRepositoryMySQL } from "./repositories/implements/mysql/venta.repository.mysql";
import { Venta } from "./repositories/domain/venta";
export class VentaService {
    private repository = new VentaRepositoryMySQL();

    // Obtener ventas por cliente
    async getVentasPorCliente(id_cliente: number): Promise<Venta[]> {
        if (id_cliente <= 0) {
            throw new Error("ID de cliente inválido");
        }
        return this.repository.VentasPorCliente(id_cliente);
    }
    // Obtener detalle de una venta
    async getDetalleVenta(id_venta: number): Promise<any> {
        if (id_venta <= 0) {
            throw new Error("ID de venta inválido");
        }
        return this.repository.DetalleVenta(id_venta);
    }
    // Obtener cliente con más compras
    async getClienteConMasCompras(): Promise<any> {
        return this.repository.ClienteConMasCompras();
    }
    async createVenta(id_cliente: number, fecha: string, detalles: any[]): Promise<any> {
        if (id_cliente <= 0 || !fecha || !Array.isArray(detalles) || detalles.length === 0) {
            throw new Error("Datos inválidos para crear venta");
        }
        return this.repository.createVenta(id_cliente, fecha, detalles);
    }
    async getClienteSinCompras(): Promise<any> {
        const result = this.repository.ClienteSinCompras();
        if (!result) {
            throw new Error("No hay clientes sin compras");
        }
        return result;
    }
    async getVentasDetallePorCliente(id_cliente: number): Promise <any>{
        const result = this.repository.VentaDetallePorCliente(id_cliente);
        if((await this.repository.VentaDetallePorCliente(id_cliente)).length===0){
            throw new Error("No hay cliente asociado a ninguna venta");
        }
        return result;
    }

    async getTotalGastadoPorCliente (id_cliente: number) : Promise <any>{
        const gastos = await this.repository.TotalGastadoPorCliente(id_cliente)
        if (gastos.length===0){
            throw new Error("No hay cliente asociado a este numero de id")            
        }
        return gastos;
    }
}