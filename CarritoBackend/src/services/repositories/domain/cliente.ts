export interface Cliente {
    id_cliente?: number;        // lo ponemos opcional porque al crear aún no existe
    nombre: string;
    email:string;
    direccion: string,
    telefono: string;
    password?: string; //lo ponemos opcional porque no siempre lo vamos a necesitar
    estado?: 'activo' | 'inactivo';
}
