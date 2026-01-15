/*IMPORTANTE
El proyecto no incluye la carpeta node_modules para reducir el tamaño del archivo.
*/

import React, { useState, useEffect } from 'react';
import { GestionClientes } from './GestionClientes';
import { 
  obtenerCarrito, 
  obtenerItems, 
  agregarProducto, 
  crearCarrito, 
  obtenerProducto,
  obtenerCliente,
  eliminarProducto,
  crearVenta,
  vaciarCarrito
} from '../services/api';
import { Login } from '../components/Login';

// Modelo de Item en el carrito (de carrito_items – tiene id_item, cantidad, etc.)
interface Item {
  id_item: number;
  id_carrito: number;  // De tu JSON (opcional, pero completo)
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// Modelo de producto (de productos – solo detalles)
interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
}

// Modelo simple para cliente
interface Cliente {
  id_cliente: number;
  nombre: string;
  email: string;
  direccion?: string;
  telefono?: string;
  estado: 'activo' | 'inactivo';
}

export const Carrito = () => {
  // Estados existentes (sin cambios)
  const [carritoId, setCarritoId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [productosEnCarrito, setProductosEnCarrito] = useState<Producto[]>([]);
  const [productoBuscado, setProductoBuscado] = useState<Producto | null>(null);
  const [idProductoInput, setIdProductoInput] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //GestionClientes
  const [showGestionClientes, setShowGestionClientes] = useState<boolean>(false);

  // Estados simplificados para cliente (sin cambios)
  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [clienteCargado, setClienteCargado] = useState<boolean>(false);

  //estados para login 
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string; id?: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLoginSuccess = (userData: { email: string; id?: number }) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
    setShowLogin(false);
  };

   //  NUEVA FUNCIÓN: Cerrar sesión
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setClienteCargado(false);
    setIdCliente(null);
    setItems([]);
    setCarritoId(null);
    setProductosEnCarrito([]);
  };



  // Función simplificada: Verificar cliente y cargar carrito (sin cambios)
  const manejarCliente = async () => {
    const idNum = Number(idCliente);
    if (!idCliente || idNum <= 0) {
      setError('Ingresa un ID de cliente válido.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Verificar si el cliente existe
      const resCliente = await obtenerCliente(idNum);
      if (resCliente.data && resCliente.data.id_cliente) {
        // Cliente existe: Cargar carrito
        setIdCliente(idNum);
        setClienteCargado(true);
        alert(`Cliente ${resCliente.data.nombre} cargado exitosamente.`);
        await cargarCarrito(idNum);
      } else {
        // No existe: Solo error
        setError('Cliente no encontrado. Verifica el ID e inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error verificando cliente:', error);
      setError('Cliente no encontrado. Verifica el ID o el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Función: Cargar carrito (versión limpia, sin logs)
  const cargarCarrito = async (clienteId: number) => {
    try {
      setError(null);
      let carrito;

      const res = await obtenerCarrito(clienteId);

      if (!res.data || !res.data.id_carrito) {
        const nuevo = await crearCarrito(clienteId);
        carrito = nuevo.data.carrito;
      } else {
        carrito = res.data;
      }

      setCarritoId(carrito.id_carrito);

      const itemsRes = await obtenerItems(carrito.id_carrito);
      setItems(itemsRes.data || []);

      // Si hay items, carga detalles (productosEnCarrito)
      if (itemsRes.data && itemsRes.data.length > 0) {
        await cargarDetallesItems(itemsRes.data);
      } else {
        setProductosEnCarrito([]);  // Limpia si vacío
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      setError('Error al cargar el carrito para este cliente.');
    }
  };

  // Función: Eliminar item del carrito (CORREGIDA: Solo actualiza items, recarga para sincronizar)
  const handleEliminarItem = async (id_item: number) => {
    if (!id_item || !carritoId || !idCliente) {
      setError('No se puede eliminar: carrito o cliente no válido.');
      return;
    }

    const confirmar = window.confirm('¿Estás seguro de eliminar este producto del carrito?');
    if (!confirmar) return;

    try {
      setLoading(true);
      setError(null);

      const res = await eliminarProducto(id_item);
      
      if (res.status === 200) {
        // Actualizar solo items (tiene id_item – TS OK)
        setItems(prevItems => prevItems.filter(item => item.id_item !== id_item));
        
        // NO tocar productosEnCarrito (no tiene id_item) – se sincroniza con recarga
        alert(res.data?.message || 'Producto eliminado del carrito exitosamente.');
        
        // Recarga completa: Sincroniza items + productosEnCarrito + total
        await cargarCarrito(idCliente!);
      } else {
        setError(`Error inesperado al eliminar: Status ${res.status}.`);
        alert(`Error: Status ${res.status}`);
      }
    } catch (error: any) {
      console.error('Error al eliminar item:', error);
      
      let mensajeError = 'Error al eliminar el producto del carrito.';
      if (error.response?.status === 400) {
        mensajeError = error.response.data?.message || 'Item no encontrado en el carrito.';
      } else if (error.response?.status === 500) {
        mensajeError = 'Error interno del servidor.';
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setError(mensajeError);
      alert(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  // Función helper: Cargar detalles de items (sin cambios)
  const cargarDetallesItems = async (itemsArray: Item[]) => {
    const detallesPromises = itemsArray.map(async (item) => {
      try {
        const prodRes = await obtenerProducto(item.id_producto);
        return prodRes.data;
      } catch {
        return null;
      }
    });

    const detalles = await Promise.all(detallesPromises);
    const productosValidos = detalles.filter((p): p is Producto => p !== null);
    
    setProductosEnCarrito(prev => {
      const nuevos = productosValidos.filter(np => !prev.some(p => p.id_producto === np.id_producto));
      return [...prev, ...nuevos];
    });
  };

  // Buscar producto por ID (sin cambios)
  const buscarProducto = async () => {
    const idNum = Number(idProductoInput);
    if (!idProductoInput || idNum <= 0) {
      setError('Ingresa un ID válido de producto.');
      return;
    }

    if (!clienteCargado) {
      setError('Primero verifica un cliente válido.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await obtenerProducto(idNum);
      const producto = res.data;
      if (producto && producto.id_producto) {
        setProductoBuscado(producto);
      } else {
        setError('Producto no encontrado.');
        setProductoBuscado(null);
      }
    } catch (error) {
      console.error('Error buscando producto:', error);
      setError('Error al buscar el producto. Verifica el ID.');
      setProductoBuscado(null);
    } finally {
      setLoading(false);
    }
  };

  // Agregar al carrito (CORREGIDA: Recarga completa después de agregar)
  const agregarItemAlCarrito = async () => {
    if (!carritoId || !productoBuscado || cantidad <= 0 || !clienteCargado) {
      setError('Verifica un cliente y selecciona un producto válido.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await agregarProducto(carritoId, productoBuscado.id_producto, cantidad);

      // Recarga items y detalles (sincroniza todo)
      await cargarCarrito(idCliente!);

      setCantidad(1);
      setProductoBuscado(null);
      setIdProductoInput('');
      alert('Producto agregado al carrito exitosamente.');
    } catch (error) {
      console.error('Error agregando producto:', error);
      setError('Error al agregar al carrito.');
    } finally {
      setLoading(false);
    }
  };

  // Registrar venta (sin cambios mayores – ajustado para total)
const handleRegistrarVenta = async () => {
  if (!carritoId || items.length === 0 || !clienteCargado || !idCliente) {
    setError('Verifica un cliente o carrito vacío.');
    return;
  }

  const detalles = items.map(item => ({
    id_producto: item.id_producto,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
  }));

  const fechaVenta = new Date().toISOString().split('T')[0];

  const ventaData = {
    id_cliente: idCliente,
    fecha: fechaVenta,
    detalles: detalles
  };

  try {
    setLoading(true);
    setError(null);
    const resVenta = await crearVenta(ventaData);  // Crea la venta
    
    if (resVenta.status === 200 || resVenta.status === 201) {
      let mensajeExito = 'Venta registrada exitosamente';  // Aquí se define
      if (resVenta.data.id_venta) {
        mensajeExito = `Venta creada con ID ${resVenta.data.id_venta}`;
      } else if (resVenta.data.id) {
        mensajeExito = `Venta creada con ID ${resVenta.data.id}`;
      } else if (resVenta.data.message || resVenta.data.mensaje) {
        mensajeExito = resVenta.data.message || resVenta.data.mensaje;
      }
      
      alert(`¡Venta registrada para cliente ID ${idCliente}! ${mensajeExito}`);
      if (resVenta.data.total) {
        alert(`Total de la venta: Q${resVenta.data.total.toFixed(2)}`);
      }
      
      // Llama a vaciarCarrito después de la venta
      if (carritoId) {
        const resCarrito = await vaciarCarrito(carritoId);
        
        if (resCarrito.status === 200) {
          console.log('Carrito vaciado en el backend exitosamente.');
          setItems([]);
          setProductosEnCarrito([]);
          setCarritoId(null);
        } else {
          console.error('Error al vaciar carrito:', resCarrito);
          setError('Venta registrada, pero no se pudo vaciar el carrito.');
          alert('Error al vaciar el carrito. Intenta manualmente si es necesario.');
        }
      } else {
        setError('No se encontró ID de carrito para vaciar.');
      }
    } else {
      setError(`Status inesperado: ${resVenta.status}. Verifica el servidor.`);
    }
  } catch (error: any) {
    console.error('Error en registrar venta:', error);
    
    let mensajeError = 'Error al registrar la venta. Verifica stock o datos.';
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        mensajeError = 'Recurso no encontrado (cliente/producto?).';
      } else if (status === 500) {
        mensajeError = 'Error interno del servidor.';
      } else if (error.response.data?.message) {
        mensajeError = error.response.data.message;
      }
    } else if (error.message) {
      mensajeError = error.message;
    }
    
    setError(mensajeError);
  } finally {
    setLoading(false);
  }
};
  // Cálculo de total (usa items – TS OK)
  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  //LOGIN 

  

// Si no hay usuario logueado, muestra pantalla de login
if (!user) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Carrito de Compras</h2>
      
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        border: '2px dashed #ccc', 
        borderRadius: '8px',
        background: '#f9f9f9'
      }}>
        <h3>Bienvenido al Carrito de Compras</h3>
        <p>Para comenzar, necesitas iniciar sesión</p>
        <button 
          onClick={() => setShowLogin(true)}
          style={{
            padding: '12px 24px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          Iniciar Sesión
        </button>
      </div>

      {showLogin && (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
        
      )}
    </div>
  );
}

//  MODIFICA el header de tu pantalla de verificación de cliente
if (!clienteCargado) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* NUEVO HEADER CON INFO DE USUARIO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Carrito de Compras - Verificar Cliente</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Hola, {user.email}</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '5px 10px',
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar Sesión
          </button>
          <button onClick={() => setShowGestionClientes(true)}>
  🛒 Gestionar Clientes
</button>

{showGestionClientes && (
  <GestionClientes 
    onClose={() => setShowGestionClientes(false)}
    onClienteSeleccionado={(cliente) => {
      setIdCliente(cliente.id_cliente);
      setClienteCargado(true);
      cargarCarrito(cliente.id_cliente);
    }}
  />
)}
        </div>
      </div>

      {/* */}
      {error && (
        <div style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      {loading && <p style={{ color: 'blue', textAlign: 'center' }}>Verificando...</p>}

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Ingresar ID de Cliente</h3>
        <p>Ingresa el ID de un cliente existente para cargar su carrito.</p>
        <input
          type="number"
          placeholder="ID de cliente (ej: 1)"
          value={idCliente || ''}
          onChange={e => setIdCliente(e.target.value ? Number(e.target.value) : null)}
          style={{ width: '150px', padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          disabled={loading}
        />
        <button 
          onClick={manejarCliente} 
          disabled={loading || !idCliente}
          style={{ 
            padding: '8px 12px', 
            background: (loading || !idCliente) ? '#ccc' : '#2196F3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: (loading || !idCliente) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Verificando...' : 'Verificar y Cargar Carrito'}
        </button>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Si no tienes un ID, créalo en la base de datos o panel admin.
        </p>
      </div>

      {showLogin && (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}
    // Render: Si no hay cliente cargado, muestra solo input + botón
  if (!clienteCargado) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Carrito de Compras - Verificar Cliente</h2>
        {error && (
          <div style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        {loading && <p style={{ color: 'blue', textAlign: 'center' }}>Verificando...</p>}

        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Ingresar ID de Cliente</h3>
          <p>Ingresa el ID de un cliente existente para cargar su carrito.</p>
          <input
            type="number"
            placeholder="ID de cliente (ej: 1)"
            value={idCliente || ''}
            onChange={e => setIdCliente(e.target.value ? Number(e.target.value) : null)}
            style={{ width: '150px', padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            disabled={loading}
          />
          <button 
            onClick={manejarCliente} 
            disabled={loading || !idCliente}
            style={{ 
              padding: '8px 12px', 
              background: (loading || !idCliente) ? '#ccc' : '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: (loading || !idCliente) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Verificando...' : 'Verificar y Cargar Carrito'}
          </button>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Si no tienes un ID, créalo en la base de datos o panel admin.
          </p>
        </div>
      </div>
    );
  }
    // Si cliente cargado, muestra el carrito completo
 return (
  <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    {/*  NUEVO HEADER CON INFO DE USUARIO */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <h2>Carrito de Compras - Cliente ID: {idCliente}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>Usuario: {user?.email}</span>
        <button 
          onClick={handleLogout}
          style={{
            padding: '5px 10px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>

    {/* Botón para cambiar cliente - MANTIENES ESTE */}
    <button 
      onClick={() => {
        setClienteCargado(false);
        setIdCliente(null);
        setItems([]);
        setCarritoId(null);
        setProductosEnCarrito([]);
        setError(null);
      }} 
      style={{ 
        padding: '5px 10px', 
        background: '#ccc', 
        border: 'none', 
        borderRadius: '4px',
        marginBottom: '10px',
        cursor: 'pointer'
      }}
    >
      Cambiar Cliente
    </button>

      {error && (
        <div style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      {loading && <p style={{ color: 'blue', textAlign: 'center' }}>Cargando...</p>}

      {/* Sección para agregar producto por ID */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Agregar Producto por ID</h3>
        <input
          type="number"
          placeholder="Ingresa ID del producto (ej: 1)"
          value={idProductoInput}
          onChange={e => setIdProductoInput(e.target.value)}
          style={{ width: '150px', padding: '8px', marginRight: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          disabled={loading}
        />
        <button 
          onClick={buscarProducto} 
          disabled={loading || !idProductoInput}
          style={{ 
            padding: '8px 12px', 
            background: (loading || !idProductoInput) ? '#ccc' : '#2196F3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: (loading || !idProductoInput) ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          Buscar
        </button>

        {/* Mostrar detalles del producto buscado */}
{productoBuscado && (
  <>
    {/* Contenedor principal con Flexbox para layout horizontal fijo */}
    <div 
      style={{ 
        marginTop: '15px', 
        padding: '15px', 
        background: '#e8f5e8', 
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '15px'
      }}
    >
      {/* Sección izquierda: Texto del producto (ocupa espacio disponible) */}
      <div 
        style={{ 
          flex: 1,
          minWidth: 0
        }}
      >
        <h4 style={{ margin: '0 0 10px 0' }}>{productoBuscado.nombre}</h4>
        <p style={{ margin: '0 0 8px 0' }}><strong>Descripción:</strong> {productoBuscado.descripcion || 'Sin descripción'}</p>
        <p style={{ margin: '0 0 15px 0' }}><strong>Precio Unitario:</strong> Q{productoBuscado.precio.toFixed(2)}</p>
      </div>

      {/* Sección derecha: Imagen de referencia (fija a la derecha) */}
      {productoBuscado.imagen_url ? (
        <div 
          style={{ 
            flexShrink: 0,
            width: '200px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <img 
            src={productoBuscado.imagen_url}
            alt={productoBuscado.nombre || 'Imagen del producto'}
            style={{ 
              width: '100%',
              height: 'auto', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
              objectFit: 'cover'
            }}
            loading="lazy"
            onLoad={() => console.log('Imagen cargada OK:', productoBuscado.imagen_url)}
            onError={(e) => {
              console.error('Error en imagen:', productoBuscado.imagen_url);
              if (e.target instanceof HTMLImageElement) {
                (e.target as HTMLImageElement).style.display = 'none';
              }
            }}
          />
        </div>
      ) : (
        <div 
          style={{ 
            flexShrink: 0, 
            width: '200px', 
            display: 'flex',
            justifyContent: 'flex-end',
            color: '#666', 
            fontStyle: 'italic',
            alignItems: 'center',
            minHeight: '100px'
          }}
        >
          <p style={{ margin: 0 }}>Sin imagen disponible</p>
        </div>
      )}
    </div>

    {/* Input y botón debajo, en una fila alineada a la izquierda */}
    <div 
      style={{ 
        marginTop: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        gap: '10px'
      }}
    >
      <input
        type="number"
        min="1"
        placeholder="Cantidad (ej: 1)"
        value={cantidad}
        onChange={(e) => {
          const target = e.target as HTMLInputElement;
          setCantidad(Number(target.value) || 1);
        }}
        style={{ width: '80px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        disabled={loading}
      />
      <button
        onClick={agregarItemAlCarrito}
        disabled={loading || cantidad <= 0}
        style={{ 
          padding: '8px 15px', 
          background: (loading || cantidad <= 0) ? '#ccc' : '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: (loading || cantidad <= 0) ? 'not-allowed' : 'pointer'
        }}
      >
        Agregar al Carrito
      </button>
    </div>
  </>
)}



      </div>

      {/* Lista de items en el carrito (CORREGIDA: Usa items.map con botón Eliminar) */}
      <h3>Items en el Carrito ({items.length})</h3>
      {items.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
          El carrito está vacío. Busca y agrega productos.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map(item => {
            const prod = productosEnCarrito.find(p => p.id_producto === item.id_producto);
            return (
              <li 
                key={item.id_item}  //  Key único con id_item (TS OK)
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px', 
                  border: '1px solid #eee', 
                  borderRadius: '5px', 
                  marginBottom: '10px',
                  background: '#f9f9f9'
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{prod?.nombre || `Producto ID: ${item.id_producto}`}</strong>
                  {prod && <p><strong>Descripción:</strong> {prod.descripcion || 'Sin descripción'}</p>}
                  <p>
                    Cantidad: {item.cantidad} | 
                    Precio Unitario: Q{item.precio_unitario.toFixed(2)} | 
                    Subtotal: Q{item.subtotal.toFixed(2)}
                  </p>
                </div>
                
                {/*  NUEVO: Botón Eliminar (usa id_item de item – TS OK) */}
                <button
                  onClick={() => handleEliminarItem(item.id_item)}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    background: loading ? '#ccc' : '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    marginLeft: '10px'
                  }}
                  onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => { 
                    if (!loading) e.currentTarget.style.background = '#cc0000'; 
                  }}
                  onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => { 
                  if (!loading) e.currentTarget.style.background = '#ff4444'; 
}}
                >
                  Eliminar 🗑️
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Total y botón de registrar (solo si hay items) */}
      {items.length > 0 && (
        <>
          <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            Total: Q{total.toFixed(2)}
          </div>
          <button
            onClick={handleRegistrarVenta}
            disabled={loading || items.length === 0 || !carritoId}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              background: (loading || items.length === 0 || !carritoId) ? '#ccc' : '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (loading || items.length === 0 || !carritoId) ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? 'Registrando Venta...' : `Registrar Venta (Total: Q${total.toFixed(2)})`}
          </button>
        </>
      )}
    </div>
  );
};