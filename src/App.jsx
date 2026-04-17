import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Menu } from 'lucide-react';
import { useFacturacion } from './hooks/useFacturacion';
import { useAuth } from './lib/AuthContext';
import { useSubscriptionContext } from './lib/SubscriptionContext';
import AppSidebar from './components/layout/AppSidebar';
import Modal from './components/layout/Modal';
import Dashboard from './components/modules/Dashboard';
import Clientes from './components/modules/Clientes';
import Productos from './components/modules/ProductosNimbus';
import ControlCaja from './components/modules/ControlCaja';
import Reportes from './components/modules/Reportes';
import Proveedores from './components/modules/Proveedores';
import Pedidos from './components/modules/PedidosNimbus';
import Configuracion from './components/modules/Configuracion';
import Presupuestos from './components/modules/Presupuestos';
import AgregarVenta from './components/modules/AgregarVentaNimbus';
import CalendarioEntregas from './components/modules/CalendarioEntregas';
import AdminPanel from './components/modules/AdminPanel';
import Login from './components/auth/Login';
import AuthCallback from './components/auth/AuthCallback';
import SubscriptionGate from './components/subscription/SubscriptionGate';
import Landing from './components/Landing';
import OnboardingWizard from './components/OnboardingWizard';
import DemoBanner from './components/DemoBanner';
import { seedDemoData } from './utils/seedDemoData';
import { supabase } from './lib/supabaseClient';

