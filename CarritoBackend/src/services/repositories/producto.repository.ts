// src/services/repositories/producto.repository.ts
import { Producto } from "./domain/producto";

export interface ProductoRepository {
  findAll(): Promise<Producto[]>;
  findById(id: number): Promise<Producto | null>;
  BuscarPorPrecioAlto(): Promise<Producto[]>;
  create(product: Producto): Promise<number>;
  update(id: number, product: any): Promise<void>;
  delete(id: number): Promise<void>;
  ExisteVentaConProducto(id_producto: number): Promise<boolean>;
  productosMenorStock(): Promise<Producto[]>;
  productoMasVendido(): Promise<any>;
  updateStock(id: number, newStock: number): Promise<void>;
  productosPorCategoria(id_categoria: number): Promise<Producto[]>;
  
}


// Esta interfaz define los métodos que cualquier implementación de repositorio de productos debe tener.
