import { Request, Response } from 'express';
import { DELETE, GET, POST, PUT, route } from 'awilix-router-core';
import { BaseController } from '../common/base.controller';
import { CarritoService } from '../services/carrito.service';

@route('/carrito')
export class CarritoController extends BaseController {
    private readonly carritoService = new CarritoService();

    // POST /carrito → crear un carrito
    @POST()
    public async crearCarrito(req: Request, res: Response) {
        try {
            const { id_cliente } = req.body;
            const carrito = await this.carritoService.crearCarrito(id_cliente);
            res.status(201).send({ carrito, message: 'Carrito creado exitosamente' });
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    // GET /carrito/:id_cliente → obtener carrito del cliente
    @route('/:id_cliente')
    @GET()
    public async obtenerCarrito(req: Request, res: Response) {
        try {
            const carrito = await this.carritoService.obtenerCarrito(Number(req.params.id_cliente));
            res.send(carrito);
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    // GET /carrito/items/:id_carrito → obtener items del carrito
    @route('/items/:id_carrito')
    @GET()
    public async obtenerItems(req: Request, res: Response) {
        try {
            const items = await this.carritoService.obtenerItems(Number(req.params.id_carrito));
            res.send(items);
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    // POST /carrito/items → agregar producto al carrito
    @route('/items')
    @POST()
    public async agregarProducto(req: Request, res: Response) {
        try {
            const { id_carrito, id_producto, cantidad } = req.body;
            const item = await this.carritoService.agregarProducto(
                Number(id_carrito),
                Number(id_producto),
                Number(cantidad)
            );
            res.status(201).send(item);
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    // PUT /carrito/items → actualizar cantidad de un producto
    @PUT()
    @route('/items')
    public async actualizarProducto(req: Request, res: Response) {
        try {
            const { id_item, cantidad } = req.body;
            const item = await this.carritoService.actualizarProducto(Number(id_item), Number(cantidad));
            res.send(item);
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    // DELETE /carrito/items/:id_item → eliminar producto del carrito
    @route('/items/:id_item')
    @DELETE()
    public async eliminarProducto(req: Request, res: Response) {
        try {
            await this.carritoService.eliminarProducto(Number(req.params.id_item));
            res.send({ message: 'Producto eliminado del carrito' });
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    // DELETE /carrito/:id_carrito/vaciar → vaciar carrito
    @route('/:id_carrito/vaciar')
    @DELETE()
    public async vaciarCarrito(req: Request, res: Response) {
        try {
            await this.carritoService.vaciarCarrito(Number(req.params.id_carrito));
            res.send({ message: 'Carrito vaciado' });
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    // POST /carrito/checkout → confirmar compra
    @route('/checkout')
    @POST()
    public async checkout(req: Request, res: Response) {
        try {
            const { id_carrito } = req.body;
            await this.carritoService.realizarCheckout(Number(id_carrito));
            res.send({ message: 'Compra realizada con éxito' });
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }
}
