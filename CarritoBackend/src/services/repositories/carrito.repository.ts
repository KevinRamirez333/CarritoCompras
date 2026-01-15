import {Carrito} from './domain/carrito';
import {CarritoItem} from './domain/carritoItem';

export interface CarritoRepository {
    crearCarrito(id_cliente:number): Promise <Carrito>;
    obtenerCarrito(id_cliente:number): Promise <Carrito | null>;
    agregarItem(item:CarritoItem): Promise <CarritoItem>;
    actualizarItem(id_item:number, cantidad:number): Promise <void>;
    eliminarItem(id_item:number): Promise <void>;
    vaciarCarrito(id_carrito:number): Promise <void>;
    obtenerItems(id_carrito:number): Promise <CarritoItem[]>;
    checkout(id_carrito:number): Promise <void>;
}