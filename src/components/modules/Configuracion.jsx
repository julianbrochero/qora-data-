"use client"

import React, { useState } from "react"
import { useSubscriptionContext } from "../../lib/SubscriptionContext"
import { User, Save, Zap, LogOut, Building2, CheckCircle, Tag, Plus, X, CreditCard, AlertTriangle } from "lucide-react"
import { useAuth } from "../../lib/AuthContext"
import { MenuIcon } from "@nimbus-ds/icons"

/* ══════════════════════════════════════════
   PALETA NIMBUS (ESTÉTICA LIMPIA Y COMPACTA)
══════════════════════════════════════════ */
const C = {
  pageBg:     "#f8f9fb",
  bg:         "#ffffff",
  border:     "#d1d5db",
  borderMd:   "#9ca3af",
  primary:    "#334139",
  primaryHov: "#2b352f",
  primarySurf:"#eaf0eb",
  successTxt: "#065f46", successSurf: "#d1fae5", successBord: "#6ee7b7",
  warnTxt:    "#92400e", warnSurf:    "#fef3c7", warnBord:    "#fcd34d",
  dangerTxt:  "#991b1b", dangerSurf:  "#fee2e2", dangerBord:  "#fca5a5",
  textBlack:  "#0d0d0d",
  textDark:   "#111827",
  textMid:    "#6b7280",
  textLight:  "#9ca3af",
}

const RESPONSIVE = `
  .pn-show-mobile { display: none; }
  .pn-hide-mobile { display: flex; }
  @media (max-width: 767px) {
    .pn-show-mobile { display: flex !important; }
    .pn-hide-mobile { display: none !important; }
  }
`

/* ── Subcomponentes TiendaNube Compactos ── */
const ToggleSwitch = ({ enabled, onChange }) => (
    <button type="button" onClick={onChange} aria-pressed={enabled}
        style={{
            position: 'relative', display: 'inline-flex', height: 24, width: 42, alignItems: 'center', borderRadius: 20,
            transition: 'background-color .2s', outline: 'none', cursor: 'pointer', border: 'none',
            background: enabled ? C.successTxt : "#d1d5db", flexShrink: 0
        }}>
        <span style={{ display: 'inline-block', height: 18, width: 18, transform: `translateX(${enabled ? 20 : 3}px)`, borderRadius: '50%', background: '#fff', transition: 'transform .2s', boxShadow: '0 2px 4px rgba(0,0,0,.2)' }} />
    </button>
)

const SectionTitle = ({ icon: Icon, title, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={16} strokeWidth={2.5} style={{ color: C.textDark }} />
        </div>
        <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textBlack, margin: 0, fontFamily: "'Inter', sans-serif" }}>{title}</h3>
            {desc && <p style={{ fontSize: 11, color: C.textMid, margin: '2px 0 0', lineHeight: 1.3 }}>{desc}</p>}
        </div>
    </div>
)

const Inp = ({ value, onChange, placeholder, disabled }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={e => !disabled && (e.target.style.borderColor = C.primary)}
        onBlur={e => !disabled && (e.target.style.borderColor = C.border)}
        style={{ 
            width: '100%', height: 32, padding: '0 12px', fontSize: 12, color: C.textDark, 
            background: disabled ? '#f3f4f6' : '#fff', border: `1px solid ${C.border}`, borderRadius: 6, 
            outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box',
            transition: 'border-color 0.15s'
        }}
    />
)

