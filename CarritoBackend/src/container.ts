//Inyeccion de dependencias con Awilix
import { createContainer } from "awilix"
import { scopePerRequest } from "awilix-express"
import express = require('express');
import { asClass } from "awilix";
import { ProductoService } from "./services/producto.service";

export default (app: express.Application) => {
    const container = createContainer({
        injectionMode: 'CLASSIC'
    })
    container.register({
        //Inyeccion de servicios
        productoService: asClass(ProductoService).scoped()
    });
    app.use(scopePerRequest(container));
}
