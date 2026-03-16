"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  CheckCircle, TrendingUp, ShoppingCart, User, Package,
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  X, Save, ChevronDown, Calendar, Check, UserCheck
} from 'lucide-react'
import { toast } from 'react-toastify'

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
  const [clienteId,     setClienteId]     = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [busCliente,    setBusCliente]    = useState('')
  const [dropCliente,   setDropCliente]   = useState(false)
  const [dropClienteIdx, setDropClienteIdx] = useState(-1)
  const [busProducto,   setBusProducto]   = useState('')
  const [dropProducto,  setDropProducto]  = useState(false)
  const [dropProductoIdx, setDropProductoIdx] = useState(-1)
  const [shiftFlash,    setShiftFlash]    = useState(false)
  const [carrito,       setCarrito]       = useState([])
  const [fechaPedido,   setFechaPedido]   = useState(new Date().toISOString().slice(0, 10))
  const [fechaEntrega,  setFechaEntrega]  = useState('')
  const [estado,        setEstado]        = useState(() => { try { return localStorage.getItem('gestify_pedido_estado') || 'pendiente' } catch { return 'pendiente' } })
  const [notas,         setNotas]         = useState('')
  const [adelanto,      setAdelanto]      = useState('')
  const [canalVenta,    setCanalVenta]    = useState('')
  const [metodoPago,    setMetodoPago]    = useState('efectivo')
  const [isProcessing,  setIsProcessing]  = useState(false)
  const [exito,         setExito]         = useState(null)

  const canales = useMemo(() => { try { const ls = localStorage.getItem('gestify_canales_venta'); if (ls) return JSON.parse(ls) } catch {} return [] }, [])

  const clienteRef     = useRef(null)
  const productoRef    = useRef(null)
  const busProductoRef = useRef(null)
  const guardarRef     = useRef(null)

  useEffect(() => { setTimeout(() => busProductoRef.current?.focus(), 80) }, [])

  // ━━ Precargar form cuando llega pedidoAEditar ━━
  useEffect(() => {
    if (!pedidoAEditar) return
    // Cliente
    if (pedidoAEditar.cliente_id) { setClienteId(pedidoAEditar.cliente_id); setClienteNombre(pedidoAEditar.cliente_nombre || ''); setBusCliente(pedidoAEditar.cliente_nombre || '') }
    // Items del carrito
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
    // Resto de campos
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
  const subtotal    = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const total       = subtotal
  const adelantoNum = parseFloat(adelanto) || 0
  const saldo       = Math.max(0, total - adelantoNum)
  const gananciaTotal = carrito.reduce((s, i) => {
    const c = parseFloat(i.costo) || 0
    return s + (c > 0 ? (i.precio - c) * i.cantidad : 0)
  }, 0)
  const hayGanancia = carrito.some(i => parseFloat(i.costo) > 0)

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
    busProductoRef.current?.focus()
  }
  const cambiarCantidad = (id, delta) => setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i))
  const setCantidad     = (id, val)   => setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, parseFloat(val) || 1) } : i))
  const setPrecio       = (id, val)   => setCarrito(prev => prev.map(i => i.id === id ? { ...i, precio: parseFloat(val) || 0 } : i))
  const setCosto        = (id, val)   => setCarrito(prev => prev.map(i => i.id === id ? { ...i, costo: val === '' ? '' : parseFloat(val) || 0 } : i))
  const quitarItem      = id          => setCarrito(prev => prev.filter(i => i.id !== id))

  const selCliente = c => { setClienteId(c.id); setClienteNombre(c.nombre); setBusCliente(c.nombre); setDropCliente(false); setDropClienteIdx(-1) }
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

  const handleGuardar = useCallback(async (overrideAdelanto = null) => {
    if (!puedeGuardar) { toast.error('Agregá al menos un producto'); return }
    setIsProcessing(true)
    const montoFinal = overrideAdelanto !== null ? parseFloat(overrideAdelanto) || 0 : adelantoNum
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
      montoPagado:  montoFinal,
      total,
      canal_venta:  canalVenta || null,
    }
    try {
      let r
      if (pedidoAEditar?.id) {
        // Modo edición: actualizar pedido existente
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
        toast.error('Error: ' + (r?.mensaje || 'Desconocido'))
      }
    } catch (e) { toast.error('Error: ' + e.message) }
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
        // Shift funciona desde cualquier lado (incluso con input de búsqueda enfocado)
        // Solo ignora si Shift fue combinado con otra tecla (ej: Shift+A para mayúsculas)
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

  return (
    <div className="av-root">

      {/* ══ HEADER ══ */}
      <header className="av-header">
        <div className="av-header-l">
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1, margin: 0 }}>
              {pedidoAEditar ? `Editando · ${pedidoAEditar.codigo || 'Venta'}` : 'Nueva Venta'}
            </h2>
          </div>
        </div>
        <div className="av-header-r">
          {onVentaCreada && (
            <button onClick={onVentaCreada} className="av-btn-header-ghost">
              <TrendingUp size={12} strokeWidth={2} /> Ver Ventas
            </button>
          )}
          <button ref={guardarRef} onClick={handleGuardar} disabled={!puedeGuardar} className="av-btn-header-save">
            <Save size={13} /> {isProcessing ? 'Guardando...' : 'Guardar venta'}
          </button>
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main className="av-main">

        {/* Éxito */}
        {exito && (
          <div className="av-success">
            <div className="av-success-ico"><CheckCircle size={18} /></div>
            <div>
              <p className="av-success-t">Venta completada</p>
              <p className="av-success-m">{exito}</p>
            </div>
            <button onClick={() => setExito(null)} className="av-success-x"><X size={15} /></button>
          </div>
        )}

        <div className="av-layout">

          {/* ── COLUMNA IZQUIERDA ── */}
          <div className="av-col">

            {/* Card Cliente */}
            <div className="av-card">
              <div className="av-card-hd">
                <User size={16} className="av-ico" />
                <span className="av-card-ttl">Cliente</span>
                <button
                  onClick={() => setClienteActivo(v => { const n = !v; try { localStorage.setItem(PREF_KEY, String(n)) } catch {} return n })}
                  className={`av-toggle-btn${clienteActivo ? ' active' : ''}`} style={{ marginLeft: 'auto' }}>
                  {clienteActivo ? 'Con cliente' : 'Sin cliente'}
                </button>
              </div>

              {clienteActivo && (
                <div className="av-card-bd">
                  <div className="av-cliente-row">
                    <div style={{ flex: 1 }}>
                      <label className="av-lbl">Seleccionar cliente</label>
                      <div ref={clienteRef} style={{ position: 'relative' }}>
                        <button className="av-select" onClick={() => { setDropCliente(v => !v); setDropClienteIdx(-1) }}>
                          <span style={{ color: clienteNombre ? '#111827' : '#9ca3af' }}>
                            {clienteNombre || 'Buscar cliente...'}
                          </span>
                          <ChevronDown size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
                        </button>
                        {dropCliente && (
                          <div className="av-drop">
                            <div style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>
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
                              ? <p style={{ padding: 12, fontSize: 13, color: '#9ca3af', margin: 0, textAlign: 'center' }}>Sin resultados</p>
                              : clientesFilt.map((c, i) => (
                                <button key={c.id} className={`av-drop-item${dropClienteIdx === i ? ' av-drop-active' : ''}`} onClick={() => selCliente(c)}>
                                  <span style={{ fontWeight: 500 }}>{c.nombre}</span>
                                  {c.telefono && <span style={{ fontSize: 11, color: '#9ca3af' }}>{c.telefono}</span>}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                      {clienteNombre && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                          <UserCheck size={11} style={{ color: '#334139' }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#334139' }}>{clienteNombre}</span>
                          <button onClick={limpiarCliente} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><X size={11} /></button>
                        </div>
                      )}
                    </div>
                    <button onClick={() => openModal?.('nuevo-cliente')} className="av-btn-outline" style={{ alignSelf: 'flex-end', flexShrink: 0 }}>
                      <Plus size={13} /> Nuevo cliente
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card Agregar productos */}
            <div className="av-card">
              <div className="av-card-hd">
                <Package size={16} className="av-ico" />
                <span className="av-card-ttl">Agregar productos</span>
                <button onClick={() => openModal?.('nuevo-producto')} className="av-btn-outline" style={{ marginLeft: 'auto', fontSize: 12, padding: '5px 10px' }}>
                  <Plus size={12} /> Nuevo
                </button>
              </div>
              <div className="av-card-bd">
                <div ref={productoRef} style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  <input ref={busProductoRef} className="av-search-inp"
                    placeholder="Buscar por nombre o código..."
                    value={busProducto}
                    onChange={e => { setBusProducto(e.target.value); setDropProducto(true); setDropProductoIdx(-1) }}
                    onFocus={() => setDropProducto(true)}
                    onKeyDown={e => {
                      if (!dropProducto || productosFilt.length === 0) return
                      if (e.key === 'ArrowDown') { e.preventDefault(); setDropProductoIdx(i => Math.min(i + 1, productosFilt.length - 1)) }
                      else if (e.key === 'ArrowUp') { e.preventDefault(); setDropProductoIdx(i => Math.max(i - 1, 0)) }
                      else if (e.key === 'Enter') { e.preventDefault(); if (dropProductoIdx >= 0 && productosFilt[dropProductoIdx]) agregarProducto(productosFilt[dropProductoIdx]) }
                      else if (e.key === 'Escape') { setDropProducto(false); setDropProductoIdx(-1) }
                    }} />
                  {dropProducto && busProducto && productosFilt.length > 0 && (
                    <div className="av-drop">
                      {productosFilt.map((p, i) => (
                        <button key={p.id} className={`av-search-res${dropProductoIdx === i ? ' av-drop-active' : ''}`} onClick={() => agregarProducto(p)}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{p.nombre}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.codigo ? `${p.codigo} · ` : ''}Stock: {p.stock ?? '—'}</div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#334139', flexShrink: 0 }}>{fNum(p.precio)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Carrito */}
            <div className="av-card">
              <div className="av-card-hd">
                <ShoppingCart size={16} className="av-ico" />
                <span className="av-card-ttl">Productos en carrito ({carrito.length})</span>
              </div>
              {carrito.length === 0 ? (
                <div className="av-empty">
                  <ShoppingCart size={36} style={{ color: '#d1d5db', marginBottom: 8 }} />
                  <p>No hay productos en el carrito</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="av-table">
                    <thead>
                      <tr>
                        <th>PRODUCTO</th>
                        <th>PRECIO</th>
                        <th style={{ color: '#6b7280' }}>COSTO <span style={{ fontSize: 9, fontWeight: 400, color: '#9ca3af' }}>(priv.)</span></th>
                        <th>CANTIDAD</th>
                        <th>SUBTOTAL</th>
                        <th style={{ color: '#059669' }}>GANANCIA</th>
                        <th>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map(item => {
                        const costoItem = parseFloat(item.costo) || 0
                        const ganItem   = costoItem > 0 ? (item.precio - costoItem) * item.cantidad : null
                        return (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: 500, color: '#111827' }}>{item.nombre}</div>
                            {item.codigo && <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.codigo}</div>}
                          </td>
                          <td>
                            <div style={{ position: 'relative', width: 90 }}>
                              <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af', pointerEvents: 'none' }}>$</span>
                              <input type="number" value={item.precio} onChange={e => setPrecio(item.id, e.target.value)}
                                className="av-inline-inp" style={{ paddingLeft: 18, textAlign: 'right' }} />
                            </div>
                          </td>
                          <td>
                            <div style={{ position: 'relative', width: 90 }}>
                              <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af', pointerEvents: 'none' }}>$</span>
                              <input type="number" value={item.costo ?? ''} placeholder="—" onChange={e => setCosto(item.id, e.target.value)}
                                className="av-inline-inp av-costo-inp" style={{ paddingLeft: 18, textAlign: 'right' }} />
                            </div>
                          </td>
                          <td>
                            <div className="av-qty">
                              <button className="av-qty-btn" onClick={() => cambiarCantidad(item.id, -1)}><Minus size={12} /></button>
                              <input type="number" value={item.cantidad} onChange={e => setCantidad(item.id, e.target.value)} className="av-qty-val" />
                              <button className="av-qty-btn" onClick={() => cambiarCantidad(item.id, 1)}><Plus size={12} /></button>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, color: '#111827' }}>{fNum(item.precio * item.cantidad)}</td>
                          <td style={{ fontSize: 12, fontWeight: 700, color: ganItem !== null ? (ganItem >= 0 ? '#059669' : '#dc2626') : '#9ca3af', textAlign: 'right' }}>
                            {ganItem !== null ? (ganItem >= 0 ? '+' : '') + fNum(ganItem) : '—'}
                          </td>
                          <td>
                            <button className="av-del-btn" onClick={() => quitarItem(item.id)}><Trash2 size={15} /></button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR DERECHA ── */}
          <div className="av-sidebar">

            {/* Detalles + método de pago compacto */}
            <div className="av-card">
              <div className="av-card-hd" style={{ flexWrap: 'wrap', gap: 10 }}>
                <Calendar size={15} className="av-ico" />
                <span className="av-card-ttl">Detalles</span>
                {/* Método de pago — chips compactos */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>Pago:</span>
                  {[['efectivo', 'Efectivo'], ['transferencia', 'Transf.']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setMetodoPago(val)}
                      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: metodoPago === val ? '1.5px solid #334139' : '1px solid #e5e7eb', background: metodoPago === val ? '#334139' : '#fff', color: metodoPago === val ? '#fff' : '#374151', transition: 'all .12s' }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="av-card-bd" style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '12px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="av-lbl">Fecha</label>
                    <div style={{ position: 'relative' }}>
                      <input type="date" className="av-inp gestify-date-input" value={fechaPedido} onChange={e => setFechaPedido(e.target.value)} style={{ paddingRight: 28, height: 34 }} />
                      <Calendar size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }} />
                    </div>
                  </div>
                  <div>
                    <label className="av-lbl">Entrega <span style={{ fontWeight: 400 }}>(opc.)</span></label>
                    <div style={{ position: 'relative' }}>
                      <input type="date" className="av-inp gestify-date-input" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} style={{ paddingRight: 28, height: 34 }} />
                      <Calendar size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="av-lbl">Estado</label>
                  <div style={{ position: 'relative' }}>
                    <select className="av-inp" value={estado}
                      onChange={e => { setEstado(e.target.value); try { localStorage.setItem('gestify_pedido_estado', e.target.value) } catch {} }}
                      style={{ appearance: 'none', cursor: 'pointer', background: eCfg.bg, color: eCfg.color, border: `1.5px solid ${eCfg.border}`, fontWeight: 700, paddingRight: 28, height: 34 }}>
                      {Object.entries(estadosCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: eCfg.color }} />
                  </div>
                </div>

                {canales.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label className="av-lbl" style={{ marginBottom: 0 }}>Canal <span style={{ fontWeight: 400 }}>(opc.)</span></label>
                      {canalVenta && <button onClick={() => setCanalVenta('')} style={{ fontSize: 10, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>Limpiar</button>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {canales.map(c => (
                        <button key={c} onClick={() => setCanalVenta(canalVenta === c ? '' : c)}
                          style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: canalVenta === c ? 'none' : '1px solid #e5e7eb', background: canalVenta === c ? '#334139' : '#fff', color: canalVenta === c ? '#fff' : '#374151', transition: 'all .12s' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="av-lbl">Notas <span style={{ fontWeight: 400 }}>(opc.)</span></label>
                  <textarea className="av-inp" value={notas} onChange={e => setNotas(e.target.value)}
                    placeholder="Observaciones..." style={{ height: 46, padding: '6px 10px', resize: 'none', lineHeight: 1.5 }} />
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="av-card">
              <div className="av-card-bd" style={{ padding: '14px 16px' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 10px' }}>Resumen</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                    <span>Subtotal</span><span>{fMon(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{fMon(total)}</span>
                  </div>
                  {hayGanancia && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 9px', borderRadius: 7, background: gananciaTotal >= 0 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${gananciaTotal >= 0 ? '#bbf7d0' : '#fecaca'}` }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: gananciaTotal >= 0 ? '#065f46' : '#991b1b' }}>Ganancia est.</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: gananciaTotal >= 0 ? '#059669' : '#dc2626' }}>
                        {gananciaTotal >= 0 ? '+' : ''}{fMon(gananciaTotal)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Adelanto */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label className="av-lbl" style={{ marginBottom: 0 }}>Adelanto</label>
                    <button title="Pagar total" onClick={() => setAdelanto(String(total))}
                      style={{ width: 20, height: 20, background: 'rgba(51,65,57,.08)', color: '#334139', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Check size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div style={{ position: 'relative' }} className={shiftFlash ? 'av-shift-flash' : ''}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9ca3af', pointerEvents: 'none' }}>$</span>
                    <input type="number" placeholder="0.00" step="0.01" className="av-inp"
                      value={adelanto} onChange={e => setAdelanto(e.target.value)}
                      style={{ paddingLeft: 22, textAlign: 'right', height: 36 }} />
                  </div>
                  {adelantoNum > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, paddingTop: 7, borderTop: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: saldo > 0 ? '#92400E' : '#065F46' }}>Saldo pendiente</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: saldo > 0 ? '#92400E' : '#065F46' }}>{fMon(saldo)}</span>
                    </div>
                  )}
                </div>

                <button onClick={handleGuardar} disabled={!puedeGuardar} className="av-btn-confirm">
                  <ShoppingCart size={14} />
                  {isProcessing ? 'Guardando...' : 'Confirmar venta'}
                </button>
                <p style={{ textAlign: 'center', margin: '6px 0 0', fontSize: 10, color: '#9ca3af' }}>
                  <kbd className="av-kbd">Ctrl+↵</kbd> guardar · <kbd className="av-kbd">Shift</kbd> pagar total
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        /* ── base ── */
        .av-root{height:100vh;display:flex;flex-direction:column;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;overflow:hidden;}

        /* ── header oscuro (igual a otros módulos) ── */
        .av-header{background:#282A28;border-bottom:1px solid rgba(255,255,255,.08);padding:0 clamp(16px,3vw,28px);height:56px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:14px;z-index:50;}
        .av-header-l{display:flex;align-items:center;gap:12px;}
        .av-header-r{display:flex;align-items:center;gap:8px;}
        .av-menu-btn{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);cursor:pointer;display:flex;align-items:center;justify-content:center;}
        .av-btn-header-ghost{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.65);transition:all .13s;}
        .av-btn-header-ghost:hover{color:#fff;border-color:rgba(255,255,255,.45);}
        .av-btn-header-save{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;background:#DCED31;border:2px solid rgba(0,0,0,.15);color:#282A28;transition:opacity .13s;}
        .av-btn-header-save:hover:not(:disabled){opacity:.88;}
        .av-btn-header-save:disabled{opacity:.4;cursor:not-allowed;}

        /* ── main ── */
        .av-main{flex:1;overflow:hidden;display:flex;flex-direction:column;padding:clamp(14px,2vw,24px) clamp(32px,5vw,72px);}
        .av-success{display:flex;align-items:center;gap:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;margin-bottom:12px;flex-shrink:0;animation:av-in .3s ease;}
        .av-success-ico{width:30px;height:30px;border-radius:50%;background:#16a34a;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
        .av-success-t{font-size:13px;font-weight:600;color:#166534;margin:0;}
        .av-success-m{font-size:12px;color:#15803d;margin:0;}
        .av-success-x{margin-left:auto;width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:#16a34a;cursor:pointer;border-radius:6px;flex-shrink:0;}
        .av-success-x:hover{background:#dcfce7;}

        .av-layout{flex:1;overflow:hidden;display:grid;grid-template-columns:1fr clamp(320px,32vw,460px);gap:clamp(14px,2vw,28px);}
        .av-col{display:flex;flex-direction:column;gap:14px;overflow-y:auto;padding-right:2px;padding-bottom:4px;}
        .av-sidebar{display:flex;flex-direction:column;gap:10px;overflow-y:auto;padding-bottom:4px;}

        /* scrollbar fino */
        .av-col::-webkit-scrollbar,.av-sidebar::-webkit-scrollbar{width:4px;}
        .av-col::-webkit-scrollbar-track,.av-sidebar::-webkit-scrollbar-track{background:transparent;}
        .av-col::-webkit-scrollbar-thumb,.av-sidebar::-webkit-scrollbar-thumb{background:rgba(48,54,47,.18);border-radius:4px;}

        /* ── cards ── */
        .av-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;flex-shrink:0;}
        .av-card-hd{display:flex;align-items:center;gap:8px;padding:14px 20px;border-bottom:1px solid #f3f4f6;border-radius:12px 12px 0 0;}
        .av-ico{color:#334139;flex-shrink:0;}
        .av-card-ttl{font-size:14px;font-weight:600;color:#111827;}
        .av-card-bd{padding:16px 20px;}

        /* carrito crece para ocupar espacio disponible */
        .av-card-carrito{background:#fff;border:1px solid #e5e7eb;border-radius:12px;flex:1;min-height:0;display:flex;flex-direction:column;}
        .av-carrito-body{flex:1;overflow-y:auto;min-height:80px;}
        .av-carrito-body::-webkit-scrollbar{width:3px;}
        .av-carrito-body::-webkit-scrollbar-thumb{background:rgba(48,54,47,.15);border-radius:3px;}

        /* ── cliente ── */
        .av-cliente-row{display:flex;align-items:flex-end;gap:10px;}
        .av-lbl{display:block;font-size:11px;font-weight:500;color:#374151;margin-bottom:4px;}
        .av-select{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;cursor:pointer;text-align:left;transition:border-color .13s;}
        .av-select:hover{border-color:#d1d5db;}
        .av-drop{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid #d1d5db;border-radius:10px;box-shadow:0 12px 30px -6px rgba(0,0,0,.15),0 4px 8px -2px rgba(0,0,0,.06);z-index:300;max-height:220px;overflow-y:auto;}
        .av-drop-inp{width:100%;border:1px solid #e5e7eb;border-radius:6px;padding:6px 10px;font-size:13px;outline:none;box-sizing:border-box;background:#fff;}
        .av-drop-item{width:100%;display:flex;flex-direction:column;gap:1px;padding:10px 14px;text-align:left;font-size:13px;color:#374151;background:#ffffff;border:none;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:background .1s;}
        .av-drop-item:hover{background:#F1F5F9;color:#111827;}
        .av-drop-item.av-drop-active{background:#E2E8F0;color:#111827;font-weight:600;border-left:3px solid #334139;padding-left:11px;}

        /* ── search productos ── */
        .av-search-inp{width:100%;padding:10px 12px 10px 36px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;background:#fff;}
        .av-search-inp:focus{border-color:#334139;box-shadow:0 0 0 3px rgba(51,65,57,.08);}
        .av-search-res{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#ffffff;border:none;border-bottom:1px solid #f3f4f6;cursor:pointer;text-align:left;gap:8px;transition:background .1s;}
        .av-search-res:hover{background:#F1F5F9;}
        .av-search-res.av-drop-active{background:#E2E8F0;border-left:3px solid #334139;padding-left:11px;font-weight:600;}

        /* ── tabla carrito ── */
        .av-table{width:100%;border-collapse:collapse;}
        .av-table th{padding:10px 16px;text-align:left;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;background:#f9fafb;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:1;}
        .av-table td{padding:12px 16px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;vertical-align:middle;}
        .av-table tr:last-child td{border-bottom:none;}

        /* cantidad — fondo blanco explícito */
        .av-qty{display:inline-flex;align-items:center;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;}
        .av-qty-btn{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:#f5f5f3;border:none;cursor:pointer;color:#374151;flex-shrink:0;}
        .av-qty-btn:hover{background:#ececea;}
        .av-qty-val{width:36px;text-align:center;font-size:13px;font-weight:500;border:none;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;padding:0;height:26px;outline:none;background:#fff;color:#111827;}

        .av-del-btn{width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:#ef4444;cursor:pointer;border-radius:6px;}
        .av-del-btn:hover{background:#fef2f2;}
        .av-inline-inp{width:88px;height:26px;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;outline:none;box-sizing:border-box;padding:0 6px;background:#fff;color:#111827;}
        .av-inline-inp:focus{border-color:#334139;}
        .av-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;color:#9ca3af;text-align:center;}
        .av-empty p{margin:0;font-size:13px;}

        /* ── botones contenido ── */
        .av-btn-outline{display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;background:#fff;border:1px solid #e5e7eb;color:#374151;transition:background .13s;white-space:nowrap;}
        .av-btn-outline:hover{background:#f5f5f3;}
        .av-toggle-btn{padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;background:#fff;border:1px solid #e5e7eb;color:#9ca3af;transition:all .13s;white-space:nowrap;}
        .av-toggle-btn.active{border-color:#334139;color:#334139;}

        /* ── pago ── */
        .av-pay-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .av-pay-btn{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;font-weight:500;color:#374151;cursor:pointer;transition:all .13s;}
        .av-pay-btn:hover{border-color:#d1d5db;background:#f5f5f3;}
        .av-pay-btn.active{border-color:#334139;border-width:2px;color:#334139;font-weight:700;background:#f0f4f0;}

        /* ── inputs ── */
        .av-inp{width:100%;height:40px;padding:0 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#111827;outline:none;box-sizing:border-box;background:#fff;}
        .av-inp:focus{border-color:#334139;box-shadow:0 0 0 3px rgba(51,65,57,.08);}
        textarea.av-inp{height:auto;}

        /* ── confirmar ── */
        .av-btn-confirm{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;background:#334139;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .13s;}
        .av-btn-confirm:hover:not(:disabled){background:#2a3530;}
        .av-btn-confirm:disabled{background:rgba(51,65,57,.3);cursor:not-allowed;}

        /* ── acciones ── */
        .av-accion{width:100%;display:flex;align-items:center;gap:8px;padding:10px 12px;background:transparent;border:none;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;cursor:pointer;transition:background .1s;text-align:left;}
        .av-accion:last-child{border-bottom:none;}
        .av-accion:hover{background:#f5f5f3;}
        .av-accion-danger{color:#ef4444;}
        .av-accion-danger:hover{background:#fef2f2;}

        /* ── kbd ── */
        .av-kbd{padding:1px 4px;background:#f3f4f6;border-radius:3px;font-family:monospace;font-size:9px;}

        @keyframes av-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
        @keyframes av-flash{0%{background:#ffffff}30%{background:#dcfce7}100%{background:#ffffff}}
        .av-costo-inp{background:#fffbf0;border-color:#fde68a;}
        .av-costo-inp:focus{border-color:#f59e0b !important;box-shadow:0 0 0 3px rgba(245,158,11,.12) !important;}

        .gestify-date-input::-webkit-calendar-picker-indicator{position:absolute;top:0;left:0;right:0;bottom:0;width:auto;height:auto;color:transparent;background:transparent;cursor:pointer;z-index:10;}
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type="number"]{-moz-appearance:textfield}

        /* ── responsive notebook grande ── */
        @media(max-width:1400px){.av-layout{grid-template-columns:1fr clamp(280px,28vw,380px);}}
        @media(max-width:1100px){.av-layout{grid-template-columns:1fr 300px;}
          .av-main{padding:clamp(12px,2vw,20px) clamp(16px,3vw,36px);}}
        @media(max-width:900px){.av-layout{grid-template-columns:1fr 268px;}}

        /* ── responsive tablet ── */
        @media(max-width:820px){
          .av-root{height:auto;overflow:auto;}
          .av-main{overflow:visible;flex:none;padding:16px 20px;}
          .av-layout{grid-template-columns:1fr;height:auto;overflow:visible;}
          .av-col,.av-sidebar{overflow:visible;}
          .av-card-carrito{flex:none;}
          .av-sidebar{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        }
        @media(max-width:600px){
          .av-sidebar{grid-template-columns:1fr;}
        }

        /* ── responsive móvil ── */
        @media(max-width:520px){
          .av-main{padding:10px 12px;}
          .av-layout{gap:10px;}
          .av-cliente-row{flex-direction:column;align-items:stretch;}
          .av-btn-outline{width:100%;justify-content:center;}
          .av-header-r .av-btn-header-ghost{display:none;}
          .av-table th:nth-child(2),.av-table td:nth-child(2){display:none;}
          .av-table th,.av-table td{padding:8px 10px;}
          .av-card-hd{padding:12px 14px;}
          .av-card-bd{padding:12px 14px;}
        }
      `}</style>
    </div>
  )
}

export default AgregarVenta
