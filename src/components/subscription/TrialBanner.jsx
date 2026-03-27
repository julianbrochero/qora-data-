/**
 * Gestify — TrialBanner
 * Solo se muestra cuando quedan ≤ 7 días de prueba o de plan PRO.
 * Cuando el usuario acaba de pagar (status === 'active' por primera vez),
 * muestra una notificación de bienvenida PRO que se auto-cierra.
 */

import React, { useState, useEffect, useRef } from 'react'
import { X, Crown, CreditCard, Zap } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'

// ─── Constantes ────────────────────────────────────────────────────────────────
const MP_URL = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b658460a7699475eb06b492b25e0160a'
const WARN_DAYS = 7           // Solo avisar cuando quedan ≤ 7 días
const PRO_TOAST_KEY = 'gestify_pro_toast_shown' // localStorage key

// ─── ProActivatedToast ─────────────────────────────────────────────────────────
// Mini toast que aparece en la esquina al activar el plan PRO.
const ProActivatedToast = ({ onClose }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Entrada suave
        const t1 = setTimeout(() => setVisible(true), 50)
        // Auto-cierre a los 5 segundos
        const t2 = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 350)
        }, 5000)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [onClose])

    return (
        <>
            <style>{`
                @keyframes pro-toast-in  { from { transform: translateY(16px); opacity: 0 } to { transform: none; opacity: 1 } }
                @keyframes pro-toast-out { from { opacity: 1 } to { opacity: 0; transform: translateY(8px) } }
                @keyframes pro-shimmer {
                    0%   { background-position: -200% center }
                    100% { background-position:  200% center }
                }
            `}</style>

            <div style={{
                position: 'fixed',
                bottom: 28, right: 28,
                zIndex: 99999,
                fontFamily: "'Inter', -apple-system, sans-serif",
                animation: visible ? 'pro-toast-in .3s cubic-bezier(.22,1,.36,1) forwards' : 'pro-toast-out .3s ease forwards',
            }}>
                <div style={{
                    background: '#111713',
                    border: '1px solid rgba(74,222,128,.2)',
                    borderRadius: 16,
                    padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    boxShadow: '0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(74,222,128,.08)',
                    minWidth: 280, maxWidth: 340,
                    position: 'relative',
                }}>
                    {/* Ícono */}
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, #4ADE80 0%, #c8d828 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 14px rgba(74,222,128,.35)',
                    }}>
                        <Crown size={20} color="#1a2218" strokeWidth={2.2} />
                    </div>

                    {/* Texto */}
                    <div style={{ flex: 1 }}>
                        <p style={{
                            fontSize: 13, fontWeight: 800, color: '#fff',
                            margin: '0 0 2px', letterSpacing: '-.02em',
                        }}>
                            ¡Plan PRO activado!{' '}
                            <span style={{
                                background: 'linear-gradient(90deg, #4ADE80, #c8d828, #4ADE80)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                animation: 'pro-shimmer 2.5s linear infinite',
                            }}>✦</span>
                        </p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', margin: 0 }}>
                            Tenés acceso completo a Gestify PRO.
                        </p>
                    </div>

                    {/* Cerrar */}
                    <button
                        onClick={() => { setVisible(false); setTimeout(onClose, 350) }}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,.3)', padding: 4, display: 'flex',
                            flexShrink: 0,
                            transition: 'color .13s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.3)'}
                    >
                        <X size={14} />
                    </button>

                    {/* Barra de progreso de auto‑cierre */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 16, right: 16,
                        height: 2, borderRadius: 1,
                        background: 'rgba(255,255,255,.06)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            background: '#4ADE80',
                            borderRadius: 1,
                            animation: 'pro-shrink 5s linear forwards',
                        }} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pro-shrink {
                    from { width: 100% }
                    to   { width: 0% }
                }
            `}</style>
        </>
    )
}


// ─── TrialBanner (aviso de días restantes) ─────────────────────────────────────
const TrialBanner = ({ daysRemaining }) => {
    const [dismissed, setDismissed] = useState(false)
    const [showProToast, setShowProToast] = useState(false)
    const prevStatusRef = useRef(null)
    const { status, isPro } = useSubscriptionContext()

    // Detectar transición a 'active' (acaba de pagar)
    useEffect(() => {
        const prev = prevStatusRef.current
        if (prev && prev !== 'active' && status === 'active') {
            // Verificar que no se haya mostrado ya en esta sesión
            const alreadyShown = sessionStorage.getItem(PRO_TOAST_KEY)
            if (!alreadyShown) {
                sessionStorage.setItem(PRO_TOAST_KEY, '1')
                setShowProToast(true)
            }
        }
        prevStatusRef.current = status
    }, [status])

    // ── Toast PRO ──────────────────────────────────────────────────────────────
    if (showProToast) {
        return <ProActivatedToast onClose={() => setShowProToast(false)} />
    }

    // ── No mostrar si no aplica ────────────────────────────────────────────────
    // Solo mostrar en trial O en plan PRO por vencer (grace o active con ≤7 días)
    const shouldShow = !dismissed && (
        (status === 'trial' && daysRemaining <= WARN_DAYS) ||
        (status === 'grace') ||
        (status === 'active' && isPro && daysRemaining <= WARN_DAYS)
    )

    if (!shouldShow) return null

    const isCritical = daysRemaining <= 2
    const isProExpiring = (status === 'active' || status === 'grace') && isPro

    return (
        <>
            <style>{`
                @keyframes banner-in { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: none } }
                .gtf-sub-btn:hover { filter: brightness(.88) !important; }
            `}</style>

            <div style={{
                background: isCritical ? '#1a100a' : '#1a1f18',
                borderBottom: `1px solid ${isCritical ? 'rgba(251,113,0,.18)' : 'rgba(74,222,128,.1)'}`,
                padding: '6px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10,
                fontFamily: "'Inter', -apple-system, sans-serif",
                position: 'relative', zIndex: 50,
                animation: 'banner-in .25s ease',
            }}>
                {/* Punto de estado */}
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isCritical ? '#f97316' : '#4ADE80',
                    boxShadow: isCritical
                        ? '0 0 6px rgba(249,115,22,.6)'
                        : '0 0 6px rgba(74,222,128,.5)',
                    flexShrink: 0,
                }} />

                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>
                    {isProExpiring ? (
                        status === 'grace'
                            ? <>Plan PRO vencido · <strong style={{ color: isCritical ? '#fb923c' : '#fff' }}>Quedan {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}</strong> antes del bloqueo</>
                            : <>Plan PRO · <strong style={{ color: isCritical ? '#fb923c' : '#fff' }}>Renueva en {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}</strong></>
                    ) : (
                        <>Prueba gratuita · <strong style={{ color: isCritical ? '#fb923c' : '#fff' }}>{daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}</strong></>
                    )}
                </span>

                <button
                    className="gtf-sub-btn"
                    onClick={() => window.location.href = MP_URL}
                    style={{
                        padding: '3px 11px', borderRadius: 5, border: 'none',
                        cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        background: isCritical ? '#f97316' : '#4ADE80',
                        color: isCritical ? '#fff' : '#1a2218',
                        fontFamily: "'Inter', sans-serif",
                        display: 'flex', alignItems: 'center', gap: 4,
                        transition: 'filter .13s',
                        flexShrink: 0,
                    }}
                >
                    <CreditCard size={10} />
                    {isProExpiring ? 'Renovar' : 'Suscribirme'}
                </button>

                {/* Dismiss */}
                <button
                    onClick={() => setDismissed(true)}
                    style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: 'rgba(255,255,255,.25)', padding: 4,
                        display: 'flex', transition: 'color .13s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.25)'}
                >
                    <X size={12} />
                </button>
            </div>
        </>
    )
}

export default TrialBanner
