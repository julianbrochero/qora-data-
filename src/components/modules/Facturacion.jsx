"use client"

import { useState, useEffect } from "react"
import { Search, Printer, Eye, DollarSign, FileText, Users, CreditCard, Calendar, Package, CheckCircle, Clock, Trash2, CheckSquare, Banknote, XCircle, Plus } from "lucide-react"

const Facturacion = ({
  facturas = [],
  pedidos = [],
  searchTerm = "",
  setSearchTerm,
  onNuevaFactura,
  abonos = [],
  registrarCobro,
  eliminarFactura,
  recargarDatos
}) => {
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [pestañaActiva, setPestañaActiva] = useState("todas")
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null)
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const [montoPago, setMontoPago] = useState("")
  const [metodoPago, setMetodoPago] = useState("Efectivo")
  const [abonosLocales, setAbonosLocales] = useState([])
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [detalleFactura, setDetalleFactura] = useState(null)
  const [seleccionadas, setSeleccionadas] = useState(new Set())
  const [eliminandoMasivo, setEliminandoMasivo] = useState(false)
  const [modoSeleccion, setModoSeleccion] = useState(false)
  const [cargandoPago, setCargandoPago] = useState(false)
  const [mostrarFormAbono, setMostrarFormAbono] = useState(false)

  // Sincronizar abonos
  useEffect(() => {
    setAbonosLocales(Array.isArray(abonos) ? abonos : [])
  }, [abonos])

  const facturasSeguras = Array.isArray(facturas) ? facturas : []
  const abonosSeguros = abonosLocales

  // Filtrar facturas
  const filtrarFacturas = facturasSeguras
    .filter((factura) => {
      const coincideBusqueda =
        (factura.numero || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (factura.cliente_nombre || factura.cliente || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (factura.pedido_id || "").toString().includes(searchTerm) ||
        (obtenerCodigoPedido(factura.pedido_id) || "").toLowerCase().includes((searchTerm || "").toLowerCase())

      const coincidePestaña =
        pestañaActiva === "todas" ||
        (pestañaActiva === "pagadas" && factura.estado === "pagada") ||
        (pestañaActiva === "deudas" && factura.estado !== "pagada")

      const coincideEstado =
        filtroEstado === "todos" ||
        factura.estado === filtroEstado ||
        (filtroEstado === "pendientes" && (factura.estado === "pendiente" || factura.estado === "parcial"))

      return coincideBusqueda && coincidePestaña && coincideEstado
    })
    .sort((a, b) => {
      const fechaA = new Date(a.fecha || 0)
      const fechaB = new Date(b.fecha || 0)
      return fechaB - fechaA
    })

  // Paginación
  const totalPaginas = Math.ceil(filtrarFacturas.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const facturasPaginadas = filtrarFacturas.slice(indiceInicio, indiceFin)

  // Reset página al cambiar filtros o items por página
  useEffect(() => {
    setPaginaActual(1)
    setSeleccionadas(new Set()) // limpiar selección al cambiar filtros
  }, [pestañaActiva, filtroEstado, searchTerm, itemsPorPagina])

  // Helpers de selección
  const toggleModoSeleccion = () => {
    setModoSeleccion(prev => !prev)
    setSeleccionadas(new Set())
  }

  const toggleSeleccion = (id) => {
    setSeleccionadas(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSeleccionarTodaPagina = () => {
    const idsPagina = facturasPaginadas.map(f => f.id)
    const todasSeleccionadas = idsPagina.every(id => seleccionadas.has(id))
    setSeleccionadas(prev => {
      const next = new Set(prev)
      if (todasSeleccionadas) {
        idsPagina.forEach(id => next.delete(id))
      } else {
        idsPagina.forEach(id => next.add(id))
      }
      return next
    })
  }

  const limpiarSeleccion = () => setSeleccionadas(new Set())

  // Calcular resumen de deudas
  const resumenDeudas = {
    totalDeuda: facturasSeguras
      .filter((f) => f.estado !== "pagada")
      .reduce((sum, f) => sum + (Number.parseFloat(f.saldopendiente) || Number.parseFloat(f.total) || 0), 0),

    facturasPendientes: facturasSeguras.filter((f) => f.estado !== "pagada").length,

    clientesDeudores: [
      ...new Set(
        facturasSeguras
          .filter((f) => f.estado !== "pagada")
          .map((f) => f.cliente_nombre || f.cliente)
          .filter(Boolean),
      ),
    ].length,

    totalAbonos: abonosSeguros.reduce((sum, abono) => sum + (Number.parseFloat(abono.monto) || 0), 0),

    totalFacturadoMes: facturasSeguras
      .filter(f => {
        const fechaFactura = new Date(f.fecha)
        const ahora = new Date()
        return fechaFactura.getMonth() === ahora.getMonth() &&
          fechaFactura.getFullYear() === ahora.getFullYear()
      })
      .reduce((sum, f) => sum + (Number.parseFloat(f.total) || 0), 0)
  }

  // Configuración de estados contables
  const estadosConfig = {
    pendiente: {
      label: "Pendiente",
      color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      icon: Clock,
      desc: "Sin pagos registrados"
    },
    parcial: {
      label: "Pago Parcial",
      color: "bg-blue-50 text-blue-700 border border-blue-200",
      icon: DollarSign,
      desc: "Pagos parciales registrados"
    },
    pagada: {
      label: "Pagada",
      color: "bg-green-50 text-green-700 border border-green-200",
      icon: CheckCircle,
      desc: "Saldo completamente pagado"
    },
    anulada: {
      label: "Anulada",
      color: "bg-red-50 text-red-700 border border-red-200",
      icon: Clock,
      desc: "Factura anulada"
    }
  }

  // Helper para obtener código de pedido asociado a una factura
  const obtenerCodigoPedido = (pedidoId) => {
    if (!pedidoId) return null
    const pedido = pedidos.find(p => p.id === pedidoId)
    return pedido?.codigo || null
  }

  // Funciones de utilidad
  const formatearMonto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha"
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    } catch {
      return "Fecha inválida"
    }
  }

  const handleRegistrarPago = async () => {
    if (!facturaSeleccionada) return
    const monto = Number.parseFloat(montoPago) || 0
    if (monto <= 0) { alert("El monto debe ser mayor a 0"); return }
    const saldoPendiente = Number.parseFloat(facturaSeleccionada.saldopendiente) ||
      Number.parseFloat(facturaSeleccionada.total)
    if (monto > saldoPendiente) {
      alert(`El monto excede el saldo pendiente ($${formatearMonto(saldoPendiente)})`)
      return
    }
    if (!registrarCobro) return
    setCargandoPago(true)
    try {
      const codigoAsociado = obtenerCodigoPedido(facturaSeleccionada.pedido_id);
      const referenciaTexto = codigoAsociado ? `Pedido ${codigoAsociado}` : facturaSeleccionada.numero;
      const resultado = await registrarCobro(
        facturaSeleccionada.id,
        monto,
        `Pago parcial - ${referenciaTexto}`
      )
      if (resultado?.success) {
        handleCerrarModal()
        if (recargarDatos) recargarDatos()
      } else {
        alert('Error registrando pago: ' + (resultado?.mensaje || 'Error desconocido'))
      }
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setCargandoPago(false)
    }
  }

  // Handler para ver detalle de factura
  const handleVerDetalle = (factura) => {
    setDetalleFactura(factura)
  }

  const handleCerrarModal = () => {
    setMostrarModalPago(false)
    setFacturaSeleccionada(null)
    setMontoPago('')
    setMostrarFormAbono(false)
    setCargandoPago(false)
  }

  const handleSaldarTodo = async () => {
    if (!facturaSeleccionada || !registrarCobro) return
    const saldo = Number.parseFloat(facturaSeleccionada.saldopendiente) ||
      Number.parseFloat(facturaSeleccionada.total)
    if (saldo <= 0) return
    const confirmar = window.confirm(
      `¿Registrar pago total del saldo restante?\n\nSaldo a saldar: $${formatearMonto(saldo)}`
    )
    if (!confirmar) return
    setCargandoPago(true)
    try {
      const codigoAsociado = obtenerCodigoPedido(facturaSeleccionada.pedido_id);
      const referenciaTexto = codigoAsociado ? `Pedido ${codigoAsociado}` : facturaSeleccionada.numero;
      const resultado = await registrarCobro(
        facturaSeleccionada.id,
        saldo,
        `Saldo total - ${referenciaTexto}`
      )
      if (resultado?.success) {
        handleCerrarModal()
        if (recargarDatos) recargarDatos()
      } else {
        alert('Error: ' + (resultado?.mensaje || 'Error desconocido'))
      }
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setCargandoPago(false)
    }
  }

  // Handlers de acciones individuales
  const handleImprimirFactura = (factura) => {
    alert(`Generando PDF de factura ${factura.numero}...`)
  }

  const handleEliminarFactura = async (factura) => {
    const confirmMsg = factura.pedido_id
      ? `¿Eliminar la factura ${factura.numero}? Esto NO eliminará el pedido asociado.`
      : `¿Eliminar la factura ${factura.numero}? Esta acción no se puede deshacer.`
    if (!window.confirm(confirmMsg)) return
    if (eliminarFactura) {
      const resultado = await eliminarFactura(factura.id)
      if (resultado?.success) {
        if (recargarDatos) recargarDatos()
      } else {
        alert('Error al eliminar: ' + (resultado?.mensaje || 'Error desconocido'))
      }
    }
  }

  const handleEliminarSeleccionadas = async () => {
    if (seleccionadas.size === 0) return
    const cantidad = seleccionadas.size
    if (!window.confirm(`¿Eliminar ${cantidad} factura${cantidad > 1 ? 's' : ''}? Esta acción no se puede deshacer.`)) return
    setEliminandoMasivo(true)
    let errores = 0
    let exitosas = 0
    for (const id of seleccionadas) {
      if (eliminarFactura) {
        const resultado = await eliminarFactura(id)
        if (resultado?.success) exitosas++
        else errores++
      }
    }
    setEliminandoMasivo(false)
    limpiarSeleccion()
    if (recargarDatos) recargarDatos()
    if (errores > 0) {
      alert(`Se eliminaron ${exitosas} facturas. ${errores} no pudieron eliminarse.`)
    }
  }

  return (

    <div className="space-y-3">

      {/* ===== MODAL DE PAGO INLINE ===== */}
      {mostrarModalPago && facturaSeleccionada && (() => {
        const total = Number.parseFloat(facturaSeleccionada.total) || 0
        const montoPagado = Number.parseFloat(facturaSeleccionada.montopagado) || 0
        const saldo = Number.parseFloat(facturaSeleccionada.saldopendiente) ?? (total - montoPagado)
        const estaPagado = saldo <= 0.01
        const porcentaje = total > 0 ? Math.min(100, (montoPagado / total) * 100) : 0

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">

              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Registrar Pago</h3>
                  <p className="text-[10px] text-gray-500 font-mono">{facturaSeleccionada.numero}</p>
                  {facturaSeleccionada.pedido_id && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Package size={9} className="text-blue-500" />
                      <span className="text-[10px] text-blue-600 font-semibold">
                        {obtenerCodigoPedido(facturaSeleccionada.pedido_id) || `Pedido #${facturaSeleccionada.pedido_id.toString().slice(-6)}`}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCerrarModal}
                  disabled={cargandoPago}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Cuerpo */}
              <div className="p-4 space-y-3">

                {/* Info del cliente */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-blue-900">
                      {facturaSeleccionada.cliente_nombre || facturaSeleccionada.cliente || 'Cliente'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${estadosConfig[facturaSeleccionada.estado]?.color}`}>
                      {estadosConfig[facturaSeleccionada.estado]?.label}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>Progreso de pago</span>
                    <span className="font-bold">{porcentaje.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${estaPagado ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>

                {/* Montos */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                    <p className="text-[9px] text-gray-500 uppercase mb-0.5">Total</p>
                    <p className="text-xs font-bold text-gray-900">${formatearMonto(total)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center border border-green-200">
                    <p className="text-[9px] text-green-600 uppercase mb-0.5">Cobrado</p>
                    <p className="text-xs font-bold text-green-600">${formatearMonto(montoPagado)}</p>
                  </div>
                  <div className={`rounded-lg p-2 text-center border ${estaPagado ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <p className={`text-[9px] uppercase mb-0.5 ${estaPagado ? 'text-green-600' : 'text-orange-600'}`}>Saldo</p>
                    <p className={`text-xs font-bold ${estaPagado ? 'text-green-600' : 'text-orange-600'}`}>${formatearMonto(saldo)}</p>
                  </div>
                </div>

                {/* Acciones de cobro */}
                {estaPagado ? (
                  <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-300 py-3 rounded-lg">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-xs font-bold text-green-700">PAGADO COMPLETAMENTE</span>
                  </div>
                ) : mostrarFormAbono ? (
                  /* Formulario de abono parcial */
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                        Monto a cobrar <span className="text-gray-400">(máx: ${formatearMonto(saldo)})</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-lg pl-5 pr-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="0.00"
                          value={montoPago}
                          onChange={(e) => setMontoPago(e.target.value)}
                          autoFocus
                          step="0.01"
                          min="0.01"
                          max={saldo}
                          disabled={cargandoPago}
                        />
                      </div>
                      <button
                        onClick={() => setMontoPago(saldo.toString())}
                        className="mt-1 text-[9px] text-blue-600 hover:underline"
                      >
                        Usar saldo completo (${formatearMonto(saldo)})
                      </button>
                    </div>

                    {/* Método de pago */}
                    <select
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                      <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="MercadoPago">MercadoPago</option>
                      <option value="Cheque">Cheque</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setMostrarFormAbono(false); setMontoPago('') }}
                        disabled={cargandoPago}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 px-2 py-1.5 rounded-lg text-[10px] font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRegistrarPago}
                        disabled={cargandoPago || !montoPago || Number.parseFloat(montoPago) <= 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <Banknote size={11} />
                        {cargandoPago ? 'Procesando...' : 'Confirmar Cobro'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Botones principales */
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMostrarFormAbono(true)}
                      disabled={cargandoPago}
                      className="flex-1 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-2.5 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <DollarSign size={12} />
                      Registrar Cobro
                    </button>
                    <button
                      onClick={handleSaldarTodo}
                      disabled={cargandoPago}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-2.5 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle size={12} />
                      {cargandoPago ? 'Procesando...' : 'Saldar Todo'}
                    </button>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleCerrarModal}
                  disabled={cargandoPago}
                  className="w-full bg-white text-gray-600 px-3 py-1.5 text-xs rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        )
      })()}

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Facturación</h2>
          <p className="text-xs text-gray-500 mt-0.5">Contabilidad, deudas y pagos</p>
        </div>

        <div className="flex items-center gap-2">
          {/* BOTÓN SELECCIONAR */}
          <button
            onClick={toggleModoSeleccion}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm border ${modoSeleccion
              ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <CheckSquare size={12} />
            {modoSeleccion ? 'Cancelar selección' : 'Seleccionar'}
          </button>

          {/* BOTÓN NUEVA FACTURA - SOLO PARA FACTURAS DIRECTAS (sin pedido) */}
          <button
            onClick={() => onNuevaFactura && onNuevaFactura()}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Plus size={12} />
            Factura Directa
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMEN - ACTUALIZADAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Deuda Total */}
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Deuda Total</h3>
            <CreditCard className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(resumenDeudas.totalDeuda)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Total de deuda pendiente</p>
          </div>
        </div>

        {/* Facturas Pendientes */}
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Facturas Pendientes</h3>
            <FileText className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenDeudas.facturasPendientes}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Con saldo pendiente</p>
          </div>
        </div>

        {/* Clientes Deudores */}
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Clientes Deudores</h3>
            <Users className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenDeudas.clientesDeudores}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Con deuda activa</p>
          </div>
        </div>

        {/* Facturado Este Mes */}
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Facturado Este Mes</h3>
            <DollarSign className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(resumenDeudas.totalFacturadoMes)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Total facturado este mes</p>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Buscar facturas por número, cliente o pedido..."
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs font-medium text-gray-700"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendientes">Pendientes</option>
          <option value="parcial">Pago Parcial</option>
          <option value="pagada">Pagadas</option>
          <option value="anulada">Anuladas</option>
        </select>
      </div>

      {/* CARD CON PESTAÑAS Y TABLA */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        {/* PESTAÑAS */}
        <div className="flex border-b border-gray-200 px-3">
          {[
            { key: "todas", label: "Todas", count: facturasSeguras.length },
            { key: "pagadas", label: "Pagadas", count: facturasSeguras.filter((f) => f.estado === "pagada").length },
            { key: "deudas", label: "Deudas", count: facturasSeguras.filter((f) => f.estado !== "pagada").length },
          ].map((pestaña) => (
            <button
              key={pestaña.key}
              onClick={() => setPestañaActiva(pestaña.key)}
              className={`relative px-3 py-1.5 font-medium text-xs transition-all flex items-center gap-1 ${pestañaActiva === pestaña.key
                ? "text-blue-600"
                : "text-gray-700 hover:text-gray-900"
                }`}
            >
              {pestaña.label}
              <span className={`py-0.5 px-1.5 text-xs font-semibold rounded-full ${pestañaActiva === pestaña.key
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
                }`}>
                {pestaña.count}
              </span>
              {pestañaActiva === pestaña.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* HEADER INFO */}
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">Facturas</h3>
          <p className="text-xs text-gray-500">Lista de facturas registradas</p>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {modoSeleccion && (
                  <th className="px-2 py-1 w-8">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600 cursor-pointer"
                      checked={facturasPaginadas.length > 0 && facturasPaginadas.every(f => seleccionadas.has(f.id))}
                      onChange={() => toggleSeleccionarTodaPagina(facturasPaginadas)}
                      title="Seleccionar toda la página"
                    />
                  </th>
                )}
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Número</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Origen</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Pagado</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Saldo</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                {!modoSeleccion && (
                  <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {facturasPaginadas.length > 0 ? (
                facturasPaginadas.map((factura) => {
                  const montoPagado = Number.parseFloat(factura.montopagado) || 0
                  const totalFactura = Number.parseFloat(factura.total) || 0
                  const saldoPendiente = Number.parseFloat(factura.saldopendiente) ?? (totalFactura - montoPagado)
                  const estado = factura.estado || "pendiente"
                  const EstadoIcon = estadosConfig[estado]?.icon || FileText

                  const estaSeleccionada = seleccionadas.has(factura.id)
                  return (
                    <tr
                      key={factura.id}
                      className={`transition-colors group ${modoSeleccion
                        ? (estaSeleccionada ? 'bg-blue-50 hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer')
                        : 'hover:bg-gray-50'
                        }`}
                      onClick={modoSeleccion ? () => toggleSeleccion(factura.id) : undefined}
                    >
                      {/* Checkbox */}
                      {modoSeleccion && (
                        <td className="px-2 py-1.5 w-8" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-gray-300 accent-blue-600 cursor-pointer"
                            checked={estaSeleccionada}
                            onChange={() => toggleSeleccion(factura.id)}
                          />
                        </td>
                      )}

                      {/* Número */}
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1 rounded border ${factura.pedido_id
                            ? "bg-blue-50 border-blue-200"
                            : "bg-green-50 border-green-200"
                            }`}>
                            <FileText size={10} className={factura.pedido_id ? "text-blue-600" : "text-green-600"} />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-900 font-mono">
                              {factura.numero || "N/A"}
                            </span>
                            <div className="text-[9px] text-gray-500">
                              {factura.tipo || "Factura A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="px-2 py-1.5 text-xs text-gray-900">
                        {factura.cliente_nombre || factura.cliente || "N/A"}
                      </td>

                      {/* Fecha */}
                      <td className="px-2 py-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={9} className="text-gray-400" />
                          <span>{formatearFecha(factura.fecha)}</span>
                        </div>
                      </td>

                      {/* Origen */}
                      <td className="px-2 py-1.5">
                        {factura.pedido_id ? (
                          <div className="flex items-center gap-1">
                            <div className="bg-blue-100 p-0.5 rounded">
                              <Package size={8} className="text-blue-600" />
                            </div>
                            <span className="text-xs font-medium text-blue-700 font-mono">
                              {obtenerCodigoPedido(factura.pedido_id) || `PED-${factura.pedido_id.toString().slice(-6)}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Directa</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-2 py-1.5">
                        <div className="text-xs font-semibold text-gray-900">
                          ${formatearMonto(totalFactura)}
                        </div>
                      </td>

                      {/* Pagado */}
                      <td className="px-2 py-1.5">
                        <div className="text-xs font-semibold text-green-600">
                          ${formatearMonto(montoPagado)}
                        </div>
                        {montoPagado > 0 && (
                          <div className="text-[9px] text-gray-500">
                            {((montoPagado / totalFactura) * 100).toFixed(0)}%
                          </div>
                        )}
                      </td>

                      {/* Saldo */}
                      <td className="px-2 py-1.5">
                        <div className="text-xs font-semibold">
                          <span className={saldoPendiente > 0 ? "text-red-600" : "text-green-600"}>
                            ${formatearMonto(saldoPendiente)}
                          </span>
                        </div>
                        {saldoPendiente > 0 && (
                          <div className="text-[9px] text-gray-500">
                            Pendiente
                          </div>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-2 py-1.5">
                        <div className="space-y-0.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${estadosConfig[estado]?.color}`}>
                            <EstadoIcon size={9} />
                            {estadosConfig[estado]?.label || estado}
                          </span>
                        </div>
                      </td>

                      {/* Acciones */}
                      {!modoSeleccion && (
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            {/* Ver Detalle */}
                            <button
                              onClick={() => handleVerDetalle(factura)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm bg-white"
                              title="Ver Detalle"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Registrar Pago (solo si tiene saldo) */}
                            {saldoPendiente > 0 && estado !== 'anulada' && (
                              <button
                                onClick={() => {
                                  setFacturaSeleccionada(factura)
                                  setMostrarModalPago(true)
                                  const saldo = Number.parseFloat(factura.saldopendiente) || Number.parseFloat(factura.total) || 0
                                  setMontoPago(saldo.toString())
                                }}
                                className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-100 shadow-sm bg-white"
                                title="Registrar Pago"
                              >
                                <DollarSign size={16} />
                              </button>
                            )}

                            {/* Imprimir/Descargar */}
                            <button
                              onClick={() => handleImprimirFactura(factura)}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 shadow-sm bg-white"
                              title="Imprimir/Descargar"
                            >
                              <Printer size={16} />
                            </button>

                            {/* Eliminar factura */}
                            <button
                              onClick={() => handleEliminarFactura(factura)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 shadow-sm bg-white"
                              title="Eliminar Factura"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-3 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-2 rounded-full mb-1.5 border border-gray-200">
                        <FileText size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">No se encontraron facturas</p>
                      <p className="text-xs text-gray-500">
                        {pestañaActiva === "deudas"
                          ? "No hay deudas pendientes"
                          : searchTerm
                            ? "Intenta con otros términos"
                            : "No hay facturas registradas"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER CON PAGINACIÓN */}
        <div className="px-3 py-2 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                Mostrando {Math.min(filtrarFacturas.length, itemsPorPagina)} de {filtrarFacturas.length} facturas
              </span>
              <select
                value={itemsPorPagina}
                onChange={(e) => setItemsPorPagina(Number(e.target.value))}
                className="px-1.5 py-0.5 text-xs border border-gray-300 rounded bg-white"
              >
                <option value="5">5 por página</option>
                <option value="10">10 por página</option>
                <option value="25">25 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <span className="px-2 py-0.5 text-xs font-medium text-gray-700">
                {paginaActual} / {totalPaginas || 1}
              </span>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas || totalPaginas === 0}
                className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE ACCIONES MASIVAS FLOTANTE */}
      {modoSeleccion && seleccionadas.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {seleccionadas.size}
            </span>
            <span className="text-sm font-medium">
              {seleccionadas.size === 1 ? 'factura seleccionada' : 'facturas seleccionadas'}
            </span>
          </div>
          <div className="w-px h-5 bg-gray-600" />
          <button
            onClick={handleEliminarSeleccionadas}
            disabled={eliminandoMasivo}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            {eliminandoMasivo ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 size={13} />
                Eliminar seleccionadas
              </>
            )}
          </button>
          <button
            onClick={limpiarSeleccion}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* INFORMACIÓN ADICIONAL */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="bg-green-100 p-1.5 rounded">
            <FileText className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-green-900 mb-1">🧾 Módulo de Facturación (Contabilidad Pura)</h4>
            <ul className="text-xs text-green-800 space-y-0.5">
              <li>• <strong>Objetivo:</strong> Controlar deuda y registrar pagos</li>
              <li>• <strong>NO crea ventas</strong> - Las facturas vienen de pedidos</li>
              <li>• Los pagos se registran aquí, nunca en pedidos</li>
              <li>• No se editan productos/totales (eso es del pedido)</li>
              <li>• Una factura puede tener múltiples pagos (parciales)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* DETALLE DE FACTURA (Modal simple) */}
      {detalleFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-sm font-bold text-gray-900">
                Detalle de Factura {detalleFactura.numero}
              </h3>
              <button
                onClick={() => setDetalleFactura(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-4">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Cliente</p>
                  <p className="text-sm font-medium text-gray-900">
                    {detalleFactura.cliente_nombre || detalleFactura.cliente}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Fecha</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatearFecha(detalleFactura.fecha)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Estado</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${estadosConfig[detalleFactura.estado]?.color}`}>
                    {estadosConfig[detalleFactura.estado]?.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Origen</p>
                  {detalleFactura.pedido_id ? (
                    <div className="flex items-center gap-1.5">
                      <div className="bg-blue-100 p-1 rounded">
                        <Package size={10} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-blue-700 font-mono">
                        {obtenerCodigoPedido(detalleFactura.pedido_id) || `PED-${detalleFactura.pedido_id.toString().slice(-6)}`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">Factura Directa</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Productos/Servicios</p>
                <div className="border border-gray-200 rounded-md">
                  {(() => {
                    try {
                      const items = typeof detalleFactura.items === 'string'
                        ? JSON.parse(detalleFactura.items)
                        : detalleFactura.items || []

                      return items.map((item, index) => (
                        <div key={index} className="px-3 py-2 border-b border-gray-100 last:border-b-0 flex justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-900">{item.producto}</p>
                            <p className="text-xs text-gray-500">
                              {item.cantidad} x ${formatearMonto(item.precio)}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-gray-900">
                            ${formatearMonto(item.subtotal)}
                          </p>
                        </div>
                      ))
                    } catch {
                      return (
                        <div className="px-3 py-4 text-center text-gray-500">
                          No se pudieron cargar los items
                        </div>
                      )
                    }
                  })()}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Subtotal</span>
                    <span className="text-xs font-medium text-gray-900">
                      ${formatearMonto(detalleFactura.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Pagado</span>
                    <span className="text-xs font-medium text-green-600">
                      ${formatearMonto(detalleFactura.montoPagado || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-700">Saldo Pendiente</span>
                    <span className={`text-sm font-bold ${(detalleFactura.saldoPendiente || detalleFactura.total - (detalleFactura.montoPagado || 0)) > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                      }`}>
                      ${formatearMonto(detalleFactura.saldoPendiente || detalleFactura.total - (detalleFactura.montoPagado || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDetalleFactura(null)}
                  className="flex-1 bg-white text-gray-700 px-3 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleImprimirFactura(detalleFactura)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs rounded-md transition-colors font-medium flex items-center justify-center gap-1"
                >
                  <Printer size={10} />
                  Imprimir/Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Facturacion