import { Request, Response } from 'express';
import { DELETE, GET, POST, PUT, route } from 'awilix-router-core';
import { BaseController } from '../common/base.controller';
import { VentaService } from '../services/venta.service';

@route('/ventas')
export class VentaController extends BaseController {
    private readonly ventaService = new VentaService();
    //Get /ventas/clientes/sin-compras
    @route('/clientes/sin-compras')
    @GET()
    public async getClienteSinCompras(req: Request, res: Response) {
        try{
            const clientes = await this.ventaService.getClienteSinCompras();
            res.send(clientes);
        }
        catch (error){
            this.handleException(error, res);
        }
    }
    //Get /detalle/clientes/:id
    @route ('/gastos/clientes/:id')
    @GET()
    public async getTotalGastosCliente(req: Request, res: Response){
        try{
            const id_cliente = parseInt(req.params.id);
            const total= await this.ventaService.getTotalGastadoPorCliente(id_cliente)
            res.send(total);
        }
        catch (error){
            const err = error as Error;
            res.status(404).send({message: err.message});
        }
    }

    @route ('/detalles/clientes/:id')
    @GET()

    public async getVentaDetalleporCliente(req: Request, res:Response){
        try{
            const id_cliente = parseInt(req.params.id)
            const ventaDetalle = await this.ventaService.getVentasDetallePorCliente(id_cliente);
            res.send(ventaDetalle);
        }
        catch(error) {
            const err = error as Error;
            res.status(404).send({message: err.message})
            this.handleException(error,res);
        }
    }
    // GET /ventas/clientes/tops

    @route('/clientes/tops')
    @GET()
    public async getClienteConMasCompras(req: Request, res: Response) {
        try{
            const cliente = await this.ventaService.getClienteConMasCompras();
            res.send(cliente);
        }
        catch (error){
            this.handleException(error, res);
        }
    }
    // GET /ventas/cliente/:id_cliente
    @route('/clientes/:id_cliente')
    @GET()
    public async getVentasPorCliente(req: Request, res: Response) {
        try{
            const id_cliente = parseInt(req.params.id_cliente);
            const ventas = await this.ventaService.getVentasPorCliente(id_cliente);
            res.send(ventas);
        }
        catch (error) {
            this.handleException(error, res);
        }
    }
    // GET /ventas/detalle/:id_venta    
    @route('/detalles/:id_venta')
    @GET()
    public async getDetalleVenta(req: Request, res: Response) {
        try{
            const id_venta = parseInt(req.params.id_venta);
            const detalle = await this.ventaService.getDetalleVenta(id_venta);
            res.send(detalle);
        }
        catch (error){
            this.handleException(error, res);
        }
    }
    // POST /ventas
    @POST()
    public async createVenta(req: Request, res: Response) {
        try{
            const { id_cliente, fecha, detalles } = req.body;
            const result = await this.ventaService.createVenta(id_cliente, fecha, detalles);
            res.status(201).send(result);
        }
        catch (error){
            this.handleException(error, res);
        }
    }
}