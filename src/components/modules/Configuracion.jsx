"use client"

import { useTheme } from "../../lib/ThemeContext"
import { Moon, Sun, Monitor, Palette, Bell, Shield, User, ChevronRight } from "lucide-react"

const ToggleSwitch = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? "bg-gray-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
    >
        <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-200 ${enabled
                    ? "translate-x-4 bg-white dark:bg-gray-900"
                    : "translate-x-0.5 bg-white dark:bg-gray-400"
                }`}
        />
    </button>
)

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <Icon size={12} className="text-gray-600 dark:text-gray-400" />
        </div>
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
    </div>
)

const ConfigRow = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
        <div className="flex-1 pr-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
            {description && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{description}</p>
            )}
        </div>
        {children}
    </div>
)

const Configuracion = () => {
    const { darkMode, toggleDarkMode } = useTheme()

    return (
        <div className="space-y-4 max-w-2xl">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configuración</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Ajustá las preferencias de tu sistema
                </p>
            </div>

            {/* APARIENCIA */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <SectionTitle icon={Palette} title="Apariencia" />

                <ConfigRow
                    label="Modo oscuro"
                    description="Cambia el tema de la interfaz al modo oscuro para reducir el cansancio visual"
                >
                    <div className="flex items-center gap-2.5">
                        {darkMode
                            ? <Moon size={13} className="text-gray-400" />
                            : <Sun size={13} className="text-gray-400" />
                        }
                        <ToggleSwitch enabled={darkMode} onChange={toggleDarkMode} />
                    </div>
                </ConfigRow>

                {/* Preview del tema actual */}
                <div className={`mt-3 rounded-lg border p-3 transition-all duration-300 ${darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${darkMode ? "bg-blue-400" : "bg-green-400"}`} />
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"
                            }`}>
                            {darkMode ? "Modo oscuro activo" : "Modo claro activo"}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {/* Mini preview de cards */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`flex-1 rounded-md p-2 border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"
                                }`}>
                                <div className={`h-1.5 rounded w-3/4 mb-1.5 ${darkMode ? "bg-gray-500" : "bg-gray-200"}`} />
                                <div className={`h-2.5 rounded w-1/2 ${darkMode ? "bg-gray-400" : "bg-gray-300"}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* NOTIFICACIONES */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <SectionTitle icon={Bell} title="Notificaciones" />
                <ConfigRow
                    label="Alertas de stock bajo"
                    description="Recibí notificaciones cuando un producto esté por debajo del mínimo"
                >
                    <ToggleSwitch enabled={true} onChange={() => { }} />
                </ConfigRow>
                <ConfigRow
                    label="Recordatorio de facturas pendientes"
                    description="Alertas sobre facturas sin cobrar"
                >
                    <ToggleSwitch enabled={false} onChange={() => { }} />
                </ConfigRow>
            </div>

            {/* CUENTA */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <SectionTitle icon={User} title="Cuenta" />
                {[
                    { label: "Perfil de usuario", desc: "Nombre, email y datos de acceso" },
                    { label: "Cambiar contraseña", desc: "Actualizá tu contraseña de seguridad" },
                ].map(item => (
                    <button key={item.label} className="w-full flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 text-left hover:bg-gray-50 dark:hover:bg-gray-800 -mx-1 px-1 rounded-lg transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                        <ChevronRight size={13} className="text-gray-400" />
                    </button>
                ))}
            </div>

            {/* VERSIÓN */}
            <div className="text-center pt-2">
                <p className="text-[10px] text-gray-400 dark:text-gray-600">
                    FacturaPRO by Qora Data · v1.0.0
                </p>
            </div>
        </div>
    )
}

export default Configuracion
