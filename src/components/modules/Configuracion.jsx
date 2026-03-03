"use client"

import React, { useState } from "react"
import { useTheme } from "../../lib/ThemeContext"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import { Moon, Sun, Palette, Shield, User, ChevronRight, Save, LayoutTemplate, Smartphone, Zap, Clock, AlertTriangle, CreditCard, LogOut, Menu } from "lucide-react"
import { useAuth } from "../../lib/AuthContext"

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

const Configuracion = ({ onOpenMobileSidebar }) => {
    const { darkMode, toggleDarkMode } = useTheme()
    const { status, daysRemaining, isTrial, isPro, email, createSubscription, cancelSubscription, getCheckoutUrl } = useSubscriptionContext()
    const { user, signOut } = useAuth()
    const [loadingSub, setLoadingSub] = useState(false)
    const [guardando, setGuardando] = useState(false)

    const handleGuardar = () => {
        setGuardando(true)
        setTimeout(() => setGuardando(false), 800)
    }

    const handleSubscribe = async () => {
        if (loadingSub) return
        setLoadingSub(true)
        try {
            await createSubscription()
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingSub(false)
        }
    }

    const handleAbonar = async () => {
        if (loadingSub) return
        setLoadingSub(true)
        try {
            const url = await getCheckoutUrl()
            if (url) window.location.href = url
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingSub(false)
        }
    }

    const handleCancel = async () => {
        if (!window.confirm("¿Seguro que querés cancelar tu suscripción? Perderás acceso al finalizar tu período actual.")) return
        setLoadingSub(true)
        try {
            await cancelSubscription()
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingSub(false)
        }
    }

    const planActivo = isPro || status === 'active'
    const planTrial = status === 'trial'
    const planVencido = status === 'expired' || status === 'suspended'
    const planGrace = status === 'grace'

    // Calcular progreso del plan (30 días)
    const progresoPlan = planActivo ? Math.max(0, Math.min(100, ((30 - daysRemaining) / 30) * 100)) : 0

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>
            {/* ══ HEADER ══ */}
            <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 clamp(12px, 3vw, 24px)', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
                        <Menu size={16} strokeWidth={2} />
                    </button>
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Sistema</p>
                        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Configuración</h2>
                    </div>
                </div>
            </header>

            <div style={{ padding: 'clamp(12px, 3vw, 24px)', maxWidth: 860, margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>

                    {/* COLUMNA IZQUIERDA: PLAN Y SUSCRIPCION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* MI PLAN */}
                        <div style={{ background: surface, borderRadius: 14, border: planActivo ? `1px solid #DCED31` : `1px solid ${border}`, boxShadow: cardShadow, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
                            {planActivo && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#DCED31' }} />}

                            <SectionTitle icon={CreditCard} title="Mi Suscripción" desc="Detalles de tu plan actual" />

                            <div style={{ background: surface2, borderRadius: 10, border: `1px solid ${border}`, padding: '16px', marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: planActivo ? '#DCED31' : planTrial ? '#FCD34D' : '#E53935',
                                            boxShadow: `0 0 0 2px ${planActivo ? 'rgba(220,237,49,.3)' : planTrial ? 'rgba(252,211,77,.3)' : 'rgba(229,57,53,.3)'}`
                                        }} />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>
                                            {planActivo ? 'Gestify PRO' : planTrial ? 'Prueba Gratuita' : planGrace ? 'Período de Gracia' : 'Suscripción Vencida'}
                                        </span>
                                        {planActivo && (
                                            <span style={{
                                                fontSize: 9, fontWeight: 900, color: '#282A28', background: '#DCED31',
                                                padding: '1px 6px', borderRadius: 3, letterSpacing: '.04em',
                                            }}>PRO</span>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: ct3, background: 'rgba(48,54,47,.05)', padding: '2px 8px', borderRadius: 4 }}>
                                        $14.999 / mes
                                    </span>
                                </div>

                                <p style={{ fontSize: 12, color: ct2, lineHeight: 1.5, marginBottom: planActivo ? 12 : 0 }}>
                                    {planActivo && `Tu plan PRO está activo. Se renueva en ${daysRemaining} días.`}
                                    {planTrial && `Estás en período de prueba. Te quedan ${daysRemaining} días.`}
                                    {planGrace && `Tu plan venció. Tenés ${daysRemaining} días para renovar.`}
                                    {planVencido && `Tu plan ha expirado. Aboná para reactivar tu cuenta.`}
                                </p>

                                {/* Barra de progreso del plan PRO */}
                                {planActivo && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, color: ct3, fontWeight: 600 }}>Período actual</span>
                                            <span style={{ fontSize: 10, color: ct3, fontWeight: 600 }}>{daysRemaining} días restantes</span>
                                        </div>
                                        <div style={{ height: 6, background: 'rgba(48,54,47,.08)', borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 10,
                                                background: progresoPlan > 80 ? '#E53935' : progresoPlan > 50 ? '#FCD34D' : '#DCED31',
                                                width: `${progresoPlan}%`,
                                                transition: 'width .5s ease',
                                            }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                {!planActivo && (
                                    <button onClick={handleSubscribe} disabled={loadingSub} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, background: '#DCED31', color: '#1e2320', fontSize: 12, fontWeight: 700, border: 'none', cursor: loadingSub ? 'default' : 'pointer', transition: 'all .13s', opacity: loadingSub ? .7 : 1 }}>
                                        <Zap size={14} strokeWidth={2.5} /> {loadingSub ? 'Cargando...' : 'Suscribirme Ahora'}
                                    </button>
                                )}
                            </div>

                        </div>

                        {/* CUENTA */}
                        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '20px 24px' }}>
                            <SectionTitle icon={User} title="Mi Cuenta" desc="Información de tu perfil" />

                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: accent, border: planActivo ? '2px solid #DCED31' : `1px solid rgba(51,65,57,.15)` }}>
                                        {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    {planActivo && (
                                        <div style={{
                                            position: 'absolute', bottom: -2, right: -4,
                                            fontSize: 7, fontWeight: 900, color: '#282A28', background: '#DCED31',
                                            padding: '1px 4px', borderRadius: 3, letterSpacing: '.04em',
                                            border: '1.5px solid #fff',
                                        }}>PRO</div>
                                    )}
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: ct1 }}>{user?.user_metadata?.full_name || 'Administrador'}</p>
                                    <p style={{ fontSize: 12, color: ct3 }}>{user?.email}</p>
                                </div>
                            </div>

                            <button onClick={signOut} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, background: surface2, border: `1px solid ${border}`, color: '#E53935', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .13s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,57,53,.05)'} onMouseLeave={e => e.currentTarget.style.background = surface2}>
                                <LogOut size={14} /> Cerrar Sesión
                            </button>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: APARIENCIA Y EXTRAS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* APARIENCIA */}
                        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '20px 24px' }}>
                            <SectionTitle icon={Palette} title="Apariencia" desc="Personalizá cómo se ve la aplicación" />

                            <ConfigRow label="Modo Oscuro" description="Cambia el tema de la interfaz al modo oscuro. Ideal para ambientes de poca luz." noBorder>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 30, background: surface2, border: `1px solid ${border}` }}>
                                    {darkMode ? <Moon size={14} style={{ color: accent }} /> : <Sun size={14} style={{ color: ct3 }} />}
                                    <ToggleSwitch enabled={darkMode} onChange={toggleDarkMode} />
                                </div>
                            </ConfigRow>
                        </div>

                        {/* PREFERENCIAS DEL SISTEMA */}
                        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '20px 24px' }}>
                            <SectionTitle icon={LayoutTemplate} title="Preferencias" desc="Ajustes de comportamiento del panel" />

                            <ConfigRow label="Vista Compacta" description="Reduce los márgenes (Próximamente)">
                                <ToggleSwitch enabled={false} onChange={() => { }} />
                            </ConfigRow>
                            <ConfigRow label="Animaciones Reales" description="Transiciones suaves en el sistema" noBorder>
                                <ToggleSwitch enabled={true} onChange={() => { }} />
                            </ConfigRow>
                        </div>

                    </div>
                </div>

                <div style={{ marginTop: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src="/333.png" alt="Gestify Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 800, color: '#111827', letterSpacing: '-.02em', margin: '0 0 2px 0' }}>Gestify</p>
                        <p style={{ fontSize: 10, color: '#6B7280', margin: 0, fontWeight: 500 }}>v2.0.1 (SaaS Build)</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Configuracion
