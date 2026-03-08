"use client"

import { Package, Search, ChevronDown, Plus, Trash2, User, X } from "lucide-react"
import { useState, useEffect, useRef, useMemo } from "react"
import { useAuth } from "../../lib/AuthContext"

const VentaForm = ({
  type,
  pedido,
  clientes = [],
  productos = [],
  formActions,
  closeModal,
  openModal
}) => {
  const isEdit = type === "editar-pedido" || type === "editar-factura"

  // En modo edición, pre-rellenar el campo de cliente con el nombre del pedido
  const [busquedaCliente, setBusquedaCliente] = useState(isEdit && pedido?.cliente_nombre ? pedido.cliente_nombre : "")
  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false)
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false)
  const [page, setPage] = useState(0)
  const ITEMS_PER_PAGE = 3

  const clienteRef = useRef(null)
  const productoRef = useRef(null)

  const [ventaData, setVentaData] = useState({
    id: pedido?.id || null,
    facturaId: pedido?.factura_id || null,
    clienteId: pedido?.cliente_id || "",
    clienteNombre: pedido?.cliente_nombre || "",
    fechaVenta: pedido?.fecha_pedido?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    fechaEntrega: pedido?.fecha_entrega_estimada?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    items: typeof pedido?.items === 'string' ? JSON.parse(pedido.items) : (pedido?.items || []),
    total: pedido?.total || 0,
    notas: pedido?.notas || "",
    metodoPago: pedido?.metodoPago || "Efectivo",
    montoPagado: pedido?.montoPagado || 0,
    tipoFactura: pedido?.tipoFactura || "Factura A",
    estadoOperativo: pedido?.estado || "pendiente",
    canalVenta: pedido?.canal_venta || "",
  })

  const { user } = useAuth()

  // Cargar canales configurados: localStorage primero, luego user_metadata como fallback
  const [canalesDisponibles, setCanalesDisponibles] = useState(() => {
    try {
      const fromLS = localStorage.getItem('gestify_canales_venta')
      if (fromLS) {
        const parsed = JSON.parse(fromLS)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch { }
    return []
  })

  useEffect(() => {
    // Si localStorage estaba vacío, intentar desde user_metadata
    if (canalesDisponibles.length === 0 && user?.user_metadata?.canales_venta) {
      const fromMeta = user.user_metadata.canales_venta
      if (Array.isArray(fromMeta) && fromMeta.length > 0) {
        setCanalesDisponibles(fromMeta)
        // Sincronizar localStorage
        localStorage.setItem('gestify_canales_venta', JSON.stringify(fromMeta))
      }
    }
  }, [user])

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

  const metodosPagoOptions = [
    { value: "Efectivo", label: "Efectivo" },
    { value: "Tarjeta", label: "Tarjeta" },
    { value: "Transfer", label: "Transferencia" },
    { value: "MercadoPago", label: "MercadoPago" },
  ]

  const tiposFacturaOptions = [
    { value: "Factura A", label: "Factura A" },
    { value: "Factura B", label: "Factura B" },
    { value: "Factura C", label: "Factura C" },
  ]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clienteRef.current && !clienteRef.current.contains(e.target)) setMostrarDropdownCliente(false)
      if (productoRef.current && !productoRef.current.contains(e.target)) setMostrarDropdownProducto(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente) return clientesMock
    return clientesMock.filter(c =>
      c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.telefono?.includes(busquedaCliente)
    )
  }, [busquedaCliente, clientesMock])

  const productosFiltrados = useMemo(() => {
    if (!busquedaProducto) return productosMock
    return productosMock.filter(p =>
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busquedaProducto.toLowerCase())
    )
  }, [busquedaProducto, productosMock])

  const items = ventaData.items || []
  const calcularTotal = () => items.reduce((acc, item) => acc + (item.subtotal || 0), 0)
  const calcularSaldoPendiente = () => Math.max(0, calcularTotal() - (parseFloat(ventaData.montoPagado) || 0))

  const seleccionarCliente = (cliente) => {
    setVentaData({ ...ventaData, clienteId: cliente.id, clienteNombre: cliente.nombre })
    setBusquedaCliente(cliente.nombre)
    setMostrarDropdownCliente(false)
  }

  const agregarProducto = (producto) => {
    let nuevosItems = [...items]
    const itemExistenteIndex = items.findIndex(item => item.productoId === producto.id)
    if (itemExistenteIndex !== -1) {
      nuevosItems[itemExistenteIndex].cantidad += 1
      nuevosItems[itemExistenteIndex].subtotal = nuevosItems[itemExistenteIndex].cantidad * nuevosItems[itemExistenteIndex].precio
    } else {
      nuevosItems.push({
        id: Date.now(),
        productoId: producto.id,
        producto: producto.nombre,
        cantidad: 1,
        precio: producto.precio,
        subtotal: producto.precio,
        stockDisponible: producto.stock,
      })
    }

    // Auto-ir a la última página
    const totalPages = Math.ceil(nuevosItems.length / ITEMS_PER_PAGE)
    if (totalPages > 0) setPage(totalPages - 1)

    setVentaData({ ...ventaData, items: nuevosItems })
    setBusquedaProducto("")
    setMostrarDropdownProducto(false)
  }

  const actualizarItemTexto = (index, campo, valor) => {
    const nuevosItems = [...items]
    nuevosItems[index][campo] = valor
    setVentaData({ ...ventaData, items: nuevosItems })
  }

  const actualizarCantidad = (index, nuevaCantidad) => {
    const qty = parseFloat(nuevaCantidad) || 0
    const nuevosItems = [...items]
    nuevosItems[index].cantidad = qty
    nuevosItems[index].subtotal = nuevosItems[index].precio * qty
    setVentaData({ ...ventaData, items: nuevosItems })
  }

  const actualizarPrecio = (index, nuevoPrecio) => {
    const precio = parseFloat(nuevoPrecio) || 0
    const nuevosItems = [...items]
    nuevosItems[index].precio = Math.max(0, precio)
    nuevosItems[index].subtotal = nuevosItems[index].precio * nuevosItems[index].cantidad
    setVentaData({ ...ventaData, items: nuevosItems })
  }

  const eliminarItem = (index) => {
    setVentaData({ ...ventaData, items: items.filter((_, i) => i !== index) })
  }

  const handleGuardarVenta = async () => {
    if (!ventaData.clienteId) { alert("Selecciona un cliente"); return }
    if (items.length === 0) { alert("Agrega al menos un producto"); return }

    const total = calcularTotal()

    // ── MODO EDICIÓN: actualizar pedido existente ──────────────────────────
    if (isEdit && ventaData.id) {
      const camposActualizar = {
        cliente_id: ventaData.clienteId,
        cliente_nombre: ventaData.clienteNombre,
        fecha_pedido: ventaData.fechaVenta,
        fecha_entrega_estimada: ventaData.fechaEntrega || null,
        items: JSON.stringify(ventaData.items),
        total: total,
        notas: ventaData.notas || null,
        estado: ventaData.estadoOperativo || 'pendiente',
      }

      if (formActions?.actualizarPedido) {
        const resultado = await formActions.actualizarPedido(ventaData.id, camposActualizar)
        if (resultado?.success) {
          closeModal()
        } else {
          alert('Error al guardar cambios: ' + (resultado?.mensaje || 'Error desconocido'))
        }
      }
      return
    }

    // ── MODO CREACIÓN: crear nuevo pedido/factura ──────────────────────────
    const ventaCompleta = {
      ...ventaData,
      total,
      saldoPendiente: calcularSaldoPendiente(),
      tipoVenta: "factura",
      fechaRegistro: new Date().toISOString(),
      canalVenta: ventaData.canalVenta || null,
      estadoOperativo: calcularSaldoPendiente() === 0 ? "entregado" :
        ventaData.fechaEntrega ? "pendiente" : "preparando"
    }

    if (formActions?.guardarVenta) formActions.guardarVenta(ventaCompleta, "factura")
    closeModal()
  }

  const CustomSelect = ({ value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef(null)

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false)
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
                onClick={() => { onChange(option.value); setIsOpen(false) }}
                className={`w-full px-2 py-1.5 text-left text-[11px] hover:bg-gray-50 transition-colors ${value === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
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
    <div className="w-full max-w-[460px] mx-auto space-y-2">
      {/* Header */}
      <div className="pb-1.5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            {isEdit ? "Editar Pedido" : "Nueva Venta"}
          </h3>
          <p className="text-[10px] text-gray-500">
            {isEdit ? "Modificá los datos del pedido" : "Creará factura y pedido automáticamente"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {/* CLIENTE */}
        <div ref={clienteRef}>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[11px] font-medium text-gray-700">Cliente</label>
            <button onClick={() => openModal?.("cliente-rapido")} className="text-blue-600 hover:text-blue-700">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-7 pr-7 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Buscar cliente..."
              value={busquedaCliente}
              onChange={(e) => { setBusquedaCliente(e.target.value); setMostrarDropdownCliente(true) }}
              onFocus={() => setMostrarDropdownCliente(true)}
            />
            <User className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            {busquedaCliente && (
              <button onClick={() => { setBusquedaCliente(""); setVentaData({ ...ventaData, clienteId: "", clienteNombre: "" }) }} className="absolute right-2 top-1/2 -translate-y-1/2">
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
          {ventaData.clienteNombre && (
            <span className="text-[9px] text-green-600 font-medium mt-0.5 block">
              Cliente: {ventaData.clienteNombre}
            </span>
          )}
        </div>

        {/* FECHAS */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Fecha venta</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              value={ventaData.fechaVenta}
              onChange={(e) => setVentaData({ ...ventaData, fechaVenta: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Entrega estimada <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              type="date"
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              value={ventaData.fechaEntrega}
              onChange={(e) => setVentaData({ ...ventaData, fechaEntrega: e.target.value })}
              placeholder="Opcional para pedido"
            />
          </div>
        </div>

        {/* AGREGAR PRODUCTO */}
        <div ref={productoRef}>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[11px] font-medium text-gray-700">Agregar producto</label>
            <button onClick={() => openModal?.("producto-rapido")} className="text-blue-600 hover:text-blue-700">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Buscar producto..."
              value={busquedaProducto}
              onChange={(e) => { setBusquedaProducto(e.target.value); setMostrarDropdownProducto(true) }}
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

        {/* ITEMS */}
        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
            Productos ({items.length})
          </label>
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white mb-2">
            <div className="grid grid-cols-[minmax(0,1.5fr)_50px_60px_60px_24px] gap-1 px-2 py-1 bg-gray-50 border-b border-gray-200">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Producto</div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider text-center">Cant.</div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider text-center">Precio</div>
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider text-center">Total</div>
              <div></div>
            </div>

            <div className="h-[96px] overflow-hidden">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-1">
                  <Package className="w-4 h-4 text-gray-300" />
                  <span className="text-[10px] text-gray-400">Agrega productos</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  {items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((item, idx) => {
                    const absIdx = page * ITEMS_PER_PAGE + idx
                    return (
                      <div key={item.id} className="grid grid-cols-[minmax(0,1.5fr)_50px_60px_60px_24px] gap-1 px-2 py-1 border-b border-gray-100 items-center last:border-0 hover:bg-gray-50 transition-colors">
                        <input
                          type="text"
                          value={item.producto}
                          onChange={e => actualizarItemTexto(absIdx, 'producto', e.target.value)}
                          className="w-full text-[10px] font-semibold text-gray-900 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded px-1 py-0.5 outline-none truncate"
                        />
                        <input
                          type="number" min="1"
                          value={item.cantidad}
                          onChange={e => actualizarCantidad(absIdx, e.target.value)}
                          className="w-full text-[10px] font-bold text-center bg-gray-50 focus:bg-white border border-gray-200 focus:border-blue-300 rounded px-1 py-0.5 outline-none"
                        />
                        <div className="relative">
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 pointer-events-none">$</span>
                          <input
                            type="number" min="0" step="0.01"
                            value={item.precio}
                            onChange={e => actualizarPrecio(absIdx, e.target.value)}
                            className="w-full text-[10px] text-right bg-gray-50 focus:bg-white border border-gray-200 focus:border-blue-300 rounded pl-3 pr-1 py-0.5 outline-none"
                          />
                        </div>
                        <div className="text-right text-[10px] font-bold text-blue-600 truncate">
                          ${(item.subtotal || 0).toLocaleString()}
                        </div>
                        <button onClick={() => eliminarItem(absIdx)} className="flex items-center justify-center p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors w-full">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {items.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between px-2 py-1 bg-gray-50 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={`text-[10px] font-bold ${page === 0 ? 'text-gray-300 cursor-default' : 'text-blue-600 hover:text-blue-700'}`}>
                  Anterior
                </button>
                <span className="text-[9px] font-medium text-gray-500">
                  Pág {page + 1} / {Math.ceil(items.length / ITEMS_PER_PAGE)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(Math.ceil(items.length / ITEMS_PER_PAGE) - 1, p + 1))}
                  disabled={page >= Math.ceil(items.length / ITEMS_PER_PAGE) - 1}
                  className={`text-[10px] font-bold ${page >= Math.ceil(items.length / ITEMS_PER_PAGE) - 1 ? 'text-gray-300 cursor-default' : 'text-blue-600 hover:text-blue-700'}`}>
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FACTURACION */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Tipo factura</label>
            <CustomSelect
              value={ventaData.tipoFactura}
              options={tiposFacturaOptions}
              onChange={(v) => setVentaData({ ...ventaData, tipoFactura: v })}
              placeholder="Tipo"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Método pago</label>
            <CustomSelect
              value={ventaData.metodoPago}
              options={metodosPagoOptions}
              onChange={(v) => setVentaData({ ...ventaData, metodoPago: v })}
              placeholder="Pago"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Monto pagado</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">$</span>
              <input
                type="number"
                className="w-full pl-5 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="0"
                value={ventaData.montoPagado || ""}
                onChange={(e) => setVentaData({ ...ventaData, montoPagado: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* CANAL DE VENTA */}
        {canalesDisponibles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[11px] font-medium text-gray-700">
                Canal de venta <span className="text-gray-400">(opcional)</span>
              </label>
              {ventaData.canalVenta && (
                <button
                  onClick={() => setVentaData({ ...ventaData, canalVenta: '' })}
                  className="text-[9px] text-gray-400 hover:text-gray-600"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {canalesDisponibles.map((canal) => (
                <button
                  key={canal}
                  type="button"
                  onClick={() => setVentaData({
                    ...ventaData,
                    canalVenta: ventaData.canalVenta === canal ? '' : canal
                  })}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all ${ventaData.canalVenta === canal
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                >
                  {canal}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NOTAS */}
        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Notas (opcional)</label>
          <input
            type="text"
            className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
            placeholder="Instrucciones especiales, comentarios..."
            value={ventaData.notas}
            onChange={(e) => setVentaData({ ...ventaData, notas: e.target.value })}
          />
        </div>

        {/* TOTAL */}
        <div className="border rounded-md p-2 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-600">Total:</span>
            <span className="text-base font-bold text-green-700">
              ${calcularTotal().toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {calcularSaldoPendiente() > 0 && (
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-green-200">
              <span className="text-[10px] text-orange-600 font-medium">Saldo pendiente:</span>
              <span className="text-[11px] font-bold text-orange-600">
                ${calcularSaldoPendiente().toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {ventaData.fechaEntrega && (
            <div className="mt-1 pt-1 border-t border-green-200">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-blue-600 font-medium">✓ Se creará pedido para:</span>
                <span className="text-[9px] text-blue-800 font-bold">
                  {new Date(ventaData.fechaEntrega).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit"
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={closeModal}
          className="flex-1 bg-transparent text-gray-700 px-2.5 py-1.5 text-[11px] rounded-md hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardarVenta}
          disabled={!ventaData.clienteId || items.length === 0}
          className="flex-1 px-2.5 py-1.5 text-[11px] rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white bg-green-600 hover:bg-green-700"
        >
          {isEdit ? "Guardar cambios" : "Facturar y crear pedido"}
        </button>
      </div>
    </div>
  )
}

export default VentaForm