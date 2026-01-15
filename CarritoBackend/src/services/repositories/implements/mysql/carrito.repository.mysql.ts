import { CarritoRepository } from "../../carrito.repository";
import { Carrito } from "../../domain/carrito";
import { CarritoItem } from "../../domain/carritoItem";
import connector from "../../../../common/persistence/persistence.mysql";
import { ResultSetHeader } from 'mysql2';


export class CarritoRepositoryMySQL implements CarritoRepository {

 async crearCarrito(id_cliente: number): Promise<Carrito> {
        const [result] = await connector.query<ResultSetHeader>(
            'INSERT INTO carritos (id_cliente, total) VALUES (?, 0)',
            [id_cliente]
        );
        return { id_carrito: result.insertId, id_cliente, total: 0, creado_en: new Date() };
    }

    async obtenerCarrito(id_cliente: number): Promise<Carrito | null> {
        const [rows]: any = await connector.query(
            'SELECT * FROM carritos WHERE id_cliente = ? ORDER BY creado_en DESC LIMIT 1',
            [id_cliente]
        );
        return rows.length ? rows[0] : null;
    }

    async agregarItem(item: CarritoItem): Promise<CarritoItem> {
        const [producto]: any = await connector.query(
            'SELECT precio FROM productos WHERE id_producto = ?',
            [item.id_producto]
        );
        if (!producto.length) throw new Error('Producto no encontrado');

        const precio_unitario = producto[0].precio;
        const subtotal = precio_unitario * item.cantidad;

        const [result] = await connector.query<ResultSetHeader>(
            'INSERT INTO carrito_items (id_carrito, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
            [item.id_carrito, item.id_producto, item.cantidad, precio_unitario, subtotal]
        );

        await connector.query('UPDATE carritos SET total = total + ? WHERE id_carrito = ?', [subtotal, item.id_carrito]);

        return { id_item: result.insertId, ...item, precio_unitario, subtotal };
    }

    async actualizarItem(id_item: number, cantidad: number): Promise<void> {
        // obtener item actual
        const [items]: any = await connector.query('SELECT * FROM carrito_items WHERE id_item = ?', [id_item]);
        if (!items.length) throw new Error('Item no encontrado');

        const item = items[0];
        const subtotalAnterior = item.subtotal;

        // recalcular subtotal
        const subtotalNuevo = item.precio_unitario * cantidad;

        // actualizar item
        await connector.query(
            'UPDATE carrito_items SET cantidad = ?, subtotal = ? WHERE id_item = ?',
            [cantidad, subtotalNuevo, id_item]
        );

        // actualizar total del carrito
        const diferencia = subtotalNuevo - subtotalAnterior;
        await connector.query('UPDATE carritos SET total = total + ? WHERE id_carrito = ?', [diferencia, item.id_carrito]);
    }

    async eliminarItem(id_item: number): Promise<void> {
        const [items]: any = await connector.query('SELECT * FROM carrito_items WHERE id_item = ?', [id_item]);
        if (!items.length) throw new Error('Item no encontrado');

        const item = items[0];

        // eliminar item
        await connector.query('DELETE FROM carrito_items WHERE id_item = ?', [id_item]);

        // restar del total
        await connector.query('UPDATE carritos SET total = total - ? WHERE id_carrito = ?', [item.subtotal, item.id_carrito]);
    }

    async obtenerItems(id_carrito: number): Promise<CarritoItem[]> {
        const [rows]: any = await connector.query(
            'SELECT * FROM carrito_items WHERE id_carrito = ?',
            [id_carrito]
        );
        return rows;
    }

    async vaciarCarrito(id_carrito: number): Promise<void> {
        await connector.query('DELETE FROM carrito_items WHERE id_carrito = ?', [id_carrito]);
        await connector.query('UPDATE carritos SET total = 0 WHERE id_carrito = ?', [id_carrito]);
    }

    async checkout(id_carrito: number): Promise<void> {
        // aquí podrías mover los datos de carritos/carrito_items a ventas/detalle_ventas
        // y luego vaciar el carrito o marcarlo como cerrado
        await connector.query('UPDATE carritos SET estado = "COMPLETADO" WHERE id_carrito = ?', [id_carrito]);
    }

}