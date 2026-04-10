import React, { useState, useMemo } from 'react'
import {
  DollarSign, TrendingUp, Users, Package,
  BarChart2, ChevronLeft, ChevronRight, Download, Menu
} from 'lucide-react'
import { MenuIcon, ChevronRightIcon } from '@nimbus-ds/icons'

/* ══════════════════════════════════════════
   PALETA — igual que DashboardNimbus / Caja
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

const RESPONSIVE = `
  .rep-show-mobile { display: none; }
  .rep-hide-mobile { display: flex; }
  .rep-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .rep-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  @media (max-width: 900px) {
    .rep-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .rep-charts-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 767px) {
    .rep-show-mobile { display: flex !important; }
    .rep-hide-mobile { display: none !important; }
    .rep-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .rep-kpi-grid { grid-template-columns: 1fr; }
  }
`

/* ─── KPI Card (igual que StatusCard del Caja) ─── */
const KpiCard = ({ icon: Icon, label, value, active }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bg, border: `1px solid ${hov ? C.borderMd : C.border}`,
        borderRadius: 8, padding: '16px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ marginTop: 2 }}>
        <Icon size={16} color={active ? C.primary : C.textMid} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.textBlack, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: C.textMid, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  )
}

/* ─── CardShell (igual que Caja) ─── */
const CardShell = ({ title, children, action, onAction }) => (
  <div style={{ background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.textBlack, fontFamily: "'Inter', sans-serif" }}>
        {title}
      </div>
      {action && (
        <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          {action} <ChevronRightIcon size={12} color={C.primary} />
        </button>
      )}
    </div>
    <div>{children}</div>
  </div>
)

