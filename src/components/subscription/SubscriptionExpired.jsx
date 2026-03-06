import React, { useState } from 'react'
import { ShieldOff, LogOut, CreditCard } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const ct1 = '#1e2320'
const ct3 = '#8B8982'
const accent = '#334139'

const SubscriptionExpired = () => {
    const { email, userId, checkStatus } = useSubscriptionContext()
    const { logout, user } = useAuth()
    const [mpLoading, setMpLoading] = useState(false)
    const [couponCode, setCouponCode] = useState('')
    const [couponStatus, setCouponStatus] = useState(null)
    const userEmail = email || user?.email || ''

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

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F5F5F5 0%, #E8E8E6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif", padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, border: '1px solid rgba(48,54,47,.1)', boxShadow: '0 8px 40px rgba(0,0,0,.08)', overflow: 'hidden' }}>
                <div style={{ background: '#282A28', padding: '22px 28px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src="/logogestify3.png" alt="Gestify" style={{ height: 28 }} />
                </div>

                <div style={{ padding: '22px 28px 0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#FEF3C7', border: '1px solid #F59E0B30' }}>
                        <ShieldOff size={14} style={{ color: '#B45309' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>Plan expirado</span>
                    </div>
                </div>

                <div style={{ padding: '14px 28px 20px' }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: ct1, letterSpacing: '-.03em', marginBottom: 8, lineHeight: 1.2 }}>
                        Activá tu suscripción mensual
                    </h1>
                    <p style={{ fontSize: 13, color: ct3, lineHeight: 1.5, marginBottom: 22 }}>
                        Tu período de prueba expiró. Para continuar usando Gestify Pro suscribite fácil con Mercado Pago.
                    </p>

                    <div style={{ background: 'rgba(51,65,57,.04)', border: '1px solid rgba(51,65,57,.12)', borderRadius: 14, padding: '14px 18px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Plan Gestify Pro</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span style={{ fontSize: 28, fontWeight: 800, color: ct1, letterSpacing: '-.04em' }}>$14.999</span>
                                <span style={{ fontSize: 12, color: ct3 }}>/mes</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: ct3, lineHeight: 1.5 }}>
                                <div>✓ Facturación ilimitada</div>
                                <div>✓ Pedidos y presupuestos</div>
                                <div>✓ Control de caja</div>
                                <div>✓ Soporte prioritario</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input type="text" placeholder="¿Tenés un cupón?" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={couponStatus === 'loading' || couponStatus === 'success'} style={{ flex: 1, height: 44, borderRadius: 8, border: '1px solid #E5E7EB', padding: '0 14px', fontSize: 13, background: '#F9FAFB', outline: 'none' }} />
                            <button onClick={handleApplyCoupon} disabled={!couponCode.trim() || couponStatus === 'loading' || couponStatus === 'success'} style={{ height: 44, padding: '0 16px', borderRadius: 8, background: couponCode.trim() ? '#374151' : '#E5E7EB', color: couponCode.trim() ? '#fff' : '#9CA3AF', border: 'none', fontSize: 12, fontWeight: 600, cursor: couponCode.trim() ? 'pointer' : 'not-allowed', transition: 'all .15s' }}>
                                {couponStatus === 'loading' ? 'Verificando...' : 'Aplicar'}
                            </button>
                        </div>
                        {couponStatus === 'error' && <p style={{ color: '#DC2626', fontSize: 11, margin: '6px 0 0', fontWeight: 500 }}>Cupón inválido.</p>}
                        {couponStatus === 'success' && <p style={{ color: '#059669', fontSize: 11, margin: '6px 0 0', fontWeight: 600 }}>¡Activando cuenta!</p>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ flex: 1, height: 1, background: '#E5E7EB' }}></div>
                        <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>O suscribite con MP</span>
                        <div style={{ flex: 1, height: 1, background: '#E5E7EB' }}></div>
                    </div>

                    <button onClick={handleMercadoPago} disabled={mpLoading || couponStatus === 'success'} style={{ width: '100%', height: 46, borderRadius: 10, background: '#009EE3', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: (mpLoading || couponStatus === 'success') ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Inter', sans-serif", transition: 'filter .13s, transform .1s', marginBottom: 10, boxShadow: '0 4px 12px rgba(0, 158, 227, .25)' }} onMouseEnter={e => { if (!mpLoading) e.currentTarget.style.filter = 'brightness(1.1)' }} onMouseLeave={e => { if (!mpLoading) e.currentTarget.style.filter = 'none' }}>
                        {mpLoading ? 'Cargando Mercado Pago...' : '💳 Suscribirse con Mercado Pago'}
                    </button>
                    <p style={{ fontSize: 10, color: ct3, textAlign: 'center' }}>Suscripción automática y segura ⚡</p>
                </div>

                <div style={{ padding: '12px 28px', borderTop: '1px solid rgba(48,54,47,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: ct3 }}>{userEmail}</span>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: ct3, fontSize: 11, fontWeight: 600 }} onMouseEnter={e => e.currentTarget.style.color = '#c62828'} onMouseLeave={e => e.currentTarget.style.color = ct3}>
                        <LogOut size={12} /> Cerrar sesión
                    </button>
                </div>
            </div>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
        </div>
    )
}

export default SubscriptionExpired
