"use client"

import { Package, Search, Plus, Trash2, UserCheck, Pencil, Check, X, ChevronDown, Calendar, CheckCircle } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "react-toastify"

/* ──────────────────────────────────────────────
   PALETA (igual al módulo Pedidos)
   bg:      #F5F5F5
   surface: #FAFAFA
   header:  #282A28
   accent:  #334139
   lime:    #DCED31
   ct1:     #1e2320
   ct2:     #30362F
   ct3:     #8B8982
   border:  rgba(48,54,47,.13)
────────────────────────────────────────────── */

const PedidoForm = ({ type, pedido, clientes = [], productos = [], formActions, closeModal, openModal }) => {
  const isEdit = type === "editar-pedido"

  // ── colores ──
  const bg = '#F5F5F5'
  const surface = '#FAFAFA'
  const surface2 = '#F2F2F2'
  const border = 'rgba(48,54,47,.13)'
  const ct1 = '#1e2320'
  const ct2 = '#30362F'
  const ct3 = '#8B8982'
  const accent = '#334139'
  const accentL = 'rgba(51,65,57,.08)'
  const lime = '#DCED31'

  // ── refs ──
  const clienteRef = useRef(null)
  const productoRef = useRef(null)

  // ── estado del formulario ──
  const [pedidoData, setPedidoData] = useState(() => {
    if (pedido?.savedState) {
      const s = { ...pedido.savedState, items: (pedido.savedState.items || []).map(i => ({ ...i })) }
      if (pedido.newClient) { s.clienteId = pedido.newClient.id; s.clienteNombre = pedido.newClient.nombre }
      if (pedido.newProduct) {
        const prod = pedido.newProduct
        const exists = s.items.find(i => i.productoId === prod.id)
        if (exists) { exists.cantidad += 1; exists.subtotal = exists.precio * exists.cantidad }
        else s.items.push({ id: Date.now(), productoId: prod.id, producto: prod.nombre, precio: prod.precio, cantidad: 1, subtotal: prod.precio })
      }
      return s
    }
    return {
      clienteId: pedido?.cliente_id || "",
      clienteNombre: pedido?.cliente_nombre || "",
      fechaPedido: pedido?.fecha_pedido?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      fechaEntregaEstimada: pedido?.fecha_entrega_estimada?.slice(0, 10) || "",
      estado: pedido?.estado || "pendiente",
      notas: pedido?.notas || "",
      items: pedido?.items || [],
      montoPagado: pedido?.monto_abonado || "",
    }
  })

  const [busCliente, setBusCliente] = useState(pedido?.cliente_nombre || "")
  const [dropCliente, setDropCliente] = useState(false)
  const [busProducto, setBusProducto] = useState("")
  const [dropProducto, setDropProducto] = useState(false)
  const [editPrecioId, setEditPrecioId] = useState(null)
  const [priceDraft, setPriceDraft] = useState("")

  const [isProcessing, setIsProcessing] = useState(false)
  const [alertaExito, setAlertaExito] = useState(null) // { mensaje: string }
  const generarBtnRef = useRef(null)

  // cerrar dropdowns al clic afuera
  useEffect(() => {
    const fn = e => {
      if (clienteRef.current && !clienteRef.current.contains(e.target)) setDropCliente(false)
      if (productoRef.current && !productoRef.current.contains(e.target)) setDropProducto(false)
    }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  const clientesFiltrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busCliente.toLowerCase()) ||
    c.telefono?.includes(busCliente)
  )
  const productosFiltrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busProducto.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(busProducto.toLowerCase())
  )

  // ── helpers ──
  const seleccionarCliente = c => {
    setPedidoData(d => ({ ...d, clienteId: c.id, clienteNombre: c.nombre }))
    setBusCliente(c.nombre)
    setDropCliente(false)
  }

  const agregarProducto = p => {
    setPedidoData(d => {
      const existe = d.items.find(i => i.productoId === p.id)
      if (existe) return { ...d, items: d.items.map(i => i.productoId === p.id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio } : i) }
      return { ...d, items: [...d.items, { id: Date.now(), productoId: p.id, producto: p.nombre, precio: p.precio, cantidad: 1, subtotal: p.precio }] }
    })
    setBusProducto("")
    setDropProducto(false)
  }

  const actualizarCantidad = (idx, n) => {
    if (n < 1) { setPedidoData(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) })); return }
    setPedidoData(d => { const it = [...d.items]; it[idx] = { ...it[idx], cantidad: n, subtotal: it[idx].precio * n }; return { ...d, items: it } })
  }

  const commitPrecio = id => {
    const idx = pedidoData.items.findIndex(i => i.id === id)
    if (idx >= 0) {
      const precio = parseFloat(priceDraft) || 0
      setPedidoData(d => { const it = [...d.items]; it[idx] = { ...it[idx], precio, subtotal: precio * it[idx].cantidad }; return { ...d, items: it } })
    }
    setEditPrecioId(null); setPriceDraft("")
  }

  const calcTotal = () => pedidoData.items.reduce((s, i) => s + i.precio * i.cantidad, 0)

  const fNum = n => (parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const fMon = n => (parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const estadosCfg = {
    pendiente: { label: 'Pendiente', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
    preparando: { label: 'Preparando', bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
    enviado: { label: 'Enviado', bg: '#E0E7FF', color: '#3730A3', border: '#A5B4FC' },
    entregado: { label: 'Entregado', bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
    cancelado: { label: 'Cancelado', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
  }
  const eCfg = estadosCfg[pedidoData.estado] || estadosCfg.pendiente

  const handleNuevoCliente = () => openModal?.("nuevo-cliente", { onSuccess: c => openModal("nuevo-pedido", { savedState: pedidoData, newClient: c }) })
  const handleNuevoProducto = () => openModal?.("nuevo-producto", { onSuccess: p => openModal("nuevo-pedido", { savedState: pedidoData, newProduct: p }) })

  const mostrarAlertaYCerrar = (msg) => {
    setAlertaExito(msg)
    setTimeout(() => { setAlertaExito(null); closeModal() }, 1800)
  }

  const handleGuardar = async () => {
    setIsProcessing(true)
    const final = { ...pedidoData, total: calcTotal() }
    if (isEdit) {
      if (!formActions?.actualizarPedido) { setIsProcessing(false); return }
      try {
        const r = await formActions.actualizarPedido(pedido.id, final)
        if (r?.success) { formActions.recargarTodosLosDatos?.(); mostrarAlertaYCerrar(r.mensaje || '¡Venta actualizada correctamente!') }
        else toast.error('Error: ' + (r?.mensaje || 'Desconocido'))
      } catch (e) { toast.error('Error: ' + e.message) }
      setIsProcessing(false)
      return
    }
    if (formActions?.agregarPedidoSolo) {
      formActions.agregarPedidoSolo(final)
        .then(r => { if (r?.success) { formActions.recargarTodosLosDatos?.(); mostrarAlertaYCerrar(r.mensaje || '¡Venta creada exitosamente!') } else toast.error('Error: ' + (r?.mensaje || '')) })
        .catch(e => toast.error('Error: ' + e.message))
        .finally(() => setIsProcessing(false))
    } else if (formActions?.guardarVenta) {
      formActions.guardarVenta(final, 'pedido')
      setIsProcessing(false)
      closeModal()
    } else {
      setIsProcessing(false)
      closeModal()
    }
  }

  const handleEnterKey = useCallback(() => {
    if (isProcessing) return
    if (!pedidoData.clienteId || pedidoData.items.length === 0) {
      toast.error('Completa los campos obligatorios del pedido')
      return
    }
    handleGuardar()
  }, [pedidoData, isProcessing])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        e.stopPropagation()
        if (generarBtnRef.current && !generarBtnRef.current.disabled) handleEnterKey()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleEnterKey])

  // ── estilos helpers ──
  const inp = {
    width: '100%', height: 34, padding: '0 11px', borderRadius: 8,
    border: `1px solid ${border}`, background: surface, outline: 'none',
    fontSize: 12, fontWeight: 500, color: ct1, fontFamily: 'Inter,sans-serif',
    transition: 'border-color .13s',
  }

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased', width: '100%' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, marginBottom: alertaExito ? 10 : 14, borderBottom: `1px solid ${border}` }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: '#282A28', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Package size={15} strokeWidth={2} style={{ color: '#DCED31' }} />
        </div>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, color: ct3, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 1 }}>
            {isEdit ? 'Modificar venta' : 'Nueva venta'}
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: ct1, letterSpacing: '-.03em', lineHeight: 1, margin: 0 }}>
            {isEdit ? 'Editar Venta' : 'Crear Venta'}
          </h3>
        </div>
      </div>

      {/* ── ALERTA ÉXITO ── */}
      {alertaExito && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          borderLeft: '4px solid #22c55e',
          background: 'rgba(34,197,94,0.08)',
          borderRadius: '0 8px 8px 0',
          padding: '10px 14px',
          marginBottom: 14,
          animation: 'fadeSlideIn .25s ease',
        }}>
          <CheckCircle size={16} strokeWidth={2.5} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>{alertaExito}</span>
        </div>
      )}

      <div style={{ padding: '0 2px' }}>

        {/* ── CLIENTE ── */}
        <div ref={clienteRef} style={{ position: 'relative', marginBottom: 10, zIndex: 30 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 5 }}>Cliente</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3, pointerEvents: 'none' }}>
              <Search size={12} strokeWidth={2} />
            </div>
            <input
              style={{ ...inp, paddingLeft: 30, paddingRight: 36 }}
              placeholder="Buscar cliente..."
              value={busCliente}
              onChange={e => { setBusCliente(e.target.value); setDropCliente(true) }}
              onFocus={() => setDropCliente(true)}
            />
            <button type="button" onClick={handleNuevoCliente}
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: accent, padding: 4, display: 'flex', alignItems: 'center' }}>
              <Plus size={14} strokeWidth={2.5} />
            </button>
            {dropCliente && clientesFiltrados.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: surface, border: `1px solid ${border}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', zIndex: 40, maxHeight: 160, overflowY: 'auto' }}>
                {clientesFiltrados.map(c => (
                  <button key={c.id} type="button" onClick={() => seleccionarCliente(c)}
                    style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid ${border}`, transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = accentL}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{c.nombre}</div>
                    {c.telefono && <div style={{ fontSize: 10, color: ct3, marginTop: 1 }}>{c.telefono}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {pedidoData.clienteNombre && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <UserCheck size={11} strokeWidth={2} style={{ color: accent }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: accent }}>{pedidoData.clienteNombre}</span>
            </div>
          )}
        </div>

        {/* ── FECHAS Y ESTADO ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 5 }}>Fecha</label>
            <div style={{ position: 'relative' }}>
              <input type="date" className="gestify-date-input" style={{ ...inp, fontSize: 11, paddingRight: 30 }} value={pedidoData.fechaPedido}
                onChange={e => setPedidoData(d => ({ ...d, fechaPedido: e.target.value }))} />
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ct3, display: 'flex' }}>
                <Calendar size={13} strokeWidth={2} />
              </div>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 5 }}>Entrega</label>
            <div style={{ position: 'relative' }}>
              <input type="date" className="gestify-date-input" style={{ ...inp, fontSize: 11, paddingRight: 30 }} value={pedidoData.fechaEntregaEstimada}
                onChange={e => setPedidoData(d => ({ ...d, fechaEntregaEstimada: e.target.value }))} />
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ct3, display: 'flex' }}>
                <Calendar size={13} strokeWidth={2} />
              </div>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 5 }}>Estado</label>
            <select
              value={pedidoData.estado}
              onChange={e => setPedidoData(d => ({ ...d, estado: e.target.value }))}
              style={{ ...inp, appearance: 'none', cursor: 'pointer', background: `${eCfg.bg}`, color: eCfg.color, border: `1px solid ${eCfg.border}`, fontWeight: 700, padding: '0 8px' }}>
              {Object.entries(estadosCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── BUSCAR PRODUCTO ── */}
        <div ref={productoRef} style={{ position: 'relative', marginBottom: 8, zIndex: 20 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 5 }}>Productos</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3, pointerEvents: 'none' }}>
              <Package size={12} strokeWidth={2} />
            </div>
            <input
              style={{ ...inp, paddingLeft: 30, paddingRight: 36 }}
              placeholder="Agregar producto al pedido..."
              value={busProducto}
              onChange={e => { setBusProducto(e.target.value); setDropProducto(true) }}
              onFocus={() => setDropProducto(true)}
            />
            <button type="button" onClick={handleNuevoProducto}
              style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: accent, padding: 4, display: 'flex', alignItems: 'center' }}>
              <Plus size={14} strokeWidth={2.5} />
            </button>
            {dropProducto && productosFiltrados.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: surface, border: `1px solid ${border}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', zIndex: 40, maxHeight: 160, overflowY: 'auto' }}>
                {productosFiltrados.map(p => (
                  <button key={p.id} type="button" onClick={() => agregarProducto(p)}
                    style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = accentL}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{p.nombre}</div>
                      <div style={{ fontSize: 10, color: ct3, marginTop: 1 }}>{p.codigo} · Stock: {p.stock}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>${fNum(p.precio)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── LISTA DE ITEMS ── */}
        <div style={{ border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 10, background: surface }}>
          {/* cabecera */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 28px', gap: 6, padding: '6px 10px', background: surface2, borderBottom: `1px solid ${border}` }}>
            {['Producto', 'Cant.', 'Total', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: ct3, textAlign: i === 1 || i === 2 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* items o vacío */}
          <div style={{ minHeight: 64, maxHeight: 200, overflowY: 'auto' }}>
            {pedidoData.items.length > 0 ? pedidoData.items.map((item, idx) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 28px', gap: 6, padding: '7px 10px', borderBottom: `1px solid ${border}`, alignItems: 'center' }}>

                {/* nombre + precio editable */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: ct1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.producto}</div>
                  {editPrecioId === item.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: ct3 }}>$</span>
                      <input autoFocus type="number" value={priceDraft} step="0.01"
                        onChange={e => setPriceDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitPrecio(item.id) } if (e.key === 'Escape') { setEditPrecioId(null) } }}
                        style={{ width: 70, height: 20, border: `1px solid ${border}`, borderRadius: 4, fontSize: 11, fontWeight: 600, color: ct1, padding: '0 4px', outline: 'none', background: surface2 }} />
                      <button type="button" onClick={() => commitPrecio(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: accent, padding: 0, display: 'flex' }}><Check size={11} strokeWidth={2.5} /></button>
                      <button type="button" onClick={() => setEditPrecioId(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: ct3, padding: 0, display: 'flex' }}><X size={11} strokeWidth={2.5} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                      <span style={{ fontSize: 10, color: ct3 }}>${fNum(item.precio)}</span>
                      <button type="button" onClick={() => { setEditPrecioId(item.id); setPriceDraft(String(item.precio || "")) }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: ct3, padding: 0, display: 'flex' }} title="Editar precio">
                        <Pencil size={9} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>

                {/* cantidad */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <button type="button" onClick={() => actualizarCantidad(idx, item.cantidad - 1)}
                    style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${border}`, background: surface2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: ct2, lineHeight: 1 }}>−</button>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ct1, minWidth: 16, textAlign: 'center' }}>{item.cantidad}</span>
                  <button type="button" onClick={() => actualizarCantidad(idx, item.cantidad + 1)}
                    style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${border}`, background: surface2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: ct2, lineHeight: 1 }}>+</button>
                </div>

                {/* subtotal */}
                <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: ct1 }}>${fNum(item.precio * item.cantidad)}</div>

                {/* eliminar */}
                <button type="button" onClick={() => setPedidoData(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) }))}
                  style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(180,60,60,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, transition: 'all .12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,60,60,.08)'; e.currentTarget.style.color = '#c62828' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(180,60,60,.6)' }}>
                  <Trash2 size={11} strokeWidth={2} />
                </button>
              </div>
            )) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 64, gap: 4 }}>
                <Package size={18} strokeWidth={1.5} style={{ color: border }} />
                <span style={{ fontSize: 11, color: ct3 }}>Agrega productos para comenzar</span>
              </div>
            )}
          </div>
        </div>

        {/* ── NOTAS ── */}
        <input type="text" style={{ ...inp, marginBottom: 10 }}
          placeholder="Notas u observaciones (opcional)..."
          value={pedidoData.notas}
          onChange={e => setPedidoData(d => ({ ...d, notas: e.target.value }))} />

        {/* ── TOTAL + PAGO ── */}
        <div style={{ background: surface2, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3 }}>Total General</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: ct1, letterSpacing: '-.04em' }}>${fMon(calcTotal())}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${border}` }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: ct2 }}>Pago / Adelanto inicial:</span>
            <div style={{ position: 'relative', width: 120 }}>
              <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 500, color: ct3 }}>$</span>
              <input type="number" placeholder="0.00" step="0.01"
                style={{ ...inp, width: 120, paddingLeft: 20, textAlign: 'right', paddingRight: 8, fontSize: 12 }}
                value={pedidoData.montoPagado}
                onChange={e => setPedidoData(d => ({ ...d, montoPagado: e.target.value }))} />
            </div>
          </div>
          {parseFloat(pedidoData.montoPagado) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#92400E' }}>Saldo pendiente</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>${fMon(Math.max(0, calcTotal() - (parseFloat(pedidoData.montoPagado) || 0)))}</span>
            </div>
          )}
        </div>

        {/* ── BOTONES ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={closeModal}
            style={{ flex: 1, height: 38, borderRadius: 10, border: `1px solid ${border}`, background: surface, color: ct2, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .13s', fontFamily: 'Inter,sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = surface2}
            onMouseLeave={e => e.currentTarget.style.background = surface}>
            Cancelar
          </button>
          <button type="button"
            ref={generarBtnRef}
            onClick={() => { if (pedidoData.clienteId && pedidoData.items.length > 0) handleGuardar() }}
            disabled={!pedidoData.clienteId || pedidoData.items.length === 0 || isProcessing}
            style={{
              flex: 2, height: 38, borderRadius: 10, border: '2px solid #282A28',
              background: '#DCED31', color: '#282A28',
              fontSize: 12, fontWeight: 800, cursor: (pedidoData.clienteId && pedidoData.items.length > 0 && !isProcessing) ? 'pointer' : 'not-allowed',
              opacity: (pedidoData.clienteId && pedidoData.items.length > 0 && !isProcessing) ? 1 : .45,
              transition: 'all .13s', fontFamily: 'Inter,sans-serif', letterSpacing: '.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
            {isProcessing ? "Procesando..." : (isEdit ? '✓ Guardar Cambios' : '+ Crear Pedido')}
            {!isProcessing && <kbd style={{ fontSize: 9, padding: '1.5px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>Ctrl+↵</kbd>}
          </button>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        /* Modificar el input date para ocultar el calendario nativo y expandir su área clickeable */
        .gestify-date-input::-webkit-calendar-picker-indicator { 
            position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
            width: auto; height: auto; color: transparent; background: transparent; 
            cursor: pointer; z-index: 10;
        }
        
        /* Ocultar las flechas de spinner nativas en Chrome/Edge y Firefox */
        input[type="number"]::-webkit-inner-spin-button, 
        input[type="number"]::-webkit-outer-spin-button { 
            -webkit-appearance: none; margin: 0; 
        }
        input[type="number"] { -moz-appearance: textfield; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default PedidoForm