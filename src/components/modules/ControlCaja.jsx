"use client"

import React, { useState } from 'react'
import { Plus, Search, Download, DollarSign, CreditCard, Calendar, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react'

const ControlCaja = ({ caja = {}, movimientosCaja = [], cierresCaja = [], openModal, cerrarCaja, recargarDatos }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  
  // Datos seguros
  const cajaSegura = {
    ingresos: Number.parseFloat(caja.ingresos) || 0,
    egresos: Number.parseFloat(caja.egresos) || 0,
    saldo: Number.parseFloat(caja.saldo) || 0
  }
  
  const movimientosSeguros = Array.isArray(movimientosCaja) ? movimientosCaja : []
  const cierresSeguros = Array.isArray(cierresCaja) ? cierresCaja : []

  // Filtrar movimientos
  const filtrarMovimientos = movimientosSeguros.filter((movimiento) => {
    const coincideBusqueda =
      (movimiento.descripcion || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (movimiento.metodo || "").toLowerCase().includes((searchTerm || "").toLowerCase())

    const coincideTipo =
      filtroTipo === "todos" ||
      movimiento.tipo === filtroTipo

    return coincideBusqueda && coincideTipo
  }).sort((a, b) => {
    const fechaA = new Date(a.fecha || 0)
    const fechaB = new Date(b.fecha || 0)
    return fechaB - fechaA
  })

  // Paginación
  const totalPaginas = Math.ceil(filtrarMovimientos.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const movimientosPaginados = filtrarMovimientos.slice(indiceInicio, indiceFin)

  const formatearMonto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const resumenCaja = {
    ingresosHoy: movimientosSeguros
      .filter(m => m.tipo === "ingreso")
      .reduce((sum, m) => sum + (Number.parseFloat(m.monto) || 0), 0),
    
    egresosHoy: movimientosSeguros
      .filter(m => m.tipo === "egreso")
      .reduce((sum, m) => sum + (Number.parseFloat(m.monto) || 0), 0),
    
    movimientosHoy: movimientosSeguros.length,
    
    ultimoCierre: cierresSeguros.length > 0 
      ? new Date(cierresSeguros[0].fecha || cierresSeguros[0].fecha_cierre).toLocaleDateString()
      : "Sin cierres"
  }

  const handleCerrarCaja = async () => {
    if (cerrarCaja) {
      const success = await cerrarCaja();
      if (success && recargarDatos) {
        recargarDatos();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Control de Caja</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gestión de ingresos y egresos</p>
        </div>

        {/* BOTONES SUPERIORES */}
        <div className="flex gap-1.5">
          <button
            onClick={() => openModal && openModal("ingreso-caja")}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Plus size={12} />
            Ingreso
          </button>
          <button
            onClick={() => openModal && openModal("egreso-caja")}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Plus size={12} />
            Egreso
          </button>
          <button
            onClick={handleCerrarCaja}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <CreditCard size={12} />
            Cerrar Caja
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMEN - ACTUALIZADAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Ingresos Hoy</h3>
            <TrendingUp className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(resumenCaja.ingresosHoy)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Entradas de dinero del día.</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Egresos Hoy</h3>
            <TrendingDown className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(resumenCaja.egresosHoy)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Salidas de dinero del día.</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Saldo Actual</h3>
            <DollarSign className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(cajaSegura.saldo)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Total disponible en caja.</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Último Cierre</h3>
            <Calendar className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenCaja.ultimoCierre}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Fecha del último cierre realizado.</p>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Buscar movimientos..."
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs font-medium text-gray-700"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="todos">Todos los tipos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
        </select>
      </div>

      {/* CARD CON TABLA DE MOVIMIENTOS */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        {/* HEADER INFO */}
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">Movimientos del Día</h3>
          <p className="text-xs text-gray-500">Lista de ingresos y egresos</p>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Descripción</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Método</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {movimientosPaginados.length > 0 ? (
                movimientosPaginados.map((movimiento) => (
                  <tr key={movimiento.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-1.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        movimiento.tipo === "ingreso" 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        <span className="text-xs">{movimiento.tipo === "ingreso" ? "↑" : "↓"}</span>
                        <span className="text-xs ml-1">{movimiento.tipo === "ingreso" ? "Ingreso" : "Egreso"}</span>
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-900">{movimiento.descripcion || "N/A"}</td>
                    <td className="px-2 py-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={9} className="text-gray-400" />
                        <span className="text-xs">{movimiento.fecha || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                        {movimiento.metodo || "N/A"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className={`text-xs font-semibold ${
                        movimiento.tipo === "ingreso" ? "text-green-600" : "text-red-600"
                      }`}>
                        {movimiento.tipo === "ingreso" ? "+" : "-"}${formatearMonto(movimiento.monto)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-3 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-2 rounded-full mb-1.5 border border-gray-200">
                        <DollarSign size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">No hay movimientos</p>
                      <p className="text-xs text-gray-500">
                        {searchTerm
                          ? "Intenta con otros términos"
                          : "Registra tu primer movimiento"}
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
              <span className="text-xs text-gray-600">Mostrando {Math.min(filtrarMovimientos.length, itemsPorPagina)} de {filtrarMovimientos.length} movimientos</span>
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

      {/* SECCIÓN DE HISTORIAL DE CIERRES */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        {/* HEADER INFO */}
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">Historial de Cierres</h3>
          <p className="text-xs text-gray-500">Últimos cierres de caja registrados</p>
        </div>

        {/* LISTA DE CIERRES */}
        <div className="divide-y divide-gray-100">
          {cierresSeguros.slice(0, 5).map((cierre) => (
            <div key={cierre.id} className="px-3 py-2 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-1 rounded border border-blue-200">
                    <Calendar size={10} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    {cierre.fecha || cierre.fecha_cierre || "Fecha desconocida"}
                  </span>
                </div>
                <button 
                  onClick={() => openModal && openModal('detalle-cierre', cierre)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver Detalles
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-500 text-[10px]">Ingresos</p>
                  <p className="font-semibold text-green-600">+${formatearMonto(cierre.ingresos)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Egresos</p>
                  <p className="font-semibold text-red-600">-${formatearMonto(cierre.egresos)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Saldo Final</p>
                  <p className="font-semibold text-blue-600">${formatearMonto(cierre.saldo_final || cierre.saldo)}</p>
                </div>
              </div>
            </div>
          ))}

          {cierresSeguros.length === 0 && (
            <div className="px-3 py-6 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 p-2 rounded-full mb-1.5 border border-gray-200">
                  <CreditCard size={16} className="text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-900 mb-0.5">No hay cierres registrados</p>
                <p className="text-xs text-gray-500">Realiza tu primer cierre de caja</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ControlCaja