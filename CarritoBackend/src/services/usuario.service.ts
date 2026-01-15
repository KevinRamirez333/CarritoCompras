// usuario.service.ts - VERSIÓN DEFINITIVA
import { UsuarioRepositoryMySQL } from './repositories/implements/mysql/usuario.repository.mysql';
import { Usuario } from './repositories/domain/usuario';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UsuarioService {
    private repository = new UsuarioRepositoryMySQL();

    //  CLAVE JWT FIJA PARA DESARROLLO
    private JWT_SECRET = 'mi_clave_secreta_super_segura_para_desarrollo_123456';

    async login(email: string, password: string): Promise<any> {
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos.');
        }

        const usuario = await this.repository.findByEmail(email);
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        const isValid = await bcrypt.compare(password, usuario.password_hash);
        if (!isValid) {
            throw new Error('Contraseña incorrecta.');
        }

        //  USAR CLAVE DIRECTA
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email }, 
            this.JWT_SECRET, //  Clave fija
            { expiresIn: '1h' }
        );
        
        return { message: 'Login exitoso.', token };
    }

    async createUser(email: string, password: string, nombre?: string): Promise<any> {
        if (!email || !email.trim()) {
            throw new Error('El email es requerido.');
        }

        if (!password || !password.trim()) {
            throw new Error('La contraseña es requerida.');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        const existingUser = await this.repository.findByEmail(email);
        if (existingUser) {
            throw new Error('El email ya está registrado.');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user: Usuario = { 
            email: email.trim(), 
            password_hash: passwordHash, 
            nombre: nombre?.trim() 
        };
        
        const id = await this.repository.create(user);
        return { message: 'Usuario creado exitosamente.', id };
    }
}