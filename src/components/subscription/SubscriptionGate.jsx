import React, { useState } from 'react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import TrialBanner from './TrialBanner'
import WelcomeTrialModal from './WelcomeTrialModal'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import { AlertTriangle, AlertCircle, Crown, Shield, Copy, CheckCircle, MessageCircle, Lock, Mail, CreditCard, Key, LogOut } from 'lucide-react'

const SUPPORT_EMAIL = 'brocherojulian72@gmail.com'

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
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: 20,
        }}>
            <div style={{
                width: '100%', maxWidth: 460,
                background: '#fff', borderRadius: 24,
                boxShadow: '0 32px 100px rgba(0,0,0,.35)',
                overflow: 'hidden',
                maxHeight: '90vh', overflowY: 'auto',
                animation: 'sbmSlideUp .3s ease',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                    padding: '28px 28px 22px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
                    <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.03)' }} />
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '2px solid rgba(255,255,255,.15)' }}>
                        <Lock size={26} color="#fca5a5" />
                    </div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.03em', margin: '0 0 6px' }}>Cuenta suspendida</h1>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', margin: 0, lineHeight: 1.5 }}>Tu acceso fue bloqueado por falta de pago.</p>
                </div>

                <div style={{ padding: 'clamp(16px, 4vw, 22px) clamp(16px, 5vw, 28px) clamp(20px, 5vw, 28px)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 18 }}>
                            Por favor comunicate con soporte para regularizar tu situación y volver a disfrutar de Gestify sin límites.
                        </p>
                        <button onClick={handleEmail} style={{ width: '100%', height: 42, borderRadius: 10, background: 'transparent', color: '#374151', border: '1.5px solid #D1D5DB', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'border-color .13s, background .13s', marginBottom: 14 }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#334139'; e.currentTarget.style.background = 'rgba(51,65,57,.04)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = 'transparent' }}>
                            <Mail size={14} /> Contactar soporte por email
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes sbmSlideUp { from { transform: translateY(30px) scale(.96); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
        </div>
    )
}

const SubscriptionGate = ({ children }) => {
    const { status, loading, daysRemaining, email, isPro, userId, manuallySuspended, checkStatus } = useSubscriptionContext()
    const { logout } = useAuth()
    const [mpLoading, setMpLoading] = useState(false)

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return
        setCouponStatus('loading')
        try {
            const validCoupons = ['GRATISPRO', '100USD', 'LANZAMIENTOFREE', 'DEVFREE', 'GRATIS']
            if (validCoupons.includes(couponCode.toUpperCase().trim())) {
                const paidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                const { error } = await supabase.from('subscriptions').update({ paid_until: paidUntil, mp_status: 'active' }).eq('user_id', userId)
                if (error) throw error
                setCouponStatus('success')
                setTimeout(() => checkStatus(), 1500)
            } else { setCouponStatus('error') }
        } catch (error) { setCouponStatus('error') }
    }

    const handleMercadoPago = async () => {
        setMpLoading(true)
        try { window.location.href = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=b658460a7699475eb06b492b25e0160a" }
        catch (e) { alert(`Hubo un error: ${e.message}`) }
        finally { setMpLoading(false) }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(51,65,57,.15)', borderTopColor: '#334139', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#30362F' }}>Verificando suscripción...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            </div>
        )
    }

    // new_user: mostrar el sistema de fondo + modal encima (no reemplazar la pantalla)
    const showWelcomeModal = status === 'new_user'

    if (manuallySuspended && status === 'suspended') { return <SuspendedBlockingModal email={email} /> }

    if (status === 'suspended' && !manuallySuspended) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)', fontFamily: "'Inter', -apple-system, sans-serif", padding: 20 }}>
                <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 24, boxShadow: '0 32px 100px rgba(0,0,0,.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto', animation: 'sbmSlideUp .3s ease' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e2320 0%, #334139 50%, #1e2320 100%)', padding: '28px 28px 22px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(220,237,49,.06)' }} />
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(220,237,49,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '2px solid rgba(220,237,49,.2)' }}>
                            <AlertCircle size={26} color="#DCED31" />
                        </div>
                        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.03em', margin: '0 0 6px' }}>Suscripción expirada</h1>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', margin: 0, lineHeight: 1.5 }}>Tu período de prueba o plan PRO ha finalizado.</p>
                    </div>

                    <div style={{ padding: 'clamp(16px, 4vw, 22px) clamp(16px, 5vw, 28px) clamp(20px, 5vw, 28px)' }}>
                        <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '14px 16px', marginBottom: 18, border: '1px solid #FCD34D', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 4px' }}>Activá tu Plan PRO para seguir operando</p>
                                <p style={{ fontSize: 11, color: '#B45309', margin: 0, lineHeight: 1.5 }}>Suscribite de forma segura usando Mercado Pago. Es rápido, fácil e inmediato.</p>
                            </div>
                        </div>

                        {/* Botones de acción principal */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                            <button onClick={handleMercadoPago} disabled={mpLoading} style={{ width: '100%', minHeight: 48, borderRadius: 12, background: '#009EE3', color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: mpLoading ? 'wait' : 'pointer', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .15s', flexWrap: 'wrap', boxShadow: '0 4px 12px rgba(0, 158, 227, .25)' }} onMouseEnter={e => { if (!mpLoading) e.currentTarget.style.filter = 'brightness(1.1)' }} onMouseLeave={e => { if (!mpLoading) e.currentTarget.style.filter = 'none' }}>
                                <CreditCard size={18} /> {mpLoading ? 'Cargando Mercado Pago...' : 'Suscribirme con Mercado Pago'}
                            </button>
                            
                            <button onClick={logout} disabled={mpLoading} style={{ width: '100%', minHeight: 44, borderRadius: 10, background: 'transparent', color: '#6B7280', border: '1.5px solid #E5E7EB', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .13s' }} onMouseEnter={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#F9FAFB' }} onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'transparent' }}>
                                <LogOut size={16} /> Cerrar Sesión
                            </button>
                        </div>


                        <p style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
                            <strong>Plan Gestify PRO · $14.999/mes</strong><br />Acceso completo a todas las funciones sin límites y soporte incluido.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* TrialBanner maneja: trial (≤7d), active PRO (≤7d), grace, y el toast PRO al pagar */}
            <TrialBanner daysRemaining={daysRemaining} />

            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>{children}</div>

            {/* Modal de bienvenida para usuarios nuevos — overlay encima del sistema */}
            {showWelcomeModal && (
                <WelcomeTrialModal userId={userId} onTrialStarted={() => checkStatus()} />
            )}
        </div>
    )
}

export default SubscriptionGate
