import {CategoriaRepositoryMySQL} from './repositories/implements/mysql/categoria.repository.mysql';
export class CategoriaService {
    private repository = new CategoriaRepositoryMySQL();

    async createCategoria(nombre:string): Promise<any>{
        const result= this.repository.createCategoria(nombre);
        return result;
    }

    async deleteCategoria(id:number): Promise<any>{
        const result= this.repository.deleteCategoria(id);
        return result;
    
    }
}