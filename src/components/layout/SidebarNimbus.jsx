import React, { useState } from "react"
import {
  HomeIcon,
  PlusCircleIcon,
  ShoppingCartIcon,
  FileAltIcon,
  FileIcon,
  UserGroupIcon,
  UserIcon,
  TruckIcon,
  BoxPackedIcon,
  CashIcon,
  StatsIcon,
  CogIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  UserCircleIcon,
} from "@nimbus-ds/icons"
import { Calendar } from "lucide-react"
import { useAuth } from "../../lib/AuthContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import { ADMIN_EMAILS } from "../modules/AdminPanel"

const getSections = (pedidosHoy, isAdmin, activeModule) => [
  {
    title: "Inicio",
    items: [{ id: "dashboard", icon: HomeIcon, label: "Dashboard" }],
  },
  {
    title: "Comercial",
    items: [
      { id: "agregar-venta", icon: PlusCircleIcon, label: "Agregar Venta" },
      { id: "pedidos", icon: ShoppingCartIcon, label: "Venta", badge: pedidosHoy > 0 ? pedidosHoy : null },
      // Solo visible en el módulo ventas (pedidos) o calendario
      ...( (activeModule === 'pedidos' || activeModule === 'calendario') ? [
        { id: "calendario", icon: Calendar, label: "Calendario Entregas", isSubItem: true }
      ] : []),
      { id: "presupuestos", icon: FileAltIcon, label: "Presupuestos" },
      { id: "facturacion", icon: FileIcon, label: "Facturación" },
    ],
  },
  {
    title: "Contactos",
    items: [
      { id: "clientes", icon: UserGroupIcon, label: "Clientes" },
      { id: "proveedores", icon: TruckIcon, label: "Proveedores" },
    ],
  },
  {
    title: "Inventario & Finanzas",
    items: [
      { id: "productos", icon: BoxPackedIcon, label: "Productos" },
      { id: "caja", icon: CashIcon, label: "Caja" },
      { id: "reportes", icon: StatsIcon, label: "Reportes" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { id: "configuracion", icon: CogIcon, label: "Configuración" },
      ...(isAdmin ? [{ id: "admin", icon: UserCircleIcon, label: "Admin" }] : []),
    ],
  },
]

const C = {
  bg: "#ffffff",
  border: "#e5e7eb",
  surface: "#f0f2f1",
  primary: "#334139",
  primarySurface: "#e2ebe4",
  textHigh: "#0d0d0d",
  textLow: "#111827",
  textMuted: "#9ca3af",
  dangerSurface: "#fee2e2",
}

const NavItem = ({ item, isActive, collapsed, onClick }) => {
  const Ico = item.icon
  const [hover, setHover] = useState(false)

  const bg    = isActive ? C.primarySurface : hover ? C.surface : "transparent"
  const color = isActive ? C.primary : C.textLow

  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: collapsed ? "7px 0" : "7px 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        background: bg,
        color,
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        transition: "background 0.15s",
        boxSizing: "border-box",
      }}
    >
      {/* Active indicator — thick black left bar */}
      {isActive && (
        <span style={{
          position: "absolute",
          left: 0, top: "50%",
          transform: "translateY(-50%)",
          width: 4, height: 22,
          borderRadius: "0 4px 4px 0",
          background: C.primary,
        }} />
      )}
      <div style={{ marginLeft: item.isSubItem ? 16 : 0, display: "flex", alignItems: "center", gap: 8 }}>
        <Ico size={15} color={color} />
        {!collapsed && (
          <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
        )}
      </div>
      {!collapsed && item.badge && (
        <span style={{
          background: C.primary,
          color: "#fff",
          borderRadius: 10,
          fontSize: 10,
          fontWeight: 700,
          padding: "1px 6px",
          lineHeight: 1.6,
        }}>
          {item.badge}
        </span>
      )}
    </button>
  )
}

