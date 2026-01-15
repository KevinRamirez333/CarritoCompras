import {Venta} from '../repositories/domain/venta';

export interface VentaRepository {
    VentasPorCliente(id_cliente: number): Promise<Venta[]>;
    DetalleVenta(id_venta: number): Promise<any>;
    ClienteConMasCompras(): Promise<any>;
    ClienteSinCompras(): Promise<any>;
    createVenta(id_cliente: number, fecha: string, detalles: any[]): Promise<any>; // Devuelve el ID de la venta insertada
    VentaDetallePorCliente(id_cliente: number): Promise <any[]>;
    TotalGastadoPorCliente(id_cliente: number): Promise <any[]>;

}

