/*IMPORTANTE
El proyecto no incluye la carpeta node_modules para reducir el tamaño del archivo.
Por favor, ejecute "npm install" antes de iniciar el proyecto para restaurar las dependencias.
*/

// components/GestionClientes.tsx
import React, { useState, useEffect } from 'react';

import { 
  obtenerClientes, 
  buscarClientes, 
  actualizarCliente, 
  darDeBajaCliente,
  reactivarCliente,
  crearCliente 
} from '../services/api';

interface Cliente {
  id_cliente: number;
  nombre: string;
  email: string;
  direccion?: string;
  telefono?: string;
  estado: 'activo' | 'inactivo';
}

interface GestionClientesProps {
  onClose: () => void;
  onClienteSeleccionado?: (cliente: Cliente) => void;
}

export const GestionClientes: React.FC<GestionClientesProps> = ({ 
  onClose, 
  onClienteSeleccionado 
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    email: '',
    direccion: '',
    telefono: '',
    password: ''
  });

  // Cargar clientes al abrir
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await obtenerClientes(1, 100);
      // Ajusta según la respuesta de tu backend
      setClientes(response.data.clientes || response.data || response);
    } catch (err: any) {
      setError('Error al cargar clientes: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    if (!terminoBusqueda.trim()) {
      cargarClientes();
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await buscarClientes(terminoBusqueda);
      setClientes(response.data || response);
    } catch (err: any) {
      setError('Error al buscar clientes: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteEditando({ ...cliente });
  };

  const handleGuardarEdicion = async () => {
    if (!clienteEditando) return;

    try {
      setLoading(true);
      setError('');
      await actualizarCliente(clienteEditando.id_cliente, {
        nombre: clienteEditando.nombre,
        email: clienteEditando.email,
        direccion: clienteEditando.direccion,
        telefono: clienteEditando.telefono,
        estado: clienteEditando.estado
      });
      
      await cargarClientes();
      setClienteEditando(null);
    } catch (err: any) {
      setError('Error al actualizar cliente: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (cliente: Cliente) => {
    const accion = cliente.estado === 'activo' ? 'dar de baja' : 'reactivar';
    const confirmar = window.confirm(
      `¿Estás seguro de ${accion} al cliente ${cliente.nombre}?`
    );

    if (!confirmar) return;

    try {
      setLoading(true);
      setError('');
      
      if (cliente.estado === 'activo') {
        await darDeBajaCliente(cliente.id_cliente);
      } else {
        await reactivarCliente(cliente.id_cliente);
      }
      
      await cargarClientes();
    } catch (err: any) {
      setError(`Error al ${accion} cliente: ` + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.email || !nuevoCliente.password) {
      setError('Nombre, email y contraseña son requeridos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await crearCliente(nuevoCliente);
      
      setNuevoCliente({ nombre: '', email: '', direccion: '', telefono: '', password: '' });
      setMostrarFormNuevo(false);
      await cargarClientes();
      
      alert('Cliente creado exitosamente');
    } catch (err: any) {
      setError('Error al crear cliente: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarCliente = (cliente: Cliente) => {
    if (onClienteSeleccionado) {
      onClienteSeleccionado(cliente);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '95%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Gestión de Clientes</h2>
          <button 
            onClick={onClose}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>

        {/* Controles de búsqueda */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            style={{ 
              flex: '1', 
              minWidth: '200px',
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
          />
          <button 
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Buscar
          </button>
          <button 
            onClick={cargarClientes}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#ccc',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Ver Todos
          </button>
          <button 
            onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {mostrarFormNuevo ? 'Cancelar' : 'Nuevo Cliente'}
          </button>
        </div>

        {/* Formulario nuevo cliente */}
        {mostrarFormNuevo && (
          <div style={{ 
            background: '#f0f8ff', 
            padding: '15px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #b3d9ff'
          }}>
            <h4>Nuevo Cliente</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Nombre *"
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="email"
                placeholder="Email *"
                value={nuevoCliente.email}
                onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="Dirección"
                value={nuevoCliente.direccion}
                onChange={(e) => setNuevoCliente({...nuevoCliente, direccion: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={nuevoCliente.telefono}
                onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="password"
                placeholder="Contraseña *"
                value={nuevoCliente.password}
                onChange={(e) => setNuevoCliente({...nuevoCliente, password: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button 
                onClick={handleCrearCliente}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Crear Cliente
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
            {error}
          </div>
        )}

        {loading && <p style={{ textAlign: 'center' }}>Cargando...</p>}

        {/* Tabla de clientes */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Teléfono</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id_cliente} style={{ background: cliente.estado === 'inactivo' ? '#fff9e6' : 'white' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{cliente.id_cliente}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {clienteEditando?.id_cliente === cliente.id_cliente ? (
                      <input
                        type="text"
                        value={clienteEditando.nombre}
                        onChange={(e) => setClienteEditando({...clienteEditando, nombre: e.target.value})}
                        style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                      />
                    ) : (
                      <span 
                        style={{ cursor: onClienteSeleccionado ? 'pointer' : 'default', color: onClienteSeleccionado ? '#2196F3' : 'inherit' }}
                        onClick={() => onClienteSeleccionado && handleSeleccionarCliente(cliente)}
                      >
                        {cliente.nombre}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {clienteEditando?.id_cliente === cliente.id_cliente ? (
                      <input
                        type="email"
                        value={clienteEditando.email}
                        onChange={(e) => setClienteEditando({...clienteEditando, email: e.target.value})}
                        style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                      />
                    ) : (
                      cliente.email
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {clienteEditando?.id_cliente === cliente.id_cliente ? (
                      <input
                        type="text"
                        value={clienteEditando.telefono || ''}
                        onChange={(e) => setClienteEditando({...clienteEditando, telefono: e.target.value})}
                        style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                      />
                    ) : (
                      cliente.telefono || 'N/A'
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: cliente.estado === 'activo' ? '#4CAF50' : '#ff9800',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {clienteEditando?.id_cliente === cliente.id_cliente ? (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          onClick={handleGuardarEdicion}
                          disabled={loading}
                          style={{
                            padding: '4px 8px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setClienteEditando(null)}
                          disabled={loading}
                          style={{
                            padding: '4px 8px',
                            background: '#ccc',
                            color: 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditar(cliente)}
                          disabled={loading}
                          style={{
                            padding: '4px 8px',
                            background: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(cliente)}
                          disabled={loading}
                          style={{
                            padding: '4px 8px',
                            background: cliente.estado === 'activo' ? '#ff9800' : '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {cliente.estado === 'activo' ? 'Dar Baja' : 'Reactivar'}
                        </button>
                        {onClienteSeleccionado && (
                          <button
                            onClick={() => handleSeleccionarCliente(cliente)}
                            disabled={loading || cliente.estado === 'inactivo'}
                            style={{
                              padding: '4px 8px',
                              background: cliente.estado === 'inactivo' ? '#ccc' : '#9C27B0',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: cliente.estado === 'inactivo' ? 'not-allowed' : 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Seleccionar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientes.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
            No se encontraron clientes
          </p>
        )}
      </div>
    </div>
  );
};