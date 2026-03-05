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
  const [page, setPage] = useState(0)
  const ITEMS_PER_PAGE = 3

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
      let nuevosItems
      if (existe) {
        nuevosItems = d.items.map(i => i.productoId === p.id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio } : i)
      } else {
        nuevosItems = [...d.items, { id: Date.now(), productoId: p.id, producto: p.nombre, precio: p.precio, cantidad: 1, subtotal: p.precio }]
      }

      // Auto-ir a la ultima pagina
      const totalPages = Math.ceil(nuevosItems.length / ITEMS_PER_PAGE)
      if (totalPages > 0) setPage(totalPages - 1)

      return { ...d, items: nuevosItems }
    })
    setBusProducto("")
    setDropProducto(false)
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

  const removeItem = (id) => setPedidoData(d => ({ ...d, items: d.items.filter(i => i.id !== id) }))

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
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased', width: '100%', maxWidth: '460px', margin: '0 auto' }}>

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
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) 60px 70px 70px 24px', gap: 6, padding: '4px 8px', background: surface2, borderBottom: `1px solid ${border}` }}>
            {['Producto', 'Cant.', 'Precio', 'Total', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: ct3, textAlign: i === 1 || i === 2 || i === 3 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          <div style={{ minHeight: 96, background: '#fff', overflow: 'hidden' }}>
            {pedidoData.items.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 96, gap: 4 }}>
                <Package size={16} strokeWidth={1.5} style={{ color: border }} />
                <span style={{ fontSize: 10, color: ct3 }}>Agrega productos</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pedidoData.items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((item, idx) => {
                  const absIdx = page * ITEMS_PER_PAGE + idx
                  return (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) 60px 70px 70px 24px', gap: 6, padding: '4px 8px', borderBottom: `1px solid ${border}`, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={item.producto}
                        onChange={e => updateItem(item.id, 'producto', e.target.value)}
                        style={{ ...inp, height: 26, fontSize: 11, fontWeight: 600, color: ct1, padding: '0 6px' }}
                      />

                      <input
                        type="number" min="1"
                        value={item.cantidad}
                        onChange={e => updateItem(item.id, 'cantidad', e.target.value)}
                        style={{ ...inp, height: 26, textAlign: 'center', fontSize: 11, fontWeight: 700, padding: 0 }}
                      />

                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: ct3, pointerEvents: 'none' }}>$</span>
                        <input
                          type="number" min="0" step="0.01"
                          value={item.precio}
                          onChange={e => updateItem(item.id, 'precio', e.target.value)}
                          style={{ ...inp, height: 26, textAlign: 'right', fontSize: 11, padding: '0 4px 0 12px' }}
                        />
                      </div>

                      <div style={{ textAlign: 'right', fontSize: 11, fontWeight: 700, color: accent }}>${fMon(item.subtotal || 0)}</div>

                      <button type="button" onClick={() => removeItem(item.id)}
                        style={{ width: 22, height: 22, border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(180,60,60,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, transition: 'all .12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(180,60,60,.08)'; e.currentTarget.style.color = '#c62828' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(180,60,60,.6)' }}>
                        <Trash2 size={11} strokeWidth={2} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {pedidoData.items.length > ITEMS_PER_PAGE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: surface }}>
              <button
                type="button"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ background: 'transparent', border: 'none', cursor: page === 0 ? 'default' : 'pointer', fontSize: 11, color: page === 0 ? border : accent, fontWeight: 600 }}>
                Anterior
              </button>
              <span style={{ fontSize: 10, color: ct3 }}>
                Pág {page + 1} de {Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE)}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE) - 1, p + 1))}
                disabled={page >= Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE) - 1}
                style={{ background: 'transparent', border: 'none', cursor: page >= Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE) - 1 ? 'default' : 'pointer', fontSize: 11, color: page >= Math.ceil(pedidoData.items.length / ITEMS_PER_PAGE) - 1 ? border : accent, fontWeight: 600 }}>
                Siguiente
              </button>
            </div>
          )}
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