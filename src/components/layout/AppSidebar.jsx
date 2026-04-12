import React, { useState, useRef, useEffect } from "react"
import {
  LayoutDashboard, PlusCircle, ShoppingCart, FileText,
  Users, Truck, Package, Wallet, BarChart3, Settings,
  LogOut, ShieldCheck, ChevronUp, X,
} from "lucide-react"
import { useAuth } from "../../lib/AuthContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import { ADMIN_EMAILS } from "../modules/AdminPanel"

const SIDEBAR_W = 220

const getSections = (pedidosHoy) => [
  {
    title: "Inicio",
    items: [{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "Gestión",
    items: [
      { id: "agregar-venta",  icon: PlusCircle,   label: "Agregar Venta" },
      { id: "pedidos",        icon: ShoppingCart,  label: "Ventas", badge: pedidosHoy > 0 ? String(pedidosHoy) : null },
      { id: "presupuestos",   icon: FileText,      label: "Presupuestos" },
      { id: "clientes",       icon: Users,         label: "Clientes" },
      { id: "proveedores",    icon: Truck,         label: "Proveedores" },
    ],
  },
  {
    title: "Inventario & Finanzas",
    items: [
      { id: "productos", icon: Package,   label: "Productos" },
      { id: "caja",      icon: Wallet,    label: "Caja" },
      { id: "reportes",  icon: BarChart3, label: "Reportes" },
    ],
  },
]

/* ── Nav items — reutilizable en desktop y mobile drawer ── */
const NavItems = ({ sections, activeModule, onNav }) => (
  <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
    {sections.map(sec => (
      <div key={sec.title} style={{ marginBottom: 10 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: "#9ca3af",
          letterSpacing: "0.06em", textTransform: "uppercase",
          padding: "4px 8px 2px",
        }}>{sec.title}</div>
        {sec.items.map(item => {
          const isActive = activeModule === item.id
          return (
            <button key={item.id} onClick={() => onNav(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 7, border: "none",
                background: isActive ? "#eef1ee" : "transparent",
                color: isActive ? "#334139" : "#0d0d0d",
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                cursor: "pointer", textAlign: "left",
                fontFamily: "'Inter',sans-serif",
                marginBottom: 1, position: "relative",
                transition: "background .1s",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9fafb" }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
            >
              {isActive && (
                <span style={{
                  position: "absolute", left: 0, top: "50%",
                  transform: "translateY(-50%)",
                  width: 3, height: 18, borderRadius: "0 3px 3px 0",
                  background: "#334139",
                }} />
              )}
              <item.icon size={15} strokeWidth={isActive ? 2.2 : 1.8}
                style={{ color: isActive ? "#334139" : "#6b7280", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 700, background: "#334139",
                  color: "#fff", padding: "1px 6px", borderRadius: 9,
                  minWidth: 18, textAlign: "center",
                }}>{item.badge}</span>
              )}
            </button>
          )
        })}
      </div>
    ))}
  </div>
)

/* ── Footer con dropdown de cuenta ── */
const UserFooter = ({ setActiveModule }) => {
  const { user, logout } = useAuth()
  const { isPro } = useSubscriptionContext()
  const isAdmin = ADMIN_EMAILS.includes(user?.email)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const navTo = (id) => { setActiveModule(id); setOpen(false) }
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario"
  const initial = (displayName[0] || "U").toUpperCase()

  return (
    <div ref={ref} style={{ borderTop: "1px solid #e5e7eb", padding: 8, position: "relative", flexShrink: 0 }}>
      {/* Dropdown — flota ARRIBA */}
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: 8, right: 8,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
          boxShadow: "0 -8px 28px rgba(0,0,0,.12), 0 -2px 8px rgba(0,0,0,.06)",
          overflow: "hidden", zIndex: 200,
        }}>
          <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </div>
          </div>

          <button onClick={() => navTo("configuracion")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#374151", fontFamily: "'Inter',sans-serif", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <Settings size={14} strokeWidth={1.8} style={{ color: "#6b7280", flexShrink: 0 }} />
            Configuración
          </button>

          {isAdmin && (
            <button onClick={() => navTo("admin")}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#334139", fontFamily: "'Inter',sans-serif", textAlign: "left", fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <ShieldCheck size={14} strokeWidth={1.8} style={{ color: "#334139", flexShrink: 0 }} />
              Admin
            </button>
          )}

          <div style={{ height: 1, background: "#f3f4f6", margin: "2px 0" }} />

          <button onClick={() => { setOpen(false); logout() }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#9ca3af", fontFamily: "'Inter',sans-serif", textAlign: "left" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626" }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9ca3af" }}
          >
            <LogOut size={14} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Botón cuenta */}
      <button onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "6px 8px", borderRadius: 8,
          background: open ? "#f3f4f6" : "transparent",
          border: "none", cursor: "pointer", transition: "background .13s",
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "#f9fafb" }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent" }}
      >
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} alt="avatar"
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid #e5e7eb" }} />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "#e2ebe4", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#334139",
          }}>{initial}</div>
        )}
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName}
          </div>
          {isPro && <div style={{ fontSize: 9, fontWeight: 700, color: "#334139", letterSpacing: "0.05em" }}>PRO</div>}
        </div>
        <ChevronUp size={13} style={{ color: "#9ca3af", flexShrink: 0, transform: open ? "rotate(0deg)" : "rotate(180deg)", transition: "transform .2s" }} />
      </button>
    </div>
  )
}

/* ── Sidebar principal ── */
const AppSidebar = ({ activeModule, setActiveModule, pedidos = [], mobileOpen = false, onMobileClose }) => {
  const hoy = new Date().toISOString().split("T")[0]
  const pedidosHoy = pedidos.filter(p =>
    (p.created_at || p.fecha_pedido || "").split("T")[0] === hoy
  ).length
  const sections = getSections(pedidosHoy)
  const handleNav = (id) => { setActiveModule(id); onMobileClose?.() }

  return (
    <>
      <style>{`@keyframes mob-sb-in { from { transform: translateX(-100%) } to { transform: translateX(0) } }`}</style>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div onClick={onMobileClose} style={{
            position: "fixed", inset: 0, zIndex: 1999,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)",
          }} />
          <div style={{
            position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 2000,
            width: 260, background: "#fff",
            boxShadow: "4px 0 32px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column",
            animation: "mob-sb-in .22s cubic-bezier(.22,.97,.56,1)",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e5e7eb", flexShrink: 0, minHeight: 52 }}>
              <img src="/newlogo.png" alt="Gestify" style={{ height: 28, objectFit: "contain" }} />
              <button onClick={onMobileClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 6, borderRadius: 7, color: "#6b7280" }}>
                <X size={18} />
              </button>
            </div>
            <NavItems sections={sections} activeModule={activeModule} onNav={handleNav} />
            <UserFooter setActiveModule={handleNav} />
          </div>
        </>
      )}

      {/* ── Desktop sidebar — fixed, nunca se mueve ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: SIDEBAR_W, zIndex: 100,
        background: "#fff", borderRight: "1px solid #e5e7eb",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 16px", borderBottom: "1px solid #e5e7eb", flexShrink: 0, minHeight: 52 }}>
          <img src="/newlogo.png" alt="Gestify" style={{ height: 30, objectFit: "contain" }} />
        </div>
        {/* Nav */}
        <NavItems sections={sections} activeModule={activeModule} onNav={setActiveModule} />
        {/* Footer */}
        <UserFooter setActiveModule={setActiveModule} />
      </div>
    </>
  )
}

export default AppSidebar
