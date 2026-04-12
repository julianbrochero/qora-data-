import React, { useState, useEffect, useRef } from 'react'
import { X, Crown, CreditCard, CheckCircle } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'

const MP_URL = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b658460a7699475eb06b492b25e0160a'
const WARN_DAYS = 7
const PRO_TOAST_KEY = 'gestify_pro_toast_shown'

/* ── Toast PRO activado ── */
const ProActivatedToast = ({ onClose }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 50)
        const t2 = setTimeout(() => { setVisible(false); setTimeout(onClose, 300) }, 5000)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [onClose])

    return (
        <>
            <style>{`
                @keyframes pt-in  { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
                @keyframes pt-out { from { opacity: 1 } to { opacity: 0; transform: translateY(8px) } }
                @keyframes pt-shrink { from { width: 100% } to { width: 0% } }
            `}</style>
            <div style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
                fontFamily: "'Inter', -apple-system, sans-serif",
                animation: visible ? 'pt-in .3s cubic-bezier(.22,1,.36,1) forwards' : 'pt-out .3s ease forwards',
            }}>
                <div style={{
                    background: '#fff', border: '1px solid #e5e7eb',
                    borderRadius: 14, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    minWidth: 270, maxWidth: 320, position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: '#eef1ee', border: '1px solid #d4e0d4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Crown size={18} color="#334139" strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                            ¡Plan PRO activado!
                        </p>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                            Tenés acceso completo a Gestify PRO.
                        </p>
                    </div>
                    <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 4, display: 'flex', flexShrink: 0, transition: 'color .13s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
                        onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                    >
                        <X size={13} />
                    </button>
                    {/* Barra de progreso */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#f3f4f6' }}>
                        <div style={{ height: '100%', background: '#334139', borderRadius: 1, animation: 'pt-shrink 5s linear forwards' }} />
                    </div>
                </div>
            </div>
        </>
    )
}

/* ── Banner de aviso de días restantes ── */
const TrialBanner = ({ daysRemaining }) => {
    const [dismissed, setDismissed] = useState(false)
    const [showProToast, setShowProToast] = useState(false)
    const prevStatusRef = useRef(null)
    const { status, isPro } = useSubscriptionContext()

    useEffect(() => {
        const prev = prevStatusRef.current
        if (prev && prev !== 'active' && status === 'active') {
            const alreadyShown = sessionStorage.getItem(PRO_TOAST_KEY)
            if (!alreadyShown) {
                sessionStorage.setItem(PRO_TOAST_KEY, '1')
                setShowProToast(true)
            }
        }
        prevStatusRef.current = status
    }, [status])

    if (showProToast) return <ProActivatedToast onClose={() => setShowProToast(false)} />

    const shouldShow = !dismissed && (
        (status === 'trial' && daysRemaining <= WARN_DAYS) ||
        (status === 'grace') ||
        (status === 'active' && isPro && daysRemaining <= WARN_DAYS)
    )

    if (!shouldShow) return null

    const isCritical = daysRemaining <= 2
    const isProExpiring = (status === 'active' || status === 'grace') && isPro

    const bannerBg     = isCritical ? '#fef2f2' : '#fffbeb'
    const bannerBorder = isCritical ? '#fecaca' : '#fde68a'
    const dotColor     = isCritical ? '#dc2626' : '#d97706'
    const textColor    = isCritical ? '#991b1b' : '#92400e'
    const btnBg        = isCritical ? '#dc2626' : '#334139'

    return (
        <>
            <style>{`@keyframes banner-in { from { opacity: 0; transform: translateY(-3px) } to { opacity: 1; transform: none } }`}</style>
            <div style={{
                background: bannerBg,
                borderBottom: `1px solid ${bannerBorder}`,
                padding: '7px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, position: 'relative', zIndex: 50,
                fontFamily: "'Inter', -apple-system, sans-serif",
                animation: 'banner-in .2s ease',
            }}>
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: dotColor, flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: textColor, fontWeight: 500 }}>
                    {isProExpiring ? (
                        status === 'grace'
                            ? <><strong>Plan PRO vencido</strong> · quedan {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} antes del bloqueo</>
                            : <><strong>Plan PRO</strong> · vence en {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}</>
                    ) : (
                        <><strong>Prueba gratuita</strong> · {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}</>
                    )}
                </span>
                <button onClick={() => window.location.href = MP_URL} style={{
                    padding: '3px 11px', borderRadius: 5, border: 'none',
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    background: btnBg, color: '#fff',
                    fontFamily: "'Inter', sans-serif",
                    display: 'flex', alignItems: 'center', gap: 4,
                    flexShrink: 0, transition: 'filter .13s',
                }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(.9)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                >
                    <CreditCard size={10} />
                    {isProExpiring ? 'Renovar' : 'Suscribirme'}
                </button>
                <button onClick={() => setDismissed(true)} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: dotColor, opacity: 0.5, padding: 4, display: 'flex', transition: 'opacity .13s',
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                >
                    <X size={12} />
                </button>
            </div>
        </>
    )
}

export default TrialBanner
