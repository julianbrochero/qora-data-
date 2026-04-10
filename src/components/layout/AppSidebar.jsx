import React from "react"
import {
  LayoutDashboard, PlusCircle, ShoppingCart, FileText,
  Users, Truck, Package, Wallet, BarChart3, Settings,
  LogOut, ShieldCheck,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "../../lib/AuthContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import { ADMIN_EMAILS } from "../modules/AdminPanel"

const getSections = (pedidosHoy, isAdmin) => [
  {
    title: "Inicio",
    items: [{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "Gestión",
    items: [
      { id: "agregar-venta", icon: PlusCircle, label: "Agregar Venta" },
      { id: "pedidos", icon: ShoppingCart, label: "Ventas", badge: pedidosHoy > 0 ? String(pedidosHoy) : null },
      { id: "presupuestos", icon: FileText, label: "Presupuestos" },
      { id: "clientes", icon: Users, label: "Clientes" },
      { id: "proveedores", icon: Truck, label: "Proveedores" },
    ],
  },
  {
    title: "Inventario & Finanzas",
    items: [
      { id: "productos", icon: Package, label: "Productos" },
      { id: "caja", icon: Wallet, label: "Caja" },
      { id: "reportes", icon: BarChart3, label: "Reportes" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { id: "configuracion", icon: Settings, label: "Configuración" },
      ...(isAdmin ? [{ id: "admin", icon: ShieldCheck, label: "Admin" }] : []),
    ],
  },
]

/* ── User footer ── */
const UserFooter = () => {
  const { user, logout } = useAuth()
  const { isPro } = useSubscriptionContext()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <SidebarFooter
      className="border-t border-sidebar-border p-3 gap-2"
      style={{ borderTop: "1px solid #e5e7eb" }}
    >
      {!collapsed && user && (
        <div className="flex items-center gap-2 px-1">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="avatar"
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid #e5e7eb" }}
            />
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: "#e2ebe4", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#334139",
            }}>
              {(user.email?.[0] || "U").toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.user_metadata?.full_name || user.email?.split("@")[0]}
            </div>
            {isPro && (
              <div style={{ fontSize: 9, fontWeight: 700, color: "#334139", letterSpacing: "0.05em" }}>PRO</div>
            )}
          </div>
        </div>
      )}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={logout}
            tooltip="Cerrar sesión"
            style={{ color: "#9ca3af", fontSize: 13 }}
            className="hover:!text-red-500 hover:!bg-red-50"
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}

/* ── Main sidebar ── */
const AppSidebar = ({
  activeModule,
  setActiveModule,
  pedidos = [],
  ...props
}) => {
  const { user } = useAuth()
  const isAdmin = ADMIN_EMAILS.includes(user?.email)
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  const hoy = new Date().toISOString().split("T")[0]
  const pedidosHoy = pedidos.filter(p =>
    (p.created_at || p.fecha_pedido || "").split("T")[0] === hoy
  ).length

  const sections = getSections(pedidosHoy, isAdmin)

  return (
    <Sidebar
      collapsible="none"
      style={{ "--sidebar-width": "220px" }}
      className="border-r border-sidebar-border bg-white"
      {...props}
    >
      {/* ── Logo ── */}
      <SidebarHeader
        className="flex-row items-center justify-center px-3 py-2"
        style={{ borderBottom: "1px solid #e5e7eb", minHeight: 52 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <img src="/newlogo.png" alt="Gestify" style={{ height: 30, objectFit: "contain" }} />
        </div>
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent
        className="py-2 overflow-hidden"
        style={{ overflowY: "hidden" }}
      >
        {sections.map((sec) => (
          <SidebarGroup key={sec.title} className="px-2 py-0 mb-1">
            <SidebarGroupLabel
              className="px-2 mb-0.5"
              style={{
                fontSize: 10, fontWeight: 600, color: "#9ca3af",
                letterSpacing: "0.06em", textTransform: "uppercase",
                height: "auto", marginTop: 4,
              }}
            >
              {sec.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {sec.items.map((item) => {
                  const isActive = activeModule === item.id
                  return (
                    <SidebarMenuItem key={item.id} className="relative">
                      <SidebarMenuButton
                        onClick={() => setActiveModule(item.id)}
                        isActive={isActive}
                        tooltip={item.label}
                        style={{
                          position: "relative",
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#334139" : "#0d0d0d",
                          background: isActive ? "#eef1ee" : "transparent",
                          borderRadius: 6,
                          height: 34,
                          paddingLeft: 10,
                        }}
                        className="hover:!bg-gray-100 hover:!text-black"
                      >
                        {/* Active left bar */}
                        {isActive && (
                          <span style={{
                            position: "absolute", left: 0, top: "50%",
                            transform: "translateY(-50%)",
                            width: 3, height: 18, borderRadius: "0 3px 3px 0",
                            background: "#334139",
                          }} />
                        )}
                        <item.icon
                          size={15}
                          strokeWidth={isActive ? 2.2 : 1.8}
                          style={{ color: isActive ? "#334139" : "#0d0d0d", flexShrink: 0 }}
                        />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge
                          style={{
                            background: "#334139", color: "#fff",
                            fontSize: 10, fontWeight: 700,
                            minWidth: 18, height: 18, borderRadius: 9,
                            padding: "0 5px",
                          }}
                        >
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <UserFooter />
    </Sidebar>
  )
}

export default AppSidebar
