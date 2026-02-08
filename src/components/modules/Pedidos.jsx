"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Calendar, Package, CheckCircle, Clock, XCircle, Truck, Edit, Eye, FileText, DollarSign, User, ChevronLeft, ChevronRight, List, CalendarDays } from 'lucide-react'

const Pedidos = ({
  pedidos = [],
  productos = [],
  clientes = [],
  searchTerm = "",
  setSearchTerm,
  openModal,
  actualizarEstadoPedido,
  eliminarPedido,
  facturarPedido,
  recargarDatos
}) => {
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [filtroFacturacion, setFiltroFacturacion] = useState("todos")
  const [vistaActiva, setVistaActiva] = useState("lista") // "lista" | "semana" | "mes"
  const [fechaActual, setFechaActual] = useState(new Date())

  const pedidosSeguros = Array.isArray(pedidos) ? pedidos : []

  // Filtrar pedidos
  const filtrarPedidos = pedidosSeguros.filter((pedido) => {
    const coincideBusqueda =
      (pedido.codigo || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (pedido.cliente_nombre || "").toLowerCase().includes((searchTerm || "").toLowerCase())

    const coincideEstadoOperativo =
      filtroEstado === "todos" || pedido.estado === filtroEstado

    const coincideFacturacion =
      filtroFacturacion === "todos" ||
      (filtroFacturacion === "facturados" && pedido.factura_id) ||
      (filtroFacturacion === "no-facturados" && !pedido.factura_id)

    return coincideBusqueda && coincideEstadoOperativo && coincideFacturacion
  }).sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))

  // Paginación
  const totalPaginas = Math.ceil(filtrarPedidos.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const pedidosPaginados = filtrarPedidos.slice(indiceInicio, indiceFin)

  // Configuración de estados operativos
  const estadosOperativosConfig = {
    pendiente: {
      label: "Pendiente",
      color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      dotColor: "bg-yellow-500",
      icon: Clock,
      desc: "Pendiente de preparación"
    },
    preparando: {
      label: "Preparando",
      color: "bg-blue-50 text-blue-700 border border-blue-200",
      dotColor: "bg-blue-500",
      icon: Package,
      desc: "En preparación"
    },
    enviado: {
      label: "Enviado",
      color: "bg-purple-50 text-purple-700 border border-purple-200",
      dotColor: "bg-purple-500",
      icon: Truck,
      desc: "Enviado al cliente"
    },
    entregado: {
      label: "Entregado",
      color: "bg-green-50 text-green-700 border border-green-200",
      dotColor: "bg-green-500",
      icon: CheckCircle,
      desc: "Entregado al cliente"
    },
    cancelado: {
      label: "Cancelado",
      color: "bg-red-50 text-red-700 border border-red-200",
      dotColor: "bg-red-500",
      icon: XCircle,
      desc: "Pedido cancelado"
    }
  }

  // Configuración de estados de pago (basado en saldo)
  const getEstadoPago = (pedido) => {
    const total = Number.parseFloat(pedido.total) || 0
    const montoAbonado = Number.parseFloat(pedido.monto_abonado) || 0
    const saldoPendiente = Number.parseFloat(pedido.saldo_pendiente) !== undefined
      ? Number.parseFloat(pedido.saldo_pendiente)
      : total - montoAbonado

    if (saldoPendiente <= 0.01) { // Tolerancia para decimales
      return {
        label: "Pagado",
        color: "bg-green-50 text-green-700 border border-green-200",
        icon: CheckCircle,
        badge: "green"
      }
    } else if (montoAbonado > 0) {
      return {
        label: "Pago Parcial",
        color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        icon: DollarSign,
        badge: "yellow"
      }
    } else {
      return {
        label: "Sin Pago",
        color: "bg-gray-100 text-gray-700 border border-gray-300",
        icon: Clock,
        badge: "gray"
      }
    }
  }

  // Reset página al cambiar filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [filtroEstado, filtroFacturacion, searchTerm, itemsPorPagina])

  // Resumen de pedidos
  const resumenPedidos = {
    total: pedidosSeguros.length,
    pendientes: pedidosSeguros.filter(p => p.estado === 'pendiente').length,
    enProceso: pedidosSeguros.filter(p => p.estado === 'preparando').length,
    entregados: pedidosSeguros.filter(p => p.estado === 'entregado').length,
    conSaldo: pedidosSeguros.filter(p => {
      const saldo = Number.parseFloat(p.saldo_pendiente) || Number.parseFloat(p.total)
      return saldo > 0
    }).length,
    totalDeuda: pedidosSeguros.reduce((sum, p) => {
      const saldo = Number.parseFloat(p.saldo_pendiente) || Number.parseFloat(p.total)
      return sum + (saldo > 0 ? saldo : 0)
    }, 0)
  }

  // Funciones de utilidad
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

  const formatearMonto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatearMontoCorto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  // Determinar si se puede editar/facturar un pedido
  const sePuedeEditar = (pedido) => !pedido.factura_id && pedido.estado !== 'cancelado'
  const sePuedeFacturar = (pedido) => !pedido.factura_id

  // Handlers
  const handleFacturarPedido = async (pedidoId) => {
    if (facturarPedido) {
      const confirmar = window.confirm('¿Facturar este pedido? Se creará una factura separada.')
      if (confirmar) {
        const resultado = await facturarPedido(pedidoId)
        if (resultado && resultado.success && recargarDatos) {
          recargarDatos()
        }
      }
    }
  }

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    if (actualizarEstadoPedido) {
      const resultado = await actualizarEstadoPedido(pedidoId, nuevoEstado)
      if (resultado && resultado.success && recargarDatos) {
        recargarDatos()
      }
    }
  }

  const handleEliminar = async (pedidoId) => {
    if (eliminarPedido) {
      const confirmar = window.confirm('¿Estás seguro de eliminar este pedido?')
      if (confirmar) {
        const resultado = await eliminarPedido(pedidoId)
        if (resultado && resultado.success && recargarDatos) {
          recargarDatos()
        }
      }
    }
  }

  // ============ FUNCIONES DE CALENDARIO ============
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

  const getInicioSemana = (fecha) => {
    const d = new Date(fecha)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const getFinSemana = (fecha) => {
    const inicio = getInicioSemana(fecha)
    return new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6)
  }

  const getDiasDelMes = (fecha) => {
    const year = fecha.getFullYear()
    const month = fecha.getMonth()
    const primerDia = new Date(year, month, 1)
    const ultimoDia = new Date(year, month + 1, 0)
    const dias = []

    const primerDiaSemana = primerDia.getDay()
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      dias.push({ fecha: d, esDelMes: false })
    }

    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push({ fecha: new Date(year, month, i), esDelMes: true })
    }

    const diasRestantes = 42 - dias.length
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({ fecha: new Date(year, month + 1, i), esDelMes: false })
    }

    return dias
  }

  const getDiasSemana = (fecha) => {
    const inicio = getInicioSemana(fecha)
    const dias = []
    for (let i = 0; i < 7; i++) {
      dias.push(new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i))
    }
    return dias
  }

  const getPedidosPorFecha = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0]
    return pedidosSeguros.filter(p => {
      const fechaEntrega = p.fecha_entrega_estimada?.split('T')[0]
      return fechaEntrega === fechaStr
    })
  }

  const navegarAnterior = () => {
    if (vistaActiva === "semana") {
      setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() - 7))
    } else if (vistaActiva === "mes") {
      setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1))
    }
  }

  const navegarSiguiente = () => {
    if (vistaActiva === "semana") {
      setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() + 7))
    } else if (vistaActiva === "mes") {
      setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1))
    }
  }

  const irAHoy = () => setFechaActual(new Date())

  const esHoy = (fecha) => fecha.toDateString() === new Date().toDateString()

  // Resumen del calendario
  const resumenVista = useMemo(() => {
    let diasAMostrar = []
    if (vistaActiva === "semana") {
      diasAMostrar = getDiasSemana(fechaActual)
    } else if (vistaActiva === "mes") {
      diasAMostrar = getDiasDelMes(fechaActual).filter(d => d.esDelMes).map(d => d.fecha)
    }

    let totalPedidos = 0
    let totalMonto = 0
    const porEstado = { pendiente: 0, preparando: 0, enviado: 0, entregado: 0, cancelado: 0 }

    diasAMostrar.forEach(fecha => {
      const pedidosDia = getPedidosPorFecha(fecha)
      totalPedidos += pedidosDia.length
      pedidosDia.forEach(p => {
        totalMonto += Number.parseFloat(p.total) || 0
        if (porEstado[p.estado] !== undefined) {
          porEstado[p.estado]++
        }
      })
    })

    return { totalPedidos, totalMonto, porEstado }
  }, [fechaActual, vistaActiva, pedidosSeguros])

  const getTituloPeriodo = () => {
    if (vistaActiva === "semana") {
      const inicio = getInicioSemana(fechaActual)
      const fin = getFinSemana(fechaActual)
      const formatoCorto = (d) => `${d.getDate()} ${meses[d.getMonth()].substring(0, 3)}`
      return `${formatoCorto(inicio)} - ${formatoCorto(fin)}, ${fin.getFullYear()}`
    } else if (vistaActiva === "mes") {
      return `${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`
    }
    return ""
  }

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Pedidos</h2>
          <p className="text-xs text-gray-500 mt-0.5">Seguimiento operativo y calendario de trabajo</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de vista */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setVistaActiva("lista")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${vistaActiva === "lista"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <List size={12} />
              Lista
            </button>
            <button
              onClick={() => setVistaActiva("semana")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${vistaActiva === "semana"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <CalendarDays size={12} />
              Semana
            </button>
            <button
              onClick={() => setVistaActiva("mes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${vistaActiva === "mes"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <Calendar size={12} />
              Mes
            </button>
          </div>

          {/* BOTÓN NUEVO PEDIDO */}
          <button
            onClick={() => openModal && openModal("nueva-venta")}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Plus size={12} />
            Nuevo Pedido
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMEN - ACTUALIZADAS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Total</h3>
            <Package className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenPedidos.total}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Pedidos registrados</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Pendientes</h3>
            <Clock className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenPedidos.pendientes}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Por atender</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">En Proceso</h3>
            <Truck className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenPedidos.enProceso}</p>
            <p className="text-[10px] text-gray-500 leading-tight">En preparación</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Entregados</h3>
            <CheckCircle className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenPedidos.entregados}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Completados</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Con Saldo</h3>
            <DollarSign className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenPedidos.conSaldo}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Por cobrar</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Deuda Total</h3>
            <Clock className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMontoCorto(resumenPedidos.totalDeuda)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Saldo pendiente</p>
          </div>
        </div>
      </div>

      {/* ============ VISTA LISTA ============ */}
      {vistaActiva === "lista" && (
        <>
          {/* BÚSQUEDA Y FILTROS */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                placeholder="Buscar pedidos por código o cliente..."
                className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="preparando">Preparando</option>
              <option value="enviado">Enviados</option>
              <option value="entregado">Entregados</option>
              <option value="cancelado">Cancelados</option>
            </select>

            <select
              className="px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={filtroFacturacion}
              onChange={(e) => setFiltroFacturacion(e.target.value)}
            >
              <option value="todos">Toda facturación</option>
              <option value="facturados">Facturados</option>
              <option value="no-facturados">Sin facturar</option>
            </select>
          </div>

          {/* TABLA DE PEDIDOS */}
          <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">Lista de Pedidos</h3>
                  <p className="text-xs text-gray-500">Pedidos registrados en el sistema</p>
                </div>
                <div className="text-xs text-gray-600">
                  {filtrarPedidos.length} pedidos encontrados
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Estado Operativo</th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Estado Pago</th>
                    <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {pedidosPaginados.length > 0 ? (
                    pedidosPaginados.map((pedido) => {
                      const EstadoOperativoIcon = estadosOperativosConfig[pedido.estado]?.icon || Clock
                      const estadoPago = getEstadoPago(pedido)
                      const EstadoPagoIcon = estadoPago.icon
                      const puedeEditar = sePuedeEditar(pedido)
                      const puedeFacturar = sePuedeFacturar(pedido)
                      const saldoPendiente = Number.parseFloat(pedido.saldo_pendiente) || Number.parseFloat(pedido.total)

                      return (
                        <tr key={pedido.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="bg-blue-50 p-1 rounded border border-blue-200">
                                <Package size={10} className="text-blue-600" />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-900 font-mono">
                                  {pedido.codigo || "N/A"}
                                </span>
                                {pedido.factura_id && (
                                  <div className="text-[9px] text-blue-600 font-medium mt-0.5">
                                    Facturado
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-2 py-1.5 text-xs text-gray-900">
                            <div className="flex items-center gap-1">
                              <User size={9} className="text-gray-400" />
                              {pedido.cliente_nombre || "Cliente no encontrado"}
                            </div>
                            {pedido.notas && (
                              <div className="text-[9px] text-gray-500 mt-0.5 truncate max-w-[120px]" title={pedido.notas}>
                                {pedido.notas}
                              </div>
                            )}
                          </td>

                          <td className="px-2 py-1.5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Calendar size={9} className="text-gray-400" />
                                {formatearFecha(pedido.fecha_pedido)}
                              </div>
                              {pedido.fecha_entrega_estimada && (
                                <div className="text-[9px] text-gray-500">
                                  Entrega: {formatearFecha(pedido.fecha_entrega_estimada)}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-2 py-1.5">
                            <div className="text-xs font-semibold text-gray-900">
                              ${formatearMonto(pedido.total)}
                            </div>
                            {saldoPendiente > 0 && (
                              <div className="text-[10px] text-orange-600 font-medium mt-0.5">
                                Saldo: ${formatearMonto(saldoPendiente)}
                              </div>
                            )}
                          </td>

                          <td className="px-2 py-1.5">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${estadosOperativosConfig[pedido.estado]?.color}`}>
                                <EstadoOperativoIcon size={9} />
                                {estadosOperativosConfig[pedido.estado]?.label || pedido.estado}
                              </span>
                            </div>
                          </td>

                          <td className="px-2 py-1.5">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${estadoPago.color}`}>
                                <EstadoPagoIcon size={9} />
                                {estadoPago.label}
                              </span>
                              {saldoPendiente > 0 && (
                                <div className="text-[9px] text-orange-600">
                                  ${formatearMonto(saldoPendiente)}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-2 py-1.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal && openModal("ver-pedido", pedido)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm bg-white"
                                title="Ver Detalles"
                              >
                                <Eye size={16} />
                              </button>

                              {puedeEditar && (
                                <button
                                  onClick={() => openModal && openModal("editar-pedido", pedido)}
                                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 shadow-sm bg-white"
                                  title="Editar Pedido"
                                >
                                  <Edit size={16} />
                                </button>
                              )}

                              {puedeFacturar && (
                                <button
                                  onClick={() => handleFacturarPedido(pedido.id)}
                                  className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-100 shadow-sm bg-white"
                                  title="Facturar Pedido"
                                >
                                  <FileText size={16} />
                                </button>
                              )}

                              {pedido.factura_id && (
                                <button
                                  onClick={() => openModal && openModal("ver-factura", { id: pedido.factura_id })}
                                  className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-purple-100 shadow-sm bg-white"
                                  title="Ver Factura"
                                >
                                  <DollarSign size={16} />
                                </button>
                              )}

                              {!pedido.factura_id && (
                                <button
                                  onClick={() => handleEliminar(pedido.id)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-100 shadow-sm bg-white"
                                  title="Eliminar Pedido"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-3 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-100 p-2 rounded-full mb-1.5 border border-gray-200">
                            <Package size={16} className="text-gray-400" />
                          </div>
                          <p className="text-xs font-semibold text-gray-900 mb-0.5">No se encontraron pedidos</p>
                          <p className="text-xs text-gray-500">
                            {searchTerm || filtroEstado !== "todos" || filtroFacturacion !== "todos"
                              ? "Intenta con otros términos o filtros"
                              : "Crea tu primer pedido"}
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
                    Mostrando {Math.min(filtrarPedidos.length, itemsPorPagina)} de {filtrarPedidos.length} pedidos
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
                    <ChevronLeft size={12} />
                  </button>
                  <span className="px-2 py-0.5 text-xs font-medium text-gray-700">
                    {paginaActual} / {totalPaginas || 1}
                  </span>
                  <button
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas || totalPaginas === 0}
                    className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============ VISTA SEMANA / MES ============ */}
      {(vistaActiva === "semana" || vistaActiva === "mes") && (
        <>
          {/* Header del calendario */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={navegarAnterior}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={navegarSiguiente}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
                <h4 className="text-sm font-semibold text-gray-900 ml-2">{getTituloPeriodo()}</h4>
              </div>

              <button
                onClick={irAHoy}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Resumen del período */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="bg-white p-2.5 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-[10px] text-gray-500">Total periodo</span>
              </div>
              <p className="text-base font-bold text-gray-900">{resumenVista.totalPedidos}</p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Package size={12} className="text-gray-400" />
                <span className="text-[10px] text-gray-500">Monto</span>
              </div>
              <p className="text-base font-bold text-gray-900">${formatearMontoCorto(resumenVista.totalMonto)}</p>
            </div>
            {Object.entries(resumenVista.porEstado).slice(0, 4).map(([estado, cantidad]) => (
              <div key={estado} className="bg-white p-2.5 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${estadosOperativosConfig[estado]?.dotColor || 'bg-gray-400'}`} />
                  <span className="text-[10px] text-gray-500 capitalize">{estado}</span>
                </div>
                <p className="text-base font-bold text-gray-900">{cantidad}</p>
              </div>
            ))}
          </div>

          {/* Vista Semanal */}
          {vistaActiva === "semana" && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-200">
                {getDiasSemana(fechaActual).map((dia, idx) => (
                  <div
                    key={idx}
                    className={`p-2 text-center border-r last:border-r-0 border-gray-200 ${esHoy(dia) ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                  >
                    <p className="text-xs font-medium text-gray-500">{diasSemana[dia.getDay()]}</p>
                    <p className={`text-lg font-bold ${esHoy(dia) ? 'text-blue-600' : 'text-gray-900'}`}>
                      {dia.getDate()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 min-h-[350px]">
                {getDiasSemana(fechaActual).map((dia, idx) => {
                  const pedidosDia = getPedidosPorFecha(dia)
                  return (
                    <div
                      key={idx}
                      className={`p-2 border-r last:border-r-0 border-gray-200 ${esHoy(dia) ? 'bg-blue-50/30' : ''
                        }`}
                    >
                      <div className="space-y-1.5">
                        {pedidosDia.length > 0 ? (
                          pedidosDia.map(pedido => {
                            const EstadoIcon = estadosOperativosConfig[pedido.estado]?.icon || Clock
                            return (
                              <div
                                key={pedido.id}
                                onClick={() => openModal && openModal("ver-pedido", pedido)}
                                className={`p-2 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${estadosOperativosConfig[pedido.estado]?.color || 'bg-gray-100 border-gray-300'}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-mono font-bold">{pedido.codigo}</span>
                                  <EstadoIcon size={10} />
                                </div>
                                <p className="text-[10px] font-medium truncate">{pedido.cliente_nombre}</p>
                                <p className="text-[10px] font-bold mt-0.5">${formatearMontoCorto(pedido.total)}</p>
                              </div>
                            )
                          })
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-300">
                            <span className="text-[10px]">Sin pedidos</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Vista Mensual */}
          {vistaActiva === "mes" && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {diasSemana.map(dia => (
                  <div key={dia} className="p-2 text-center border-r last:border-r-0 border-gray-200">
                    <p className="text-xs font-medium text-gray-500">{dia}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {getDiasDelMes(fechaActual).map((diaObj, idx) => {
                  const pedidosDia = getPedidosPorFecha(diaObj.fecha)
                  return (
                    <div
                      key={idx}
                      className={`min-h-[90px] p-1 border-r border-b last:border-r-0 border-gray-100 ${!diaObj.esDelMes ? 'bg-gray-50/50' : ''
                        } ${esHoy(diaObj.fecha) ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${!diaObj.esDelMes ? 'text-gray-300' :
                          esHoy(diaObj.fecha) ? 'text-blue-600 font-bold' : 'text-gray-700'
                          }`}>
                          {diaObj.fecha.getDate()}
                        </span>
                        {pedidosDia.length > 0 && (
                          <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded">
                            {pedidosDia.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {pedidosDia.slice(0, 3).map(pedido => (
                          <div
                            key={pedido.id}
                            onClick={() => openModal && openModal("ver-pedido", pedido)}
                            className={`px-1 py-0.5 rounded text-[9px] font-medium truncate cursor-pointer hover:opacity-80 ${estadosOperativosConfig[pedido.estado]?.color || 'bg-gray-100'}`}
                          >
                            {pedido.codigo}
                          </div>
                        ))}
                        {pedidosDia.length > 3 && (
                          <div className="text-[9px] text-gray-500 pl-1">
                            +{pedidosDia.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Leyenda de estados */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Leyenda de estados</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(estadosOperativosConfig).map(([estado, config]) => {
                const Icon = config.icon
                return (
                  <div key={estado} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                    <Icon size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-600">{config.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* INFORMACIÓN ADICIONAL */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="bg-blue-100 p-1.5 rounded">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-blue-900 mb-1">Módulo de Pedidos Simplificado</h4>
            <ul className="text-xs text-blue-800 space-y-0.5">
              <li>• <strong>Crea pedidos sin facturas automáticas</strong></li>
              <li>• <strong>Agrega abonos directamente</strong> en el detalle del pedido</li>
              <li>• El saldo se actualiza en tiempo real</li>
              <li>• <strong>Opcional</strong>: Puedes crear factura después si lo necesitas</li>
              <li>• Stock se actualiza automáticamente al crear pedido</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pedidos