/**
 * Gestify — TrialBanner
 * Banner minimalista durante el período de prueba.
 */

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'

const TrialBanner = ({ daysRemaining }) => {
    const [dismissed, setDismissed] = useState(false)
    const { createSubscription, status } = useSubscriptionContext()
    const [loading, setLoading] = useState(false)

    if (dismissed || status === 'active') return null

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
            background: '#282A28',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            padding: '7px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            zIndex: 50,
        }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.75)', letterSpacing: '.01em' }}>
                Prueba gratuita · <strong style={{ color: '#fff', fontWeight: 700 }}>{daysRemaining} día{daysRemaining !== 1 ? 's' : ''}</strong> restante{daysRemaining !== 1 ? 's' : ''}
            </span>

            <button
                onClick={handleSubscribe}
                disabled={loading}
                style={{
                    padding: '3px 12px',
                    borderRadius: 5,
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                    background: '#6366F1', // Púrpura/Índigo (estilo Stripe/Vercel)
                    color: '#fff',
                    opacity: loading ? .6 : 1,
                    transition: 'background .13s',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '.01em',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#4F46E5'}
                onMouseLeave={e => e.currentTarget.style.background = '#6366F1'}
            >
                {loading ? 'Cargando...' : 'Suscribirme'}
            </button>

            <button
                onClick={() => setDismissed(true)}
                style={{
                    position: 'absolute', right: 10,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,.4)', padding: 4,
                    display: 'flex', alignItems: 'center',
                    transition: 'color .13s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.8)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.4)'}
            >
                <X size={13} />
            </button>
        </div>
    )
}

export default TrialBanner
