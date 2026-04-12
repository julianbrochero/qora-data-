import React, { useState } from 'react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import TrialBanner from './TrialBanner'
import WelcomeTrialModal from './WelcomeTrialModal'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import { Lock, AlertTriangle, CreditCard, Mail, LogOut } from 'lucide-react'

const SUPPORT_EMAIL = 'brocherojulian72@gmail.com'

/* ── Modal bloqueante: cuenta suspendida manualmente ── */
const SuspendedBlockingModal = ({ email }) => {
    const handleEmail = () => {
        const subject = encodeURIComponent('Solicitud de reactivación - Gestify PRO')
        const body = encodeURIComponent(`Hola,\n\nMi cuenta fue suspendida y quisiera comunicarme.\n\nEmail de la cuenta: ${email}\n\nGracias.`)
        window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, '_blank')
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,20,15,0.6)', backdropFilter: 'blur(8px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: 20,
        }}>
            <style>{`@keyframes sg-up { from { transform: translateY(20px) scale(.97); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
            <div style={{
                width: '100%', maxWidth: 420,
                background: '#fff', borderRadius: 20,
                border: '1px solid #e5e7eb',
                boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                animation: 'sg-up .28s cubic-bezier(.22,.97,.56,1)',
            }}>
                {/* Header */}
                <div style={{ padding: '32px 32px 24px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: '#fef2f2', border: '1px solid #fecaca',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <Lock size={22} color="#dc2626" strokeWidth={1.8} />
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                        Cuenta suspendida
                    </h2>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                        Tu acceso fue bloqueado. Comunicate con soporte para regularizar tu situación.
                    </p>
                </div>

                {/* Actions */}
                <div style={{ padding: '24px 32px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button onClick={handleEmail} style={{
                        width: '100%', height: 44, borderRadius: 10,
                        background: '#334139', color: '#fff',
                        border: 'none', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8,
                        fontFamily: "'Inter', sans-serif", transition: 'background .13s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#2a3530'}
                        onMouseLeave={e => e.currentTarget.style.background = '#334139'}
                    >
                        <Mail size={15} /> Contactar soporte
                    </button>
                    <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                        {SUPPORT_EMAIL}
                    </p>
                </div>
            </div>
        </div>
    )
}

/* ── Modal bloqueante: suscripción expirada ── */
const ExpiredModal = ({ onLogout, mpLoading, onMercadoPago }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,20,15,0.6)', backdropFilter: 'blur(8px)',
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: 20,
    }}>
        <style>{`@keyframes sg-up { from { transform: translateY(20px) scale(.97); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
        <div style={{
            width: '100%', maxWidth: 420,
            background: '#fff', borderRadius: 20,
            border: '1px solid #e5e7eb',
            boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            animation: 'sg-up .28s cubic-bezier(.22,.97,.56,1)',
        }}>
            {/* Header */}
            <div style={{ padding: '32px 32px 24px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: '#fffbeb', border: '1px solid #fde68a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                }}>
                    <AlertTriangle size={22} color="#d97706" strokeWidth={1.8} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                    Suscripción expirada
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                    Tu período de prueba o plan PRO ha finalizado. Suscribite para seguir usando Gestify.
                </p>
            </div>

            {/* Price */}
            <div style={{ padding: '20px 32px 0', textAlign: 'center' }}>
                <div style={{
                    background: '#f8f9fb', borderRadius: 10,
                    border: '1px solid #e5e7eb', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 16,
                }}>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 2 }}>Plan Gestify PRO</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>Acceso completo · Sin límites</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>$14.999<span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>/mes</span></div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '8px 32px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={onMercadoPago} disabled={mpLoading} style={{
                    width: '100%', height: 46, borderRadius: 10,
                    background: '#009EE3', color: '#fff', border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: mpLoading ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: "'Inter', sans-serif", transition: 'filter .13s',
                    boxShadow: '0 4px 12px rgba(0,158,227,0.25)',
                }}
                    onMouseEnter={e => { if (!mpLoading) e.currentTarget.style.filter = 'brightness(1.08)' }}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                >
                    <CreditCard size={16} />
                    {mpLoading ? 'Cargando...' : 'Suscribirme con Mercado Pago'}
                </button>
                <button onClick={onLogout} style={{
                    width: '100%', height: 40, borderRadius: 10,
                    background: 'transparent', color: '#9ca3af',
                    border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    fontFamily: "'Inter', sans-serif", transition: 'all .13s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'transparent' }}
                >
                    <LogOut size={14} /> Cerrar sesión
                </button>
            </div>
        </div>
    </div>
)

const SubscriptionGate = ({ children }) => {
    const { status, loading, daysRemaining, email, isPro, userId, manuallySuspended, checkStatus } = useSubscriptionContext()
    const { logout } = useAuth()
    const [mpLoading, setMpLoading] = useState(false)

    const handleMercadoPago = async () => {
        setMpLoading(true)
        try { window.location.href = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b658460a7699475eb06b492b25e0160a" }
        catch (e) { alert(`Hubo un error: ${e.message}`) }
        finally { setMpLoading(false) }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fb', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <img src="/favicon.png" alt="Gestify" style={{ height: 48, objectFit: 'contain', marginBottom: 20, opacity: 0.9 }} />
                    <div style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#334139', borderRadius: '50%', animation: 'sg-spin .8s linear infinite', margin: '0 auto 14px' }} />
                    <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500, margin: 0 }}>Verificando suscripción...</p>
                    <style>{`@keyframes sg-spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            </div>
        )
    }

    const showWelcomeModal = status === 'new_user'

    if (manuallySuspended && status === 'suspended') {
        return <SuspendedBlockingModal email={email} />
    }

    if (status === 'suspended' && !manuallySuspended) {
        return <ExpiredModal onLogout={logout} mpLoading={mpLoading} onMercadoPago={handleMercadoPago} />
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <TrialBanner daysRemaining={daysRemaining} />
            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>{children}</div>
            {showWelcomeModal && (
                <WelcomeTrialModal userId={userId} onTrialStarted={() => checkStatus()} />
            )}
        </div>
    )
}

export default SubscriptionGate
