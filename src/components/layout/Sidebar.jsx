"use client"

import React from "react"
import { useAuth } from "../../lib/AuthContext"
import { useTheme } from "../../lib/ThemeContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Wallet,
  BarChart3,
  Truck,
  Settings,
  LogOut,
  ClipboardList,
  ChevronLeft,
  TrendingUp,
  X,
} from "lucide-react"

const Sidebar = ({ activeModule, setActiveModule, isOpen, onClose, isCollapsed, onToggleCollapse, pedidos = [] }) => {
  const { user, logout } = useAuth()
  const { isPro } = useSubscriptionContext()

  // Calcular ventas creadas hoy
  const hoy = new Date().toISOString().split('T')[0]
  const ventasHoy = pedidos.filter(p => {
    const fecha = (p.created_at || p.fecha_pedido || '').split('T')[0]
    return fecha === hoy
  }).length
  const badgeVentas = ventasHoy > 0 ? String(ventasHoy) : undefined

  const handleNavClick = (id) => {
    setActiveModule(id)
    if (onClose) onClose()
  }

  const sections = [
    {
      title: "Inicio",
      items: [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
      ]
    },
    {
      title: "Comercial",
      items: [
        { id: "pedidos", icon: TrendingUp, label: "Ventas", badge: badgeVentas },
        { id: "presupuestos", icon: ClipboardList, label: "Presupuestos" },
        { id: "facturacion", icon: FileText, label: "Facturación" },
      ]
    },
    {
      title: "Contactos",
      items: [
        { id: "clientes", icon: Users, label: "Clientes" },
        { id: "proveedores", icon: Truck, label: "Proveedores" },
      ]
    },
    {
      title: "Inventario & Finanzas",
      items: [
        { id: "productos", icon: Package, label: "Productos" },
        { id: "caja", icon: Wallet, label: "Caja" },
        { id: "reportes", icon: BarChart3, label: "Reportes" },
      ]
    },
    {
      title: "Sistema",
      items: [
        { id: "configuracion", icon: Settings, label: "Configuración" },
      ]
    }
  ]

  const SB_BG = '#282A28'
  const SB_BG3 = '#1f211f'
  const LINE = 'rgba(139,137,130,0.2)'
  const T1 = '#ffffff'
  const T2 = 'rgba(255,255,255,0.65)'
  const T3 = 'rgba(255,255,255,0.45)'
  const T4 = 'rgba(255,255,255,0.25)'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(30,35,32,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      <div
        className={`fixed left-0 top-0 bottom-0 flex flex-col z-50 overflow-hidden
          transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
          ${isCollapsed ? 'w-[64px]' : 'w-[220px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ background: SB_BG, borderRight: `1px solid ${LINE}` }}>

        {/* Logo */}
        <div className="flex items-center overflow-hidden flex-shrink-0 relative"
          style={{ height: 84, padding: 0, borderBottom: `1px solid ${LINE}`, justifyContent: 'center' }}>

          {/* Botón cerrar móvil */}
          <button onClick={onClose} className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
            <X size={14} />
          </button>

          <img
            src="/logogestify3.png"
            alt="Gestify"
            className="transition-all duration-200 object-contain"
            style={{
              height: 64,
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'scale(0.8)' : 'scale(1.85)',
              width: isCollapsed ? 0 : 'auto',
            }}
          />

          {isCollapsed && (
            <div className="flex items-center justify-center font-black flex-shrink-0 w-7 h-7 rounded-lg absolute inset-auto"
              style={{ background: SB_BG3, fontSize: 13, color: T1, border: `1px solid rgba(139,137,130,0.2)` }}>
              G
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ padding: '8px 6px', scrollbarWidth: 'none' }}>

          {sections.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: 'clamp(4px, 1.5vh, 10px)' }}>
              {/* Section label */}
              <div className="transition-all duration-200 overflow-hidden whitespace-nowrap"
                style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
                  color: T4, padding: '0 8px', marginBottom: 2,
                  opacity: isCollapsed ? 0 : 1,
                  height: isCollapsed ? 0 : 'auto',
                }}>
                {sec.title}
              </div>

              {/* Nav items */}
              <div className="flex flex-col" style={{ gap: 1 }}>
                {sec.items.map((item) => {
                  const isActive = activeModule === item.id
                  return (
                    <button
                      key={item.id}
                      title={isCollapsed ? item.label : undefined}
                      onClick={() => handleNavClick(item.id)}
                      className="w-full flex items-center rounded-lg border-none cursor-pointer transition-all duration-150 relative focus:outline-none focus:ring-0"
                      style={{
                        gap: 10, padding: 'clamp(5px, 0.8vh, 8px) 10px',
                        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                        color: isActive ? T1 : T2,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 'clamp(12px, 1.5vh, 13.5px)', fontWeight: isActive ? 600 : 500,
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T1 } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T2 } }}>

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 rounded-r"
                          style={{ top: '20%', bottom: '20%', width: 2.5, background: '#DCED31' }} />
                      )}

                      {/* Icon */}
                      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 16, height: 16 }}>
                        <item.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                      </span>

                      {/* Label */}
                      <span className="flex-1 transition-all duration-150 overflow-hidden"
                        style={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}>
                        {item.label}
                      </span>

                      {/* Badge */}
                      {item.badge && !isCollapsed && (
                        <span className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
                          style={{
                            fontSize: 9, minWidth: 16, height: 16, padding: '0 4px',
                            background: 'rgba(255,255,255,0.15)', color: T1,
                          }}>
                          {item.badge}
                        </span>
                      )}
                      {/* Collapsed badge dot */}
                      {item.badge && isCollapsed && (
                        <div className="absolute rounded-full"
                          style={{ top: 7, right: 7, width: 5, height: 5, background: 'rgba(255,255,255,0.5)' }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* PRO badge / Suscribirme */}
        {!isCollapsed && (
          <div style={{ padding: '0 8px 8px' }}>

            {/* Keyframes para el border beam */}
            <style>{`
              @keyframes sb-beam-spin {
                from { --sb-beam-angle: 0deg }
                to   { --sb-beam-angle: 360deg }
              }
              @property --sb-beam-angle {
                syntax: '<angle>';
                initial-value: 0deg;
                inherits: false;
              }
              .sb-beam-wrapper {
                border-radius: 9px;
                padding: 1.5px;
                background: conic-gradient(
                  from var(--sb-beam-angle),
                  transparent 40deg,
                  rgba(220,237,49,0.2) 80deg,
                  #DCED31 120deg,
                  rgba(220,237,49,0.2) 160deg,
                  transparent 200deg
                );
                animation: sb-beam-spin 12s linear infinite;
              }
              .sb-beam-inner {
                border-radius: 8px;
                background: #2b2d28;
                padding: 7px 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                width: 100%;
                cursor: pointer;
                border: none;
                transition: background .15s;
              }
              .sb-beam-inner:hover {
                background: #33362f !important;
              }
            `}</style>

            {isPro ? (
              // Badge PRO ACTIVO animado (girando mucho más lento)
              <div className="sb-beam-wrapper" style={{ animation: 'sb-beam-spin 25s linear infinite' }}>
                <div style={{
                  borderRadius: 8,
                  background: '#2b2d28',
                  padding: '7px 10px',
                  display: 'flex', alignItems: 'center', gap: 7,
                  width: '100%', cursor: 'default',
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#DCED31',
                    boxShadow: '0 0 6px rgba(220,237,49,.7)',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(220,237,49,.85)', letterSpacing: '.06em' }}>PLAN PRO ACTIVO</span>
                </div>
              </div>
            ) : (
              // Botón con border beam animado
              <div className="sb-beam-wrapper">
                <button
                  className="sb-beam-inner"
                  onClick={() => window.location.href = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b658460a7699475eb06b492b25e0160a"}
                  style={{ width: '100%' }}
                >
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#DCED31',
                    boxShadow: '0 0 4px rgba(220,237,49,.6)',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#DCED31', letterSpacing: '.04em' }}>Activar Plan PRO</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 flex flex-col" style={{ borderTop: `1px solid ${LINE}`, padding: '6px 6px 6px' }}>

          {/* User info + logout en una sola fila */}
          <div className="flex items-center overflow-hidden rounded-lg" style={{ gap: 8, padding: '5px 8px', marginBottom: 2 }}>
            <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden"
              style={{ width: 24, height: 24, background: SB_BG3, border: '1.5px solid rgba(139,137,130,0.25)', fontSize: 10, color: T1 }}>
              {user?.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
                : (user?.email ? user.email.charAt(0).toUpperCase() : 'A')}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1" style={{ transition: 'opacity .18s' }}>
                <div className="whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ fontSize: 11, fontWeight: 600, color: T1 }}>
                  {user?.user_metadata?.full_name || 'Admin'}
                </div>
              </div>
            )}
          </div>

          {/* Collapse + Logout en fila */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              title={isCollapsed ? 'Expandir' : 'Colapsar'}
              onClick={() => {
                if (window.innerWidth < 768) { if (onClose) onClose() }
                else { if (onToggleCollapse) onToggleCollapse() }
              }}
              className="flex items-center rounded-lg border-none cursor-pointer transition-all duration-150 focus:outline-none"
              style={{ gap: 6, padding: '5px 8px', flex: isCollapsed ? undefined : 1, background: 'transparent', color: T2, fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, justifyContent: isCollapsed ? 'center' : 'flex-start', whiteSpace: 'nowrap', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = T1 }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T2 }}>
              <span style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', display: 'flex', transition: 'transform .3s' }}>
                <ChevronLeft size={13} strokeWidth={2.5} />
              </span>
              {!isCollapsed && <span>Colapsar</span>}
            </button>

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="flex items-center rounded-lg border-none cursor-pointer transition-all duration-150 focus:outline-none"
              style={{ gap: 6, padding: '5px 8px', background: 'transparent', color: T2, fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 500, justifyContent: 'center', whiteSpace: 'nowrap', overflow: 'hidden', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,137,130,0.15)'; e.currentTarget.style.color = 'rgba(255,180,170,0.85)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T2 }}>
              <LogOut size={13} strokeWidth={2} style={{ transform: 'scaleX(-1)' }} />
              {!isCollapsed && <span>Salir</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar