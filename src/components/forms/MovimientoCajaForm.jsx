"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, Tag, DollarSign, Wallet, FileText, CheckCircle, Store, Box, Briefcase, Zap } from "lucide-react"

/* ══════════════════════════════════════════════
   PALETA GESTIFY
══════════════════════════════════════════════ */
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const border = 'rgba(48,54,47,.13)'
const accentL = 'rgba(51,65,57,.08)'
const inputBase = {
  width: '100%', height: 36, padding: '0 12px',
  fontSize: 12, color: ct1, background: '#fff',
  border: `1px solid ${border}`, borderRadius: 8,
  outline: 'none', fontFamily: "'Inter', sans-serif",
  transition: 'border-color .15s',
}

const labelBase = {
  fontSize: 11, fontWeight: 600, color: ct2,
  marginBottom: 5, display: 'block', letterSpacing: '.01em',
}

const METODOS = ["Efectivo", "Transferencia", "Tarjeta", "MercadoPago"]

const CATEGORIAS_INGRESO = [
  { value: "venta", label: "Venta / Factura", icon: Store },
  { value: "cobro", label: "Cobro / Abono", icon: Wallet },
  { value: "ingreso_extra", label: "Ingreso extra", icon: Zap },
  { value: "otro", label: "Otro", icon: FileText },
]

