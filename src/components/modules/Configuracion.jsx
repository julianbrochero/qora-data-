"use client"

import React, { useState } from "react"
import { useTheme } from "../../lib/ThemeContext"
import { Moon, Sun, Palette, Bell, Shield, User, ChevronRight, Save, LayoutTemplate, Smartphone, Mail, AlertTriangle } from "lucide-react"

/* ══════════════════════════════════════════════
   PALETA GESTIFY
══════════════════════════════════════════════ */
const bg = '#F5F5F5'
const surface = '#FAFAFA'
const surface2 = '#FFFFFF'
const border = 'rgba(48,54,47,.13)'
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'
const cardShadow = '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)'

const ToggleSwitch = ({ enabled, onChange }) => (
    <button type="button" onClick={onChange} aria-pressed={enabled}
        style={{ position: 'relative', display: 'inline-flex', height: 20, width: 36, alignItems: 'center', borderRadius: 20, transition: 'background-color .2s', outline: 'none', cursor: 'pointer', border: 'none', background: enabled ? accent : 'rgba(48,54,47,.2)' }}>
        <span style={{ display: 'inline-block', height: 14, width: 14, transform: `translateX(${enabled ? 18 : 3}px)`, borderRadius: '50%', background: '#fff', transition: 'transform .2s', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }} />
    </button>
)

