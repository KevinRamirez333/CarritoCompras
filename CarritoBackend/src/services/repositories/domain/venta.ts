export interface Venta {
    id_venta?: number; // lo ponemos opcional porque al crear aún no existe
    id_cliente: number;
    fecha: Date;
}
