import {Categoria} from './domain/categoria';

export interface CategoriaRepository {
    createCategoria(nombre:string): Promise<any>;
    deleteCategoria(id:number): Promise<any>;

}
