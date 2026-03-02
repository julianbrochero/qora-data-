/**
 * Gestify — SubscriptionGate
 * Controla el acceso al sistema y muestra banners/modales según el estado.
 * - new_user: Modal de bienvenida para iniciar trial
 * - trial: Banner con días restantes
 * - active (PRO): Banner verde PRO
 * - grace: Banner amarillo
 * - suspended: Banner rojo
 */

import React, { useState } from 'react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import TrialBanner from './TrialBanner'
import PaymentModal from './PaymentModal'
import WelcomeTrialModal from './WelcomeTrialModal'
import { AlertTriangle, AlertCircle, Crown } from 'lucide-react'

const SubscriptionGate = ({ children }) => {
    const { status, loading, daysRemaining, email, isPro, userId, checkStatus } = useSubscriptionContext()
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

    // Usuario nuevo — mostrar modal de bienvenida
    if (status === 'new_user') {
        return (
            <WelcomeTrialModal
                userId={userId}
                onTrialStarted={() => checkStatus()}
            />
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Banner Trial (solo si NO es PRO) */}
            {status === 'trial' && !isPro && <TrialBanner daysRemaining={daysRemaining} />}

            {/* Banner PRO activo */}
            {status === 'active' && isPro && (
                <div style={{
                    background: 'linear-gradient(90deg, #282A28 0%, #334139 100%)',
                    borderBottom: '1px solid rgba(220,237,49,.2)',
                    padding: '6px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 10,
                    zIndex: 50, position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: '#DCED31', padding: '2px 8px', borderRadius: 4,
                        }}>
                            <Crown size={10} color="#282A28" />
                            <span style={{ fontSize: 10, fontWeight: 900, color: '#282A28', letterSpacing: '.04em' }}>PRO</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.7)' }}>
                            Gestify PRO activo
                        </span>
                    </div>
                </div>
            )}

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
                            {isPro ? 'Tu plan PRO venció' : 'Tu prueba venció'}. Tenés {daysRemaining} días antes de la suspensión.
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

            <PaymentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                userEmail={email}
            />
        </div>
    )
}

export default SubscriptionGate
