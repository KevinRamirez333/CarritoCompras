import { Request, Response } from 'express';
import { DELETE, GET, POST, PUT, route } from 'awilix-router-core';
import { BaseController } from '../common/base.controller';
import { ClienteService } from '../services/cliente.service';
@route('/clientes')
export class ClienteController extends BaseController {
    private readonly clienteService = new ClienteService();

    // GET /clientes
    // GET /clientes - ÚNICO GET que maneja ambos casos
  // GET /clientes - Maneja paginación y búsqueda
    @GET()
    public async getClientes(req: Request, res: Response) {
        try {
            const termino = req.query.q as string;
            const pagina = parseInt(req.query.pagina as string) || 1;
            const limite = parseInt(req.query.limite as string) || 10;
            // Si hay término de búsqueda, buscar
            if (termino && termino.trim()) {
                console.log('🔍 Búsqueda con término:', termino);
                const clientes = await this.clienteService.searchClientes(termino.trim());
                return res.status(200).send(clientes);
            }
            
            // Si no hay término, devolver paginado
            console.log('📄 Obteniendo clientes paginados - página:', pagina, 'límite:', limite);
            const resultado = await this.clienteService.getClientesPaginados(pagina, limite);
            res.status(200).send(resultado);
            
        } catch (error) {
            const err = error as Error;
            console.error('❌ Error en getClientes:', err.message);
            res.status(500).send({ message: err.message });
        }
    }

    // GET /clientes/:id
    @route('/:id')
    @GET()
public async getClienteById(req: Request, res: Response) {
  try {
    const id_cliente = parseInt(req.params.id);
    const cliente = await this.clienteService.findById(id_cliente);

    if (!cliente) {
      return res.status(404).send({ message: 'Cliente no encontrado' });
    }

    // Excluir el campo password
    const { password, ...clienteSinPassword } = cliente;

    res.status(200).json(clienteSinPassword);
  } catch (error) {
    const err = error as Error;
    res.status(500).send({ message: err.message });
  }
}

 
    // POST /clientes
    @POST()
    public async createCliente(req: Request, res: Response) {
        try {
            const cliente = {
                nombre: req.body.nombre,
                email: req.body.email,
                direccion: req.body.direccion,
                telefono: req.body.telefono,
                password: req.body.password

            };
            const result = await this.clienteService.CreateCliente(cliente);
            res.status(201).send({ id: result });
            }
            
            
        catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }

    }
    // PUT /clientes/:id
   @route('/:id')
    @PUT()
    public async updateCliente(req: Request, res: Response) {
        try {
            const id_cliente = parseInt(req.params.id);
            const clienteData = {
                nombre: req.body.nombre,
                email: req.body.email,
                direccion: req.body.direccion,
                telefono: req.body.telefono,
                estado: req.body.estado // Ahora acepta estado también
            };
            
            await this.clienteService.updateCliente(id_cliente, clienteData);
            res.status(200).send({ message: 'Cliente actualizado correctamente' });
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }
        // PATCH /clientes/:id/baja
    @route('/:id/baja')
    @PUT() // o @PATCH() si tienes awilix-router-core actualizado
    public async darDeBajaCliente(req: Request, res: Response) {
        try {
            const id_cliente = parseInt(req.params.id);
            await this.clienteService.darDeBajaCliente(id_cliente);
            res.status(200).send({ message: 'Cliente dado de baja correctamente' });
        } catch (error) {
            const err = error as Error;
            if (err.message === 'Cliente no encontrado') {
                res.status(404).send({ message: err.message });
            } else {
                res.status(500).send({ message: err.message });
            }
        }
    }

    // PATCH /clientes/:id/reactivar
    @route('/:id/reactivar')
    @PUT() // o @PATCH()
    public async reactivarCliente(req: Request, res: Response) {
        try {
            const id_cliente = parseInt(req.params.id);
            await this.clienteService.reactivarCliente(id_cliente);
            res.status(200).send({ message: 'Cliente reactivado correctamente' });
        } catch (error) {
            const err = error as Error;
            if (err.message === 'Cliente no encontrado') {
                res.status(404).send({ message: err.message });
            } else {
                res.status(500).send({ message: err.message });
            }
        }
    }

    // PUT /clientes/:id - ACTUALIZADO para manejar estado
    
    // DELETE /clientes/:id
    @route('/:id')
    @DELETE()
    public async deleteCliente(req:Request,res:Response){
        try {
            const id = parseInt(req.params.id);
            await this.clienteService.deleteCliente(id);
            res.status(200).send({message: "Cliente eliminado correctamente"});
        }
        catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }
}