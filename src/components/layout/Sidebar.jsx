"use client"

import React from "react"
import { useAuth } from "../../lib/AuthContext"
import { useTheme } from "../../lib/ThemeContext"
import {
  Home,
  FileText,
  Users,
  Package,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Settings,
  LogOut,
  ClipboardList,
  ChevronRight,
  X,
} from "lucide-react"

const Sidebar = ({ activeModule, setActiveModule, isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const { darkMode } = useTheme()

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "pedidos", icon: ClipboardList, label: "Pedidos" },
    { id: "facturacion", icon: FileText, label: "Facturación" },
    { id: "clientes", icon: Users, label: "Clientes" },
    { id: "productos", icon: Package, label: "Productos" },
    { id: "caja", icon: DollarSign, label: "Control de Caja" },
    { id: "reportes", icon: BarChart3, label: "Reportes" },
    { id: "proveedores", icon: ShoppingCart, label: "Proveedores" },
  ]

  const handleNavClick = (id) => {
    setActiveModule(id)
    if (onClose) onClose() // Cierra el drawer en mobile al tocar un item
  }

  return (
    <>
      {/* Overlay oscuro en mobile cuando el sidebar está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          w-52 border-r flex flex-col z-50
          fixed left-0 top-0 bottom-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{
          backgroundColor: darkMode ? '#161616' : '#ffffff',
          borderColor: darkMode ? '#2e2e2e' : '#e5e7eb'
        }}
      >

        {/* HEADER */}
        <div className="flex flex-col items-center justify-center pt-5 pb-4 border-b border-gray-100 flex-shrink-0 relative">
          {/* Botón X para cerrar en mobile */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden"
          >
            <X size={15} />
          </button>
          {/* Logo Qora Data */}
          <div className="relative w-9 h-9 mb-2.5">
            <div className="absolute top-0 right-0 w-6 h-6 border border-gray-700 z-0" />
            <div className="absolute top-1 right-1 w-6 h-6 border border-gray-700 z-10 bg-white" />
            <div className="absolute top-2 right-2 w-6 h-6 border border-gray-700 z-20 bg-white flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-900" />
            </div>
          </div>
          <h1 className="text-sm font-bold text-gray-900 tracking-widest leading-none">QORA DATA</h1>
          <span className="text-[8px] text-gray-400 tracking-[0.3em] mt-1 font-medium">SOFTWARE</span>
        </div>

        {/* MENÚ */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
          {menuItems.map((item) => {
            const isActive = activeModule === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={isActive
                  ? darkMode
                    ? { background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: '#fff' }
                    : { background: '#111111', color: '#fff' }
                  : {}}
                className={`
                w-full flex items-center gap-2.5 py-2 px-3 rounded-lg
                transition-all duration-150 outline-none border-0
                focus:outline-none focus:ring-0 appearance-none
                group relative
                ${isActive
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
              `}
                type="button"
              >
                <div
                  style={!isActive && darkMode
                    ? { border: '1px solid rgba(249,115,22,0.45)', borderRadius: '6px', padding: '3px', color: '#fb923c' }
                    : { padding: '3px' }
                  }
                >
                  <item.icon
                    size={13}
                    className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : darkMode ? "" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                </div>
                <span className="text-[11.5px] font-medium tracking-tight flex-1 text-left">
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight size={10} className="text-white/60 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </nav>

        {/* FOOTER */}
        <div className="flex-shrink-0 border-t border-gray-100">
          {/* Configuración */}
          <div className="px-2.5 pt-2.5 pb-1">
            <button
              onClick={() => handleNavClick("configuracion")}
              style={activeModule === "configuracion"
                ? darkMode
                  ? { background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: '#fff' }
                  : { background: '#111111', color: '#fff' }
                : {}}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors outline-none border-0 focus:outline-none focus:ring-0 appearance-none group ${activeModule === "configuracion"
                ? "text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              type="button"
            >
              <Settings size={14} className={`flex-shrink-0 ${activeModule === "configuracion" ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                }`} />
              <span className="text-[11.5px] font-medium tracking-tight flex-1 text-left">Configuración</span>
            </button>
          </div>

          {/* Usuario */}
          <div className="px-2.5 pb-3">
            <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-200">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#2b2b2b] flex-shrink-0">
                  <span className="text-white font-semibold text-[11px]">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Usuario</div>
                  <div className="text-[10.5px] text-gray-800 font-medium truncate">{user?.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-[10.5px] font-medium border border-red-100 hover:border-red-200 outline-none focus:outline-none focus:ring-0 appearance-none"
                type="button"
              >
                <LogOut size={11} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar