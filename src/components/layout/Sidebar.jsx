"use client"

import React from "react"
import { useAuth } from "../../lib/AuthContext"
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
  ClipboardList, // ✅ ICONO MÁS APROPIADO PARA PEDIDOS
} from "lucide-react"

const Sidebar = ({ activeModule, setActiveModule }) => {
  const { user, logout } = useAuth()

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "pedidos", icon: ClipboardList, label: "Pedidos" }, // ✅ USANDO ClipboardList
    { id: "facturacion", icon: FileText, label: "Facturación" },
    { id: "clientes", icon: Users, label: "Clientes" },
    { id: "productos", icon: Package, label: "Productos" },
    { id: "caja", icon: DollarSign, label: "Control de Caja" },
    { id: "reportes", icon: BarChart3, label: "Reportes" },
    { id: "proveedores", icon: ShoppingCart, label: "Proveedores" },
  ]

  return (
    <div className="w-52 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 bottom-0 z-50">
      {/* HEADER - SOLO IMAGEN COMBINADA */}
      <div className="flex flex-col items-center justify-center pt-8 pb-6 border-b border-gray-200">
        {/* Logo Qora Data */}
        <div className="relative w-10 h-10 mb-3">
          <div className="absolute top-0 right-0 w-7 h-7 border border-gray-800 z-0"></div>
          <div className="absolute top-1 right-1 w-7 h-7 border border-gray-800 z-10 bg-white"></div>
          <div className="absolute top-2 right-2 w-7 h-7 border border-gray-800 z-20 bg-white flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-gray-900"></div>
          </div>
        </div>
        <h1 className="text-lg font-bold text-gray-900 tracking-widest leading-none">QORA DATA</h1>
        <span className="text-[9px] text-gray-400 tracking-[0.3em] mt-1.5 font-medium">SOFTWARE</span>
      </div>

      {/* MENÚ */}
      <nav className="flex-1 py-2 space-y-0.5 px-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-200 outline-none border-0 focus:outline-none focus:ring-0 focus:border-0 appearance-none ${activeModule === item.id
              ? "text-white font-medium shadow-sm"
              : "text-[#2b2b2b] hover:bg-gray-50 hover:text-[#2b2b2b]"
              }`}
            style={activeModule === item.id ? { backgroundColor: "#2b2b2b" } : {}}
            type="button"
          >
            <item.icon size={14} />
            <span className="text-[11px] tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-3 space-y-2 border-t border-gray-200">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-[#2b2b2b] hover:bg-gray-50 hover:text-[#2b2b2b] rounded-md transition-colors outline-none border-0 focus:outline-none focus:ring-0 focus:border-0 appearance-none"
          type="button"
        >
          <Settings size={14} />
          <span className="text-[11px] tracking-tight">Configuración</span>
        </button>

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#2b2b2b]">
              <span className="text-white font-medium text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-gray-500">Usuario</div>
              <div className="text-[11px] text-gray-900 font-medium truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors text-[11px] font-medium border border-red-200 outline-none focus:outline-none focus:ring-0 focus:border-0 appearance-none"
            type="button"
          >
            <LogOut size={12} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar