import { AplicationException } from "./application.exception";
import { Response } from "express";

//abstract class es una clase que solo puede ser heredada
export abstract class BaseController{
    handleException(err: any, res:Response){
        if(err instanceof AplicationException){
            res.status(400);
            res.send();
        } else {
            throw new Error(err);
        }
    }
}