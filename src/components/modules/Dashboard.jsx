"use client"

import React, { useEffect } from "react"
import { useAuth } from "../../lib/AuthContext"
import {
  Search, Bell, Plus, DollarSign, FileText, Users, Wallet,
  Calendar, UserPlus, PackagePlus, BarChart3, CheckCircle2,
  Clock, ShoppingCart, Moon, Menu, TrendingUp, TrendingDown,
  Activity, ArrowRight, Package, AlertTriangle,
} from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const fmtMoney = (n) => {
  const v = parseFloat(n) || 0
  return `$${v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/* ─────────────────────────────────────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────────────────────────────────────── */
const accentMap = {
  green: { bar: '#606B6C', fill: '#606B6C', icon: 'rgba(96,107,108,.12)', iconC: '#606B6C' },
  amber: { bar: '#8B8982', fill: '#8B8982', icon: 'rgba(139,137,130,.12)', iconC: '#8B8982' },
  blue: { bar: '#373F47', fill: '#373F47', icon: 'rgba(55,63,71,.10)', iconC: '#373F47' },
  neutral: { bar: 'rgba(139,137,130,.3)', fill: '#606B6C', icon: 'rgba(55,63,71,.07)', iconC: '#8B8982' },
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendType, accent = 'neutral', progress = 0, progressLabel = '', delay = 0, onClick }) => {
  const ac = accentMap[accent] || accentMap.neutral
  const trendUp = trendType === 'up'
  const trendDown = trendType === 'down'
  const trendBg = trendUp ? 'rgba(96,107,108,.1)' : trendDown ? 'rgba(139,137,130,.1)' : 'rgba(139,137,130,.08)'
  const trendColor = trendUp ? '#606B6C' : trendDown ? '#8B8982' : '#8B8982'
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Activity
  const pct = Math.min(100, Math.max(0, progress))

  return (
    <div className="relative rounded-xl overflow-hidden transition-all duration-200"
      onClick={onClick}
      style={{ background: '#E1E1E0', border: '1px solid rgba(48,54,47,.13)', boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)', animation: `kpiInDash .4s ${.05 + delay * .08}s ease both`, cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(48,54,47,.11),0 14px 36px rgba(48,54,47,.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)' }}>

      {/* left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: ac.bar }} />

      <div className="pl-[20px] pr-[18px] pt-[18px] pb-[16px]">
        {/* top row */}
        <div className="flex items-start justify-between mb-[16px]">
          <div className="w-[40px] h-[40px] rounded-[11px] flex items-center justify-center"
            style={{ background: ac.icon, border: '1px solid rgba(48,54,47,.05)', boxShadow: '0 2px 6px rgba(0,0,0,.04), 0 1px 2px rgba(48,54,47,.04)' }}>
            <Icon size={17} strokeWidth={1.8} style={{ color: ac.iconC }} />
          </div>
          {trend && (
            <div className="flex items-center gap-[4px] px-[9px] py-[4px] rounded-full"
              style={{ background: trendBg }}>
              <TrendIcon size={11} strokeWidth={2.5} style={{ color: trendColor }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: trendColor, letterSpacing: '-0.01em' }}>{trend}</span>
            </div>
          )}
        </div>

        {/* value */}
        <p className="font-bold leading-none text-[#1e2320]" style={{ fontSize: 30, letterSpacing: '-0.055em', marginBottom: 6 }}>
          {value}
        </p>
        <p className="font-semibold text-[#373F47]" style={{ fontSize: 13 }}>{title}</p>
        {subtitle && <p className="mt-[4px] text-[#8B8982]" style={{ fontSize: 11 }}>{subtitle}</p>}

        {/* progress bar */}
        <div className="mt-[14px]">
          <div className="flex justify-between items-center mb-[6px]">
            <span style={{ fontSize: 10, fontWeight: 600, color: '#8B8982', textTransform: 'uppercase', letterSpacing: '.06em' }}>{progressLabel}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#606B6C', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(48,54,47,.07)' }}>
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, background: '#606B6C', opacity: .85 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ESTADO PILL
───────────────────────────────────────────────────────────────────────────── */
const estadoPill = (estado) => {
  if (!estado) return { bg: 'rgba(139,137,130,.1)', fg: '#8B8982', label: 'Pendiente', dot: '#8B8982' }
  const e = estado.toLowerCase()
  if (e === 'pagada') return { bg: 'rgba(55,63,71,.08)', fg: '#30362F', label: 'Pagada', dot: '#606B6C' }
  if (e === 'pendiente') return { bg: 'rgba(139,137,130,.1)', fg: '#8B8982', label: 'Pendiente', dot: '#8B8982' }
  if (e === 'parcial') return { bg: 'rgba(55,63,71,.1)', fg: '#373F47', label: 'Parcial', dot: '#373F47' }
  if (e === 'cancelada') return { bg: 'rgba(139,137,130,.08)', fg: '#8B8982', label: 'Cancelada', dot: '#6b6762' }
  return { bg: 'rgba(139,137,130,.1)', fg: '#8B8982', label: estado.charAt(0).toUpperCase() + estado.slice(1), dot: '#8B8982' }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────────────────────────────────────── */
const SectionLabel = ({ children, action, onAction }) => (
  <div className="flex items-center justify-between mb-3">
    <p className="text-[11px] font-bold uppercase tracking-[.1em]" style={{ color: '#8B8982' }}>{children}</p>
    {action && (
      <button onClick={onAction} className="flex items-center gap-[3px] text-[11px] font-semibold transition-colors"
        style={{ color: '#8B8982', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.color = '#30362F'}
        onMouseLeave={e => e.currentTarget.style.color = '#8B8982'}>
        {action} <ArrowRight size={11} strokeWidth={2.5} />
      </button>
    )}
  </div>
)

/* ─────────────────────────────────────────────────────────────────────────────
   CARD SHELL
───────────────────────────────────────────────────────────────────────────── */
const CardShell = ({ title, action, onAction, children, noPad = false }) => (
  <div className="rounded-xl overflow-hidden h-full flex flex-col"
    style={{ background: '#FAFAFA', border: '1px solid rgba(48,54,47,.09)', boxShadow: '0 1px 3px rgba(48,54,47,.06),0 4px 14px rgba(48,54,47,.05)' }}>
    {/* header */}
    <div className="flex justify-between items-center px-[14px] py-[10px] border-b flex-shrink-0"
      style={{ background: '#E0E1DD', borderColor: 'rgba(48,54,47,.08)' }}>
      <span className="text-[11.5px] font-bold flex items-center gap-[6px]" style={{ color: '#30362F' }}>{title}</span>
      {action && (
        <button onClick={onAction}
          className="flex items-center gap-[3px] text-[10px] font-semibold px-[7px] py-[3px] rounded-[5px] transition-all border-none bg-transparent cursor-pointer"
          style={{ color: '#8B8982' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#30362F'; e.currentTarget.style.background = 'rgba(48,54,47,.05)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8B8982'; e.currentTarget.style.background = 'transparent' }}>
          {action} <ArrowRight size={9} strokeWidth={2.5} />
        </button>
      )}
    </div>
    <div className={`flex-1 overflow-hidden`} style={{ background: '#FAFAFA' }}>
      {children}
    </div>
  </div>
)

/* ─────────────────────────────────────────────────────────────────────────────
   FACTURAS TABLE
───────────────────────────────────────────────────────────────────────────── */
const FacturasTable = ({ items, onViewAll }) => (
  <CardShell
    title={<>Últimas Facturas <span className="text-[9px] font-bold px-[5px] py-[1.5px] rounded-[4px]" style={{ background: 'rgba(48,54,47,.08)', color: '#606B6C' }}>{items.length}</span></>}
    action="Ver todas" onAction={onViewAll}>
    {items.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#E0E1DD' }}>
              {[['Factura', 'left', 110], ['Cliente', 'left', undefined], ['Estado', 'center', 92], ['Total', 'right', 92]].map(([h, align, w]) => (
                <th key={h} className="px-[14px] py-[8px] border-b"
                  style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: '#8B8982', borderColor: 'rgba(48,54,47,.08)', textAlign: align, width: w }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 7).map((row, i) => {
              const pill = estadoPill(row.estado)
              return (
                <tr key={i} className="border-b last:border-0 transition-colors cursor-default"
                  style={{ borderColor: 'rgba(48,54,47,.07)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(48,54,47,.022)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-[14px] py-[9px] font-bold" style={{ fontSize: 10.5, color: '#30362F', fontFamily: "'DM Mono',monospace" }}>
                    {row.numero || 'FA-000001'}
                  </td>
                  <td className="px-[14px] py-[9px]" style={{ fontSize: 11.5, color: '#373F47', fontWeight: 500 }}>
                    {row.cliente_nombre || row.cliente || '—'}
                  </td>
                  <td className="px-[14px] py-[9px] text-center">
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-[6px] text-[9px] font-bold"
                      style={{ background: pill.bg, color: pill.fg }}>
                      <span className="w-[4px] h-[4px] rounded-full flex-shrink-0" style={{ background: pill.dot }} />
                      {pill.label}
                    </span>
                  </td>
                  <td className="px-[14px] py-[9px] text-right font-bold" style={{ fontSize: 11, color: '#1e2320', fontFamily: "'DM Mono',monospace" }}>
                    ${(row.total || 0).toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <div className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center" style={{ background: 'rgba(48,54,47,.05)' }}>
          <FileText size={18} strokeWidth={1.5} style={{ color: '#8B8982' }} />
        </div>
        <p style={{ fontSize: 11.5, color: '#8B8982', fontWeight: 500 }}>Sin facturas recientes</p>
      </div>
    )}
  </CardShell>
)

/* ─────────────────────────────────────────────────────────────────────────────
   PEDIDOS PANEL
───────────────────────────────────────────────────────────────────────────── */
const PedidosPanel = ({ items, onViewAll }) => (
  <CardShell
    title={<>Pedidos Pendientes <span className="text-[9px] font-bold px-[5px] py-[1.5px] rounded-[4px]" style={{ background: 'rgba(48,54,47,.08)', color: '#606B6C' }}>{items.length}</span></>}
    action="Ver todos" onAction={onViewAll}>
    {items.length > 0 ? (
      <div>
        {items.slice(0, 4).map((row, i) => (
          <div key={i} className="flex items-center gap-[10px] px-[14px] py-[10px] border-b last:border-0 cursor-default transition-colors"
            style={{ borderColor: 'rgba(48,54,47,.07)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(48,54,47,.022)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(55,63,71,.07)', border: '1px solid rgba(48,54,47,.07)' }}>
              <ShoppingCart size={13} strokeWidth={1.8} style={{ color: '#606B6C' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ fontSize: 12, color: '#1e2320' }}>
                {row.cliente_nombre || row.cliente || 'Cliente'}
              </p>
              <p style={{ fontSize: 9.5, color: '#8B8982', fontFamily: "'DM Mono',monospace", marginTop: 1 }}>
                {row.codigo || `PED-${String(row.id || '').slice(0, 6)}`}
              </p>
            </div>
            <div className="flex items-center gap-[3px] px-[7px] py-[3px] rounded-[5px] flex-shrink-0"
              style={{ fontSize: 9, fontWeight: 700, background: 'rgba(55,63,71,.08)', color: '#606B6C', border: '1px solid rgba(48,54,47,.08)' }}>
              <Clock size={8} strokeWidth={2.5} /> Pendiente
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="w-[40px] h-[40px] rounded-[11px] flex items-center justify-center" style={{ background: 'rgba(48,54,47,.05)' }}>
          <CheckCircle2 size={18} strokeWidth={1.5} style={{ color: '#8B8982' }} />
        </div>
        <p style={{ fontSize: 11, color: '#8B8982', fontWeight: 500 }}>Sin pedidos pendientes</p>
      </div>
    )}
  </CardShell>
)

/* ─────────────────────────────────────────────────────────────────────────────
   STOCK ALERT PANEL
───────────────────────────────────────────────────────────────────────────── */
const StockAlertPanel = ({ productos, onViewAll }) => {
  const bajoStock = productos.filter(p => (p.stock || 0) <= (p.stockMinimo || 5) && (p.stock || 0) >= 0)
  return (
    <CardShell
      title={<>Stock Bajo <span className="text-[9px] font-bold px-[5px] py-[1.5px] rounded-[4px]" style={{ background: 'rgba(48,54,47,.08)', color: '#606B6C' }}>{bajoStock.length}</span></>}
      action="Productos" onAction={onViewAll}>
      {bajoStock.length > 0 ? (
        <div>
          {bajoStock.slice(0, 5).map((p, i) => {
            const pct = Math.min(100, ((p.stock || 0) / 20) * 100)
            const empty = (p.stock || 0) === 0
            return (
              <div key={i} className="flex items-center gap-[10px] px-[14px] py-[8px] border-b last:border-0 cursor-default transition-colors"
                style={{ borderColor: 'rgba(48,54,47,.07)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(48,54,47,.022)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center flex-shrink-0"
                  style={{ background: empty ? 'rgba(139,137,130,.08)' : 'rgba(55,63,71,.07)' }}>
                  <Package size={12} strokeWidth={1.8} style={{ color: empty ? '#8B8982' : '#606B6C' }} />
                </div>
                <span className="flex-1 min-w-0 truncate font-medium" style={{ fontSize: 11.5, color: '#30362F' }}>{p.nombre}</span>
                <div className="flex items-center gap-[8px] flex-shrink-0">
                  <div className="w-[44px] h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(48,54,47,.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: empty ? '#8B8982' : '#606B6C', transition: 'width .3s' }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, minWidth: 32, textAlign: 'right', color: empty ? '#8B8982' : '#30362F', fontFamily: "'DM Mono',monospace" }}>
                    {p.stock || 0} u.
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center py-6" style={{ fontSize: 11, color: '#8B8982', fontWeight: 500 }}>
          Stock en niveles óptimos ✓
        </p>
      )}
    </CardShell>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   QUICK STATS BAR
───────────────────────────────────────────────────────────────────────────── */
const QuickStatsBar = ({ facturas, pedidos, onViewAllFacturas, onViewAllPedidos }) => {
  const stats = [
    { label: 'Fact. pagadas',       value: facturas.filter(f => f.estado === 'pagada').length,                                                Icon: CheckCircle2, onClick: onViewAllFacturas },
    { label: 'Fact. pendientes',    value: facturas.filter(f => f.estado === 'pendiente' || f.estado === 'parcial').length,                    Icon: Clock,        onClick: onViewAllFacturas },
    { label: 'Pedidos en curso',    value: pedidos.filter(p => p.estado === 'preparando' || p.estado === 'enviado').length,                    Icon: ShoppingCart,  onClick: onViewAllPedidos  },
    { label: 'Pedidos completados', value: pedidos.filter(p => p.estado === 'entregado'  || p.estado === 'completado').length,                 Icon: Package,       onClick: onViewAllPedidos  },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((s, i) => (
        <div key={i}
          className="flex items-center gap-[7px]"
          onClick={s.onClick}
          style={{
            background: '#FAFAFA',
            border: '1px solid rgba(48,54,47,.10)',
            borderRadius: 8,
            padding: '5px 11px 5px 8px',
            boxShadow: '0 1px 3px rgba(48,54,47,.05)',
            cursor: s.onClick ? 'pointer' : 'default',
            transition: 'background .15s',
            animation: `kpiInDash .35s ${i * .06}s ease both`,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F0F0EE'}
          onMouseLeave={e => e.currentTarget.style.background = '#FAFAFA'}>
          <s.Icon size={12} strokeWidth={1.8} style={{ color: '#8B8982', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e2320', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {s.value}
          </span>
          <span style={{ fontSize: 10.5, fontWeight: 500, color: '#8B8982' }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANALYTICS CHART — usa datos reales por mes
───────────────────────────────────────────────────────────────────────────── */
const AnalyticsChart = ({ facturas }) => {
  const months = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
  const year = new Date().getFullYear()
  const porMes = months.map((_, idx) =>
    facturas.filter(f => {
      if (!f.fecha) return false
      const d = new Date(f.fecha)
      return d.getFullYear() === year && d.getMonth() === idx
    }).reduce((s, f) => s + (f.total || 0), 0)
  )
  const maxVal = Math.max(...porMes, 1)

  // Build SVG path from month data
  const pts = porMes.map((v, i) => {
    const x = (i / 11) * 100
    const y = 85 - ((v / maxVal) * 70)
    return `${x},${y}`
  })
  const linePath = 'M' + pts.join(' L')
  const areaPath = linePath + ` L100,90 L0,90 Z`

  const yLabels = [maxVal, maxVal * 0.66, maxVal * 0.33, 0].map(v =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : Math.round(v)
  )

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: '#FAFAFA', border: '1px solid rgba(48,54,47,.09)', boxShadow: '0 1px 3px rgba(48,54,47,.06),0 4px 14px rgba(48,54,47,.05)' }}>
      {/* header */}
      <div className="flex justify-between items-start px-[16px] pt-[14px] pb-[10px] border-b" style={{ borderColor: 'rgba(48,54,47,.07)', background: '#E0E1DD' }}>
        <div>
          <p className="font-bold" style={{ fontSize: 12, color: '#30362F' }}>Ingresos Mensuales</p>
          <p style={{ fontSize: 9.5, color: '#8B8982', marginTop: 2 }}>Año {year} • Facturas emitidas</p>
        </div>
        <div className="flex gap-4">
          {[['#606B6C', 'Ingresos']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-[5px] text-[9.5px] font-medium" style={{ color: '#8B8982' }}>
              <span className="w-[8px] h-[2px] rounded-full inline-block" style={{ background: c }} /> {l}
            </span>
          ))}
        </div>
      </div>

      {/* chart */}
      <div className="relative" style={{ height: 160, padding: '8px 16px 0 46px' }}>
        {/* y-axis labels */}
        <div className="absolute left-[8px] flex flex-col justify-between" style={{ top: 8, bottom: 24, width: 36 }}>
          {yLabels.map((v, i) => (
            <span key={i} style={{ fontSize: 8, color: '#8B8982', textAlign: 'right', display: 'block' }}>{v}</span>
          ))}
        </div>

        <svg style={{ width: '100%', height: 130 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#606B6C" stopOpacity=".2" />
              <stop offset="100%" stopColor="#606B6C" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* grid lines */}
          {[10, 37, 63, 90].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(48,54,47,.06)" strokeWidth=".5" />
          ))}
          {/* area fill */}
          <path d={areaPath} fill="url(#chartGrad)" />
          {/* line */}
          <path d={linePath} fill="none" stroke="#606B6C" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
          {/* dots on data points */}
          {porMes.map((v, i) => {
            const x = (i / 11) * 100
            const y = 85 - ((v / maxVal) * 70)
            return v > 0 ? <circle key={i} cx={x} cy={y} r="1.5" fill="#606B6C" /> : null
          })}
        </svg>

        {/* x-axis */}
        <div className="flex justify-between" style={{ paddingRight: 0 }}>
          {months.map((m, i) => (
            <span key={i} style={{ fontSize: 8, color: '#8B8982', textAlign: 'center', flex: 1 }}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
const Dashboard = ({
  clientes = [], productos = [], facturas = [], pedidos = [],
  caja = {}, onViewAllFacturas, onViewAllProductos,
  onViewAllPedidos, onViewAllClientes, onViewAllCaja, openModal, onOpenMobileSidebar,
}) => {
  const { user } = useAuth()
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const inicioAnteriorMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const finAnteriorMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0)

  const facturasEsteMes = facturas.filter(f => f.fecha && new Date(f.fecha) >= inicioMes)
  const facturasMesAnterior = facturas.filter(f => {
    if (!f.fecha) return false
    const d = new Date(f.fecha)
    return d >= inicioAnteriorMes && d <= finAnteriorMes
  })
  const totalEsteMes = facturasEsteMes.reduce((s, f) => s + (f.total || 0), 0)
  const totalMesAnterior = facturasMesAnterior.reduce((s, f) => s + (f.total || 0), 0)
  const cambioVentas = totalMesAnterior > 0
    ? (((totalEsteMes - totalMesAnterior) / totalMesAnterior) * 100).toFixed(1)
    : totalEsteMes > 0 ? 100 : 0
  const facturasPendientes = facturas.filter(f => f.estado === 'pendiente' || f.estado === 'parcial').length
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente')

  const hora = hoy.getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombreUsuario = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Administrador'

  const fechaStr = hoy.toLocaleDateString("es-ES", { weekday: 'long', day: "numeric", month: "long", year: "numeric" })
  const fechaCap = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)

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

  return (
    <div className="w-full h-full min-h-screen flex flex-col overflow-x-hidden bg-[#F5F5F5]"
      style={{ fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ══ Fonts ══ */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');`}</style>

      {/* ══════════ TOPBAR ══════════ */}
      <header className="flex items-center gap-2 flex-shrink-0 border-b"
        style={{ height: 52, padding: '0 20px', background: '#282A28', borderColor: 'rgba(255,255,255,.1)' }}>

        <button onClick={onOpenMobileSidebar}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
          style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
          <Menu size={14} strokeWidth={2} />
        </button>

        {/* search */}
        <div className="flex items-center gap-2 rounded-lg border px-2.5 flex-1 max-w-[220px]"
          style={{ height: 30, background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.12)' }}>
          <Search size={11} strokeWidth={2} style={{ color: 'rgba(255,255,255,.4)', flexShrink: 0 }} />
          <input type="text" placeholder="Buscar..."
            className="bg-transparent border-none w-full focus:outline-none focus:ring-0"
            style={{ fontSize: 11.5, color: 'white', fontFamily: 'Inter,sans-serif', outline: 'none' }} />
          <kbd className="text-[7.5px] px-1 py-0.5 rounded hidden sm:block"
            style={{ fontFamily: "'DM Mono',monospace", background: 'rgba(0,0,0,.25)', color: 'rgba(255,255,255,.35)', border: '1px solid rgba(255,255,255,.1)' }}>
            ⌘K
          </kbd>
        </div>

        <div className="flex-1" />

        {/* buttons */}
        <div className="flex items-center gap-1.5">
          {[
            { label: <div className="flex items-center gap-1"><span>Nuevo Pedido</span><span style={{ padding: '1.5px 4px', background: 'rgba(0,0,0,.15)', borderRadius: 3, fontSize: 8.5, fontFamily: "'DM Mono', monospace", marginLeft: 1 }}>Ctrl</span></div>, stringLabel: 'Nuevo Pedido', icon: <Plus size={10} strokeWidth={2.5} />, fn: () => openModal && openModal('nuevo-pedido'), primary: true, cls: 'hidden md:flex' },
            { label: 'Cliente', stringLabel: 'Cliente', icon: <UserPlus size={10} strokeWidth={2} />, fn: () => openModal && openModal('nuevo-cliente'), cls: 'hidden lg:flex' },
            { label: 'Producto', stringLabel: 'Producto', icon: <PackagePlus size={10} strokeWidth={2} />, fn: () => openModal && openModal('nuevo-producto'), cls: 'hidden lg:flex' },
            { label: 'Reportes', stringLabel: 'Reportes', icon: <BarChart3 size={10} strokeWidth={2} />, fn: () => { }, cls: 'hidden lg:flex' },
          ].map(({ label, stringLabel, icon, fn, primary, cls }) => (
            <button key={stringLabel} onClick={fn}
              className={`${cls} items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all`}
              style={{
                fontSize: 11, fontFamily: 'Inter,sans-serif', fontWeight: primary ? 700 : 500,
                background: primary ? '#DCED31' : 'transparent',
                color: primary ? '#282A28' : '#DCED31',
                border: '1px solid #DCED31',
              }}
              onMouseEnter={e => !primary && (e.currentTarget.style.background = 'rgba(220,237,49,.1)')}
              onMouseLeave={e => !primary && (e.currentTarget.style.background = 'transparent')}>
              {icon} {label}
            </button>
          ))}

          <div className="w-px h-4 mx-1 hidden md:block" style={{ background: 'rgba(255,255,255,.12)' }} />

          <button className="w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}>
            <Moon size={13} strokeWidth={2} />
          </button>
          <button className="w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}>
            <Bell size={13} strokeWidth={2} />
          </button>
          <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-bold text-white cursor-pointer overflow-hidden border flex-shrink-0"
            style={{ background: '#606B6C', borderColor: 'rgba(255,255,255,.2)' }}>
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
              : (user?.email ? user.email.charAt(0).toUpperCase() : 'A')}
          </div>
        </div>
      </header>

      {/* Mobile actions */}
      <div className="md:hidden flex items-center gap-1.5 px-4 py-2 border-b overflow-x-auto"
        style={{ background: '#373F47', borderColor: 'rgba(255,255,255,.1)', scrollbarWidth: 'none' }}>
        {[
          { label: 'Nuevo Pedido', fn: () => openModal && openModal('nuevo-pedido'), primary: true },
          { label: 'Cliente', fn: () => openModal && openModal('nuevo-cliente') },
          { label: 'Producto', fn: () => openModal && openModal('nuevo-producto') },
          { label: 'Reportes', fn: () => { } },
        ].map(({ label, fn, primary }) => (
          <button key={label} onClick={fn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap flex-shrink-0"
            style={{
              fontSize: 11, fontFamily: 'Inter,sans-serif', fontWeight: primary ? 700 : 500,
              background: primary ? '#DCED31' : 'transparent',
              color: primary ? '#282A28' : '#DCED31',
              border: '1px solid #DCED31',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════════ CONTENT ══════════ */}
      <main className="flex-1 overflow-y-auto w-full" style={{ padding: '28px 28px 48px' }}>

        {/* ── PAGE HEADER ── */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <p style={{ fontSize: 10.5, color: '#8B8982', marginBottom: 5, letterSpacing: '.01em' }}>
              {saludo}, {nombreUsuario}
            </p>
            <h1 className="font-bold leading-none" style={{ fontSize: 28, color: '#1e2320', letterSpacing: '-0.035em' }}>
              Resumen de Ventas
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-[10px] py-[5px] rounded-lg"
            style={{ fontSize: 11, fontWeight: 600, color: '#373F47', background: 'rgba(48,54,47,.06)', border: '1px solid rgba(48,54,47,.07)' }}>
            <Calendar size={11} strokeWidth={2.5} />
            {fechaCap}
          </div>
        </div>

        {/* ── QUICK STATS ── */}
        <div className="mb-4">
          <QuickStatsBar facturas={facturas} pedidos={pedidos} onViewAllFacturas={onViewAllFacturas} onViewAllPedidos={onViewAllPedidos} />
        </div>

        {/* ── KPI CARDS ── */}
        <div className="mb-6">
          <SectionLabel>Métricas Clave</SectionLabel>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Ventas este mes" value={fmtMoney(totalEsteMes)}
              subtitle={`Mes ant: ${fmtMoney(totalMesAnterior)}`} icon={DollarSign}
              trend={`${cambioVentas >= 0 ? '+' : ''}${cambioVentas}%`}
              trendType={cambioVentas >= 0 ? 'up' : 'down'} accent="green"
              progress={totalMesAnterior > 0 ? Math.min(100, Math.round((totalEsteMes / Math.max(totalEsteMes, totalMesAnterior)) * 100)) : totalEsteMes > 0 ? 100 : 0}
              progressLabel="Meta mensual" delay={0} />
            <MetricCard title="Facturas pendientes" value={facturasPendientes}
              subtitle={`De ${facturas.length} en total`} icon={FileText}
              trend={facturasPendientes > 0 ? `${facturasPendientes} activas` : 'Al día'}
              trendType={facturasPendientes > 0 ? 'down' : 'up'} accent="amber"
              progress={facturas.length > 0 ? Math.round(((facturas.length - facturasPendientes) / facturas.length) * 100) : 100}
              progressLabel="Cobrabilidad" delay={1} />
            <MetricCard title="Clientes registrados" value={clientes.length}
              subtitle="Base de clientes total" icon={Users}
              trend="Activo" trendType="up" accent="blue"
              progress={Math.min(100, Math.round((clientes.length / Math.max(clientes.length, 1)) * 100))}
              progressLabel="Retención" delay={2} />
            <MetricCard title="Balance de Caja" value={fmtMoney(caja?.saldo || 0)}
              subtitle={`Egresos: ${fmtMoney(caja?.egresos || 0)}`} icon={Wallet}
              trend="Al día" trendType="neutral" accent="neutral"
              progress={(() => { const ing = caja?.ingresos || 0; const eg = caja?.egresos || 0; const tot = ing + eg; return tot > 0 ? Math.round((ing / tot) * 100) : 74 })()}
              progressLabel="Liquidez" delay={3} />
          </div>
        </div>

        {/* ── ANÁLISIS GRID ── */}
        <div className="mb-6">
          <SectionLabel>Análisis</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.9fr', gap: 12 }}
            className="xl:grid xl-cols-3 block-grid">

            {/* ── COL 1: Rendimiento por cliente ── */}
            <div style={{ background: '#FAFAFA', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(48,54,47,.13)', boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(48,54,47,.07)', background: '#f8f8f7' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#30362F' }}>Rendimiento por cliente</p>
                  <p style={{ fontSize: 11, color: '#8B8982', marginTop: 2 }}>Top 5 — ingresos registrados</p>
                </div>
                <button onClick={onViewAllFacturas} style={{ fontSize: 11.5, fontWeight: 500, color: '#8B8982', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Ver todos →</button>
              </div>
              <div style={{ padding: '4px 0' }}>
                {(() => {
                  // Calcular ingresos por cliente desde facturas
                  const porCliente = {}
                  facturas.forEach(f => {
                    const key = f.cliente_nombre || f.cliente || 'Sin nombre'
                    porCliente[key] = (porCliente[key] || 0) + (parseFloat(f.total) || 0)
                  })
                  const top5 = Object.entries(porCliente)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                  const maxVal = top5[0]?.[1] || 1
                  const colors = ['#30362F', '#373F47', '#4a5568', '#5a6474', '#8B8982']
                  return top5.length > 0 ? top5.map(([nombre, monto], i) => {
                    const initials = nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                    const pct = Math.round((monto / maxVal) * 100)
                    const factsCliente = facturas.filter(f => (f.cliente_nombre || f.cliente) === nombre)
                    const vencidas = factsCliente.filter(f => f.estado === 'pendiente').length
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '22px 32px 1fr auto', alignItems: 'center', gap: 10, padding: '11px 18px', transition: 'background .12s', cursor: 'default' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(48,54,47,.026)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ fontSize: 11, color: 'rgba(139,137,130,.45)', textAlign: 'center' }}>{i + 1}</span>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: colors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#30362F', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{nombre}</p>
                          <p style={{ fontSize: 11, color: '#8B8982', marginTop: 2 }}>{factsCliente.length} factura{factsCliente.length !== 1 ? 's' : ''}{vencidas > 0 ? ` · ${vencidas} pendiente${vencidas > 1 ? 's' : ''}` : ''}</p>
                          <div style={{ height: 5, background: 'rgba(48,54,47,.08)', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: '#373F47', borderRadius: 99, transition: 'width .6s ease' }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 12.5, fontWeight: 700, color: '#30362F', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>${monto.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 18, justifyContent: 'flex-end', marginTop: 4 }}>
                            {[...Array(7)].map((_, j) => {
                              const h = 4 + Math.random() * 14
                              return <div key={j} style={{ width: 4, height: h, borderRadius: '2px 2px 0 0', background: '#373F47', opacity: j === 3 || j === 5 ? 0.85 : 0.22 }} />
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8B8982', fontSize: 12 }}>Sin datos de clientes aún</div>
                  )
                })()}
              </div>
            </div>

            {/* ── COL 2: Pipeline de cobros ── */}
            <div style={{ background: '#FAFAFA', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(48,54,47,.13)', boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(48,54,47,.07)', background: '#f8f8f7' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#30362F' }}>Pipeline de cobros</p>
                <p style={{ fontSize: 11, color: '#8B8982', marginTop: 2 }}>Estado del dinero emitido</p>
              </div>
              <div style={{ padding: 20 }}>
                {(() => {
                  const totalEmitido = facturas.reduce((s, f) => s + (parseFloat(f.total) || 0), 0)
                  const cobrado = facturas.filter(f => f.estado === 'pagada').reduce((s, f) => s + (parseFloat(f.total) || 0), 0)
                  const sinCobrar = facturas.filter(f => f.estado === 'pendiente').reduce((s, f) => s + (parseFloat(f.total) || 0), 0)
                  const parcial = facturas.filter(f => f.estado === 'parcial').reduce((s, f) => s + (parseFloat(f.total) || 0), 0)
                  const pctCobrado = totalEmitido > 0 ? Math.round((cobrado / totalEmitido) * 100) : 0
                  const pctSin = totalEmitido > 0 ? Math.round((sinCobrar / totalEmitido) * 100) : 0
                  const pctParcial = totalEmitido > 0 ? Math.round((parcial / totalEmitido) * 100) : 0
                  const fmt = n => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  const r = 36, circ = 2 * Math.PI * r
                  const cobradoArc = (pctCobrado / 100) * circ
                  const sinArc = (pctSin / 100) * circ
                  const parcialArc = (pctParcial / 100) * circ
                  return (
                    <>
                      <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(48,54,47,.07)' }}>
                        <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-.05em', color: '#30362F' }}>{fmt(totalEmitido)}</p>
                        <p style={{ fontSize: 12, color: '#8B8982', marginTop: 3 }}>Total emitido</p>
                      </div>
                      {/* donut */}
                      <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 16px' }}>
                        <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(48,54,47,.07)" strokeWidth="10" />
                          <circle cx="44" cy="44" r={r} fill="none" stroke="#DCED31" strokeWidth="10"
                            strokeDasharray={`${cobradoArc} ${circ}`} strokeDashoffset="0" opacity="1" />
                          <circle cx="44" cy="44" r={r} fill="none" stroke="#373F47" strokeWidth="10"
                            strokeDasharray={`${sinArc} ${circ}`} strokeDashoffset={-cobradoArc} opacity=".7" />
                          <circle cx="44" cy="44" r={r} fill="none" stroke="#8B8982" strokeWidth="10"
                            strokeDasharray={`${parcialArc} ${circ}`} strokeDashoffset={-(cobradoArc + sinArc)} opacity=".5" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#30362F' }}>{pctCobrado}%</p>
                          <p style={{ fontSize: 8.5, color: '#8B8982', textAlign: 'center', lineHeight: 1.2 }}>cobrado</p>
                        </div>
                      </div>
                      {/* funnel rows */}
                      {[
                        { label: 'Cobrado', amount: cobrado, pct: pctCobrado, color: '#DCED31' },
                        { label: 'Sin cobrar', amount: sinCobrar, pct: pctSin, color: '#373F47' },
                        { label: 'Parcial', amount: parcial, pct: pctParcial, color: '#8B8982' },
                      ].map(({ label, amount, pct, color }) => (
                        <div key={label} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                              <span style={{ fontSize: 11, fontWeight: 500, color: '#373F47' }}>{label}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#30362F', letterSpacing: '-0.02em' }}>{fmt(amount)}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#8B8982' }}>{pct}%</span>
                            </div>
                          </div>
                          <div style={{ height: 8, borderRadius: 99, background: 'rgba(48,54,47,.07)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width .7s cubic-bezier(.4,0,.2,1)' }} />
                          </div>
                        </div>
                      ))}
                    </>
                  )
                })()}
              </div>
            </div>

            {/* ── COL 3: Actividad reciente ── */}
            <div style={{ background: '#FAFAFA', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(48,54,47,.13)', boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(48,54,47,.07)', background: '#f8f8f7' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#30362F' }}>Actividad reciente</p>
                  <p style={{ fontSize: 11, color: '#8B8982', marginTop: 2 }}>Últimas transacciones</p>
                </div>
                <button onClick={onViewAllFacturas} style={{ fontSize: 11.5, fontWeight: 500, color: '#8B8982', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Ver todo →</button>
              </div>
              <div style={{ padding: '4px 0' }}>
                {facturas.slice(0, 6).map((f, i) => {
                  const isPagada = f.estado === 'pagada'
                  const isParcial = f.estado === 'parcial'
                  const dotBg = isPagada ? 'rgba(45,106,79,.12)' : isParcial ? 'rgba(55,63,71,.1)' : 'rgba(139,137,130,.12)'
                  const dotColor = isPagada ? '#2d6a4f' : isParcial ? '#373F47' : '#8B8982'
                  const icon = isPagada
                    ? <CheckCircle2 size={10} strokeWidth={2.5} />
                    : <FileText size={10} strokeWidth={2} />
                  const fmt = n => `$${(parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  const fechaRelativa = f.fecha ? (() => {
                    const diff = Math.floor((Date.now() - new Date(f.fecha)) / 60000)
                    if (diff < 60) return `hace ${diff} min`
                    if (diff < 1440) return `hace ${Math.floor(diff / 60)} h`
                    return `hace ${Math.floor(diff / 1440)} día${Math.floor(diff / 1440) > 1 ? 's' : ''}`
                  })() : '—'
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 18px', position: 'relative', transition: 'background .12s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(48,54,47,.026)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {i < 5 && <div style={{ position: 'absolute', left: 33, top: 36, bottom: -4, width: 1, background: 'rgba(48,54,47,.07)' }} />}
                      <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1, background: dotBg, color: dotColor }}>{icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#30362F', lineHeight: 1.4 }}>
                          {isPagada ? 'Pago recibido' : 'Factura emitida'}{' '}
                          <span style={{ fontWeight: 400, color: '#8B8982' }}>de {f.cliente_nombre || f.cliente || 'Cliente'}</span>
                        </p>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#373F47', marginTop: 2, letterSpacing: '-0.02em' }}>{fmt(f.total)}</p>
                        <p style={{ fontSize: 11, color: '#8B8982', marginTop: 2 }}>{fechaRelativa}</p>
                      </div>
                    </div>
                  )
                })}
                {facturas.length === 0 && (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8B8982', fontSize: 12 }}>Sin actividad registrada</div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── EVOLUCIÓN FINANCIERA ── */}
        <div className="mb-6">
          <SectionLabel>Evolución Financiera</SectionLabel>
          <div style={{ background: '#FAFAFA', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(48,54,47,.13)', boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(48,54,47,.07)', background: '#f8f8f7' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#30362F' }}>Ingresos Mensuales</p>
                <p style={{ fontSize: 11, color: '#8B8982', marginTop: 2 }}>Últimos 6 meses</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#30362F' }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#8B8982' }}>Cobrado</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(139,137,130,.3)' }} />
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#8B8982' }}>Pendiente</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '24px 24px 20px', minHeight: 220 }}>
              {(() => {
                const chartMonths = []
                const now2 = new Date()
                for (let i = 5; i >= 0; i--) {
                  const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1)
                  chartMonths.push({
                    label: d.toLocaleString('es-ES', { month: 'short' }).substring(0, 3).toUpperCase() + ' ' + d.getFullYear().toString().substring(2),
                    valC: 0,
                    valP: 0,
                    m: d.getMonth(),
                    y: d.getFullYear()
                  })
                }

                facturas.forEach(f => {
                  if (f.fecha) {
                    const fd = new Date(f.fecha)
                    const match = chartMonths.find(m => m.m === fd.getMonth() && m.y === fd.getFullYear())
                    if (match) {
                      if (f.estado === 'pagada') match.valC += (parseFloat(f.total) || 0)
                      else match.valP += (parseFloat(f.total) || 0)
                    }
                  }
                })

                const maxChartVal = Math.max(...chartMonths.map(m => m.valC + m.valP), 1)
                const yLines = [1, 0.75, 0.5, 0.25, 0].map(p => maxChartVal * p)

                return (
                  <div style={{ position: 'relative', height: 180, display: 'flex' }}>
                    {/* Y Axis */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 16, borderRight: '1px solid rgba(48,54,47,.08)', height: '100%', paddingBottom: 24 }}>
                      {yLines.map((v, i) => (
                        <span key={i} style={{ fontSize: 10, color: '#8B8982', textAlign: 'right', whiteSpace: 'nowrap', display: 'block', transform: 'translateY(-50%)' }}>
                          ${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : Math.round(v)}
                        </span>
                      ))}
                    </div>

                    {/* Chart Area */}
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: 24, paddingLeft: 12 }}>
                      {/* Grid Lines */}
                      <div style={{ position: 'absolute', inset: '0 0 24px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, pointerEvents: 'none', marginLeft: 12 }}>
                        {yLines.map((v, i) => (
                          <div key={i} style={{ width: '100%', height: 1, background: i === 4 ? 'transparent' : 'rgba(48,54,47,.05)' }} />
                        ))}
                      </div>

                      {/* Bars */}
                      {chartMonths.map((m, i) => {
                        const pctC = (m.valC / maxChartVal) * 100
                        const pctP = (m.valP / maxChartVal) * 100
                        const sumPct = pctC + pctP
                        const sumVal = m.valC + m.valP

                        return (
                          <div key={i} style={{ position: 'relative', height: '100%', width: 44, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 1 }}
                            className="group cursor-default">
                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity" style={{ bottom: '100%', left: '50%', transform: 'translate(-50%, -8px)', background: '#30362F', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 11, whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
                              Total: ${sumVal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}<br />
                              Cobrado: ${m.valC.toLocaleString('es-AR', { minimumFractionDigits: 0 })}<br />
                              Pendiente: ${m.valP.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                            </div>

                            {/* Stacked Wrapper */}
                            <div style={{ height: `${sumPct}%`, width: '100%', borderRadius: '4px 4px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'height .4s ease' }}>
                              {sumPct > 0 && (
                                <>
                                  <div style={{ height: `${(pctP / sumPct) * 100}%`, width: '100%', background: 'rgba(139,137,130,.3)' }} />
                                  <div style={{ height: `${(pctC / sumPct) * 100}%`, width: '100%', background: '#30362F' }} />
                                </>
                              )}
                            </div>

                            {/* X Axis Label */}
                            <span style={{ position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 600, color: '#8B8982', whiteSpace: 'nowrap' }}>
                              {m.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>

      </main>

      <style>{`
        @keyframes kpiInDash {
          0% { opacity: 0; transform: translateX(12px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 1100px) {
          .block-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .block-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default Dashboard
