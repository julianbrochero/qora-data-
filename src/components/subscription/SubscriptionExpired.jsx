/**
 * Gestify — SubscriptionExpired
 * Pantalla de vencimiento con modal de pago manual por transferencia + WhatsApp.
 */

import React, { useState } from 'react'
import { ShieldOff, LogOut, CreditCard } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import { useAuth } from '../../lib/AuthContext'
import PaymentModal from './PaymentModal'

const ct1 = '#1e2320'
const ct3 = '#8B8982'
const accent = '#334139'

const SubscriptionExpired = () => {
    const { email } = useSubscriptionContext()
    const { logout, user } = useAuth()
    const [modalOpen, setModalOpen] = useState(false)

    const userEmail = email || user?.email || ''

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #F5F5F5 0%, #E8E8E6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: 20,
        }}>
            <div style={{
                width: '100%', maxWidth: 420,
                background: '#fff', borderRadius: 20,
                border: '1px solid rgba(48,54,47,.1)',
                boxShadow: '0 8px 40px rgba(0,0,0,.08)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{ background: '#282A28', padding: '22px 28px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src="/logogestify3.png" alt="Gestify" style={{ height: 28 }} />
                </div>

                {/* Badge */}
                <div style={{ padding: '22px 28px 0' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 8,
                        background: '#FEF3C7', border: '1px solid #F59E0B30',
                    }}>
                        <ShieldOff size={14} style={{ color: '#B45309' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>Plan expirado</span>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '14px 28px 20px' }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: ct1, letterSpacing: '-.03em', marginBottom: 8, lineHeight: 1.2 }}>
                        Activá tu suscripción mensual
                    </h1>
                    <p style={{ fontSize: 13, color: ct3, lineHeight: 1.5, marginBottom: 22 }}>
                        Tu período de prueba expiró. Para continuar usando Gestify Pro realizá una transferencia y envianos el comprobante.
                    </p>

                    {/* Plan card resumida */}
                    <div style={{
                        background: 'rgba(51,65,57,.04)', border: '1px solid rgba(51,65,57,.12)',
                        borderRadius: 14, padding: '14px 18px', marginBottom: 18,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
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

                    {/* CTA principal */}
                    <button
                        onClick={() => setModalOpen(true)}
                        style={{
                            width: '100%', height: 46, borderRadius: 10,
                            background: '#334139', color: '#fff', border: 'none',
                            fontSize: 14, fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            fontFamily: "'Inter', sans-serif",
                            transition: 'background .13s, transform .1s',
                            marginBottom: 10,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#283330'}
                        onMouseLeave={e => e.currentTarget.style.background = '#334139'}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(.98)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <CreditCard size={16} />
                        Ver datos de pago y activar
                    </button>

                    <p style={{ fontSize: 10, color: ct3, textAlign: 'center' }}>
                        Pago manual por transferencia · Activación en minutos ⚡
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
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c62828'}
                        onMouseLeave={e => e.currentTarget.style.color = ct3}
                    >
                        <LogOut size={12} /> Cerrar sesión
                    </button>
                </div>
            </div>

            <PaymentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                userEmail={userEmail}
            />

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
        </div>
    )
}

export default SubscriptionExpired
