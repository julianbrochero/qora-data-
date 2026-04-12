"use client"

import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "../../lib/AuthContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Wallet,
  BarChart3,
  Truck,
  LogOut,
  ClipboardList,
  ChevronLeft,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  Settings,
  ChevronUp,
} from "lucide-react"
import { ADMIN_EMAILS } from "../modules/AdminPanel"

const Sidebar = ({ activeModule, setActiveModule, isOpen, onClose, isCollapsed, onToggleCollapse, pedidos = [] }) => {
  const { user, logout } = useAuth()
  const { isPro } = useSubscriptionContext()
  const isAdmin = ADMIN_EMAILS.includes(user?.email)

  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Badge ventas de hoy
  const hoy = new Date().toISOString().split('T')[0]
  const ventasHoy = pedidos.filter(p => {
    const fecha = (p.created_at || p.fecha_pedido || '').split('T')[0]
    return fecha === hoy
  }).length
  const badgeVentas = ventasHoy > 0 ? String(ventasHoy) : undefined

  const handleNavClick = (id) => {
    setActiveModule(id)
    setAccountMenuOpen(false)
    if (onClose) onClose()
  }

  // Sin sección Sistema — Configuración y Admin van al dropdown de cuenta
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
        { id: "agregar-venta", icon: PlusCircle,     label: "Agregar Venta" },
        { id: "pedidos",       icon: TrendingUp,     label: "Ventas", badge: badgeVentas },
        { id: "presupuestos",  icon: ClipboardList,  label: "Presupuestos" },
        { id: "facturacion",   icon: FileText,       label: "Facturación" },
      ]
    },
    {
      title: "Contactos",
      items: [
        { id: "clientes",    icon: Users, label: "Clientes" },
        { id: "proveedores", icon: Truck, label: "Proveedores" },
      ]
    },
    {
      title: "Inventario & Finanzas",
      items: [
        { id: "productos", icon: Package,  label: "Productos" },
        { id: "caja",      icon: Wallet,   label: "Caja" },
        { id: "reportes",  icon: BarChart3, label: "Reportes" },
      ]
    },
  ]

  // Tokens de color
  const SB_BG  = '#282A28'
  const SB_BG2 = '#2f322e'
  const SB_BG3 = '#1f211f'
  const LINE   = 'rgba(139,137,130,0.2)'
  const T1 = '#ffffff'
  const T2 = 'rgba(255,255,255,0.65)'
  const T3 = 'rgba(255,255,255,0.45)'
  const T4 = 'rgba(255,255,255,0.25)'

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const avatarLetter = displayName.charAt(0).toUpperCase()

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
        className={`fixed left-0 top-0 bottom-0 flex flex-col z-50
          transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
          ${isCollapsed ? 'w-[64px]' : 'w-[220px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{
          background: SB_BG,
          borderRight: `1px solid ${LINE}`,
          /* altura fija: top-0 + bottom-0 ya lo limita, pero aseguramos overflow contenido */
          overflow: 'hidden',
        }}
      >
        {/* ── LOGO ── */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ height: 64, borderBottom: `1px solid ${LINE}` }}
        >
          {isCollapsed ? (
            <img src="/newlogo.png" alt="Gestify" className="object-contain" style={{ height: 32, width: 32, borderRadius: 8 }} />
          ) : (
            <img src="/newlogo.png" alt="Gestify" className="object-contain" style={{ height: 52 }} />
          )}
        </div>

        {/* ── NAV — flex-1 + min-h-0 es el fix clave ── */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ padding: '8px 6px', scrollbarWidth: 'none', minHeight: 0 }}
        >
          {sections.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: 'clamp(4px, 1.5vh, 10px)' }}>
              {/* Sección label */}
              <div
                className="transition-all duration-200 overflow-hidden whitespace-nowrap"
                style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
                  color: T4, padding: '0 8px', marginBottom: 2,
                  opacity: isCollapsed ? 0 : 1,
                  height: isCollapsed ? 0 : 'auto',
                }}
              >
                {sec.title}
              </div>

              {/* Items */}
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
                        gap: 10,
                        padding: 'clamp(5px, 0.8vh, 8px) 10px',
                        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                        color: isActive ? T1 : T2,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 'clamp(12px, 1.5vh, 13.5px)',
                        fontWeight: isActive ? 600 : 500,
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T1 } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T2 } }}
                    >
                      {/* Active bar */}
                      {isActive && (
                        <div className="absolute left-0 rounded-r"
                          style={{ top: '20%', bottom: '20%', width: 2.5, background: '#4ADE80' }} />
                      )}
                      {/* Icon */}
                      <span className="flex items-center justify-center flex-shrink-0" style={{ width: 16, height: 16 }}>
                        <item.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                      </span>
                      {/* Label */}
                      <span
                        className="flex-1 overflow-hidden text-ellipsis transition-all duration-150"
                        style={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                      >
                        {item.label}
                      </span>
                      {/* Badge */}
                      {item.badge && !isCollapsed && (
                        <span className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
                          style={{ fontSize: 9, minWidth: 16, height: 16, padding: '0 4px', background: 'rgba(255,255,255,0.15)', color: T1 }}>
                          {item.badge}
                        </span>
                      )}
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

        {/* ── PRO BADGE ── */}
        {!isCollapsed && (
          <div style={{ padding: '0 8px 8px', flexShrink: 0 }}>
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
                  rgba(74,222,128,0.2) 80deg,
                  #4ADE80 120deg,
                  rgba(74,222,128,0.2) 160deg,
                  transparent 200deg
                );
                animation: sb-beam-spin 12s linear infinite;
              }
            `}</style>

            {isPro ? (
              <div className="sb-beam-wrapper" style={{ animation: 'sb-beam-spin 25s linear infinite' }}>
                <div style={{
                  borderRadius: 8, background: '#2b2d28', padding: '7px 10px',
                  display: 'flex', alignItems: 'center', gap: 7, cursor: 'default',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px rgba(74,222,128,.7)', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(74,222,128,.9)', letterSpacing: '.06em' }}>PLAN PRO ACTIVO</span>
                </div>
              </div>
            ) : (
              <div className="sb-beam-wrapper">
                <button
                  onClick={() => window.location.href = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b658460a7699475eb06b492b25e0160a"}
                  style={{
                    borderRadius: 8, background: '#2b2d28', padding: '7px 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', cursor: 'pointer', border: 'none', transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#33362f'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2b2d28'}
                >
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 4px rgba(74,222,128,.6)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80', letterSpacing: '.04em' }}>Activar Plan PRO</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER — cuenta + dropdown ── */}
        <div
          ref={accountMenuRef}
          className="flex-shrink-0 relative"
          style={{ borderTop: `1px solid ${LINE}`, padding: '6px' }}
        >
          {/* Dropdown de cuenta — aparece ARRIBA */}
          {accountMenuOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 6px)',
                left: 6, right: 6,
                background: '#222520',
                border: `1px solid ${LINE}`,
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.4), 0 -2px 8px rgba(0,0,0,0.3)',
                zIndex: 60,
              }}
            >
              {/* Header del dropdown */}
              <div style={{ padding: '10px 12px 8px', borderBottom: `1px solid ${LINE}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 10, color: T3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                  {user?.email}
                </div>
              </div>

              {/* Opciones */}
              <div style={{ padding: '4px 0' }}>
                {/* Configuración */}
                <button
                  onClick={() => handleNavClick('configuracion')}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 12px', border: 'none', background: 'transparent',
                    color: T2, fontSize: 12.5, fontWeight: 500, fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer', transition: 'all .12s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = T1 }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T2 }}
                >
                  <Settings size={13} strokeWidth={2} />
                  Configuración
                </button>

                {/* Admin — solo para admins */}
                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                      padding: '8px 12px', border: 'none', background: 'transparent',
                      color: 'rgba(74,222,128,0.75)', fontSize: 12.5, fontWeight: 500, fontFamily: 'Inter, sans-serif',
                      cursor: 'pointer', transition: 'all .12s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.06)'; e.currentTarget.style.color = '#4ADE80' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(74,222,128,0.75)' }}
                  >
                    <ShieldCheck size={13} strokeWidth={2} />
                    Panel Admin
                  </button>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: LINE, margin: '4px 0' }} />

                {/* Cerrar sesión */}
                <button
                  onClick={logout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 12px', border: 'none', background: 'transparent',
                    color: T3, fontSize: 12.5, fontWeight: 500, fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer', transition: 'all .12s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgba(255,160,150,0.85)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T3 }}
                >
                  <LogOut size={13} strokeWidth={2} style={{ transform: 'scaleX(-1)' }} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          {/* Fila principal: avatar + nombre + toggle colapsar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

            {/* Botón de cuenta — abre el dropdown */}
            <button
              onClick={() => setAccountMenuOpen(o => !o)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center',
                gap: 8, padding: '6px 8px',
                background: accountMenuOpen ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: accountMenuOpen ? `1px solid ${LINE}` : '1px solid transparent',
                borderRadius: 8, cursor: 'pointer',
                transition: 'all .15s', minWidth: 0,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={e => { if (!accountMenuOpen) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = LINE } }}
              onMouseLeave={e => { if (!accountMenuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
              title={isCollapsed ? displayName : undefined}
            >
              {/* Avatar */}
              <div
                className="rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden"
                style={{ width: 26, height: 26, background: SB_BG3, border: `1.5px solid rgba(139,137,130,0.25)`, fontSize: 10, color: T1 }}
              >
                {user?.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
                  : avatarLetter}
              </div>

              {/* Nombre + chevron */}
              {!isCollapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: 9.5, color: T3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isPro ? 'Plan Pro' : 'Plan Free'}
                    </div>
                  </div>
                  <ChevronUp
                    size={12}
                    strokeWidth={2.5}
                    style={{
                      color: T3, flexShrink: 0,
                      transform: accountMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                      transition: 'transform .2s',
                    }}
                  />
                </>
              )}
            </button>

            {/* Botón colapsar sidebar */}
            <button
              title={isCollapsed ? 'Expandir' : 'Colapsar'}
              onClick={() => {
                if (window.innerWidth < 768) { if (onClose) onClose() }
                else { if (onToggleCollapse) onToggleCollapse() }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, flexShrink: 0,
                background: 'transparent', border: '1px solid transparent',
                borderRadius: 7, cursor: 'pointer', color: T3, transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = LINE }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T3; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <span style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', display: 'flex', transition: 'transform .3s' }}>
                <ChevronLeft size={13} strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