/* ─── Chip de periodo ─── */
const PeriodChip = ({ label, active, onClick }) => (
  <button onClick={onClick}
    style={{
      padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
      border: `1px solid ${active ? C.primary : C.border}`,
      background: active ? C.primary : C.bg,
      color: active ? '#fff' : C.textMid,
      transition: 'all .12s', fontFamily: "'Inter', sans-serif",
    }}>
    {label}
  </button>
)

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const Reportes = ({
  facturas = [], pedidos = [], clientes = [], productos = [],
  onOpenMobileSidebar
}) => {
  const [periodo, setPeriodo] = useState('mes')
  const anioActualReal = new Date().getFullYear()
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActualReal)

  const facturasSafe = Array.isArray(facturas) ? facturas : []
  const hoy = new Date()

  /* Filtro de fecha */
  const fechaFiltro = new Date()
  if (periodo === 'dia') { fechaFiltro.setHours(0, 0, 0, 0) }
  else if (periodo === 'semana') { fechaFiltro.setDate(hoy.getDate() - 7); fechaFiltro.setHours(0, 0, 0, 0) }
  else if (periodo === 'mes') { fechaFiltro.setDate(1); fechaFiltro.setHours(0, 0, 0, 0) }
  else if (periodo === 'anio') { fechaFiltro.setMonth(0, 1); fechaFiltro.setHours(0, 0, 0, 0) }
  else { fechaFiltro.setFullYear(2000) }

  const facturasFiltradas = facturasSafe.filter(f => {
    const d = new Date(f.fecha + 'T00:00:00')
    return d >= fechaFiltro && f.estado !== 'anulada'
  })

  /* KPIs */
  const stats = useMemo(() => {
    let ventasTotal = 0, cobradoTotal = 0
    const clientesActivos = new Set()
    let productosCount = 0, gananciaTotal = 0, hayGanancias = false
    facturasFiltradas.forEach(f => {
      ventasTotal += parseFloat(f.total) || 0
      cobradoTotal += parseFloat(f.montopagado) || 0
      const nom = f.cliente_nombre || f.cliente
      if (nom) clientesActivos.add(nom)
      let items = []
      try { items = typeof f.items === 'string' ? JSON.parse(f.items) : (f.items || []) } catch {}
      items.forEach(i => {
        productosCount += parseFloat(i.cantidad) || 0
        const gan = parseFloat(i.ganancia)
        if (!isNaN(gan)) { gananciaTotal += gan; hayGanancias = true }
      })
    })
    return { ventasTotal, cobradoTotal, clientesActivos: clientesActivos.size, productosCount, gananciaTotal, hayGanancias }
  }, [facturasFiltradas])

  /* Gráfico 7 días */
  const chart7 = useMemo(() => {
    const dias = [], valores = [], nombres = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(hoy.getDate() - i)
      dias.push(d.toISOString().split('T')[0])
      nombres.push(d.toLocaleDateString('es-ES', { weekday: 'short' }))
      valores.push(0)
    }
    facturasSafe.forEach(f => {
      const idx = dias.indexOf(f.fecha)
      if (idx !== -1 && f.estado !== 'anulada') valores[idx] += parseFloat(f.total) || 0
    })
    const maxVal = Math.max(...valores, 1)
    return { nombres, valores, porcentajes: valores.map(v => (v / maxVal) * 100) }
  }, [facturasSafe])

  /* Top clientes */
  const topClientes = useMemo(() => {
    const mapa = {}
    facturasFiltradas.forEach(f => {
      const nom = f.cliente_nombre || f.cliente || 'Consumidor Final'
      if (!mapa[nom]) mapa[nom] = { nombre: nom, compras: 0, total: 0 }
      mapa[nom].compras += 1
      mapa[nom].total += parseFloat(f.total) || 0
    })
    return Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [facturasFiltradas])

  /* Resumen mensual */
  const resumenMensual = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return meses.map((nombre, idx) => {
      const facs = facturasSafe.filter(f => {
        if (f.estado === 'anulada') return false
        const d = new Date(f.fecha + 'T00:00:00')
        return d.getFullYear() === anioSeleccionado && d.getMonth() === idx
      })
      const total = facs.reduce((s, f) => s + (parseFloat(f.total) || 0), 0)
      const cobrado = facs.reduce((s, f) => s + (parseFloat(f.montopagado) || 0), 0)
      return { nombre, idx, total, cobrado, cant: facs.length }
    })
  }, [facturasSafe, anioSeleccionado])

  const periodos = [
    { val: 'dia', lbl: 'Hoy' },
    { val: 'semana', lbl: '7 días' },
    { val: 'mes', lbl: 'Este mes' },
    { val: 'anio', lbl: 'Este año' },
    { val: 'todos', lbl: 'Todo' },
  ]

  const maxMes = Math.max(...resumenMensual.map(m => m.total), 1)

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: "'Inter', sans-serif" }}>
      <style>{RESPONSIVE}</style>

      {/* ── Mobile topbar ── */}
      <div className="rep-show-mobile" style={{ alignItems: 'center', gap: 10, padding: '11px 16px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onOpenMobileSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <MenuIcon size={20} color={C.textBlack} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: C.textBlack }}>Reportes</span>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', boxSizing: 'border-box' }}>

        {/* ── Header ── */}
        <div className="rep-hide-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: C.textBlack }}>Reportes</h1>
            {/* Chips de período */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {periodos.map(p => (
                <PeriodChip key={p.val} label={p.lbl} active={periodo === p.val} onClick={() => setPeriodo(p.val)} />
              ))}
            </div>
          </div>
          <button onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 16px', borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, color: C.textDark, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            <Download size={13} strokeWidth={2.5} /> Exportar
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="rep-kpi-grid">
          <KpiCard icon={DollarSign} label="Total facturado" value={fmtMoney(stats.ventasTotal)} active={stats.ventasTotal > 0} />
          <KpiCard icon={TrendingUp} label="Total cobrado" value={fmtMoney(stats.cobradoTotal)} active={stats.cobradoTotal > 0} />
          <KpiCard icon={Users} label="Clientes atendidos" value={stats.clientesActivos} active={stats.clientesActivos > 0} />
          <KpiCard icon={Package} label="Unidades vendidas" value={stats.productosCount} active={stats.productosCount > 0} />
          {stats.hayGanancias && (
            <KpiCard icon={BarChart2} label="Ganancia bruta" value={fmtMoney(stats.gananciaTotal)} active={stats.gananciaTotal > 0} />
          )}
        </div>

        {/* ── Charts row ── */}
        <div className="rep-charts-grid">

          {/* Evolución 7 días */}
          <CardShell title="Evolución — últimos 7 días">
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 4, height: 120, marginBottom: 8 }}>
                {chart7.porcentajes.map((porc, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 9, color: C.textMid, fontWeight: 600 }}>
                      {chart7.valores[i] > 0 ? fmtMoney(chart7.valores[i]).replace('ARS', '').trim() : ''}
                    </span>
                    <div style={{
                      width: '100%', maxWidth: 36,
                      background: porc > 0 ? `linear-gradient(180deg, ${C.primary}88 0%, ${C.primary} 100%)` : C.border,
                      borderRadius: '4px 4px 0 0',
                      height: `${Math.max(porc, porc > 0 ? 3 : 0)}%`,
                      minHeight: chart7.valores[i] > 0 ? 4 : 0,
                      transition: 'height .3s ease',
                    }} />
                    <span style={{ fontSize: 9, color: C.textMid, textTransform: 'capitalize', fontWeight: 600 }}>{chart7.nombres[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardShell>

          {/* Top 5 clientes */}
          <CardShell title="Top 5 clientes">
            {topClientes.length > 0 ? topClientes.map((c, i) => (
              <div key={i}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < topClientes.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.primarySurf, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.primary, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{c.compras} {c.compras === 1 ? 'compra' : 'compras'}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textBlack, flexShrink: 0 }}>{fmtMoney(c.total)}</div>
              </div>
            )) : (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: C.textMid, fontSize: 12 }}>
                Sin datos para el período seleccionado
              </div>
            )}
          </CardShell>
        </div>

        {/* ── Resumen anual ── */}
        <CardShell title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Resumen anual</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.primarySurf, borderRadius: 8, padding: '2px 6px' }}>
              <button onClick={() => setAnioSeleccionado(a => a - 1)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.primary, display: 'flex', alignItems: 'center', padding: 2 }}>
                <ChevronLeft size={13} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, width: 36, textAlign: 'center' }}>{anioSeleccionado}</span>
              <button onClick={() => setAnioSeleccionado(a => a + 1)} disabled={anioSeleccionado >= anioActualReal}
                style={{ background: 'transparent', border: 'none', cursor: anioSeleccionado >= anioActualReal ? 'default' : 'pointer', color: anioSeleccionado >= anioActualReal ? C.border : C.primary, display: 'flex', alignItems: 'center', padding: 2 }}>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        }>
          {/* Barras mensuales */}
          <div style={{ padding: '16px 20px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {resumenMensual.map((m, i) => {
                const pct = (m.total / maxMes) * 100
                const esMes = m.idx === new Date().getMonth() && anioSeleccionado === anioActualReal
                return (
                  <div key={i} title={`${m.nombre}: ${fmtMoney(m.total)}`}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{
                      width: '100%',
                      background: esMes ? C.primary : (m.total > 0 ? `${C.primary}55` : C.border),
                      borderRadius: '3px 3px 0 0',
                      height: `${Math.max(pct, m.total > 0 ? 4 : 0)}%`,
                      minHeight: m.total > 0 ? 3 : 0,
                      transition: 'height .3s ease', cursor: 'default',
                    }} />
                    <span style={{ fontSize: 8, color: esMes ? C.primary : C.textMid, fontWeight: esMes ? 700 : 500, textTransform: 'capitalize' }}>{m.nombre}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabla mensual simplificada */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderTop: `1px solid ${C.border}` }}>
                  {['Mes', 'Facturas', 'Facturado', 'Cobrado', 'Pendiente'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: i === 0 ? 'left' : 'right', borderBottom: `1px solid ${C.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resumenMensual.map((m) => {
                  const esMes = m.idx === new Date().getMonth() && anioSeleccionado === anioActualReal
                  const pend = m.total - m.cobrado
                  return (
                    <tr key={m.idx}
                      style={{ borderBottom: `1px solid ${C.border}`, opacity: m.cant === 0 ? 0.45 : 1, background: esMes ? `${C.primarySurf}66` : 'transparent', transition: 'background .12s' }}
                      onMouseEnter={e => !esMes && (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => !esMes && (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {esMes && <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />}
                          <span style={{ fontSize: 12, fontWeight: 600, color: esMes ? C.primary : C.textDark }}>{m.nombre}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, color: C.textDark }}>{m.cant || '—'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.textBlack }}>{m.total > 0 ? fmtMoney(m.total) : '—'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.successTxt }}>{m.cobrado > 0 ? fmtMoney(m.cobrado) : '—'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontSize: 12 }}>
                        {pend > 0
                          ? <span style={{ fontWeight: 700, color: C.dangerTxt }}>{fmtMoney(pend)}</span>
                          : m.total > 0
                            ? <span style={{ color: C.successTxt, fontWeight: 600 }}>✓</span>
                            : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: C.textBlack, textTransform: 'uppercase' }}>Total año</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: C.textBlack }}>{resumenMensual.reduce((s, m) => s + m.cant, 0)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: C.textBlack }}>{fmtMoney(resumenMensual.reduce((s, m) => s + m.total, 0))}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: C.successTxt }}>{fmtMoney(resumenMensual.reduce((s, m) => s + m.cobrado, 0))}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 800, color: C.dangerTxt }}>{fmtMoney(resumenMensual.reduce((s, m) => s + Math.max(0, m.total - m.cobrado), 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardShell>

      </div>
    </div>
  )
}

export default Reportes