/* ── Pantalla de carga con estética del sistema ── */
const AppLoader = ({ text = "Verificando acceso..." }) => (
  <div style={{ minHeight: "100vh", background: "#f8f9fb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif" }}>
    <div style={{ textAlign: "center" }}>
      <img src="/favicon.png" alt="Gestify" style={{ height: 52, objectFit: "contain", marginBottom: 24, opacity: 0.9 }} />
      <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#334139", borderRadius: "50%", animation: "app-spin .8s linear infinite", margin: "0 auto 16px" }} />
      <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, margin: 0 }}>{text}</p>
    </div>
    <style>{`@keyframes app-spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)

// Ruta raíz: si ya tiene sesión va al sistema, si no muestra la landing
const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  return user ? <Navigate to="/dashboard" replace /> : <Landing />;
};

// Componente para rutas protegidas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <AppLoader />;

  return user ? children : <Navigate to="/login" />;
};

// Componente principal de la aplicación (una vez autenticado)
const SistemaFacturacion = () => {
  const { user, logout, updateUserData } = useAuth();
  const { status: subscriptionStatus } = useSubscriptionContext();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const modalTypeRef = useRef(null);
  useEffect(() => { modalTypeRef.current = modalType }, [modalType]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pedidoAEditar, setPedidoAEditar] = useState(null);
  const [productoParaCarrito, setProductoParaCarrito] = useState(null);
  // Ref para poder llamar a recargarTodosLosDatos desde handlers
  // definidos antes del hook useFacturacion
  const recargarRef = useRef(null)

  // ── Onboarding & Demo data ──────────────────────────────────────────────
  const needsOnboarding = user && !user.user_metadata?.onboarding_done
  const hasDemoData     = user?.user_metadata?.demo_data === true
  const [demoBannerVisible, setDemoBannerVisible] = useState(true)

  const handleOnboardingComplete = useCallback(async (respuestas) => {
    try {
      await updateUserData({
        onboarding_done: true,
        onboarding: respuestas,
        demo_data: true,
      })
      const canalesMap = {
        'Instagram': ['Instagram', 'WhatsApp', 'Local'],
        'TiendaNube': ['TiendaNube', 'Instagram', 'Local'],
        'Local': ['Local', 'WhatsApp'],
        'Mixto': ['Local', 'Instagram', 'WhatsApp', 'TiendaNube', 'Email'],
      }
      const canal = respuestas.canal || 'Mixto'
      try { localStorage.setItem('gestify_canales_venta', JSON.stringify(canalesMap[canal] || canalesMap.Mixto)) } catch {}
      await seedDemoData(user.id, respuestas)
      recargarRef.current?.()
    } catch (e) {
      console.error('Onboarding error:', e)
      await updateUserData({ onboarding_done: true }).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, updateUserData])

  const handleBorrarDemo = useCallback(async () => {
    if (!user) return
    try {
      await supabase.from('pedidos').delete().eq('user_id', user.id)
      await supabase.from('clientes').delete().eq('user_id', user.id)
      await supabase.from('productos').delete().eq('user_id', user.id)
      await updateUserData({ demo_data: false })
      recargarRef.current?.()
      toast.success('Datos de ejemplo eliminados. ¡El sistema está listo para usar!')
    } catch (e) {
      toast.error('Error al borrar: ' + e.message)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, updateUserData])


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
    eliminarMultiplesProductos,
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
    actualizarNotasPedido,
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
    cargarMovimientosPorFecha, // ✅ NUEVA - selector de fecha en caja
    presupuestos,
    guardarPresupuesto,
    eliminarPresupuesto,
    actualizarEstadoPresupuesto,
    categorias,
    agregarCategoria,
    renombrarCategoria,
    eliminarCategoria,
  } = useFacturacion();

  // Asignar la ref una vez que useFacturacion la expone
  recargarRef.current = recargarTodosLosDatos

  // ✅ FUNCIÓN CORREGIDA: openModal
  const openModalHandler = (type, data = {}) => {
    // Bloquear acciones de escritura si está suspendido, permitiendo solo lectura (ver)
    const isViewer = type.includes('detalle') || type.includes('ver');
    if (subscriptionStatus === 'suspended' && !isViewer && type !== 'ver-plan') {
      toast.error('💳 Tu cuenta está suspendida por falta de pago. No podés crear ni editar registros hasta regularizar tu suscripción.');
      return;
    }

    // 🖊 'editar-pedido' → navega al módulo AgregarVenta con el pedido cargado
    if (type === 'editar-pedido' && data) {
      setPedidoAEditar(data)
      setActiveModule('agregar-venta')
      return
    }

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

    if (type === 'editar-producto' && data) {
      // Normalizar controlastock → controlaStock para el form
      const cs = !!(data.controlaStock || data.controlastock)
      setNuevoProducto({
        ...data,
        controlaStock: cs,
        controlastock: undefined,
      })
    }

    if (type === 'nuevo-producto') {
      // Resetear pero conservar categoría si vino del modal de categorías
      setNuevoProducto({ nombre: '', precio: 0, stock: 0, codigo: '', categoria: data?.categoria || '', descripcion: '', controlaStock: false })
    }
  };

    const closeModalHandler = useCallback(() => {
    setModalType(null);
    setModalData(null);
  }, []);

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

      if (resultado && resultado.success) {
        toast.success(`${tipoVenta === 'pedido' ? 'Pedido' : 'Factura'} creado exitosamente`);
        closeModalHandler(); // cerrar inmediatamente — el estado local ya fue actualizado de forma optimista
        recargarTodosLosDatos(); // sync en background sin bloquear la UI
      } else {
        // Si no hay resultado o success es false, mostrar el mensaje de error
        const mensajeError = resultado?.mensaje || resultado?.error || 'Error desconocido';
        throw new Error(mensajeError);
      }
    } catch (error) {
      console.error('❌ Error guardando venta:', error);
      toast.error('Error al guardar: ' + (error.message || 'Intenta nuevamente'));
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
        toast.success(`Pedido facturado exitosamente. Factura: ${resultado.factura?.numero || ''}`);
        recargarTodosLosDatos();
      }
      return resultado;
    } catch (error) {
      console.error('Error facturando pedido:', error);
      toast.error('Error al facturar pedido: ' + error.message);
      return { success: false, mensaje: error.message };
    }
  };

  // ✅ RENDERIZAR MÓDULO ACTIVO
  const renderActiveModule = () => {
    const commonProps = {
      searchTerm,
      setSearchTerm,
      openModal: openModalHandler,
      onOpenMobileSidebar: () => setSidebarOpen(true)
    };

    return {
      dashboard: (
        <Dashboard
          {...commonProps}
          clientes={filtrarClientes}
          productos={filtrarProductos}
          pedidos={filtrarPedidos}
          caja={caja}
          onViewAllProductos={() => setActiveModule('productos')}
          onViewAllPedidos={() => setActiveModule('pedidos')}
          onViewAllClientes={() => setActiveModule('clientes')}
          onViewAllCaja={() => setActiveModule('caja')}
          onViewReportes={() => setActiveModule('reportes')}
          onNuevaVenta={() => setActiveModule('agregar-venta')}
        />
      ),
      clientes: (
        <Clientes
          {...commonProps}
          clientes={filtrarClientes}
          eliminarCliente={eliminarCliente}
        />
      ),
      productos: (
        <Productos
          {...commonProps}
          productos={filtrarProductos}
          eliminarProducto={eliminarProducto}
          eliminarMultiplesProductos={eliminarMultiplesProductos}
          editarProducto={editarProducto}
          recargarProductos={recargarTodosLosDatos}
          categoriasDb={categorias}
          agregarCategoria={agregarCategoria}
          renombrarCategoria={renombrarCategoria}
          eliminarCategoria={eliminarCategoria}
          onAgregarAlCarrito={prod => { setProductoParaCarrito({ ...prod, _t: Date.now() }); setActiveModule('agregar-venta') }}
        />
      ),
      caja: (
        <ControlCaja
          {...commonProps}
          caja={caja}
          movimientosCaja={movimientosCaja}
          cierresCaja={cierresCaja}
          pedidos={pedidos}
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
          recargarDatos={recargarTodosLosDatos}
          onNuevaVenta={() => setActiveModule('agregar-venta')}
          formActions={{
            actualizarEstadoPedido,
            actualizarPedido,
            actualizarNotasPedido,
            agregarAbonoAPedido,
            marcarPedidoPagadoTotal,
            openModal: openModalHandler,
          }}
        />
      ),
      'agregar-venta': (
        <AgregarVenta
          {...commonProps}
          clientes={clientes}
          productos={productos}
          pedidoAEditar={pedidoAEditar}
          productoParaAgregarAlCarrito={productoParaCarrito}
          formActions={{
            agregarPedidoSolo,
            actualizarPedido,
            recargarTodosLosDatos,
          }}
          onVentaCreada={() => { setPedidoAEditar(null); setProductoParaCarrito(null); setActiveModule('pedidos') }}
        />
      ),
      configuracion: <Configuracion {...commonProps} />,
      calendario: (
        <CalendarioEntregas
          {...commonProps}
          pedidos={pedidos}
          openModal={(type, data) => openModalHandler(type === 'editar-pedido' ? 'ver-pedido' : type, data)}
        />
      ),
      admin: <AdminPanel />,
      presupuestos: (
        <Presupuestos
          {...commonProps}
          presupuestos={presupuestos}
          clientes={clientes}
          productos={productos}
          eliminarPresupuesto={eliminarPresupuesto}
          actualizarEstadoPresupuesto={actualizarEstadoPresupuesto}
          convertirPresupuestoPedido={async (pres) => {
            const items = (() => { try { return JSON.parse(pres.items || '[]') } catch { return [] } })()
            const r = await agregarPedidoSolo({ clienteNombre: pres.cliente, items, notas: `Presupuesto ${pres.numero}`, estado: 'pendiente' })
            if (r?.success) { await actualizarEstadoPresupuesto(pres.id, 'aceptado') }
            return r
          }}
        />
      ),
    }[activeModule] || (
        <Dashboard
          {...commonProps}
          clientes={filtrarClientes}
          productos={filtrarProductos}
          pedidos={filtrarPedidos}
          caja={caja}
        />
      );
  };

  // Mostrar wizard si el usuario no completó el onboarding
  if (needsOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
        <AppSidebar
          activeModule={activeModule}
          setActiveModule={(mod) => { setActiveModule(mod); setSidebarOpen(false) }}
          pedidos={pedidos}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        {/* Contenido principal — empujado a la derecha del sidebar fijo en desktop */}
        <div className="md:pl-[220px]" style={{ minHeight: "100vh", background: "#f8f9fb" }}>
          {/* Banner datos de ejemplo */}
          {hasDemoData && demoBannerVisible && (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 20px 0' }}>
              <DemoBanner
                onDismiss={() => setDemoBannerVisible(false)}
                onBorrarTodo={handleBorrarDemo}
              />
            </div>
          )}
          <SubscriptionGate>
            {renderActiveModule()}
          </SubscriptionGate>
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
          categoriasDb: categorias,
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
          guardarPresupuesto,  // para Presupuestos
          actualizarNotasPedido, // para guardar notas en el detalle de venta
          agregarCategoria,
          renombrarCategoria,
          eliminarCategoria,
        }}
      />
    </div>
  );
};

// Componente App principal con rutas
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/*" element={
          <PrivateRoute>
            <SistemaFacturacion />
          </PrivateRoute>
        } />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 99999 }}
      />
    </>
  );
};

export default App;