const TnButton = ({ onClick, disabled, ok, okLabel, label, icon: Icon, danger, secondary, width = "100%" }) => {
    let bg = C.primary;
    let color = "#fff";
    let border = "none";
    if (secondary) { bg = "#fff"; color = C.textDark; border = `1px solid ${C.border}` }
    if (danger) { bg = "#fff"; color = C.dangerTxt; border = `1px solid ${C.dangerBord}` }
    if (ok) { bg = C.successTxt; color = "#fff"; border = "none" }
    if (disabled && !ok) { bg = C.pageBg; color = C.textMid; border = `1px solid ${C.border}` }
    
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, 
                height: 32, width, padding: '0 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, 
                border, cursor: disabled ? 'default' : 'pointer', transition: 'all .15s',
                background: hov && !disabled && !ok && secondary ? '#f9fafb' : bg, color,
                fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap'
            }}>
            {ok ? <><CheckCircle size={14} /> {okLabel}</> : disabled ? 'Procesando...' : <>{Icon && <Icon size={14} />} {label}</>}
        </button>
    )
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const Configuracion = ({ onOpenMobileSidebar }) => {
    const { status, daysRemaining, isTrial, isPro, getCheckoutUrl } = useSubscriptionContext()
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
        } catch { setSaveError('Error al guardar. Revisá tu conexión.') }
        finally { setSavingEmpresa(false) }
    }

    /* ── Canales ── */
    const [canales, setCanales] = useState(() => {
        try {
            const fromMeta = meta.canales_venta
            if (fromMeta && Array.isArray(fromMeta)) return fromMeta
            const fromLS = localStorage.getItem('gestify_canales_venta')
            if (fromLS) return JSON.parse(fromLS)
        } catch { } return []
    })
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
        } catch (e) { console.error(e) }
        finally { setSavingCanales(false) }
    }

    /* ── Stock ── */
    const [bajoStockActivo, setBajoStockActivo] = useState(() => {
        try { return localStorage.getItem('gestify_bajo_stock_activo') !== 'false' } catch { return true }
    })
    const [bajoStockUmbral, setBajoStockUmbral] = useState(() => {
        try { return parseInt(localStorage.getItem('gestify_bajo_stock_umbral')) || 5 } catch { return 5 }
    })
    const [stockSavedOk, setStockSavedOk] = useState(false)

    const guardarStock = () => {
        try {
            localStorage.setItem('gestify_bajo_stock_activo', String(bajoStockActivo))
            localStorage.setItem('gestify_bajo_stock_umbral', String(bajoStockUmbral))
        } catch { }
        setStockSavedOk(true); setTimeout(() => setStockSavedOk(false), 2500)
    }

    /* ── Suscripción ── */
    const planActivo = isPro || status === 'active'
    const planTrial = status === 'trial'
    const progreso = planActivo ? Math.max(0, Math.min(100, ((30 - daysRemaining) / 30) * 100)) : 0
    const handleSubscribe = () => window.location.href = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b658460a7699475eb06b492b25e0160a'

    return (
        <div style={{ width: '100%', minHeight: '100vh', background: C.pageBg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>
            <style>{RESPONSIVE}</style>

            {/* ── Mobile topbar ── */}
            <div className="pn-show-mobile" style={{
                alignItems: "center", gap: 10, padding: "10px 16px",
                background: C.bg, borderBottom: `1px solid ${C.border}`
            }}>
                <button onClick={onOpenMobileSidebar} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
                <MenuIcon size={20} color={C.textBlack} />
                </button>
                <span style={{ fontWeight: 600, fontSize: 16, color: C.textBlack }}>Configuración</span>
            </div>

            {/* ── Desktop header ── */}
            <div className="pn-hide-mobile" style={{ background: C.bg, padding: '16px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textBlack, letterSpacing: "-0.3px" }}>Configuración</h1>
                </div>
            </div>

            {/* ── Settings Grid Compacto ── */}
            <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                <div className="config-grid">

                    {/* COLUMNA 1 */}
                    <div className="config-col">
                        {/* SUSCRIPCION */}
                        <div className="tn-card">
                            <SectionTitle icon={CreditCard} title="Suscripción" desc="Detalles de tu plan actual" />
                            <div style={{ background: '#f9fafb', borderRadius: 8, border: `1px solid ${C.border}`, padding: '12px', marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: planActivo ? C.successTxt : planTrial ? C.warnBord : C.dangerTxt }} />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: C.textDark }}>
                                            {planActivo ? 'Pro' : planTrial ? 'Prueba Gratuita' : 'Plan Vencido'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: C.textMid }}>$ 14.999 / mes</span>
                                </div>
                                <p style={{ fontSize: 11, color: C.textMid, lineHeight: 1.4, margin: '0 0 10px 0' }}>
                                    {planActivo ? `Tu cuota se renueva en ${daysRemaining} días.` : planTrial ? `Te quedan ${daysRemaining} días gratis.` : `Finalizó el período. Aboná para reactivar.`}
                                </p>
                                {planActivo && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, color: C.textMid }}>Período actual</span>
                                            <span style={{ fontSize: 10, color: C.textMid }}>{daysRemaining} d. restantes</span>
                                        </div>
                                        <div style={{ height: 4, background: C.border, borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: 10, background: progreso > 80 ? C.dangerTxt : progreso > 50 ? C.warnBord : C.successTxt, width: `${progreso}%` }} />
                                        </div>
                                    </>
                                )}
                            </div>
                            {!planActivo && (
                                <TnButton label="Suscribirme Ahora" icon={Zap} onClick={handleSubscribe} disabled={loadingSub} />
                            )}
                        </div>

                        {/* MI CUENTA */}
                        <div className="tn-card">
                            <SectionTitle icon={User} title="Cuenta" desc="Datos de tu usuario administrador" />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.primarySurf, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: C.primary }}>
                                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: C.textDark, margin: 0 }}>{user?.user_metadata?.full_name || 'Administrador'}</p>
                                    <p style={{ fontSize: 11, color: C.textMid, margin: 0 }}>{user?.email}</p>
                                </div>
                            </div>
                            <TnButton secondary danger label="Cerrar sesión" icon={LogOut} onClick={signOut} />
                        </div>
                    </div>

                    {/* COLUMNA 2 */}
                    <div className="config-col">
                        {/* EMPRESA */}
                        <div className="tn-card">
                            <SectionTitle icon={Building2} title="Datos de la Empresa" desc="Se usarán en presupuestos y comprobantes" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 500, color: C.textDark, display: 'block', marginBottom: 4 }}>Nombre comercial <span style={{color: C.dangerTxt}}>*</span></label>
                                    <Inp value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ej: Mi Negocio" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 500, color: C.textDark, display: 'block', marginBottom: 4 }}>CUIT / DNI</label>
                                    <Inp value={cuit} onChange={e => setCuit(e.target.value)} placeholder="Ej: 20-33444555-6" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 500, color: C.textDark, display: 'block', marginBottom: 4 }}>Dirección</label>
                                    <Inp value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Av. San Martín 123" />
                                </div>
                                {saveError && <p style={{ fontSize: 11, color: C.dangerTxt, margin: '0 0 -4px 0' }}>{saveError}</p>}
                                <div style={{ paddingTop: 4 }}>
                                    <TnButton label="Guardar datos" icon={Save} onClick={guardarEmpresa} disabled={savingEmpresa} ok={savedOk} okLabel="Guardado" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA 3 */}
                    <div className="config-col">
                        {/* INVENTARIO */}
                        <div className="tn-card">
                            <SectionTitle icon={AlertTriangle} title="Stock" desc="Avisos de inventario escaso" />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                                <div>
                                    <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: C.textDark }}>Activar alertas</p>
                                    <p style={{ margin: 0, fontSize: 11, color: C.textMid }}>Rojo si hay poco stock</p>
                                </div>
                                <ToggleSwitch enabled={bajoStockActivo} onChange={() => setBajoStockActivo(v => !v)} />
                            </div>
                            <div style={{ paddingTop: 12, opacity: bajoStockActivo ? 1 : 0.4, transition: '0.2s', marginBottom: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 500, color: C.textDark, display: 'block', marginBottom: 4 }}>Unidades mínimas</label>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <Inp value={bajoStockUmbral} onChange={e => setBajoStockUmbral(parseInt(e.target.value)||0)} disabled={!bajoStockActivo} />
                                    <span style={{ fontSize: 11, color: C.textMid, whiteSpace: 'nowrap' }}>unid. / límite</span>
                                </div>
                            </div>
                            <TnButton label="Guardar" icon={Save} onClick={guardarStock} ok={stockSavedOk} okLabel="Guardado" />
                        </div>

                        {/* CANALES DE VENTA */}
                        <div className="tn-card">
                            <SectionTitle icon={Tag} title="Canales de Venta" desc="Etiquetas predefinidas" />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                {canales.length === 0 ? (
                                    <p style={{ fontSize: 11, color: C.textMid, margin: 0 }}>No hay canales.</p>
                                ) : (
                                    canales.map((canal, idx) => (
                                        <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, background: '#f3f4f6', border: `1px solid ${C.border}`, fontSize: 11, fontWeight: 500, color: C.textDark }}>
                                            {canal}
                                            <button onClick={() => eliminarCanal(idx)} style={{ display: 'flex', padding: 0, background: 'none', border: 'none', cursor: 'pointer', color: C.textMid }}>
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                                <div style={{ flex: 1 }}>
                                    <Inp value={nuevoCanal} onChange={e => setNuevoCanal(e.target.value)} placeholder="Ej: Instagram..." />
                                </div>
                                <button onClick={agregarCanal} disabled={!nuevoCanal.trim()}
                                    style={{ height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: nuevoCanal.trim() ? C.primary : '#f3f4f6', border: 'none', cursor: nuevoCanal.trim() ? 'pointer' : 'default', color: nuevoCanal.trim() ? '#fff' : C.borderMd, transition: 'all .1s', flexShrink: 0 }}>
                                    <Plus size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                            <TnButton label="Guardar" icon={Save} onClick={guardarCanales} disabled={savingCanales} ok={canalesSavedOk} okLabel="Guardado" />
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', paddingTop: 20 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: C.textLight }}>Gestify V2.0.3 (Compact Nimbus UI)</p>
                </div>
            </div>

            <style>{`
        .config-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            align-items: start;
        }
        @media (min-width: 768px) {
            .config-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
            .config-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
        }
        .config-col {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .tn-card {
            background: #fff;
            border-radius: 8px;
            border: 1px solid ${C.border};
            padding: 20px;
        }
      `}</style>
        </div>
    )
}

export default Configuracion
