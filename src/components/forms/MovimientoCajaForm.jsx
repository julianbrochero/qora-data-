"use client"

import { Package, Search, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const MovimientoCajaForm = ({ type, formData, formActions, closeModal }) => {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductSearch, setShowProductSearch] = useState(false)
  const [esCompraProducto, setEsCompraProducto] = useState(false)
  const [showUnidadDropdown, setShowUnidadDropdown] = useState(false)
  const montoInputRef = useRef(null)
  const unidadRef = useRef(null)

  const [movimiento, setMovimiento] = useState({
    tipo: type === "ingreso-caja" ? "ingreso" : "egreso",
    productoId: "",
    cantidad: "1",
    costoUnitario: "",
    descripcion: "",
    metodo: "Efectivo",
    fecha: new Date().toISOString().slice(0, 16),
    fechaVencimiento: "",
    actualizarPrecios: false,
    unidadMedida: "",
  })

  const unidadesOptions = [
    { value: "", label: "Tipo de unidad" },
    { value: "Unitario", label: "Unitario" },
    { value: "Kilogramo", label: "Kilogramo" },
    { value: "Litro", label: "Litro" },
    { value: "Metro", label: "Metro" },
    { value: "Caja", label: "Caja" },
    { value: "Paquete", label: "Paquete" },
  ]

  const mockProducts = [
    { id: 1, nombre: "Campera de cuero", stock: -1, precio: 3343434.0, codigo: "CAMP001" },
    { id: 2, nombre: "Zapatillas deportivas", stock: 15, precio: 85000.0, codigo: "ZAP002" },
    { id: 3, nombre: "Pantalón jean", stock: 8, precio: 45000.0, codigo: "PANT003" },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (montoInputRef.current) {
        montoInputRef.current.focus()
        montoInputRef.current.select()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (unidadRef.current && !unidadRef.current.contains(e.target)) {
        setShowUnidadDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setShowProductSearch(false)
    setEsCompraProducto(true)
    setMovimiento({
      ...movimiento,
      productoId: product.id,
      costoUnitario: product.precio.toString(),
      descripcion: `Compra: ${product.nombre}`,
    })
  }

  const esIngreso = type === "ingreso-caja"

  useEffect(() => {
    if (!esIngreso && !esCompraProducto && !movimiento.descripcion) {
      setMovimiento((prev) => ({ ...prev, descripcion: "Varios" }))
    }
  }, [esCompraProducto, esIngreso, movimiento.descripcion])

  const calcularSubtotal = () => {
    const cantidad = Number.parseFloat(movimiento.cantidad) || 0
    const costo = Number.parseFloat(movimiento.costoUnitario) || 0
    return cantidad * costo
  }

  const handleRegistrar = () => {
    if (formActions?.registrarMovimiento) {
      formActions.registrarMovimiento(movimiento)
    }
    closeModal()
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && movimiento.costoUnitario && Number.parseFloat(movimiento.costoUnitario) > 0) {
      handleRegistrar()
    }
  }

  const titulo = esIngreso ? "Nuevo ingreso" : "Nueva compra"
  const descripcionModal = esIngreso
    ? "Registra un ingreso de dinero en caja."
    : "Registra la compra para sumar stock automaticamente."

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
    <div className="w-full max-w-[360px] mx-auto space-y-2" onKeyPress={handleKeyPress}>
      {/* Header */}
      <div className="pb-1.5 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">{titulo}</h3>
        <p className="text-[10px] text-gray-500">{descripcionModal}</p>
      </div>

      <div className="space-y-2">
        {/* TIPO DE EGRESO - Solo para egresos */}
        {!esIngreso && (
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">Tipo de egreso</label>
            <div className="grid grid-cols-2 gap-1.5">
              <label
                className={`relative flex items-start gap-1.5 p-2 border-2 rounded-md cursor-pointer transition-all ${
                  esCompraProducto ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="tipoEgreso"
                  checked={esCompraProducto}
                  onChange={() => setEsCompraProducto(true)}
                  className="mt-0.5 w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-[11px] font-medium text-gray-900 block">Compra de producto</span>
                  <p className="text-[9px] text-gray-500">Suma stock automaticamente</p>
                </div>
              </label>
              <label
                className={`relative flex items-start gap-1.5 p-2 border-2 rounded-md cursor-pointer transition-all ${
                  !esCompraProducto ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="tipoEgreso"
                  checked={!esCompraProducto}
                  onChange={() => {
                    setEsCompraProducto(false)
                    setSelectedProduct(null)
                    setMovimiento({
                      ...movimiento,
                      productoId: "",
                      costoUnitario: "",
                      descripcion: "Varios",
                      cantidad: "1",
                    })
                  }}
                  className="mt-0.5 w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-[11px] font-medium text-gray-900 block">Gasto comun</span>
                  <p className="text-[9px] text-gray-500">Gasto general</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* PRODUCTO - Solo si es compra de producto */}
        {!esIngreso && esCompraProducto && (
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Producto</label>
            <p className="text-[9px] text-gray-500 mb-1">Selecciona el producto que estas comprando.</p>
            {selectedProduct ? (
              <div className="border border-gray-200 rounded-md p-1.5 bg-gray-50">
                <div className="flex items-start gap-1.5">
                  <div className="bg-blue-100 p-1 rounded">
                    <Package className="w-2.5 h-2.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-gray-900">{selectedProduct.nombre}</span>
                      <button
                        onClick={() => {
                          setSelectedProduct(null)
                          setMovimiento({ ...movimiento, productoId: "", costoUnitario: "" })
                        }}
                        className="text-[9px] text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Cambiar
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                      <span>Stock: <span className="font-medium text-gray-700">{selectedProduct.stock}</span></span>
                      <span>|</span>
                      <span>Costo: <span className="font-medium text-gray-700">${selectedProduct.precio.toLocaleString()}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Buscar producto por nombre o codigo..."
                  onFocus={() => setShowProductSearch(true)}
                  onBlur={() => setTimeout(() => setShowProductSearch(false), 200)}
                />
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                {showProductSearch && (
                  <div className="absolute z-10 w-full mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg max-h-28 overflow-y-auto">
                    {mockProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full px-2 py-1.5 text-left hover:bg-gray-50 transition-colors text-[11px] border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-gray-900">{product.nombre}</div>
                        <div className="text-[9px] text-gray-500">Stock: {product.stock} | ${product.precio.toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DESCRIPCION - para ingresos o gastos comunes */}
        {(esIngreso || !esCompraProducto) && (
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Descripcion</label>
            <input
              type="text"
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder={esIngreso ? "Ej: Venta del dia, cobro..." : "Ej: Pago a proveedor, gastos..."}
              value={movimiento.descripcion}
              onChange={(e) => setMovimiento({ ...movimiento, descripcion: e.target.value })}
            />
          </div>
        )}

        {/* CANTIDAD Y COSTO UNITARIO */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Cantidad</label>
            <input
              type="number"
              className={`w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                !esIngreso && !esCompraProducto ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"
              }`}
              placeholder="1"
              value={movimiento.cantidad}
              onChange={(e) => setMovimiento({ ...movimiento, cantidad: e.target.value })}
              step="1"
              min="1"
              disabled={!esIngreso && !esCompraProducto}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Costo por unidad</label>
            <input
              ref={montoInputRef}
              type="number"
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="0"
              value={movimiento.costoUnitario}
              onChange={(e) => setMovimiento({ ...movimiento, costoUnitario: e.target.value })}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* UNIDAD DE MEDIDA Y FECHA */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Unidad de medida</label>
            <CustomSelect
              value={movimiento.unidadMedida}
              options={unidadesOptions}
              onChange={(value) => setMovimiento({ ...movimiento, unidadMedida: value })}
              placeholder="Tipo de unidad"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Fecha y hora</label>
            <input
              type="datetime-local"
              className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
              value={movimiento.fecha}
              onChange={(e) => setMovimiento({ ...movimiento, fecha: e.target.value })}
            />
          </div>
        </div>

        {/* FECHA DE VENCIMIENTO */}
        <div>
          <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Fecha de vencimiento (opcional)</label>
          <input
            type="date"
            className="w-full px-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
            value={movimiento.fechaVencimiento}
            onChange={(e) => setMovimiento({ ...movimiento, fechaVencimiento: e.target.value })}
          />
        </div>

        {/* ACTUALIZAR PRECIOS DE VENTA */}
        <div className="bg-white border border-gray-200 rounded-md p-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="flex-1">
              <span className="text-[11px] font-medium text-gray-900">Actualizar precios de venta</span>
              <p className="text-[9px] text-gray-500 leading-tight">
                Ajusta los precios del producto usando los valores de esta compra.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMovimiento({ ...movimiento, actualizarPrecios: !movimiento.actualizarPrecios })}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors flex-shrink-0 ${
                movimiento.actualizarPrecios ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  movimiento.actualizarPrecios ? "translate-x-3" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        {/* SUBTOTAL */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-600">Subtotal:</span>
            <span className="text-base font-bold text-gray-900">
              ${calcularSubtotal().toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          onClick={handleRegistrar}
          disabled={!movimiento.costoUnitario || Number.parseFloat(movimiento.costoUnitario) <= 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 text-[11px] rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Registrar compra
        </button>
      </div>
    </div>
  )
}

export default MovimientoCajaForm
