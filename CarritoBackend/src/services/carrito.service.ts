import { CarritoRepositoryMySQL } from "./repositories/implements/mysql/carrito.repository.mysql";
import { Carrito } from "./repositories/domain/carrito";
import { CarritoItem } from "./repositories/domain/carritoItem";

export class CarritoService {
  private repository = new CarritoRepositoryMySQL();

  async crearCarrito(id_cliente: number): Promise<Carrito> {
    return this.repository.crearCarrito(id_cliente);
  }

  async obtenerCarrito(id_cliente: number): Promise<Carrito | null> {
    return this.repository.obtenerCarrito(id_cliente);
  }

  async obtenerItems(id_carrito: number): Promise<CarritoItem[]> {
    return this.repository.obtenerItems(id_carrito);
  }

  async agregarProducto(id_carrito: number, id_producto: number, cantidad: number): Promise<CarritoItem> {
    if (cantidad <= 0) throw new Error('Cantidad inválida');
    return this.repository.agregarItem({ id_carrito, id_producto, cantidad });
  }

  async actualizarProducto(id_item: number, nuevaCantidad: number): Promise<void> {
    if (nuevaCantidad <= 0) throw new Error('Cantidad inválida');
    return this.repository.actualizarItem(id_item, nuevaCantidad);
  }

  async eliminarProducto(id_item: number): Promise<void> {
    return this.repository.eliminarItem(id_item);
  }

  async vaciarCarrito(id_carrito: number): Promise<void> {
    return this.repository.vaciarCarrito(id_carrito);
  }

  async realizarCheckout(id_carrito: number) {
    return this.repository.checkout(id_carrito);
  }
}
