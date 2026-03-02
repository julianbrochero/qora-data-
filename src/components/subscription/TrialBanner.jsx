/**
 * Gestify — TrialBanner
 * Banner minimalista durante el período de prueba.
 * Informa cuántos días quedan y cómo activar cuando venza.
 */

import React, { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'

const WHATSAPP_NUMBER = '5493534087718'

const TrialBanner = ({ daysRemaining }) => {
    const [dismissed, setDismissed] = useState(false)
    const { status, email } = useSubscriptionContext()

    if (dismissed || status === 'active') return null

    const handleWhatsApp = () => {
        const text = `Hola Gestify! 👋\n\nQuiero activar mi suscripción mensual.\n📧 Email: ${email}\n\nAdjunto comprobante de pago.`
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank')
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
                onClick={handleWhatsApp}
                style={{
                    padding: '3px 10px',
                    borderRadius: 5,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                    background: '#25D366',
                    color: '#fff',
                    transition: 'filter .13s',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '.01em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(.88)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
                <MessageCircle size={11} />
                Activar plan
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
