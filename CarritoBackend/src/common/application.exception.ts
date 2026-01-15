//Personalizado para el manejo de excepciones en la aplicacion
export class AplicationException extends Error {
    constructor(message: string= 'Ocurrio un error desconocido'){
        super(message);
    }
}