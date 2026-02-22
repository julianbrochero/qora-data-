"use client"

import React, { useState, useMemo } from 'react'
import { Calendar, Users, Package, BarChart3, DollarSign, TrendingUp, TrendingDown, Download, Filter, Search } from 'lucide-react'

const Reportes = ({
  facturas = [],
  pedidos = [],
  clientes = [],
  productos = [],
  searchTerm = "",
  setSearchTerm
}) => {
  const [periodo, setPeriodo] = useState("mes") // dia, semana, mes, anio, todos

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

  const formatearMonto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatearMontoCorto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    // Lógica para acortar si es muy grande, o solo quitar decimales para que entre
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
                    <div className="bg-purple-50 p-1.5 rounded-full border border-purple-100">
                      <Users size={12} className="text-purple-600" />
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

      {/* TABLA DE TOP PRODUCTOS */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">Productos Más Vendidos</h3>
          <p className="text-[10px] text-gray-500">Ranking por cantidad de unidades vendidas ({periodo})</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Posición</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase">Producto</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase">Cantidad Vendida</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold text-gray-600 uppercase">Ingreso Generado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {topProductos.length > 0 ? topProductos.map((producto, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-xs font-bold text-gray-400 w-12 text-center">#{idx + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-50 p-1 rounded border border-blue-100">
                        <Package size={10} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-900">{producto.nombre}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="text-xs font-bold text-gray-900">{producto.cantidad}</div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="text-xs font-bold text-green-600">${formatearMonto(producto.total)}</div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-3 py-6 text-center text-xs text-gray-500">
                    No se vendieron productos en este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reportes