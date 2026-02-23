"use client"

import React, { useState, useMemo } from 'react'
import { Calendar, Users, Package, BarChart3, DollarSign, TrendingUp, TrendingDown, Download, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const Reportes = ({
  facturas = [],
  pedidos = [],
  clientes = [],
  productos = [],
  searchTerm = "",
  setSearchTerm
}) => {
  const [periodo, setPeriodo] = useState("mes") // dia, semana, mes, anio, todos
  const anioActualReal = new Date().getFullYear()
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActualReal)

  const facturasSafe = Array.isArray(facturas) ? facturas : []
  const clientesSafe = Array.isArray(clientes) ? clientes : []

  // Helpers de fechas
  const hoy = new Date()
  const fechaFiltro = new Date()

  if (periodo === "dia") {
    fechaFiltro.setHours(0, 0, 0, 0)
  } else if (periodo === "semana") {
    fechaFiltro.setDate(hoy.getDate() - 7)
    fechaFiltro.setHours(0, 0, 0, 0)
  } else if (periodo === "mes") {
    fechaFiltro.setDate(1)
    fechaFiltro.setHours(0, 0, 0, 0)
  } else if (periodo === "anio") {
    fechaFiltro.setMonth(0, 1)
    fechaFiltro.setHours(0, 0, 0, 0)
  } else {
    fechaFiltro.setFullYear(2000) // "todos"
  }

  // Filtrar facturas por periodo y termino de busqueda
  const facturasFiltradas = facturasSafe.filter(f => {
    const d = new Date(f.fecha + 'T00:00:00')
    const coincideFecha = d >= fechaFiltro

    const searchSafe = (searchTerm || "").toLowerCase()
    const coincideBusqueda =
      String(f.numero || "").toLowerCase().includes(searchSafe) ||
      String(f.cliente || f.cliente_nombre || "").toLowerCase().includes(searchSafe)

    return coincideFecha && coincideBusqueda
  })

  // 1. Calcular métricas principales
  const estadisticas = useMemo(() => {
    let ventasTotal = 0
    let cobradoTotal = 0
    let clientesActivos = new Set()
    let productosCount = 0

    facturasFiltradas.forEach(f => {
      // Solo sumamos ingresos generados, podríamos excluir anuladas si tuvieran ese estado formal.
      if (f.estado !== 'anulada') {
        ventasTotal += (Number.parseFloat(f.total) || 0)
        cobradoTotal += (Number.parseFloat(f.montopagado) || 0)

        let nomCli = f.cliente_nombre || f.cliente
        if (nomCli) clientesActivos.add(nomCli)

        // Parsear items para contar productos y armar tops
        let itemsArr = []
        try {
          itemsArr = typeof f.items === 'string' ? JSON.parse(f.items) : (f.items || [])
        } catch (e) { }

        itemsArr.forEach(i => {
          productosCount += (Number.parseFloat(i.cantidad) || 0)
        })
      }
    })

    return {
      ventasTotales: ventasTotal,
      cobradoTotal: cobradoTotal,
      clientesActivos: clientesActivos.size,
      productosVendidos: productosCount
    }
  }, [facturasFiltradas])

  // 2. Gráfico de últimos 7 días (independiente del filtro actual)
  const chartSieteDias = useMemo(() => {
    const dias = []
    const ventasPorDia = [0, 0, 0, 0, 0, 0, 0]
    const nombresDias = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(hoy.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      dias.push(iso)
      nombresDias.push(d.toLocaleDateString('es-ES', { weekday: 'short' }))
    }

    facturasSafe.forEach(f => {
      const index = dias.indexOf(f.fecha)
      if (index !== -1 && f.estado !== 'anulada') {
        ventasPorDia[index] += (Number.parseFloat(f.total) || 0)
      }
    })

    const maxDia = Math.max(...ventasPorDia, 1) // evitar division por 0
    const porcentajes = ventasPorDia.map(v => (v / maxDia) * 100)

    return { nombresDias, ventasPorDia, porcentajes }
  }, [facturasSafe])

  // 3. Top Clientes
  const topClientes = useMemo(() => {
    const mapa = {}
    facturasFiltradas.forEach(f => {
      if (f.estado === 'anulada') return
      const nom = f.cliente_nombre || f.cliente || 'Consumidor Final'
      if (!mapa[nom]) mapa[nom] = { nombre: nom, compras: 0, total: 0 }
      mapa[nom].compras += 1
      mapa[nom].total += (Number.parseFloat(f.total) || 0)
    })
    return Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [facturasFiltradas])

  // 4. Top Productos
  const topProductos = useMemo(() => {
    const mapa = {}
    facturasFiltradas.forEach(f => {
      if (f.estado === 'anulada') return
      let itemsArr = []
      try {
        itemsArr = typeof f.items === 'string' ? JSON.parse(f.items) : (f.items || [])
      } catch (e) { }

      itemsArr.forEach(item => {
        const nom = item.nombre || item.descripcion || 'Producto'
        if (!mapa[nom]) mapa[nom] = { nombre: nom, cantidad: 0, total: 0 }
        mapa[nom].cantidad += (Number.parseFloat(item.cantidad) || 0)
        mapa[nom].total += (Number.parseFloat(item.precio) * Number.parseFloat(item.cantidad) || 0)
      })
    })
    return Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10)
  }, [facturasFiltradas])

  // 5. Resumen mensual del año seleccionado (navegable)
  const resumenMensual = useMemo(() => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return meses.map((nombre, idx) => {
      const facturasDelMes = facturasSafe.filter(f => {
        if (f.estado === 'anulada') return false
        const d = new Date(f.fecha + 'T00:00:00')
        return d.getFullYear() === anioSeleccionado && d.getMonth() === idx
      })
      const pedidosDelMes = Array.isArray(pedidos) ? pedidos.filter(p => {
        const d = new Date((p.created_at || p.fecha || '').split('T')[0] + 'T00:00:00')
        return d.getFullYear() === anioSeleccionado && d.getMonth() === idx
      }) : []
      const totalFacturado = facturasDelMes.reduce((s, f) => s + (parseFloat(f.total) || 0), 0)
      const totalCobrado = facturasDelMes.reduce((s, f) => s + (parseFloat(f.montopagado) || 0), 0)
      const cantFacturas = facturasDelMes.length
      const cantPedidos = pedidosDelMes.length
      return { nombre, idx, totalFacturado, totalCobrado, cantFacturas, cantPedidos }
    })
  }, [facturasSafe, pedidos, anioSeleccionado])

  const formatearMonto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatearMontoCorto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  return (
    <div className="space-y-3 pb-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reportes y Estadísticas</h2>
          <p className="text-xs text-gray-500 mt-0.5">Análisis de datos y métricas del negocio</p>
        </div>

        {/* BOTONES SUPERIORES */}
        <div className="flex gap-1.5">
          <button className="bg-white text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-medium border border-gray-300 shadow-sm" onClick={() => window.print()}>
            <Download size={12} />
            Exportar (Imprimir)
          </button>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div className="flex gap-2 print:hidden">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Filtrar por número de factura o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
          />
        </div>
        <select
          className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs font-medium text-gray-700"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <option value="dia">Día Actual (Hoy)</option>
          <option value="semana">Últimos 7 Días</option>
          <option value="mes">Este Mes</option>
          <option value="anio">Este Año</option>
          <option value="todos">Todos los tiempos</option>
        </select>
      </div>

      {/* CARDS DE RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Total Facturado</h3>
            <DollarSign className="text-blue-500" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMontoCorto(estadisticas.ventasTotales)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Valor total en facturas emitidas</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Total Cobrado</h3>
            <TrendingUp className="text-green-500" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMontoCorto(estadisticas.cobradoTotal)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Ingresos reales (sin deuda)</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Clientes Atendidos</h3>
            <Users className="text-purple-500" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{estadisticas.clientesActivos}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Clientes que compraron</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Unidades Vendidas</h3>
            <Package className="text-orange-500" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{estadisticas.productosVendidos}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Suma de productos despachados</p>
          </div>
        </div>
      </div>

      {/* GRÁFICO Y TOP CLIENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* GRÁFICO DE VENTAS (Muestra siempre últimos 7 días con datos) */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-900">Histórico: Últimos 7 Días</h3>
            <p className="text-[10px] text-gray-500">Tendencia de facturación diaria asegurada</p>
          </div>
          <div className="p-3">
            <div className="h-48 flex items-end justify-around gap-1">
              {chartSieteDias.porcentajes.map((porc, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  <div className="absolute -top-6 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    ${formatearMontoCorto(chartSieteDias.ventasPorDia[i])}
                  </div>
                  <div className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all duration-300" style={{ height: `${porc}%`, minHeight: chartSieteDias.ventasPorDia[i] > 0 ? '4px' : '0' }}></div>
                  <p className="text-[10px] text-gray-600 mt-2 capitalize font-medium">{chartSieteDias.nombresDias[i]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP CLIENTES */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden h-full flex flex-col">
          <div className="px-3 py-2 border-b border-gray-200 shrink-0">
            <h3 className="text-xs font-semibold text-gray-900">Mejores Clientes</h3>
            <p className="text-[10px] text-gray-500">Top 5 por volumen de compras ({periodo})</p>
          </div>
          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {topClientes.length > 0 ? topClientes.map((cliente, index) => (
              <div key={index} className="px-3 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-1.5 rounded-full border border-gray-200">
                      <Users size={12} className="text-gray-500" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-900 block leading-tight">{cliente.nombre}</span>
                      <span className="text-[9px] text-gray-500">{cliente.compras} {cliente.compras === 1 ? 'compra' : 'compras'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">${formatearMonto(cliente.total)}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex items-center justify-center p-6 text-xs text-gray-500 h-full">
                No hay ventas para los clientes en este período.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RESUMEN MENSUAL CON SELECTOR DE AÑO ────────────────── */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-gray-900">Resumen mensual</h3>
            <p className="text-[10px] text-gray-500">Ventas facturadas, cobradas y pedidos mes a mes</p>
          </div>
          {/* Selector de año con flechas */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
            <button
              onClick={() => setAnioSeleccionado(a => a - 1)}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
              title="Año anterior"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-xs font-bold text-gray-800 min-w-[36px] text-center">
              {anioSeleccionado}
            </span>
            <button
              onClick={() => setAnioSeleccionado(a => a + 1)}
              disabled={anioSeleccionado >= anioActualReal}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Año siguiente"
            >
              <ChevronRight size={13} />
            </button>
            {anioSeleccionado !== anioActualReal && (
              <button
                onClick={() => setAnioSeleccionado(anioActualReal)}
                className="ml-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Hoy
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Mes</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase">Facturas</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase">Pedidos</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase">Total Facturado</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase">Total Cobrado</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase">Saldo Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {resumenMensual.map((mes) => {
                const mesActual = new Date().getMonth()
                const esMesActual = mes.idx === mesActual
                const pendiente = mes.totalFacturado - mes.totalCobrado
                const sinActividad = mes.cantFacturas === 0 && mes.cantPedidos === 0
                return (
                  <tr
                    key={mes.idx}
                    className={`transition-colors ${esMesActual ? 'bg-blue-50 hover:bg-blue-100' :
                      sinActividad ? 'opacity-40' :
                        'hover:bg-gray-50'
                      }`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {esMesActual && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                        <span className={`text-xs font-semibold ${esMesActual ? 'text-blue-700' : 'text-gray-700'}`}>
                          {mes.nombre}
                        </span>
                        {esMesActual && <span className="text-[9px] text-blue-500 font-medium">(actual)</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-xs font-medium ${mes.cantFacturas > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                        {mes.cantFacturas}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-xs font-medium ${mes.cantPedidos > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                        {mes.cantPedidos}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-xs font-bold ${mes.totalFacturado > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                        {mes.totalFacturado > 0 ? `$${formatearMontoCorto(mes.totalFacturado)}` : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-xs font-bold ${mes.totalCobrado > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                        {mes.totalCobrado > 0 ? `$${formatearMontoCorto(mes.totalCobrado)}` : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {pendiente > 0 ? (
                        <span className="text-xs font-bold text-red-500">${formatearMontoCorto(pendiente)}</span>
                      ) : mes.totalFacturado > 0 ? (
                        <span className="text-xs font-medium text-green-600">✓ Saldado</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* TOTALES DEL AÑO */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-3 py-2 text-xs font-bold text-gray-900">TOTAL {anioSeleccionado}</td>
                <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                  {resumenMensual.reduce((s, m) => s + m.cantFacturas, 0)}
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                  {resumenMensual.reduce((s, m) => s + m.cantPedidos, 0)}
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold text-gray-900">
                  ${formatearMontoCorto(resumenMensual.reduce((s, m) => s + m.totalFacturado, 0))}
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold text-green-600">
                  ${formatearMontoCorto(resumenMensual.reduce((s, m) => s + m.totalCobrado, 0))}
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold text-red-500">
                  ${formatearMontoCorto(resumenMensual.reduce((s, m) => s + Math.max(0, m.totalFacturado - m.totalCobrado), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reportes
