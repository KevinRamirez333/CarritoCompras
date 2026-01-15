# 🛒 TechCart - Carrito de Compras Tecnológico

Este es un proyecto Fullstack desarrollado para gestionar ventas de productos tecnológicos. Permite administrar clientes, visualizar productos y registrar ventas de forma eficiente, integrando validaciones de tipos tanto en el cliente como en el servidor.

## 🚀 Tecnologías Utilizadas

### Frontend
- **React** con **TypeScript**
- Gestión de estado y consumo de API.
- Diseño de interfaces dinámicas.

### Backend
- **Node.js** con **TypeScript**
- API REST para la gestión de datos.
- **MySQL** como base de datos relacional.

---

## 📋 Funcionalidades principales

El sistema se divide en tres interfaces clave:

1. **Autenticación:** Pantalla de inicio de sesión para acceso seguro.
2. **Gestión de Clientes:** - Selección de cliente por ID.
   - Listado completo de clientes con funciones de búsqueda.
   - CRUD completo (Crear, Leer, Actualizar) de la información de clientes.
3. **Carrito de Ventas:**
   - Búsqueda de productos por ID.
   - Visualización dinámica de descripción e imagen del producto.
   - Gestión de carrito (agregar/eliminar productos).
   - Registro final de la venta en la base de datos.

---

## 📂 Estructura del Proyecto

- `/carrito-frontend`: Código fuente de la interfaz en React.
- `/carrito-backend`: Lógica del servidor y conexión a DB en Node.js.
- `/database`: Scripts SQL para la creación de tablas y datos iniciales.

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

### 1. Base de Datos
Importa el archivo `.sql` ubicado en la carpeta `/database` en tu servidor MySQL (puedes usar MySQL Workbench).

### 2. Backend
1. Entra a la carpeta: `cd carrito-backend`
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` basado en `.env.example` y configura tus credenciales de MySQL.
4. Inicia el servidor: `npm run start` (o el comando que uses).

### 3. Frontend
1. Entra a la carpeta: `cd carrito-frontend`
2. Instala las dependencias: `npm install`
3. Inicia la aplicación: `npm run start`
