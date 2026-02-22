import React, { useState } from 'react'
import { Plus, Search, DollarSign, CreditCard, Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, X, Trash2 } from 'lucide-react'

const ControlCaja = ({ caja = {}, movimientosCaja = [], cierresCaja = [], openModal, cerrarCaja, eliminarMovimientoCaja, recargarDatos }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [mostrarConfirmCierre, setMostrarConfirmCierre] = useState(false)
  const [observacionesCierre, setObservacionesCierre] = useState("")
  const [cerrando, setCerrando] = useState(false)
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(null) // id del movimiento a borrar
  const [borrando, setBorrando] = useState(false)

  // Datos seguros
  const cajaSegura = {
    ingresos: Number.parseFloat(caja.ingresos) || 0,
    egresos: Number.parseFloat(caja.egresos) || 0,
    saldo: Number.parseFloat(caja.saldo) || 0
  }

  const movimientosSeguros = Array.isArray(movimientosCaja) ? movimientosCaja : []
  const cierresSeguros = Array.isArray(cierresCaja) ? cierresCaja : []

  // Filtrar movimientos
  const etiquetaCategoria = {
    venta: "Venta",
    cobro: "Cobro",
    ingreso_extra: "Ingreso extra",
    proveedor: "Proveedor",
    gasto_general: "Gasto general",
    sueldo: "Sueldo/Retiro",
    impuesto: "Impuesto",
    compra_stock: "Compra stock",
    otro: "Otro",
  }

  // Categorías presentes en los movimientos actuales
  const categoriasPresentes = [...new Set(
    movimientosSeguros
      .map(m => m.referencia)
      .filter(r => r && !r.startsWith('producto-') && !r.startsWith('pedido:'))
  )]

  const filtrarMovimientos = movimientosSeguros.filter((movimiento) => {
    const coincideBusqueda =
      (movimiento.description || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (movimiento.metodo || "").toLowerCase().includes((searchTerm || "").toLowerCase())

    const coincideTipo =
      filtroTipo === "todos" ||
      movimiento.tipo === filtroTipo

    const coincideCategoria =
      filtroCategoria === "todas" ||
      movimiento.referencia === filtroCategoria

    return coincideBusqueda && coincideTipo && coincideCategoria
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
    if (!cerrarCaja) return
    setCerrando(true)
    try {
      const resultado = await cerrarCaja(observacionesCierre)
      if (resultado?.success) {
        setMostrarConfirmCierre(false)
        setObservacionesCierre("")
        if (recargarDatos) recargarDatos()
      } else {
        alert("Error al cerrar caja: " + (resultado?.mensaje || "Error desconocido"))
      }
    } finally {
      setCerrando(false)
    }
  }

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
            onClick={() => setMostrarConfirmCierre(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <CreditCard size={12} />
            Cerrar Caja
          </button>
        </div>
      </div>

      {/* ── PANEL DE CONFIRMACIÓN DE CIERRE ─────────────────────────── */}
      {mostrarConfirmCierre && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 space-y-3">
          {/* Encabezado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-lg">
                <CreditCard size={14} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-900">Confirmar cierre de caja</h3>
                <p className="text-[10px] text-blue-600">{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <button
              onClick={() => { setMostrarConfirmCierre(false); setObservacionesCierre("") }}
              className="text-blue-400 hover:text-blue-700 p-1 rounded hover:bg-blue-100"
            >
              <X size={14} />
            </button>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-green-200 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-gray-500 mb-0.5">Ingresos</p>
              <p className="text-base font-bold text-green-600">+${formatearMonto(resumenCaja.ingresosHoy)}</p>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-gray-500 mb-0.5">Egresos</p>
              <p className="text-base font-bold text-red-600">-${formatearMonto(resumenCaja.egresosHoy)}</p>
            </div>
            <div className={`bg-white border rounded-lg p-2.5 text-center ${cajaSegura.saldo >= 0 ? 'border-blue-200' : 'border-orange-200'
              }`}>
              <p className="text-[10px] text-gray-500 mb-0.5">Saldo final</p>
              <p className={`text-base font-bold ${cajaSegura.saldo >= 0 ? 'text-blue-700' : 'text-orange-600'
                }`}>${formatearMonto(cajaSegura.saldo)}</p>
            </div>
          </div>

          {/* Detalle de movimientos */}
          <div className="bg-white border border-blue-200 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-700">Movimientos del día</span>
              <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
                {resumenCaja.movimientosHoy} total
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-[10px] text-gray-600 flex justify-between">
                <span>Ingresos:</span>
                <span className="font-semibold text-green-600">
                  {movimientosSeguros.filter(m => m.tipo === 'ingreso').length} mov.
                </span>
              </div>
              <div className="text-[10px] text-gray-600 flex justify-between">
                <span>Egresos:</span>
                <span className="font-semibold text-red-600">
                  {movimientosSeguros.filter(m => m.tipo === 'egreso').length} mov.
                </span>
              </div>
            </div>
            {/* Desglose por categoría */}
            {categoriasPresentes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 space-y-0.5">
                {categoriasPresentes.map(cat => {
                  const movsCat = movimientosSeguros.filter(m => m.referencia === cat)
                  const totalCat = movsCat.reduce((s, m) => s + (parseFloat(m.monto) || 0), 0)
                  const esIngreso = movsCat[0]?.tipo === 'ingreso'
                  return (
                    <div key={cat} className="flex justify-between text-[10px] text-gray-600">
                      <span>{etiquetaCategoria[cat] || cat}</span>
                      <span className={`font-semibold ${esIngreso ? 'text-green-600' : 'text-red-600'}`}>
                        {esIngreso ? '+' : '-'}${formatearMonto(totalCat)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-[11px] font-semibold text-blue-800 mb-1">Observaciones (opcional)</label>
            <textarea
              className="w-full px-2.5 py-1.5 text-xs border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white resize-none"
              rows={2}
              placeholder="Ej: Todo en orden, falta de cambio, diferencia de caja..."
              value={observacionesCierre}
              onChange={e => setObservacionesCierre(e.target.value)}
            />
          </div>

          {/* Advertencia si hay saldo negativo */}
          {cajaSegura.saldo < 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <AlertTriangle size={12} className="text-orange-500 flex-shrink-0" />
              <p className="text-[10px] text-orange-700">El saldo final es negativo. Verificá los egresos antes de cerrar.</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={() => { setMostrarConfirmCierre(false); setObservacionesCierre("") }}
              disabled={cerrando}
              className="flex-1 bg-white text-gray-700 px-3 py-2 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCerrarCaja}
              disabled={cerrando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <CheckCircle size={12} />
              {cerrando ? "Cerrando..." : "Confirmar cierre"}
            </button>
          </div>
        </div>
      )}

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

      {/* BÚSQUEDA, FILTRO TIPO Y FILTRO CATEGORÍA */}
      <div className="space-y-1.5">
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
            onChange={(e) => { setFiltroTipo(e.target.value); setPaginaActual(1) }}
          >
            <option value="todos">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="egreso">Egresos</option>
          </select>
        </div>

        {/* Chips de categoría */}
        {categoriasPresentes.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[10px] text-gray-500 font-medium mr-0.5">Categoría:</span>
            <button
              onClick={() => { setFiltroCategoria("todas"); setPaginaActual(1) }}
              className={`px-2 py-0.5 text-[10px] rounded-full border font-medium transition-colors ${filtroCategoria === "todas"
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                }`}
            >
              Todas
            </button>
            {categoriasPresentes.map((cat) => (
              <button
                key={cat}
                onClick={() => { setFiltroCategoria(cat); setPaginaActual(1) }}
                className={`px-2 py-0.5 text-[10px] rounded-full border font-medium transition-colors ${filtroCategoria === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                  }`}
              >
                {etiquetaCategoria[cat] || cat}
              </button>
            ))}
          </div>
        )}
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
                  <tr key={movimiento.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-2 py-1.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${movimiento.tipo === "ingreso"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                        <span className="text-xs">{movimiento.tipo === "ingreso" ? "↑" : "↓"}</span>
                        <span className="text-xs ml-1">{movimiento.tipo === "ingreso" ? "Ingreso" : "Egreso"}</span>
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-900">{movimiento.description || movimiento.descripcion || "N/A"}</td>
                    <td className="px-2 py-1.5 text-xs text-gray-600">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Calendar size={9} className="text-gray-400" />
                        <span className="text-xs">
                          {movimiento.fecha
                            ? new Date(movimiento.fecha).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                            : "N/A"}
                        </span>
                        {movimiento.referencia && !movimiento.referencia.startsWith('producto-') && (() => {
                          const ref = movimiento.referencia
                          if (ref.startsWith('pedido:')) return <span className="text-[9px] bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-gray-600">Venta</span>
                          const label = etiquetaCategoria[ref]
                          if (!label) return null
                          return <span className="text-[9px] bg-gray-100 border border-gray-200 rounded px-1 py-0.5 text-gray-600">{label}</span>
                        })()}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                        {movimiento.metodo || "N/A"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className={`text-xs font-semibold ${movimiento.tipo === "ingreso" ? "text-green-600" : "text-red-600"
                        }`}>
                        {movimiento.tipo === "ingreso" ? "+" : "-"}${formatearMonto(movimiento.monto)}
                      </div>
                    </td>
                    {/* BOTÓN ELIMINAR */}
                    <td className="px-2 py-1.5 text-right">
                      {confirmandoBorrar === movimiento.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[10px] text-gray-500">¿Eliminar?</span>
                          <button
                            onClick={async () => {
                              setBorrando(true)
                              await eliminarMovimientoCaja?.(movimiento.id)
                              setConfirmandoBorrar(null)
                              setBorrando(false)
                            }}
                            disabled={borrando}
                            className="text-[10px] bg-red-500 hover:bg-red-600 text-white px-1.5 py-0.5 rounded font-medium disabled:opacity-50"
                          >
                            {borrando ? '...' : 'Sí'}
                          </button>
                          <button
                            onClick={() => setConfirmandoBorrar(null)}
                            className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmandoBorrar(movimiento.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Eliminar movimiento"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
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