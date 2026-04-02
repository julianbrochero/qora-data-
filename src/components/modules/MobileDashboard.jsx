"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import {
  ShoppingCart, PackagePlus, Package, Users,
  BarChart3, Landmark, TrendingUp, AlertTriangle,
  Clock, ChevronRight, Menu, Zap,
} from "lucide-react"
import { useAuth } from "../../lib/AuthContext"

/* ─────────────────────────────────────────────────────────────────────────────
   PALETA — idéntica al sistema
   Grafito oscuro : #282A28  #30362F  #1e2320
   Grafito medio  : #373F47  #606B6C
   Grafito claro  : #8B8982  #E1E1E0
   Verde lima     : #4ADE80  (acento principal)
   Violeta bonus  : #a78bfa  (acento secundario)
   Ámbar          : #fbbf24  (alertas / caja)
───────────────────────────────────────────────────────────────────────────── */
const C = {
  dark:     "#282A28",
  dark2:    "#30362F",
  mid:      "#373F47",
  mid2:     "#606B6C",
  soft:     "#8B8982",
  lighter:  "#E1E1E0",
  page:     "#F0F0EE",
  green:    "#4ADE80",
  greenDim: "#16a34a",
  violet:   "#a78bfa",
  violetDim:"#7c3aed",
  amber:    "#fbbf24",
  amberDim: "#d97706",
  white:    "#ffffff",
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  `$${(parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const fmtTime = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065 } },
}

const itemVariants = {
  hidden:   { opacity: 0, y: 16, scale: 0.97 },
  visible:  { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 26 } },
}

/* ─────────────────────────────────────────────────────────────────────────────
   QUICK ACTION CARD
───────────────────────────────────────────────────────────────────────────── */
const QuickCard = ({ icon: Icon, label, accent, onClick }) => (
  <motion.button
    variants={itemVariants}
    whileTap={{ scale: 0.91 }}
    whileHover={{ scale: 1.04, y: -2 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 rounded-2xl p-4 w-full"
    style={{
      background: C.white,
      boxShadow: `0 2px 14px rgba(40,42,40,0.08), 0 1px 4px rgba(40,42,40,0.05)`,
      border: `1.5px solid ${C.lighter}`,
      minHeight: 110,
      WebkitTapHighlightColor: "transparent",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* colored top strip */}
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 3,
        background: accent,
        borderRadius: "12px 12px 0 0",
      }}
    />
    <div
      className="flex items-center justify-center rounded-xl"
      style={{
        width: 46,
        height: 46,
        background: `${accent}18`,
        border: `1.5px solid ${accent}30`,
      }}
    >
      <Icon size={22} strokeWidth={1.9} style={{ color: accent }} />
    </div>
    <span
      className="font-semibold text-center leading-tight"
      style={{ fontSize: 12.5, color: C.dark }}
    >
      {label}
    </span>
  </motion.button>
)

/* ─────────────────────────────────────────────────────────────────────────────
   STAT CARD (horizontal)
───────────────────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, accent, label, value, sub }) => (
  <motion.div
    variants={itemVariants}
    className="flex items-center gap-3 rounded-2xl p-4"
    style={{
      background: C.white,
      boxShadow: "0 2px 10px rgba(40,42,40,0.07), 0 1px 3px rgba(40,42,40,0.04)",
      border: `1px solid ${C.lighter}`,
    }}
  >
    <div
      className="flex items-center justify-center rounded-xl flex-shrink-0"
      style={{ width: 44, height: 44, background: `${accent}14`, border: `1.5px solid ${accent}28` }}
    >
      <Icon size={20} strokeWidth={1.9} style={{ color: accent }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold truncate" style={{ fontSize: 18, color: C.dark, letterSpacing: "-0.03em" }}>
        {value}
      </p>
      <p className="font-medium truncate" style={{ fontSize: 12, color: C.soft }}>
        {label}
      </p>
    </div>
    {sub && (
      <span
        className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}
      >
        {sub}
      </span>
    )}
  </motion.div>
)

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────────────────── */
const SectionHeader = ({ title, onAction, actionLabel }) => (
  <div className="flex items-center justify-between mb-3 px-1">
    <h2 className="font-bold" style={{ fontSize: 14.5, color: C.dark, letterSpacing: "-0.01em" }}>
      {title}
    </h2>
    {onAction && (
      <button
        onClick={onAction}
        className="flex items-center gap-0.5 font-semibold"
        style={{ fontSize: 12, color: C.green }}
      >
        {actionLabel || "Ver todo"}
        <ChevronRight size={13} strokeWidth={2.5} />
      </button>
    )}
  </div>
)

/* ─────────────────────────────────────────────────────────────────────────────
   ACTIVITY ROW
───────────────────────────────────────────────────────────────────────────── */
const ActivityRow = ({ title, sub, amount, time, isLast }) => (
  <motion.div
    variants={itemVariants}
    className="flex items-center gap-3 py-3"
    style={{ borderBottom: isLast ? "none" : `1px solid ${C.lighter}` }}
  >
    <div
      className="flex items-center justify-center rounded-xl flex-shrink-0 font-bold"
      style={{
        width: 38,
        height: 38,
        background: `${C.green}16`,
        border: `1.5px solid ${C.green}28`,
        color: C.greenDim,
        fontSize: 14,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {title ? title.charAt(0).toUpperCase() : "V"}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold truncate" style={{ fontSize: 13, color: C.dark }}>
        {title || "Venta"}
      </p>
      {sub && (
        <p className="truncate" style={{ fontSize: 11, color: C.soft }}>
          {sub}
        </p>
      )}
    </div>
    <div className="text-right flex-shrink-0">
      <p className="font-bold" style={{ fontSize: 13, color: C.dark }}>
        {amount}
      </p>
      {time && (
        <p className="flex items-center gap-0.5 justify-end" style={{ fontSize: 10, color: C.soft }}>
          <Clock size={9} strokeWidth={2} />
          {time}
        </p>
      )}
    </div>
  </motion.div>
)

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE DASHBOARD
───────────────────────────────────────────────────────────────────────────── */
const MobileDashboard = ({
  clientes = [],
  productos = [],
  facturas = [],
  pedidos = [],
  caja = {},
  onViewAllFacturas,
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

  /* ── Computed ── */
  const hoy = new Date()
  const startOfDay   = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const startOfMonth = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  const ventasHoy  = useMemo(() => facturas.filter((f) => f.fecha && new Date(f.fecha) >= startOfDay),   [facturas])
  const ventasMes  = useMemo(() => facturas.filter((f) => f.fecha && new Date(f.fecha) >= startOfMonth), [facturas])
  const totalHoy   = ventasHoy.reduce((s, f) => s + (f.total || 0), 0)
  const totalMes   = ventasMes.reduce((s, f) => s + (f.total || 0), 0)

  const bajosStock  = productos.filter((p) => !!(p.controlastock || p.controlaStock) && (p.stock || 0) <= 5).length
  const pedidosPend = pedidos.filter((p) => p.estado === "pendiente").length

  const hora   = hoy.getHours()
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches"
  const nombre = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Admin"

  const recentFacturas = useMemo(
    () => [...facturas].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)).slice(0, 5),
    [facturas]
  )

  /* ── Quick actions — paleta sistema ── */
  const acciones = [
    { icon: ShoppingCart, label: "Nueva Venta",       accent: C.green,  fn: () => onNuevaVenta?.() },
    { icon: PackagePlus,  label: "Agregar Producto",  accent: C.violet, fn: () => openModal?.("nuevo-producto") },
    { icon: Package,      label: "Ver Stock",         accent: C.mid2,   fn: () => onViewAllProductos?.() },
    { icon: Users,        label: "Clientes",          accent: C.amber,  fn: () => onViewAllClientes?.() },
    { icon: BarChart3,    label: "Reportes",          accent: C.mid,    fn: () => onViewReportes?.() },
    { icon: Landmark,     label: "Caja",              accent: C.greenDim, fn: () => onViewAllCaja?.() },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .mob-dash * { box-sizing: border-box; }
        .mob-dash { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
        .mob-dash ::-webkit-scrollbar { display: none; }
        .mob-dash { scrollbar-width: none; }
      `}</style>

      <div className="mob-dash flex flex-col w-full min-h-screen" style={{ background: C.page }}>

        {/* ────────────── HEADER GRAFITO ────────────── */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            background: `linear-gradient(145deg, ${C.dark} 0%, ${C.dark2} 55%, ${C.mid} 100%)`,
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          {/* Decorative shapes */}
          <div style={{
            position: "absolute", width: 240, height: 240, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.green}12 0%, transparent 70%)`,
            top: -100, right: -80, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", width: 160, height: 160, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.violet}10 0%, transparent 70%)`,
            bottom: -60, left: -40, pointerEvents: "none",
          }} />
          {/* Thin green top accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, ${C.green} 0%, ${C.violet} 100%)`,
          }} />

          <div className="relative z-10 px-5 pt-5 pb-5">

            {/* Top row: menu + badge */}
            <div className="flex items-center justify-between mb-5">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onOpenMobileSidebar}
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 40, height: 40,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  WebkitTapHighlightColor: "transparent",
                  cursor: "pointer",
                }}
              >
                <Menu size={18} strokeWidth={2} color="white" />
              </motion.button>

              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: `${C.green}18`,
                  border: `1px solid ${C.green}35`,
                }}
              >
                <Zap size={11} strokeWidth={2.5} style={{ color: C.green }} />
                <span style={{ fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: "0.01em" }}>
                  POS Activo
                </span>
              </div>
            </div>

            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
            >
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 3, letterSpacing: "0.01em" }}>
                {saludo} 👋
              </p>
              <h1
                className="font-bold"
                style={{ fontSize: 26, color: "white", letterSpacing: "-0.045em", marginBottom: 18 }}
              >
                {nombre}
              </h1>
            </motion.div>

            {/* Today's summary card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Ventas de hoy
                  </p>
                  <p className="font-bold" style={{ fontSize: 30, color: "white", letterSpacing: "-0.055em", lineHeight: 1 }}>
                    {fmt(totalHoy)}
                  </p>
                  <p style={{ fontSize: 11.5, color: `${C.green}`, marginTop: 6, fontWeight: 600 }}>
                    {ventasHoy.length} {ventasHoy.length === 1 ? "transacción" : "transacciones"}
                  </p>
                </div>
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: 46, height: 46,
                    background: `${C.green}18`,
                    border: `1.5px solid ${C.green}30`,
                  }}
                >
                  <TrendingUp size={22} strokeWidth={1.8} style={{ color: C.green }} />
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ────────────── SCROLLABLE CONTENT ────────────── */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 32px)" }}>
          <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

            {/* ── ACCIONES RÁPIDAS ── */}
            <section>
              <SectionHeader title="Acciones rápidas" />
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
              >
                {acciones.map((a) => (
                  <QuickCard
                    key={a.label}
                    icon={a.icon}
                    label={a.label}
                    accent={a.accent}
                    onClick={a.fn}
                  />
                ))}
              </motion.div>
            </section>

            {/* ── RESUMEN ── */}
            <section>
              <SectionHeader title="Resumen del negocio" />
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <StatCard
                  icon={TrendingUp}
                  accent={C.green}
                  label="Ventas del mes"
                  value={fmt(totalMes)}
                  sub={`${ventasMes.length} fact.`}
                />
                {bajosStock > 0 && (
                  <StatCard
                    icon={AlertTriangle}
                    accent={C.amber}
                    label="Productos bajo stock"
                    value={`${bajosStock} items`}
                    sub="Revisar"
                  />
                )}
                {pedidosPend > 0 && (
                  <StatCard
                    icon={Clock}
                    accent={C.violet}
                    label="Pedidos pendientes"
                    value={`${pedidosPend} pedidos`}
                    sub="Ver"
                  />
                )}
                <StatCard
                  icon={Users}
                  accent={C.mid2}
                  label="Clientes registrados"
                  value={`${clientes.length}`}
                />
              </motion.div>
            </section>

            {/* ── ACTIVIDAD RECIENTE ── */}
            {recentFacturas.length > 0 ? (
              <section>
                <SectionHeader
                  title="Actividad reciente"
                  onAction={onViewAllFacturas}
                  actionLabel="Ver todas"
                />
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: C.white,
                    boxShadow: "0 2px 12px rgba(40,42,40,0.07), 0 1px 4px rgba(40,42,40,0.04)",
                    border: `1px solid ${C.lighter}`,
                  }}
                >
                  <div style={{ padding: "0 16px" }}>
                    {recentFacturas.map((f, i) => (
                      <ActivityRow
                        key={f.id || i}
                        title={f.cliente_nombre || f.cliente || "Cliente"}
                        sub={f.numero ? `#${f.numero}` : undefined}
                        amount={fmt(f.total)}
                        time={fmtTime(f.fecha)}
                        isLast={i === recentFacturas.length - 1}
                      />
                    ))}
                  </div>
                </motion.div>
              </section>
            ) : (
              /* ── empty state ── */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", paddingTop: 32, paddingBottom: 32, gap: 14,
                }}
              >
                <div
                  style={{
                    width: 68, height: 68, borderRadius: 20,
                    background: `${C.green}14`,
                    border: `1.5px solid ${C.green}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <ShoppingCart size={30} strokeWidth={1.5} style={{ color: C.green }} />
                </div>
                <p className="font-semibold" style={{ fontSize: 15, color: C.dark }}>
                  Sin ventas registradas
                </p>
                <p style={{ fontSize: 13, color: C.soft, textAlign: "center", maxWidth: 220 }}>
                  Creá tu primera venta tocando el botón de acciones rápidas
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onNuevaVenta?.()}
                  style={{
                    padding: "10px 24px", borderRadius: 12, fontWeight: 700, fontSize: 13,
                    background: C.green, color: C.dark,
                    border: "none", cursor: "pointer",
                    boxShadow: `0 4px 16px ${C.green}40`,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Nueva Venta
                </motion.button>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

export default MobileDashboard
