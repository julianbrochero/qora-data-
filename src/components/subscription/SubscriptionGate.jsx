/**
 * Gestify — SubscriptionGate
 * Controla el acceso al sistema basado en el estado de suscripción.
 * Envuelve el contenido principal y muestra pantallas alternativas si no hay acceso.
 */

import React from 'react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import SubscriptionExpired from './SubscriptionExpired'
import TrialBanner from './TrialBanner'

const SubscriptionGate = ({ children }) => {
    const { hasAccess, isTrial, status, loading, daysRemaining } = useSubscriptionContext()

    // Loading
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

    // Sin acceso: mostrar pantalla de bloqueo
    if (!hasAccess && status !== 'loading') {
        return <SubscriptionExpired status={status} />
    }

    // Con acceso: mostrar contenido + banner de trial si aplica
    return (
        <>
            {isTrial && <TrialBanner daysRemaining={daysRemaining} />}
            {children}
        </>
    )
}

export default SubscriptionGate
