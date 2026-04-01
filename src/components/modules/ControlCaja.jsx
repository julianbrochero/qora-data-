import React, { useState, useCallback, useEffect } from 'react'
import { Plus, Search, DollarSign, CreditCard, Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, X, Trash2, ChevronLeft, ChevronRight, Menu } from "lucide-react"

/* ══════════════════════════════════════════════
   PALETA GESTIFY
   #F5F5F5  fondo app        #FAFAFA  surface
   #282A28  header           #334139  acento verde
   #4ADE80  lima primary     #8B8982  ct3 suave
══════════════════════════════════════════════ */
const bg = '#F5F5F5'
const surface = '#FAFAFA'
const border = 'rgba(48,54,47,.13)'
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'
const cardShadow = '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)'

const inputBase = { height: 32, padding: '0 12px', fontSize: 12, color: ct1, background: '#fff', border: `1px solid ${border}`, borderRadius: 8, outline: 'none', fontFamily: "'Inter', sans-serif" }
const pillSel = { ...inputBase, cursor: 'pointer', appearance: 'none', paddingRight: 24, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8982' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }

const ControlCaja = ({ caja = {}, movimientosCaja = [], cierresCaja = [], pedidos = [], openModal, cerrarCaja, eliminarMovimientoCaja, cargarMovimientosPorFecha, recargarDatos, onOpenMobileSidebar }) => {
  const hoyStr = new Date().toISOString().split('T')[0]
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr)
  const [movimientosVista, setMovimientosVista] = useState(null)
  const [cajaVista, setCajaVista] = useState(null)
  const [cargandoFecha, setCargandoFecha] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [mostrarConfirmCierre, setMostrarConfirmCierre] = useState(false)
  const [observacionesCierre, setObservacionesCierre] = useState("")
  const [cerrando, setCerrando] = useState(false)
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)

  const esHoy = fechaSeleccionada === hoyStr
  const movimientosActivos = movimientosVista !== null ? movimientosVista : movimientosCaja
  const cajaActiva = cajaVista !== null ? cajaVista : caja

  // Atajo de teclado: Ctrl para abrir Egreso (solo si es hoy y no hay confirmaciones activas ni modals superpuestos)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Si está en un input/textarea, ignorar
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'Control' && esHoy && !mostrarConfirmCierre) {
        e.preventDefault();
        if (openModal) openModal("egreso-caja");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [esHoy, mostrarConfirmCierre, openModal]);

  const cambiarFecha = useCallback(async (nuevaFecha) => {
    setFechaSeleccionada(nuevaFecha); setPaginaActual(1); setSearchTerm(""); setFiltroTipo("todos")
    if (nuevaFecha === hoyStr) { setMovimientosVista(null); setCajaVista(null) }
    else {
      setCargandoFecha(true)
      const r = await cargarMovimientosPorFecha(nuevaFecha)
      setMovimientosVista(r.movimientos); setCajaVista(r.caja); setCargandoFecha(false)
    }
  }, [cargarMovimientosPorFecha, hoyStr])

  const irAtras = () => { const d = new Date(fechaSeleccionada); d.setDate(d.getDate() - 1); cambiarFecha(d.toISOString().split('T')[0]) }
  const irAdelante = () => { const d = new Date(fechaSeleccionada); d.setDate(d.getDate() + 1); const n = d.toISOString().split('T')[0]; if (n <= hoyStr) cambiarFecha(n) }

  const cajaSegura = { ingresos: parseFloat(cajaActiva.ingresos) || 0, egresos: parseFloat(cajaActiva.egresos) || 0, saldo: parseFloat(cajaActiva.saldo) || 0 }
  const movimientosSeguros = Array.isArray(movimientosActivos) ? movimientosActivos : []
  const cierresSeguros = Array.isArray(cierresCaja) ? cierresCaja : []

  const etiquetaCategoria = { venta: 'Venta', cobro: 'Cobro', ingreso_extra: 'Ingreso extra', proveedor: 'Proveedor', gasto_general: 'Gasto general', sueldo: 'Sueldo/Retiro', impuesto: 'Impuesto', compra_stock: 'Compra stock', otro: 'Otro' }

  const categoriasPresentes = [...new Set(movimientosSeguros.map(m => m.referencia).filter(r => r && !r.startsWith('producto-') && !r.startsWith('pedido:')))]

  const filtrados = movimientosSeguros.filter(m => {
    const q = (searchTerm || "").toLowerCase()
    const matchB = (m.description || "").toLowerCase().includes(q) || (m.metodo || "").toLowerCase().includes(q)
    const matchT = filtroTipo === "todos" || m.tipo === filtroTipo
    const matchC = filtroCategoria === "todas" || m.referencia === filtroCategoria
    return matchB && matchT && matchC
  }).sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const paginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina)

  const fMonto = v => (parseFloat(v) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const resumen = {
    ingresos: movimientosSeguros.filter(m => m.tipo === "ingreso").reduce((s, m) => s + (parseFloat(m.monto) || 0), 0),
    egresos: movimientosSeguros.filter(m => m.tipo === "egreso").reduce((s, m) => s + (parseFloat(m.monto) || 0), 0),
    total: movimientosSeguros.length,
    ultimoCierre: cierresSeguros.length > 0 ? new Date(cierresSeguros[0].fecha || cierresSeguros[0].fecha_cierre).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : "Sin cierres"
  }

  // Ganancia estimada del día: suma ganancia de items en pedidos creados hoy
  const gananciaEstimada = Array.isArray(pedidos) ? (() => {
    let g = 0, hay = false
    pedidos.forEach(p => {
      const fechaPed = (p.created_at || p.fecha_pedido || '').split('T')[0]
      if (fechaPed !== fechaSeleccionada) return
      let items = []
      try { items = typeof p.items === 'string' ? JSON.parse(p.items) : (p.items || []) } catch {}
      items.forEach(i => {
        const gan = parseFloat(i.ganancia)
        if (!isNaN(gan)) { g += gan; hay = true }
      })
    })
    return { valor: g, hay }
  })() : { valor: 0, hay: false }

  const handleCerrarCaja = async () => {
    if (!cerrarCaja) return; setCerrando(true)
    try {
      const r = await cerrarCaja(observacionesCierre)
      if (r?.success) { setMostrarConfirmCierre(false); setObservacionesCierre(""); if (recargarDatos) recargarDatos() }
      else alert("Error al cerrar caja: " + (r?.mensaje || "Error desconocido"))
    } finally { setCerrando(false) }
  }

  const focusInput = e => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,57,.08)' }
  const blurInput = e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ══ HEADER ══ */}
      <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '8px clamp(12px, 3vw, 24px)', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', display: 'flex' }}>
            <Menu size={16} strokeWidth={2} />
          </button>
          <div className="hidden sm:block">
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Caja</h2>
          </div>
        </div>

        {/* SELECTOR FECHA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '5px 10px', order: { base: 2, sm: 'initial' } }}>
          <Calendar size={12} style={{ color: 'rgba(255,255,255,.5)', flexShrink: 0 }} />
          <button onClick={irAtras} style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, background: 'transparent', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}>
            <ChevronLeft size={13} />
          </button>
          <input type="date" value={fechaSeleccionada} max={hoyStr} onChange={e => cambiarFecha(e.target.value)}
            style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.85)', background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", width: 90 }} />
          <button onClick={irAdelante} disabled={fechaSeleccionada >= hoyStr} style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, background: 'transparent', border: 'none', color: fechaSeleccionada >= hoyStr ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.5)', cursor: fechaSeleccionada >= hoyStr ? 'default' : 'pointer' }}>
            <ChevronRight size={13} />
          </button>
          {!esHoy && <button onClick={() => cambiarFecha(hoyStr)} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: '#4ADE80', color: '#0A1A0E', border: 'none', cursor: 'pointer' }}>Hoy</button>}
          {cargandoFecha && <div style={{ width: 12, height: 12, border: '2px solid #4ADE80', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />}
        </div>

        {/* BOTONES ACCIÓN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {esHoy ? (
            <>
              <button onClick={() => openModal && openModal("ingreso-caja")} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, border: '1px solid #4ADE80', background: 'transparent', color: '#4ADE80', cursor: 'pointer' }}>
                <TrendingUp size={11} strokeWidth={2.5} /> Ingreso
              </button>
              <button onClick={() => openModal && openModal("egreso-caja")} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, border: '1px solid #F87171', background: 'transparent', color: '#F87171', cursor: 'pointer' }} title="Atajo: Ctrl">
                <TrendingDown size={11} strokeWidth={2.5} /> Egreso
                <span style={{ padding: '1px 4px', background: 'rgba(248,113,113,.15)', borderRadius: 4, fontSize: 8, fontFamily: "'DM Mono', monospace", color: '#F87171' }}>Ctrl</span>
              </button>
              <button onClick={() => setMostrarConfirmCierre(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, border: '1px solid #4ADE80', cursor: 'pointer', background: '#4ADE80', color: '#0A1A0E' }}>
                <CreditCard size={11} strokeWidth={2.5} /> Cerrar
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(234,179,8,.15)', border: '1px solid rgba(234,179,8,.3)' }}>
              <Calendar size={11} style={{ color: '#EAB308' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#EAB308' }}>
                {new Date(fechaSeleccionada + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ══ PANEL CIERRE ══ */}
      {mostrarConfirmCierre && (
        <div style={{ margin: 'clamp(10px, 2vw, 14px) clamp(12px, 3vw, 24px) 0', background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ background: '#282A28', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(74,222,128,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={14} style={{ color: '#4ADE80' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Confirmar cierre de caja</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
            <button onClick={() => { setMostrarConfirmCierre(false); setObservacionesCierre("") }} style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)' }}>
              <X size={13} />
            </button>
          </div>

          <div style={{ padding: 18 }}>
            {/* mini cards resumen cierre */}
            <div className="cc-cierre-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Ingresos', val: `+$${fMonto(resumen.ingresos)}`, clr: '#065F46', bg: '#F0FDF4', bd: '#6EE7B7' },
                { label: 'Egresos', val: `-$${fMonto(resumen.egresos)}`, clr: '#991B1B', bg: '#FEF2F2', bd: '#FCA5A5' },
                { label: 'Saldo final', val: `$${fMonto(cajaSegura.saldo)}`, clr: cajaSegura.saldo >= 0 ? '#1E40AF' : '#92400E', bg: cajaSegura.saldo >= 0 ? '#EFF6FF' : '#FEF3C7', bd: cajaSegura.saldo >= 0 ? '#93C5FD' : '#FDE68A' },
              ].map((c, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: c.bg, border: `1px solid ${c.bd}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: ct3, marginBottom: 4, fontWeight: 600 }}>{c.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c.clr, letterSpacing: '-.03em' }}>{c.val}</div>
                </div>
              ))}
            </div>

            {/* desglose */}
            <div style={{ background: 'rgba(48,54,47,.04)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: ct2 }}>Movimientos del día</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: ct1 }}>{resumen.total} total</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <div style={{ fontSize: 11, color: ct3, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ingresos</span><span style={{ fontWeight: 600, color: '#065F46' }}>{movimientosSeguros.filter(m => m.tipo === 'ingreso').length} mov.</span>
                </div>
                <div style={{ fontSize: 11, color: ct3, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Egresos</span><span style={{ fontWeight: 600, color: '#991B1B' }}>{movimientosSeguros.filter(m => m.tipo === 'egreso').length} mov.</span>
                </div>
              </div>
              {categoriasPresentes.length > 0 && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {categoriasPresentes.map(cat => {
                    const movsCat = movimientosSeguros.filter(m => m.referencia === cat)
                    const totalCat = movsCat.reduce((s, m) => s + (parseFloat(m.monto) || 0), 0)
                    const esIngreso = movsCat[0]?.tipo === 'ingreso'
                    return <div key={cat} style={{ fontSize: 11, color: ct3, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{etiquetaCategoria[cat] || cat}</span>
                      <span style={{ fontWeight: 600, color: esIngreso ? '#065F46' : '#991B1B' }}>{esIngreso ? '+' : '-'}${fMonto(totalCat)}</span>
                    </div>
                  })}
                </div>
              )}
            </div>

            {/* advertencia saldo negativo */}
            {cajaSegura.saldo < 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#FEF3C7', border: '1px solid #FDE68A', marginBottom: 14 }}>
                <AlertTriangle size={12} style={{ color: '#92400E', flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: '#92400E' }}>El saldo es negativo. Verificá los egresos antes de cerrar.</p>
              </div>
            )}

            {/* observaciones */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: ct2, display: 'block', marginBottom: 5 }}>Observaciones (opcional)</label>
              <textarea value={observacionesCierre} onChange={e => setObservacionesCierre(e.target.value)} rows={2} placeholder="Ej: Todo en orden, falta de cambio..."
                onFocus={focusInput} onBlur={blurInput}
                style={{ width: '100%', padding: '8px 12px', fontSize: 12, color: ct1, background: '#fff', border: `1px solid ${border}`, borderRadius: 8, outline: 'none', resize: 'none', fontFamily: "'Inter', sans-serif" }} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setMostrarConfirmCierre(false); setObservacionesCierre("") }} disabled={cerrando}
                style={{ flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600, color: ct2, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleCerrarCaja} disabled={cerrando}
                style={{ flex: 2, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#0A1A0E', background: '#4ADE80', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: cerrando ? .6 : 1 }}>
                <CheckCircle size={13} strokeWidth={2.5} /> {cerrando ? "Cerrando..." : "Confirmar cierre"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CARDS RESUMEN ══ */}
      <div className="cc-cards-grid" style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12 }}>
        {[
          { label: 'Ingresos del día', val: `$${fMonto(resumen.ingresos)}`, icon: TrendingUp, clr: '#065F46', sub: `${movimientosSeguros.filter(m => m.tipo === 'ingreso').length} movimientos` },
          { label: 'Egresos del día', val: `$${fMonto(resumen.egresos)}`, icon: TrendingDown, clr: '#991B1B', sub: `${movimientosSeguros.filter(m => m.tipo === 'egreso').length} movimientos` },
          { label: 'Saldo actual', val: `$${fMonto(cajaSegura.saldo)}`, icon: DollarSign, clr: cajaSegura.saldo >= 0 ? '#1E40AF' : '#92400E', sub: 'Balance de caja en tiempo real' },
          ...(gananciaEstimada.hay ? [{ label: 'Ganancia est. hoy', val: `+$${fMonto(gananciaEstimada.valor)}`, icon: TrendingUp, clr: '#059669', sub: 'Basado en costos cargados' }] : []),
          { label: 'Último cierre', val: resumen.ultimoCierre, icon: Calendar, clr: '#6B7280', sub: 'Fecha del cierre anterior' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#E1E1E0', borderRadius: 12, border: `1px solid ${border}`, boxShadow: cardShadow, height: 76, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'box-shadow .2s,transform .2s', animation: `kpiIn .35s ${.05 + i * .07}s ease both` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(48,54,47,.11),0 14px 36px rgba(48,54,47,.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = cardShadow }}>
            {/* glow radial */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${s.clr}15, transparent 70%)` }} />
            {/* barra lateral */}
            <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: s.clr, borderRadius: '0 2px 2px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: ct3, textTransform: 'uppercase', letterSpacing: '.03em', display: 'block', marginBottom: 2 }}>{s.label}</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: ct1, letterSpacing: '-.03em', display: 'block', lineHeight: 1.1 }}>{s.val}</span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${s.clr}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={15} strokeWidth={2.5} style={{ color: s.clr }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ TABLA MOVIMIENTOS ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: surface, borderRadius: 12, border: `1px solid ${border}`, boxShadow: cardShadow, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* toolbar */}
          <div className="cc-toolbar" style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, background: surface, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input type="text" placeholder="Buscar movimientos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputBase, width: '100%', paddingLeft: 30 }}
                onFocus={focusInput} onBlur={blurInput} />
            </div>

            <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPaginaActual(1) }} style={pillSel}>
              <option value="todos">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="egreso">Egresos</option>
            </select>

            {/* chips categoría */}
            {categoriasPresentes.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: ct3, fontWeight: 600 }}>Cat:</span>
                {['todas', ...categoriasPresentes].map(cat => (
                  <button key={cat} onClick={() => { setFiltroCategoria(cat); setPaginaActual(1) }}
                    style={{ padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, border: `1px solid ${filtroCategoria === cat ? accent : border}`, background: filtroCategoria === cat ? accent : '#fff', color: filtroCategoria === cat ? '#fff' : ct3, cursor: 'pointer', transition: 'all .12s' }}>
                    {cat === 'todas' ? 'Todas' : etiquetaCategoria[cat] || cat}
                  </button>
                ))}
              </div>
            )}

            <span style={{ fontSize: 11, color: ct3, fontWeight: 500, marginLeft: 'auto' }}>{filtrados.length} movimientos</span>
          </div>

          {/* tabla */}
          <div className="cc-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="cc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: surface, zIndex: 10, borderBottom: `1px solid ${border}` }}>
                <tr>
                  {['TIPO', 'DESCRIPCIÓN', 'FECHA', 'MÉTODO', 'MONTO', ''].map((col, i) => (
                    <th key={i} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: i === 4 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginados.length > 0 ? paginados.map(mov => {
                  const esIngreso = mov.tipo === 'ingreso'
                  return (
                    <tr key={mov.id} className="group" style={{ borderBottom: `1px solid ${border}`, transition: 'background .13s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* tipo */}
                      <td style={{ padding: '11px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: esIngreso ? '#F0FDF4' : '#FEF2F2', color: esIngreso ? '#065F46' : '#991B1B', border: `1px solid ${esIngreso ? '#6EE7B7' : '#FCA5A5'}` }}>
                          {esIngreso ? <TrendingUp size={10} strokeWidth={2.5} /> : <TrendingDown size={10} strokeWidth={2.5} />}
                          {esIngreso ? 'Ingreso' : 'Egreso'}
                        </div>
                      </td>

                      {/* descripción */}
                      <td style={{ padding: '11px 16px', verticalAlign: 'middle', fontSize: 12, fontWeight: 500, color: ct1, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mov.description || mov.descripcion || 'Sin descripción'}
                      </td>

                      {/* fecha */}
                      <td style={{ padding: '11px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: ct2 }}>
                            {mov.fecha ? new Date(mov.fecha).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—'}
                          </span>
                          {mov.referencia && !mov.referencia.startsWith('producto-') && (() => {
                            const ref = mov.referencia
                            const label = ref.startsWith('pedido:') ? 'Venta' : etiquetaCategoria[ref]
                            if (!label) return null
                            return <span style={{ padding: '2px 6px', borderRadius: 5, fontSize: 9, fontWeight: 600, background: 'rgba(48,54,47,.06)', color: ct3, border: `1px solid ${border}` }}>{label}</span>
                          })()}
                        </div>
                      </td>

                      {/* método */}
                      <td style={{ padding: '11px 16px', verticalAlign: 'middle' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(48,54,47,.05)', color: ct2, border: `1px solid ${border}` }}>
                          {mov.metodo || 'N/A'}
                        </span>
                      </td>

                      {/* monto */}
                      <td style={{ padding: '11px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: esIngreso ? '#065F46' : '#991B1B' }}>
                          {esIngreso ? '+' : '-'}${fMonto(mov.monto)}
                        </span>
                      </td>

                      {/* eliminar */}
                      <td style={{ padding: '11px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        {confirmandoBorrar === mov.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 10, color: ct3 }}>¿Eliminar?</span>
                            <button onClick={async () => { setBorrando(true); await eliminarMovimientoCaja?.(mov.id); setConfirmandoBorrar(null); setBorrando(false) }}
                              disabled={borrando} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer' }}>
                              {borrando ? '...' : 'Sí'}
                            </button>
                            <button onClick={() => setConfirmandoBorrar(null)} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: surface, color: ct2, border: `1px solid ${border}`, cursor: 'pointer' }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmandoBorrar(mov.id)} style={{ width: 28, height: 28, borderRadius: 8, background: surface, border: `1px solid transparent`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct3, transition: 'all .13s', opacity: 0 }} className="group-hover-show"
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FCA5A5'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.opacity = '1' }}
                            onMouseLeave={e => { e.currentTarget.style.background = surface; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = ct3 }}
                            title="Eliminar">
                            <Trash2 size={13} strokeWidth={2.5} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6}>
                      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <DollarSign size={20} style={{ color: ct3 }} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: ct1, marginBottom: 4 }}>Sin movimientos</p>
                        <p style={{ fontSize: 12, color: ct3 }}>{searchTerm ? 'Revisá los parámetros de búsqueda.' : 'No hay movimientos registrados para este día.'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* paginación */}
          <div style={{ padding: '12px 16px', background: surface, borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select value={itemsPorPagina} onChange={e => setItemsPorPagina(Number(e.target.value))} style={{ height: 28, padding: '0 22px 0 8px', fontSize: 11, fontWeight: 600, color: ct2, background: '#fff', border: `1px solid ${border}`, borderRadius: 6, outline: 'none', cursor: 'pointer', ...pillSel }}>
                <option value="10">10 / pág</option>
                <option value="25">25 / pág</option>
                <option value="50">50 / pág</option>
              </select>
              <span style={{ fontSize: 11, color: ct3, fontWeight: 500 }}>
                {paginados.length > 0 ? `${indiceInicio + 1} - ${indiceInicio + paginados.length}` : '0'} de {filtrados.length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} style={{ width: 28, height: 28, borderRadius: 6, background: paginaActual === 1 ? 'transparent' : '#fff', border: `1px solid ${paginaActual === 1 ? 'transparent' : border}`, cursor: paginaActual === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: paginaActual === 1 ? 'rgba(0,0,0,.2)' : ct2 }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 11, fontWeight: 600, color: ct2, minWidth: 38, textAlign: 'center' }}>{paginaActual} / {totalPaginas || 1}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual >= totalPaginas} style={{ width: 28, height: 28, borderRadius: 6, background: paginaActual >= totalPaginas ? 'transparent' : '#fff', border: `1px solid ${paginaActual >= totalPaginas ? 'transparent' : border}`, cursor: paginaActual >= totalPaginas ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: paginaActual >= totalPaginas ? 'rgba(0,0,0,.2)' : ct2 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ HISTORIAL DE CIERRES ══ */}
      <div style={{ padding: '0 clamp(12px, 3vw, 24px) 24px' }}>
        <div style={{ background: surface, borderRadius: 12, border: `1px solid ${border}`, boxShadow: cardShadow, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, background: surface }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>Historial de Cierres</span>
            <span style={{ fontSize: 11, color: ct3, marginLeft: 8 }}>Últimos {Math.min(cierresSeguros.length, 5)} cierres registrados</span>
          </div>

          {cierresSeguros.length > 0 ? cierresSeguros.slice(0, 5).map(c => (
            <div key={c.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, transition: 'background .13s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={12} strokeWidth={2.5} style={{ color: accent }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: ct1 }}>{c.fecha || c.fecha_cierre || 'Fecha desconocida'}</span>
                </div>
                <button onClick={() => openModal && openModal('detalle-cierre', c)} style={{ fontSize: 11, fontWeight: 700, color: accent, background: 'transparent', border: `1px solid rgba(51,65,57,.2)`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
                  Ver detalles
                </button>
              </div>
              <div className="cc-cierre-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  { label: 'Ingresos', val: `+$${fMonto(c.ingresos)}`, clr: '#065F46' },
                  { label: 'Egresos', val: `-$${fMonto(c.egresos)}`, clr: '#991B1B' },
                  { label: 'Saldo final', val: `$${fMonto(c.saldo_final || c.saldo)}`, clr: '#1E40AF' },
                ].map((d, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, color: ct3, marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: d.clr }}>{d.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <CreditCard size={18} style={{ color: ct3 }} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: ct1, marginBottom: 4 }}>Sin cierres registrados</p>
              <p style={{ fontSize: 11, color: ct3 }}>Realizá tu primer cierre de caja para ver el historial.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.14);border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.22)}
        @keyframes kpiIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        tr:hover .group-hover-show{opacity:1!important}

        /* ── Responsive Mobile (≤767px) ─────────────────── */
        @media(max-width:767px){
          /* Header: selector de fecha abajo en mobile */
          .cc-header-fecha { order: 3; width: 100%; justify-content: center; }
          .cc-header-acciones { order: 2; }

          /* Cards resumen: 2 columnas en mobile */
          .cc-cards-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }

          /* Toolbar de tabla: apilado */
          .cc-toolbar { flex-direction: column; align-items: stretch !important; gap: 8px !important; }
          .cc-toolbar > * { width: 100%; min-width: 0 !important; max-width: none !important; }

          /* Tabla: columnas no esenciales ocultas en mobile */
          .cc-table-col-metodo { display: none; }
          .cc-table-col-fecha-label { display: none; }
          /* Hacer tabla horizontalmente scrollable */
          .cc-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .cc-table { min-width: 400px; }

          /* Filas de movimientos mas compactas */
          .cc-table td, .cc-table th { padding: 8px 10px !important; }
          .cc-table td:first-child, .cc-table th:first-child { padding-left: 12px !important; }

          /* Panel cierre: cards en columa unica */
          .cc-cierre-grid { grid-template-columns: 1fr !important; }

          /* Historial cierres: 1 col */
          .cc-cierre-stats { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default ControlCaja