const SectionTitle = ({ icon: Icon, title, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(51,65,57,.15)` }}>
            <Icon size={16} strokeWidth={2.5} style={{ color: accent }} />
        </div>
        <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: ct1, letterSpacing: '-.01em' }}>{title}</h3>
            {desc && <p style={{ fontSize: 11, color: ct3, marginTop: 1 }}>{desc}</p>}
        </div>
    </div>
)

const ConfigRow = ({ label, description, children, noBorder }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: noBorder ? 'none' : `1px solid ${border}` }}>
        <div style={{ flex: 1, paddingRight: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: ct1 }}>{label}</p>
            {description && <p style={{ fontSize: 11, color: ct3, marginTop: 2, lineHeight: 1.4 }}>{description}</p>}
        </div>
        <div style={{ flexShrink: 0 }}>
            {children}
        </div>
    </div>
)

const Configuracion = () => {
    const { darkMode, toggleDarkMode } = useTheme()
    const [guardando, setGuardando] = useState(false)

    const handleGuardar = () => {
        setGuardando(true)
        setTimeout(() => setGuardando(false), 800)
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

            {/* ══ HEADER ══ */}
            <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Sistema</p>
                    <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Configuración</h2>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleGuardar} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 32, borderRadius: 8, background: '#DCED31', color: '#1e2320', fontSize: 11, fontWeight: 700, border: 'none', cursor: guardando ? 'default' : 'pointer', transition: 'all .13s', boxShadow: '0 2px 8px rgba(220,237,49,.2)', opacity: guardando ? .7 : 1 }}
                        onMouseEnter={e => { if (!guardando) e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseLeave={e => { if (!guardando) e.currentTarget.style.transform = '' }}>
                        <Save size={14} strokeWidth={2.5} /> {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </header>

            <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto', width: '100%' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

                    {/* COLUMNA IZQUIERDA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* APARIENCIA */}
                        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '20px 24px' }}>
                            <SectionTitle icon={Palette} title="Apariencia y Tema" desc="Personalizá cómo se ve la aplicación" />

                            <ConfigRow label="Modo Oscuro" description="Cambia el tema de la interfaz al modo oscuro. Ideal para ambientes de poca luz o para uso nocturno prolongado." noBorder>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 30, background: surface2, border: `1px solid ${border}` }}>
                                    {darkMode ? <Moon size={14} style={{ color: accent }} /> : <Sun size={14} style={{ color: ct3 }} />}
                                    <ToggleSwitch enabled={darkMode} onChange={toggleDarkMode} />
                                </div>
                            </ConfigRow>

                            <div style={{ marginTop: 14, padding: '16px', borderRadius: 10, border: `1px dashed rgba(51,65,57,.2)`, background: 'rgba(51,65,57,.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: darkMode ? '#3B82F6' : '#DCED31', boxShadow: `0 0 0 2px ${darkMode ? 'rgba(59,130,246,.2)' : 'rgba(220,237,49,.3)'}` }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: ct2 }}>
                                        {darkMode ? "Preview Oscuro" : "Preview Claro"}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {[1, 2].map(i => (
                                        <div key={i} style={{ flex: 1, padding: 10, borderRadius: 8, background: darkMode ? '#282A28' : surface2, border: `1px solid ${border}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                                            <div style={{ height: 4, width: '40%', borderRadius: 2, background: darkMode ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.1)', marginBottom: 10 }} />
                                            <div style={{ height: 6, width: '80%', borderRadius: 3, background: darkMode ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.8)' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* PREFERENCIAS DEL SISTEMA */}
                        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '20px 24px' }}>
                            <SectionTitle icon={LayoutTemplate} title="Opciones de Interfaz" desc="Ajustes de comportamiento del panel" />

                            <ConfigRow label="Vista Compacta" description="Reduce los márgenes y espaciados para mostrar más información en pantalla.">
                                <ToggleSwitch enabled={true} onChange={() => { }} />
                            </ConfigRow>
                            <ConfigRow label="Animaciones" description="Habilitar transiciones suaves y efectos visuales al navegar por el sistema.">
                                <ToggleSwitch enabled={true} onChange={() => { }} />
                            </ConfigRow>
                            <ConfigRow label="Abrir modales con atajos" description="Permite usar atajos de teclado como Ctrl para acciones rápidas." noBorder>
                                <ToggleSwitch enabled={true} onChange={() => { }} />
                            </ConfigRow>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* NOTIFICACIONES */}
                        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '20px 24px' }}>
                            <SectionTitle icon={Bell} title="Notificaciones" desc="Gestioná qué alertas querés recibir y cuándo" />

                            <ConfigRow label="Stock Bajo" description="Alertar cuando un producto caiga por debajo de su punto de reposición.">
                                <ToggleSwitch enabled={true} onChange={() => { }} />
                            </ConfigRow>
                            <ConfigRow label="Facturas Vencidas" description="Recibir un aviso periódico sobre saldos pendientes de pago por parte de clientes.">
                                <ToggleSwitch enabled={true} onChange={() => { }} />
                            </ConfigRow>
                            <ConfigRow label="Cierre de Caja" description="Recordatorio diario para asentar el cierre al finalizar el turno operativo." noBorder>
                                <ToggleSwitch enabled={false} onChange={() => { }} />
                            </ConfigRow>
                        </div>

                        {/* SEGURIDAD & CUENTA */}
                        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '20px 24px' }}>
                            <SectionTitle icon={Shield} title="Seguridad y Acceso" desc="Administrá tu perfil y protección" />

                            {[
                                { label: "Datos del Perfil", desc: "Nombre, email y avatar", icon: User },
                                { label: "Cambiar Contraseña", desc: "Verificá tu clave de acceso al sistema", icon: Shield },
                                { label: "Dispositivos Activos", desc: "Cerrar sesión en otros equipos", icon: Smartphone },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, border: `1px solid ${border}`, background: surface2, marginBottom: i === 2 ? 0 : 8, cursor: 'pointer', transition: 'all .1s' }}
                                    onMouseEnter={e => e.currentTarget.style.border = `1px solid ${accent}`} onMouseLeave={e => e.currentTarget.style.border = `1px solid ${border}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(51,65,57,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <item.icon size={14} style={{ color: ct2 }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: ct1 }}>{item.label}</p>
                                            <p style={{ fontSize: 11, color: ct3, marginTop: 1 }}>{item.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} style={{ color: ct3 }} />
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* VERSIÓN */}
                <div style={{ marginTop: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, background: '#1e2320', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, fontFamily: "'DM Mono', monospace" }}>Q</span>
                    </div>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: ct3, letterSpacing: '.02em' }}>FacturaPRO by Qora Data</p>
                        <p style={{ fontSize: 10, color: 'rgba(139,137,130,.7)' }}>v2.0.0 (Premium Build)</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Configuracion
