"use client"

import { Package, Search, ChevronDown, X, Trash2, ChevronLeft, ChevronRight, Plus, Pencil, User } from "lucide-react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"

const FacturaForm = ({ formData, formActions, closeModal, openModal, onClienteAgregado, onProductoAgregado }) => {
  const {
    nuevaFactura = {},
    setNuevaFactura,
    productos = [],
    clientes = [],
    tipoOperacion = "venta-productos",
  } = formData || {}

  const { generarFactura, cambiarTipoOperacion } = formActions || {}

  const [busquedaCliente, setBusquedaCliente] = useState("")
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false)
  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [editandoPrecio, setEditandoPrecio] = useState(null)
  const itemsPorPagina = 3

  const clienteRef = useRef(null)
  const productoRef = useRef(null)
  const generarBtnRef = useRef(null)
  const [enterCount, setEnterCount] = useState(0)
  const enterTimerRef = useRef(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (generarBtnRef.current) {
        generarBtnRef.current.focus()
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA"
        const isButton = e.target === generarBtnRef.current

        if (isInput && !isButton) {
          return
        }

        e.preventDefault()
        e.stopPropagation()

        if (generarBtnRef.current && !generarBtnRef.current.disabled) {
          handleEnterKey()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clienteRef.current && !clienteRef.current.contains(e.target)) {
        setMostrarDropdownCliente(false)
      }
      if (productoRef.current && !productoRef.current.contains(e.target)) {
        setMostrarListaProductos(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente) return clientes
    return clientes.filter(
      (cliente) =>
        cliente.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.telefono?.includes(busquedaCliente) ||
        cliente.cuit?.includes(busquedaCliente)
    )
  }, [busquedaCliente, clientes])

  const productosFiltrados = useMemo(() => {
    if (!busquedaProducto) return productos
    return productos.filter(
      (producto) =>
        producto.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        (producto.codigo && producto.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()))
    )
  }, [busquedaProducto, productos])

  const items = nuevaFactura?.items || []
  const totalPaginas = Math.ceil(items.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const itemsPaginados = items.slice(indiceInicio, indiceInicio + itemsPorPagina)

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas)
    }
  }, [items.length, totalPaginas, paginaActual])

  const seleccionarCliente = (cliente) => {
    console.log("[v0] Seleccionando cliente:", cliente)
    console.log("[v0] setNuevaFactura existe:", !!setNuevaFactura)
    if (setNuevaFactura) {
      setNuevaFactura((prev) => {
        console.log("[v0] Estado anterior:", prev)
        const nuevoEstado = {
          ...prev,
          cliente: cliente.nombre,
          clienteId: cliente.id,
        }
        console.log("[v0] Nuevo estado:", nuevoEstado)
        return nuevoEstado
      })
    }
    setBusquedaCliente(cliente.nombre)
    setMostrarDropdownCliente(false)
  }

  const agregarProducto = (producto) => {
    const items = nuevaFactura?.items || []
    const existeIndex = items.findIndex((item) => item.producto === producto.nombre)

    if (existeIndex !== -1) {
      const itemsActualizados = [...items]
      const nuevaCantidad = itemsActualizados[existeIndex].cantidad + 1
      itemsActualizados[existeIndex] = {
        ...itemsActualizados[existeIndex],
        cantidad: nuevaCantidad,
        subtotal: itemsActualizados[existeIndex].precio * nuevaCantidad,
      }
      const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
      if (setNuevaFactura) {
        setNuevaFactura((prev) => ({ ...prev, items: itemsActualizados, total }))
      }
    } else {
      const nuevoItem = {
        id: Date.now(),
        producto: producto.nombre,
        productoId: producto.id,
        cantidad: 1,
        precio: producto.precio,
        subtotal: producto.precio,
      }
      const itemsActualizados = [...items, nuevoItem]
      const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
      if (setNuevaFactura) {
        setNuevaFactura((prev) => ({ ...prev, items: itemsActualizados, total }))
      }
    }

    setBusquedaProducto("")
    setMostrarListaProductos(false)
  }

  const eliminarItem = (index) => {
    const items = nuevaFactura?.items || []
    const itemsActualizados = items.filter((_, i) => i !== index)
    const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    if (setNuevaFactura) {
      setNuevaFactura((prev) => ({ ...prev, items: itemsActualizados, total }))
    }
  }

  const actualizarCantidad = (index, cantidad) => {
    if (cantidad < 1) return
    const items = [...(nuevaFactura?.items || [])]
    items[index] = {
      ...items[index],
      cantidad,
      subtotal: items[index].precio * cantidad,
    }
    const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    if (setNuevaFactura) {
      setNuevaFactura((prev) => ({ ...prev, items, total }))
    }
  }

  const actualizarPrecio = (index, nuevoPrecio) => {
    const precio = Number.parseFloat(nuevoPrecio) || 0
    if (precio < 0) return

    const items = [...(nuevaFactura?.items || [])]
    items[index] = {
      ...items[index],
      precio: precio,
      subtotal: precio * items[index].cantidad,
    }
    const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    if (setNuevaFactura) {
      setNuevaFactura((prev) => ({ ...prev, items, total }))
    }
  }

  const calcularTotal = () => {
    return (nuevaFactura?.items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0)
  }

  const validarFormulario = () => {
    console.log("[v0] Validando formulario...")
    console.log("[v0] nuevaFactura:", nuevaFactura)
    console.log("[v0] nuevaFactura.cliente:", nuevaFactura?.cliente)
    console.log("[v0] items:", items)
    
    const tieneCliente = !!nuevaFactura?.cliente
    const tieneItems = items.length > 0

    if (!tieneCliente) {
      return { valido: false, mensaje: "Por favor, selecciona o crea un cliente primero" }
    }

    if (!tieneItems) {
      return { valido: false, mensaje: "Por favor, agrega al menos un producto a la factura" }
    }

    return { valido: true, mensaje: "" }
  }

  const handleEnterKey = useCallback(() => {
    if (isProcessing) return

    const validacion = validarFormulario()
    if (!validacion.valido) {
      alert(validacion.mensaje)
      return
    }

    if (enterCount === 1) {
      handleGenerarFactura()
      setEnterCount(0)
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current)
      }
    } else {
      setEnterCount(1)

      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current)
      }

      enterTimerRef.current = setTimeout(() => {
        setEnterCount(0)
      }, 1000)
    }
  }, [generarFactura, nuevaFactura, items.length, isProcessing, enterCount])

  const handleGenerarFactura = async () => {
    try {
      if (generarFactura) {
        await generarFactura()
      }
      closeModal()
    } catch (error) {
      console.error("Error al generar factura:", error)
      setIsProcessing(false)
    }
  }

  const handleButtonClick = () => {
    if (isProcessing) return

    const validacion = validarFormulario()
    if (!validacion.valido) {
      alert(validacion.mensaje)
      return
    }

    handleGenerarFactura()
  }

  const handleNuevoClienteClick = () => {
    if (openModal) {
      openModal("cliente-rapido")
    }
    if (onClienteAgregado) {
      onClienteAgregado()
    }
  }

  const handleNuevoProductoClick = () => {
    if (openModal) {
      openModal("producto-rapido")
    }
    if (onProductoAgregado) {
      onProductoAgregado()
    }
  }

  const tiposOperacion = [
    { value: "venta-productos", label: "Venta de Productos", desc: "Con stock" },
    { value: "venta-libre", label: "Venta Libre", desc: "Sin stock" },
    { value: "cotizacion", label: "Cotizacion", desc: "Presupuesto" },
  ]

  const CustomSelect = ({ value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef(null)

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (selectRef.current && !selectRef.current.contains(e.target)) {
          setIsOpen(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const selectedOption = options.find((opt) => opt.value === value)

    return (
      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md bg-white text-left flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>{selectedOption?.label || placeholder}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-20 w-full mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg max-h-32 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-2 py-1.5 text-left text-[11px] hover:bg-gray-50 transition-colors ${
                  value === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-[360px] mx-auto space-y-2">
      {/* Header */}
      <div className="pb-1.5 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">
          {tipoOperacion === "cotizacion" ? "Nueva cotizacion" : "Nueva factura"}
        </h3>
        <p className="text-[10px] text-gray-500">
          {tipoOperacion === "cotizacion"
            ? "Genera un presupuesto para tu cliente."
            : "Registra una venta y actualiza el stock."}
        </p>
      </div>

      <div className="space-y-2">
        {/* TIPO DE OPERACION */}
        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Tipo de operacion</label>
          <div className="grid grid-cols-3 gap-1.5">
            {tiposOperacion.map((tipo) => (
              <label
                key={tipo.value}
                className={`relative flex flex-col items-center p-1.5 border-2 rounded-md cursor-pointer transition-all text-center ${
                  tipoOperacion === tipo.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="tipoOperacion"
                  checked={tipoOperacion === tipo.value}
                  onChange={() => cambiarTipoOperacion && cambiarTipoOperacion(tipo.value)}
                  className="sr-only"
                />
                <span className="text-[10px] font-medium text-gray-900 leading-tight">{tipo.label}</span>
                <p className="text-[9px] text-gray-500">{tipo.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* CLIENTE */}
        <div ref={clienteRef}>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[11px] font-medium text-gray-700">Cliente</label>
            <button
              onClick={handleNuevoClienteClick}
              className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 transition-colors"
              title="Crear nuevo cliente"
            >
              <Plus className="w-3 h-3" />
              <span className="text-[9px] font-medium">Nuevo</span>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Buscar cliente..."
              value={busquedaCliente}
              onChange={(e) => {
                setBusquedaCliente(e.target.value)
                setMostrarDropdownCliente(true)
              }}
              onFocus={() => setMostrarDropdownCliente(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.tagName === "INPUT") {
                  e.preventDefault()
                  if (clientesFiltrados.length > 0 && mostrarDropdownCliente) {
                    seleccionarCliente(clientesFiltrados[0])
                  }
                }
              }}
            />
            <User className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            {busquedaCliente && (
              <button
                onClick={() => {
                  setBusquedaCliente("")
                  if (setNuevaFactura) {
                    setNuevaFactura((prev) => ({ ...prev, cliente: "", clienteId: null }))
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            {mostrarDropdownCliente && clientesFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg max-h-28 overflow-y-auto">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => seleccionarCliente(cliente)}
                    className="w-full px-2 py-1.5 text-left hover:bg-gray-50 transition-colors text-[11px] border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-semibold text-gray-900">{cliente.nombre}</div>
                    <div className="text-[9px] text-gray-500">{cliente.telefono}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {nuevaFactura?.cliente && (
            <span className="text-[9px] text-green-600 font-medium mt-0.5 block">
              Cliente: {nuevaFactura.cliente}
            </span>
          )}
        </div>

        {/* AGREGAR PRODUCTO */}
        <div ref={productoRef}>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[11px] font-medium text-gray-700">Agregar producto</label>
            <button
              onClick={handleNuevoProductoClick}
              className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 transition-colors"
              title="Crear nuevo producto"
            >
              <Plus className="w-3 h-3" />
              <span className="text-[9px] font-medium">Nuevo</span>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Buscar producto..."
              value={busquedaProducto}
              onChange={(e) => {
                setBusquedaProducto(e.target.value)
                setMostrarListaProductos(true)
              }}
              onFocus={() => setMostrarListaProductos(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.tagName === "INPUT") {
                  e.preventDefault()
                  if (productosFiltrados.length > 0 && mostrarListaProductos) {
                    agregarProducto(productosFiltrados[0])
                  }
                }
              }}
            />
            <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            {mostrarListaProductos && productosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg max-h-28 overflow-y-auto">
                {productosFiltrados.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => agregarProducto(producto)}
                    className="w-full px-2 py-1.5 text-left hover:bg-gray-50 transition-colors text-[11px] border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">{producto.nombre}</span>
                      <span className="text-blue-600 font-medium">${producto.precio?.toLocaleString()}</span>
                    </div>
                    <div className="text-[9px] text-gray-500">Stock: {producto.stock} | {producto.codigo}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ITEMS DEL PEDIDO */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[11px] font-medium text-gray-700">Productos ({items.length})</label>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[9px] text-gray-600">{paginaActual}/{totalPaginas}</span>
                <button
                  onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div className="border border-gray-200 rounded-md h-[90px] overflow-hidden">
            {items.length > 0 ? (
              <div className="divide-y divide-gray-100 h-full overflow-y-auto">
                {itemsPaginados.map((item, index) => {
                  const indiceReal = indiceInicio + index
                  const estaEditando = editandoPrecio === indiceReal

                  return (
                    <div key={item.id} className="px-1.5 py-1 flex items-center gap-1.5 bg-white">
                      <div className="bg-blue-100 p-0.5 rounded">
                        <Package className="w-2.5 h-2.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-medium text-gray-900 truncate">{item.producto}</div>
                        <div className="flex items-center gap-0.5">
                          {estaEditando ? (
                            <input
                              type="number"
                              className="w-16 px-1 py-0 text-[9px] border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={item.precio}
                              onChange={(e) => actualizarPrecio(indiceReal, e.target.value)}
                              onBlur={() => setEditandoPrecio(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setEditandoPrecio(null)
                                }
                              }}
                              autoFocus
                              step="0.01"
                            />
                          ) : (
                            <span className="text-[9px] text-gray-500">${item.precio?.toLocaleString()}</span>
                          )}
                          <button
                            onClick={() => setEditandoPrecio(indiceReal)}
                            className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar precio"
                          >
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => actualizarCantidad(indiceReal, item.cantidad - 1)}
                          className="w-4 h-4 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 text-[10px]"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-[10px] font-medium">{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(indiceReal, item.cantidad + 1)}
                          className="w-4 h-4 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 text-[10px]"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[10px] font-semibold text-gray-900 w-12 text-right">
                        ${item.subtotal?.toLocaleString()}
                      </div>
                      <button onClick={() => eliminarItem(indiceReal)} className="p-0.5 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[10px] text-gray-400">No hay productos agregados</p>
              </div>
            )}
          </div>
        </div>

        {/* METODO DE PAGO Y FECHA */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Metodo de pago</label>
            <CustomSelect
              value={nuevaFactura?.metodoPago || ""}
              options={[
                { value: "Efectivo", label: "Efectivo" },
                { value: "Tarjeta", label: "Tarjeta" },
                { value: "Transferencia", label: "Transferencia" },
                { value: "MercadoPago", label: "MercadoPago" },
              ]}
              onChange={(value) => setNuevaFactura && setNuevaFactura((prev) => ({ ...prev, metodoPago: value }))}
              placeholder="Seleccionar..."
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Fecha</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              value={nuevaFactura?.fecha || new Date().toISOString().split("T")[0]}
              onChange={(e) => setNuevaFactura && setNuevaFactura((prev) => ({ ...prev, fecha: e.target.value }))}
            />
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-600">Total de la factura:</span>
            <span className="text-base font-bold text-gray-900">
              ${calcularTotal().toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={closeModal}
          className="flex-1 bg-white text-gray-700 px-2.5 py-1.5 text-[11px] rounded-md hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
        >
          Cancelar
        </button>
        <button
          ref={generarBtnRef}
          onClick={handleButtonClick}
          disabled={items.length === 0 || !nuevaFactura?.cliente || isProcessing}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 text-[11px] rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          tabIndex={0}
        >
          {isProcessing ? "Procesando..." : tipoOperacion === "cotizacion" ? "Generar cotizacion" : "Generar factura"}
        </button>
      </div>

      {/* Indicador de doble Enter */}
      {enterCount === 1 && (
        <div className="text-center">
          <span className="text-[9px] text-blue-600 font-medium animate-pulse">
            Presiona Enter de nuevo para confirmar
          </span>
        </div>
      )}
    </div>
  )
}

export default FacturaForm
