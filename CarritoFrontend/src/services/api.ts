import axios from 'axios';

const API_URL = 'http://localhost:3000'; // o donde esté corriendo tu backend

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//  NUEVO: Servicio de autenticación
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/usuarios/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (email: string, password: string, nombre?: string) => {
    const response = await api.post('/usuarios', {
      email,
      password,
      nombre,
    });
    return response.data;
  },
};


export const crearCarrito = (id_cliente: number) =>
  api.post('/carrito', { id_cliente });

export const obtenerCarrito = (id_cliente: number) =>
  api.get(`/carrito/${id_cliente}`);

export const agregarProducto = (id_carrito: number, id_producto: number, cantidad: number) =>
  api.post('/carrito/items', { id_carrito, id_producto, cantidad });

export const actualizarProducto = (id_item: number, cantidad: number) =>
  api.put('/carrito/items', { id_item, cantidad });

export const eliminarProducto = (id_item: number) =>
  api.delete(`/carrito/items/${id_item}`);

export const vaciarCarrito = (id_carrito: number) =>
  api.delete(`/carrito/${id_carrito}/vaciar`);

export const checkoutCarrito = (id_carrito: number) =>
  api.post('/carrito/checkout', { id_carrito });

export const obtenerItems = (id_carrito: number) =>
  api.get(`/carrito/items/${id_carrito}`);

export const obtenerProducto = (id: number) =>
  api.get(`/productos/${id}`);




// Obtener cliente por ID
export const obtenerCliente = (id: number) =>
  api.get(`/clientes/${id}`);
// Crear nuevo cliente
export const crearCliente = (clienteData: {
  nombre: string;
  email: string;
  direccion?: string;
  telefono?: string;
  password: string;
}) =>
  api.post('/clientes', clienteData);




export const obtenerClientes = (pagina: number = 1, limite: number = 10) =>
  api.get(`/clientes?pagina=${pagina}&limite=${limite}`);

// Buscar clientes por nombre o email
export const buscarClientes = (termino: string) =>
  api.get(`/clientes?q=${encodeURIComponent(termino)}`);

// Dar de baja cliente (cambiar estado a inactivo)
export const darDeBajaCliente = (id: number) =>
  api.put(`/clientes/${id}/baja`);

// Reactivar cliente (cambiar estado a activo)  
export const reactivarCliente = (id: number) =>
  api.put(`/clientes/${id}/reactivar`);

// Actualizar cliente
export const actualizarCliente = (id: number, clienteData: any) =>
  api.put(`/clientes/${id}`, clienteData);



// Nueva función: Crear venta directamente (integra con VentaController)
export const crearVenta = (ventaData: {
  id_cliente: number;
  fecha: string;
  detalles: Array<{
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    // Agrega subtotal si tu service lo necesita
  }>;
}) =>
  api.post('/ventas', ventaData);

  