"use client"

import { Package, Search, ChevronDown, X, Trash2, ChevronLeft, ChevronRight, Plus, Pencil, User, Wallet, Calendar } from "lucide-react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"

/* ── Paleta Gestify ── */
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'
const border = 'rgba(48,54,47,.13)'
const surface = '#FAFAFA'
const surface2 = '#F2F2F2'

const inputBase = {
  width: '100%', height: 34, padding: '0 10px',
  fontSize: 12, color: ct1, background: '#fff',
  border: `1px solid ${border}`, borderRadius: 8,
  outline: 'none', fontFamily: "'Inter', sans-serif",
  boxSizing: 'border-box', transition: 'border-color .15s, box-shadow .15s',
}

const labelBase = {
  fontSize: 11, fontWeight: 600, color: ct2,
  marginBottom: 4, display: 'block', letterSpacing: '.01em',
}

const focusStyle = (e) => {
  e.target.style.borderColor = accent
  e.target.style.boxShadow = '0 0 0 3px rgba(51,65,57,.08)'
}
const blurStyle = (e) => {
  e.target.style.borderColor = border
  e.target.style.boxShadow = 'none'
}

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
    const timer = setTimeout(() => { generarBtnRef.current?.focus() }, 300)
    return () => { clearTimeout(timer); if (enterTimerRef.current) clearTimeout(enterTimerRef.current) }
  }, [])

  useEffect(() => {
    return () => { if (enterTimerRef.current) clearTimeout(enterTimerRef.current) }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA"
        if (isInput && e.target !== generarBtnRef.current) return
        e.preventDefault(); e.stopPropagation()
        if (generarBtnRef.current && !generarBtnRef.current.disabled) handleEnterKey()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clienteRef.current && !clienteRef.current.contains(e.target)) setMostrarDropdownCliente(false)
      if (productoRef.current && !productoRef.current.contains(e.target)) setMostrarListaProductos(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente) return clientes
    return clientes.filter(c =>
      c.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
      c.telefono?.includes(busquedaCliente) ||
      c.cuit?.includes(busquedaCliente)
    )
  }, [busquedaCliente, clientes])

  const productosFiltrados = useMemo(() => {
    if (!busquedaProducto) return productos
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()))
    )
  }, [busquedaProducto, productos])

  const items = nuevaFactura?.items || []
  const totalPaginas = Math.ceil(items.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const itemsPaginados = items.slice(indiceInicio, indiceInicio + itemsPorPagina)

  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) setPaginaActual(totalPaginas)
  }, [items.length, totalPaginas, paginaActual])

  const seleccionarCliente = (cliente) => {
    if (setNuevaFactura) setNuevaFactura(prev => ({ ...prev, cliente: cliente.nombre, clienteId: cliente.id }))
    setBusquedaCliente(cliente.nombre)
    setMostrarDropdownCliente(false)
  }

  const agregarProducto = (producto) => {
    const its = nuevaFactura?.items || []
    const existeIndex = its.findIndex(item => item.producto === producto.nombre)
    let itemsActualizados
    if (existeIndex !== -1) {
      itemsActualizados = [...its]
      const nuevaCantidad = itemsActualizados[existeIndex].cantidad + 1
      itemsActualizados[existeIndex] = { ...itemsActualizados[existeIndex], cantidad: nuevaCantidad, subtotal: itemsActualizados[existeIndex].precio * nuevaCantidad }
    } else {
      const nuevoItem = { id: Date.now(), producto: producto.nombre, productoId: producto.id, cantidad: 1, precio: producto.precio, subtotal: producto.precio }
      itemsActualizados = [...its, nuevoItem]
    }
    const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    if (setNuevaFactura) setNuevaFactura(prev => ({ ...prev, items: itemsActualizados, total }))
    setBusquedaProducto(""); setMostrarListaProductos(false)
  }

  const eliminarItem = (index) => {
    const its = nuevaFactura?.items || []
    const itemsActualizados = its.filter((_, i) => i !== index)
    const total = itemsActualizados.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    if (setNuevaFactura) setNuevaFactura(prev => ({ ...prev, items: itemsActualizados, total }))
  }

  const actualizarCantidad = (index, cantidad) => {
    if (cantidad < 1) return
    const its = [...(nuevaFactura?.items || [])]
    its[index] = { ...its[index], cantidad, subtotal: its[index].precio * cantidad }
    const total = its.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    if (setNuevaFactura) setNuevaFactura(prev => ({ ...prev, items: its, total }))
  }

  const actualizarPrecio = (index, nuevoPrecio) => {
    const precio = parseFloat(nuevoPrecio) || 0
    if (precio < 0) return
    const its = [...(nuevaFactura?.items || [])]
    its[index] = { ...its[index], precio, subtotal: precio * its[index].cantidad }
    const total = its.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    if (setNuevaFactura) setNuevaFactura(prev => ({ ...prev, items: its, total }))
  }

  const calcularTotal = () => (nuevaFactura?.items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0)

  const validarFormulario = () => {
    if (!nuevaFactura?.cliente) return { valido: false, mensaje: "Por favor, selecciona o crea un cliente primero" }
    if (items.length === 0) return { valido: false, mensaje: "Por favor, agrega al menos un producto a la factura" }
    return { valido: true, mensaje: "" }
  }

  const handleEnterKey = useCallback(() => {
    if (isProcessing) return
    const validacion = validarFormulario()
    if (!validacion.valido) { alert(validacion.mensaje); return }
    if (enterCount === 1) {
      handleGenerarFactura(); setEnterCount(0)
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current)
    } else {
      setEnterCount(1)
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current)
      enterTimerRef.current = setTimeout(() => setEnterCount(0), 1000)
    }
  }, [generarFactura, nuevaFactura, items.length, isProcessing, enterCount])

  const handleGenerarFactura = async () => {
    try {
      if (generarFactura) await generarFactura()
      closeModal()
    } catch (error) {
      console.error("Error al generar factura:", error)
      setIsProcessing(false)
    }
  }

  const handleButtonClick = () => {
    if (isProcessing) return
    const validacion = validarFormulario()
    if (!validacion.valido) { alert(validacion.mensaje); return }
    handleGenerarFactura()
  }

  const tiposOperacion = [
    { value: "venta-productos", label: "Venta c/Stock", desc: "Descuenta stock" },
    { value: "venta-libre", label: "Venta Libre", desc: "Sin stock" },
    { value: "cotizacion", label: "Cotización", desc: "Presupuesto" },
  ]

  /* ── Dropdown custom ── */
  const CustomSelect = ({ value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef(null)

    useEffect(() => {
      const handleClickOutside = (e) => { if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false) }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const selectedOption = options.find(opt => opt.value === value)

    return (
      <div ref={selectRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            ...inputBase, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', paddingLeft: 10, paddingRight: 10,
          }}
        >
          <span style={{ color: value ? ct1 : ct3, fontSize: 12 }}>{selectedOption?.label || placeholder}</span>
          <ChevronDown size={12} style={{ color: ct3, transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
        </button>
        {isOpen && (
          <div style={{
            position: 'absolute', zIndex: 20, width: '100%', top: '100%', marginTop: 3,
            background: '#fff', border: `1px solid ${border}`, borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,.1)', maxHeight: 140, overflowY: 'auto'
          }}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setIsOpen(false) }}
                style={{
                  width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none',
                  borderBottom: `1px solid ${border}`, cursor: 'pointer', fontSize: 12,
                  background: value === option.value ? accentL : 'transparent',
                  color: value === option.value ? accent : ct2, fontWeight: value === option.value ? 700 : 400,
                  fontFamily: "'Inter', sans-serif", transition: 'background .1s',
                }}
                onMouseEnter={e => { if (value !== option.value) e.currentTarget.style.background = 'rgba(51,65,57,.04)' }}
                onMouseLeave={e => { if (value !== option.value) e.currentTarget.style.background = 'transparent' }}
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
    <div style={{ width: '100%', maxWidth: 380, fontFamily: "'Inter', sans-serif" }}>
      {/* Chip tipo */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '.04em',
          background: 'rgba(51,65,57,.1)', color: accent, border: '1px solid rgba(51,65,57,.2)'
        }}>
          {tipoOperacion === "cotizacion" ? "Nueva cotización" : "Nueva factura"}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── TIPO DE OPERACIÓN ── */}
        <div>
          <label style={labelBase}>Tipo de operación</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {tiposOperacion.map((tipo) => {
              const sel = tipoOperacion === tipo.value
              return (
                <label
                  key={tipo.value}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '8px 4px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    border: sel ? `1.5px solid ${accent}` : `1px solid ${border}`,
                    background: sel ? accentL : surface2,
                    transition: 'all .13s',
                  }}
                >
                  <input type="radio" name="tipoOperacion" checked={sel} onChange={() => cambiarTipoOperacion?.(tipo.value)} style={{ display: 'none' }} />
                  <span style={{ fontSize: 10, fontWeight: sel ? 700 : 500, color: sel ? accent : ct2, lineHeight: 1.3 }}>{tipo.label}</span>
                  <span style={{ fontSize: 9, color: ct3, marginTop: 2 }}>{tipo.desc}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* ── CLIENTE ── */}
        <div ref={clienteRef}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ ...labelBase, marginBottom: 0 }}>Cliente <span style={{ color: '#DC2626' }}>*</span></label>
            <button
              onClick={() => { openModal?.("cliente-rapido"); onClienteAgregado?.() }}
              style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: accent, fontSize: 10, fontWeight: 700 }}
            >
              <Plus size={10} strokeWidth={2.5} /> Nuevo
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <User size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
            <input
              type="text"
              style={{ ...inputBase, paddingLeft: 30, paddingRight: busquedaCliente ? 30 : 10 }}
              placeholder="Buscar cliente..."
              value={busquedaCliente}
              onChange={(e) => { setBusquedaCliente(e.target.value); setMostrarDropdownCliente(true) }}
              onFocus={(e) => { setMostrarDropdownCliente(true); focusStyle(e) }}
              onBlur={blurStyle}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.tagName === "INPUT") {
                  e.preventDefault()
                  if (clientesFiltrados.length > 0 && mostrarDropdownCliente) seleccionarCliente(clientesFiltrados[0])
                }
              }}
            />
            {busquedaCliente && (
              <button
                onClick={() => { setBusquedaCliente(""); setNuevaFactura?.(prev => ({ ...prev, cliente: "", clienteId: null })) }}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: ct3 }}
              >
                <X size={12} />
              </button>
            )}
            {mostrarDropdownCliente && clientesFiltrados.length > 0 && (
              <div style={{
                position: 'absolute', zIndex: 10, width: '100%', top: '100%', marginTop: 3,
                background: '#fff', border: `1px solid ${border}`, borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,.1)', maxHeight: 130, overflowY: 'auto'
              }}>
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => seleccionarCliente(cliente)}
                    style={{
                      width: '100%', padding: '8px 12px', textAlign: 'left', background: 'transparent',
                      border: 'none', borderBottom: `1px solid ${border}`, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = accentL}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{cliente.nombre}</div>
                    <div style={{ fontSize: 10, color: ct3 }}>{cliente.telefono}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {nuevaFactura?.cliente && (
            <span style={{ fontSize: 10, color: accent, fontWeight: 600, marginTop: 4, display: 'block' }}>
              ✓ {nuevaFactura.cliente}
            </span>
          )}
        </div>

        {/* ── AGREGAR PRODUCTO ── */}
        <div ref={productoRef}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ ...labelBase, marginBottom: 0 }}>Agregar producto</label>
            <button
              onClick={() => { openModal?.("producto-rapido"); onProductoAgregado?.() }}
              style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: accent, fontSize: 10, fontWeight: 700 }}
            >
              <Plus size={10} strokeWidth={2.5} /> Nuevo
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
            <input
              type="text"
              style={{ ...inputBase, paddingLeft: 30 }}
              placeholder="Buscar producto..."
              value={busquedaProducto}
              onChange={(e) => { setBusquedaProducto(e.target.value); setMostrarListaProductos(true) }}
              onFocus={(e) => { setMostrarListaProductos(true); focusStyle(e) }}
              onBlur={blurStyle}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.tagName === "INPUT") {
                  e.preventDefault()
                  if (productosFiltrados.length > 0 && mostrarListaProductos) agregarProducto(productosFiltrados[0])
                }
              }}
            />
            {mostrarListaProductos && productosFiltrados.length > 0 && (
              <div style={{
                position: 'absolute', zIndex: 10, width: '100%', top: '100%', marginTop: 3,
                background: '#fff', border: `1px solid ${border}`, borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,.1)', maxHeight: 130, overflowY: 'auto'
              }}>
                {productosFiltrados.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => agregarProducto(producto)}
                    style={{
                      width: '100%', padding: '8px 12px', textAlign: 'left', background: 'transparent',
                      border: 'none', borderBottom: `1px solid ${border}`, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = accentL}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{producto.nombre}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>${producto.precio?.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 10, color: ct3 }}>Stock: {producto.stock} | {producto.codigo}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ITEMS ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ ...labelBase, marginBottom: 0 }}>Productos ({items.length})</label>
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}
                  style={{ background: 'none', border: 'none', cursor: paginaActual === 1 ? 'not-allowed' : 'pointer', color: ct3, opacity: paginaActual === 1 ? .4 : 1, display: 'flex' }}>
                  <ChevronLeft size={12} />
                </button>
                <span style={{ fontSize: 10, color: ct3 }}>{paginaActual}/{totalPaginas}</span>
                <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}
                  style={{ background: 'none', border: 'none', cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer', color: ct3, opacity: paginaActual === totalPaginas ? .4 : 1, display: 'flex' }}>
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
          <div style={{ border: `1px solid ${border}`, borderRadius: 8, minHeight: 80, overflow: 'hidden', background: surface }}>
            {items.length > 0 ? (
              <div>
                {itemsPaginados.map((item, index) => {
                  const indiceReal = indiceInicio + index
                  const estaEditando = editandoPrecio === indiceReal
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      borderBottom: `1px solid ${border}`, background: '#fff'
                    }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={11} strokeWidth={2} style={{ color: accent }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ct1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.producto}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {estaEditando ? (
                            <input
                              type="number"
                              style={{ width: 64, height: 20, padding: '0 4px', fontSize: 10, border: `1px solid ${accent}`, borderRadius: 4, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                              value={item.precio}
                              onChange={(e) => actualizarPrecio(indiceReal, e.target.value)}
                              onBlur={() => setEditandoPrecio(null)}
                              onKeyDown={(e) => { if (e.key === "Enter") setEditandoPrecio(null) }}
                              autoFocus step="0.01"
                            />
                          ) : (
                            <span style={{ fontSize: 10, color: ct3 }}>${item.precio?.toLocaleString()}</span>
                          )}
                          <button onClick={() => setEditandoPrecio(indiceReal)} title="Editar precio"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: ct3, display: 'flex', padding: 1 }}>
                            <Pencil size={9} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <button onClick={() => actualizarCantidad(indiceReal, item.cantidad - 1)}
                          style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${border}`, borderRadius: 4, background: surface2, color: ct2, cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>−</button>
                        <span style={{ width: 20, textAlign: 'center', fontSize: 11, fontWeight: 700, color: ct1 }}>{item.cantidad}</span>
                        <button onClick={() => actualizarCantidad(indiceReal, item.cantidad + 1)}
                          style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${border}`, borderRadius: 4, background: surface2, color: ct2, cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>+</button>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: ct1, minWidth: 50, textAlign: 'right' }}>
                        ${item.subtotal?.toLocaleString()}
                      </div>
                      <button onClick={() => eliminarItem(indiceReal)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(180,60,60,.6)', display: 'flex', padding: 2, borderRadius: 4, transition: 'color .12s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c62828'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(180,60,60,.6)'}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 11, color: ct3 }}>No hay productos agregados</p>
              </div>
            )}
          </div>
        </div>

        {/* ── MÉTODO DE PAGO Y FECHA ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelBase}>Método de pago</label>
            <CustomSelect
              value={nuevaFactura?.metodoPago || ""}
              options={[
                { value: "Efectivo", label: "Efectivo" },
                { value: "Tarjeta", label: "Tarjeta" },
                { value: "Transferencia", label: "Transferencia" },
                { value: "MercadoPago", label: "MercadoPago" },
              ]}
              onChange={(value) => setNuevaFactura?.(prev => ({ ...prev, metodoPago: value }))}
              placeholder="Seleccionar..."
            />
          </div>
          <div>
            <label style={labelBase}>Fecha</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: ct3, zIndex: 1 }} />
              <input
                type="date"
                style={{ ...inputBase, paddingLeft: 26 }}
                value={nuevaFactura?.fecha || new Date().toISOString().split("T")[0]}
                onChange={(e) => setNuevaFactura?.(prev => ({ ...prev, fecha: e.target.value }))}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
          </div>
        </div>

        {/* ── TOTAL ── */}
        <div style={{ borderRadius: 10, padding: '10px 14px', background: 'rgba(51,65,57,.05)', border: '1px solid rgba(51,65,57,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: ct3 }}>Total de la factura</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: ct1 }}>
            ${calcularTotal().toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* ── BOTONES ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={closeModal}
            style={{
              flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600,
              color: ct2, background: 'transparent', border: `1px solid ${border}`,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all .13s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancelar
          </button>
          <button
            ref={generarBtnRef}
            onClick={handleButtonClick}
            disabled={items.length === 0 || !nuevaFactura?.cliente || isProcessing}
            tabIndex={0}
            style={{
              flex: 2, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 700,
              color: '#0A1A0E', background: '#4ADE80', border: '1px solid #4ADE80',
              cursor: (items.length === 0 || !nuevaFactura?.cliente || isProcessing) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: "'Inter', sans-serif", transition: 'all .13s',
              opacity: (items.length === 0 || !nuevaFactura?.cliente || isProcessing) ? .45 : 1,
            }}
            onMouseEnter={e => { if (!(items.length === 0 || !nuevaFactura?.cliente || isProcessing)) e.currentTarget.style.opacity = '.88' }}
            onMouseLeave={e => { if (!(items.length === 0 || !nuevaFactura?.cliente || isProcessing)) e.currentTarget.style.opacity = '1' }}
          >
            {isProcessing
              ? "Procesando..."
              : tipoOperacion === "cotizacion"
                ? "Generar cotización"
                : "Generar factura"}
            {!isProcessing && <kbd style={{ fontSize: 9, padding: '1.5px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>↵</kbd>}
          </button>
        </div>

        {/* Indicador doble Enter */}
        {enterCount === 1 && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 10, color: accent, fontWeight: 600 }}>
              Presiona Enter de nuevo para confirmar
            </span>
          </div>
        )}
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
    </div>
  )
}

export default FacturaForm
