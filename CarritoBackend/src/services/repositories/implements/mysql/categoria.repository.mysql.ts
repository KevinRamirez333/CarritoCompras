import connector from "../../../../common/persistence/persistence.mysql";
import { CategoriaRepository } from "../../categoria.repository";

export class CategoriaRepositoryMySQL implements CategoriaRepository {
    async createCategoria(nombre: string): Promise<any>{
        const existe = await connector.query("select * from categorias where nombre = ?", [nombre]);
        if ((existe as any)[0].length > 0) {
            throw new Error("La categoría ya existe");
        }
    
        const [result] = await connector.query("Insert into categorias (nombre) values (?)", [nombre]);
        return (result as any).insertId;
    }
    async deleteCategoria(id: number): Promise<any> {
        const existenProductos = await connector.query( "select * from productos where id_categoria = ?",[id]);
            
        if ((existenProductos as any)[0].length > 0) {
            throw new Error("No se puede eliminar la categoría porque existen productos asociados a ella.");
        }
        else{
            const result = await connector.query("DELETE FROM categorias WHERE id_categoria = ?", [id]);
            if ((result as any)[0].affectedRows === 0) {
                throw new Error("Categoría no encontrada");
            }
            else{
                return  "Categoría eliminada exitosamente";
            
            }
        } 
    }
}