const SidebarNimbus = ({
  activeModule,
  setActiveModule,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  pedidos = [],
}) => {
  const { user, logout } = useAuth()
  const { isPro } = useSubscriptionContext()
  const isAdmin = ADMIN_EMAILS.includes(user?.email)

  const hoy = new Date().toISOString().split("T")[0]
  const pedidosHoy = pedidos.filter(p =>
    (p.created_at || p.fecha_pedido || "").split("T")[0] === hoy
  ).length

  const sections = getSections(pedidosHoy, isAdmin, activeModule)
  const W = isCollapsed ? 60 : 210

  const handleNav = (id) => {
    setActiveModule(id)
    if (onClose) onClose()
  }

  const Content = () => (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: C.bg,
      borderRight: `1px solid ${C.border}`,
      overflowX: "hidden",
    }}>
      {/* ── Logo header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: isCollapsed ? "center" : "center",
        position: "relative",
        padding: isCollapsed ? "10px 6px" : "10px 10px",
        borderBottom: `1px solid ${C.border}`,
        minHeight: 50, boxSizing: "border-box",
        gap: 6,
      }}>
        {!isCollapsed && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minWidth: 0 }}>
            <img
              src="/newlogo.png"
              alt="FacturaPRO"
              style={{ height: 30, objectFit: "contain", flexShrink: 0 }}
            />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            position: isCollapsed ? "static" : "absolute",
            right: 10,
            width: 26, height: 26, display: "flex",
            alignItems: "center", justifyContent: "center",
            border: `1px solid ${C.border}`, borderRadius: 6,
            background: "transparent", cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {isCollapsed
            ? <ChevronRightIcon size={13} color={C.textLow} />
            : <ChevronLeftIcon  size={13} color={C.textLow} />}
        </button>
      </div>

      {/* ── Nav ── */}
      <div style={{ flex: 1, overflowY: "hidden", padding: "6px 6px" }}>
        {sections.map((sec, i) => (
          <div key={sec.title} style={{ marginBottom: 2 }}>
            {!isCollapsed && (
              <div style={{
                padding: "6px 10px 2px",
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                color: C.textMuted, fontFamily: "'Inter', sans-serif",
              }}>
                {sec.title}
              </div>
            )}
            {isCollapsed && i > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}`, margin: "4px 0" }} />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {sec.items.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeModule === item.id}
                  collapsed={isCollapsed}
                  onClick={() => handleNav(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: isCollapsed ? "8px 6px" : "8px 10px",
      }}>
        {!isCollapsed && user && (
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            marginBottom: 5, padding: "5px 8px",
            borderRadius: 6, background: C.surface,
          }}>
            {/* Avatar Google o iniciales */}
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `1.5px solid ${C.border}` }}
              />
            ) : (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: C.primarySurface,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 11, fontWeight: 700, color: C.primary,
              }}>
                {(user.email?.[0] || "U").toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: C.textHigh,
                fontFamily: "'Inter', sans-serif",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {user.user_metadata?.full_name || user.email?.split("@")[0]}
              </div>
              {isPro && (
                <div style={{ fontSize: 9, color: C.primary, fontWeight: 700 }}>PRO</div>
              )}
            </div>
          </div>
        )}
        <LogoutBtn collapsed={isCollapsed} onLogout={logout} />
      </div>
    </div>
  )

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(10,10,10,0.4)",
          }}
        />
      )}

      {/* Desktop sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: 0,
        height: "100vh", width: W,
        zIndex: 30, transition: "width 0.2s ease",
        display: "none",
      }}
        className="nimbus-sidebar-desktop"
      >
        <Content />
      </aside>

      {/* Mobile sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: 0,
        height: "100vh", width: 230, zIndex: 50,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }}>
        <div style={{ position: "absolute", top: 12, right: -40, zIndex: 51 }}>
          {isOpen && (
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,.15)",
            }}>
              <CloseIcon size={16} color={C.textLow} />
            </button>
          )}
        </div>
        <Content />
      </aside>

      <style>{`
        @media (min-width: 768px) {
          .nimbus-sidebar-desktop { display: block !important; }
        }
      `}</style>
    </>
  )
}

const LogoutBtn = ({ collapsed, onLogout }) => {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onLogout}
      title="Cerrar sesión"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center",
        gap: collapsed ? 0 : 7,
        justifyContent: collapsed ? "center" : "flex-start",
        width: "100%", padding: "6px 10px",
        borderRadius: 6, border: "none",
        background: hover ? C.dangerSurface : "transparent",
        cursor: "pointer", color: C.textLow,
        fontFamily: "'Inter', sans-serif", fontSize: 12,
        transition: "background 0.12s",
      }}
    >
      <LogOutIcon size={14} color={C.textLow} />
      {!collapsed && <span>Cerrar sesión</span>}
    </button>
  )
}

export default SidebarNimbus
