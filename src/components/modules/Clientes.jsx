"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Plus, Search, User, FileText, Mail, Phone, Edit, Trash2, Copy, Check, AlertCircle, DollarSign } from 'lucide-react'

const Clientes = ({ clientes = [], searchTerm = "", setSearchTerm, openModal, eliminarCliente }) => {
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [clienteCopiado, setClienteCopiado] = useState(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const clientesSeguros = Array.isArray(clientes) ? clientes : []

  const filtrarClientes = clientesSeguros.filter(cliente => 
    (cliente.nombre || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (cliente.cuit || "").includes(searchTerm) ||
    (cliente.telefono || "").includes(searchTerm)
  ).sort((a, b) => a.nombre.localeCompare(b.nombre))

  // Paginación
  const totalPaginas = Math.ceil(filtrarClientes.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const clientesPaginados = filtrarClientes.slice(indiceInicio, indiceFin)

  // Reset página al cambiar búsqueda o items por página
  useEffect(() => {
    setPaginaActual(1)
  }, [searchTerm, itemsPorPagina])

  const handleCopy = async (texto, tipo, clienteId) => {
    try {
      await navigator.clipboard.writeText(texto)
      setClienteCopiado({ id: clienteId, tipo })
      setTimeout(() => setClienteCopiado(null), 2000)
    } catch (err) {
      console.error('Error al copiar: ', err)
    }
  }

  const resumenClientes = {
    totalClientes: clientesSeguros.length,
    conDeuda: clientesSeguros.filter(c => (c.deuda || 0) > 0).length,
    totalDeuda: clientesSeguros.reduce((sum, c) => sum + (Number.parseFloat(c.deuda) || 0), 0),
    clientesActivos: clientesSeguros.filter(c => c.estado === "activo").length,
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
          <h2 className="text-xl font-bold text-gray-900">Clientes</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gestión de cartera de clientes</p>
        </div>

        {/* BOTÓN NUEVO CLIENTE */}
        <button
          onClick={() => openModal && openModal("nuevo-cliente")}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
        >
          <Plus size={12} />
          Nuevo Cliente
        </button>
      </div>

      {/* CARDS DE RESUMEN - UN POCO MÁS COMPACTAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Total de Clientes</h3>
            <User className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenClientes.totalClientes}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Total de clientes registrados del negocio.</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Clientes Activos</h3>
            <User className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenClientes.clientesActivos}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{resumenClientes.totalClientes > 0 ? Math.round((resumenClientes.clientesActivos / resumenClientes.totalClientes) * 100) : 0}% de los clientes</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Con Deuda</h3>
            <AlertCircle className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenClientes.conDeuda}</p>
            <p className="text-[10px] text-gray-500 leading-tight">{resumenClientes.totalClientes > 0 ? Math.round((resumenClientes.conDeuda / resumenClientes.totalClientes) * 100) : 0}% de los clientes</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Deuda Total</h3>
            <DollarSign className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">${formatearMonto(resumenClientes.totalDeuda)}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Deuda acumulada</p>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por nombre, CUIT o teléfono..."
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
          <h3 className="text-xs font-semibold text-gray-900">Clientes</h3>
          <p className="text-xs text-gray-500">Lista de clientes registrados</p>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">CUIT/CUIL</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Teléfono</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Condición IVA</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {clientesPaginados.length > 0 ? (
                clientesPaginados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-blue-50 p-1 rounded border border-blue-200">
                          <User size={10} className="text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-900">
                          {cliente.nombre || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <FileText size={9} className="text-gray-400" />
                        <span className="text-xs text-gray-700 font-mono">{cliente.cuit || "—"}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <Phone size={9} className="text-gray-400" />
                        <span className="text-xs text-gray-700">{cliente.telefono || "—"}</span>
                        {cliente.telefono && (
                          <button
                            onClick={() => handleCopy(cliente.telefono, "telefono", cliente.id)}
                            className={`p-0.5 rounded transition-colors ${
                              clienteCopiado?.id === cliente.id && clienteCopiado?.tipo === "telefono"
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                            title={
                              clienteCopiado?.id === cliente.id && clienteCopiado?.tipo === "telefono"
                                ? "Copiado!"
                                : "Copiar teléfono"
                            }
                          >
                            {clienteCopiado?.id === cliente.id && clienteCopiado?.tipo === "telefono" ? (
                              <Check size={8} />
                            ) : (
                              <Copy size={8} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <Mail size={9} className="text-gray-400" />
                        <span className="text-xs text-gray-700">
                          {cliente.email || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {cliente.condicionIVA || "Consumidor Final"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal && openModal("editar-cliente", cliente)}
                          className="p-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-200"
                          title="Editar Cliente"
                        >
                          <Edit size={10} />
                        </button>
                        <button
                          onClick={() => eliminarCliente && eliminarCliente(cliente.id)}
                          className="p-0.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                          title="Eliminar Cliente"
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
                        <User size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">No se encontraron clientes</p>
                      <p className="text-xs text-gray-500">
                        {searchTerm
                          ? "Intenta con otros términos"
                          : "Crea tu primer cliente"}
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
              <span className="text-xs text-gray-600">Mostrando {Math.min(filtrarClientes.length, itemsPorPagina)} de {filtrarClientes.length} clientes</span>
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

export default Clientes