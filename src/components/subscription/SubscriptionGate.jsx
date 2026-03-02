/**
 * Gestify — SubscriptionGate
 * Controla el acceso al sistema y muestra banners según el estado.
 */

import React from 'react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import TrialBanner from './TrialBanner'
import { AlertTriangle, AlertCircle } from 'lucide-react'

const SubscriptionGate = ({ children }) => {
    const { status, loading, daysRemaining, email } = useSubscriptionContext()

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#F5F5F5',
                fontFamily: "'Inter', sans-serif",
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40, height: 40, border: '3px solid rgba(51,65,57,.15)',
                        borderTopColor: '#334139', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto 16px',
                    }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#30362F' }}>Verificando suscripción...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            </div>
        )
    }

    const handleWhatsAppPayment = () => {
        const text = `Hola Gestify, pagué mi plan.\nEmail: ${email}`
        window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(text)}`, '_blank') // PONE ACA TU NUMERO DE WHATSAPP REAL
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Banner Trial */}
            {status === 'trial' && <TrialBanner daysRemaining={daysRemaining} />}

            {/* Banner Grace Period */}
            {status === 'grace' && (
                <div style={{
                    background: '#FEE2E2', borderBottom: '1px solid #FCA5A5',
                    padding: '12px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 16, flexWrap: 'wrap',
                    zIndex: 50, position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#991B1B' }}>
                        <AlertTriangle size={18} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                            Tu plan venció. Tenés {daysRemaining} días para enviar el pago y evitar la suspensión.
                        </span>
                    </div>
                    <button
                        onClick={handleWhatsAppPayment}
                        style={{
                            background: '#25D366', color: 'white', border: 'none',
                            padding: '6px 14px', borderRadius: 6, fontSize: 12,
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        Pagar por WhatsApp
                    </button>
                </div>
            )}

            {/* Banner Suspended */}
            {status === 'suspended' && (
                <div style={{
                    background: '#450a0a', borderBottom: '1px solid #7f1d1d',
                    padding: '12px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 16, flexWrap: 'wrap',
                    zIndex: 50, position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fca5a5' }}>
                        <AlertCircle size={18} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>
                            Cuenta suspendida por falta de pago. Tu acceso de escritura está bloqueado.
                        </span>
                    </div>
                    <button
                        onClick={handleWhatsAppPayment}
                        style={{
                            background: '#25D366', color: 'white', border: 'none',
                            padding: '6px 14px', borderRadius: 6, fontSize: 12,
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        Regularizar Deuda por WhatsApp
                    </button>
                </div>
            )}

            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {children}
            </div>
        </div>
    )
}

export default SubscriptionGate
