"use client"

import React, { useEffect, useState, useRef } from "react"
import { useAuth } from "../../lib/AuthContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import MobileDashboard from "./MobileDashboard"
import DesktopDashboard from "./DesktopDashboard"
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

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendType, accent = 'neutral', progress = 0, progressLabel = '', delay = 0, onClick, beam = false }) => {
  const ac = accentMap[accent] || accentMap.neutral
  const trendUp = trendType === 'up'
  const trendDown = trendType === 'down'
  const trendBg = trendUp ? 'rgba(96,107,108,.1)' : trendDown ? 'rgba(139,137,130,.1)' : 'rgba(139,137,130,.08)'
  const trendColor = trendUp ? '#606B6C' : trendDown ? '#8B8982' : '#8B8982'
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Activity
  const pct = Math.min(100, Math.max(0, progress))                    

  const cardInner = (
    <div className="relative rounded-xl overflow-hidden transition-all duration-200"
      onClick={onClick}
      style={{ background: '#E1E1E0', boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)', animation: `kpiInDash .4s ${.05 + delay * .08}s ease both`, cursor: onClick ? 'pointer' : 'default' }}
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

  if (!beam) return cardInner

  return (
    <>
      <style>{`
        @keyframes mc-beam-spin {
          from { --mc-beam-angle: 0deg }
          to   { --mc-beam-angle: 360deg }
        }
        @property --mc-beam-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        .mc-beam-wrapper {
          border-radius: 13px;
          padding: 1.5px;
          background: conic-gradient(
            from var(--mc-beam-angle),
            transparent 40deg,
            rgba(80,90,90,0.12) 70deg,
            rgba(80,90,90,0.75) 110deg,
            rgba(80,90,90,0.12) 150deg,
            transparent 180deg
          );
          animation: mc-beam-spin 18s linear infinite;
        }
      `}</style>
      <div className="mc-beam-wrapper">
        {cardInner}
      </div>
    </>
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

/* ──────────────────────────────────────────────────────────────────────────────
   SEARCH SPOTLIGHT
───────────────────────────────────────────────────────────────────────────── */
const SearchSpotlight = ({ clientes = [], facturas = [], pedidos = [], onViewAllClientes, onViewAllFacturas, onViewAllPedidos }) => {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const query = q.toLowerCase().trim()
  const matchC = query ? clientes.filter(c => (c.nombre || '').toLowerCase().includes(query) || (c.email || '').toLowerCase().includes(query)).slice(0, 4) : []
  const matchF = query ? facturas.filter(f => (f.numero || '').toLowerCase().includes(query) || (f.cliente_nombre || f.cliente || '').toLowerCase().includes(query)).slice(0, 4) : []
  const matchP = query ? pedidos.filter(p => (p.codigo || '').toLowerCase().includes(query) || (p.cliente_nombre || '').toLowerCase().includes(query)).slice(0, 4) : []
  const hasResults = matchC.length > 0 || matchF.length > 0 || matchP.length > 0
  const showDropdown = open && query.length > 0

  const clear = () => { setQ(''); setOpen(false) }

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
      <div className="flex items-center gap-2 rounded-lg border px-2.5"
        style={{ height: 30, background: q ? 'rgba(74,222,128,.08)' : 'rgba(255,255,255,.05)', borderColor: q ? 'rgba(74,222,128,.35)' : 'rgba(255,255,255,.12)', transition: 'all .2s' }}>
        <Search size={11} strokeWidth={2} style={{ color: q ? '#4ADE80' : 'rgba(255,255,255,.4)', flexShrink: 0, transition: 'color .2s' }} />
        <input
          type="text"
          placeholder="Buscar cliente, factura, venta..."
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="bg-transparent border-none w-full focus:outline-none focus:ring-0"
          style={{ fontSize: 11.5, color: 'white', fontFamily: 'Inter,sans-serif', outline: 'none' }}
        />
        {q ? (
          <button onClick={clear}
            style={{ color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.4)'}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
          </button>
        ) : (
          <kbd className="text-[7.5px] px-1 py-0.5 rounded hidden sm:block"
            style={{ fontFamily: "'DM Mono',monospace", background: 'rgba(0,0,0,.25)', color: 'rgba(255,255,255,.35)', border: '1px solid rgba(255,255,255,.1)' }}>
            ⌘K
          </kbd>
        )}
      </div>

      {showDropdown && (
        <div style={{
          position: 'absolute', top: 36, left: 0, right: 0, minWidth: 320,
          background: '#1e2320', borderRadius: 12,
          border: '1px solid rgba(255,255,255,.1)',
          boxShadow: '0 24px 60px rgba(0,0,0,.55)',
          zIndex: 9999, overflow: 'hidden',
          fontFamily: 'Inter,sans-serif'
        }}>
          {!hasResults ? (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 12 }}>
              Sin resultados para «{q}»
            </div>
          ) : (
            <>
              {[
                { label: 'Clientes', items: matchC, icon: Users, navigate: () => { onViewAllClientes?.(); clear() }, render: c => ({ title: c.nombre, sub: c.email || c.telefono || '' }) },
                { label: 'Facturas', items: matchF, icon: FileText, navigate: () => { onViewAllFacturas?.(); clear() }, render: f => ({ title: f.numero || 'Factura', sub: `${f.cliente_nombre || f.cliente || '—'} · $${(f.total || 0).toLocaleString('es-AR')}` }) },
                { label: 'Ventas', items: matchP, icon: ShoppingCart, navigate: () => { onViewAllPedidos?.(); clear() }, render: p => ({ title: p.codigo || 'Venta', sub: `${p.cliente_nombre || '—'} · ${p.estado || 'pendiente'}` }) },
              ].filter(g => g.items.length > 0).map((grp, gi) => (
                <div key={grp.label} style={{ borderTop: gi > 0 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                  <div style={{ padding: '8px 14px 4px', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>
                    {grp.label}
                  </div>
                  {grp.items.map((item, i) => {
                    const rendered = grp.render(item)
                    const Icon = grp.icon
                    return (
                      <button key={i} onClick={grp.navigate}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2e3631', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={13} color="rgba(255,255,255,.6)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rendered.title}</div>
                          {rendered.sub && <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rendered.sub}</div>}
                        </div>
                        <ArrowRight size={11} color="rgba(255,255,255,.2)" />
                      </button>
                    )
                  })}
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '7px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)' }}>{matchC.length + matchF.length + matchP.length} resultados</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>Click → ir al módulo</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
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
    { label: 'Fact. pagadas', value: facturas.filter(f => f.estado === 'pagada').length, Icon: CheckCircle2, onClick: onViewAllFacturas },
    { label: 'Fact. pendientes', value: facturas.filter(f => f.estado === 'pendiente' || f.estado === 'parcial').length, Icon: Clock, onClick: onViewAllFacturas },
    { label: 'Ventas en curso', value: pedidos.filter(p => p.estado === 'preparando' || p.estado === 'enviado').length, Icon: ShoppingCart, onClick: onViewAllPedidos },
    { label: 'Ventas completadas', value: pedidos.filter(p => p.estado === 'entregado' || p.estado === 'completado').length, Icon: Package, onClick: onViewAllPedidos },
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
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#606B6C', textTransform: 'uppercase', letterSpacing: '.03em' }}>{s.label}</span>
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
  onViewAllPedidos, onViewAllClientes, onViewAllCaja, onViewReportes, onNuevaVenta, openModal, onOpenMobileSidebar,
}) => {
  const { user } = useAuth()
  const { isPro } = useSubscriptionContext()
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
        if (!otherKeyPressed) {
          const active = document.activeElement
          const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
          if (!isInput) {
            if (onNuevaVenta) onNuevaVenta()
            else if (openModal) openModal('nuevo-pedido')
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
  }, [openModal, onNuevaVenta])

  /* ── Mobile layout (< md) ── */
  const mobileProps = {
    clientes, productos, facturas, pedidos, caja,
    onViewAllFacturas, onViewAllProductos, onViewAllPedidos,
    onViewAllClientes, onViewAllCaja, onViewReportes, onNuevaVenta,
    openModal, onOpenMobileSidebar,
  }

  return (
    <div className="w-full h-full min-h-screen flex flex-col overflow-x-hidden bg-[#F5F5F5]"
      style={{ fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ══════ MOBILE VIEW (< md) ══════ */}
      <div className="block md:hidden">
        <MobileDashboard {...mobileProps} />
      </div>

      {/* ══════ DESKTOP VIEW (≥ md) ══════ */}
      <div className="hidden md:flex md:flex-col md:w-full md:h-full">
        <DesktopDashboard {...mobileProps} />
      </div>{/* end desktop wrapper */}
    </div>
  )
}

export default Dashboard
