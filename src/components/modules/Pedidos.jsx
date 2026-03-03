"use client"

import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus, Search, Package, CheckCircle, Clock, XCircle,
  Truck, Edit, Eye, FileText, DollarSign, ChevronLeft,
  ChevronRight, List, CalendarDays, Calendar, CheckSquare,
  Trash2, ChevronDown, AlertCircle, X
  , Menu
} from "lucide-react"
import { useTheme } from '../../lib/ThemeContext'

/* ══════════════════════════════════════════════
   PALETA GESTIFY
   #E0E1DD  fondo app
   #373F47  surface (sidebar/topbar)
   #334139  acento verde musgo
   #30362F  texto oscuro (ct1)
   #8B8982  piedra / texto suave (ct3)
══════════════════════════════════════════════ */

const Pedidos = ({
  pedidos = [],
  clientes = [],
  searchTerm = "",
  setSearchTerm,
  openModal,
  actualizarEstadoPedido,
  eliminarPedido,
  facturarPedido,
  recargarDatos
  , onOpenMobileSidebar }) => {
  const { darkMode } = useTheme()
  const D = darkMode // alias corto

  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [filtroFacturacion, setFiltroFacturacion] = useState("todos")
  const [vistaActiva, setVistaActiva] = useState("lista")
  const [fechaActual, setFechaActual] = useState(new Date())
  const [modoSeleccion, setModoSeleccion] = useState(false)
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState([])
  const [eliminandoMasivo, setEliminandoMasivo] = useState(false)
  const [dialogo, setDialogo] = useState({ open: false, type: 'alert', title: '', message: '', onConfirm: null, isDestructive: false })

  /* ── diálogos ── */
  const customAlert = (title, message) => setDialogo({ open: true, type: 'alert', title, message, onConfirm: null, isDestructive: false })
  const customConfirm = (title, message, onConfirm, isDestructive = false) => setDialogo({ open: true, type: 'confirm', title, message, onConfirm, isDestructive })
  const cerrarDialogo = () => setDialogo(p => ({ ...p, open: false }))

  const pedidosSeguros = Array.isArray(pedidos) ? pedidos : []

  /* ── filtros ── */
  const filtrarPedidos = pedidosSeguros.filter(p => {
    const q = String(searchTerm || "").toLowerCase()
    const busq = String(p.codigo || "").toLowerCase().includes(q) || String(p.cliente_nombre || "").toLowerCase().includes(q)
    const estado = filtroEstado === "todos" || p.estado === filtroEstado
    const fact = filtroFacturacion === "todos" || (filtroFacturacion === "facturados" && p.factura_id) || (filtroFacturacion === "no-facturados" && !p.factura_id)
    return busq && estado && fact
  }).sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))

  const totalPaginas = Math.ceil(filtrarPedidos.length / itemsPorPagina)
  const pedidosPaginados = filtrarPedidos.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)

  useEffect(() => { setPaginaActual(1) }, [filtroEstado, filtroFacturacion, searchTerm, itemsPorPagina])

  /* ── atajo de teclado (solo Ctrl) ── */
  useEffect(() => {
    let ctrlPressed = false
    let otherKeyPressed = false

    const handleKeyDown = (e) => {
      if (e.key === 'Control') {
        ctrlPressed = true
      } else if (ctrlPressed) {
        otherKeyPressed = true
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'Control') {
        if (!otherKeyPressed && openModal) {
          // Si estamos escribiendo en un input, es mejor no abrirlo para evitar abrir sin querer, 
          // pero el usuario pidió que con Ctrl se abra.
          // Para evitar aperturas molestas, revisamos si el foco está en un input/textarea:
          const active = document.activeElement
          const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
          if (!isInput) {
            openModal('nuevo-pedido')
          }
        }
        ctrlPressed = false
        otherKeyPressed = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [openModal])

  /* -- estados operativos (colores solidos, bien visibles) -- */
  const estadosCfg = {
    pendiente: { label: 'Pendiente', Icon: Clock, bg: 'rgba(139,137,130,.12)', color: '#5a5753', border: 'rgba(139,137,130,.30)' },
    preparando: { label: 'Preparando', Icon: Package, bg: 'rgba(55,63,71,.10)', color: '#373F47', border: 'rgba(55,63,71,.28)' },
    enviado: { label: 'Enviado', Icon: Truck, bg: 'rgba(96,107,108,.12)', color: '#3d4d4f', border: 'rgba(96,107,108,.30)' },
    entregado: { label: 'Entregado', Icon: CheckCircle, bg: 'rgba(48,54,47,.10)', color: '#30362F', border: 'rgba(48,54,47,.28)' },
    cancelado: { label: 'Cancelado', Icon: XCircle, bg: 'rgba(139,137,130,.08)', color: '#8B8982', border: 'rgba(139,137,130,.20)' },
  }

  /* -- estado de pago (solido y visible) -- */
  const getEstadoPago = (p) => {
    const total = parseFloat(p.total) || 0
    const abonado = parseFloat(p.monto_abonado) || 0
    const saldo = p.saldo_pendiente !== undefined ? parseFloat(p.saldo_pendiente) : total - abonado
    if (saldo <= 0.01) return { label: 'Pagado', Icon: CheckCircle, bg: 'rgba(48,54,47,.10)', color: '#30362F', border: 'rgba(48,54,47,.25)' }
    if (abonado > 0) return { label: 'Pago parcial', Icon: DollarSign, bg: 'rgba(96,107,108,.12)', color: '#3d4d4f', border: 'rgba(96,107,108,.28)' }
    return { label: 'Sin pago', Icon: Clock, bg: 'rgba(139,137,130,.10)', color: '#6b6864', border: 'rgba(139,137,130,.25)' }
  }

  /* ── resumen ── */
  const resumen = {
    total: pedidosSeguros.length,
    pendientes: pedidosSeguros.filter(p => p.estado === 'pendiente').length,
    enProceso: pedidosSeguros.filter(p => p.estado === 'preparando').length,
    entregados: pedidosSeguros.filter(p => p.estado === 'entregado').length,
    conSaldo: pedidosSeguros.filter(p => (parseFloat(p.saldo_pendiente) || parseFloat(p.total) || 0) > 0).length,
    totalDeuda: pedidosSeguros.reduce((s, p) => { const v = parseFloat(p.saldo_pendiente) || parseFloat(p.total) || 0; return s + (v > 0 ? v : 0) }, 0)
  }

  /* ── formato ── */
  const fFecha = (f) => { try { return new Date(f).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) } catch { return "—" } }
  const fMonto = (m) => (parseFloat(m) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fCorto = (m) => (parseFloat(m) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  /* ── handlers ── */
  const sePuedeEditar = (p) => !p.factura_id && p.estado !== 'cancelado'
  const sePuedeFacturar = (p) => !p.factura_id

  const handleFacturar = (id) => facturarPedido && customConfirm('Facturar Pedido', '¿Facturar este pedido? Se creará una factura separada.', async () => { const r = await facturarPedido(id); if (r?.success && recargarDatos) recargarDatos() })
  const handleEstado = async (id, est) => { if (actualizarEstadoPedido) { const r = await actualizarEstadoPedido(id, est); if (r?.success && recargarDatos) recargarDatos() } }
  const handleEliminar = (id) => eliminarPedido && customConfirm('Eliminar Venta', '¿Estás seguro de eliminar esta venta?', async () => { const r = await eliminarPedido(id); if (r?.success && recargarDatos) recargarDatos() }, true)

  const toggleModoSeleccion = () => { setModoSeleccion(p => !p); setPedidosSeleccionados([]) }
  const toggleSeleccion = (id) => setPedidosSeleccionados(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleTodos = () => { const ids = pedidosPaginados.map(p => p.id); const all = ids.every(id => pedidosSeleccionados.includes(id)); setPedidosSeleccionados(p => all ? p.filter(id => !ids.includes(id)) : [...new Set([...p, ...ids])]) }

  const handleEliminarMasivo = () => {
    if (!eliminarPedido || pedidosSeleccionados.length === 0) return
    customConfirm('Eliminar múltiples', `¿Eliminar ${pedidosSeleccionados.length} pedido(s)? Esta acción no se puede deshacer.`, async () => {
      setEliminandoMasivo(true)
      try { for (const id of pedidosSeleccionados) await eliminarPedido(id); setPedidosSeleccionados([]); setModoSeleccion(false); if (recargarDatos) recargarDatos() }
      finally { setEliminandoMasivo(false) }
    }, true)
  }

  /* ── tokens de color base (light system) ── */
  const bg = '#F5F5F5'
  const surface = '#FAFAFA'
  const surface2 = '#f2f2f2'
  const border = 'rgba(48,54,47,.13)'
  const ct1 = '#1e2320'
  const ct2 = '#30362F'
  const ct3 = '#8B8982'
  const accent = '#334139'
  const accentL = 'rgba(51,65,57,.08)'

  /* ── clases reutilizables ── */
  const cardCls = `rounded-xl overflow-hidden border transition-all`
  const cardStyle = { background: surface, borderColor: border, boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)' }
  const pillSelect = {
    background: surface,
    border: `1px solid ${border}`,
    color: ct2,
    borderRadius: '8px',
    padding: '6px 11px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    transition: 'border-color .13s',
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ═══════════ HEADER ═══════════ */}
      <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
            <Menu size={16} strokeWidth={2} />
          </button>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Ventas</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Vista toggle */}
          <div style={{ display: 'flex', padding: 2, borderRadius: 9, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.05)' }}>
            {[['lista', List, 'Lista'], ['semana', CalendarDays, 'Semana'], ['mes', Calendar, 'Mes']].map(([v, Icon, lbl]) => (
              <button key={v} onClick={() => setVistaActiva(v)} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7,
                fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all .13s',
                background: vistaActiva === v ? 'rgba(255,255,255,.12)' : 'transparent',
                color: vistaActiva === v ? '#fff' : 'rgba(255,255,255,.5)',
              }}>
                <Icon size={12} strokeWidth={2.5} /><span>{lbl}</span>
              </button>
            ))}
          </div>

          {/* Selección */}
          <button onClick={toggleModoSeleccion} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8,
            fontSize: 11, fontWeight: 600,
            border: modoSeleccion ? '1px solid #DCED31' : '1px solid rgba(255,255,255,.2)',
            background: 'transparent',
            color: modoSeleccion ? '#DCED31' : 'rgba(255,255,255,.6)',
            cursor: 'pointer', transition: 'all .13s',
          }}>
            <CheckSquare size={12} strokeWidth={2} /> {modoSeleccion ? 'Cancelar' : 'Selección'}
          </button>

          {/* Presupuesto */}
          <button onClick={() => openModal && openModal("nuevo-presupuesto")} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, border: '1px solid rgba(255,255,255,.25)', cursor: 'pointer', transition: 'all .13s',
            background: 'transparent', color: 'rgba(255,255,255,.75)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.75)' }}>
            <FileText size={12} strokeWidth={2.5} /> Presupuesto
          </button>

          {/* Nuevo */}
          <button onClick={() => openModal && openModal("nuevo-pedido")} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, border: '1px solid #DCED31', cursor: 'pointer', transition: 'all .13s',
            background: '#DCED31', color: '#282A28',
          }}>
            <Plus size={12} strokeWidth={2.5} /> Nueva Venta
            <span style={{ marginLeft: 4, padding: '2px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontSize: 9, fontFamily: "'DM Mono', monospace" }}>Ctrl</span>
          </button>
        </div>
      </header>

      {/* ═══════════ CARDS RESUMEN (4 diferenciadas) ═══════════ */}
      <div style={{ padding: 'clamp(10px,2vw,12px) clamp(12px,3vw,24px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {[
          {
            label: 'Pedidos activos', val: resumen.pendientes + resumen.enProceso,
            sub: `${resumen.pendientes} pendientes · ${resumen.enProceso} en proceso`,
            Icon: Package, bar: '#334139', iconBg: 'rgba(51,65,57,.1)', iconC: '#334139',
          },
          {
            label: 'Por cobrar', val: `$${fCorto(resumen.totalDeuda)}`,
            sub: `${resumen.conSaldo} pedido${resumen.conSaldo !== 1 ? 's' : ''} con saldo`,
            Icon: DollarSign, bar: '#373F47', iconBg: 'rgba(55,63,71,.1)', iconC: '#373F47',
          },
          {
            label: 'Entregados', val: resumen.entregados,
            sub: 'Completados este período',
            Icon: CheckCircle, bar: '#606B6C', iconBg: 'rgba(96,107,108,.1)', iconC: '#606B6C',
          },
          {
            label: 'Total pedidos', val: resumen.total,
            sub: 'Registrados en el sistema',
            Icon: AlertCircle, bar: 'rgba(139,137,130,.4)', iconBg: 'rgba(139,137,130,.08)', iconC: '#8B8982',
          },
        ].map(({ label, val, sub, Icon, bar, iconBg, iconC }, i) => (
          <div key={i} className={cardCls} style={{
            ...cardStyle,
            background: '#E1E1E0',
            padding: '12px 14px 10px', position: 'relative', cursor: 'default',
            transition: 'box-shadow .2s,transform .2s', animation: `kpiIn .35s ${.05 + i * .07}s ease both`,
            boxShadow: `0 2px 8px ${bar}28, 0 6px 20px ${bar}18`,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${bar}45, 0 10px 32px ${bar}28` }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 8px ${bar}28, 0 6px 20px ${bar}18` }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#6B7274', borderRadius: '12px 0 0 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} strokeWidth={1.8} style={{ color: iconC }} />
              </div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: ct1, lineHeight: 1, marginBottom: 4 }}>{val}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: ct2, marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 10, color: ct3 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ═══════════ VISTA LISTA ═══════════ */}
      {vistaActiva === "lista" && (
        <div style={{ padding: 'clamp(10px,2vw,14px) clamp(12px,3vw,24px) 32px' }}>
          <div className={cardCls} style={cardStyle}>

            {/* Filtros */}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', gap: 8, flexWrap: 'wrap', background: surface2 }}>
              {/* Buscador */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 200, height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${border}`, background: surface }}>
                <Search size={12} strokeWidth={2} style={{ color: ct3, flexShrink: 0 }} />
                <input
                  type="text" placeholder="Buscar por código o cliente…"
                  value={searchTerm} onChange={e => setSearchTerm && setSearchTerm(e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12, fontFamily: 'Inter,sans-serif', color: ct1, width: '100%' }}
                />
              </div>
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={pillSelect}>
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="preparando">Preparando</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <select value={filtroFacturacion} onChange={e => setFiltroFacturacion(e.target.value)} style={pillSelect}>
                <option value="todos">Toda facturación</option>
                <option value="facturados">Facturados</option>
                <option value="no-facturados">Sin facturar</option>
              </select>
            </div>

            {/* Cabecera tabla */}
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 900 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: modoSeleccion ? '32px 1.1fr 1.6fr .8fr .9fr 1.2fr 240px' : '1.1fr 1.6fr .8fr .9fr 1.2fr 240px',
                  gap: 14, padding: '10px 16px', borderBottom: `1px solid ${border}`, background: surface2
                }}>
                  {modoSeleccion && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" style={{ accentColor: accent, width: 14, height: 14, cursor: 'pointer' }}
                        checked={pedidosPaginados.length > 0 && pedidosPaginados.every(p => pedidosSeleccionados.includes(p.id))}
                        onChange={toggleTodos} />
                    </div>
                  )}
                  {['Código', 'Cliente', 'Fecha', 'Total', 'Estado', 'Acciones'].map((col, i) => (
                    <div key={i} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: ct3, textAlign: i >= 2 && i <= 3 ? 'center' : i === 5 ? 'right' : 'left' }}>{col}</div>
                  ))}
                </div>

                {/* Filas */}
                <div>
                  {pedidosPaginados.length > 0 ? pedidosPaginados.map((pedido) => {
                    const cfg = estadosCfg[pedido.estado] || estadosCfg.pendiente
                    const pago = getEstadoPago(pedido)
                    const saldo = pedido.saldo_pendiente !== null && pedido.saldo_pendiente !== undefined ? parseFloat(pedido.saldo_pendiente) : parseFloat(pedido.total)
                    const sel = pedidosSeleccionados.includes(pedido.id)
                    const cliente = clientes.find(c => c.id === pedido.cliente_id)

                    return (
                      <div key={pedido.id}
                        onClick={modoSeleccion ? () => toggleSeleccion(pedido.id) : undefined}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: modoSeleccion ? '32px 1.1fr 1.6fr .8fr .9fr 1.2fr 240px' : '1.1fr 1.6fr .8fr .9fr 1.2fr 240px',
                          gap: 14, padding: '12px 16px', borderBottom: `1px solid ${border}`,
                          background: sel ? accentL : 'transparent',
                          cursor: modoSeleccion ? 'pointer' : 'default',
                          transition: 'background .13s', alignItems: 'center', position: 'relative',
                        }}
                        onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'rgba(51,65,57,.02)' }}
                        onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}>
                        {/* Barra lateral de color por estado */}
                        <div style={{
                          position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, background:
                            pedido.estado === 'pendiente' ? '#334139' :
                              pedido.estado === 'preparando' ? '#373F47' :
                                pedido.estado === 'enviado' ? '#8B8982' :
                                  pedido.estado === 'entregado' ? '#606B6C' : 'rgba(139,137,130,.3)', borderRadius: '0 2px 2px 0'
                        }} />

                        {/* Checkbox Selección */}
                        {modoSeleccion && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <input type="checkbox" style={{ accentColor: accent, width: 14, height: 14, cursor: 'pointer' }}
                              checked={sel} readOnly />
                          </div>
                        )}

                        {/* Código */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(51,65,57,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={13} strokeWidth={2} style={{ color: accent }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: ct1, letterSpacing: '-0.01em' }}>{pedido.codigo || 'N/A'}</div>
                            {pedido.factura_id && <div style={{ fontSize: 10, fontWeight: 600, color: '#606B6C', marginTop: 1 }}>✓ Facturado</div>}
                          </div>
                        </div>

                        {/* Cliente y Productos */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: ct1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{pedido.cliente_nombre || '—'}</div>
                          {(() => {
                            try {
                              const stItems = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : (pedido.items || []);
                              if (stItems.length === 0) return cliente?.telefono ? <div style={{ fontSize: 11, color: ct3, marginTop: 1 }}>{cliente.telefono}</div> : null;
                              const summary = stItems.map(i => `${i.cantidad}x ${i.producto}`).join(', ');
                              return (
                                <div style={{ fontSize: 10, color: ct3, marginTop: 3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={summary}>
                                  <span style={{ color: accent, fontWeight: 700, marginRight: 4 }}>📦</span>
                                  {summary}
                                </div>
                              );
                            } catch {
                              return cliente?.telefono ? <div style={{ fontSize: 11, color: ct3, marginTop: 1 }}>{cliente.telefono}</div> : null;
                            }
                          })()}
                        </div>

                        {/* Fecha */}
                        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, color: ct2 }}>{fFecha(pedido.fecha_pedido)}</div>

                        {/* Total */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: ct1, letterSpacing: '-0.02em' }}>${fCorto(pedido.total)}</div>
                          {saldo > 0.01 && <div style={{ fontSize: 10, fontWeight: 600, color: accent, marginTop: 1 }}>Saldo: ${fCorto(saldo)}</div>}
                        </div>


                        {/* Estado (operativo + pago — chips con colores solidos) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start', minWidth: 100 }}>
                          <select
                            value={pedido.estado}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); handleEstado(pedido.id, e.target.value) }}
                            style={{
                              appearance: 'none', WebkitAppearance: 'none',
                              border: '1px solid ' + cfg.border, outline: 'none', cursor: 'pointer',
                              padding: '4px 26px 4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                              fontFamily: 'Inter,sans-serif', letterSpacing: '0.01em', transition: 'box-shadow .15s',
                              background: `${cfg.bg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(cfg.color)}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 7px center`,
                              color: cfg.color, width: 'fit-content',
                              boxShadow: '0 1px 3px rgba(48,54,47,.06)',
                              WebkitTapHighlightColor: 'transparent',
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(48,54,47,.14)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(48,54,47,.06)'}>
                            <option value="pendiente">Pendiente</option>
                            <option value="preparando">Preparando</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: pago.bg, color: pago.color, border: '1px solid ' + pago.border, width: 'fit-content' }}>
                            <pago.Icon size={10} strokeWidth={2.5} />
                            {pago.label}
                          </span>
                        </div>

                        {/* Acciones — botones con palabras bien minimalistas */}
                        {modoSeleccion ? (
                          <div />
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                            <ActionBtn text="Ver" onClick={e => { e.stopPropagation(); openModal && openModal('ver-pedido', pedido) }} title="Ver detalles" D={D}>
                              <Eye size={12} strokeWidth={2.2} />
                            </ActionBtn>

                            {sePuedeEditar(pedido) && (
                              <ActionBtn text="Editar" onClick={e => { e.stopPropagation(); openModal && openModal('editar-pedido', pedido) }} title="Editar pedido" D={D}>
                                <Edit size={12} strokeWidth={2.2} />
                              </ActionBtn>
                            )}

                            {!pedido.factura_id && (
                              <ActionBtn text="Borrar" onClick={e => { e.stopPropagation(); handleEliminar(pedido.id) }} title="Eliminar pedido" danger D={D}>
                                <Trash2 size={12} strokeWidth={2.2} />
                              </ActionBtn>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  }) : (
                    /* Empty state */
                    <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: accentL, border: `1px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                        <Package size={18} strokeWidth={1.5} style={{ color: accent, opacity: .6 }} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: ct3 }}>No se encontraron ventas</p>
                      <p style={{ fontSize: 11, color: ct3, opacity: .6, marginTop: 3 }}>Intentá cambiar los filtros</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Paginación */}
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${border}`, background: surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: ct3 }}>
                  Mostrando {Math.min(filtrarPedidos.length, pedidosPaginados.length)} de {filtrarPedidos.length}
                </span>
                <select value={itemsPorPagina} onChange={e => setItemsPorPagina(Number(e.target.value))} style={{ ...pillSelect, padding: '4px 8px', fontSize: 11 }}>
                  <option value="5">5 / pág</option>
                  <option value="10">10 / pág</option>
                  <option value="25">25 / pág</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <PageBtn onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} D={false} border={border} surface={surface} ct2={ct2}>
                  <ChevronLeft size={13} strokeWidth={2.5} />
                </PageBtn>
                <span style={{ fontSize: 11, fontWeight: 600, color: ct2, padding: '0 6px', letterSpacing: '-0.01em' }}>
                  {paginaActual} / {totalPaginas || 1}
                </span>
                <PageBtn onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas || totalPaginas === 0} D={false} border={border} surface={surface} ct2={ct2}>
                  <ChevronRight size={13} strokeWidth={2.5} />
                </PageBtn>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════ VISTA CALENDARIO ═══════════ */}
      {(vistaActiva === "semana" || vistaActiva === "mes") && (() => {
        const year = fechaActual.getFullYear()
        const month = fechaActual.getMonth()

        // Pedidos que tienen fecha_entrega_estimada
        const pedidosConFecha = pedidosSeguros.filter(p => p.fecha_entrega_estimada)

        // Agrupar pedidos por fecha de entrega (key = "YYYY-MM-DD")
        const porFecha = {}
        pedidosConFecha.forEach(p => {
          const key = p.fecha_entrega_estimada?.slice(0, 10)
          if (key) { if (!porFecha[key]) porFecha[key] = []; porFecha[key].push(p) }
        })

        const estadoColor = { pendiente: '#8B8982', preparando: '#373F47', enviado: '#606B6C', entregado: '#334139', cancelado: '#b0aca8' }

        if (vistaActiva === 'mes') {
          // Primer día del mes y cantidad de días
          const primero = new Date(year, month, 1)
          const diasEnMes = new Date(year, month + 1, 0).getDate()
          const inicioSemana = primero.getDay() // 0=dom

          const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
          const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

          // Celdas: espacios vacíos + días del mes
          const celdas = []
          for (let i = 0; i < inicioSemana; i++) celdas.push(null)
          for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

          const hoy = new Date(); const esHoy = (d) => d && hoy.getFullYear() === year && hoy.getMonth() === month && hoy.getDate() === d

          return (
            <div style={{ padding: '14px 24px 32px' }}>
              <div className={cardCls} style={cardStyle}>
                {/* Nav */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: surface2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={15} strokeWidth={2} style={{ color: accent }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: ct1, letterSpacing: '-.02em' }}>
                      {meses[month]} {year}
                    </span>
                    <span style={{ fontSize: 11, color: ct3, marginLeft: 4 }}>
                      · {pedidosConFecha.filter(p => { const d = new Date(p.fecha_entrega_estimada); return d.getFullYear() === year && d.getMonth() === month }).length} entregas este mes
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setFechaActual(new Date(year, month - 1, 1))} style={{ width: 28, height: 28, border: `1px solid ${border}`, background: surface, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct2 }}>
                      <ChevronLeft size={13} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => setFechaActual(new Date())} style={{ height: 28, padding: '0 10px', border: `1px solid ${border}`, background: surface, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: ct2 }}>
                      Hoy
                    </button>
                    <button onClick={() => setFechaActual(new Date(year, month + 1, 1))} style={{ width: 28, height: 28, border: `1px solid ${border}`, background: surface, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct2 }}>
                      <ChevronRight size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Cabecera días */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${border}`, background: surface2 }}>
                  {dias.map(d => (
                    <div key={d} style={{ padding: '6px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{d}</div>
                  ))}
                </div>

                {/* Grid de días */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {celdas.map((dia, i) => {
                    const key = dia ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}` : null
                    const pedidosDia = key ? (porFecha[key] || []) : []
                    const hoyDia = esHoy(dia)
                    return (
                      <div key={i} style={{
                        minHeight: 90, padding: '6px 7px', borderRight: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
                        background: !dia ? 'rgba(48,54,47,.015)' : hoyDia ? 'rgba(51,65,57,.04)' : 'transparent',
                        transition: 'background .13s',
                      }}>
                        {dia && (
                          <>
                            <div style={{ fontSize: 11, fontWeight: hoyDia ? 800 : 500, color: hoyDia ? accent : ct3, marginBottom: 4, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: hoyDia ? 'rgba(51,65,57,.12)' : 'transparent' }}>
                              {dia}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {pedidosDia.slice(0, 3).map((p, j) => (
                                <button key={j} onClick={() => openModal && openModal('ver-pedido', p)}
                                  style={{ textAlign: 'left', width: '100%', padding: '2px 6px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#fff', background: estadoColor[p.estado] || '#8B8982', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'opacity .1s' }}
                                  onMouseEnter={e => e.currentTarget.style.opacity = '.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                  title={`${p.cliente_nombre} · ${p.codigo}`}>
                                  {p.cliente_nombre || p.codigo}
                                </button>
                              ))}
                              {pedidosDia.length > 3 && (
                                <span style={{ fontSize: 9, color: ct3, fontWeight: 600, paddingLeft: 4 }}>+{pedidosDia.length - 3} más</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        }

        // ── VISTA SEMANA ──
        const inicioSem = new Date(fechaActual)
        const diaSem = inicioSem.getDay()
        inicioSem.setDate(inicioSem.getDate() - diaSem)
        const diasSemana = Array.from({ length: 7 }, (_, i) => { const d = new Date(inicioSem); d.setDate(inicioSem.getDate() + i); return d })
        const diasLabel = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        const meses2 = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const hoy2 = new Date()
        const esHoy2 = (d) => d.getFullYear() === hoy2.getFullYear() && d.getMonth() === hoy2.getMonth() && d.getDate() === hoy2.getDate()

        return (
          <div style={{ padding: '14px 24px 32px' }}>
            <div className={cardCls} style={cardStyle}>
              {/* Nav semana */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: surface2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarDays size={15} strokeWidth={2} style={{ color: accent }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: ct1, letterSpacing: '-.02em' }}>
                    {diasSemana[0].getDate()} {meses2[diasSemana[0].getMonth()]} — {diasSemana[6].getDate()} {meses2[diasSemana[6].getMonth()]} {diasSemana[6].getFullYear()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { const d = new Date(fechaActual); d.setDate(d.getDate() - 7); setFechaActual(d) }} style={{ width: 28, height: 28, border: `1px solid ${border}`, background: surface, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct2 }}>
                    <ChevronLeft size={13} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setFechaActual(new Date())} style={{ height: 28, padding: '0 10px', border: `1px solid ${border}`, background: surface, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: ct2 }}>
                    Hoy
                  </button>
                  <button onClick={() => { const d = new Date(fechaActual); d.setDate(d.getDate() + 7); setFechaActual(d) }} style={{ width: 28, height: 28, border: `1px solid ${border}`, background: surface, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct2 }}>
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Columnas de días */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {diasSemana.map((dia, i) => {
                  const key = `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, '0')}-${String(dia.getDate()).padStart(2, '0')}`
                  const pedidosDia = porFecha[key] || []
                  const hoy = esHoy2(dia)
                  return (
                    <div key={i} style={{ borderRight: i < 6 ? `1px solid ${border}` : 'none', minHeight: 200 }}>
                      {/* Cabecera día */}
                      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${border}`, background: hoy ? 'rgba(51,65,57,.06)' : surface2, textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{diasLabel[i]}</div>
                        <div style={{ fontSize: 18, fontWeight: hoy ? 800 : 500, color: hoy ? accent : ct1, marginTop: 2 }}>{dia.getDate()}</div>
                      </div>
                      {/* Pedidos */}
                      <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {pedidosDia.map((p, j) => (
                          <button key={j} onClick={() => openModal && openModal('ver-pedido', p)}
                            style={{ textAlign: 'left', width: '100%', padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: estadoColor[p.estado] || '#8B8982', transition: 'opacity .1s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.cliente_nombre || '—'}</div>
                            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.75)', marginTop: 1 }}>{p.codigo} · ${(parseFloat(p.total) || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</div>
                          </button>
                        ))}
                        {pedidosDia.length === 0 && (
                          <div style={{ fontSize: 10, color: ct3, textAlign: 'center', paddingTop: 12, opacity: .5 }}>—</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ═══════════ BARRA SELECCIÓN MASIVA ═══════════ */}
      {modoSeleccion && pedidosSeleccionados.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          padding: '10px 16px', borderRadius: 14, border: `1px solid ${border}`,
          background: surface, boxShadow: '0 8px 32px rgba(0,0,0,.25)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{pedidosSeleccionados.length} seleccionado{pedidosSeleccionados.length > 1 ? 's' : ''}</span>
          <div style={{ width: 1, height: 16, background: border }} />
          <button onClick={handleEliminarMasivo} disabled={eliminandoMasivo} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
            background: 'rgba(51,65,57,.15)', color: accent, transition: 'all .13s',
          }}>
            <Trash2 size={12} strokeWidth={2.5} />{eliminandoMasivo ? 'Eliminando…' : 'Eliminar'}
          </button>
          <button onClick={() => setPedidosSeleccionados([])} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: ct3, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .13s' }}
            onMouseEnter={e => { e.currentTarget.style.background = D ? 'rgba(255,255,255,.06)' : 'rgba(48,54,47,.06)'; e.currentTarget.style.color = ct2 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ct3 }}>
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ═══════════ DIÁLOGO ═══════════ */}
      {dialogo.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,25,22,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 360, borderRadius: 14, overflow: 'hidden', border: `1px solid ${border}`, background: surface, boxShadow: '0 16px 48px rgba(0,0,0,.35)', animation: 'kpiIn .2s ease' }}>
            {/* header */}
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}`, background: surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {dialogo.isDestructive
                    ? <Trash2 size={13} strokeWidth={2} style={{ color: accent }} />
                    : <AlertCircle size={13} strokeWidth={2} style={{ color: accent }} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>{dialogo.title}</span>
              </div>
              <button onClick={cerrarDialogo} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: ct3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
            {/* body */}
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: ct2, whiteSpace: 'pre-wrap' }}>{dialogo.message}</p>
            </div>
            {/* footer */}
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${border}`, background: surface2, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              {dialogo.type === 'confirm' && (
                <button onClick={cerrarDialogo} style={{ flex: 1, padding: '7px 12px', fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${border}`, background: surface, color: ct2, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Cancelar
                </button>
              )}
              <button onClick={() => { if (dialogo.type === 'confirm' && dialogo.onConfirm) dialogo.onConfirm(); cerrarDialogo() }}
                style={{ flex: 1, padding: '7px 12px', fontSize: 11, fontWeight: 700, borderRadius: 8, border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontFamily: 'Inter,sans-serif', boxShadow: `0 1px 4px ${accent}44` }}>
                {dialogo.type === 'confirm' ? 'Confirmar' : 'Entendido'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes kpiIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        select option { background: ${surface}; color: ${ct1}; }
      `}</style>
    </div>
  )
}

/* ── Sub-componentes ── */
const ActionBtn = ({ children, text, onClick, title, D, danger, accent }) => {
  const [hov, setHov] = useState(false)
  const base = {
    height: 26,
    padding: text ? '0 10px' : '0',
    width: text ? 'max-content' : 26,
    borderRadius: 6,
    border: '1px solid',
    borderColor: hov ? (danger ? 'rgba(180,60,60,.15)' : 'rgba(48,54,47,.1)') : 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
    transition: 'all .12s',
    background: 'transparent',
    WebkitTapHighlightColor: 'transparent',
    fontSize: 11,
    fontWeight: 600
  }
  const color = hov
    ? danger ? 'rgba(180,60,60,.04)' : accent ? `rgba(51,65,57,.05)` : 'rgba(48,54,47,.03)'
    : 'transparent'
  const textColor = hov
    ? danger ? '#c62828' : accent ? accent : '#30362F'
    : danger ? 'rgba(180,60,60,.8)' : 'rgba(139,137,130,.9)'
  return (
    <button style={{ ...base, background: color, color: textColor }}
      onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onTouchStart={() => setHov(true)} onTouchEnd={() => setHov(false)}>
      {children}
      {text && <span>{text}</span>}
    </button>
  )
}

const PageBtn = ({ children, onClick, disabled, D, border, surface, ct2 }) => {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 28, height: 28, borderRadius: 7, border: `1px solid ${border}`,
      background: hov && !disabled ? (D ? 'rgba(255,255,255,.05)' : 'rgba(48,54,47,.04)') : surface,
      color: ct2, cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .13s',
      opacity: disabled ? .35 : 1,
    }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  )
}

export default Pedidos

