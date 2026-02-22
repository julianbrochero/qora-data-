"use client"

import { Search } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const METODOS = ["Efectivo", "Transferencia", "Tarjeta", "MercadoPago"]

const CATEGORIAS_INGRESO = [
  { value: "venta", label: "Venta / Factura" },
  { value: "cobro", label: "Cobro / Abono" },
  { value: "ingreso_extra", label: "Ingreso extra" },
  { value: "otro", label: "Otro" },
]

const CATEGORIAS_EGRESO = [
  { value: "proveedor", label: "Pago a proveedor" },
  { value: "gasto_general", label: "Gasto general" },
  { value: "sueldo", label: "Sueldo / Retiro" },
  { value: "impuesto", label: "Impuesto / Tasa" },
  { value: "compra_stock", label: "Compra de stock" },
  { value: "otro", label: "Otro" },
]

const MovimientoCajaForm = ({ type, formData, formActions, closeModal }) => {
  const esIngreso = type === "ingreso-caja"
  const categorias = esIngreso ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO

  const [monto, setMonto] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [metodo, setMetodo] = useState("Efectivo")
  const [categoria, setCategoria] = useState(esIngreso ? "cobro" : "gasto_general")
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)
  const [busquedaProveedor, setBusquedaProveedor] = useState("")
  const [mostrarDropdownProveedor, setMostrarDropdownProveedor] = useState(false)
  const [cargando, setCargando] = useState(false)

  const montoRef = useRef(null)
  const proveedorRef = useRef(null)
  const proveedoresList = Array.isArray(formData?.proveedores) ? formData.proveedores : []

  // Auto-focus monto al abrir
  useEffect(() => { setTimeout(() => montoRef.current?.focus(), 80) }, [])

  // Click fuera cierra dropdown proveedor
  useEffect(() => {
    const handler = (e) => {
      if (proveedorRef.current && !proveedorRef.current.contains(e.target))
        setMostrarDropdownProveedor(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const proveedoresFiltrados = proveedoresList.filter(p =>
    p.nombre?.toLowerCase().includes(busquedaProveedor.toLowerCase())
  )

  const seleccionarProveedor = (prov) => {
    setProveedorSeleccionado(prov)
    setBusquedaProveedor(prov.nombre)
    setMostrarDropdownProveedor(false)
    if (!descripcion) setDescripcion(`Pago a ${prov.nombre}`)
  }

  const handleRegistrar = async () => {
    const montoNum = parseFloat(monto)
    if (!montoNum || montoNum <= 0) { montoRef.current?.focus(); return }
    if (cargando) return
    setCargando(true)
    try {
      await formActions?.registrarMovimiento?.({
        tipo: esIngreso ? "ingreso" : "egreso",
        description: descripcion.trim()
          || (proveedorSeleccionado ? `Pago a ${proveedorSeleccionado.nombre}` : "")
          || (esIngreso ? "Ingreso manual" : "Egreso manual"),
        monto: montoNum,
        metodo,
        referencia: proveedorSeleccionado ? `proveedor:${proveedorSeleccionado.id}` : categoria,
        fecha: new Date().toISOString(),
      })
      closeModal()
    } finally { setCargando(false) }
  }

  const onKey = (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); handleRegistrar() }
    if (e.key === "Escape") closeModal()
  }

  return (
    <div className="w-full max-w-[360px] mx-auto space-y-1" onKeyDown={onKey}>

      {/* HEADER — igual que PedidoForm */}
      <div className="pb-1 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">
          {esIngreso ? "Nuevo ingreso" : "Nuevo egreso"}
        </h3>
      </div>

      <div className="space-y-1.5">

        {/* CATEGORÍA */}
        <div>
          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Categoría</label>
          <div className="flex flex-wrap gap-1">
            {categorias.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setCategoria(cat.value)
                  if (cat.value !== "proveedor") { setProveedorSeleccionado(null); setBusquedaProveedor("") }
                }}
                className={`px-2 py-1 text-[11px] rounded-md border font-medium transition-colors ${categoria === cat.value
                    ? "bg-white text-blue-600 border-blue-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* PROVEEDOR — solo si categoría = proveedor */}
        {!esIngreso && categoria === "proveedor" && (
          <div ref={proveedorRef} className="relative z-20">
            <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Proveedor</label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-7 pr-2 py-1 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                placeholder="Buscar proveedor..."
                value={busquedaProveedor}
                onChange={e => { setBusquedaProveedor(e.target.value); setMostrarDropdownProveedor(true); setProveedorSeleccionado(null) }}
                onFocus={() => setMostrarDropdownProveedor(true)}
              />
              <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              {mostrarDropdownProveedor && proveedoresFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg max-h-28 overflow-y-auto">
                  {proveedoresFiltrados.map(prov => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => seleccionarProveedor(prov)}
                      className="w-full px-2 py-1.5 text-left hover:bg-gray-50 transition-colors text-[11px] border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-semibold text-gray-900">{prov.nombre}</div>
                      {prov.telefono && <div className="text-[9px] text-gray-500">{prov.telefono}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {proveedorSeleccionado && (
              <span className="text-[9px] text-green-600 font-medium mt-0.5 block">
                Proveedor: {proveedorSeleccionado.nombre}
              </span>
            )}
          </div>
        )}

        {/* DESCRIPCIÓN — placeholder igual que "Notas" en pedido */}
        <div>
          <input
            type="text"
            className="w-full px-2 py-1 text-[10px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            placeholder="Descripción (opcional)..."
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </div>

        {/* MÉTODO */}
        <div>
          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Método de pago</label>
          <div className="grid grid-cols-4 gap-1">
            {METODOS.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodo(m)}
                className={`py-1 text-[10px] rounded-md border font-medium transition-colors ${metodo === m
                    ? "bg-white text-blue-600 border-blue-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* MONTO — igual al bloque Total/Abonado del pedido */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-1.5 space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-gray-700">
              {esIngreso ? "Monto a ingresar:" : "Monto a egresar:"}
            </label>
            <div className="relative w-28">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">$</span>
              <input
                ref={montoRef}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="w-full pl-5 pr-1 py-0.5 text-[11px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-semibold"
                placeholder="0.00"
                value={monto}
                onChange={e => setMonto(e.target.value)}
              />
            </div>
          </div>
          {monto && parseFloat(monto) > 0 && (
            <div className="flex items-center justify-between pt-0.5 border-t border-gray-200">
              <span className="text-[10px] font-medium text-gray-600">Total:</span>
              <span className={`text-sm font-bold ${esIngreso ? "text-green-600" : "text-red-500"}`}>
                {esIngreso ? "+" : "-"}${parseFloat(monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* BOTONES — idénticos a PedidoForm */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={closeModal}
          disabled={cargando}
          className="flex-1 bg-white text-gray-700 px-2.5 py-1.5 text-[11px] rounded-md hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleRegistrar}
          disabled={cargando || !monto || parseFloat(monto) <= 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-[11px] rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cargando ? "Registrando..." : esIngreso ? "Registrar ingreso" : "Registrar egreso"}
        </button>
      </div>

    </div>
  )
}

export default MovimientoCajaForm
