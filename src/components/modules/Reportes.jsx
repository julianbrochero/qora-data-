"use client"

import React, { useState } from 'react'
import { Calendar, Users, Package, BarChart3, DollarSign, TrendingUp, TrendingDown, Download, Filter, Search, ChevronLeft, ChevronRight, PieChart } from 'lucide-react'

const Reportes = () => {
  const [periodo, setPeriodo] = useState("mes")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)

  // Datos de ejemplo para reportes
  const datosReportes = {
    ventasMensuales: 125000,
    ventasAnuales: 1500000,
    clientesActivos: 45,
    productosVendidos: 320,
    ingresosNetos: 98000,
    gastosOperativos: 42000,
    gananciaNeta: 56000,
    crecimiento: 12.5
  }

  const topClientes = [
    { id: 1, nombre: "Cliente A", compras: 15, total: 45000 },
    { id: 2, nombre: "Cliente B", compras: 12, total: 38000 },
    { id: 3, nombre: "Cliente C", compras: 10, total: 32000 },
    { id: 4, nombre: "Cliente D", compras: 8, total: 28000 },
    { id: 5, nombre: "Cliente E", compras: 7, total: 24000 },
  ]

  const topProductos = [
    { id: 1, nombre: "Producto X", cantidad: 85, total: 42500 },
    { id: 2, nombre: "Producto Y", cantidad: 72, total: 36000 },
    { id: 3, nombre: "Producto Z", cantidad: 68, total: 34000 },
    { id: 4, nombre: "Producto W", cantidad: 52, total: 26000 },
    { id: 5, nombre: "Producto V", cantidad: 43, total: 21500 },
  ]

  const formatearMonto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reportes y Estadísticas</h2>
          <p className="text-xs text-gray-500 mt-0.5">Análisis de datos y métricas del negocio</p>
        </div>

        {/* BOTONES SUPERIORES */}
        <div className="flex gap-1.5">
          <button className="bg-white text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-medium border border-gray-300 shadow-sm">
            <Filter size={12} />
            Filtrar
          </button>
          <button className="bg-white text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-medium border border-gray-300 shadow-sm">
            <Download size={12} />
            Exportar
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMEN - ACTUALIZADAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Ventas Mensuales</h3>
            <DollarSign className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(datosReportes.ventasMensuales)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Total de ventas del mes actual.</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Ganancia Neta</h3>
            <TrendingUp className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(datosReportes.gananciaNeta)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{datosReportes.crecimiento}% de crecimiento</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Clientes Activos</h3>
            <Users className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{datosReportes.clientesActivos}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Clientes con actividad reciente</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Productos Vendidos</h3>
            <Package className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{datosReportes.productosVendidos}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Unidades vendidas este mes</p>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Buscar en reportes..."
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
          />
        </div>
        <select
          className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs font-medium text-gray-700"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <option value="dia">Hoy</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="anio">Este año</option>
        </select>
      </div>

      {/* GRÁFICO Y TABLAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* GRÁFICO DE VENTAS */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-900">Ventas de los Últimos 7 Días</h3>
            <p className="text-xs text-gray-500">Tendencia de ventas diarias</p>
          </div>
          <div className="p-3">
            <div className="h-48 flex items-end justify-around gap-1">
              {[45, 65, 52, 78, 85, 70, 92].map((valor, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition" style={{height: `${valor}%`}}></div>
                  <p className="text-[10px] text-gray-600 mt-2">{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP CLIENTES */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-900">Top 5 Clientes</h3>
            <p className="text-xs text-gray-500">Clientes con mayor volumen de compras</p>
          </div>
          <div className="divide-y divide-gray-100">
            {topClientes.map((cliente) => (
              <div key={cliente.id} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-1 rounded border border-blue-200">
                      <Users size={10} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-900">{cliente.nombre}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-900">${formatearMonto(cliente.total)}</p>
                    <p className="text-[10px] text-gray-500">{cliente.compras} compras</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLA DE TOP PRODUCTOS */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">Productos Más Vendidos</h3>
          <p className="text-xs text-gray-500">Ranking de productos por ventas</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Total Ventas</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {topProductos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="bg-blue-50 p-1 rounded border border-blue-200">
                        <Package size={10} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-900">{producto.nombre}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs font-semibold text-gray-900">{producto.cantidad} unidades</div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs font-semibold text-green-600">${formatearMonto(producto.total)}</div>
                  </td>
                  <td className="px-2 py-1.5">
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reportes