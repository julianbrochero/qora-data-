/**
 * Gestify — TrialBanner
 * Banner durante el período de prueba. Abre el modal de pago al hacer clic.
 */

import React, { useState } from 'react'
import { X, CreditCard } from 'lucide-react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import PaymentModal from './PaymentModal'

const TrialBanner = ({ daysRemaining }) => {
    const [dismissed, setDismissed] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const { status, email, userId, checkStatus } = useSubscriptionContext()

    if (dismissed || status === 'active') return null

    return (
        <>
            <div style={{
                background: '#282A28',
                borderBottom: '1px solid rgba(255,255,255,.08)',
                padding: '7px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, fontFamily: "'Inter', sans-serif",
                position: 'relative', zIndex: 50,
            }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.75)' }}>
                    Prueba gratuita · <strong style={{ color: '#fff' }}>{daysRemaining} día{daysRemaining !== 1 ? 's' : ''}</strong> restante{daysRemaining !== 1 ? 's' : ''}
                </span>

                <button
                    onClick={() => setModalOpen(true)}
                    style={{
                        padding: '3px 10px', borderRadius: 5, border: 'none',
                        cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        background: '#DCED31', color: '#282A28',
                        fontFamily: "'Inter', sans-serif",
                        display: 'flex', alignItems: 'center', gap: 4,
                        transition: 'filter .13s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(.88)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                >
                    <CreditCard size={11} />
                    Suscribirme
                </button>

                <button
                    onClick={() => setDismissed(true)}
                    style={{
                        position: 'absolute', right: 10, background: 'none', border: 'none',
                        cursor: 'pointer', color: 'rgba(255,255,255,.4)', padding: 4, display: 'flex',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.8)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.4)'}
                >
                    <X size={13} />
                </button>
            </div>

            <PaymentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                userEmail={email}
                userId={userId}
                onProActivated={() => checkStatus()}
            />
        </>
    )
}

export default TrialBanner
