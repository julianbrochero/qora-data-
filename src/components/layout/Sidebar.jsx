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
  DollarSign,
  BarChart3,
  ShoppingCart,
  Settings,
  LogOut,
  ClipboardList,
  ChevronLeft,
  Shield,
  TrendingUp,
} from "lucide-react"

const Sidebar = ({ activeModule, setActiveModule, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth()
  const { isPro } = useSubscriptionContext()

  const handleNavClick = (id) => {
    setActiveModule(id)
    if (onClose) onClose()
  }

  const sections = [
    {
      title: "Principal",
      items: [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { id: "pedidos", icon: TrendingUp, label: "Ventas", badge: "3" },
        { id: "facturacion", icon: FileText, label: "Facturación" },
        { id: "clientes", icon: Users, label: "Clientes" },
      ]
    },
    {
      title: "Gestión",
      items: [
        { id: "productos", icon: Package, label: "Productos" },
        { id: "caja", icon: DollarSign, label: "Caja" },
        { id: "proveedores", icon: ShoppingCart, label: "Proveedores" },
        { id: "reportes", icon: BarChart3, label: "Reportes" },
      ]
    },
    {
      title: "Sistema",
      items: [
        { id: "configuracion", icon: Settings, label: "Configuración" },
        ...(user?.email === 'brocherojulian72@gmail.com'
          ? [{ id: "admin", icon: Shield, label: "Admin", badge: '★' }]
          : []
        ),
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
          style={{ height: 90, padding: 0, borderBottom: `1px solid ${LINE}`, justifyContent: 'center' }}>

          <img
            src="/logogestify3.png"
            alt="Gestify"
            className="transition-all duration-200 object-contain"
            style={{
              height: 80,
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'scale(0.8)' : 'scale(1.7)',
              width: isCollapsed ? 0 : 'auto',
            }}
          />

          {isCollapsed && (
            <div className="flex items-center justify-center font-black flex-shrink-0 w-8 h-8 rounded-lg absolute inset-auto"
              style={{ background: SB_BG3, fontSize: 15, color: T1, border: `1px solid rgba(139,137,130,0.2)` }}>
              G
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden pb-4"
          style={{ padding: '12px 8px', scrollbarWidth: 'none' }}>

          {sections.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: 18 }}>
              {/* Section label */}
              <div className="transition-all duration-200 overflow-hidden whitespace-nowrap"
                style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
                  color: T4, padding: '0 10px', marginBottom: 4,
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
                        gap: 9, padding: '8px 10px',
                        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                        color: isActive ? T1 : T2,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13, fontWeight: isActive ? 600 : 500,
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
                      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 15, height: 15 }}>
                        <item.icon size={14} strokeWidth={isActive ? 2.5 : 2} />
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

        {/* PRO card — espacio vacío */}
        {isPro && !isCollapsed && (
          <div style={{ padding: '0 10px 14px' }}>
            <div style={{
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,.06)',
              background: 'rgba(255,255,255,.03)',
              padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: 'rgba(255,255,255,.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={12} color="rgba(255,255,255,.45)" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,.7)',
                  letterSpacing: '.02em', lineHeight: 1.2,
                }}>Plan PRO</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>
                  Acceso completo
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 flex flex-col" style={{ borderTop: `1px solid ${LINE}`, padding: '10px 8px', gap: 0 }}>

          {/* User info */}
          <div className="flex items-center overflow-hidden rounded-lg"
            style={{ gap: 9, padding: '8px 10px', marginBottom: 3 }}>
            <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden"
              style={{ width: 27, height: 27, background: SB_BG3, border: '1.5px solid rgba(139,137,130,0.25)', fontSize: 11, color: T1 }}>
              {user?.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
                : (user?.email ? user.email.charAt(0).toUpperCase() : 'A')}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden" style={{ transition: 'opacity .18s' }}>
                <div className="whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ fontSize: 11.5, fontWeight: 600, color: T1 }}>
                  {user?.user_metadata?.full_name || 'Administrador'}
                </div>
                <div className="whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ fontSize: 9.5, color: T3 }}>
                  {user?.email || 'admin@gestify.com'}
                </div>
              </div>
            )}
          </div>

          {/* Collapse button */}
          <button
            title={isCollapsed ? "Expandir" : "Colapsar"}
            onClick={() => {
              if (window.innerWidth < 768) { if (onClose) onClose() }
              else { if (onToggleCollapse) onToggleCollapse() }
            }}
            className="w-full flex items-center rounded-lg border-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-0"
            style={{
              gap: 9, padding: '7px 10px',
              background: 'transparent', color: T2,
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = T1 }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T2 }}>
            <span className="flex items-center flex-shrink-0 transition-transform duration-300"
              style={{ width: 14, height: 14, transform: isCollapsed ? 'rotate(180deg)' : 'none' }}>
              <ChevronLeft size={14} strokeWidth={2.5} />
            </span>
            {!isCollapsed && <span>Colapsar</span>}
          </button>

          {/* Logout button */}
          <button
            onClick={logout}
            title={isCollapsed ? "Cerrar sesión" : undefined}
            className="w-full flex items-center rounded-lg border-none cursor-pointer transition-all duration-150 focus:outline-none focus:ring-0"
            style={{
              gap: 9, padding: '7px 10px',
              background: 'transparent', color: T2,
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,137,130,0.15)'; e.currentTarget.style.color = 'rgba(255,180,170,0.85)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T2 }}>
            <span className="flex items-center flex-shrink-0" style={{ width: 14, height: 14 }}>
              <LogOut size={14} strokeWidth={2} style={{ transform: 'scaleX(-1)' }} />
            </span>
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar