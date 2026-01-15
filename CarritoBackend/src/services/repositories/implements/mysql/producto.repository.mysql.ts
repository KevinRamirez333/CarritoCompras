// src/services/repositories/implements/mysql/producto.repository.mysql.ts
import connector from "../../../../common/persistence/persistence.mysql";
import { Producto } from "../../domain/producto";
import { ProductoRepository } from "../../producto.repository";

export class ProductoRepositoryMySQL implements ProductoRepository {
  async findAll(): Promise<Producto[]> {
    const [rows] = await connector.query("SELECT * FROM productos");
    return rows as Producto[];
  }

  async findById(id: number): Promise<Producto | null> {
    const [rows] = await connector.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
    const result = (rows as Producto[])[0];
    return result || null;
  }

    async BuscarPorPrecioAlto(): Promise<Producto[]>{
    const [rows]= await connector.query("select * from productos where precio >1000");
    return rows as Producto[];
  }
  async create(product: Producto): Promise<number> {
    const [result] = await connector.query(
      "INSERT INTO productos (nombre,precio,stock,id_categoria,id_proveedor, descripcion, imagen_url) VALUES ( ?, ?, ?,?,?,?,?)",
      [product.nombre, product.precio, product.stock,product.id_categoria,product.id_proveedor, product.descripcion, product.imagen_url]
    );
    return (result as any).insertId;
  }

  async update(id: number, product: any): Promise<void> {
    await connector.query(
      "UPDATE productos SET nombre = ?, precio = ?, stock= ?,descripcion=? WHERE id_producto = ?",
      [product.nombre, product.precio, product.stock, product.descripcion, id]
    );
  }

  async delete(id: number): Promise<void> {

    await connector.query("DELETE FROM productos WHERE id_producto = ?", [id]);
  }

  async ExisteVentaConProducto(id_producto: number): Promise<boolean> {
    const [rows] = await connector.query(
      "SELECT COUNT(*) as count FROM detalle_ventas WHERE id_producto = ?",
      [id_producto]
    );
    const count = (rows as any)[0].count;
    return count > 0;
  }
  async productosMenorStock(): Promise<Producto[]> {
    const [rows] = await connector.query(
      "SELECT * FROM productos WHERE stock < 5"
    );
    return rows as Producto[];
  }
  async productoMasVendido(): Promise<any> {
    const [rows] = await connector.query(
      `SELECT p.id_producto, p.nombre, SUM(dv.cantidad) AS total_vendido
       FROM productos p
       JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
       GROUP BY p.id_producto, p.nombre
       ORDER BY total_vendido DESC
       LIMIT 1`
    );
    return (rows as any)[0] || null;
  }
  async updateStock(id: number, newStock: number): Promise<void> {
    //Verificar el stock actual del producto
    const [rows] = await connector.query("select stock from productos where id_producto = ?", [id]);
    
    if ((rows as any).length === 0) {
      throw new Error("Producto no encontrado");
    }

    const stockActual = (rows as any)[0]?.stock;
    const stockFinal = stockActual + newStock;

    if (stockFinal <0){
      throw new Error("Stock insuficiente");
    }

    await connector.query("update productos set stock = stock + ? where id_producto = ?", [newStock, id]);
    return;
  }
  async productosPorCategoria(id_categoria: number): Promise<any[]> {
    const [rows] = await connector.query("SELECT c.nombre as nombreCategoria, p.id_producto, p.nombre, p.precio, p.stock FROM productos p join categorias c ON p.id_categoria = c.id_categoria where p.id_categoria= ?", [id_categoria]);
    return rows as any[];
  }
}
