"use client"

import { Package, Search, Plus, Trash2, UserCheck, Check, X, Calendar, CheckCircle, User } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "react-toastify"

/* ── paleta ─────────────────────────────────── */
const surface  = '#FAFAFA'
const surface2 = '#F2F2F2'
const border   = 'rgba(48,54,47,.13)'
const ct1      = '#1e2320'
const ct2      = '#30362F'
const ct3      = '#8B8982'
const accent   = '#334139'
const accentL  = 'rgba(51,65,57,.08)'
const lime     = '#DCED31'

const PREF_KEY    = 'gestify_pedido_cliente_activo'
const ITEMS_PER_PAGE = 3

const estadosCfg = {
  pendiente:  { label: 'Pendiente',  bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  preparando: { label: 'Preparando', bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  enviado:    { label: 'Enviado',    bg: '#E0E7FF', color: '#3730A3', border: '#A5B4FC' },
  entregado:  { label: 'Entregado', bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
  cancelado:  { label: 'Cancelado', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
}

const fNum = n => (parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fMon = n => (parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ── toggle switch minimalista ── */
const ToggleSwitch = ({ active, onToggle, label }) => (
  <button type="button" onClick={onToggle}
    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0', flexShrink: 0 }}>
    <User size={12} style={{ color: active ? accent : ct3, transition: 'color .2s' }} />
    <div style={{ width: 28, height: 16, borderRadius: 8, background: active ? accent : 'rgba(48,54,47,.18)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: active ? 14 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </div>
    {label && <span style={{ fontSize: 9, fontWeight: 700, color: active ? accent : ct3, textTransform: 'uppercase', letterSpacing: '.07em', transition: 'color .2s' }}>{label}</span>}
  </button>
)

/* ─────────────────────────────────────────────────────────────────── */
const PedidoForm = ({ type, pedido, clientes = [], productos = [], formActions, closeModal, openModal }) => {
  const isEdit = type === "editar-pedido"

  // ── preferencia cliente persistida ──
  const [clienteActivo, setClienteActivo] = useState(() => {
    try { return localStorage.getItem(PREF_KEY) !== 'false' } catch { return true }
  })

  const toggleCliente = () => {
    setClienteActivo(v => {
      const next = !v
      try { localStorage.setItem(PREF_KEY, String(next)) } catch {}
      return next
    })
  }

  // refs
  const clienteRef   = useRef(null)
  const productoRef  = useRef(null)
  const generarBtnRef = useRef(null)

  // estado del formulario
  const [pedidoData, setPedidoData] = useState(() => {
    if (pedido?.savedState) {
      const s = { ...pedido.savedState, items: (pedido.savedState.items || []).map(i => ({ ...i })) }
      if (pedido.newClient)  { s.clienteId = pedido.newClient.id; s.clienteNombre = pedido.newClient.nombre }
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
      canalVenta: pedido?.canal_venta || "",
    }
  })

  const canalesDisponibles = (() => {
    try { const ls = localStorage.getItem('gestify_canales_venta'); if (ls) return JSON.parse(ls) } catch {}
    return []
  })()

  const [busCliente,   setBusCliente]   = useState(pedido?.cliente_nombre || "")
  const [dropCliente,  setDropCliente]  = useState(false)
  const [busProducto,  setBusProducto]  = useState("")
  const [dropProducto, setDropProducto] = useState(false)
  const [page,         setPage]         = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [alertaExito,  setAlertaExito]  = useState(null)

  // cerrar dropdowns al clic afuera
  useEffect(() => {
    const fn = e => {
      if (clienteRef.current  && !clienteRef.current.contains(e.target))  setDropCliente(false)
      if (productoRef.current && !productoRef.current.contains(e.target)) setDropProducto(false)
    }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  const clientesFiltrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busCliente.toLowerCase()) || c.telefono?.includes(busCliente)
  )
  const productosFiltrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busProducto.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(busProducto.toLowerCase())
  )

  const seleccionarCliente = c => {
    setPedidoData(d => ({ ...d, clienteId: c.id, clienteNombre: c.nombre }))
    setBusCliente(c.nombre); setDropCliente(false)
  }

  const agregarProducto = p => {
    setPedidoData(d => {
      const existe = d.items.find(i => i.productoId === p.id)
      let nuevosItems
      if (existe) {
        nuevosItems = d.items.map(i => i.productoId === p.id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio } : i)
      } else {
        nuevosItems = [...d.items, { id: Date.now(), productoId: p.id, producto: p.nombre, precio: p.precio, cantidad: 1, subtotal: p.precio }]
      }
      const totalPages = Math.ceil(nuevosItems.length / ITEMS_PER_PAGE)
      if (totalPages > 0) setPage(totalPages - 1)
      return { ...d, items: nuevosItems }
    })
    setBusProducto(""); setDropProducto(false)
  }

  const updateItem = (id, campo, valor) => {
    setPedidoData(d => {
      const it = d.items.map(o => {
        if (o.id !== id) return o
        const updated = { ...o, [campo]: valor }
        if (campo === 'cantidad' || campo === 'precio') {
          const q = campo === 'cantidad' ? parseFloat(valor) || 0 : parseFloat(o.cantidad) || 0
          const p = campo === 'precio' ? parseFloat(valor) || 0 : parseFloat(o.precio) || 0
          updated.subtotal = q * p
        }
        return updated
      })
      return { ...d, items: it }
    })
  }

  const removeItem = id => setPedidoData(d => ({ ...d, items: d.items.filter(i => i.id !== id) }))
  const calcTotal  = () => pedidoData.items.reduce((s, i) => s + i.precio * i.cantidad, 0)

  const eCfg = estadosCfg[pedidoData.estado] || estadosCfg.pendiente

  const handleNuevoCliente  = () => openModal?.("nuevo-cliente",  { onSuccess: c => openModal("nuevo-pedido", { savedState: pedidoData, newClient: c }) })
  const handleNuevoProducto = () => openModal?.("nuevo-producto", { onSuccess: p => openModal("nuevo-pedido", { savedState: pedidoData, newProduct: p }) })

  const mostrarAlertaYCerrar = msg => {
    setAlertaExito(msg)
    setTimeout(() => { setAlertaExito(null); closeModal() }, 1800)
  }

  const handleGuardar = async () => {
    setIsProcessing(true)
    const clienteEfectivo = clienteActivo ? pedidoData.clienteId   : null
    const nombreEfectivo  = clienteActivo ? pedidoData.clienteNombre : 'Consumidor Final'
    const final = { ...pedidoData, clienteId: clienteEfectivo, clienteNombre: nombreEfectivo, total: calcTotal(), canal_venta: pedidoData.canalVenta || null }

    if (isEdit) {
      if (!formActions?.actualizarPedido) { setIsProcessing(false); return }
      try {
        const r = await formActions.actualizarPedido(pedido.id, final)
        if (r?.success) { formActions.recargarTodosLosDatos?.(); mostrarAlertaYCerrar(r.mensaje || '¡Venta actualizada!') }
        else toast.error('Error: ' + (r?.mensaje || 'Desconocido'))
      } catch (e) { toast.error('Error: ' + e.message) }
      setIsProcessing(false); return
    }

    if (formActions?.agregarPedidoSolo) {
      formActions.agregarPedidoSolo(final)
        .then(r => { if (r?.success) { formActions.recargarTodosLosDatos?.(); mostrarAlertaYCerrar(r.mensaje || '¡Venta creada!') } else toast.error('Error: ' + (r?.mensaje || '')) })
        .catch(e => toast.error('Error: ' + e.message))
        .finally(() => setIsProcessing(false))
    } else if (formActions?.guardarVenta) {
      formActions.guardarVenta(final, 'pedido'); setIsProcessing(false); closeModal()
    } else { setIsProcessing(false); closeModal() }
  }

  const puedeGuardar = pedidoData.items.length > 0 && (clienteActivo ? !!pedidoData.clienteId : true) && !isProcessing

  const handleEnterKey = useCallback(() => {
    if (!puedeGuardar) { toast.error('Agregá al menos un producto'); return }
    handleGuardar()
  }, [pedidoData, isProcessing, clienteActivo, puedeGuardar])

  useEffect(() => {
    const h = e => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); e.stopPropagation()
        if (generarBtnRef.current && !generarBtnRef.current.disabled) handleEnterKey()
      }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [handleEnterKey])

  // estilos base
  const inp = { width: '100%', height: 32, padding: '0 10px', borderRadius: 8, border: `1px solid ${border}`, background: surface, outline: 'none', fontSize: 12, fontWeight: 500, color: ct1, fontFamily: 'Inter,sans-serif' }

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased', width: '100%' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#282A28', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={14} strokeWidth={2} style={{ color: lime }} />
          </div>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, color: ct3, letterSpacing: '.07em', textTransform: 'uppercase', margin: 0 }}>
              {isEdit ? 'Modificar venta' : 'Nueva venta'}
            </p>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: ct1, letterSpacing: '-.03em', lineHeight: 1, margin: 0 }}>
              {isEdit ? 'Editar Venta' : 'Crear Venta'}
            </h3>
          </div>
        </div>

        {/* Toggle cliente — esquina derecha del header */}
        <ToggleSwitch active={clienteActivo} onToggle={toggleCliente} label={clienteActivo ? 'Con cliente' : 'Sin cliente'} />
      </div>

      {/* ── ALERTA ÉXITO ── */}
      {alertaExito && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderLeft: '3px solid #22c55e', background: 'rgba(34,197,94,.08)', borderRadius: '0 8px 8px 0', padding: '9px 12px', marginBottom: 12 }}>
          <CheckCircle size={14} strokeWidth={2.5} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>{alertaExito}</span>
        </div>
      )}

      {/* ── BODY: 2 columnas en desktop ── */}
      <div className="pf-body" style={{ display: 'flex', gap: 14 }}>

        {/* ═══ COLUMNA IZQUIERDA ═══ */}
        <div className="pf-col-left" style={{ flex: '1.2', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* CLIENTE (opcional, controlado por toggle) */}
          {clienteActivo && (
            <div ref={clienteRef} style={{ position: 'relative', zIndex: 30 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 4 }}>Cliente</label>
              <div style={{ position: 'relative' }}>
                <Search size={11} strokeWidth={2} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: ct3, pointerEvents: 'none' }} />
                <input style={{ ...inp, paddingLeft: 28, paddingRight: 34 }}
                  placeholder="Buscar cliente..."
                  value={busCliente}
                  onChange={e => { setBusCliente(e.target.value); setDropCliente(true) }}
                  onFocus={() => setDropCliente(true)} />
                <button type="button" onClick={handleNuevoCliente}
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: accent, padding: 3, display: 'flex' }}>
                  <Plus size={13} strokeWidth={2.5} />
                </button>
                {dropCliente && clientesFiltrados.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 3, background: surface, border: `1px solid ${border}`, borderRadius: 10, boxShadow: '0 8px 20px rgba(0,0,0,.1)', zIndex: 40, maxHeight: 140, overflowY: 'auto' }}>
                    {clientesFiltrados.map(c => (
                      <button key={c.id} type="button" onClick={() => seleccionarCliente(c)}
                        style={{ width: '100%', padding: '7px 11px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid ${border}`, transition: 'background .1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = accentL}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{c.nombre}</div>
                        {c.telefono && <div style={{ fontSize: 10, color: ct3 }}>{c.telefono}</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {pedidoData.clienteNombre && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <UserCheck size={10} strokeWidth={2} style={{ color: accent }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: accent }}>{pedidoData.clienteNombre}</span>
                </div>
              )}
            </div>
          )}

          {/* BUSCAR PRODUCTO */}
          <div ref={productoRef} style={{ position: 'relative', zIndex: 20 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 4 }}>Productos</label>
            <div style={{ position: 'relative' }}>
              <Package size={11} strokeWidth={2} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: ct3, pointerEvents: 'none' }} />
              <input style={{ ...inp, paddingLeft: 28, paddingRight: 34 }}
                placeholder="Buscar y agregar producto..."
                value={busProducto}
                onChange={e => { setBusProducto(e.target.value); setDropProducto(true) }}
                onFocus={() => setDropProducto(true)} />
              <button type="button" onClick={handleNuevoProducto}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: accent, padding: 3, display: 'flex' }}>
                <Plus size={13} strokeWidth={2.5} />
              </button>
              {dropProducto && productosFiltrados.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 3, background: surface, border: `1px solid ${border}`, borderRadius: 10, boxShadow: '0 8px 20px rgba(0,0,0,.1)', zIndex: 40, maxHeight: 140, overflowY: 'auto' }}>
                  {productosFiltrados.map(p => (
                    <button key={p.id} type="button" onClick={() => agregarProducto(p)}
                      style={{ width: '100%', padding: '7px 11px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = accentL}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{p.nombre}</div>
                        <div style={{ fontSize: 10, color: ct3 }}>{p.codigo ? `${p.codigo} · ` : ''}Stock: {p.stock ?? '—'}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>${fNum(p.precio)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* LISTA DE ITEMS */}
          <div style={{ border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden', background: surface, flex: 1 }}>
            {/* cabecera */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) 52px 64px 60px 22px', gap: 4, padding: '4px 8px', background: surface2, borderBottom: `1px solid ${border}` }}>
              {['Producto', 'Cant.', 'Precio', 'Total', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, textAlign: i >= 1 && i <= 3 ? 'center' : 'left' }}>{h}</div>
              ))}
            </div>

            <div style={{ minHeight: 88 }}>
              {pedidoData.items.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 88, gap: 4 }}>
                  <Package size={14} strokeWidth={1.5} style={{ color: border }} />
                  <span style={{ fontSize: 10, color: ct3 }}>Agrega productos</span>
                </div>
              ) : (
                <div>
                  {pedidoData.items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map(item => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) 52px 64px 60px 22px', gap: 4, padding: '4px 8px', borderBottom: `1px solid ${border}`, alignItems: 'center' }}>
                      <input type="text" value={item.producto} onChange={e => updateItem(item.id, 'producto', e.target.value)}
                        style={{ ...inp, height: 26, fontSize: 11, fontWeight: 600, padding: '0 5px' }} />
                      <input type="number" min="1" value={item.cantidad} onChange={e => updateItem(item.id, 'cantidad', e.target.value)}
                        style={{ ...inp, height: 26, textAlign: 'center', fontSize: 11, fontWeight: 700, padding: 0 }} />
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: ct3, pointerEvents: 'none' }}>$</span>
                        <input type="number" min="0" step="0.01" value={item.precio} onChange={e => updateItem(item.id, 'precio', e.target.value)}
                          style={{ ...inp, height: 26, textAlign: 'right', fontSize: 11, padding: '0 4px 0 11px' }} />
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 11, fontWeight: 700, color: accent }}>${fMon(item.subtotal || 0)}</div>
                      <button type="button" onClick={() => removeItem(item.id)}
                        style={{ width: 20, height: 20, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(180,60,60,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, transition: 'all .12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,60,60,.08)'; e.currentTarget.style.color = '#c62828' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(180,60,60,.5)' }}>
                        <X size={11} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pedidoData.items.length > ITEMS_PER_PAGE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderTop: `1px solid ${border}`, background: surface }}>
                <button type="button" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  style={{ background: 'none', border: 'none', cursor: page === 0 ? 'default' : 'pointer', fontSize: 10, color: page === 0 ? border : accent, fontWeight: 600 }}>←</button>
                <span style={{ fontSize: 9, color: ct3 }}>{page + 1} / {Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE)}</span>
                <button type="button" onClick={() => setPage(p => Math.min(Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE) - 1, p + 1))}
                  disabled={page >= Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE) - 1}
                  style={{ background: 'none', border: 'none', cursor: page >= Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE) - 1 ? 'default' : 'pointer', fontSize: 10, color: page >= Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE) - 1 ? border : accent, fontWeight: 600 }}>→</button>
              </div>
            )}
          </div>
        </div>

        {/* ═══ COLUMNA DERECHA ═══ */}
        <div className="pf-col-right" style={{ flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* FECHAS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 4 }}>Fecha</label>
              <div style={{ position: 'relative' }}>
                <input type="date" className="gestify-date-input" value={pedidoData.fechaPedido}
                  onChange={e => setPedidoData(d => ({ ...d, fechaPedido: e.target.value }))}
                  style={{ ...inp, fontSize: 11, paddingRight: 28 }} />
                <Calendar size={12} strokeWidth={2} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ct3 }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 4 }}>Entrega <span style={{ fontWeight: 400, textTransform: 'none' }}>(opc.)</span></label>
              <div style={{ position: 'relative' }}>
                <input type="date" className="gestify-date-input" value={pedidoData.fechaEntregaEstimada}
                  onChange={e => setPedidoData(d => ({ ...d, fechaEntregaEstimada: e.target.value }))}
                  style={{ ...inp, fontSize: 11, paddingRight: 28 }} />
                <Calendar size={12} strokeWidth={2} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ct3 }} />
              </div>
            </div>
          </div>

          {/* ESTADO */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 4 }}>Estado</label>
            <select value={pedidoData.estado} onChange={e => setPedidoData(d => ({ ...d, estado: e.target.value }))}
              style={{ ...inp, appearance: 'none', cursor: 'pointer', background: eCfg.bg, color: eCfg.color, border: `1px solid ${eCfg.border}`, fontWeight: 700 }}>
              {Object.entries(estadosCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* CANAL (si hay configurados) */}
          {canalesDisponibles.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3 }}>Canal <span style={{ textTransform: 'none', fontWeight: 400 }}>(opc.)</span></label>
                {pedidoData.canalVenta && (
                  <button type="button" onClick={() => setPedidoData(d => ({ ...d, canalVenta: '' }))}
                    style={{ fontSize: 9, color: ct3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Limpiar</button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {canalesDisponibles.map(canal => {
                  const activo = pedidoData.canalVenta === canal
                  return (
                    <button key={canal} type="button" onClick={() => setPedidoData(d => ({ ...d, canalVenta: activo ? '' : canal }))}
                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: activo ? 'none' : `1px solid ${border}`, background: activo ? '#4338CA' : surface, color: activo ? '#fff' : ct2, transition: 'all .12s' }}>
                      {canal}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* NOTAS */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3, marginBottom: 4 }}>Notas <span style={{ textTransform: 'none', fontWeight: 400 }}>(opc.)</span></label>
            <input type="text" style={inp} placeholder="Observaciones..."
              value={pedidoData.notas}
              onChange={e => setPedidoData(d => ({ ...d, notas: e.target.value }))} />
          </div>

          {/* TOTAL + PAGO */}
          <div style={{ background: surface2, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 12px', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: ct3 }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: ct1, letterSpacing: '-.04em' }}>${fMon(calcTotal())}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${border}` }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: ct2 }}>Adelanto:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <button type="button" title="Pagar total"
                  onClick={() => setPedidoData(d => ({ ...d, montoPagado: calcTotal() }))}
                  style={{ background: accentL, color: accent, border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = accentL}>
                  <Check size={12} strokeWidth={2.5} />
                </button>
                <div style={{ position: 'relative', width: 100 }}>
                  <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: ct3 }}>$</span>
                  <input type="number" placeholder="0.00" step="0.01"
                    style={{ ...inp, width: 100, paddingLeft: 18, textAlign: 'right', paddingRight: 6, fontSize: 12 }}
                    value={pedidoData.montoPagado}
                    onChange={e => setPedidoData(d => ({ ...d, montoPagado: e.target.value }))} />
                </div>
              </div>
            </div>
            {parseFloat(pedidoData.montoPagado) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#92400E' }}>Saldo pendiente</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#92400E' }}>${fMon(Math.max(0, calcTotal() - (parseFloat(pedidoData.montoPagado) || 0)))}</span>
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div style={{ display: 'flex', gap: 7 }}>
            <button type="button" onClick={closeModal}
              style={{ flex: 1, height: 36, borderRadius: 9, border: `1px solid ${border}`, background: surface, color: ct2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = surface2}
              onMouseLeave={e => e.currentTarget.style.background = surface}>
              Cancelar
            </button>
            <button type="button" ref={generarBtnRef} onClick={() => puedeGuardar && handleGuardar()}
              disabled={!puedeGuardar}
              style={{ flex: 2, height: 36, borderRadius: 9, border: '2px solid #282A28', background: lime, color: '#282A28', fontSize: 12, fontWeight: 800, cursor: puedeGuardar ? 'pointer' : 'not-allowed', opacity: puedeGuardar ? 1 : .45, fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'opacity .13s' }}>
              {isProcessing ? "Procesando..." : (isEdit ? '✓ Guardar Cambios' : '+ Crear Venta')}
              {!isProcessing && <kbd style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>⌃↵</kbd>}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .gestify-date-input::-webkit-calendar-picker-indicator {
          position:absolute;top:0;left:0;right:0;bottom:0;
          width:auto;height:auto;color:transparent;background:transparent;
          cursor:pointer;z-index:10;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance:none;margin:0 }
        input[type="number"] { -moz-appearance:textfield }

        /* Responsive: columna única en pantallas chicas */
        @media (max-width: 540px) {
          .pf-body { flex-direction: column !important; }
          .pf-col-left, .pf-col-right { flex: unset !important; width: 100% !important; }
        }
      `}</style>
    </div>
  )
}

export default PedidoForm
