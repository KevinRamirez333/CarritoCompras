export interface CarritoItem{
    id_item?: number;
    id_carrito: number;
    id_producto: number;
    cantidad: number;
    precio_unitario?:number;
    subtotal?: number;
}