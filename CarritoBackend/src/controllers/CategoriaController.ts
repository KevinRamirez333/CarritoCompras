import { Request, Response } from 'express';
import { DELETE, GET, POST, PUT, route } from 'awilix-router-core';
import { BaseController } from '../common/base.controller';
import { CategoriaService } from '../services/categoria.service';

@route('/categorias')
export class CategoriaController extends BaseController {
    private readonly categoriaService = new CategoriaService();

    //POST/categorias
    @POST()
    public async createCategoria(req: Request, res: Response){
        try{
            const result = await this.categoriaService.createCategoria(req.body.nombre);
            res.status(201).send({id: result, message: "Categoría creada exitosamente"});
        }
        catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    // DELETE /categorias/:id
    @route('/:id')
    @DELETE()
    public async deleteCategoria(req: Request, res: Response) {
        try {
            const result = await this.categoriaService.deleteCategoria(parseInt(req.params.id));
            res.send(result);
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }
}