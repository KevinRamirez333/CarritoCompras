// usuario.controller.ts
import { Request, Response } from 'express';
import { POST, route } from 'awilix-router-core';
import { BaseController } from '../common/base.controller';
import { UsuarioService } from '../services/usuario.service';
import { LoginRequest, CreateUserRequest } from '../services/repositories/domain/usuario';

@route('/usuarios')
export class UsuarioController extends BaseController {
    private readonly usuarioService = new UsuarioService();

    @route('/login')
    @POST()
    public async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body as LoginRequest;
            
            // Validación adicional en el controlador
            if (!email || !password) {
                return res.status(400).send({ message: 'Email y contraseña son requeridos.' });
            }

            const result = await this.usuarioService.login(email, password);
            res.status(200).send(result);
        } catch (error) {
            const err = error as Error;
            res.status(401).send({ message: err.message });
            this.handleException(error, res);
        }
    }

    @POST()
    public async createUser(req: Request, res: Response) {
        try {
            const { email, password, nombre } = req.body as CreateUserRequest;
            
            // Validación adicional en el controlador
            if (!email || !password) {
                return res.status(400).send({ message: 'Email y contraseña son requeridos.' });
            }

            const result = await this.usuarioService.createUser(email, password, nombre);
            res.status(201).send(result);
        } catch (error) {
            const err = error as Error;
            res.status(400).send({ message: err.message });
            this.handleException(error, res);
        }
    }
}