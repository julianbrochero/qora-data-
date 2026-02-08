"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Download, Printer, Eye, DollarSign, FileText, Users, CreditCard, Calendar, MoreVertical, Package, CheckCircle, Clock } from "lucide-react"

const Facturacion = ({
  facturas = [],
  pedidos = [],
  searchTerm = "",
  setSearchTerm,
  onNuevaFactura,
  abonos = [],
  registrarPagoFactura,
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
        (factura.pedido_id || "").toString().includes(searchTerm)

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
  }, [pestañaActiva, filtroEstado, searchTerm, itemsPorPagina])

  // Calcular resumen de deudas
  const resumenDeudas = {
    totalDeuda: facturasSeguras
      .filter((f) => f.estado !== "pagada")
      .reduce((sum, f) => sum + (Number.parseFloat(f.saldoPendiente) || Number.parseFloat(f.total) || 0), 0),

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

  // Handler para registrar pago
  const handleRegistrarPago = async () => {
    if (!facturaSeleccionada) return

    const monto = Number.parseFloat(montoPago) || 0
    if (monto <= 0) {
      alert("El monto debe ser mayor a 0")
      return
    }

    const saldoPendiente = Number.parseFloat(facturaSeleccionada.saldoPendiente) ||
      Number.parseFloat(facturaSeleccionada.total)

    if (monto > saldoPendiente) {
      alert(`El monto excede el saldo pendiente ($${formatearMonto(saldoPendiente)})`)
      return
    }

    if (registrarPagoFactura) {
      const resultado = await registrarPagoFactura(
        facturaSeleccionada.id,
        monto,
        metodoPago,
        `Pago manual - ${facturaSeleccionada.numero}`
      )

      if (resultado) {
        setMostrarModalPago(false)
        setMontoPago("")
        setFacturaSeleccionada(null)

        if (recargarDatos) {
          recargarDatos()
        }
      }
    }
  }

  // Handler para ver detalle de factura
  const handleVerDetalle = (factura) => {
    setDetalleFactura(factura)
  }

  // Handler para imprimir/descargar factura
  const handleImprimirFactura = (factura) => {
    // Aquí iría la lógica para generar PDF
    alert(`Generando PDF de factura ${factura.numero}...`)
  }

  // Handler para anular factura
  const handleAnularFactura = (factura) => {
    if (!window.confirm(`¿Estás seguro de anular la factura ${factura.numero}?`)) {
      return
    }
    alert(`Factura ${factura.numero} anulada (implementar lógica completa)`)
  }

  // Componente para modal de pago
  const ModalPago = () => {
    if (!mostrarModalPago || !facturaSeleccionada) return null

    const saldoPendiente = Number.parseFloat(facturaSeleccionada.saldoPendiente) ||
      Number.parseFloat(facturaSeleccionada.total)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Registrar Pago</h3>
            <button
              onClick={() => {
                setMostrarModalPago(false)
                setFacturaSeleccionada(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Contenido */}
          <div className="p-4 space-y-3">
            {/* Información de factura */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-900">
                  {facturaSeleccionada.numero}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${estadosConfig[facturaSeleccionada.estado]?.color}`}>
                  {estadosConfig[facturaSeleccionada.estado]?.label}
                </span>
              </div>
              <div className="text-xs text-blue-800">
                Cliente: {facturaSeleccionada.cliente_nombre || facturaSeleccionada.cliente}
              </div>
              <div className="text-xs text-blue-800">
                Total: ${formatearMonto(facturaSeleccionada.total)}
              </div>
              <div className="text-xs text-blue-800 font-semibold mt-1">
                Saldo pendiente: ${formatearMonto(saldoPendiente)}
              </div>
            </div>

            {/* Monto del pago */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Monto a pagar
              </label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  value={montoPago}
                  onChange={(e) => setMontoPago(e.target.value)}
                  step="0.01"
                  min="0"
                  max={saldoPendiente}
                />
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                Máximo: ${formatearMonto(saldoPendiente)}
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Método de pago
              </label>
              <select
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setMostrarModalPago(false)
                  setFacturaSeleccionada(null)
                }}
                className="flex-1 bg-white text-gray-700 px-3 py-1.5 text-xs rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarPago}
                disabled={!montoPago || Number.parseFloat(montoPago) <= 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Modal de pago */}
      <ModalPago />

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Facturación</h2>
          <p className="text-xs text-gray-500 mt-0.5">Contabilidad, deudas y pagos</p>
        </div>

        {/* BOTÓN NUEVA FACTURA - SOLO PARA FACTURAS DIRECTAS (sin pedido) */}
        <button
          onClick={() => onNuevaFactura && onNuevaFactura()}
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
        >
          <Plus size={12} />
          Factura Directa
        </button>
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
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Número</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Origen</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Pagado</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Saldo</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {facturasPaginadas.length > 0 ? (
                facturasPaginadas.map((factura) => {
                  const montoPagado = Number.parseFloat(factura.montoPagado) || 0
                  const totalFactura = Number.parseFloat(factura.total) || 0
                  const saldoPendiente = Number.parseFloat(factura.saldoPendiente) || (totalFactura - montoPagado)
                  const estado = factura.estado || "pendiente"
                  const EstadoIcon = estadosConfig[estado]?.icon || FileText

                  return (
                    <tr key={factura.id} className="hover:bg-gray-50 transition-colors group">
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
                            <span className="text-xs text-gray-700">
                              Pedido #{factura.pedido_id?.toString().slice(-6)}
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
                                setMontoPago(saldoPendiente.toString())
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

                          {/* Anular (solo si no está anulada y no está pagada) */}
                          {estado !== 'anulada' && estado !== 'pagada' && (
                            <button
                              onClick={() => handleAnularFactura(factura)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-100 shadow-sm bg-white"
                              title="Anular Factura"
                            >
                              <Clock size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-3 py-6 text-center">
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
                  <p className="text-sm font-medium text-gray-900">
                    {detalleFactura.pedido_id ? `Pedido #${detalleFactura.pedido_id}` : 'Factura Directa'}
                  </p>
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