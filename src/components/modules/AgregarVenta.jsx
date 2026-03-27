"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  CheckCircle, TrendingUp, ShoppingCart, User, Package,
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  X, Save, ChevronDown, Calendar, Check, UserCheck, Menu
} from 'lucide-react'

/* ── helpers ── */
const fMon = n => '$' + (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fNum = n => '$' + (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const PREF_KEY = 'gestify_pedido_cliente_activo'

const estadosCfg = {
  pendiente:  { label: 'Pendiente',  bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  preparando: { label: 'Preparando', bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  enviado:    { label: 'Enviado',    bg: '#E0E7FF', color: '#3730A3', border: '#A5B4FC' },
  entregado:  { label: 'Entregado',  bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
  cancelado:  { label: 'Cancelado',  bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
}

const AgregarVenta = ({
  clientes = [],
  productos = [],
  formActions,
  openModal,
  onOpenMobileSidebar,
  onVentaCreada,
  pedidoAEditar = null,
}) => {

  /* ── estado ── */
  const [clienteActivo, setClienteActivo] = useState(() => {
    try { return localStorage.getItem(PREF_KEY) !== 'false' } catch { return true }
  })
  const [clienteId,      setClienteId]      = useState('')
  const [clienteNombre,  setClienteNombre]  = useState('')
  const [busCliente,     setBusCliente]     = useState('')
  const [dropCliente,    setDropCliente]    = useState(false)
  const [dropClienteIdx, setDropClienteIdx] = useState(-1)
  const [busProducto,    setBusProducto]    = useState('')
  const [dropProducto,   setDropProducto]   = useState(false)
  const [dropProductoIdx,setDropProductoIdx]= useState(-1)
  const [shiftFlash,     setShiftFlash]     = useState(false)
  const [carrito,        setCarrito]        = useState([])
  const [fechaPedido,    setFechaPedido]    = useState(new Date().toISOString().slice(0, 10))
  const [fechaEntrega,   setFechaEntrega]   = useState('')
  const [estado,         setEstado]         = useState(() => { try { return localStorage.getItem('gestify_pedido_estado') || 'pendiente' } catch { return 'pendiente' } })
  const [notas,          setNotas]          = useState('')
  const [adelanto,       setAdelanto]       = useState('')
  const [canalVenta,     setCanalVenta]     = useState('')
  const [metodoPago,     setMetodoPago]     = useState('efectivo')
  const [isProcessing,   setIsProcessing]   = useState(false)
  const [exito,          setExito]          = useState(null)
  const [toastMsg,       setToastMsg]       = useState(null)

  const showToast = (msg, type = 'error') => {
    setToastMsg({ msg, type })
    setTimeout(() => setToastMsg(null), 3500)
  }

  const canales = useMemo(() => { try { const ls = localStorage.getItem('gestify_canales_venta'); if (ls) return JSON.parse(ls) } catch {} return [] }, [])

  const clienteRef      = useRef(null)
  const productoRef     = useRef(null)
  const busProductoRef  = useRef(null)
  const guardarRef      = useRef(null)
  const skipDropOnFocus = useRef(false)

  useEffect(() => { setTimeout(() => busProductoRef.current?.focus(), 80) }, [])

  useEffect(() => {
    if (!pedidoAEditar) return
    if (pedidoAEditar.cliente_id) { setClienteId(pedidoAEditar.cliente_id); setClienteNombre(pedidoAEditar.cliente_nombre || ''); setBusCliente(pedidoAEditar.cliente_nombre || '') }
    let itemsArr = []
    try { itemsArr = typeof pedidoAEditar.items === 'string' ? JSON.parse(pedidoAEditar.items) : (pedidoAEditar.items || []) } catch {}
    setCarrito(itemsArr.map((i, idx) => ({
      id: Date.now() + idx,
      productoId: i.productoId || i.producto_id || null,
      nombre: i.producto || i.nombre || '',
      codigo: i.codigo || '',
      precio: parseFloat(i.precio) || 0,
      costo: i.costo ?? '',
      cantidad: parseFloat(i.cantidad) || 1,
    })))
    if (pedidoAEditar.fecha_pedido) setFechaPedido(pedidoAEditar.fecha_pedido.slice(0, 10))
    if (pedidoAEditar.fecha_entrega_estimada) setFechaEntrega(pedidoAEditar.fecha_entrega_estimada.slice(0, 10))
    if (pedidoAEditar.estado) setEstado(pedidoAEditar.estado)
    if (pedidoAEditar.notas) setNotas(pedidoAEditar.notas)
    if (pedidoAEditar.canal_venta) setCanalVenta(pedidoAEditar.canal_venta)
    if (pedidoAEditar.monto_abonado) setAdelanto(String(pedidoAEditar.monto_abonado))
    if (pedidoAEditar.metodo_pago) setMetodoPago(pedidoAEditar.metodo_pago)
  }, [pedidoAEditar?.id])

  useEffect(() => {
    const fn = e => {
      if (clienteRef.current  && !clienteRef.current.contains(e.target))  setDropCliente(false)
      if (productoRef.current && !productoRef.current.contains(e.target)) setDropProducto(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* ── cálculos ── */
  const subtotal      = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const total         = subtotal
  const adelantoNum   = parseFloat(adelanto) || 0
  const saldo         = Math.max(0, total - adelantoNum)
  const gananciaTotal = carrito.reduce((s, i) => {
    const c = parseFloat(i.costo) || 0
    return s + (c > 0 ? (i.precio - c) * i.cantidad : 0)
  }, 0)
  const hayGanancia   = carrito.some(i => parseFloat(i.costo) > 0)

  /* ── filtros ── */
  const clientesFilt  = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busCliente.toLowerCase()) || c.telefono?.includes(busCliente)
  )
  const productosFilt = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busProducto.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(busProducto.toLowerCase())
  )

  /* ── carrito ── */
  const agregarProducto = p => {
    setCarrito(prev => {
      const existe = prev.find(i => i.productoId === p.id)
      if (existe) return prev.map(i => i.productoId === p.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { id: Date.now(), productoId: p.id, nombre: p.nombre, codigo: p.codigo, precio: p.precio, costo: p.costo ?? '', cantidad: 1 }]
    })
    setBusProducto(''); setDropProducto(false); setDropProductoIdx(-1)
    skipDropOnFocus.current = true
    busProductoRef.current?.focus()
  }
  const cambiarCantidad = (id, delta) => setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i))
  const setCantidad     = (id, val)   => setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, parseFloat(val) || 1) } : i))
  const setPrecio       = (id, val)   => setCarrito(prev => prev.map(i => i.id === id ? { ...i, precio: parseFloat(val) || 0 } : i))
  const setCosto        = (id, val)   => setCarrito(prev => prev.map(i => i.id === id ? { ...i, costo: val === '' ? '' : parseFloat(val) || 0 } : i))
  const quitarItem      = id          => setCarrito(prev => prev.filter(i => i.id !== id))

  const selCliente   = c => { setClienteId(c.id); setClienteNombre(c.nombre); setBusCliente(c.nombre); setDropCliente(false); setDropClienteIdx(-1) }
  const limpiarCliente = () => { setClienteId(''); setClienteNombre(''); setBusCliente('') }

  const limpiarTodo = () => {
    setClienteId(''); setClienteNombre(''); setBusCliente('')
    setBusProducto(''); setCarrito([])
    setFechaPedido(new Date().toISOString().slice(0, 10)); setFechaEntrega('')
    setEstado('pendiente'); setNotas(''); setAdelanto(''); setCanalVenta('')
    setTimeout(() => busProductoRef.current?.focus(), 60)
  }

  /* ── guardar ── */
  const puedeGuardar = carrito.length > 0 && (clienteActivo ? !!clienteId : true) && !isProcessing

  const handleGuardar = useCallback(async () => {
    if (!puedeGuardar) { showToast('Agregá al menos un producto'); return }
    setIsProcessing(true)
    const items = carrito.map(i => ({
      id: i.id, productoId: i.productoId, producto: i.nombre,
      precio: i.precio, cantidad: i.cantidad, subtotal: i.precio * i.cantidad,
      costo: parseFloat(i.costo) || null,
      ganancia: parseFloat(i.costo) > 0 ? (i.precio - parseFloat(i.costo)) * i.cantidad : null,
    }))
    const final = {
      clienteId:            clienteActivo ? clienteId    : null,
      clienteNombre:        clienteActivo ? clienteNombre : 'Consumidor Final',
      fechaPedido, fechaEntregaEstimada: fechaEntrega,
      estado, notas, items,
      montoPagado:  adelantoNum,
      total,
      canal_venta:  canalVenta || null,
    }
    try {
      let r
      if (pedidoAEditar?.id) {
        r = await formActions?.actualizarPedido?.(pedidoAEditar.id, {
          cliente_id: final.clienteId,
          cliente_nombre: final.clienteNombre,
          fecha_pedido: final.fechaPedido,
          fecha_entrega_estimada: final.fechaEntregaEstimada || null,
          estado: final.estado,
          notas: final.notas,
          items: JSON.stringify(final.items),
          monto_abonado: final.montoPagado,
          saldo_pendiente: Math.max(0, final.total - final.montoPagado),
          total: final.total,
          canal_venta: final.canal_venta,
        })
      } else {
        r = await formActions?.agregarPedidoSolo?.(final)
      }
      if (r?.success) {
        formActions?.recargarTodosLosDatos?.()
        setExito(pedidoAEditar?.id ? '✅ Venta actualizada exitosamente!' : r.mensaje || '¡Venta creada exitosamente!')
        setTimeout(() => { setExito(null); limpiarTodo(); onVentaCreada?.() }, 2200)
      } else {
        showToast('Error: ' + (r?.mensaje || 'Desconocido'))
      }
    } catch (e) { showToast('Error: ' + e.message) }
    finally { setIsProcessing(false) }
  }, [carrito, clienteActivo, clienteId, clienteNombre, fechaPedido, fechaEntrega,
      estado, notas, adelantoNum, total, canalVenta, puedeGuardar, formActions, pedidoAEditar])

  /* ── atajos ── */
  useEffect(() => {
    const h = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (!guardarRef.current?.disabled) handleGuardar() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [handleGuardar])

  useEffect(() => {
    let shiftDown = false; let otherKey = false
    const onDown = e => { if (e.key === 'Shift') { shiftDown = true; otherKey = false } else if (shiftDown) otherKey = true }
    const onUp   = e => {
      if (e.key === 'Shift') {
        if (shiftDown && !otherKey && total > 0) {
          setAdelanto(String(total))
          setShiftFlash(true)
          setTimeout(() => setShiftFlash(false), 700)
        }
        shiftDown = false; otherKey = false
      }
    }
    window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [total])

  const eCfg = estadosCfg[estado] || estadosCfg.pendiente

  /* ── razón por la que no se puede guardar ── */
  const razonBloqueo = carrito.length === 0
    ? 'Agregá productos al carrito para continuar'
    : (clienteActivo && !clienteId)
      ? 'Seleccioná un cliente o cambiá a "Sin cliente"'
      : null

  return (
    <div className="av-root">

      {/* ══ TOAST ══ */}
      {toastMsg && (
        <div className="av-toast" style={{ background: toastMsg.type === 'error' ? '#fef2f2' : '#f0fdf4', border: `1px solid ${toastMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`, color: toastMsg.type === 'error' ? '#991b1b' : '#166534' }}>
          {toastMsg.type === 'error' ? '⚠ ' : '✓ '}{toastMsg.msg}
          <button onClick={() => setToastMsg(null)} className="av-toast-x">×</button>
        </div>
      )}

      {/* ══ HEADER ══ */}
      <header className="av-header">
        <div className="av-header-l">
          {onOpenMobileSidebar && (
            <button onClick={onOpenMobileSidebar} className="md:hidden av-menu-btn">
              <Menu size={16} strokeWidth={2} />
            </button>
          )}
          <div>
            <p className="av-header-eyebrow">Gestión de ventas</p>
            <h2 className="av-header-title">
              {pedidoAEditar ? `Editando · ${pedidoAEditar.codigo || 'Venta'}` : 'Nueva Venta'}
            </h2>
          </div>
        </div>
        <div className="av-header-r">
          {onVentaCreada && (
            <button onClick={onVentaCreada} className="av-btn-ghost">
              <TrendingUp size={12} strokeWidth={2} /> Ver Ventas
            </button>
          )}
          <button ref={guardarRef} onClick={handleGuardar} disabled={!puedeGuardar} className="av-btn-save">
            <Save size={13} /> {isProcessing ? 'Guardando...' : 'Guardar venta'}
          </button>
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main className="av-main">

        {/* Éxito */}
        {exito && (
          <div className="av-success">
            <div className="av-success-ico"><CheckCircle size={16} /></div>
            <div>
              <p className="av-success-t">Venta completada</p>
              <p className="av-success-m">{exito}</p>
            </div>
            <button onClick={() => setExito(null)} className="av-success-x"><X size={14} /></button>
          </div>
        )}

        <div className="av-layout">

          {/* ══ COLUMNA IZQUIERDA ══ */}
          <div className="av-col">

            {/* Card — Agregar productos */}
            <div className="av-card av-card-search" style={{ flexShrink: 0 }}>
              <div className="av-card-hd av-hd-green">
                <div className="av-hd-ico-wrap"><Package size={14} strokeWidth={2.5} style={{ color: '#1f4d2e' }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="av-card-ttl">Agregar productos</span>
                  <span className="av-card-sub">Escribí el nombre o el código</span>
                </div>
                <button onClick={() => openModal?.('nuevo-producto')} className="av-btn-nuevo">
                  <Plus size={11} strokeWidth={2.5} /> Nuevo producto
                </button>
              </div>

              <div className="av-card-bd" style={{ padding: '10px 14px' }}>
                <div ref={productoRef} style={{ position: 'relative' }}>
                  <div className="av-search-row">
                    <Search size={13} className="av-search-ico" />
                    <input
                      ref={busProductoRef}
                      className="av-search-inp"
                      placeholder="Ej: Coca Cola, zapatilla blanca, COD-001..."
                      value={busProducto}
                      onChange={e => { setBusProducto(e.target.value); setDropProducto(true); setDropProductoIdx(-1) }}
                      onFocus={() => {
                        if (skipDropOnFocus.current) { skipDropOnFocus.current = false; return }
                        setDropProducto(true)
                      }}
                      onKeyDown={e => {
                        if (!dropProducto || productosFilt.length === 0) return
                        if (e.key === 'ArrowDown') { e.preventDefault(); setDropProductoIdx(i => Math.min(i + 1, productosFilt.length - 1)) }
                        else if (e.key === 'ArrowUp') { e.preventDefault(); setDropProductoIdx(i => Math.max(i - 1, 0)) }
                        else if (e.key === 'Enter') { e.preventDefault(); if (dropProductoIdx >= 0 && productosFilt[dropProductoIdx]) agregarProducto(productosFilt[dropProductoIdx]) }
                        else if (e.key === 'Escape') { setDropProducto(false); setDropProductoIdx(-1) }
                      }}
                    />
                    <span className="av-search-hint">↵ para agregar</span>
                  </div>

                  {dropProducto && productosFilt.length > 0 && (
                    <div className="av-drop">
                      {productosFilt.slice(0, 8).map((p, i) => (
                        <button
                          key={p.id}
                          className={`av-drop-row${dropProductoIdx === i ? ' av-drop-active' : ''}`}
                          onClick={() => agregarProducto(p)}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="av-drop-nombre">{p.nombre}</div>
                            <div className="av-drop-meta">
                              {p.codigo && <span className="av-drop-badge">{p.codigo}</span>}
                              <span>Stock: {p.stock ?? '—'}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div className="av-drop-precio">{fNum(p.precio)}</div>
                            <div className="av-drop-add">+ Agregar</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card — Productos en el pedido */}
            <div className="av-card av-card-carrito">
              <div className="av-card-hd av-hd-green">
                <div className="av-hd-ico-wrap"><ShoppingCart size={14} strokeWidth={2.5} style={{ color: '#1f4d2e' }} /></div>
                <span className="av-card-ttl">Productos en el pedido</span>
                {carrito.length > 0 && (
                  <span className="av-badge-count">{carrito.length}</span>
                )}
                {carrito.length > 0 && (
                  <span className="av-subtotal-label">{fMon(subtotal)}</span>
                )}
              </div>

              {carrito.length === 0 ? (
                <div className="av-empty-state">
                  <div className="av-empty-ico"><ShoppingCart size={28} strokeWidth={1.5} /></div>
                  <p className="av-empty-t">El pedido está vacío</p>
                  <p className="av-empty-m">Usá el buscador de arriba para agregar productos</p>
                </div>
              ) : (
                <div className="av-carrito-body">
                  <table className="av-table">
                    <thead>
                      <tr>
                        <th className="av-th-first">PRODUCTO</th>
                        <th>PRECIO UNIT.</th>
                        <th className="av-th-costo">COSTO <span className="av-th-priv">(priv.)</span></th>
                        <th>CANTIDAD</th>
                        <th>SUBTOTAL</th>
                        <th className="av-th-gan">GANANCIA</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map(item => {
                        const costoItem = parseFloat(item.costo) || 0
                        const ganItem   = costoItem > 0 ? (item.precio - costoItem) * item.cantidad : null
                        return (
                          <tr key={item.id} className="av-tr">
                            <td className="av-td-producto">
                              <div className="av-prod-nombre">{item.nombre}</div>
                              {item.codigo && <div className="av-prod-codigo">{item.codigo}</div>}
                            </td>
                            <td>
                              <div className="av-inp-prefix-wrap" style={{ width: 88 }}>
                                <span className="av-inp-prefix">$</span>
                                <input type="number" value={item.precio} onChange={e => setPrecio(item.id, e.target.value)}
                                  className="av-inp-cell" />
                              </div>
                            </td>
                            <td>
                              <div className="av-inp-prefix-wrap" style={{ width: 88 }}>
                                <span className="av-inp-prefix">$</span>
                                <input type="number" value={item.costo ?? ''} placeholder="—"
                                  onChange={e => setCosto(item.id, e.target.value)}
                                  className="av-inp-cell av-inp-costo" />
                              </div>
                            </td>
                            <td>
                              <div className="av-stepper">
                                <button className="av-step-btn" onClick={() => cambiarCantidad(item.id, -1)}><Minus size={11} /></button>
                                <input type="number" value={item.cantidad} onChange={e => setCantidad(item.id, e.target.value)} className="av-step-val" />
                                <button className="av-step-btn" onClick={() => cambiarCantidad(item.id, 1)}><Plus size={11} /></button>
                              </div>
                            </td>
                            <td className="av-td-subtotal">{fNum(item.precio * item.cantidad)}</td>
                            <td className="av-td-gan" style={{ color: ganItem !== null ? (ganItem >= 0 ? '#059669' : '#dc2626') : '#9ca3af' }}>
                              {ganItem !== null ? (ganItem >= 0 ? '+' : '') + fNum(ganItem) : '—'}
                            </td>
                            <td>
                              <button className="av-del-btn" onClick={() => quitarItem(item.id)}><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>{/* fin av-col */}

          {/* ══ SIDEBAR DERECHA ══ */}
          <div className="av-sidebar">

            {/* Card — Cliente */}
            <div className="av-card">
              <div className="av-card-hd av-hd-sage">
                <div className="av-hd-ico-wrap av-hd-ico-sage"><User size={14} strokeWidth={2.5} style={{ color: '#1f4d2e' }} /></div>
                <span className="av-card-ttl">Cliente</span>
                <span className="av-card-sub" style={{ marginLeft: 4 }}>¿A quién le vendés?</span>
                <button
                  onClick={() => setClienteActivo(v => { const n = !v; try { localStorage.setItem(PREF_KEY, String(n)) } catch {} return n })}
                  className={`av-toggle-cli${clienteActivo ? ' on' : ''}`}>
                  {clienteActivo ? 'Con cliente' : 'Sin cliente'}
                </button>
              </div>

              <div className="av-card-bd" style={{ padding: '10px 14px' }}>
                {clienteActivo ? (
                  <>
                    <label className="av-lbl">Seleccioná el cliente</label>
                    <div ref={clienteRef} style={{ position: 'relative', marginBottom: 8 }}>
                      <button
                        className={`av-cli-select${clienteNombre ? ' has-value' : ''}`}
                        onClick={() => { setDropCliente(v => !v); setDropClienteIdx(-1) }}>
                        <Search size={12} style={{ color: clienteNombre ? '#334139' : '#9ca3af', flexShrink: 0 }} />
                        <span style={{ flex: 1, textAlign: 'left', color: clienteNombre ? '#1e2320' : '#9ca3af', fontSize: 12 }}>
                          {clienteNombre || 'Buscar por nombre o teléfono...'}
                        </span>
                        <ChevronDown size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
                      </button>

                      {dropCliente && (
                        <div className="av-drop">
                          <div style={{ padding: '7px 10px', borderBottom: '1px solid #f0f4f2' }}>
                            <input autoFocus className="av-drop-inp" placeholder="Buscar..."
                              value={busCliente}
                              onChange={e => { setBusCliente(e.target.value); setDropClienteIdx(-1) }}
                              onClick={e => e.stopPropagation()}
                              onKeyDown={e => {
                                if (e.key === 'ArrowDown') { e.preventDefault(); setDropClienteIdx(i => Math.min(i + 1, clientesFilt.length - 1)) }
                                else if (e.key === 'ArrowUp') { e.preventDefault(); setDropClienteIdx(i => Math.max(i - 1, 0)) }
                                else if (e.key === 'Enter') { e.preventDefault(); if (dropClienteIdx >= 0 && clientesFilt[dropClienteIdx]) selCliente(clientesFilt[dropClienteIdx]) }
                                else if (e.key === 'Escape') setDropCliente(false)
                              }} />
                          </div>
                          {clientesFilt.length === 0
                            ? <p style={{ padding: '10px 12px', fontSize: 12, color: '#9ca3af', margin: 0, textAlign: 'center' }}>Sin resultados</p>
                            : clientesFilt.map((c, i) => (
                              <button key={c.id} className={`av-drop-row${dropClienteIdx === i ? ' av-drop-active' : ''}`} onClick={() => selCliente(c)}>
                                <div>
                                  <div className="av-drop-nombre">{c.nombre}</div>
                                  {c.telefono && <div className="av-drop-meta"><span>{c.telefono}</span></div>}
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {clienteNombre ? (
                      <div className="av-cli-selected">
                        <UserCheck size={11} style={{ color: '#334139', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1e2320', flex: 1 }}>{clienteNombre}</span>
                        <button onClick={limpiarCliente} className="av-cli-change">Cambiar</button>
                        <button onClick={limpiarCliente} className="av-cli-x"><X size={11} /></button>
                      </div>
                    ) : (
                      <button onClick={() => openModal?.('nuevo-cliente')} className="av-btn-nuevo" style={{ width: '100%', justifyContent: 'center' }}>
                        <Plus size={11} strokeWidth={2.5} /> Nuevo cliente
                      </button>
                    )}
                  </>
                ) : (
                  <div className="av-sin-cliente">
                    <span className="av-sin-cliente-tag">Consumidor Final</span>
                    <span style={{ fontSize: 11, color: '#8B8982' }}>La venta se registrará sin cliente asignado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card — Detalles del pedido */}
            <div className="av-card">
              <div className="av-card-hd av-hd-sage">
                <div className="av-hd-ico-wrap av-hd-ico-sage"><Calendar size={14} strokeWidth={2.5} style={{ color: '#1f4d2e' }} /></div>
                <div>
                  <span className="av-card-ttl">Detalles del pedido</span>
                  <span className="av-card-sub">Fechas, estado y canal</span>
                </div>
              </div>

              <div className="av-card-bd" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Método de pago */}
                <div>
                  <label className="av-lbl">Método de pago</label>
                  <div className="av-metodo-wrap">
                    {[
                      { val: 'efectivo',      lbl: 'Efectivo',      Icon: Banknote },
                      { val: 'transferencia', lbl: 'Transferencia',  Icon: CreditCard },
                    ].map(({ val, lbl, Icon }) => (
                      <button key={val} onClick={() => setMetodoPago(val)}
                        className={`av-metodo-btn${metodoPago === val ? ' active' : ''}`}>
                        <Icon size={15} strokeWidth={1.8} />
                        <span>{lbl}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fechas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="av-lbl">Fecha del pedido</label>
                    <input type="date" className="av-inp gestify-date-input" value={fechaPedido} onChange={e => setFechaPedido(e.target.value)} />
                  </div>
                  <div>
                    <label className="av-lbl">Fecha de entrega <span style={{ fontWeight: 400 }}>(opc.)</span></label>
                    <input type="date" className="av-inp gestify-date-input" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} />
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="av-lbl">Estado del pedido</label>
                  <div style={{ position: 'relative' }}>
                    <select className="av-inp" value={estado}
                      onChange={e => { setEstado(e.target.value); try { localStorage.setItem('gestify_pedido_estado', e.target.value) } catch {} }}
                      style={{ appearance: 'none', cursor: 'pointer', background: eCfg.bg, color: eCfg.color, border: `1.5px solid ${eCfg.border}`, fontWeight: 700, paddingRight: 28 }}>
                      {Object.entries(estadosCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: eCfg.color }} />
                  </div>
                </div>

                {/* Canal */}
                {canales.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <label className="av-lbl" style={{ marginBottom: 0 }}>Canal <span style={{ fontWeight: 400 }}>(opc.)</span></label>
                      {canalVenta && <button onClick={() => setCanalVenta('')} style={{ fontSize: 10, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>Limpiar</button>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {canales.map(c => (
                        <button key={c} onClick={() => setCanalVenta(canalVenta === c ? '' : c)}
                          className={`av-canal-chip${canalVenta === c ? ' active' : ''}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas */}
                <div>
                  <label className="av-lbl">Notas internas <span style={{ fontWeight: 400 }}>(opc.)</span></label>
                  <textarea className="av-inp" value={notas} onChange={e => setNotas(e.target.value)}
                    placeholder="Ej: entregar antes del mediodía, sin cebolla..."
                    style={{ height: 42, padding: '6px 10px', resize: 'none', lineHeight: 1.5 }} />
                </div>

              </div>
            </div>

            {/* Card — Resumen y pago */}
            <div className="av-card">
              <div className="av-card-hd av-hd-dark">
                <div className="av-hd-ico-wrap" style={{ background: 'rgba(168,213,181,.15)' }}><CreditCard size={14} strokeWidth={2.5} style={{ color: '#a8d5b5' }} /></div>
                <div>
                  <span className="av-card-ttl" style={{ color: '#e8f5ee' }}>Resumen y pago</span>
                  <span className="av-card-sub" style={{ color: 'rgba(168,213,181,.75)' }}>Totales y monto abonado</span>
                </div>
              </div>

              <div className="av-card-bd" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Totales */}
                <div className="av-totales">
                  <div className="av-total-row">
                    <span className="av-total-lbl">Subtotal</span>
                    <span className="av-total-val">{fMon(subtotal)}</span>
                  </div>
                  <div className="av-total-row av-total-main">
                    <span>Total a cobrar</span>
                    <span className="av-total-main-val">{fMon(total)}</span>
                  </div>
                  {hayGanancia && (
                    <div className={`av-gan-pill${gananciaTotal >= 0 ? '' : ' neg'}`}>
                      <span>Ganancia estimada</span>
                      <span style={{ fontWeight: 700 }}>{gananciaTotal >= 0 ? '+' : ''}{fMon(gananciaTotal)}</span>
                    </div>
                  )}
                </div>

                {/* Adelanto */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label className="av-lbl" style={{ marginBottom: 0 }}>¿Cuánto abona ahora?</label>
                    <button
                      title="Pagar total (también podés presionar Shift)"
                      onClick={() => setAdelanto(String(total))}
                      className="av-pagar-total-btn">
                      <Check size={9} strokeWidth={2.5} /> Paga el total
                      <kbd className="av-kbd">Shift</kbd>
                    </button>
                  </div>
                  <div className={`av-adelanto-wrap${shiftFlash ? ' flash' : ''}`}>
                    <span className="av-adelanto-prefix">$</span>
                    <input type="number" placeholder="0" step="0.01" className="av-adelanto-inp"
                      value={adelanto} onChange={e => setAdelanto(e.target.value)} />
                  </div>
                  {adelantoNum > 0 && (
                    <div className={`av-saldo-pill${saldo > 0 ? ' pending' : ' paid'}`}>
                      <span>{saldo > 0 ? 'Saldo pendiente' : 'Pago completo ✓'}</span>
                      <span style={{ fontWeight: 700 }}>{fMon(saldo)}</span>
                    </div>
                  )}
                </div>

                {/* Banner bloqueo o botón */}
                {razonBloqueo ? (
                  <div className="av-bloqueo-banner">
                    <span style={{ fontSize: 10 }}>⚠</span>
                    <span>{razonBloqueo}</span>
                  </div>
                ) : (
                  <button ref={guardarRef} onClick={handleGuardar} disabled={isProcessing} className="av-btn-confirm">
                    <ShoppingCart size={14} />
                    {isProcessing ? 'Guardando...' : 'Confirmar y registrar venta'}
                  </button>
                )}

                <p className="av-kbd-hint">
                  <kbd className="av-kbd">Ctrl+↵</kbd> guardar rápido &nbsp;·&nbsp; <kbd className="av-kbd">Shift</kbd> pagar total
                </p>

              </div>
            </div>

          </div>{/* fin av-sidebar */}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes av-in { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }
        @keyframes av-flash { 0%,100% { box-shadow:none } 30% { box-shadow:0 0 0 3px rgba(74,222,128,.35) } }

        /* ── Root ── */
        .av-root { height:100vh; height:100dvh; display:flex; flex-direction:column; background:#eef3f0; font-family:'Inter',-apple-system,sans-serif; overflow:hidden; -webkit-font-smoothing:antialiased; }

        /* ── Toast ── */
        .av-toast { position:fixed; top:14px; left:50%; transform:translateX(-50%); z-index:9999; display:flex; align-items:center; gap:8px; padding:9px 14px; border-radius:10px; font-size:12px; font-weight:600; animation:av-in .2s ease; box-shadow:0 4px 16px rgba(0,0,0,.12); white-space:nowrap; }
        .av-toast-x { background:none; border:none; cursor:pointer; font-size:16px; line-height:1; opacity:.6; padding:0 2px; }

        /* ── Header ── */
        .av-header { background:#282A28; border-bottom:1px solid rgba(255,255,255,.08); padding:0 clamp(14px,2vw,24px); height:50px; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; gap:14px; }
        .av-header-l { display:flex; align-items:center; gap:10px; }
        .av-header-r { display:flex; align-items:center; gap:7px; }
        .av-header-eyebrow { font-size:10px; font-weight:600; color:rgba(255,255,255,.45); margin:0 0 1px; letter-spacing:.06em; text-transform:uppercase; }
        .av-header-title { font-size:17px; font-weight:700; letter-spacing:-.03em; color:#fff; line-height:1; margin:0; }
        .av-menu-btn { display:none; width:30px; height:30px; border-radius:8px; align-items:center; justify-content:center; cursor:pointer; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.7); }
        @media(max-width:767px){ .av-menu-btn { display:flex; } }
        .av-btn-ghost { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; background:transparent; border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.65); transition:all .13s; font-family:'Inter',sans-serif; }
        .av-btn-ghost:hover { color:#fff; border-color:rgba(255,255,255,.45); }
        .av-btn-save { display:inline-flex; align-items:center; gap:6px; padding:6px 16px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; background:#4ADE80; border:none; color:#0A1A0E; transition:opacity .13s; font-family:'Inter',sans-serif; }
        .av-btn-save:hover:not(:disabled) { opacity:.88; }
        .av-btn-save:disabled { opacity:.4; cursor:not-allowed; }

        /* ── Main layout ── */
        .av-main { flex:1; overflow:hidden; display:flex; flex-direction:column; padding:clamp(8px,1.2vw,14px) clamp(12px,2.5vw,28px); max-width:1600px; margin:0 auto; width:100%; box-sizing:border-box; gap:10px; }
        .av-success { display:flex; align-items:center; gap:10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:9px 14px; flex-shrink:0; animation:av-in .3s ease; }
        .av-success-ico { width:28px; height:28px; border-radius:50%; background:#16a34a; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
        .av-success-t { font-size:13px; font-weight:600; color:#166534; margin:0; }
        .av-success-m { font-size:11px; color:#15803d; margin:0; }
        .av-success-x { margin-left:auto; width:24px; height:24px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; color:#16a34a; cursor:pointer; border-radius:6px; flex-shrink:0; }
        .av-success-x:hover { background:#dcfce7; }

        .av-layout { flex:1; overflow:hidden; display:grid; grid-template-columns:1fr clamp(260px,27vw,340px); gap:clamp(10px,1.5vw,18px); }
        .av-col { display:flex; flex-direction:column; gap:10px; overflow-y:auto; padding-bottom:2px; }
        .av-col::-webkit-scrollbar { width:0; }
        .av-sidebar { display:flex; flex-direction:column; gap:8px; overflow-y:auto; padding-bottom:2px; }
        .av-sidebar::-webkit-scrollbar { width:0; }

        /* ── Cards ── */
        .av-card { background:#fff; border:1px solid #dde8e1; border-radius:12px; overflow:hidden; }
        .av-card-search { overflow:visible; }
        .av-card-search .av-card-hd { border-radius:12px 12px 0 0; }
        .av-card-carrito { flex:1; min-height:0; display:flex; flex-direction:column; }
        .av-card-hd { display:flex; align-items:center; gap:8px; padding:8px 14px; border-bottom:1px solid rgba(0,0,0,.05); }
        .av-hd-green { background:#eaf2ec; }
        .av-hd-sage  { background:#d6e8db; }
        .av-hd-dark  { background:#3d4d42; }
        .av-hd-ico-wrap { width:26px; height:26px; border-radius:7px; background:rgba(31,77,46,.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .av-hd-ico-sage { background:rgba(31,77,46,.12); }
        .av-card-ttl { font-size:12px; font-weight:700; color:#1e2320; letter-spacing:-.01em; }
        .av-card-sub { font-size:10px; color:#8B8982; margin-left:2px; }
        .av-card-bd  { padding:12px 14px; }

        /* ── Botones de card ── */
        .av-btn-nuevo { display:inline-flex; align-items:center; gap:5px; margin-left:auto; padding:4px 10px; border-radius:7px; font-size:10.5px; font-weight:700; cursor:pointer; background:#fff; border:1px solid #bdd9c5; color:#334139; transition:all .12s; white-space:nowrap; font-family:'Inter',sans-serif; flex-shrink:0; }
        .av-btn-nuevo:hover { background:#f0faf3; border-color:#334139; }

        /* ── Badges header ── */
        .av-badge-count { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; padding:0 5px; border-radius:20px; background:#334139; color:#fff; font-size:10px; font-weight:700; }
        .av-subtotal-label { margin-left:auto; font-size:12px; font-weight:700; color:#334139; }

        /* ── Buscador ── */
        .av-search-row { display:flex; align-items:center; gap:8px; height:36px; padding:0 12px; border:1px solid #dde8e1; border-radius:9px; background:#fafffe; transition:border-color .13s; }
        .av-search-row:focus-within { border-color:#334139; box-shadow:0 0 0 3px rgba(51,65,57,.07); }
        .av-search-ico { color:#9ca3af; flex-shrink:0; }
        .av-search-inp { flex:1; border:none; outline:none; font-size:12px; font-family:'Inter',sans-serif; color:#1e2320; background:transparent; }
        .av-search-inp::placeholder { color:#b0bab5; }
        .av-search-hint { font-size:10px; color:#b0bab5; font-weight:500; white-space:nowrap; flex-shrink:0; font-family:'DM Mono',monospace; }

        /* ── Dropdown ── */
        .av-drop { position:absolute; top:calc(100% + 4px); left:0; right:0; background:#fff; border:1px solid #d1ddd5; border-radius:10px; box-shadow:0 8px 24px rgba(31,77,46,.1),0 2px 6px rgba(0,0,0,.06); z-index:300; max-height:220px; overflow-y:auto; }
        .av-drop-row { width:100%; display:flex; align-items:center; gap:12px; padding:8px 12px; text-align:left; background:transparent; border:none; border-bottom:1px solid #f0f4f2; cursor:pointer; transition:background .1s; font-family:'Inter',sans-serif; }
        .av-drop-row:last-child { border-bottom:none; }
        .av-drop-row:hover { background:#f4f9f5; }
        .av-drop-row.av-drop-active { background:#eaf2ec; border-left:3px solid #334139; padding-left:9px; }
        .av-drop-nombre { font-size:12px; font-weight:600; color:#1e2320; }
        .av-drop-meta { display:flex; align-items:center; gap:6px; font-size:10px; color:#9ca3af; margin-top:1px; }
        .av-drop-badge { background:#f3f4f6; color:#6b7280; border-radius:4px; padding:1px 5px; font-family:'DM Mono',monospace; font-size:9px; font-weight:600; }
        .av-drop-precio { font-size:13px; font-weight:700; color:#334139; }
        .av-drop-add { font-size:10px; color:#9ca3af; margin-top:1px; }
        .av-drop-row:hover .av-drop-add { color:#334139; }
        .av-drop-inp { width:100%; border:1px solid #dde8e1; border-radius:7px; padding:6px 10px; font-size:12px; outline:none; box-sizing:border-box; background:#fff; font-family:'Inter',sans-serif; }
        .av-drop-inp:focus { border-color:#334139; }

        /* ── Carrito vacío ── */
        .av-empty-state { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; }
        .av-empty-ico { width:52px; height:52px; border-radius:14px; background:#f0f4f2; display:flex; align-items:center; justify-content:center; margin-bottom:10px; color:#b0bab5; }
        .av-empty-t { font-size:13px; font-weight:600; color:#30362F; margin:0 0 4px; }
        .av-empty-m { font-size:11px; color:#9ca3af; margin:0; text-align:center; }

        /* ── Tabla ── */
        .av-carrito-body { flex:1; overflow-y:auto; overflow-x:hidden; }
        .av-table { width:100%; border-collapse:collapse; }
        .av-table thead tr { background:#eaf2ec; position:sticky; top:0; z-index:1; }
        .av-table th { padding:7px 10px; font-size:9px; font-weight:700; color:#334139; text-transform:uppercase; letter-spacing:.06em; text-align:left; }
        .av-th-first { border-left:2.5px solid #334139; padding-left:14px; }
        .av-th-costo { color:#9ca3af; }
        .av-th-priv { font-size:8px; font-weight:400; color:#b0bab5; }
        .av-th-gan { color:#059669; }
        .av-tr td { border-bottom:1px solid #f0f4f2; padding:8px 10px; font-size:12px; color:#374151; vertical-align:middle; }
        .av-tr:hover td { background:#f4f9f5; }
        .av-tr:last-child td { border-bottom:none; }
        .av-td-producto { padding-left:14px !important; }
        .av-prod-nombre { font-size:12px; font-weight:600; color:#1e2320; }
        .av-prod-codigo { font-size:10px; color:#9ca3af; margin-top:1px; font-family:'DM Mono',monospace; }
        .av-td-subtotal { font-weight:700; color:#1e2320; }
        .av-td-gan { font-size:11px; font-weight:700; text-align:right; }

        /* ── Inputs tabla ── */
        .av-inp-prefix-wrap { position:relative; }
        .av-inp-prefix { position:absolute; left:7px; top:50%; transform:translateY(-50%); font-size:11px; color:#9ca3af; pointer-events:none; }
        .av-inp-cell { width:100%; height:26px; padding:0 6px 0 20px; border:1px solid #dde8e1; border-radius:6px; font-size:12px; outline:none; box-sizing:border-box; text-align:right; background:#fafffe; font-family:'Inter',sans-serif; color:#1e2320; transition:border-color .12s; }
        .av-inp-cell:focus { border-color:#334139; box-shadow:0 0 0 2px rgba(51,65,57,.08); }
        .av-inp-costo { background:#fffbf0; border-color:#fde68a; }
        .av-inp-costo:focus { border-color:#f59e0b !important; }
        .av-stepper { display:inline-flex; align-items:center; border:1px solid #dde8e1; border-radius:7px; overflow:hidden; }
        .av-step-btn { width:22px; height:26px; display:flex; align-items:center; justify-content:center; background:#f5f7f5; border:none; cursor:pointer; color:#374151; flex-shrink:0; transition:background .1s; }
        .av-step-btn:hover { background:#e8eee9; }
        .av-step-val { width:32px; height:26px; text-align:center; font-size:12px; font-weight:500; border:none; border-left:1px solid #dde8e1; border-right:1px solid #dde8e1; outline:none; background:#fff; color:#1e2320; font-family:'Inter',sans-serif; padding:0; }
        .av-del-btn { width:26px; height:26px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; color:#fca5a5; cursor:pointer; border-radius:6px; transition:all .12s; }
        .av-del-btn:hover { background:#fef2f2; color:#ef4444; }

        /* ── Cliente selector ── */
        .av-lbl { display:block; font-size:11px; font-weight:600; color:#374151; margin-bottom:4px; }
        .av-cli-select { width:100%; display:flex; align-items:center; gap:8px; padding:0 10px; height:34px; background:#fff; border:1px solid #dde8e1; border-radius:8px; cursor:pointer; text-align:left; transition:border-color .13s; }
        .av-cli-select:hover { border-color:#bdd9c5; }
        .av-cli-select.has-value { border-color:#4ADE80; box-shadow:0 0 0 2px rgba(74,222,128,.12); }
        .av-cli-selected { display:flex; align-items:center; gap:7px; padding:6px 10px; background:#f4fdf7; border:1px solid #bbf7d0; border-radius:8px; }
        .av-cli-change { font-size:10px; color:#334139; background:none; border:none; cursor:pointer; font-weight:600; margin-left:auto; text-decoration:underline; }
        .av-cli-x { width:18px; height:18px; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#9ca3af; border-radius:4px; }
        .av-cli-x:hover { background:#fee2e2; color:#ef4444; }
        .av-toggle-cli { margin-left:auto; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; cursor:pointer; background:#fff; border:1px solid #bdd9c5; color:#8B8982; transition:all .13s; font-family:'Inter',sans-serif; }
        .av-toggle-cli.on { background:#334139; border-color:#334139; color:#fff; }
        .av-sin-cliente { display:flex; flex-direction:column; gap:4px; padding:8px 10px; background:#f9fafb; border-radius:8px; border:1px solid #e5e7eb; }
        .av-sin-cliente-tag { display:inline-block; font-size:11px; font-weight:700; color:#374151; background:#e5e7eb; border-radius:4px; padding:1px 7px; width:fit-content; }

        /* ── Método de pago ── */
        .av-metodo-wrap { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
        .av-metodo-btn { display:flex; flex-direction:column; align-items:center; gap:4px; padding:9px 6px; border-radius:9px; font-size:11px; font-weight:600; cursor:pointer; border:1.5px solid #dde8e1; background:#fafffe; color:#6b7280; transition:all .13s; font-family:'Inter',sans-serif; }
        .av-metodo-btn:hover { border-color:#bdd9c5; background:#f4fdf7; color:#334139; }
        .av-metodo-btn.active { background:linear-gradient(135deg,#eaf2ec,#d6e8db); border-color:#4ADE80; color:#1f4d2e; box-shadow:0 0 0 2px rgba(74,222,128,.15); }

        /* ── Canal chips ── */
        .av-canal-chip { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; cursor:pointer; border:1px solid #dde8e1; background:#fff; color:#374151; transition:all .12s; font-family:'Inter',sans-serif; }
        .av-canal-chip:hover { border-color:#bdd9c5; background:#f4fdf7; }
        .av-canal-chip.active { background:#334139; border-color:#334139; color:#fff; }

        /* ── Inputs generales ── */
        .av-inp { width:100%; height:34px; padding:0 10px; border:1px solid #dde8e1; border-radius:8px; font-size:12px; color:#1e2320; outline:none; box-sizing:border-box; background:#fff; font-family:'Inter',sans-serif; transition:border-color .12s; }
        .av-inp:focus { border-color:#334139; box-shadow:0 0 0 3px rgba(51,65,57,.07); }
        textarea.av-inp { height:auto; }

        /* ── Resumen ── */
        .av-totales { display:flex; flex-direction:column; gap:6px; padding:10px 12px; background:#f8fdfb; border-radius:10px; border:1px solid #dde8e1; }
        .av-total-row { display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#6b7280; }
        .av-total-val { font-weight:500; }
        .av-total-main { font-size:14px; font-weight:700; color:#1e2320; padding-top:6px; margin-top:2px; border-top:1px solid #dde8e1; }
        .av-total-main-val { font-size:19px; font-weight:800; color:#16a34a; letter-spacing:-.03em; }
        .av-gan-pill { display:flex; justify-content:space-between; align-items:center; padding:5px 9px; border-radius:7px; background:#f0fdf4; border:1px solid #bbf7d0; font-size:11px; color:#065f46; margin-top:2px; }
        .av-gan-pill.neg { background:#fef2f2; border-color:#fecaca; color:#991b1b; }

        /* ── Adelanto ── */
        .av-pagar-total-btn { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; background:rgba(51,65,57,.07); color:#334139; border:1px solid rgba(51,65,57,.18); border-radius:20px; cursor:pointer; font-size:10px; font-weight:700; letter-spacing:.02em; transition:all .13s; font-family:'Inter',sans-serif; }
        .av-pagar-total-btn:hover { background:rgba(51,65,57,.14); }
        .av-adelanto-wrap { display:flex; align-items:center; height:40px; border:1.5px solid #dde8e1; border-radius:9px; overflow:hidden; background:#fff; transition:border-color .12s,box-shadow .12s; }
        .av-adelanto-wrap:focus-within { border-color:#334139; box-shadow:0 0 0 3px rgba(51,65,57,.08); }
        .av-adelanto-wrap.flash { animation:av-flash .7s ease; }
        .av-adelanto-prefix { padding:0 10px; font-size:14px; font-weight:600; color:#9ca3af; border-right:1px solid #eee; background:#f9fafb; height:100%; display:flex; align-items:center; flex-shrink:0; }
        .av-adelanto-inp { flex:1; border:none; outline:none; font-size:15px; font-weight:600; color:#1e2320; padding:0 12px; text-align:right; font-family:'Inter',sans-serif; background:transparent; }
        .av-saldo-pill { display:flex; justify-content:space-between; align-items:center; padding:5px 10px; border-radius:7px; font-size:11px; margin-top:6px; }
        .av-saldo-pill.pending { background:#fffbf0; border:1px solid #fde68a; color:#92400E; }
        .av-saldo-pill.paid    { background:#f0fdf4; border:1px solid #bbf7d0; color:#065F46; }

        /* ── Banner bloqueo ── */
        .av-bloqueo-banner { display:flex; align-items:center; gap:7px; padding:9px 12px; border:1.5px dashed #d1ddd5; border-radius:9px; font-size:11px; color:#8B8982; font-weight:500; background:#f8fdfb; }

        /* ── Confirmar ── */
        .av-btn-confirm { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:11px; background:linear-gradient(135deg,#2d3d32,#1e2320); color:#4ADE80; border:none; border-radius:9px; font-size:13px; font-weight:700; cursor:pointer; transition:all .13s; font-family:'Inter',sans-serif; box-shadow:0 2px 8px rgba(30,35,32,.2); letter-spacing:-.01em; }
        .av-btn-confirm:hover:not(:disabled) { background:linear-gradient(135deg,#334139,#282A28); box-shadow:0 4px 14px rgba(30,35,32,.3); }
        .av-btn-confirm:disabled { opacity:.4; cursor:not-allowed; }
        .av-kbd-hint { text-align:center; margin:2px 0 0; font-size:10px; color:#9ca3af; }
        .av-kbd { padding:1px 4px; background:#f3f4f6; border:1px solid #e5e7eb; border-radius:3px; font-family:'DM Mono',monospace; font-size:9px; font-weight:600; color:#6b7280; }

        /* ── Responsive ── */
        @media(max-width:1400px){
          .av-layout { grid-template-columns:1fr clamp(250px,26vw,310px); }
        }
        /* Compact sidebar for short laptop screens (≤800px height) */
        @media(max-height:800px){
          .av-header { height:44px; }
          .av-main { padding:8px clamp(12px,2.5vw,24px); gap:7px; }
          .av-layout { gap:10px; }
          .av-card-hd { padding:5px 12px; }
          .av-card-bd { padding:8px 12px !important; }
          .av-sidebar { gap:6px; }
          .av-col { gap:7px; }
          .av-totales { padding:8px 10px; gap:4px; }
          .av-total-main-val { font-size:17px; }
          .av-metodo-btn { padding:6px 4px; font-size:10px; gap:3px; }
          .av-adelanto-wrap { height:34px; }
          .av-adelanto-inp { font-size:13px; }
          .av-btn-confirm { padding:9px; font-size:12px; }
          .av-kbd-hint { display:none; }
          textarea.av-inp { height:34px !important; }
        }
        @media(max-width:820px){
          .av-layout { display:flex; flex-direction:column; grid-template-columns:none; gap:8px; }
          .av-col { flex:1; overflow-y:auto; }
          .av-sidebar { flex-shrink:0; display:grid; grid-template-columns:1fr 1fr; gap:8px; overflow-y:visible; }
          .av-card-bd { padding:10px 12px; }
          .av-card-hd { padding:8px 12px; }
        }
        @media(max-width:640px){
          .av-sidebar { grid-template-columns:1fr; }
          .av-btn-ghost { display:none; }
          /* tabla mobile: Producto + Cantidad + Acciones */
          .av-table th:nth-child(2),.av-table td:nth-child(2) { display:none; }
          .av-table th:nth-child(3),.av-table td:nth-child(3) { display:none; }
          .av-table th:nth-child(5),.av-table td:nth-child(5) { display:none; }
          .av-table th:nth-child(6),.av-table td:nth-child(6) { display:none; }
          .av-table th, .av-table td { padding:6px 8px; }
          .av-carrito-body { overflow-x:hidden; }
          .av-table { table-layout:fixed; width:100%; }
          .av-td-producto { padding-left:10px !important; }
        }
      `}</style>
    </div>
  )
}

export default AgregarVenta
