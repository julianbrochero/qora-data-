import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
import Configuracion from './components/modules/Configuracion';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    marcarPagadoTotal,
    agregarPedidoSolo, // ✅ NUEVO
    marcarPedidoPagadoTotal, // ✅ NUEVO
    agregarAbonoAPedido, // ✅ NUEVO
    registrarCobro, // ✅ FUNCIÓN UNIFICADA
    eliminarFactura, // ✅ NUEVA
    crearFacturaDirecta, // ✅ NUEVA - para Factura Directa
    eliminarMovimientoCaja, // ✅ NUEVA - para borrar movimientos de caja
    cargarMovimientosPorFecha // ✅ NUEVA - selector de fecha en caja
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
  const searchTermSafe = (searchTerm || '').toLowerCase();

  const filtrarClientes = clientes.filter(cliente =>
    String(cliente.nombre || '').toLowerCase().includes(searchTermSafe) ||
    String(cliente.cuit || '').includes(searchTerm)
  );

  const filtrarProductos = productos.filter(producto =>
    String(producto.nombre || '').toLowerCase().includes(searchTermSafe) ||
    String(producto.codigo || '').toLowerCase().includes(searchTermSafe)
  );

  const filtrarFacturas = facturas.filter(factura =>
    String(factura.numero || '').toLowerCase().includes(searchTermSafe) ||
    String(factura.cliente || '').toLowerCase().includes(searchTermSafe)
  );

  const filtrarProveedores = proveedores.filter(proveedor =>
    String(proveedor.nombre || '').toLowerCase().includes(searchTermSafe) ||
    String(proveedor.cuit || '').includes(searchTerm)
  );

  const filtrarPedidos = pedidos.filter(pedido =>
    String(pedido.codigo || '').toLowerCase().includes(searchTermSafe) ||
    String(pedido.cliente_nombre || '').toLowerCase().includes(searchTermSafe)
  );

  // ✅ FUNCIÓN PARA GUARDAR VENTAS
  // En App.jsx, reemplaza la función handleGuardarVenta con esta versión mejorada:

  const handleGuardarVenta = async (ventaData, tipoVenta) => {
    console.log('Guardando venta:', { ventaData, tipoVenta });

    try {
      let resultado;

      if (tipoVenta === 'pedido') {
        resultado = await agregarPedido(ventaData);
      } else if (tipoVenta === 'factura') {
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
        resultado = await generarFactura(facturaData);
      }

      // ✅ Verificar que resultado existe antes de acceder a .success
      if (resultado && resultado.success) {
        alert(`✅ ${tipoVenta === 'pedido' ? 'Pedido' : 'Factura'} creado exitosamente`);
        await recargarTodosLosDatos(); // Asegúrate de esperar la recarga
        closeModalHandler();
      } else {
        // Si no hay resultado o success es false, mostrar el mensaje de error
        const mensajeError = resultado?.mensaje || resultado?.error || 'Error desconocido';
        throw new Error(mensajeError);
      }
    } catch (error) {
      console.error('❌ Error guardando venta:', error);
      alert('Error al guardar: ' + (error.message || 'Intenta nuevamente'));
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
          onNuevaFactura={() => openModalHandler('factura-directa')}
          registrarCobro={registrarCobro}
          eliminarFactura={eliminarFactura}
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
          cerrarCaja={cerrarCaja}
          eliminarMovimientoCaja={eliminarMovimientoCaja}
          cargarMovimientosPorFecha={cargarMovimientosPorFecha}
          recargarDatos={recargarTodosLosDatos}
        />
      ),
      reportes: (
        <Reportes
          {...commonProps}
          facturas={filtrarFacturas}
          productos={filtrarProductos}
          clientes={filtrarClientes}
          pedidos={filtrarPedidos}
        />
      ),
      proveedores: (
        <Proveedores
          {...commonProps}
          proveedores={filtrarProveedores}
          eliminarProveedor={eliminarProveedor}
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
      ),
      configuracion: <Configuracion />,
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
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-app)' }}>
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <div className="flex-1 md:ml-52 overflow-auto min-w-0">
        {/* Topbar mobile: solo visible en pantallas chicas */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 md:hidden"
          style={{ backgroundColor: 'var(--bg-surface)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-gray-900 tracking-widest">GESTICO CLICK</span>
        </div>

        <div className="p-4 md:p-8">
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
          registrarMovimiento: agregarMovimientoCaja, // alias para MovimientoCajaForm
          cerrarCaja,
          agregarPedido,
          actualizarEstadoPedido,
          actualizarPedido,
          recargarTodosLosDatos,
          cambiarTipoOperacion,
          guardarVenta: handleGuardarVenta,
          eliminarPedido,
          facturarPedido: handleFacturarPedido, // ✅ AÑADIDO
          marcarPagadoTotal, // ✅ AÑADIDO
          agregarPedidoSolo, // ✅ NUEVO
          marcarPedidoPagadoTotal, // ✅ NUEVO
          agregarAbonoAPedido, // ✅ NUEVO
          registrarCobro, // ✅ NUEVO - para Factura Directa
          crearFacturaDirecta, // ✅ NUEVO - para Factura Directa
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