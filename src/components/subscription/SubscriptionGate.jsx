/**
 * Gestify — SubscriptionGate
 * Controla el acceso al sistema y muestra banners según el estado.
 * Grace period y suspended muestran modal de pago, no bloquean el acceso.
 */

import React, { useState } from 'react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import TrialBanner from './TrialBanner'
import PaymentModal from './PaymentModal'
import { AlertTriangle, AlertCircle } from 'lucide-react'

const SubscriptionGate = ({ children }) => {
    const { status, loading, daysRemaining, email } = useSubscriptionContext()
    const [modalOpen, setModalOpen] = useState(false)

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Banner Trial */}
            {status === 'trial' && <TrialBanner daysRemaining={daysRemaining} />}

            {/* Banner Grace Period */}
            {status === 'grace' && (
                <div style={{
                    background: '#FEF3C7', borderBottom: '1px solid #FCD34D',
                    padding: '10px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 14, flexWrap: 'wrap',
                    zIndex: 50, position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400E' }}>
                        <AlertTriangle size={16} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>
                            Tu plan venció. Tenés {daysRemaining} días antes de que se suspenda tu acceso.
                        </span>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        style={{
                            background: '#D97706', color: 'white', border: 'none',
                            padding: '5px 14px', borderRadius: 6, fontSize: 11,
                            fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        Ver datos de pago
                    </button>
                </div>
            )}

            {/* Banner Suspended */}
            {status === 'suspended' && (
                <div style={{
                    background: '#450a0a', borderBottom: '1px solid #7f1d1d',
                    padding: '10px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 14, flexWrap: 'wrap',
                    zIndex: 50, position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fca5a5' }}>
                        <AlertCircle size={16} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>
                            Cuenta suspendida — solo lectura. Las acciones de escritura están bloqueadas.
                        </span>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        style={{
                            background: '#25D366', color: 'white', border: 'none',
                            padding: '5px 14px', borderRadius: 6, fontSize: 11,
                            fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        Regularizar suscripción
                    </button>
                </div>
            )}

            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {children}
            </div>

            {/* Modal de pago unificado */}
            <PaymentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                userEmail={email}
            />
        </div>
    )
}

export default SubscriptionGate
