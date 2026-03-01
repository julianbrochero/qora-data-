/**
 * Gestify — TrialBanner
 * Banner durante el período de prueba.
 * NO se muestra si la suscripción ya está activa.
 */

import React, { useState } from 'react'
import { Clock, X, Zap } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'

const TrialBanner = ({ daysRemaining }) => {
    const [dismissed, setDismissed] = useState(false)
    const { createSubscription, status } = useSubscriptionContext()
    const [loading, setLoading] = useState(false)

    // No mostrar si ya pagó o si fue cerrado
    if (dismissed || status === 'active') return null

    const isUrgent = daysRemaining <= 2
    const bgColor = isUrgent ? '#FEF3C7' : 'rgba(51,65,57,.06)'
    const borderColor = isUrgent ? '#FCD34D' : 'rgba(51,65,57,.12)'
    const textColor = isUrgent ? '#92400E' : '#30362F'
    const accentColor = isUrgent ? '#92400E' : '#334139'

    const handleSubscribe = async () => {
        if (loading) return
        setLoading(true)
        try {
            await createSubscription()
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            background: bgColor,
            borderBottom: `1px solid ${borderColor}`,
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            zIndex: 50,
        }}>
            <Clock size={14} style={{ color: accentColor, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>
                {isUrgent
                    ? `⚠️ Tu prueba gratuita termina ${daysRemaining === 0 ? 'hoy' : `en ${daysRemaining} día${daysRemaining > 1 ? 's' : ''}`}. ¡Suscribite para no perder tus datos!`
                    : `Prueba gratuita · ${daysRemaining} día${daysRemaining > 1 ? 's' : ''} restante${daysRemaining > 1 ? 's' : ''}`
                }
            </span>
            <button
                onClick={handleSubscribe}
                disabled={loading}
                style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 12px', borderRadius: 6,
                    border: 'none', cursor: loading ? 'wait' : 'pointer',
                    fontSize: 11, fontWeight: 700,
                    background: '#DCED31', color: '#282A28',
                    transition: 'opacity .13s',
                    opacity: loading ? .6 : 1,
                }}
            >
                <Zap size={11} strokeWidth={2.5} />
                {loading ? 'Cargando...' : 'Suscribirme'}
            </button>
            <button
                onClick={() => setDismissed(true)}
                style={{
                    position: 'absolute', right: 12,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: textColor, opacity: .5, padding: 4,
                    display: 'flex',
                }}
            >
                <X size={14} />
            </button>
        </div>
    )
}

export default TrialBanner
