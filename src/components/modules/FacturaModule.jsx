"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import {
  Trash2,
  Search,
  X,
  Package,
  FileText,
  Zap,
  ArrowLeft,
  CheckCircle,
  Plus,
  UserPlus,
  DollarSign,
  CreditCard,
} from "lucide-react"

const BORDER_COLOR = "#d1d5db"
const TEXT_PRIMARY = "#111827"
const TEXT_SECONDARY = "#6b7280"

const FacturaModule = ({ formData, formActions, onVolver, openModal }) => {
  const {
    nuevaFactura = {},
    setNuevaFactura,
    productos = [],
    clientes = [],
    tipoOperacion = "venta-productos",
  } = formData || {}

  const {
    generarFactura,
    agregarItemFactura,
    actualizarItemFactura,
    eliminarItemFactura,
    cambiarTipoOperacion,
    agregarAbono,
  } = formActions || {}

  const [busquedaCliente, setBusquedaCliente] = useState("")
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false)
  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false)
  const [montoPago, setMontoPago] = useState("")
  const [mostrarSeccionPago, setMostrarSeccionPago] = useState(false)
  const [itemVentaLibre, setItemVentaLibre] = useState({
    descripcion: "",
    cantidad: 1,
    precio: 0,
  })
  const [mostrarAlerta, setMostrarAlerta] = useState(false)
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false)
  const [clienteSeleccionadoIndex, setClienteSeleccionadoIndex] = useState(-1)
  const [productoSeleccionadoIndex, setProductoSeleccionadoIndex] = useState(-1)

  const [mostrarFormularioAbono, setMostrarFormularioAbono] = useState(false)
  const [abonoData, setAbonoData] = useState({
    monto: "",
    metodo: "Efectivo",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
  })
  const [abonoError, setAbonoError] = useState("")

  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(5)

  const clientesDropdownRef = useRef(null)
  const productosDropdownRef = useRef(null)
  const montoPagoInputRef = useRef(null)
  const montoAbonoInputRef = useRef(null)

  useEffect(() => {
    if (mostrarFormularioAbono && montoAbonoInputRef.current) {
      setTimeout(() => {
        montoAbonoInputRef.current.focus()
      }, 100)
    }
  }, [mostrarFormularioAbono])

  useEffect(() => {
    if (mostrarSeccionPago && montoPagoInputRef.current) {
      montoPagoInputRef.current.focus()
    }
  }, [mostrarSeccionPago])

  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente) return clientes
    return clientes.filter(
      (cliente) =>
        cliente.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        cliente.telefono?.includes(busquedaCliente) ||
        cliente.cuit?.includes(busquedaCliente),
    )
  }, [clientes, busquedaCliente])

  const productosFiltrados = useMemo(() => {
    if (!busquedaProducto) return productos
    return productos.filter(
      (producto) =>
        producto.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        (producto.codigo && producto.codigo.toLowerCase().includes(busquedaProducto.toLowerCase())),
    )
  }, [productos, busquedaProducto])

  const totalPaginas = Math.ceil((nuevaFactura.items?.length || 0) / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const itemsPaginados = (nuevaFactura.items || []).slice(indiceInicio, indiceFin)

  // Reset page when items change
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas)
    }
  }, [nuevaFactura.items, paginaActual, totalPaginas])

  const manejarTecladoClientes = useCallback(
    (e) => {
      if (!mostrarDropdownCliente || clientesFiltrados.length === 0) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setClienteSeleccionadoIndex((prev) => (prev < clientesFiltrados.length - 1 ? prev + 1 : 0))
          break

        case "ArrowUp":
          e.preventDefault()
          setClienteSeleccionadoIndex((prev) => (prev > 0 ? prev - 1 : clientesFiltrados.length - 1))
          break

        case "Enter":
          e.preventDefault()
          if (clienteSeleccionadoIndex >= 0 && clientesFiltrados[clienteSeleccionadoIndex]) {
            seleccionarCliente(clientesFiltrados[clienteSeleccionadoIndex])
          }
          break

        case "Escape":
          e.preventDefault()
          setMostrarDropdownCliente(false)
          setClienteSeleccionadoIndex(-1)
          break
      }
    },
    [mostrarDropdownCliente, clientesFiltrados, clienteSeleccionadoIndex],
  )

  const manejarTecladoProductos = useCallback(
    (e) => {
      if (!mostrarListaProductos || productosFiltrados.length === 0) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setProductoSeleccionadoIndex((prev) => (prev < productosFiltrados.length - 1 ? prev + 1 : 0))
          break

        case "ArrowUp":
          e.preventDefault()
          setProductoSeleccionadoIndex((prev) => (prev > 0 ? prev - 1 : productosFiltrados.length - 1))
          break

        case "Enter":
          e.preventDefault()
          if (productoSeleccionadoIndex >= 0 && productosFiltrados[productoSeleccionadoIndex]) {
            agregarProductoDesdeLista(productosFiltrados[productoSeleccionadoIndex])
          }
          break

        case "Escape":
          e.preventDefault()
          setMostrarListaProductos(false)
          setProductoSeleccionadoIndex(-1)
          break
      }
    },
    [mostrarListaProductos, productosFiltrados, productoSeleccionadoIndex],
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mostrarDropdownCliente) {
        manejarTecladoClientes(e)
      } else if (mostrarListaProductos) {
        manejarTecladoProductos(e)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [manejarTecladoClientes, manejarTecladoProductos, mostrarDropdownCliente, mostrarListaProductos])

  useEffect(() => {
    if (clienteSeleccionadoIndex >= 0 && clientesDropdownRef.current) {
      const selectedElement = clientesDropdownRef.current.children[clienteSeleccionadoIndex]
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    }
  }, [clienteSeleccionadoIndex])

  useEffect(() => {
    if (productoSeleccionadoIndex >= 0 && productosDropdownRef.current) {
      const selectedElement = productosDropdownRef.current.children[productoSeleccionadoIndex]
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    }
  }, [productoSeleccionadoIndex])

  useEffect(() => {
    setClienteSeleccionadoIndex(-1)
  }, [busquedaCliente])

  useEffect(() => {
    setProductoSeleccionadoIndex(-1)
  }, [busquedaProducto])

  const seleccionarCliente = (cliente) => {
    setNuevaFactura((prev) => ({
      ...prev,
      cliente: cliente.nombre,
      clienteId: cliente.id,
    }))
    setBusquedaCliente(cliente.nombre)
    setMostrarDropdownCliente(false)
    setClienteSeleccionadoIndex(-1)
  }

  const limpiarCliente = () => {
    setNuevaFactura((prev) => ({
      ...prev,
      cliente: "",
      clienteId: null,
    }))
    setBusquedaCliente("")
    setClienteSeleccionadoIndex(-1)
  }

  const agregarProductoDesdeLista = (producto) => {
    const productoExistenteIndex = (nuevaFactura.items || []).findIndex((item) => item.producto === producto.nombre)

    if (productoExistenteIndex !== -1) {
      const itemsActualizados = [...(nuevaFactura.items || [])]
      const nuevaCantidad = itemsActualizados[productoExistenteIndex].cantidad + 1

      itemsActualizados[productoExistenteIndex] = {
        ...itemsActualizados[productoExistenteIndex],
        cantidad: nuevaCantidad,
        subtotal: (producto.precio || 0) * nuevaCantidad,
      }

      const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
      setNuevaFactura((prev) => ({ ...prev, items: itemsActualizados, total }))
    } else {
      const nuevoItem = {
        id: Date.now(),
        producto: producto.nombre,
        cantidad: 1,
        precio: producto.precio || 0,
        subtotal: producto.precio || 0,
      }

      const itemsActualizados = [...(nuevaFactura.items || []), nuevoItem]
      const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
      setNuevaFactura((prev) => ({ ...prev, items: itemsActualizados, total }))
    }

    setBusquedaProducto("")
    setMostrarListaProductos(false)
    setProductoSeleccionadoIndex(-1)
  }

  const handleCantidadChange = (index, value) => {
    const cantidad = Number.parseInt(value) || 0

    if (cantidad < 1) {
      alert("La cantidad debe ser al menos 1")
      return
    }

    const itemsActualizados = [...(nuevaFactura.items || [])]
    if (itemsActualizados[index]) {
      itemsActualizados[index] = {
        ...itemsActualizados[index],
        cantidad: cantidad,
        subtotal: cantidad * (itemsActualizados[index].precio || 0),
      }

      const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
      setNuevaFactura((prev) => ({ ...prev, items: itemsActualizados, total }))
    }
  }

  const handlePrecioChange = (index, value) => {
    const precio = Number.parseFloat(value) || 0

    if (precio < 0) {
      alert("El precio no puede ser negativo")
      return
    }

    const itemsActualizados = [...(nuevaFactura.items || [])]
    if (itemsActualizados[index]) {
      itemsActualizados[index] = {
        ...itemsActualizados[index],
        precio: precio,
        subtotal: precio * (itemsActualizados[index].cantidad || 1),
      }

      const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
      setNuevaFactura((prev) => ({ ...prev, items: itemsActualizados, total }))
    }
  }

  const handleEliminarItem = (index) => {
    const itemsActualizados = [...(nuevaFactura.items || [])]
    itemsActualizados.splice(index, 1)

    const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    setNuevaFactura((prev) => ({ ...prev, items: itemsActualizados, total }))
  }

  const clienteSeleccionado = clientes.find((c) => c.nombre === nuevaFactura.cliente)

  const getProductoActual = (index) => {
    const productoNombre = nuevaFactura.items?.[index]?.producto
    if (tipoOperacion === "venta-productos") {
      return productos.find((p) => p.nombre === productoNombre)
    }
    return null
  }

  const montoPagadoActual = nuevaFactura.montoPagado || 0
  const saldoPendiente = (nuevaFactura.total || 0) - montoPagadoActual

  const determinarEstado = () => {
    if (montoPagadoActual >= (nuevaFactura.total || 0)) return "pagada"
    if (montoPagadoActual > 0) return "parcial"
    return "pendiente"
  }

  const puedeGenerarFactura = () => {
    return (
      nuevaFactura.cliente &&
      nuevaFactura.items &&
      nuevaFactura.items.length > 0 &&
      nuevaFactura.tipo &&
      nuevaFactura.fecha &&
      nuevaFactura.metodoPago
    )
  }

  const handleGenerarFactura = () => {
    if (!puedeGenerarFactura()) {
      alert("Complete todos los campos obligatorios")
      return
    }

    if (generarFactura) {
      const facturaGenerada = generarFactura()

      if (facturaGenerada) {
        setMostrarAlerta(true)

        setTimeout(() => {
          setMostrarAlerta(false)
          onVolver()
        }, 2000)
      }
    }
  }

  const handleAgregarVentaLibre = () => {
    if (!itemVentaLibre.descripcion.trim()) {
      alert("La descripción es obligatoria")
      return
    }

    if (itemVentaLibre.precio <= 0) {
      alert("El precio debe ser mayor a 0")
      return
    }

    if (itemVentaLibre.cantidad < 1) {
      alert("La cantidad debe ser al menos 1")
      return
    }

    const nuevoItem = {
      id: Date.now(),
      producto: itemVentaLibre.descripcion.trim(),
      cantidad: itemVentaLibre.cantidad,
      precio: itemVentaLibre.precio,
      subtotal: itemVentaLibre.cantidad * itemVentaLibre.precio,
      esVentaLibre: true,
    }

    const itemsActualizados = [...(nuevaFactura.items || []), nuevoItem]
    const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    setNuevaFactura((prev) => ({
      ...prev,
      items: itemsActualizados,
      total,
    }))

    setItemVentaLibre({ descripcion: "", cantidad: 1, precio: 0 })
  }

  const handleCambiarTipoOperacion = (tipo) => {
    setNuevaFactura({
      ...nuevaFactura,
      items: [],
      total: 0,
      montoPagado: 0,
    })
    setProductoSeleccionadoIndex(-1)

    if (cambiarTipoOperacion) {
      cambiarTipoOperacion(tipo)
    }
  }

  const aplicarPago = () => {
    const montoNumerico = Number.parseFloat(montoPago) || 0

    if (montoNumerico <= 0) {
      alert("El monto debe ser mayor a 0")
      return
    }

    if (montoNumerico > saldoPendiente) {
      alert("El monto no puede ser mayor al saldo pendiente")
      return
    }

    const nuevoMontoPagado = montoPagadoActual + montoNumerico
    setNuevaFactura((prev) => ({
      ...prev,
      montoPagado: nuevoMontoPagado,
    }))
    setMontoPago("")
    setMostrarSeccionPago(false)
  }

  const handleAgregarAbono = () => {
    if (!nuevaFactura.cliente) {
      alert("Debe seleccionar un cliente para agregar un abono")
      return
    }

    const cliente = clientes.find((c) => c.nombre === nuevaFactura.cliente)
    if (!cliente) {
      alert("Cliente no encontrado")
      return
    }

    setMostrarFormularioAbono(true)
    setAbonoData({
      monto: "",
      metodo: "Efectivo",
      descripcion: `Abono para ${cliente.nombre}`,
      fecha: new Date().toISOString().split("T")[0],
    })
    setAbonoError("")
  }

  const procesarAbono = () => {
    if (!nuevaFactura.cliente) {
      setAbonoError("No hay cliente seleccionado")
      return
    }

    const montoNumerico = Number.parseFloat(abonoData.monto)
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setAbonoError("Monto inválido. Debe ser mayor a 0")
      return
    }

    const cliente = clientes.find((c) => c.nombre === nuevaFactura.cliente)
    if (!cliente) {
      setAbonoError("Cliente no encontrado")
      return
    }

    if (agregarAbono) {
      agregarAbono(cliente.id, montoNumerico, abonoData.metodo, abonoData.descripcion)
        .then((success) => {
          if (success) {
            setAbonoData({
              monto: "",
              metodo: "Efectivo",
              descripcion: `Abono para ${cliente.nombre}`,
              fecha: new Date().toISOString().split("T")[0],
            })
            setMostrarFormularioAbono(false)
            setAbonoError("")
          }
        })
        .catch((error) => {
          setAbonoError("Error al registrar el abono: " + error.message)
        })
    } else {
      setAbonoError("Función de agregar abono no disponible")
    }
  }

  const cerrarFormularioAbono = () => {
    setMostrarFormularioAbono(false)
    setAbonoData({
      monto: "",
      metodo: "Efectivo",
      descripcion: "",
      fecha: new Date().toISOString().split("T")[0],
    })
    setAbonoError("")
  }

  const limpiarCarrito = () => {
    setNuevaFactura({
      ...nuevaFactura,
      items: [],
      total: 0,
      cliente: "",
      clienteId: null,
    })
    setBusquedaCliente("")
  }

  const operacionesConfig = {
    "venta-productos": { icon: Package, label: "Venta de Productos" },
    "venta-libre": { icon: Zap, label: "Venta Libre" },
    cotizacion: { icon: FileText, label: "Cotización" },
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {mostrarAlerta && (
        <div className="fixed top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 border border-gray-300">
          <div className="p-1 rounded-full bg-gray-900">
            <CheckCircle size={12} className="text-white" />
          </div>
          <span className="font-medium text-xs text-gray-900">
            {tipoOperacion === "cotizacion" ? "Cotización generada exitosamente" : "Factura generada exitosamente"}
          </span>
        </div>
      )}

      <div className="bg-white border-b border-gray-300">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={onVolver} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600">
                <ArrowLeft size={14} />
              </button>
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  {tipoOperacion === "cotizacion" ? "Nueva Cotización" : "Nueva Factura"}
                </h2>
                <p className="text-[10px] text-gray-500">
                  Crea una nueva {tipoOperacion === "cotizacion" ? "cotización" : "factura"} para tus clientes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {Object.entries(operacionesConfig).map(([key, config]) => {
                const IconComponent = config.icon
                const isActive = tipoOperacion === key
                return (
                  <button
                    key={key}
                    onClick={() => handleCambiarTipoOperacion(key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded border transition-all text-[10px] font-medium ${
                      isActive
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent size={10} />
                    <span>{config.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-3 mb-3">
            <div className="mb-3">
              <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Cliente *</label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre, teléfono o CUIT..."
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs transition-all focus:border-gray-500 focus:outline-none bg-white"
                    style={{
                      borderColor: nuevaFactura.clienteId ? "#10b981" : BORDER_COLOR,
                    }}
                    value={busquedaCliente}
                    onChange={(e) => {
                      setBusquedaCliente(e.target.value)
                      setMostrarDropdownCliente(true)
                    }}
                    onFocus={() => setMostrarDropdownCliente(true)}
                  />
                  {busquedaCliente && (
                    <button
                      onClick={limpiarCliente}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 p-0.5 rounded transition-colors text-gray-400 hover:text-gray-700"
                    >
                      <X size={12} />
                    </button>
                  )}

                  {/* Dropdown de clientes */}
                  {mostrarDropdownCliente && clientesFiltrados.length > 0 && (
                    <div
                      ref={clientesDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto"
                    >
                      {clientesFiltrados.map((cliente, index) => (
                        <button
                          key={cliente.id}
                          onClick={() => seleccionarCliente(cliente)}
                          className={`w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            index === clienteSeleccionadoIndex ? "bg-gray-100" : ""
                          }`}
                        >
                          <div className="font-medium text-gray-900 text-[10px]">{cliente.nombre}</div>
                          {cliente.telefono && <div className="text-[10px] text-gray-500">{cliente.telefono}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => openModal && openModal("agregarCliente")}
                  className="px-2 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors flex items-center gap-1 text-[10px] font-medium border border-gray-900"
                >
                  <UserPlus size={10} />
                  <span>Nuevo</span>
                </button>
              </div>

              {clienteSeleccionado && (
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-300">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {clienteSeleccionado.telefono && (
                      <div>
                        <span className="text-gray-500">Teléfono:</span>
                        <span className="ml-1 text-gray-900 font-medium">{clienteSeleccionado.telefono}</span>
                      </div>
                    )}
                    {clienteSeleccionado.cuit && (
                      <div>
                        <span className="text-gray-500">CUIT:</span>
                        <span className="ml-1 text-gray-900 font-medium">{clienteSeleccionado.cuit}</span>
                      </div>
                    )}
                    {clienteSeleccionado.saldoFavor > 0 && (
                      <div className="col-span-2">
                        <span className="text-green-600 font-semibold">
                          Saldo a favor: $
                          {clienteSeleccionado.saldoFavor?.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {clienteSeleccionado.saldoFavor > 0 && (
                    <button
                      onClick={handleAgregarAbono}
                      className="mt-2 w-full px-2 py-1 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1 text-[10px] font-medium"
                    >
                      <DollarSign size={10} />
                      <span>Aplicar Abono</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Tipo *</label>
                <select
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                  value={nuevaFactura.tipo || ""}
                  onChange={(e) => setNuevaFactura((prev) => ({ ...prev, tipo: e.target.value }))}
                >
                  <option value="">Seleccionar</option>
                  <option value="A">Factura A</option>
                  <option value="B">Factura B</option>
                  <option value="C">Factura C</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Fecha *</label>
                <input
                  type="date"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                  value={nuevaFactura.fecha || ""}
                  onChange={(e) => setNuevaFactura((prev) => ({ ...prev, fecha: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Método de Pago *</label>
                <select
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                  value={nuevaFactura.metodoPago || ""}
                  onChange={(e) => setNuevaFactura((prev) => ({ ...prev, metodoPago: e.target.value }))}
                >
                  <option value="">Seleccionar</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {tipoOperacion === "venta-productos" && (
              <div className="mb-3">
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">
                  Agregar Productos
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre o código..."
                    className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value)
                      setMostrarListaProductos(true)
                    }}
                    onFocus={() => setMostrarListaProductos(true)}
                  />

                  {/* Dropdown de productos */}
                  {mostrarListaProductos && productosFiltrados.length > 0 && (
                    <div
                      ref={productosDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto"
                    >
                      {productosFiltrados.map((producto, index) => (
                        <button
                          key={producto.id}
                          onClick={() => agregarProductoDesdeLista(producto)}
                          className={`w-full text-left px-2 py-1.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                            index === productoSeleccionadoIndex ? "bg-gray-100" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900 text-[10px]">{producto.nombre}</div>
                              {producto.codigo && (
                                <div className="text-[10px] text-gray-500">Código: {producto.codigo}</div>
                              )}
                            </div>
                            <div className="text-[10px] font-semibold text-gray-900">
                              $
                              {producto.precio?.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tipoOperacion === "venta-libre" && (
              <div className="mb-3">
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Venta Libre</label>
                <div className="grid grid-cols-12 gap-1.5">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Descripción"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                      value={itemVentaLibre.descripcion}
                      onChange={(e) => setItemVentaLibre((prev) => ({ ...prev, descripcion: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Cant."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                      value={itemVentaLibre.cantidad}
                      onChange={(e) =>
                        setItemVentaLibre((prev) => ({ ...prev, cantidad: Number.parseInt(e.target.value) || 1 }))
                      }
                      min="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Precio"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                      value={itemVentaLibre.precio}
                      onChange={(e) =>
                        setItemVentaLibre((prev) => ({ ...prev, precio: Number.parseFloat(e.target.value) || 0 }))
                      }
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={handleAgregarVentaLibre}
                      className="w-full px-2 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors flex items-center justify-center text-xs font-medium"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {nuevaFactura.items && nuevaFactura.items.length > 0 && (
              <div className="mb-3">
                <label className="block text-[10px] font-semibold mb-1.5 text-gray-600 uppercase">
                  Productos Agregados
                </label>
                <div className="border border-gray-300 rounded overflow-hidden">
                  <table className="w-full text-[10px]">
                    <thead className="bg-gray-50 border-b border-gray-300">
                      <tr>
                        <th className="text-left px-2 py-1 font-semibold text-gray-600 uppercase">Producto</th>
                        <th className="text-center px-2 py-1 font-semibold text-gray-600 uppercase">Cantidad</th>
                        <th className="text-right px-2 py-1 font-semibold text-gray-600 uppercase">Precio</th>
                        <th className="text-right px-2 py-1 font-semibold text-gray-600 uppercase">Subtotal</th>
                        <th className="text-center px-2 py-1 font-semibold text-gray-600 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {itemsPaginados.map((item, indexEnPagina) => {
                        const index = indiceInicio + indexEnPagina
                        const productoActual = getProductoActual(index)
                        const stockDisponible = productoActual?.stock || 0
                        const superaStock =
                          item.cantidad > stockDisponible &&
                          tipoOperacion === "venta-productos" &&
                          productoActual?.controlaStock

                        return (
                          <tr
                            key={item.id || index}
                            className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                          >
                            <td className="px-2 py-1.5">
                              <div className="font-medium text-gray-900">{item.producto}</div>
                              {superaStock && (
                                <div className="text-[10px] text-red-600 mt-0.5">
                                  Stock: {stockDisponible} disponibles
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                className="w-full px-1.5 py-1 border border-gray-300 rounded text-center text-[10px] focus:border-gray-500 focus:outline-none bg-white"
                                value={item.cantidad}
                                onChange={(e) => handleCantidadChange(index, e.target.value)}
                                min="1"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                className="w-full px-1.5 py-1 border border-gray-300 rounded text-right text-[10px] focus:border-gray-500 focus:outline-none bg-white"
                                value={item.precio}
                                onChange={(e) => handlePrecioChange(index, e.target.value)}
                                step="0.01"
                                min="0"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-right font-semibold text-gray-900">
                              $
                              {item.subtotal?.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <button
                                onClick={() => handleEliminarItem(index)}
                                className="p-0.5 hover:bg-red-50 rounded transition-colors text-red-600 border border-transparent hover:border-red-200"
                              >
                                <Trash2 size={10} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {nuevaFactura.items.length > 5 && (
                  <div className="px-2 py-1.5 border-t border-gray-300 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-600">
                          Mostrando {indiceInicio + 1}-{Math.min(indiceFin, nuevaFactura.items.length)} de{" "}
                          {nuevaFactura.items.length}
                        </span>
                        <select
                          value={itemsPorPagina}
                          onChange={(e) => {
                            setItemsPorPagina(Number(e.target.value))
                            setPaginaActual(1)
                          }}
                          className="px-1 py-0.5 text-[10px] border border-gray-300 rounded bg-white"
                        >
                          <option value="5">5 por página</option>
                          <option value="10">10 por página</option>
                          <option value="25">25 por página</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                          disabled={paginaActual === 1}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ←
                        </button>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium text-gray-700">
                          {paginaActual} / {totalPaginas || 1}
                        </span>
                        <button
                          onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                          disabled={paginaActual === totalPaginas || totalPaginas === 0}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-64 bg-white border-l border-gray-300 p-3 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase">
              Resumen de {tipoOperacion === "cotizacion" ? "Cotización" : "Factura"}
            </h3>

            <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-300">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-600">Items:</span>
                <span className="font-semibold text-gray-900">{nuevaFactura.items?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-gray-900">
                  $
                  {nuevaFactura.total?.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0,00"}
                </span>
              </div>

              {montoPagadoActual > 0 && (
                <>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-600">Pagado:</span>
                    <span className="font-semibold text-green-600">
                      $
                      {montoPagadoActual.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-600">Saldo:</span>
                    <span className="font-semibold text-red-600">
                      $
                      {saldoPendiente.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {!mostrarSeccionPago && tipoOperacion !== "cotizacion" && (
              <button
                onClick={() => setMostrarSeccionPago(true)}
                className="w-full px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-[10px] font-medium border border-gray-300"
              >
                <CreditCard size={10} />
                <span>Agregar Pago</span>
              </button>
            )}

            {mostrarSeccionPago && (
              <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-300">
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Monto a Pagar</label>
                <input
                  ref={montoPagoInputRef}
                  type="number"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white mb-1.5"
                  placeholder="Ingrese monto"
                  value={montoPago}
                  onChange={(e) => setMontoPago(e.target.value)}
                  step="0.01"
                  min="0"
                  max={saldoPendiente}
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={aplicarPago}
                    className="flex-1 px-2 py-1 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-[10px] font-medium"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={() => {
                      setMostrarSeccionPago(false)
                      setMontoPago("")
                    }}
                    className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-[10px] font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-[10px]">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <span className="ml-1 font-medium text-gray-900">{nuevaFactura.cliente || "No seleccionado"}</span>
              </div>
              <div>
                <span className="text-gray-600">Tipo:</span>
                <span className="ml-1 font-medium text-gray-900">{nuevaFactura.tipo || "No seleccionado"}</span>
              </div>
              <div>
                <span className="text-gray-600">Fecha:</span>
                <span className="ml-1 font-medium text-gray-900">{nuevaFactura.fecha || "No seleccionada"}</span>
              </div>
              <div>
                <span className="text-gray-600">Método de Pago:</span>
                <span className="ml-1 font-medium text-gray-900">{nuevaFactura.metodoPago || "No seleccionado"}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-300 space-y-1.5">
            <button
              onClick={handleGenerarFactura}
              disabled={!puedeGenerarFactura()}
              className={`w-full px-3 py-2 rounded font-semibold transition-colors text-xs flex items-center justify-center gap-1.5 ${
                puedeGenerarFactura()
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle size={12} />
              <span>Generar {tipoOperacion === "cotizacion" ? "Cotización" : "Factura"}</span>
            </button>

            <button
              onClick={limpiarCarrito}
              className="w-full px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs font-medium"
            >
              Limpiar Todo
            </button>
          </div>
        </div>
      </div>

      {mostrarFormularioAbono && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Agregar Abono</h3>
              <button
                onClick={cerrarFormularioAbono}
                className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Monto *</label>
                <input
                  ref={montoAbonoInputRef}
                  type="number"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                  placeholder="0.00"
                  value={abonoData.monto}
                  onChange={(e) => setAbonoData((prev) => ({ ...prev, monto: e.target.value }))}
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Método de Pago *</label>
                <select
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white"
                  value={abonoData.metodo}
                  onChange={(e) => setAbonoData((prev) => ({ ...prev, metodo: e.target.value }))}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold mb-1 text-gray-600 uppercase">Descripción</label>
                <textarea
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-gray-500 focus:outline-none bg-white resize-none"
                  rows="2"
                  placeholder="Descripción del abono"
                  value={abonoData.descripcion}
                  onChange={(e) => setAbonoData((prev) => ({ ...prev, descripcion: e.target.value }))}
                />
              </div>

              {abonoError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-[10px] text-red-600">{abonoError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-1.5 mt-3">
              <button
                onClick={procesarAbono}
                className="flex-1 px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-xs font-medium"
              >
                Agregar Abono
              </button>
              <button
                onClick={cerrarFormularioAbono}
                className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-xs font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacturaModule

