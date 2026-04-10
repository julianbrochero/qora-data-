import React, { useState, useCallback, useEffect } from 'react'
import {
  Plus, Search, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, X, Trash2, ChevronLeft,
  ChevronRight, Menu, Calendar, CreditCard, BarChart2, Info
} from 'lucide-react'
import { MenuIcon, ChevronRightIcon, PlusIcon } from '@nimbus-ds/icons'

/* ══════════════════════════════════════════
   PALETA — igual que DashboardNimbus
══════════════════════════════════════════ */
const C = {
  pageBg:     '#f8f9fb',
  bg:         '#ffffff',
  border:     '#d1d5db',
  borderMd:   '#9ca3af',
  primary:    '#334139',
  primaryHov: '#2b352f',
  primarySurf:'#eaf0eb',
  successTxt: '#065f46', successSurf: '#d1fae5', successBord: '#6ee7b7',
  warnTxt:    '#92400e', warnSurf:   '#fef3c7', warnBord:    '#fcd34d',
  dangerTxt:  '#991b1b', dangerSurf: '#fee2e2', dangerBord:  '#fca5a5',
  textBlack:  '#0d0d0d',
  textDark:   '#111827',
  textMid:    '#6b7280',
  textLight:  '#9ca3af',
}

const fmtMoney = (n) =>
  (parseFloat(n) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

const fmtMoneyFull = (n) =>
  (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (d) => {
  try { return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return '—' }
}

const fmtDateTime = (d) => {
  try { return new Date(d).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) }
  catch { return '—' }
}

const RESPONSIVE = `
  .cc-show-mobile { display: none; }
  .cc-hide-mobile { display: flex; }
  .cc-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  @media (max-width: 900px) {
    .cc-cards-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 767px) {
    .cc-show-mobile { display: flex !important; }
    .cc-hide-mobile { display: none !important; }
    .cc-cards-grid { grid-template-columns: repeat(2, 1fr); }
    .cc-cierre-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .cc-cards-grid { grid-template-columns: 1fr; }
  }
`

/* ─── StatusCard (igual que DashboardNimbus) ─── */
const StatusCard = ({ icon: Icon, mainText, subText, active, onClick, badge }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bg,
        border: `1px solid ${hov ? C.borderMd : C.border}`,
        borderRadius: 8,
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ marginTop: 2 }}>
        <Icon size={16} color={active ? C.primary : C.textMid} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: active ? C.primary : C.textDark, fontFamily: "'Inter', sans-serif" }}>
          {mainText}
        </div>
        <div style={{ fontSize: 13, color: C.textMid, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
          {subText}
        </div>
      </div>
      {badge != null && (
        <div style={{
          background: active ? C.primarySurf : '#f3f4f6',
          color: active ? C.primary : C.textMid,
          borderRadius: 12, fontSize: 11, fontWeight: 700,
          padding: '2px 8px', flexShrink: 0
        }}>{badge}</div>
      )}
    </div>
  )
}

/* ─── Tab Button (igual que DashboardNimbus) ─── */
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 16px', fontSize: 13, fontWeight: 600,
      color: active ? C.primary : C.textDark,
      background: 'none', border: 'none',
      borderBottom: active ? `2px solid ${C.primary}` : '2px solid transparent',
      cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: -1,
    }}
  >{label}</button>
)

/* ─── CardShell (igual que DashboardNimbus) ─── */
const CardShell = ({ title, actionLabel, onAction, children }) => (
  <div style={{ background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.textBlack, fontFamily: "'Inter', sans-serif" }}>
        {title}
      </div>
      {actionLabel && (
        <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          {actionLabel} <ChevronRightIcon size={12} color={C.primary} />
        </button>
      )}
    </div>
    <div>{children}</div>
  </div>
)

/* ─── MovRow — fila de movimiento ─── */
const MovRow = ({ mov, onDelete, confirmId, setConfirmId, borrando, setBorrando, eliminarMovimientoCaja }) => {
  const esIngreso = mov.tipo === 'ingreso'
  const [hov, setHov] = useState(false)
  const etiquetaCategoria = {
    venta: 'Venta', cobro: 'Cobro', ingreso_extra: 'Ingreso extra',
    proveedor: 'Proveedor', gasto_general: 'Gasto general', sueldo: 'Sueldo/Retiro',
    impuesto: 'Impuesto', compra_stock: 'Compra stock', otro: 'Otro'
  }

  const ref = mov.referencia
  const refLabel = ref
    ? (ref.startsWith('pedido:') ? 'Venta' : etiquetaCategoria[ref])
    : null

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
        background: hov ? '#fafafa' : C.bg, transition: 'background 0.1s',
      }}
    >
      {/* Tipo badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
        background: esIngreso ? C.successSurf : C.dangerSurf,
        color: esIngreso ? C.successTxt : C.dangerTxt,
        border: `1px solid ${esIngreso ? C.successBord : C.dangerBord}`,
        flexShrink: 0,
      }}>
        {esIngreso ? <TrendingUp size={9} strokeWidth={2.5} /> : <TrendingDown size={9} strokeWidth={2.5} />}
        {esIngreso ? 'Ingreso' : 'Egreso'}
      </div>

      {/* Descripción */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {mov.description || mov.descripcion || 'Sin descripción'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: C.textMid }}>{fmtDateTime(mov.fecha)}</span>
          {mov.metodo && (
            <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: '#f3f4f6', color: C.textMid }}>
              {mov.metodo}
            </span>
          )}
          {refLabel && (
            <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: C.primarySurf, color: C.primary }}>
              {refLabel}
            </span>
          )}
        </div>
      </div>

      {/* Monto */}
      <div style={{ fontSize: 14, fontWeight: 700, color: esIngreso ? C.successTxt : C.dangerTxt, flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
        {esIngreso ? '+' : '-'}{fmtMoney(mov.monto)}
      </div>

      {/* Eliminar */}
      <div style={{ flexShrink: 0, width: 32 }}>
        {confirmId === mov.id ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={async () => { setBorrando(true); await eliminarMovimientoCaja?.(mov.id); setConfirmId(null); setBorrando(false) }}
              disabled={borrando}
              style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {borrando ? '...' : 'Sí'}
            </button>
            <button onClick={() => setConfirmId(null)}
              style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: '#f3f4f6', color: C.textDark, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmId(mov.id)}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: hov ? C.dangerSurf : 'transparent',
              border: hov ? `1px solid ${C.dangerBord}` : '1px solid transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hov ? 1 : 0, transition: 'all .13s',
            }}
          >
            <Trash2 size={12} color={C.dangerTxt} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const ControlCaja = ({
  caja = {}, movimientosCaja = [], cierresCaja = [], pedidos = [],
  openModal, cerrarCaja, eliminarMovimientoCaja,
  cargarMovimientosPorFecha, recargarDatos, onOpenMobileSidebar
}) => {
  const hoyStr = new Date().toISOString().split('T')[0]
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr)
  const [movimientosVista, setMovimientosVista] = useState(null)
  const [cajaVista, setCajaVista] = useState(null)
  const [cargandoFecha, setCargandoFecha] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [paginaActual, setPaginaActual] = useState(1)
  const [mostrarConfirmCierre, setMostrarConfirmCierre] = useState(false)
  const [observacionesCierre, setObservacionesCierre] = useState('')
  const [cerrando, setCerrando] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [borrando, setBorrando] = useState(false)

  const ITEMS_POR_PAGINA = 10
  const esHoy = fechaSeleccionada === hoyStr
  const movimientosActivos = movimientosVista !== null ? movimientosVista : movimientosCaja
  const cajaActiva = cajaVista !== null ? cajaVista : caja

  /* ── Atajo Ctrl → egreso ── */
  useEffect(() => {
    const h = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
      if (e.key === 'Control' && esHoy && !mostrarConfirmCierre) {
        e.preventDefault()
        openModal?.('egreso-caja')
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [esHoy, mostrarConfirmCierre, openModal])

  const cambiarFecha = useCallback(async (nuevaFecha) => {
    setFechaSeleccionada(nuevaFecha); setPaginaActual(1); setSearchTerm(''); setFiltroTipo('todos')
    if (nuevaFecha === hoyStr) { setMovimientosVista(null); setCajaVista(null) }
    else {
      setCargandoFecha(true)
      const r = await cargarMovimientosPorFecha(nuevaFecha)
      setMovimientosVista(r.movimientos); setCajaVista(r.caja); setCargandoFecha(false)
    }
  }, [cargarMovimientosPorFecha, hoyStr])

  const irAtras = () => { const d = new Date(fechaSeleccionada); d.setDate(d.getDate() - 1); cambiarFecha(d.toISOString().split('T')[0]) }
  const irAdelante = () => { const d = new Date(fechaSeleccionada); d.setDate(d.getDate() + 1); const n = d.toISOString().split('T')[0]; if (n <= hoyStr) cambiarFecha(n) }

  const cajaSegura = {
    ingresos: parseFloat(cajaActiva.ingresos) || 0,
    egresos: parseFloat(cajaActiva.egresos) || 0,
    saldo: parseFloat(cajaActiva.saldo) || 0
  }
  const movSeguros = Array.isArray(movimientosActivos) ? movimientosActivos : []
  const cierresSeguros = Array.isArray(cierresCaja) ? cierresCaja : []

  /* Filtros */
  const filtrados = movSeguros.filter(m => {
    const q = (searchTerm || '').toLowerCase()
    const matchB = (m.description || '').toLowerCase().includes(q) || (m.descripcion || '').toLowerCase().includes(q) || (m.metodo || '').toLowerCase().includes(q)
    const matchT = filtroTipo === 'todos' || m.tipo === filtroTipo
    return matchB && matchT
  }).sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))

  const totalPaginas = Math.ceil(filtrados.length / ITEMS_POR_PAGINA)
  const paginados = filtrados.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA)

  /* Ganancia estimada */
  const gananciaEst = Array.isArray(pedidos) ? (() => {
    let g = 0, hay = false
    pedidos.forEach(p => {
      if ((p.created_at || p.fecha_pedido || '').split('T')[0] !== fechaSeleccionada) return
      let items = []
      try { items = typeof p.items === 'string' ? JSON.parse(p.items) : (p.items || []) } catch {}
      items.forEach(i => { const gan = parseFloat(i.ganancia); if (!isNaN(gan)) { g += gan; hay = true } })
    })
    return { valor: g, hay }
  })() : { valor: 0, hay: false }

  const handleCerrarCaja = async () => {
    if (!cerrarCaja) return; setCerrando(true)
    try {
      const r = await cerrarCaja(observacionesCierre)
      if (r?.success) { setMostrarConfirmCierre(false); setObservacionesCierre(''); recargarDatos?.() }
      else alert('Error al cerrar caja: ' + (r?.mensaje || 'Error desconocido'))
    } finally { setCerrando(false) }
  }

  const fechaLegible = new Date(fechaSeleccionada + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const fechaCapitalizada = fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1)

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: "'Inter', sans-serif" }}>
      <style>{RESPONSIVE}</style>

      {/* ── Mobile topbar ── */}
      <div className="cc-show-mobile" style={{ alignItems: 'center', gap: 10, padding: '11px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onOpenMobileSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <MenuIcon size={20} color={C.textBlack} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: C.textBlack }}>Caja</span>
        {esHoy && (
          <button onClick={() => openModal?.('egreso-caja')} style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
            height: 32, padding: '0 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
            background: C.primary, color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            <PlusIcon size={13} color="#fff" /> Egreso
          </button>
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', boxSizing: 'border-box' }}>

        {/* ── Header Desktop ── */}
        <div className="cc-hide-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.textBlack }}>Caja</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <button onClick={irAtras} style={{ width: 24, height: 24, borderRadius: 5, background: C.bg, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={13} color={C.textMid} />
              </button>
              <input
                type="date" value={fechaSeleccionada} max={hoyStr}
                onChange={e => cambiarFecha(e.target.value)}
                style={{ fontSize: 13, fontWeight: 600, color: C.textDark, background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
              />
              <button onClick={irAdelante} disabled={fechaSeleccionada >= hoyStr}
                style={{ width: 24, height: 24, borderRadius: 5, background: C.bg, border: `1px solid ${C.border}`, cursor: fechaSeleccionada >= hoyStr ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fechaSeleccionada >= hoyStr ? 0.4 : 1 }}>
                <ChevronRight size={13} color={C.textMid} />
              </button>
              {!esHoy && (
                <button onClick={() => cambiarFecha(hoyStr)} style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: C.primary, color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Hoy
                </button>
              )}
              {cargandoFecha && <div style={{ width: 12, height: 12, border: `2px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />}
            </div>
          </div>

          {/* Botones de acción */}
          {esHoy ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => openModal?.('ingreso-caja')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: `1px solid ${C.successBord}`, background: C.successSurf, color: C.successTxt, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                <TrendingUp size={13} strokeWidth={2.5} /> Ingreso
              </button>
              <button onClick={() => openModal?.('egreso-caja')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: `1px solid ${C.dangerBord}`, background: C.dangerSurf, color: C.dangerTxt, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                title="Atajo: Ctrl">
                <TrendingDown size={13} strokeWidth={2.5} /> Egreso
                <span style={{ padding: '1px 4px', background: 'rgba(153,27,27,.1)', borderRadius: 4, fontSize: 9, fontFamily: "'DM Mono', monospace", color: C.dangerTxt }}>Ctrl</span>
              </button>
              <button onClick={() => setMostrarConfirmCierre(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', background: C.primary, color: '#fff', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                <CreditCard size={13} strokeWidth={2.5} /> Cerrar caja
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: C.warnSurf, border: `1px solid ${C.warnBord}` }}>
              <Calendar size={12} color={C.warnTxt} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.warnTxt }}>{fechaCapitalizada}</span>
            </div>
          )}
        </div>

        {/* ── Panel Cierre de caja ── */}
        {mostrarConfirmCierre && (
          <div style={{ background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: C.primarySurf, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={13} color={C.primary} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.textBlack }}>Confirmar cierre de caja</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{fechaCapitalizada}</div>
                </div>
              </div>
              <button onClick={() => { setMostrarConfirmCierre(false); setObservacionesCierre('') }}
                style={{ width: 26, height: 26, borderRadius: 6, background: '#f3f4f6', border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} color={C.textMid} />
              </button>
            </div>
            <div style={{ padding: 18 }}>
              {/* Mini resumen */}
              <div className="cc-cierre-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Ingresos', val: fmtMoney(cajaSegura.ingresos), bg: C.successSurf, bord: C.successBord, clr: C.successTxt },
                  { label: 'Egresos', val: fmtMoney(cajaSegura.egresos), bg: C.dangerSurf, bord: C.dangerBord, clr: C.dangerTxt },
                  { label: 'Saldo final', val: fmtMoney(cajaSegura.saldo), bg: cajaSegura.saldo >= 0 ? '#EFF6FF' : C.warnSurf, bord: cajaSegura.saldo >= 0 ? '#93C5FD' : C.warnBord, clr: cajaSegura.saldo >= 0 ? '#1E40AF' : C.warnTxt },
                ].map((c, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderRadius: 8, background: c.bg, border: `1px solid ${c.bord}`, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: C.textMid, marginBottom: 4, fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: c.clr, letterSpacing: '-.02em' }}>{c.val}</div>
                  </div>
                ))}
              </div>
              {cajaSegura.saldo < 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: C.warnSurf, border: `1px solid ${C.warnBord}`, marginBottom: 12 }}>
                  <AlertTriangle size={12} color={C.warnTxt} />
                  <p style={{ fontSize: 11, color: C.warnTxt, margin: 0 }}>El saldo es negativo. Verificá los egresos antes de cerrar.</p>
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textDark, display: 'block', marginBottom: 5 }}>Observaciones (opcional)</label>
                <textarea
                  value={observacionesCierre}
                  onChange={e => setObservacionesCierre(e.target.value)}
                  rows={2}
                  placeholder="Ej: Todo en orden..."
                  style={{ width: '100%', padding: '8px 12px', fontSize: 12, color: C.textDark, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, outline: 'none', resize: 'none', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setMostrarConfirmCierre(false); setObservacionesCierre('') }} disabled={cerrando}
                  style={{ flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.textDark, background: 'transparent', border: `1px solid ${C.border}`, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleCerrarCaja} disabled={cerrando}
                  style={{ flex: 2, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', background: C.primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: cerrando ? .6 : 1 }}>
                  <CheckCircle size={13} strokeWidth={2.5} /> {cerrando ? 'Cerrando...' : 'Confirmar cierre'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Cards de resumen (estilo DashboardNimbus) ── */}
        <div className="cc-cards-grid">
          <StatusCard
            icon={TrendingUp}
            mainText={fmtMoney(cajaSegura.ingresos)}
            subText={`${movSeguros.filter(m => m.tipo === 'ingreso').length} movimientos de ingreso`}
            active={cajaSegura.ingresos > 0}
          />
          <StatusCard
            icon={TrendingDown}
            mainText={fmtMoney(cajaSegura.egresos)}
            subText={`${movSeguros.filter(m => m.tipo === 'egreso').length} movimientos de egreso`}
            active={false}
          />
          <StatusCard
            icon={DollarSign}
            mainText={fmtMoney(cajaSegura.saldo)}
            subText="Saldo actual de caja"
            active={cajaSegura.saldo > 0}
          />
          {gananciaEst.hay ? (
            <StatusCard
              icon={BarChart2}
              mainText={fmtMoney(gananciaEst.valor)}
              subText="Ganancia estimada del día"
              active={gananciaEst.valor > 0}
            />
          ) : (
            <StatusCard
              icon={Calendar}
              mainText={cierresSeguros.length > 0 ? fmtDate(cierresSeguros[0].fecha || cierresSeguros[0].fecha_cierre) : 'Sin cierres'}
              subText="Último cierre de caja"
              active={false}
            />
          )}
        </div>

        {/* ── Movimientos ── */}
        <CardShell title={`Movimientos del día · ${filtrados.length} total`}>
          {/* Toolbar */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Búsqueda */}
            <div style={{ flex: 1, minWidth: 180, position: 'relative', display: 'flex', alignItems: 'center', background: '#f2f2f2', border: `1px solid ${C.border}`, borderRadius: 6, height: 32, padding: '0 10px' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = C.primary}
              onBlurCapture={e => e.currentTarget.style.borderColor = C.border}>
              <Search size={12} color={C.textMid} style={{ marginRight: 8, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Buscar movimientos..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPaginaActual(1) }}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12, fontFamily: "'Inter', sans-serif", color: C.textDark, width: '100%' }}
              />
            </div>
            {/* Filtro tipo */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[['todos', 'Todos'], ['ingreso', 'Ingresos'], ['egreso', 'Egresos']].map(([val, lbl]) => (
                <button key={val} onClick={() => { setFiltroTipo(val); setPaginaActual(1) }}
                  style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${filtroTipo === val ? C.primary : C.border}`,
                    background: filtroTipo === val ? C.primary : '#fff',
                    color: filtroTipo === val ? '#fff' : C.textMid,
                    transition: 'all .12s', fontFamily: "'Inter', sans-serif",
                  }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de movimientos */}
          {paginados.length > 0 ? paginados.map(mov => (
            <MovRow
              key={mov.id}
              mov={mov}
              onDelete={() => {}}
              confirmId={confirmId}
              setConfirmId={setConfirmId}
              borrando={borrando}
              setBorrando={setBorrando}
              eliminarMovimientoCaja={eliminarMovimientoCaja}
            />
          )) : (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.primarySurf, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <DollarSign size={18} color={C.primary} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.textDark, marginBottom: 4 }}>Sin movimientos</p>
              <p style={{ fontSize: 12, color: C.textMid }}>{searchTerm ? 'Revisá los parámetros de búsqueda.' : 'No hay movimientos registrados para este día.'}</p>
              {esHoy && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
                  <button onClick={() => openModal?.('ingreso-caja')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: `1px solid ${C.successBord}`, background: C.successSurf, color: C.successTxt, cursor: 'pointer' }}>
                    <TrendingUp size={13} /> Registrar ingreso
                  </button>
                  <button onClick={() => openModal?.('egreso-caja')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: `1px solid ${C.dangerBord}`, background: C.dangerSurf, color: C.dangerTxt, cursor: 'pointer' }}>
                    <TrendingDown size={13} /> Registrar egreso
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: C.textMid }}>
                {(paginaActual - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(paginaActual * ITEMS_POR_PAGINA, filtrados.length)} de {filtrados.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}
                  style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', border: `1px solid ${C.border}`, cursor: paginaActual === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: paginaActual === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={13} />
                </button>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.textDark, lineHeight: '28px' }}>{paginaActual} / {totalPaginas}</span>
                <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual >= totalPaginas}
                  style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', border: `1px solid ${C.border}`, cursor: paginaActual >= totalPaginas ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: paginaActual >= totalPaginas ? 0.4 : 1 }}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </CardShell>

        {/* ── Historial de Cierres ── */}
        <CardShell title="Historial de Cierres">
          {cierresSeguros.length > 0 ? cierresSeguros.slice(0, 5).map(c => (
            <div key={c.id}
              style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: C.primarySurf, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={12} color={C.primary} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textDark }}>{c.fecha || c.fecha_cierre || 'Fecha desconocida'}</span>
                </div>
                <button onClick={() => openModal?.('detalle-cierre', c)}
                  style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: 'transparent', border: `1px solid rgba(51,65,57,.2)`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
                  Ver detalles
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'Ingresos', val: `+${fmtMoney(c.ingresos)}`, clr: C.successTxt },
                  { label: 'Egresos', val: `-${fmtMoney(c.egresos)}`, clr: C.dangerTxt },
                  { label: 'Saldo final', val: fmtMoney(c.saldo_final || c.saldo), clr: '#1E40AF' },
                ].map((d, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, color: C.textMid, marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: d.clr }}>{d.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.primarySurf, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <CreditCard size={18} color={C.primary} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginBottom: 4 }}>Sin cierres registrados</p>
              <p style={{ fontSize: 11, color: C.textMid }}>Realizá tu primer cierre de caja para ver el historial.</p>
            </div>
          )}
        </CardShell>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

export default ControlCaja