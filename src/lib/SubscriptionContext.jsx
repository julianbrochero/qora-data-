/**
 * Gestify — SubscriptionContext
 * Provider global para acceso de suscripción en toda la app.
 */

import { createContext, useContext } from 'react'
import { useSubscription } from '../hooks/useSubscription'

const SubscriptionContext = createContext(null)

export const SubscriptionProvider = ({ children }) => {
    const subscription = useSubscription()

    return (
        <SubscriptionContext.Provider value={subscription}>
            {children}
        </SubscriptionContext.Provider>
    )
}

export const useSubscriptionContext = () => {
    const ctx = useContext(SubscriptionContext)
    if (!ctx) {
        throw new Error('useSubscriptionContext debe usarse dentro de SubscriptionProvider')
    }
    return ctx
}
