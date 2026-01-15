process.env.NODE_ENV = process.env.NODE_ENV || 'configuration';
process.env.APP_ENV = process.env.APP_ENV || 'configuration';

import dotenv = require('dotenv');
import cors from "cors";

dotenv.config({
    path: `${__dirname}/../config/${process.env.APP_ENV}.env`
});

import express = require('express');

import { loadControllers } from 'awilix-express';
import loadContainer from './container';



//Variable de tipo express.Application
const app: express.Application = express();
app.use(cors()); //Habilitar CORS para que pueda ser consumida por el frontend (react)
//Cargara todos los controladores de la carpeta controllers
app.use(express.json());
loadContainer(app); 

app.use(loadControllers(
    'controllers/*.ts',
    {cwd: __dirname}
));

export{app}


