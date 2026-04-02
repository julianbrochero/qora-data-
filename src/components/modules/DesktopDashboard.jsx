"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ShoppingCart, PackagePlus, Package, Users,
  TrendingUp, Clock, ChevronRight, Search, Bell,
  UserPlus, FileText, CheckCircle, Calendar, Wallet,
  DollarSign, Menu, X, ArrowRight, BarChart3, Activity,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "../../lib/AuthContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"

/* ─── PALETA (idéntica al resto del sistema) ─────────────────────────────── */
const bg       = "#F5F5F5"
const surface  = "#FAFAFA"
const surface2 = "#f2f2f2"
const border   = "rgba(48,54,47,.13)"
const borderL  = "rgba(48,54,47,.08)"
const ct1      = "#1e2320"
const ct2      = "#30362F"
const ct3      = "#8B8982"
const accent   = "#334139"
const accentL  = "rgba(51,65,57,.08)"

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  `$${(parseFloat(String(n)) || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`

const fmtDate = (s) => {
  if (!s) return ""
  return new Date(s).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

const fmtTime = (s) => {
  if (!s) return ""
  return new Date(s).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

/* ─── CARD STYLE (mismo que Pedidos/Clientes) ─────────────────────────────── */
const cardCls  = "rounded-xl overflow-hidden border transition-all"
const cardSty  = { background: surface, borderColor: border, boxShadow: "0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)" }

/* ════════════════════════════════════════════════════════════════════════════
   BUSCADOR (dropdown sobre header oscuro)
════════════════════════════════════════════════════════════════════════════ */
const SearchBar = ({ clientes = [], facturas = [], pedidos = [], onViewAllClientes, onViewAllFacturas, onViewAllPedidos }) => {
  const [q, setQ]       = useState("")
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const qLow   = q.toLowerCase().trim()
  const matchC = qLow ? clientes.filter(c => (c.nombre || "").toLowerCase().includes(qLow) || (c.email || "").toLowerCase().includes(qLow)).slice(0, 3) : []
  const matchF = qLow ? facturas.filter(f => (f.numero || "").toLowerCase().includes(qLow) || (f.cliente_nombre || f.cliente || "").toLowerCase().includes(qLow)).slice(0, 3) : []
  const matchP = qLow ? pedidos.filter(p  => (p.codigo || "").toLowerCase().includes(qLow) || (p.cliente_nombre || "").toLowerCase().includes(qLow)).slice(0, 3) : []
  const total  = matchC.length + matchF.length + matchP.length
  const show   = open && qLow.length > 0
  const clear  = () => { setQ(""); setOpen(false) }

  const groups = [
    { label: "Clientes", items: matchC, Icon: Users,        go: () => { onViewAllClientes?.(); clear() }, render: c => ({ t: c.nombre,                    s: c.email || c.telefono || "" }) },
    { label: "Facturas", items: matchF, Icon: FileText,     go: () => { onViewAllFacturas?.(); clear() }, render: f => ({ t: `#${f.numero || "—"}`,        s: `${f.cliente_nombre || f.cliente || "—"} · ${fmt(f.total)}` }) },
    { label: "Ventas",   items: matchP, Icon: ShoppingCart, go: () => { onViewAllPedidos?.();  clear() }, render: p => ({ t: p.codigo || `PED-${String(p.id || "").slice(0, 6)}`, s: p.cliente_nombre || "—" }) },
  ].filter(g => g.items.length > 0)

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: 320 }}>
      {/* Input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, height: 32, padding: "0 12px",
        borderRadius: 8,
        background: q ? "rgba(74,222,128,.07)" : "rgba(255,255,255,.06)",
        border: `1px solid ${q ? "rgba(74,222,128,.3)" : "rgba(255,255,255,.12)"}`,
        transition: "all .18s",
      }}>
        <Search size={12} strokeWidth={2} style={{ color: q ? "#4ADE80" : "rgba(255,255,255,.4)", flexShrink: 0, transition: "color .18s" }} />
        <input
          type="text"
          placeholder="Buscar cliente, factura, venta…"
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 11.5, color: "#fff", fontFamily: "Inter, sans-serif" }}
        />
        {q ? (
          <button onClick={clear} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", display: "flex", padding: 0 }}>
            <X size={12} strokeWidth={2.5} />
          </button>
        ) : (
          <kbd style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(0,0,0,.25)", color: "rgba(255,255,255,.35)", border: "1px solid rgba(255,255,255,.1)", fontFamily: "monospace" }}>/</kbd>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: .98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: .98 }}
            transition={{ duration: .13 }}
            style={{
              position: "absolute", top: 38, left: 0, minWidth: 340, zIndex: 9999,
              background: "#1e2320", borderRadius: 10,
              border: "1px solid rgba(255,255,255,.1)",
              boxShadow: "0 20px 50px rgba(0,0,0,.5)", overflow: "hidden",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {total === 0 ? (
              <div style={{ padding: "18px 16px", textAlign: "center", color: "rgba(255,255,255,.3)", fontSize: 12 }}>
                Sin resultados para «{q}»
              </div>
            ) : (
              <>
                {groups.map((grp, gi) => {
                  const GI = grp.Icon
                  return (
                    <div key={grp.label} style={{ borderTop: gi > 0 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
                      <div style={{ padding: "8px 14px 3px", fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.28)" }}>{grp.label}</div>
                      {grp.items.map((item, i) => {
                        const r = grp.render(item)
                        return (
                          <button key={i} onClick={grp.go} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.055)"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <GI size={13} color="rgba(255,255,255,.55)" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.t}</div>
                              {r.s && <div style={{ fontSize: 10, color: "rgba(255,255,255,.38)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.s}</div>}
                            </div>
                            <ArrowRight size={11} color="rgba(255,255,255,.2)" />
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
                <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "6px 14px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,.22)" }}>{total} resultado{total !== 1 ? "s" : ""}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,.18)" }}>Click → ir al módulo</span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   ESTADO PILL  (facturas)
════════════════════════════════════════════════════════════════════════════ */
const estadoConf = {
  pagada:    { bg: "rgba(51,65,57,.08)",         color: accent,   border: "rgba(51,65,57,.18)",    label: "Pagado",    Icon: CheckCircle },
  pendiente: { bg: "rgba(139,137,130,.08)",       color: ct3,      border: "rgba(139,137,130,.18)", label: "Pendiente", Icon: Clock },
  parcial:   { bg: "rgba(55,63,71,.08)",          color: ct2,      border: "rgba(55,63,71,.18)",    label: "Parcial",   Icon: DollarSign },
  cancelada: { bg: "rgba(139,137,130,.06)",       color: ct3,      border: "rgba(139,137,130,.14)", label: "Cancelado", Icon: AlertTriangle },
}

/* ════════════════════════════════════════════════════════════════════════════
   FACTURA ROW
════════════════════════════════════════════════════════════════════════════ */
const InvoiceRow = ({ numero, cliente, total, fecha, estado, isLast }) => {
  const cfg = estadoConf[estado] || estadoConf.pendiente
  return (
    <div
      className="flex items-center gap-3 py-3 -mx-1 px-1 rounded-lg"
      style={{ borderBottom: isLast ? "none" : `1px solid ${borderL}`, cursor: "default", transition: "background .13s" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(48,54,47,.022)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Estado icon */}
      <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
        <cfg.Icon size={13} strokeWidth={2} style={{ color: cfg.color }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: ct1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cliente || "Cliente"}</p>
          {numero && <span style={{ fontSize: 10, color: ct3, fontFamily: "monospace", flexShrink: 0 }}>#{numero}</span>}
        </div>
        <p style={{ fontSize: 10, color: ct3 }}>{fmtDate(fecha)} · {fmtTime(fecha)}</p>
      </div>

      {/* Badge estado */}
      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, flexShrink: 0, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>

      {/* Monto */}
      <p style={{ fontSize: 12, fontWeight: 700, color: ct1, minWidth: 72, textAlign: "right", flexShrink: 0, fontFamily: "monospace" }}>{fmt(total)}</p>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   MINI BAR CHART  (7 days)
════════════════════════════════════════════════════════════════════════════ */
const MiniChart = ({ data }) => {
  const max = Math.max(...data, 1)
  const days = ["L", "M", "X", "J", "V", "S", "D"]
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40 }}>
        {data.map((v, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((v / max) * 100, 5)}%` }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 28 }}
            style={{
              flex: 1, borderRadius: "3px 3px 2px 2px", minHeight: 3,
              background: i === data.length - 1 ? accent : "rgba(48,54,47,.2)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", marginTop: 6 }}>
        {days.map((d, i) => (
          <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: i === 6 ? accent : ct3, fontWeight: i === 6 ? 700 : 500 }}>{d}</span>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   PEDIDO ROW  (pedidos pendientes)
════════════════════════════════════════════════════════════════════════════ */
const PedidoRow = ({ pedido, isLast }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: isLast ? "none" : `1px solid ${borderL}`, transition: "background .13s" }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(48,54,47,.022)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    <div style={{ width: 30, height: 30, borderRadius: 8, background: accentL, border: `1px solid rgba(51,65,57,.15)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <ShoppingCart size={12} strokeWidth={2} style={{ color: accent }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: ct1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pedido.cliente_nombre || pedido.cliente || "Cliente"}</p>
      <p style={{ fontSize: 9.5, color: ct3, fontFamily: "monospace" }}>{pedido.codigo || `PED-${String(pedido.id || "").slice(0, 6)}`}</p>
    </div>
    <span style={{ fontSize: 9.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "rgba(139,137,130,.08)", color: ct3, border: `1px solid rgba(139,137,130,.18)`, flexShrink: 0 }}>
      Pendiente
    </span>
  </div>
)

/* ════════════════════════════════════════════════════════════════════════════
   DESKTOP DASHBOARD
════════════════════════════════════════════════════════════════════════════ */
const DesktopDashboard = ({
  clientes   = [],
  productos  = [],
  facturas   = [],
  pedidos    = [],
  caja       = {},
  onViewAllFacturas,
  onViewAllProductos,
  onViewAllClientes,
  onViewAllCaja,
  onViewAllPedidos,
  onViewReportes,
  onNuevaVenta,
  openModal,
  onOpenMobileSidebar,
}) => {
  const { user }  = useAuth()
  const { isPro } = useSubscriptionContext()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  /* ── Cálculos ── */
  const hoy          = new Date()
  const startOfDay   = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const startOfMonth = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  const ventasHoy = useMemo(() => facturas.filter(f => f.fecha && new Date(f.fecha) >= startOfDay),   [facturas])
  const ventasMes = useMemo(() => facturas.filter(f => f.fecha && new Date(f.fecha) >= startOfMonth), [facturas])

  const totalHoy  = ventasHoy.reduce((s, f) => s + (f.total || 0), 0)
  const totalMes  = ventasMes.reduce((s, f) => s + (f.total || 0), 0)

  const factPend    = facturas.filter(f => f.estado === "pendiente" || f.estado === "parcial")
  const totalDeuda  = factPend.reduce((s, f) => s + (f.total || 0), 0)
  const pedPend     = pedidos.filter(p => p.estado === "pendiente").length
  const pedProc     = pedidos.filter(p => p.estado === "preparando").length
  const pedEntr     = pedidos.filter(p => p.estado === "entregado").length
  const sinStock    = productos.filter(p => !!(p.controlastock || p.controlaStock) && (p.stock || 0) === 0).length

  const last7 = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d  = new Date(hoy); d.setDate(d.getDate() - (6 - i))
    const ds = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const de = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    return facturas.filter(f => f.fecha && new Date(f.fecha) >= ds && new Date(f.fecha) < de).reduce((s, f) => s + (f.total || 0), 0)
  }), [facturas])

  const recentFact = useMemo(() =>
    [...facturas].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)).slice(0, 5)
  , [facturas])

  const pendPedidos = pedidos.filter(p => p.estado === "pendiente").slice(0, 4)

  const nombre   = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Admin"
  const hora     = hoy.getHours()
  const saludo   = mounted ? (hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches") : ""
  const fechaStr = mounted ? hoy.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) : ""
  const fechaCap = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)

  /* ── KPI cards — misma paleta que Pedidos.jsx ── */
  const kpis = [
    { label: "Pedidos activos", val: pedPend + pedProc,  sub: `${pedPend} pendientes · ${pedProc} en proceso`, Icon: Package,    bar: "#334139", iconBg: "rgba(51,65,57,.1)",     iconC: "#334139", onClick: onViewAllPedidos },
    { label: "Por cobrar",      val: fmt(totalDeuda),    sub: `${factPend.length} factura${factPend.length !== 1 ? "s" : ""}`, Icon: DollarSign, bar: "#373F47", iconBg: "rgba(55,63,71,.1)",      iconC: "#373F47", onClick: onViewAllFacturas },
    { label: "Entregados",      val: pedEntr,            sub: "Completados este período",  Icon: CheckCircle, bar: "#606B6C", iconBg: "rgba(96,107,108,.1)",  iconC: "#606B6C", onClick: onViewAllPedidos },
    { label: "Ventas del mes",  val: fmt(totalMes),      sub: `Hoy: ${fmt(totalHoy)}`,     Icon: TrendingUp,  bar: "rgba(139,137,130,.35)", iconBg: "rgba(139,137,130,.08)", iconC: ct3, onClick: onViewReportes },
  ]

  /* ── Acciones rápidas ── */
  const acciones = [
    { icon: ShoppingCart, label: "Nueva Venta",    primary: true,  fn: () => onNuevaVenta?.() },
    { icon: UserPlus,     label: "Nuevo Cliente",  primary: false, fn: () => openModal?.("nuevo-cliente") },
    { icon: PackagePlus,  label: "Nuevo Producto", primary: false, fn: () => openModal?.("nuevo-producto") },
    { icon: FileText,     label: "Nueva Factura",  primary: false, fn: () => openModal?.("nueva-factura") },
  ]

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .dd-scroll::-webkit-scrollbar { width: 4px }
        .dd-scroll::-webkit-scrollbar-track { background: transparent }
        .dd-scroll::-webkit-scrollbar-thumb { background: rgba(48,54,47,.14); border-radius: 4px }
        @keyframes kpiIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* ══════ HEADER — idéntico al de Pedidos ══════ */}
      <header style={{
        background: "#282A28",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        padding: "0 clamp(12px,3vw,24px)",
        minHeight: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        flexShrink: 0, flexWrap: "wrap",
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onOpenMobileSidebar}
            id="dd-hamburger-main"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.7)",
              display: "none",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <Menu size={16} strokeWidth={2} />
          </button>
          <style>{`
            #dd-hamburger-main { display: none !important; }
            @media (max-width: 1023px) { 
              #dd-hamburger-main { display: flex !important; } 
            }
          `}</style>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.45)", marginBottom: 2, letterSpacing: ".06em", textTransform: "uppercase" }}>Panel de Control</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.03em", color: "#fff", lineHeight: 1 }}>Dashboard</h2>
          </div>
        </div>

        {/* Search — centrado, escondido en mobile */}
        <div className="hidden md:flex" style={{ flex: 1, justifyContent: "center", maxWidth: 360 }}>
          <SearchBar
            clientes={clientes} facturas={facturas} pedidos={pedidos}
            onViewAllClientes={onViewAllClientes}
            onViewAllFacturas={onViewAllFacturas}
            onViewAllPedidos={onViewAllPedidos}
          />
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Fecha */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 5 }}>
            <Calendar size={11} strokeWidth={2} style={{ color: "rgba(255,255,255,.35)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>{fechaCap}</span>
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)", margin: "0 2px" }} className="hidden lg:block" />
          <button style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Bell size={14} strokeWidth={2} style={{ color: "rgba(255,255,255,.55)" }} />
          </button>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: isPro ? "rgba(74,222,128,.12)" : "rgba(255,255,255,.08)", border: `1px solid ${isPro ? "rgba(74,222,128,.25)" : "rgba(255,255,255,.14)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: isPro ? "#4ADE80" : "rgba(255,255,255,.65)", overflow: "hidden", flexShrink: 0 }}>
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : nombre.charAt(0).toUpperCase()
            }
          </div>
        </div>
      </header>

      {/* ══════ KPIs — mismo patrón que Pedidos ══════ */}
      <div style={{ padding: "clamp(10px,2vw,14px) clamp(12px,3vw,24px) 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {kpis.map(({ label, val, sub, Icon, bar, iconBg, iconC, onClick }, i) => (
          <div
            key={i}
            className={cardCls}
            onClick={onClick}
            style={{
              ...cardSty,
              background: "#E1E1E0",
              padding: "12px 14px 10px",
              position: "relative",
              cursor: onClick ? "pointer" : "default",
              animation: `kpiIn .35s ${.05 + i * .07}s ease both`,
              boxShadow: `0 2px 8px ${bar}28, 0 6px 20px ${bar}18`,
              transition: "box-shadow .2s, transform .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${bar}45, 0 10px 32px ${bar}28` }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 2px 8px ${bar}28, 0 6px 20px ${bar}18` }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#6B7274", borderRadius: "12px 0 0 12px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} strokeWidth={1.8} style={{ color: iconC }} />
              </div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: ct1, lineHeight: 1, marginBottom: 4 }}>{val}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: ct2, marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 10, color: ct3 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ══════ SALUDO ══════ */}
      <div style={{ padding: "10px clamp(12px,3vw,24px) 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 12, color: ct3 }}>
          {saludo}, <span style={{ fontWeight: 600, color: ct2 }}>{nombre}</span>
        </p>
      </div>

      {/* ══════ MAIN GRID ══════ */}
      <div style={{ flex: 1, padding: "clamp(10px,2vw,12px) clamp(12px,3vw,24px) 36px", display: "grid", gridTemplateColumns: "1fr 1.25fr 1fr", gap: 12, alignItems: "start" }}>

        {/* ── Col 1: Acciones + Chart ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>

          {/* Acciones rápidas */}
          <div className={cardCls} style={cardSty}>
            <div style={{ padding: "10px 14px 6px", borderBottom: `1px solid ${borderL}`, background: surface2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: ct2 }}>Acciones rápidas</span>
            </div>
            <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
              {acciones.map((a, i) => {
                const Icon = a.icon
                return (
                  <button
                    key={i}
                    onClick={a.fn}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, width: "100%", cursor: "pointer", textAlign: "left", transition: "all .13s",
                      background: a.primary ? "#4ADE80" : surface,
                      border: a.primary ? "1px solid #4ADE80" : `1px solid ${border}`,
                      boxShadow: a.primary ? "0 4px 12px rgba(74,222,128,.25)" : "0 1px 3px rgba(48,54,47,.05)",
                    }}
                    onMouseEnter={e => { if (!a.primary) { e.currentTarget.style.background = surface2; e.currentTarget.style.borderColor = "rgba(48,54,47,.22)" } }}
                    onMouseLeave={e => { if (!a.primary) { e.currentTarget.style.background = surface; e.currentTarget.style.borderColor = border } }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: a.primary ? "rgba(0,0,0,.1)" : accentL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={14} strokeWidth={2} style={{ color: a.primary ? "#0A1A0E" : accent }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: a.primary ? "#0A1A0E" : ct2, flex: 1 }}>{a.label}</span>
                    {a.primary && (
                      <span style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, background: "rgba(0,0,0,.12)", color: "rgba(0,0,0,.45)", fontFamily: "monospace", flexShrink: 0 }}>Ctrl</span>
                    )}
                    <ChevronRight size={13} strokeWidth={2} style={{ color: a.primary ? "rgba(0,0,0,.3)" : ct3 }} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Últimos 7 días */}
          <div className={cardCls} style={cardSty}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px 6px", borderBottom: `1px solid ${borderL}`, background: surface2 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: ct2 }}>Últimos 7 días</span>
                <p style={{ fontSize: 10, color: ct3, marginTop: 1 }}>Ventas diarias</p>
              </div>
              <button onClick={onViewReportes} style={{ fontSize: 10, fontWeight: 600, color: ct3, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                onMouseEnter={e => e.currentTarget.style.color = ct2}
                onMouseLeave={e => e.currentTarget.style.color = ct3}
              >
                Reportes <ChevronRight size={10} strokeWidth={2.5} />
              </button>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <MiniChart data={last7} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderL}` }}>
                <span style={{ fontSize: 10, color: ct3 }}>Total 7 días</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: ct1, fontFamily: "monospace" }}>{fmt(last7.reduce((s, v) => s + v, 0))}</span>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className={cardCls} style={cardSty}>
            <div style={{ padding: "10px 14px 6px", borderBottom: `1px solid ${borderL}`, background: surface2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: ct2 }}>Resumen del negocio</span>
            </div>
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Clientes", value: clientes.length, Icon: Users, onClick: onViewAllClientes },
                { label: "Productos", value: productos.length, Icon: Package, onClick: onViewAllProductos },
                { label: "Sin stock", value: sinStock, Icon: AlertTriangle, onClick: onViewAllProductos, warn: sinStock > 0 },
              ].map((s, i) => (
                <button key={i} onClick={s.onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: `1px solid ${borderL}`, background: surface2, cursor: "pointer", transition: "all .13s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ebebea"; e.currentTarget.style.borderColor = border }}
                  onMouseLeave={e => { e.currentTarget.style.background = surface2; e.currentTarget.style.borderColor = borderL }}
                >
                  <s.Icon size={14} strokeWidth={1.8} style={{ color: s.warn ? "#8B8982" : accent }} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: ct2 }}>{s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: s.warn && s.value > 0 ? ct2 : ct1 }}>{s.value}</span>
                </button>
              ))}
              {/* Caja */}
              <button onClick={onViewAllCaja} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, border: `1px solid rgba(51,65,57,.2)`, background: "rgba(51,65,57,.04)", cursor: "pointer", transition: "all .13s", marginTop: 2 }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(51,65,57,.08)"; e.currentTarget.style.borderColor = "rgba(51,65,57,.3)" }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(51,65,57,.04)"; e.currentTarget.style.borderColor = "rgba(51,65,57,.2)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Wallet size={14} strokeWidth={1.8} style={{ color: accent }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: accent }}>Saldo en caja</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: ct1, fontFamily: "monospace" }}>{fmt(caja?.saldo || 0)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Col 2: Facturas recientes ── */}
        <div className={cardCls} style={{ ...cardSty, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px 8px", borderBottom: `1px solid ${borderL}`, background: surface2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: ct2 }}>Facturas recientes</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1.5px 6px", borderRadius: 4, background: "rgba(48,54,47,.08)", color: ct3 }}>{recentFact.length}</span>
            </div>
            <button onClick={onViewAllFacturas} style={{ fontSize: 10, fontWeight: 600, color: ct3, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
              onMouseEnter={e => e.currentTarget.style.color = ct2}
              onMouseLeave={e => e.currentTarget.style.color = ct3}
            >
              Ver todas <ArrowRight size={9} strokeWidth={2.5} />
            </button>
          </div>
          <div style={{ padding: "4px 14px 8px" }}>
            {recentFact.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                <FileText size={26} strokeWidth={1.5} style={{ color: ct3, marginBottom: 8, opacity: .5 }} />
                <p style={{ fontSize: 12, color: ct3 }}>Sin facturas recientes</p>
              </div>
            ) : (
              recentFact.map((f, i) => (
                <InvoiceRow
                  key={f.id || i}
                  numero={f.numero}
                  cliente={f.cliente_nombre || f.cliente || ""}
                  total={f.total || 0}
                  fecha={f.fecha || ""}
                  estado={f.estado || "pendiente"}
                  isLast={i === recentFact.length - 1}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Col 3: Actividad + Pedidos pendientes ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>

          {/* Actividad del negocio — 4 stats monocromáticos */}
          <div className={cardCls} style={cardSty}>
            <div style={{ padding: "10px 14px 6px", borderBottom: `1px solid ${borderL}`, background: surface2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: ct2 }}>Situación actual</span>
            </div>
            <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Cobrado hoy",   value: fmt(ventasHoy.reduce((s, f) => s + (f.total || 0), 0)), sub: `${ventasHoy.length} fact.`, Icon: CheckCircle, onClick: onViewAllFacturas },
                { label: "Por cobrar",    value: fmt(totalDeuda),  sub: `${factPend.length} fact.`,     Icon: Clock,        onClick: onViewAllFacturas },
                { label: "En proceso",    value: String(pedProc),  sub: "ventas",                       Icon: Activity,     onClick: onViewAllPedidos },
                { label: "Sin stock",     value: String(sinStock), sub: sinStock === 0 ? "OK" : "prods", Icon: AlertTriangle, onClick: onViewAllProductos },
              ].map((s, i) => {
                const Icon = s.Icon
                return (
                  <button key={i} onClick={s.onClick || undefined} style={{ padding: "10px", borderRadius: 8, border: `1px solid ${borderL}`, background: surface2, cursor: s.onClick ? "pointer" : "default", textAlign: "left", transition: "all .13s", display: "flex", flexDirection: "column", gap: 4 }}
                    onMouseEnter={e => { if (s.onClick) { e.currentTarget.style.background = "#ebebea"; e.currentTarget.style.borderColor = border } }}
                    onMouseLeave={e => { if (s.onClick) { e.currentTarget.style.background = surface2; e.currentTarget.style.borderColor = borderL } }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Icon size={12} strokeWidth={2} style={{ color: ct3 }} />
                      <span style={{ fontSize: 9, color: ct3, fontWeight: 600 }}>{s.sub}</span>
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: ct1, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: ct3, fontWeight: 500 }}>{s.label}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pedidos pendientes */}
          <div className={cardCls} style={cardSty}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px 6px", borderBottom: `1px solid ${borderL}`, background: surface2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: ct2 }}>Pedidos pendientes</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "1.5px 6px", borderRadius: 4, background: "rgba(48,54,47,.08)", color: ct3 }}>{pedPend}</span>
              </div>
              <button onClick={onViewAllPedidos} style={{ fontSize: 10, fontWeight: 600, color: ct3, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                onMouseEnter={e => e.currentTarget.style.color = ct2}
                onMouseLeave={e => e.currentTarget.style.color = ct3}
              >
                Ver todos <ArrowRight size={9} strokeWidth={2.5} />
              </button>
            </div>
            <div style={{ padding: "4px 14px 8px" }}>
              {pendPedidos.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 0" }}>
                  <CheckCircle size={22} strokeWidth={1.5} style={{ color: ct3, marginBottom: 6, opacity: .5 }} />
                  <p style={{ fontSize: 11, color: ct3 }}>Sin pedidos pendientes</p>
                </div>
              ) : (
                pendPedidos.map((p, i) => (
                  <PedidoRow key={p.id || i} pedido={p} isLast={i === pendPedidos.length - 1} />
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DesktopDashboard
