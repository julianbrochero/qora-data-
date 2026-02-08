import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useFacturacion } from './hooks/useFacturacion';
import { useAuth } from './lib/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Modal from './components/layout/Modal';
import Dashboard from './components/modules/Dashboard';
import Facturacion from './components/modules/Facturacion';
import Clientes from './components/modules/Clientes';
import Productos from './components/modules/Productos';
import ControlCaja from './components/modules/ControlCaja';
import Reportes from './components/modules/Reportes';
import Proveedores from './components/modules/Proveedores';
import Pedidos from './components/modules/Pedidos';
import Login from './components/auth/Login';
import AuthCallback from './components/auth/AuthCallback';

// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg text-gray-700">Verificando autenticación...</div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// Componente principal de la aplicación (una vez autenticado)
const SistemaFacturacion = () => {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);

  const {
    // Estados existentes
    clientes,
    productos,
    facturas,
    proveedores,
    caja,
    movimientosCaja,
    cierresCaja,
    nuevoCliente,
    nuevoProducto,
    nuevaFactura,
    nuevoMovimiento,
    clienteRapido,
    productoRapido,
    pedidos,
    tipoOperacion,

    // Funciones existentes
    agregarAbono,
    setNuevoCliente,
    setNuevoProducto,
    setNuevaFactura,
    setNuevoMovimiento,
    setClienteRapido,
    setProductoRapido,
    setTipoOperacion,
    agregarCliente,
    editarCliente,
    eliminarCliente,
    agregarClienteRapido,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    agregarProductoRapido,
    agregarProveedor,
    editarProveedor,
    eliminarProveedor,
    generarFactura,
    agregarItemFactura,
    actualizarItemFactura,
    eliminarItemFactura,
    agregarItemVentaLibre,
    agregarMovimientoCaja,
    cerrarCaja,
    cambiarTipoOperacion,
    recargarTodosLosDatos,

    // Nuevas funciones para pedidos
    agregarPedido,
    actualizarEstadoPedido,
    actualizarPedido,
    eliminarPedido,
    facturarPedido,
    marcarPagadoTotal
  } = useFacturacion();

  // ✅ FUNCIÓN CORREGIDA: openModal
  const openModalHandler = (type, data = {}) => {
    console.log('🟢 Abriendo modal:', type, data);

    setModalType(type);
    setModalData(data);

    // Inicializar datos según el tipo de modal
    if (type === 'nueva-factura') {
      setNuevaFactura({
        tipo: 'Factura A',
        fecha: new Date().toISOString().split('T')[0],
        cliente: '',
        metodoPago: 'Efectivo',
        items: [],
        total: 0,
        montoPagado: 0,
        tipoOperacion: 'venta-productos',
        esCotizacion: false
      });
      setTipoOperacion('venta-productos');
    }
  };

  const closeModalHandler = () => {
    console.log('🔴 Cerrando modal');
    setModalType(null);
    setModalData(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Funciones de filtrado
  const filtrarClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cuit.includes(searchTerm)
  );

  const filtrarProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filtrarFacturas = facturas.filter(factura =>
    factura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factura.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filtrarProveedores = proveedores.filter(proveedor =>
    proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.cuit.includes(searchTerm)
  );

  const filtrarPedidos = pedidos.filter(pedido =>
    (pedido.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pedido.cliente_nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ FUNCIÓN PARA GUARDAR VENTAS
  const handleGuardarVenta = async (ventaData, tipoVenta) => {
    console.log('Guardando venta:', { ventaData, tipoVenta });

    try {
      if (tipoVenta === 'pedido') {
        const resultado = await agregarPedido(ventaData);
        if (resultado.success) {
          alert(`Pedido ${resultado.pedido?.codigo} creado exitosamente`);
          recargarTodosLosDatos();
          closeModalHandler();
        }
      }
      else if (tipoVenta === 'factura') {
        const facturaData = {
          id: ventaData.id,
          facturaId: ventaData.facturaId,
          tipo: ventaData.tipoFactura || 'Factura A',
          fecha: ventaData.fechaVenta,
          clienteNombre: ventaData.clienteNombre,
          clienteId: ventaData.clienteId,
          metodoPago: ventaData.metodoPago || 'Efectivo',
          items: ventaData.items,
          total: ventaData.total,
          montoPagado: ventaData.montoPagado || 0,
          tipoOperacion: 'venta-productos',
          notas: ventaData.notas || ''
        };

        const resultado = await generarFactura(facturaData);
        if (resultado.success) {
          alert(`Factura ${resultado.factura?.numero || ''} generada exitosamente`);
          recargarTodosLosDatos();
          closeModalHandler();
        }
      }
    } catch (error) {
      console.error('Error guardando venta:', error);
      alert('Error al guardar la venta: ' + error.message);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: Para facturar pedido - SIN CAMBIAR ESTADO A ENTREGADO
  const handleFacturarPedido = async (pedidoId) => {
    try {
      const pedido = pedidos.find(p => p.id === pedidoId);
      if (!pedido) throw new Error('Pedido no encontrado');

      // Usar la función de facturar pedido que YA está en useFacturacion
      const resultado = await facturarPedido(pedidoId);

      if (resultado.success) {
        alert(`Pedido facturado exitosamente. Factura: ${resultado.factura?.numero || ''}`);
        recargarTodosLosDatos();
      }
      return resultado;
    } catch (error) {
      console.error('Error facturando pedido:', error);
      alert('Error al facturar pedido: ' + error.message);
      return { success: false, mensaje: error.message };
    }
  };

  // ✅ RENDERIZAR MÓDULO ACTIVO
  const renderActiveModule = () => {
    const commonProps = {
      searchTerm,
      setSearchTerm,
      openModal: openModalHandler
    };

    return {
      dashboard: (
        <Dashboard
          {...commonProps}
          clientes={filtrarClientes}
          productos={filtrarProductos}
          facturas={filtrarFacturas}
          pedidos={filtrarPedidos}
          caja={caja}
          onViewAllFacturas={() => setActiveModule('facturacion')}
          onViewAllProductos={() => setActiveModule('productos')}
          onViewAllPedidos={() => setActiveModule('pedidos')}
        />
      ),
      facturacion: (
        <Facturacion
          {...commonProps}
          facturas={filtrarFacturas}
          pedidos={filtrarPedidos}
          onNuevaFactura={() => openModalHandler('nueva-factura')}
          recargarDatos={recargarTodosLosDatos}
        />
      ),
      clientes: (
        <Clientes
          {...commonProps}
          clientes={filtrarClientes}
        />
      ),
      productos: (
        <Productos
          {...commonProps}
          productos={filtrarProductos}
        />
      ),
      caja: (
        <ControlCaja
          {...commonProps}
          caja={caja}
          movimientosCaja={movimientosCaja}
          cierresCaja={cierresCaja}
        />
      ),
      reportes: (
        <Reportes
          {...commonProps}
          facturas={filtrarFacturas}
          productos={filtrarProductos}
          clientes={filtrarClientes}
        />
      ),
      proveedores: (
        <Proveedores
          {...commonProps}
          proveedores={filtrarProveedores}
        />
      ),
      pedidos: (
        <Pedidos
          {...commonProps}
          pedidos={filtrarPedidos}
          clientes={clientes}
          productos={productos}
          actualizarEstadoPedido={actualizarEstadoPedido}
          eliminarPedido={eliminarPedido}
          facturarPedido={handleFacturarPedido}
          recargarDatos={recargarTodosLosDatos}
        />
      )
    }[activeModule] || (
        <Dashboard
          {...commonProps}
          clientes={filtrarClientes}
          productos={filtrarProductos}
          facturas={filtrarFacturas}
          pedidos={filtrarPedidos}
          caja={caja}
        />
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 ml-52 overflow-auto">
        <div className="p-8">
          {renderActiveModule()}
        </div>
      </div>

      {/* ✅ UNIFICADO: Solo un Modal con todas las props necesarias */}
      <Modal
        isOpen={!!modalType}
        onClose={closeModalHandler}
        modalType={modalType}
        openModal={openModalHandler}
        formData={{
          nuevoCliente, setNuevoCliente,
          nuevoProducto, setNuevoProducto,
          nuevaFactura, setNuevaFactura,
          nuevoMovimiento, setNuevoMovimiento,
          clienteRapido, setClienteRapido,
          productoRapido, setProductoRapido,
          productos: productos, // Usar todos, no filtrar
          clientes: clientes,   // Usar todos, no filtrar
          facturas: facturas,   // ✅ AÑADIDO PARA PedidoDetail
          proveedores: filtrarProveedores,
          pedidos: filtrarPedidos,
          tipoOperacion,
          setTipoOperacion,
          selectedItem: modalData // Para pasar datos específicos
        }}
        formActions={{
          agregarCliente,
          editarCliente,
          agregarClienteRapido,
          agregarProducto,
          editarProducto,
          agregarProductoRapido,
          agregarProveedor,
          editarProveedor,
          generarFactura,
          agregarItemFactura,
          actualizarItemFactura,
          eliminarItemFactura,
          agregarAbono,
          agregarMovimientoCaja,
          cerrarCaja,
          agregarPedido,
          actualizarEstadoPedido,
          actualizarPedido,
          recargarTodosLosDatos,
          cambiarTipoOperacion,
          guardarVenta: handleGuardarVenta,
          eliminarPedido,
          facturarPedido: handleFacturarPedido, // ✅ AÑADIDO
          marcarPagadoTotal // ✅ AÑADIDO
        }}
      />
    </div>
  );
};

// Componente App principal con rutas
const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/*" element={
        <PrivateRoute>
          <SistemaFacturacion />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default App;