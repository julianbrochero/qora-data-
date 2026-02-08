"use client"

import { Package, Search, ChevronDown, Plus, Trash2, User, Calendar } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const PedidoForm = ({ type, pedido, clientes = [], productos = [], formActions, closeModal }) => {
  const [busquedaCliente, setBusquedaCliente] = useState("")
  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false)
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false)
  const clienteRef = useRef(null)
  const productoRef = useRef(null)

  const isEdit = type === "editar-pedido"

  const [pedidoData, setPedidoData] = useState({
    clienteId: pedido?.cliente_id || "",
    clienteNombre: pedido?.cliente_nombre || "",
    fechaPedido: pedido?.fecha_pedido?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    fechaEntregaEstimada: pedido?.fecha_entrega_estimada?.slice(0, 10) || "",
    estado: pedido?.estado || "pendiente",
    notas: pedido?.notas || "",
    items: pedido?.items || [],
  })

  // Mock data si no hay datos
  const clientesMock = clientes.length > 0 ? clientes : [
    { id: 1, nombre: "Juan Perez", telefono: "351-1234567" },
    { id: 2, nombre: "Maria Garcia", telefono: "351-7654321" },
    { id: 3, nombre: "Carlos Lopez", telefono: "351-9876543" },
  ]

  const productosMock = productos.length > 0 ? productos : [
    { id: 1, nombre: "Campera de cuero", precio: 150000, stock: 10, codigo: "CAMP001" },
    { id: 2, nombre: "Zapatillas deportivas", precio: 85000, stock: 15, codigo: "ZAP002" },
    { id: 3, nombre: "Pantalon jean", precio: 45000, stock: 8, codigo: "PANT003" },
  ]

  const estadosOptions = [
    { value: "pendiente", label: "Pendiente" },
    { value: "preparando", label: "Preparando" },
    { value: "enviado", label: "Enviado" },
    { value: "entregado", label: "Entregado" },
    { value: "cancelado", label: "Cancelado" },
  ]

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clienteRef.current && !clienteRef.current.contains(e.target)) {
        setMostrarDropdownCliente(false)
      }
      if (productoRef.current && !productoRef.current.contains(e.target)) {
        setMostrarDropdownProducto(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clientesFiltrados = clientesMock.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.telefono?.includes(busquedaCliente)
  )

  const productosFiltrados = productosMock.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  const seleccionarCliente = (cliente) => {
    setPedidoData({
      ...pedidoData,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
    })
    setBusquedaCliente(cliente.nombre)
    setMostrarDropdownCliente(false)
  }

  const agregarProducto = (producto) => {
    const itemExistente = pedidoData.items.find((item) => item.productoId === producto.id)
    if (itemExistente) {
      setPedidoData({
        ...pedidoData,
        items: pedidoData.items.map((item) =>
          item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        ),
      })
    } else {
      setPedidoData({
        ...pedidoData,
        items: [
          ...pedidoData.items,
          {
            id: Date.now(),
            productoId: producto.id,
            producto: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            subtotal: producto.precio,
          },
        ],
      })
    }
    setBusquedaProducto("")
    setMostrarDropdownProducto(false)
  }

  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarItem(index)
      return
    }
    const nuevosItems = [...pedidoData.items]
    nuevosItems[index].cantidad = nuevaCantidad
    nuevosItems[index].subtotal = nuevosItems[index].precio * nuevaCantidad
    setPedidoData({ ...pedidoData, items: nuevosItems })
  }

  const eliminarItem = (index) => {
    setPedidoData({
      ...pedidoData,
      items: pedidoData.items.filter((_, i) => i !== index),
    })
  }

  const calcularTotal = () => {
    return pedidoData.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  }

  const handleGuardar = () => {
    const pedidoFinal = {
      ...pedidoData,
      total: calcularTotal(),
    }

    // IMPORTANTE: Usar la NUEVA función que crea solo el pedido sin factura
    if (formActions?.agregarPedidoSolo) {
      formActions.agregarPedidoSolo(pedidoFinal)
        .then(resultado => {
          if (resultado.success) {
            alert(resultado.mensaje || 'Pedido creado exitosamente')
            if (formActions.recargarTodosLosDatos) {
              formActions.recargarTodosLosDatos()
            }
          } else {
            alert('Error: ' + (resultado.mensaje || 'Error al crear pedido'))
          }
        })
        .catch(error => {
          console.error('Error creando pedido:', error)
          alert('Error al crear pedido: ' + error.message)
        })
    } else if (formActions?.guardarPedido) {
      // Fallback a la función original si no existe la nueva
      formActions.guardarPedido(pedidoFinal)
    }

    closeModal()
  }

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
                className={`w-full px-2 py-1.5 text-left text-[11px] hover:bg-gray-50 transition-colors ${value === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"
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
        <h3 className="text-sm font-bold text-gray-900">{isEdit ? "Editar pedido" : "Nuevo pedido"}</h3>
        <p className="text-[10px] text-gray-500">
          {isEdit ? "Modifica los datos del pedido." : "Registra un nuevo pedido para tu cliente."}
        </p>
      </div>

      <div className="space-y-2">
        {/* CLIENTE */}
        <div ref={clienteRef}>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[11px] font-medium text-gray-700">Cliente</label>
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
            />
            <User className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
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
          {pedidoData.clienteNombre && (
            <span className="text-[9px] text-green-600 font-medium mt-0.5 block">
              Cliente: {pedidoData.clienteNombre}
            </span>
          )}
        </div>

        {/* FECHAS Y ESTADO */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Fecha pedido</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              value={pedidoData.fechaPedido}
              onChange={(e) => setPedidoData({ ...pedidoData, fechaPedido: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Entrega estimada</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              value={pedidoData.fechaEntregaEstimada}
              onChange={(e) => setPedidoData({ ...pedidoData, fechaEntregaEstimada: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Estado</label>
            <CustomSelect
              value={pedidoData.estado}
              options={estadosOptions}
              onChange={(value) => setPedidoData({ ...pedidoData, estado: value })}
              placeholder="Estado"
            />
          </div>
        </div>

        {/* AGREGAR PRODUCTO */}
        <div ref={productoRef}>
          <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Agregar producto</label>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Buscar producto..."
              value={busquedaProducto}
              onChange={(e) => {
                setBusquedaProducto(e.target.value)
                setMostrarDropdownProducto(true)
              }}
              onFocus={() => setMostrarDropdownProducto(true)}
            />
            <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            {mostrarDropdownProducto && productosFiltrados.length > 0 && (
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
          <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
            Productos ({pedidoData.items.length})
          </label>
          <div className="border border-gray-200 rounded-md h-[90px] overflow-hidden">
            {pedidoData.items.length > 0 ? (
              <div className="divide-y divide-gray-100 h-full overflow-y-auto">
                {pedidoData.items.map((item, index) => (
                  <div key={item.id} className="px-1.5 py-1 flex items-center gap-1.5 bg-white">
                    <div className="bg-blue-100 p-0.5 rounded">
                      <Package className="w-2.5 h-2.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium text-gray-900 truncate">{item.producto}</div>
                      <span className="text-[9px] text-gray-500">${item.precio?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                        className="w-4 h-4 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 text-[10px]"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-[10px] font-medium">{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                        className="w-4 h-4 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 text-[10px]"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-[10px] font-semibold text-gray-900 w-12 text-right">
                      ${(item.precio * item.cantidad).toLocaleString()}
                    </div>
                    <button onClick={() => eliminarItem(index)} className="p-0.5 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[10px] text-gray-400">No hay productos agregados</p>
              </div>
            )}
          </div>
        </div>

        {/* NOTAS */}
        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Notas (opcional)</label>
          <input
            type="text"
            className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
            placeholder="Instrucciones especiales, comentarios..."
            value={pedidoData.notas}
            onChange={(e) => setPedidoData({ ...pedidoData, notas: e.target.value })}
          />
        </div>

        {/* TOTAL */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-600">Total del pedido:</span>
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
          onClick={handleGuardar}
          disabled={!pedidoData.clienteId || pedidoData.items.length === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 text-[11px] rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEdit ? "Guardar cambios" : "Crear pedido"}
        </button>
      </div>
    </div>
  )
}

export default PedidoForm