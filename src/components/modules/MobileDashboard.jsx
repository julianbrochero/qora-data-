"use client"

import React, { useMemo } from "react"
import {
  ShoppingCart, PackagePlus, Package, Users,
  BarChart3, Landmark, TrendingUp, AlertTriangle,
  Clock, ChevronRight, Menu,
} from "lucide-react"
import { useAuth } from "../../lib/AuthContext"

/* ─── PALETA — misma que el sistema ─── */
const C = {
  bg:       "#ffffff",
  page:     "#f8f9fb",
  border:   "#e5e7eb",
  primary:  "#334139",
  primaryS: "#eef1ee",
  text:     "#0d0d0d",
  textMid:  "#374151",
  textSoft: "#6b7280",
  textLight:"#9ca3af",
  success:  "#16a34a",
  successS: "#f0fdf4",
  amber:    "#d97706",
  amberS:   "#fffbeb",
  danger:   "#dc2626",
}

const fmt = (n) =>
  `$${(parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const fmtTime = (dateStr) => {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

/* ─── Quick Action Button ─── */
const QuickCard = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      gap:8, padding:"14px 8px", borderRadius:10, width:"100%",
      background:C.bg, border:`1px solid ${C.border}`,
      boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
      cursor:"pointer", WebkitTapHighlightColor:"transparent",
      minHeight:88, transition:"background .1s",
      fontFamily:"'Inter',sans-serif",
    }}
    onMouseEnter={e => e.currentTarget.style.background = C.primaryS}
    onMouseLeave={e => e.currentTarget.style.background = C.bg}
  >
    <div style={{
      width:38, height:38, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center",
      background:C.primaryS, border:`1px solid ${C.primary}22`,
    }}>
      <Icon size={18} strokeWidth={1.8} style={{ color: C.primary }} />
    </div>
    <span style={{ fontSize:11.5, fontWeight:600, color:C.textMid, textAlign:"center", lineHeight:1.3 }}>{label}</span>
  </button>
)

/* ─── Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, sub, accent = C.primary, accentS }) => (
  <div style={{
    display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
    borderRadius:10, background:C.bg, border:`1px solid ${C.border}`,
    boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
  }}>
    <div style={{
      width:40, height:40, borderRadius:9, flexShrink:0,
      background: accentS || C.primaryS,
      display:"flex", alignItems:"center", justifyContent:"center",
      border:`1px solid ${accent}22`,
    }}>
      <Icon size={18} strokeWidth={1.8} style={{ color: accent }} />
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontSize:17, fontWeight:800, color:C.text, letterSpacing:"-0.03em", margin:0 }}>{value}</p>
      <p style={{ fontSize:11.5, color:C.textSoft, fontWeight:500, margin:0 }}>{label}</p>
    </div>
    {sub && (
      <span style={{
        fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:20,
        background: accentS || C.primaryS, color: accent,
        flexShrink:0, whiteSpace:"nowrap",
        border:`1px solid ${accent}22`,
      }}>{sub}</span>
    )}
  </div>
)

/* ─── Section Header ─── */
const SectionHeader = ({ title, onAction }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, padding:"0 2px" }}>
    <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{title}</span>
    {onAction && (
      <button onClick={onAction} style={{
        display:"flex", alignItems:"center", gap:2, fontSize:11.5, fontWeight:600,
        color:C.primary, background:"none", border:"none", cursor:"pointer",
        fontFamily:"'Inter',sans-serif",
      }}>
        Ver todo <ChevronRight size={12} strokeWidth={2.5} />
      </button>
    )}
  </div>
)

/* ─── Activity Row ─── */
const ActivityRow = ({ title, sub, amount, time, isLast }) => (
  <div style={{
    display:"flex", alignItems:"center", gap:12, padding:"11px 16px",
    borderBottom: isLast ? "none" : `1px solid ${C.border}`,
  }}>
    <div style={{
      width:36, height:36, borderRadius:9, flexShrink:0,
      background:C.primaryS, border:`1px solid ${C.primary}22`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:14, fontWeight:700, color:C.primary,
      fontFamily:"'Inter',sans-serif",
    }}>
      {(title || "V").charAt(0).toUpperCase()}
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{title || "Venta"}</p>
      {sub && <p style={{ fontSize:11, color:C.textSoft, margin:0 }}>{sub}</p>}
    </div>
    <div style={{ textAlign:"right", flexShrink:0 }}>
      <p style={{ fontSize:13, fontWeight:700, color:C.text, margin:0 }}>{amount}</p>
      {time && <p style={{ fontSize:10.5, color:C.textLight, margin:0 }}>{time}</p>}
    </div>
  </div>
)

/* ─── MOBILE DASHBOARD ─── */
const MobileDashboard = ({
  clientes = [],
  productos = [],
  pedidos = [],
  caja = {},
  onViewAllProductos,
  onViewAllPedidos,
  onViewAllClientes,
  onViewAllCaja,
  onViewReportes,
  onNuevaVenta,
  openModal,
  onOpenMobileSidebar,
}) => {
  const { user } = useAuth()

  const hoy       = new Date()
  const startDay  = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const startMon  = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  const ventasHoy  = useMemo(() => pedidos.filter(p => { const f = p.fecha_pedido || p.created_at; return f && new Date(f) >= startDay }), [pedidos])
  const ventasMes  = useMemo(() => pedidos.filter(p => { const f = p.fecha_pedido || p.created_at; return f && new Date(f) >= startMon }), [pedidos])
  const totalHoy   = ventasHoy.reduce((s, p) => s + (parseFloat(p.total) || 0), 0)
  const totalMes   = ventasMes.reduce((s, p) => s + (parseFloat(p.total) || 0), 0)
  const bajosStock = productos.filter(p => !!(p.controlastock || p.controlaStock) && (p.stock || 0) <= 5).length
  const pedidosPend = pedidos.filter(p => p.estado === "pendiente").length

  const hora   = hoy.getHours()
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches"
  const nombre = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Admin"

  const recentPedidos = useMemo(
    () => [...pedidos].sort((a, b) => new Date(b.fecha_pedido || b.created_at || 0) - new Date(a.fecha_pedido || a.created_at || 0)).slice(0, 5),
    [pedidos]
  )

  const acciones = [
    { icon: ShoppingCart, label: "Nueva Venta",      fn: () => onNuevaVenta?.() },
    { icon: PackagePlus,  label: "Nuevo Producto",   fn: () => openModal?.("nuevo-producto") },
    { icon: Package,      label: "Ver Stock",         fn: () => onViewAllProductos?.() },
    { icon: Users,        label: "Clientes",          fn: () => onViewAllClientes?.() },
    { icon: BarChart3,    label: "Reportes",          fn: () => onViewReportes?.() },
    { icon: Landmark,     label: "Caja",              fn: () => onViewAllCaja?.() },
  ]

  return (
    <div style={{
      background: C.page, minHeight:"100vh",
      fontFamily:"'Inter',-apple-system,sans-serif",
      WebkitFontSmoothing:"antialiased",
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        padding:"14px 16px 12px",
        paddingTop:"max(14px, env(safe-area-inset-top, 14px))",
      }}>
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <button onClick={onOpenMobileSidebar} style={{
            width:36, height:36, borderRadius:8,
            background:"transparent", border:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", WebkitTapHighlightColor:"transparent",
          }}>
            <Menu size={17} strokeWidth={1.8} style={{ color: C.textMid }} />
          </button>
          <img src="/newlogo.png" alt="Gestify" style={{ height:26, objectFit:"contain" }} />
          <div style={{ width:36 }} /> {/* spacer */}
        </div>

        {/* Greeting + today summary */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ margin:0, fontSize:12, color:C.textSoft }}>{saludo}</p>
            <p style={{ margin:"1px 0 0", fontSize:17, fontWeight:700, color:C.text, letterSpacing:"-0.02em" }}>{nombre}</p>
          </div>
          <div style={{
            background:C.primaryS, border:`1px solid ${C.primary}22`,
            borderRadius:10, padding:"8px 14px", textAlign:"right",
          }}>
            <p style={{ margin:0, fontSize:10, fontWeight:600, color:C.textSoft, textTransform:"uppercase", letterSpacing:"0.05em" }}>Hoy</p>
            <p style={{ margin:0, fontSize:18, fontWeight:800, color:C.primary, letterSpacing:"-0.03em" }}>{fmt(totalHoy)}</p>
            <p style={{ margin:0, fontSize:10.5, color:C.textSoft }}>{ventasHoy.length} {ventasHoy.length === 1 ? "venta" : "ventas"}</p>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ padding:"16px", paddingBottom:"env(safe-area-inset-bottom, 24px)", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Acciones rápidas */}
        <section>
          <SectionHeader title="Acciones rápidas" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {acciones.map(a => (
              <QuickCard key={a.label} icon={a.icon} label={a.label} onClick={a.fn} />
            ))}
          </div>
        </section>

        {/* Resumen */}
        <section>
          <SectionHeader title="Resumen" onAction={onViewReportes} />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <StatCard
              icon={TrendingUp}
              label="Ventas del mes"
              value={fmt(totalMes)}
              sub={`${ventasMes.length} venta${ventasMes.length !== 1 ? "s" : ""}`}
            />
            {bajosStock > 0 && (
              <StatCard
                icon={AlertTriangle}
                label="Bajo stock"
                value={`${bajosStock} item${bajosStock !== 1 ? "s" : ""}`}
                sub="Revisar"
                accent={C.amber}
                accentS={C.amberS}
              />
            )}
            {pedidosPend > 0 && (
              <StatCard
                icon={Clock}
                label="Pedidos pendientes"
                value={`${pedidosPend} pedido${pedidosPend !== 1 ? "s" : ""}`}
                sub="Ver"
                accent="#6b7280"
                accentS="#f9fafb"
              />
            )}
            <StatCard icon={Users} label="Clientes registrados" value={`${clientes.length}`} />
          </div>
        </section>

        {/* Actividad reciente */}
        <section>
          <SectionHeader title="Actividad reciente" onAction={onViewAllPedidos} />
          {recentPedidos.length > 0 ? (
            <div style={{
              background:C.bg, borderRadius:10, border:`1px solid ${C.border}`,
              overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
            }}>
              {recentPedidos.map((p, i) => (
                <ActivityRow
                  key={p.id || i}
                  title={p.cliente_nombre || p.cliente || "Cliente"}
                  sub={p.codigo ? `#${p.codigo}` : undefined}
                  amount={fmt(p.total)}
                  time={fmtTime(p.fecha_pedido || p.created_at)}
                  isLast={i === recentPedidos.length - 1}
                />
              ))}
            </div>
          ) : (
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"center",
              padding:"32px 16px", gap:12, textAlign:"center",
              background:C.bg, borderRadius:10, border:`1px solid ${C.border}`,
            }}>
              <div style={{
                width:56, height:56, borderRadius:14, background:C.primaryS,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <ShoppingCart size={26} strokeWidth={1.5} style={{ color:C.primary }} />
              </div>
              <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.text }}>Sin ventas registradas</p>
              <p style={{ margin:0, fontSize:12.5, color:C.textSoft, maxWidth:220 }}>Creá tu primera venta desde acciones rápidas</p>
              <button onClick={() => onNuevaVenta?.()} style={{
                padding:"10px 22px", borderRadius:8, fontWeight:700, fontSize:13,
                background:C.primary, color:"#fff", border:"none", cursor:"pointer",
                fontFamily:"'Inter',sans-serif", marginTop:4,
              }}>
                Nueva Venta
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default MobileDashboard
