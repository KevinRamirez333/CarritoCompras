// src/services/producto.service.ts
import { Producto } from "./repositories/domain/producto";
import { ProductoRepositoryMySQL } from "./repositories/implements/mysql/producto.repository.mysql";

export  class ProductoService {
  private repository = new ProductoRepositoryMySQL();

  // Obtener todos los productos
  async getAll(): Promise<Producto[]> {
    return this.repository.findAll();
  }

  // Obtener un producto por ID
  async getById(id: number): Promise<Producto> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return product;
  }
//Obtener productos con precio mayor a 1000
  async getByPrecioAlto(): Promise<Producto[]>{
    return this.repository.BuscarPorPrecioAlto();
  }
  // Crear producto
  async create(product: Producto): Promise<number> {
    if (
      !product.nombre ||
      !product.stock ||
      product.precio <= 0 ||
      product.stock < 0 ||
      !product.id_categoria
    ) {
      throw new Error("Datos inválidos para producto");
    }
    return this.repository.create(product);
  }

  // Actualizar producto
  async update(id: number, product: any): Promise<void> {
    const exists = await this.repository.findById(id);
    if (!exists  ) {
      throw new Error("Producto no encontrado");
    }
    else if (
      product.stock <= 0 ||
      product.precio <= 0 
    ) {
      throw new Error("Stock o precio inválido");
    }
    await this.repository.update(id, product);
  }

  // Eliminar producto
  async delete(id: number): Promise<void> {
    const exists = await this.repository.findById(id);
    const tieneVentas = await this.repository.ExisteVentaConProducto(id);
    if (tieneVentas) {
      throw new Error("No se puede eliminar el producto porque tiene ventas asociadas");
    }
    if (!exists) {
      throw new Error("Producto no encontrado");
    }
    await this.repository.delete(id);
  }
  async productosMenorStock(): Promise<Producto[]> {
    if ((await this.repository.productosMenorStock()).length === 0) {
      throw new Error("No hay productos con stock menor a 5");
    }
    return this.repository.productosMenorStock();
  }
  async productoMasVendido(): Promise<any> {
    const producto = await this.repository.productoMasVendido();
    return producto;
  }
  async updateStock(id: number, newStock: number): Promise<void> {
    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new Error("Producto no encontrado");
    }
    return this.repository.updateStock(id, newStock);
  }
  async ProductosPorCategoria(id_categoria: number): Promise<any> {

    if (!id_categoria || id_categoria <= 0) {
      throw new Error("ID de categoría inválido");
    }
    //No se encontraron productos en esa categoría
    if ((await this.repository.productosPorCategoria(id_categoria)).length === 0) {
      throw new Error("No se encontraron productos en esa categoría");
    }

    const productos = await this.repository.productosPorCategoria(id_categoria);
    //Filtrar solo los campos necesarios
    const productosFiltrados = productos.map((p) => ({
      nombreCategoria: p.nombreCategoria,
      nombre: p.nombre,
      precio: p.precio,
      existencia: p.stock
  }));
   return productosFiltrados;
  }

}
