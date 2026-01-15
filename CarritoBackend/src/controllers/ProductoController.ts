// src/controllers/ProductoController.ts
import { Request, Response } from 'express';
import { DELETE, GET, POST, PUT, route } from 'awilix-router-core';
import { BaseController } from '../common/base.controller';
import { ProductoService } from '../services/producto.service';
import { Producto } from '../services/repositories/domain/producto';
import { parse } from 'path';


@route('/productos')
export class ProductoController extends BaseController {
  private readonly productoService = new ProductoService();

  // GET /productos
  @GET()
  public async getAllProductos(req: Request, res: Response) {
    try {
      const productos = await this.productoService.getAll();
      res.send(productos);
    } catch (error) {
      this.handleException(error, res);
    }
  }
  // Get /Productos/mas-vendido
  @route('/mas-vendido')
  @GET()
  public async getProductoMasVendido(req: Request, res: Response) {
    try {
      const producto = await this.productoService.productoMasVendido();
      res.send(producto);
    }
    catch (error){
      this.handleException(error, res);
    }
  }

  @route('/menor-stock')
  @GET()
  public async getProductosMenorStock(req: Request, res: Response) {
    try {
      const productos = await this.productoService.productosMenorStock();
      res.send(productos);
    } catch (error) {
      const err = error as Error;
      res.status(404).send({ message: err.message });
      this.handleException(error, res);
    }
  }
  // GET /productos/precio-alto
  @route('/caros')
  @GET()
  public async getProductosByPrecioAlto(req: Request, res: Response) {
    try{
      const productos = await this.productoService.getByPrecioAlto();
      res.send(productos);
    }
    catch (error) {
      this.handleException(error, res);
    }
  }
  //Get productos por categoria
  @route('/categorias/:id_categoria')
  @GET()
  public async getProductosPorCategoria(req:Request, res:Response){
    try{
      const id_categoria = parseInt(req.params.id_categoria);
      const productos = await this.productoService.ProductosPorCategoria(id_categoria);
      res.send(productos);
    }
    catch(error){
      const err = error as Error;
      res.status(404).send({message: err.message});
      this.handleException(error, res);
      
  
    }

  }
  // GET /productos/:id
  @route('/:id')
  @GET()
  public async getProductoById(req: Request, res: Response) {
    try {
      const producto = await this.productoService.getById(parseInt(req.params.id));
      res.send(producto);
    } catch (error) {
      res.status(404).send({ message: "Producto no encontrado" });
      this.handleException(error, res);
    }
  }



  // POST /productos
  @POST()
  public async createProducto(req: Request, res: Response) {
    try {
      const producto = {
        nombre: req.body.nombre,
        precio: req.body.precio,
        stock: req.body.stock,
        id_categoria: req.body.id_categoria,
        id_proveedor: req.body.id_proveedor,
        descripcion: req.body.descripcion,
        imagen_url: req.body.imagen_url
      };
      const nuevoId = await this.productoService.create(producto);
      res.status(201).send({ id: nuevoId });
    } catch (error) {
      this.handleException(error, res);
    }
  }
  //Actualizar stock 
  @route('/stocks/:id')
  @PUT()
  public async updateStock(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const newStock = req.body.stock;

      await this.productoService.updateStock(id, newStock);
      res.status(200).send({ message: "Stock actualizado correctamente" });
    }
    catch (error){
      const err = error as Error;
      res.status(404).send({ message: err.message });
    }
  }
  // PUT /productos/:id
  @route('/:id')
  @PUT()
  public async updateProducto(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const producto = {
        nombre: req.body.nombre,
        precio: req.body.precio,
        stock: req.body.stock,
        descripcion: req.body.descripcion
      };
      await this.productoService.update(id, producto);
      res.status(200).send({message: "Producto actualizado correctamente" });
    } catch (error) {
      const err = error as Error;
      res.status(404).send({ message: err.message });
      this.handleException(error, res);
      
    }
  }

  // DELETE /productos/:id
  @route('/:id')
  @DELETE()
  public async deleteProducto(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await this.productoService.delete(id);
      res.status(200).send({ message: "Producto eliminado correctamente" });
    } catch (error) {
      const err = error as Error;
      res.status(404).send({ message: err.message });
      this.handleException(error, res);
    }
  }
}
