import { VentaRepository } from "../../venta.repository";
import connector from "../../../../common/persistence/persistence.mysql";
import { Venta } from "../../domain/venta";

export class VentaRepositoryMySQL implements VentaRepository {
    async VentasPorCliente (id_cliente: number): Promise<Venta[]>{
        //necesito realizar un join entre ventas y clientes 
        const [rows]= await connector.query("SELECT ventas.*, clientes.nombre, clientes.email FROM ventas JOIN clientes ON ventas.id_cliente = clientes.id_cliente WHERE ventas.id_cliente = ?", [id_cliente]);
        return rows as Venta[];
    }
    async DetalleVenta(id_venta: number): Promise<any> {
        const [rows] = await connector.query("select  detalle_ventas.*, productos.nombre from detalle_ventas join productos on detalle_ventas.id_producto= productos.id_producto where id_venta = ?" , [id_venta]);
        return rows as any;
    }
    async ClienteConMasCompras(): Promise<any> {
        const [rows] = await connector.query("SELECT clientes.id_cliente, clientes.nombre, COUNT(ventas.id_venta) AS total_compras FROM clientes JOIN ventas ON clientes.id_cliente = ventas.id_cliente GROUP BY clientes.id_cliente ORDER BY total_compras DESC LIMIT 1");
        return rows as any;
    }
    async ClienteSinCompras(): Promise<any> { 
        const [rows] = await connector.query("SELECT c.*FROM clientes c LEFT JOIN ventas v ON c.id_cliente = v.id_cliente WHERE v.id_venta IS NULL");
        return rows as any;
    }
   async createVenta(id_cliente: number, fecha: string, detalles: any[]): Promise<any> {
  const connection = await connector.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Validar cliente (igual que antes)
    const [clienteRows]: any = await connection.query(
      "SELECT id_cliente FROM clientes WHERE id_cliente = ?",
      [id_cliente]
    );
    if (clienteRows.length === 0) {
      throw new Error("Cliente no existe");
    }

    // 2. Validar productos y stock (igual que antes)
    for (const item of detalles) {
      const [productoRows]: any = await connection.query(
        "SELECT stock FROM productos WHERE id_producto = ?",
        [item.id_producto]
      );

      if (productoRows.length === 0) {
        throw new Error(`Producto ${item.id_producto} no existe`);
      }

      if (productoRows[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ${item.id_producto}`);
      }
    }

    // NUEVO: Calcular total sumando subtotales de detalles
    let totalCalculado = 0;
    for (const item of detalles) {
      totalCalculado += item.precio_unitario * item.cantidad;
    }
    console.log('Total calculado en backend:', totalCalculado);  // Log temporal para debug (quita después)

    // 3. Insertar en ventas (AGREGADO: total en INSERT)
    const [ventaResult]: any = await connection.query(
      "INSERT INTO ventas (id_cliente, fecha, total) VALUES (?, ?, ?)",  //  AGREGADO: total
      [id_cliente, fecha, totalCalculado]  // AGREGADO: pasar totalCalculado
    );
    const id_venta = ventaResult.insertId;

    // 4. Insertar en detalle_ventas + actualizar stock (igual que antes)
    for (const item of detalles) {
      await connection.query(
        "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [id_venta, item.id_producto, item.cantidad, item.precio_unitario]
      );

      await connection.query(
        "UPDATE productos SET stock = stock - ? WHERE id_producto = ?",
        [item.cantidad, item.id_producto]
      );
    }

    // 5. Confirmar transacción (igual)
    await connection.commit();

    //  MEJORADO: Return incluye total para frontend (opcional, pero útil)
    return { id_venta, total: totalCalculado };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

    async VentaDetallePorCliente(id_cliente: number): Promise<any[]> {
      const [rows] = await connector.query("select v.id_venta, c.id_cliente, c.nombre as nombreCliente, v.fecha, vd.id_producto, p.nombre as nombreProducto, vd.cantidad, vd.precio_unitario, (vd.cantidad*vd.precio_unitario) as subtotal from ventas v join clientes c on c.id_cliente=v.id_cliente join detalle_ventas vd on v.id_venta=vd.id_venta join productos p on vd.id_producto=p.id_producto where v.id_cliente=? " ,[id_cliente]);
      return rows as any;
    }
    async TotalGastadoPorCliente(id_cliente: number): Promise<any[]> {
      const [rows]= await connector.query(`
        select c.id_cliente, c.nombre, sum(vd.cantidad * vd.precio_unitario) as total_gastado
        from clientes c 
        join ventas v on c.id_cliente = v.id_cliente
        join detalle_ventas vd on  v.id_venta = vd.id_venta 
        where c.id_cliente = ? 
        group by c.id_cliente, c.nombre
        `, [id_cliente])
        return rows as any;
    }
    
}