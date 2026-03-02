/**
 * Gestify — SubscriptionExpired
 * Pantalla de "Suscripción vencida" con pago manual por WhatsApp.
 * No hay pasarela de pago — el usuario manda comprobante y el admin activa desde Supabase.
 */

import React from 'react'
import { ShieldOff, LogOut, MessageCircle, CheckCircle } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import { useAuth } from '../../lib/AuthContext'

const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'

const WHATSAPP_NUMBER = '5493534087718'

const SubscriptionExpired = ({ status = 'expired' }) => {
    const { email } = useSubscriptionContext()
    const { logout, user } = useAuth()

    const userEmail = email || user?.email || ''

    const handleWhatsApp = () => {
        const text = `Hola Gestify! 👋\n\nQuiero activar mi suscripción mensual.\n📧 Email: ${userEmail}\n\nAdjunto comprobante de pago.`
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank')
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
                {/* Header */}
                <div style={{
                    background: '#282A28', padding: '24px 28px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <img src="/logogestify3.png" alt="Gestify" style={{ height: 28 }} />
                </div>

                {/* Badge */}
                <div style={{ padding: '24px 28px 0' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 8,
                        background: '#FEF3C7', border: '1px solid #F59E0B30',
                    }}>
                        <ShieldOff size={14} style={{ color: '#B45309' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>
                            Suscripción vencida
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 28px 8px' }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: ct1, lineHeight: 1.2, marginBottom: 8, letterSpacing: '-.03em' }}>
                        Tu período de prueba expiró
                    </h1>
                    <p style={{ fontSize: 13, color: ct3, lineHeight: 1.5, marginBottom: 20 }}>
                        Para continuar usando Gestify Pro, activá tu suscripción enviando el comprobante de pago por WhatsApp. Lo activamos al instante.
                    </p>

                    {/* Datos bancarios */}
                    <div style={{
                        background: 'rgba(51,65,57,.04)', border: '1px solid rgba(51,65,57,.12)',
                        borderRadius: 14, padding: '16px 20px', marginBottom: 16,
                    }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
                            Plan Gestify Pro · $14.999/mes
                        </p>

                        <div style={{ marginBottom: 8 }}>
                            <p style={{ fontSize: 10, color: ct3, marginBottom: 2 }}>Transferí a</p>
                            <p style={{ fontSize: 14, fontWeight: 700, color: ct1 }}>Alias: <span style={{ color: accent }}>gestify.pagos</span></p>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(51,65,57,.1)', paddingTop: 12 }}>
                            {[
                                'Facturación y cobros ilimitados',
                                'Gestión de clientes y productos',
                                'Control de caja y reportes',
                                'Pedidos y presupuestos',
                            ].map((feat, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <CheckCircle size={13} style={{ color: accent, flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, fontWeight: 500, color: ct2 }}>{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA WhatsApp */}
                    <button
                        onClick={handleWhatsApp}
                        style={{
                            width: '100%', height: 46, borderRadius: 10,
                            background: '#25D366', color: '#fff',
                            border: 'none',
                            fontSize: 14, fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            fontFamily: "'Inter', sans-serif",
                            transition: 'filter .15s, transform .1s',
                            marginBottom: 10,
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(.92)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(.98)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <MessageCircle size={17} strokeWidth={2.5} />
                        Pagar y enviar comprobante por WhatsApp
                    </button>

                    <p style={{ fontSize: 10, color: ct3, textAlign: 'center', marginBottom: 6 }}>
                        Enviá el comprobante y te activamos el plan en minutos ⚡
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 28px', borderTop: '1px solid rgba(48,54,47,.08)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <span style={{ fontSize: 10, color: ct3 }}>{userEmail}</span>
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
