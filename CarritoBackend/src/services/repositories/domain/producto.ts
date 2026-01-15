// src/services/repositories/domain/producto.ts
export interface Producto {
  id_producto?: number;        // lo ponemos opcional porque al crear aún no existe
  id_proveedor: number;
  id_categoria: number;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagen_url: string;
  
  
}   