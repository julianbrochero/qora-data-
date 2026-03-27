"use client"

import React, { useState } from "react"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import { Palette, User, Save, LayoutTemplate, Zap, LogOut, Menu, Building2, CheckCircle, Tag, Plus, X, CreditCard } from "lucide-react"
import { useAuth } from "../../lib/AuthContext"

/* ── Paleta ── */
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

/* ── Subcomponentes ── */
const ToggleSwitch = ({ enabled, onChange }) => (
    <button type="button" onClick={onChange} aria-pressed={enabled}
        style={{ position: 'relative', display: 'inline-flex', height: 20, width: 36, alignItems: 'center', borderRadius: 20, transition: 'background-color .2s', outline: 'none', cursor: 'pointer', border: 'none', background: enabled ? accent : 'rgba(48,54,47,.2)', flexShrink: 0 }}>
        <span style={{ display: 'inline-block', height: 14, width: 14, transform: `translateX(${enabled ? 18 : 3}px)`, borderRadius: '50%', background: '#fff', transition: 'transform .2s', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }} />
    </button>
)

const SectionTitle = ({ icon: Icon, title, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(51,65,57,.15)`, flexShrink: 0 }}>
            <Icon size={15} strokeWidth={2.5} style={{ color: accent }} />
        </div>
        <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: ct1, letterSpacing: '-.01em', margin: 0 }}>{title}</h3>
            {desc && <p style={{ fontSize: 11, color: ct3, marginTop: 1, margin: 0 }}>{desc}</p>}
        </div>
    </div>
)

const ConfigRow = ({ label, description, children, noBorder }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderBottom: noBorder ? 'none' : `1px solid ${border}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: ct1, margin: 0 }}>{label}</p>
            {description && <p style={{ fontSize: 11, color: ct3, marginTop: 2, lineHeight: 1.4, margin: 0 }}>{description}</p>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
)

/* ── Input helper ── */
const Inp = ({ value, onChange, placeholder }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={e => e.target.style.borderColor = accent}
        onBlur={e => e.target.style.borderColor = border}
        style={{ width: '100%', height: 36, padding: '0 12px', fontSize: 12, color: ct1, background: '#fff', border: `1px solid ${border}`, borderRadius: 8, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }}
    />
)

/* ── SaveBtn helper ── */
const SaveBtn = ({ onClick, disabled, ok, okLabel, label, icon: Icon }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 36, width: '100%', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: disabled ? 'wait' : 'pointer', transition: 'all .15s', background: ok ? '#22C55E' : '#1e2320', color: ok ? '#fff' : '#4ADE80', fontFamily: "'Inter',sans-serif", opacity: disabled ? 0.7 : 1 }}>
        {ok ? <><CheckCircle size={13} /> {okLabel}</> : disabled ? 'Guardando...' : <><Icon size={13} /> {label}</>}
    </button>
)

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const Configuracion = ({ onOpenMobileSidebar }) => {
    const { status, daysRemaining, isTrial, isPro, createSubscription, getCheckoutUrl } = useSubscriptionContext()
    const { user, signOut, updateUserData } = useAuth()

    const [loadingSub, setLoadingSub] = useState(false)

    /* ── Empresa ── */
    const meta = user?.user_metadata || {}
    const [empresa, setEmpresa] = useState(meta.empresa || meta.gestify_empresa || localStorage.getItem('gestify_empresa') || '')
    const [cuit, setCuit] = useState(meta.cuit || localStorage.getItem('gestify_cuit') || '')
    const [direccion, setDireccion] = useState(meta.direccion || localStorage.getItem('gestify_direccion') || '')
    const [savedOk, setSavedOk] = useState(false)
    const [savingEmpresa, setSavingEmpresa] = useState(false)
    const [saveError, setSaveError] = useState('')

    const guardarEmpresa = async () => {
        setSavingEmpresa(true); setSaveError('')
        try {
            await updateUserData({ empresa: empresa.trim(), cuit: cuit.trim(), direccion: direccion.trim() })
            localStorage.setItem('gestify_empresa', empresa.trim())
            localStorage.setItem('gestify_cuit', cuit.trim())
            localStorage.setItem('gestify_direccion', direccion.trim())
            setSavedOk(true); setTimeout(() => setSavedOk(false), 2500)
        } catch { setSaveError('No se pudo guardar. Intentá de nuevo.') }
        finally { setSavingEmpresa(false) }
    }

    /* ── Canales ── */
    const loadCanales = () => {
        try {
            const fromMeta = meta.canales_venta
            if (fromMeta && Array.isArray(fromMeta)) return fromMeta
            const fromLS = localStorage.getItem('gestify_canales_venta')
            if (fromLS) return JSON.parse(fromLS)
        } catch { }
        return []
    }
    const [canales, setCanales] = useState(loadCanales)
    const [nuevoCanal, setNuevoCanal] = useState('')
    const [savingCanales, setSavingCanales] = useState(false)
    const [canalesSavedOk, setCanalesSavedOk] = useState(false)

    const agregarCanal = () => {
        const nombre = nuevoCanal.trim()
        if (!nombre || canales.some(c => c.toLowerCase() === nombre.toLowerCase())) return
        setCanales(prev => [...prev, nombre]); setNuevoCanal('')
    }
    const eliminarCanal = idx => setCanales(prev => prev.filter((_, i) => i !== idx))

    const guardarCanales = async () => {
        setSavingCanales(true)
        try {
            await updateUserData({ canales_venta: canales })
            localStorage.setItem('gestify_canales_venta', JSON.stringify(canales))
            setCanalesSavedOk(true); setTimeout(() => setCanalesSavedOk(false), 2500)
        } catch (e) { console.error('Error guardando canales:', e) }
        finally { setSavingCanales(false) }
    }

    /* ── Suscripción ── */
    const planActivo = isPro || status === 'active'
    const planTrial = status === 'trial'
    const planGrace = status === 'grace'
    const planVencido = status === 'expired' || status === 'suspended'
    const progreso = planActivo ? Math.max(0, Math.min(100, ((30 - daysRemaining) / 30) * 100)) : 0

    const handleSubscribe = () => {
        window.location.href = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b658460a7699475eb06b492b25e0160a'
    }
    const handleAbonar = async () => {
        if (loadingSub) return; setLoadingSub(true)
        try { const url = await getCheckoutUrl(); if (url) window.location.href = url } catch (e) { console.error(e) } finally { setLoadingSub(false) }
    }

    /* ── Render ── */
    return (
        <div style={{ width: '100%', minHeight: '100vh', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

            {/* HEADER */}
            <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 clamp(12px,3vw,24px)', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
                        <Menu size={16} strokeWidth={2} />
                    </button>
                    <img src="/newlogo.png" alt="Gestify" style={{ height: 32, objectFit: 'contain' }} />
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Sistema</p>
                        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1, margin: 0 }}>Configuración</h2>
                    </div>
                </div>
            </header>

            {/* CONTENIDO */}
            <div style={{ padding: 'clamp(12px,3vw,24px)', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

                {/* Grid con clases para responsive */}
                <div className="config-grid">

                    {/* ═══ COLUMNA 1 ═══ */}
                    <div className="config-col">
                        {/* MI PLAN */}
                        <div style={{ background: '#EAEAEA', borderRadius: 14, border: planActivo ? `1px solid #4ADE80` : `1px solid ${border}`, boxShadow: cardShadow, padding: 'clamp(14px,3vw,20px) clamp(14px,3vw,24px)', position: 'relative', overflow: 'hidden' }}>
                            {planActivo && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#4ADE80' }} />}
                            <SectionTitle icon={CreditCard} title="Mi Suscripción" desc="Detalles de tu plan actual" />
                            <div style={{ background: '#DFDFDF', borderRadius: 10, border: `1px solid ${border}`, padding: 'clamp(10px,2vw,16px)', marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: planActivo ? '#4ADE80' : planTrial ? '#FCD34D' : '#E53935', boxShadow: `0 0 0 2px ${planActivo ? 'rgba(74,222,128,.3)' : planTrial ? 'rgba(252,211,77,.3)' : 'rgba(229,57,53,.3)'}`, flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>
                                            {planActivo ? 'Gestify PRO' : planTrial ? 'Prueba Gratuita' : planGrace ? 'Período de Gracia' : 'Suscripción Vencida'}
                                        </span>
                                        {planActivo && <span style={{ fontSize: 9, fontWeight: 900, color: '#0A1A0E', background: '#4ADE80', padding: '1px 6px', borderRadius: 3, letterSpacing: '.04em', flexShrink: 0 }}>PRO</span>}
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: ct3, background: 'rgba(48,54,47,.05)', padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>$14.999 / mes</span>
                                </div>
                                <p style={{ fontSize: 12, color: ct2, lineHeight: 1.5, margin: 0, marginBottom: planActivo ? 12 : 0 }}>
                                    {planActivo && `Tu plan PRO está activo. Se renueva en ${daysRemaining} días.`}
                                    {planTrial && `Estás en período de prueba. Te quedan ${daysRemaining} días.`}
                                    {planGrace && `Tu plan venció. Tenés ${daysRemaining} días para renovar.`}
                                    {planVencido && `Tu plan ha expirado. Aboná para reactivar tu cuenta.`}
                                </p>
                                {planActivo && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, color: ct3, fontWeight: 600 }}>Período actual</span>
                                            <span style={{ fontSize: 10, color: ct3, fontWeight: 600 }}>{daysRemaining} días restantes</span>
                                        </div>
                                        <div style={{ height: 5, background: 'rgba(48,54,47,.08)', borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: 10, background: progreso > 80 ? '#E53935' : progreso > 50 ? '#FCD34D' : '#4ADE80', width: `${progreso}%`, transition: 'width .5s ease' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!planActivo && (
                                <button onClick={handleSubscribe} disabled={loadingSub}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, background: '#1e2320', color: '#4ADE80', fontSize: 12, fontWeight: 700, border: 'none', cursor: loadingSub ? 'default' : 'pointer', opacity: loadingSub ? .7 : 1 }}>
                                    <Zap size={14} strokeWidth={2.5} /> {loadingSub ? 'Cargando...' : 'Suscribirme Ahora'}
                                </button>
                            )}
                        </div>

                        {/* MI CUENTA */}
                        <div style={{ background: '#EAEAEA', borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: 'clamp(14px,3vw,20px) clamp(14px,3vw,24px)' }}>
                            <SectionTitle icon={User} title="Mi Cuenta" desc="Información de tu perfil" />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: accent, border: planActivo ? '2px solid #4ADE80' : `1px solid rgba(51,65,57,.15)` }}>
                                        {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    {planActivo && (
                                        <div style={{ position: 'absolute', bottom: -2, right: -4, fontSize: 7, fontWeight: 900, color: '#0A1A0E', background: '#4ADE80', padding: '1px 4px', borderRadius: 3, border: '1.5px solid #fff' }}>PRO</div>
                                    )}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: ct1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.user_metadata?.full_name || 'Administrador'}</p>
                                    <p style={{ fontSize: 12, color: ct3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                                </div>
                            </div>
                            <button onClick={signOut}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 14px', borderRadius: 8, background: '#DFDFDF', border: `1px solid ${border}`, color: '#E53935', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,57,53,.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = '#DFDFDF'}>
                                <LogOut size={14} /> Cerrar Sesión
                            </button>
                        </div>
                    </div>

                    {/* ═══ COLUMNA 2 ═══ */}
                    <div className="config-col">
                        {/* DATOS EMPRESA */}
                        <div style={{ background: '#EAEAEA', borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: 'clamp(14px,3vw,20px) clamp(14px,3vw,24px)' }}>
                            <SectionTitle icon={Building2} title="Datos de la Empresa" desc="Se usan en PDFs de presupuestos y lista de precios" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: ct2, display: 'block', marginBottom: 5 }}>
                                        Nombre de la empresa <span style={{ color: '#DC2626' }}>*</span>
                                    </label>
                                    <Inp value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ej: Mi Empresa S.A." />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: ct2, display: 'block', marginBottom: 5 }}>
                                        CUIT <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span>
                                    </label>
                                    <Inp value={cuit} onChange={e => setCuit(e.target.value)} placeholder="Ej: 20-12345678-9" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: ct2, display: 'block', marginBottom: 5 }}>
                                        Dirección <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span>
                                    </label>
                                    <Inp value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Av. Corrientes 1234, CABA" />
                                </div>
                                <SaveBtn onClick={guardarEmpresa} disabled={savingEmpresa} ok={savedOk} okLabel="¡Guardado!" label="Guardar datos" icon={Save} />
                                {saveError && <p style={{ fontSize: 11, color: '#DC2626', textAlign: 'center', margin: 0 }}>{saveError}</p>}
                                <p style={{ fontSize: 10, color: ct3, textAlign: 'center', margin: 0 }}>💾 Se guarda en tu cuenta.</p>
                            </div>
                        </div>
                    </div>

                    {/* ═══ COLUMNA 3 ═══ */}
                    <div className="config-col">
                        {/* CANALES DE VENTA */}
                        <div style={{ background: '#EAEAEA', borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: 'clamp(14px,3vw,20px) clamp(14px,3vw,24px)' }}>
                            <SectionTitle icon={Tag} title="Canales de Venta" desc="Categorías para clasificar tus ventas" />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12, minHeight: 32 }}>
                                {canales.length === 0
                                    ? <p style={{ fontSize: 11, color: ct3, fontStyle: 'italic', margin: 0 }}>Aún no agregaste canales.</p>
                                    : canales.map((canal, idx) => (
                                        <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: accentL, border: `1px solid rgba(51,65,57,.18)`, fontSize: 11, fontWeight: 600, color: accent }}>
                                            <span>{canal}</span>
                                            <button onClick={() => eliminarCanal(idx)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF' }}>
                                                <X size={11} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ))
                                }
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                <input
                                    type="text"
                                    value={nuevoCanal}
                                    onChange={e => setNuevoCanal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && agregarCanal()}
                                    placeholder="Local, Web..."
                                    style={{ flex: 1, minWidth: 0, height: 34, padding: '0 10px', fontSize: 12, color: ct1, background: '#fff', border: `1px solid ${border}`, borderRadius: 8, outline: 'none', fontFamily: "'Inter',sans-serif" }}
                                />
                                <button onClick={agregarCanal} disabled={!nuevoCanal.trim()}
                                    style={{ height: 34, width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: nuevoCanal.trim() ? accent : 'rgba(48,54,47,.08)', border: 'none', cursor: nuevoCanal.trim() ? 'pointer' : 'default', color: nuevoCanal.trim() ? '#fff' : ct3, flexShrink: 0 }}>
                                    <Plus size={15} strokeWidth={2.5} />
                                </button>
                            </div>
                            <SaveBtn onClick={guardarCanales} disabled={savingCanales} ok={canalesSavedOk} okLabel="¡Guardado!" label="Guardar canales" icon={Save} />
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div style={{ marginTop: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingBottom: 24 }}>
                    <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src="/333.png" alt="Gestify Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 800, color: '#111827', letterSpacing: '-.02em', margin: '0 0 2px 0' }}>Gestify</p>
                        <p style={{ fontSize: 10, color: '#6B7280', margin: 0, fontWeight: 500 }}>v2.0.1 (SaaS Build)</p>
                    </div>
                </div>

            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes kpiIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        
        .config-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            align-items: start;
        }

        @media (min-width: 768px) {
            .config-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (min-width: 1200px) {
            .config-grid {
                grid-template-columns: repeat(3, 1fr);
                gap: 24px;
            }
        }

        .config-col {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
      `}</style>
        </div>
    )
}

export default Configuracion
