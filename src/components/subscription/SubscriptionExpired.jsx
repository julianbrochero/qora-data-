/**
 * Gestify — SubscriptionExpired
 * Pantalla de bloqueo cuando la suscripción venció / fue cancelada.
 * Impide el acceso al sistema con un CTA para suscribirse.
 */

import React, { useState } from 'react'
import { ShieldOff, Zap, LogOut, CreditCard, AlertTriangle } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import { useAuth } from '../../lib/AuthContext'

const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'

const statusConfig = {
    expired: {
        icon: ShieldOff,
        title: 'Tu prueba gratuita ha expirado',
        subtitle: 'Suscribite a Gestify Pro para seguir gestionando tu negocio.',
        color: '#92400E',
        bg: '#FEF3C7',
    },
    past_due: {
        icon: AlertTriangle,
        title: 'Pago pendiente',
        subtitle: 'No pudimos procesar tu último pago. Actualizá tu método de pago para continuar.',
        color: '#DC2626',
        bg: '#FEE2E2',
    },
    cancelled: {
        icon: ShieldOff,
        title: 'Suscripción cancelada',
        subtitle: 'Tu suscripción fue cancelada. Podés reactivarla en cualquier momento.',
        color: '#6B7280',
        bg: '#F3F4F6',
    },
    no_subscription: {
        icon: Zap,
        title: '¡Bienvenido a Gestify!',
        subtitle: 'Empezá tu prueba gratuita de 7 días y gestioná tu negocio como un profesional.',
        color: accent,
        bg: 'rgba(51,65,57,.06)',
    },
}

const SubscriptionExpired = ({ status = 'expired' }) => {
    const { createSubscription, getCheckoutUrl } = useSubscriptionContext()
    const { logout, user } = useAuth()
    const [loading, setLoading] = useState(false)

    const config = statusConfig[status] || statusConfig.expired
    const Icon = config.icon

    const handleSubscribe = async () => {
        setLoading(true)
        try {
            if (status === 'no_subscription') {
                await createSubscription()
            } else {
                const url = await getCheckoutUrl()
                if (url) window.location.href = url
                else await createSubscription()
            }
        } catch (err) {
            alert('Error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #F5F5F5 0%, #E8E8E6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: 20,
        }}>
            <div style={{
                width: '100%', maxWidth: 440,
                background: '#fff',
                borderRadius: 20,
                border: '1px solid rgba(48,54,47,.1)',
                boxShadow: '0 8px 40px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04)',
                overflow: 'hidden',
            }}>
                {/* Header con logo */}
                <div style={{
                    background: '#282A28', padding: '24px 28px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <img src="/logogestify3.png" alt="Gestify" style={{ height: 28 }} />
                </div>

                {/* Status badge */}
                <div style={{ padding: '24px 28px 0' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 8,
                        background: config.bg, border: `1px solid ${config.color}30`,
                    }}>
                        <Icon size={14} style={{ color: config.color }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: config.color }}>
                            {status === 'no_subscription' ? 'Nuevo' : status === 'past_due' ? 'Pago pendiente' : 'Expirado'}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 28px 8px' }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: ct1, lineHeight: 1.2, marginBottom: 8, letterSpacing: '-.03em' }}>
                        {config.title}
                    </h1>
                    <p style={{ fontSize: 13, color: ct3, lineHeight: 1.5, marginBottom: 20 }}>
                        {config.subtitle}
                    </p>

                    {/* Plan card */}
                    <div style={{
                        background: 'rgba(51,65,57,.04)', border: '1px solid rgba(51,65,57,.12)',
                        borderRadius: 14, padding: '16px 20px', marginBottom: 20,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Plan Gestify Pro</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <span style={{ fontSize: 32, fontWeight: 800, color: ct1, letterSpacing: '-.04em' }}>$14.999</span>
                                    <span style={{ fontSize: 12, fontWeight: 500, color: ct3 }}>/mes</span>
                                </div>
                            </div>
                            <span style={{
                                padding: '4px 8px', borderRadius: 6,
                                background: '#DCED31', color: '#282A28',
                                fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                            }}>
                                7 días gratis
                            </span>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(51,65,57,.1)', paddingTop: 12 }}>
                            {[
                                'Facturación y cobros ilimitados',
                                'Gestión de clientes y productos',
                                'Control de caja y reportes',
                                'Pedidos y presupuestos',
                                'Soporte prioritario',
                            ].map((feat, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(51,65,57,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 10, color: accent }}>✓</span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 500, color: ct2 }}>{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleSubscribe}
                        disabled={loading}
                        style={{
                            width: '100%', height: 44, borderRadius: 10,
                            background: '#DCED31', color: '#282A28',
                            border: '2px solid #282A28',
                            fontSize: 13, fontWeight: 800,
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: loading ? .7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            fontFamily: "'Inter', sans-serif",
                            transition: 'transform .1s, opacity .13s',
                            marginBottom: 10,
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(.98)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <CreditCard size={15} strokeWidth={2.5} />
                        {loading
                            ? 'Procesando...'
                            : status === 'no_subscription'
                                ? 'Empezar prueba gratuita'
                                : 'Suscribirme ahora'
                        }
                    </button>

                    <p style={{ fontSize: 10, color: ct3, textAlign: 'center', marginBottom: 6 }}>
                        Aceptamos tarjeta de crédito y débito vía Mercado Pago
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 28px', borderTop: '1px solid rgba(48,54,47,.08)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <span style={{ fontSize: 10, color: ct3 }}>
                        {user?.email || ''}
                    </span>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: ct3, fontSize: 11, fontWeight: 600,
                            transition: 'color .13s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c62828'}
                        onMouseLeave={e => e.currentTarget.style.color = ct3}
                    >
                        <LogOut size={12} />
                        Cerrar sesión
                    </button>
                </div>
            </div>

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
        </div>
    )
}

export default SubscriptionExpired
