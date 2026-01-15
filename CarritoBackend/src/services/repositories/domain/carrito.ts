export interface Carrito {
    id_carrito?: number;  
    id_cliente: number;
    total?: number;
    creado_en?: Date      // lo ponemos opcional porque al crear aún no existe
}