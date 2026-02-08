"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Upload,
  Tag,
  Package,
  X
} from "lucide-react"

// Componente Modal de Categorías - Diseño limpio
const ModalGestionarCategorias = ({ 
  isOpen, 
  onClose, 
  categorias = [], 
  onGuardarCategoria,
  onEliminarCategoria 
}) => {
  const [nombreCategoria, setNombreCategoria] = useState("")
  const [descripcionCategoria, setDescripcionCategoria] = useState("")
  const [editandoId, setEditandoId] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState("")

  if (!isOpen) return null

  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(filtroCategoria.toLowerCase()) ||
    cat.descripcion?.toLowerCase().includes(filtroCategoria.toLowerCase())
  )

  const handleGuardar = () => {
    if (!nombreCategoria.trim()) {
      alert("El nombre de la categoría es obligatorio")
      return
    }

    const categoriaData = {
      id: editandoId || `cat_${Date.now()}`,
      nombre: nombreCategoria.trim(),
      descripcion: descripcionCategoria.trim(),
      fechaCreacion: new Date().toISOString(),
      productosAsociados: editandoId 
        ? categorias.find(c => c.id === editandoId)?.productosAsociados || 0
        : 0
    }

    onGuardarCategoria(categoriaData, editandoId)
    setNombreCategoria("")
    setDescripcionCategoria("")
    setEditandoId(null)
  }

  const handleEditar = (categoria) => {
    setNombreCategoria(categoria.nombre)
    setDescripcionCategoria(categoria.descripcion || "")
    setEditandoId(categoria.id)
  }

  const handleEliminar = (id) => {
    const categoria = categorias.find(c => c.id === id)
    
    if (categoria?.productosAsociados > 0) {
      alert(`No se puede eliminar esta categoría porque tiene ${categoria.productosAsociados} productos asociados.`)
      return
    }

    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      onEliminarCategoria(id)
    }
  }

  const handleCancelar = () => {
    setNombreCategoria("")
    setDescripcionCategoria("")
    setEditandoId(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header simple */}
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-gray-900">Gestionar Categorías</h3>
            <p className="text-xs text-gray-500">
              {editandoId ? "Editando categoría" : "Agregar nueva categoría"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Formulario simple */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la categoría *
              </label>
              <input
                type="text"
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Electrónica, Ropa, Hogar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={descripcionCategoria}
                onChange={(e) => setDescripcionCategoria(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Breve descripción de la categoría..."
                rows="2"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGuardar}
                className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-blue-700"
              >
                {editandoId ? "Actualizar" : "Guardar Categoría"}
              </button>
              {editandoId && (
                <button
                  onClick={handleCancelar}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Lista de categorías */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Categorías Existentes ({categorias.length})
              </h4>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  placeholder="Buscar categorías..."
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {categoriasFiltradas.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categoriasFiltradas.map((categoria) => {
                  const productosCount = categoria.productosAsociados || 0
                  return (
                    <div
                      key={categoria.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded">
                          <Tag size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{categoria.nombre}</div>
                          {categoria.descripcion && (
                            <div className="text-xs text-gray-500 mt-0.5">{categoria.descripcion}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {productosCount} productos
                        </span>
                        <button
                          onClick={() => handleEditar(categoria)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleEliminar(categoria.id)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title={productosCount > 0 ? "No se puede eliminar" : "Eliminar"}
                          disabled={productosCount > 0}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-gray-200 rounded bg-gray-50">
                <div className="bg-gray-100 p-2 rounded-full inline-flex mb-2">
                  <Tag size={18} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {categorias.length === 0 ? "No hay categorías" : "No se encontraron resultados"}
                </p>
                <p className="text-xs text-gray-500">
                  {categorias.length === 0 
                    ? "Crea tu primera categoría" 
                    : "Intenta con otros términos de búsqueda"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer simple */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente Principal Productos
const Productos = ({ productos, searchTerm, setSearchTerm, openModal, eliminarProducto }) => {
  const [filtroStock, setFiltroStock] = useState("todos")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  
  // Estados para el modal de categorías
  const [modalCategoriasOpen, setModalCategoriasOpen] = useState(false)
  const [categorias, setCategorias] = useState([
    { id: "cat1", nombre: "Electrónica", descripcion: "Productos electrónicos", productosAsociados: 5 },
    { id: "cat2", nombre: "Ropa", descripcion: "Prendas de vestir", productosAsociados: 3 },
    { id: "cat3", nombre: "Hogar", descripcion: "Artículos para el hogar", productosAsociados: 8 },
    { id: "cat4", nombre: "Oficina", descripcion: "Material de oficina", productosAsociados: 12 },
    { id: "cat5", nombre: "Deportes", descripcion: "Artículos deportivos", productosAsociados: 6 },
  ])

  const productosSeguros = Array.isArray(productos) ? productos : []
  
  const filtrarProductos = productosSeguros.filter((producto) => {
    const coincideBusqueda =
      (producto.nombre || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (producto.codigo || "").toLowerCase().includes((searchTerm || "").toLowerCase())

    if (filtroStock === "en-stock") {
      return coincideBusqueda && producto.controlaStock === true && (producto.stock || 0) > 0
    }

    return coincideBusqueda
  })

  // Paginación
  const totalPaginas = Math.ceil(filtrarProductos.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const productosPaginados = filtrarProductos.slice(indiceInicio, indiceFin)

  // Reset página al cambiar filtros o items por página
  useEffect(() => {
    setPaginaActual(1)
  }, [filtroStock, searchTerm, itemsPorPagina])

  const formatearMonto = (monto) => {
    const numero = Number.parseFloat(monto) || 0
    return numero.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const resumenProductos = {
    totalProductos: productosSeguros.length,
    conStock: productosSeguros.filter((p) => p.controlaStock && (p.stock || 0) > 0).length,
    sinControl: productosSeguros.filter((p) => !p.controlaStock).length,
    bajoStock: productosSeguros.filter((p) => p.controlaStock && (p.stock || 0) <= 10).length,
  }

  // Funciones para manejar categorías
  const handleGuardarCategoria = (categoriaData, editandoId) => {
    if (editandoId) {
      setCategorias(prev => 
        prev.map(cat => cat.id === editandoId ? categoriaData : cat)
      )
    } else {
      setCategorias(prev => [...prev, categoriaData])
    }
  }

  const handleEliminarCategoria = (id) => {
    setCategorias(prev => prev.filter(cat => cat.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Productos</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gestión de inventario</p>
        </div>

        {/* BOTONES SUPERIORES */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setModalCategoriasOpen(true)}
            className="bg-white text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-medium border border-gray-300 shadow-sm"
          >
            <Tag size={12} />
            Gestionar Categorías
          </button>
          <button
            onClick={() => openModal && openModal("nuevo-producto")}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Plus size={12} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Total Productos</h3>
            <Package className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenProductos.totalProductos}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Productos en inventario registrados.</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Con Stock</h3>
            <Tag className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenProductos.conStock}</p>
            <p className="text-[10px] text-gray-500 leading-tight">
              {resumenProductos.totalProductos > 0 ? Math.round((resumenProductos.conStock / resumenProductos.totalProductos) * 100) : 0}% disponibles
            </p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Bajo Stock</h3>
            <Tag className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenProductos.bajoStock}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Productos que requieren atención</p>
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-gray-300 shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-xs font-semibold text-gray-700">Sin Control</h3>
            <Tag className="text-gray-400" size={13} />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 mb-0.5">{resumenProductos.sinControl}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Productos sin gestión de stock</p>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA Y FILTROS */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs font-medium text-gray-700"
          value={filtroStock}
          onChange={(e) => setFiltroStock(e.target.value)}
        >
          <option value="todos">Todos los productos</option>
          <option value="en-stock">Con stock disponible</option>
        </select>
        <button className="px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-medium text-gray-700 shadow-xs">
          <Download size={12} />
          CSV
        </button>
        <button className="px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-medium text-gray-700 shadow-xs">
          <Upload size={12} />
          CSV
        </button>
      </div>

      {/* CARD CON TABLA */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        {/* HEADER INFO */}
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900">Productos</h3>
          <p className="text-xs text-gray-500">Lista de productos registrados</p>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Código</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Precio</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Controla Stock</th>
                <th className="px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {productosPaginados.length > 0 ? (
                productosPaginados.map((producto) => {
                  const precioNeto = (Number.parseFloat(producto.precio) || 0) * 0.79
                  
                  return (
                    <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="bg-blue-50 p-1 rounded border border-blue-200">
                            <Tag size={10} className="text-blue-600" />
                          </div>
                          <span className="text-xs font-medium text-gray-900 font-mono">
                            {producto.codigo || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900">{producto.nombre || "N/A"}</td>
                      <td className="px-2 py-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {producto.categoria || "General"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="text-xs">
                          <div className="font-semibold text-gray-900">${formatearMonto(producto.precio)}</div>
                          <div className="text-gray-500 text-[10px]">Neto: ${formatearMonto(precioNeto)}</div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-900">
                        {producto.controlaStock 
                          ? `${producto.stock || 0} ${producto.stock === 1 ? "u" : "u"}` 
                          : "—"}
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          producto.controlaStock 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "bg-gray-50 text-gray-700 border border-gray-200"
                        }`}>
                          {producto.controlaStock ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              openModal("editar-producto", producto)
                            }}
                            className="p-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-200"
                            title="Editar Producto"
                          >
                            <Edit size={10} />
                          </button>
                          <button
                            onClick={() => {
                              eliminarProducto(producto.id)
                            }}
                            className="p-0.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                            title="Eliminar Producto"
                          >
                            <Trash2 size={10} />
                          </button>
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
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">No se encontraron productos</p>
                      <p className="text-xs text-gray-500">
                        {searchTerm
                          ? "Intenta con otros términos"
                          : "Crea tu primer producto"}
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
                Mostrando {Math.min(filtrarProductos.length, indiceFin) - indiceInicio} de {filtrarProductos.length} productos
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

      {/* MODAL DE CATEGORÍAS - Diseño simple */}
      <ModalGestionarCategorias
        isOpen={modalCategoriasOpen}
        onClose={() => setModalCategoriasOpen(false)}
        categorias={categorias}
        onGuardarCategoria={handleGuardarCategoria}
        onEliminarCategoria={handleEliminarCategoria}
      />
    </div>
  )
}

export default Productos