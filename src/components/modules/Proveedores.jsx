"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search, ShoppingCart, Edit, Trash2, FileText, Mail, Phone, Building, MoreVertical, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'

const Proveedores = ({ proveedores = [], searchTerm = "", setSearchTerm, openModal, eliminarProveedor }) => {
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)

  const proveedoresSeguros = Array.isArray(proveedores) ? proveedores : []

  const filtrarProveedores = proveedoresSeguros.filter(proveedor => 
    (proveedor.nombre || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (proveedor.cuit || "").includes(searchTerm)
  ).sort((a, b) => a.nombre.localeCompare(b.nombre))

  // Paginación
  const totalPaginas = Math.ceil(filtrarProveedores.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const proveedoresPaginados = filtrarProveedores.slice(indiceInicio, indiceFin)

  // Reset página al cambiar búsqueda o items por página
  useEffect(() => {
    setPaginaActual(1)
  }, [searchTerm, itemsPorPagina])

  const resumenProveedores = {
    totalProveedores: proveedoresSeguros.length,
    proveedoresActivos: proveedoresSeguros.filter(p => p.estado === "activo").length,
    deudaTotal: proveedoresSeguros.reduce((sum, p) => sum + (Number.parseFloat(p.deuda) || 0), 0),
    proximosPagos: proveedoresSeguros.filter(p => (p.proximoPago || 0) > 0).length,
  }

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
          <h2 className="text-xl font-bold text-gray-900">Proveedores</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gestión de proveedores</p>
        </div>

        {/* BOTÓN NUEVO PROVEEDOR */}
        <button
          onClick={() => openModal && openModal("nuevo-proveedor")}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
        >
          <Plus size={12} />
          Nuevo Proveedor
        </button>
      </div>

      {/* CARDS DE RESUMEN - ACTUALIZADAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Total Proveedores</h3>
            <Building className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenProveedores.totalProveedores}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Proveedores registrados en el sistema.</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Proveedores Activos</h3>
            <Building className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenProveedores.proveedoresActivos}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{resumenProveedores.totalProveedores > 0 ? Math.round((resumenProveedores.proveedoresActivos / resumenProveedores.totalProveedores) * 100) : 0}% con actividad</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Deuda Total</h3>
            <DollarSign className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(resumenProveedores.deudaTotal)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Deuda pendiente de pago</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Próximos Pagos</h3>
            <ShoppingCart className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenProveedores.proximosPagos}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Pagos que requieren atención</p>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CARD CON TABLA */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        {/* HEADER INFO */}
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">Proveedores</h3>
          <p className="text-xs text-gray-500">Lista de proveedores registrados</p>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">CUIT</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Contacto</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {proveedoresPaginados.length > 0 ? (
                proveedoresPaginados.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-blue-50 p-1 rounded border border-blue-200">
                          <Building size={10} className="text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                          {proveedor.nombre || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <FileText size={9} className="text-gray-400" />
                        <span className="text-xs text-gray-700 font-mono">{proveedor.cuit || "—"}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <Phone size={9} className="text-gray-400" />
                        <span className="text-xs text-gray-700">{proveedor.telefono || "—"}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <Mail size={9} className="text-gray-400" />
                        <span className="text-xs text-gray-700 truncate max-w-[100px]">
                          {proveedor.email || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        (proveedor.estado || "activo") === "activo"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {proveedor.estado === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal("editar-proveedor", proveedor)}
                          className="p-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-200"
                          title="Editar Proveedor"
                        >
                          <Edit size={10} />
                        </button>
                        <button
                          onClick={() => eliminarProveedor && eliminarProveedor(proveedor.id)}
                          className="p-0.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                          title="Eliminar Proveedor"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-3 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 p-2 rounded-full mb-1.5 border border-gray-200">
                        <Building size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">No se encontraron proveedores</p>
                      <p className="text-xs text-gray-500">
                        {searchTerm
                          ? "Intenta con otros términos"
                          : "Crea tu primer proveedor"}
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
              <span className="text-xs text-gray-600">Mostrando {Math.min(filtrarProveedores.length, itemsPorPagina)} de {filtrarProveedores.length} proveedores</span>
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
    </div>
  )
}

export default Proveedores