const CATEGORIAS_EGRESO = [
  { value: "proveedor", label: "Pago a proveedor", icon: Store },
  { value: "gasto_general", label: "Gasto general", icon: Briefcase },
  { value: "compra_stock", label: "Compra de stock", icon: Box },
  { value: "sueldo", label: "Sueldo / Retiro", icon: Wallet },
  { value: "impuesto", label: "Impuesto / Tasa", icon: FileText },
  { value: "otro", label: "Otro", icon: Zap },
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

  useEffect(() => { setTimeout(() => montoRef.current?.focus(), 80) }, [])

  useEffect(() => {
    const handler = (e) => {
      if (proveedorRef.current && !proveedorRef.current.contains(e.target))
        setMostrarDropdownProveedor(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const proveedoresFiltrados = proveedoresList.filter(p => p.nombre?.toLowerCase().includes(busquedaProveedor.toLowerCase()))

  const seleccionarProveedor = (prov) => {
    setProveedorSeleccionado(prov)
    setBusquedaProveedor(prov.nombre)
    setMostrarDropdownProveedor(false)
    if (!descripcion) setDescripcion(`Pago a ${prov.nombre}`)
  }

  const handleRegistrar = async (e) => {
    if (e) e.preventDefault()
    const montoNum = parseFloat(monto)
    if (!montoNum || montoNum <= 0) { montoRef.current?.focus(); return }
    if (cargando) return
    setCargando(true)
    try {
      await formActions?.registrarMovimiento?.({
        tipo: esIngreso ? "ingreso" : "egreso",
        description: descripcion.trim() || (proveedorSeleccionado ? `Pago a ${proveedorSeleccionado.nombre}` : "") || (esIngreso ? "Ingreso manual" : "Egreso manual"),
        monto: montoNum,
        metodo,
        referencia: proveedorSeleccionado ? `proveedor:${proveedorSeleccionado.id}` : categoria,
        fecha: new Date().toISOString(),
      })
      closeModal()
    } finally { setCargando(false) }
  }

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault()
      nextRef?.current ? nextRef.current.focus() : handleRegistrar()
    }
    if (e.key === "Escape") closeModal()
  }

  const focusStyle = (e) => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,57,.08)' }
  const blurStyle = (e) => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }

  return (
    <div style={{ width: '100%', maxWidth: 400, fontFamily: "'Inter', sans-serif" }} onKeyDown={handleKeyDown}>
      {/* chip tipo */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', background: esIngreso ? 'rgba(6,95,70,.1)' : 'rgba(153,27,27,.1)', color: esIngreso ? '#065F46' : '#991B1B', border: `1px solid ${esIngreso ? 'rgba(6,95,70,.2)' : 'rgba(153,27,27,.2)'}` }}>
          {esIngreso ? 'Nuevo Ingreso' : 'Nuevo Egreso'}
        </span>
      </div>

      <form onSubmit={handleRegistrar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* MONTO */}
        <div>
          <label style={labelBase}>Monto <span style={{ color: '#DC2626' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: ct3, fontSize: 14, fontWeight: 600 }}>$</span>
            <input ref={montoRef} type="number" inputMode="decimal" step="0.01" min="0" required value={monto} placeholder="0.00"
              onChange={e => setMonto(e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle}
              style={{ ...inputBase, paddingLeft: 26, fontSize: 15, fontWeight: 700, color: esIngreso ? '#065F46' : '#991B1B' }} />
          </div>
        </div>

        {/* CATEGORÍA */}
        <div>
          <label style={labelBase}>Categoría</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {categorias.map(cat => {
              const sel = categoria === cat.value
              return (
                <button key={cat.value} type="button" onClick={() => { setCategoria(cat.value); if (cat.value !== "proveedor") { setProveedorSeleccionado(null); setBusquedaProveedor("") } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, fontSize: 11, fontWeight: sel ? 700 : 600, border: `1px solid ${sel ? accent : border}`, background: sel ? accentL : '#fff', color: sel ? accent : ct3, cursor: 'pointer', transition: 'all .13s', textAlign: 'left' }}>
                  <cat.icon size={13} strokeWidth={sel ? 2.5 : 2} style={{ color: sel ? accent : 'rgba(48,54,47,.4)' }} />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* PROVEEDOR (solo egreso) */}
        {!esIngreso && categoria === "proveedor" && (
          <div ref={proveedorRef} style={{ position: 'relative', zIndex: 10 }}>
            <label style={labelBase}>Proveedor <span style={{ color: '#DC2626' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input type="text" value={busquedaProveedor} placeholder="Buscar proveedor..."
                onChange={e => { setBusquedaProveedor(e.target.value); setMostrarDropdownProveedor(true); setProveedorSeleccionado(null) }}
                onFocus={(e) => { focusStyle(e); setMostrarDropdownProveedor(true) }} onBlur={blurStyle}
                style={{ ...inputBase, paddingLeft: 30 }} />

              {mostrarDropdownProveedor && proveedoresFiltrados.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: `1px solid ${border}`, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.1)', maxHeight: 180, overflowY: 'auto', zIndex: 20 }}>
                  {proveedoresFiltrados.map(prov => (
                    <button key={prov.id} type="button" onClick={() => seleccionarProveedor(prov)}
                      style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: `1px solid ${border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(48,54,47,.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: ct1 }}>{prov.nombre}</span>
                      {prov.telefono && <span style={{ fontSize: 10, color: ct3 }}>{prov.telefono}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DESCRIPCIÓN */}
        <div>
          <label style={labelBase}>Descripción <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span></label>
          <div style={{ position: 'relative' }}>
            <FileText size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
            <input type="text" value={descripcion} placeholder="Detalles del movimiento..."
              onChange={e => setDescripcion(e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle}
              style={{ ...inputBase, paddingLeft: 30 }} />
          </div>
        </div>

        {/* MÉTODO (Chips) */}
        <div>
          <label style={labelBase}>Método de pago</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {METODOS.map(m => {
              const sel = metodo === m
              return (
                <button key={m} type="button" onClick={() => setMetodo(m)}
                  style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${sel ? accent : border}`, background: sel ? accent : '#fff', color: sel ? '#fff' : ct2, cursor: 'pointer', transition: 'all .13s' }}>
                  {m}
                </button>
              )
            })}
          </div>
        </div>

        {/* BOTONES */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={closeModal} disabled={cargando}
            style={{ flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600, color: ct2, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer', transition: 'all .13s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Cancelar
          </button>
          <button type="submit" disabled={cargando || !monto || parseFloat(monto) <= 0 || (!esIngreso && categoria === "proveedor" && !proveedorSeleccionado)}
            style={{ flex: 2, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#0A1A0E', background: '#4ADE80', border: '1px solid #4ADE80', cursor: (cargando || !monto || parseFloat(monto) <= 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .13s', opacity: (cargando || !monto || parseFloat(monto) <= 0) ? .5 : 1 }}
            onMouseEnter={e => { if (!cargando && monto && parseFloat(monto) > 0) e.currentTarget.style.opacity = '.9' }} onMouseLeave={e => { if (!cargando && monto && parseFloat(monto) > 0) e.currentTarget.style.opacity = '1' }}>
            {cargando ? 'Registrando...' : <><CheckCircle size={13} strokeWidth={2.5} /> {esIngreso ? 'Registrar ingreso' : 'Registrar egreso'}</>}
            <kbd style={{ fontSize: 9, padding: '1.5px 5px', background: 'rgba(0,0,0,.08)', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>↵</kbd>
          </button>
        </div>
      </form>
    </div>
  )
}

export default MovimientoCajaForm
