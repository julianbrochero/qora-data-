/**
 * Gestify — Hook de Suscripción
 * Consulta y gestiona el estado de suscripción del usuario.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Helper: obtener token actual
    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token
    }

    // Helper: fetch autenticado
    const authFetch = async (endpoint, options = {}) => {
        const token = await getToken()
        if (!token) throw new Error('No autenticado')

        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...(options.headers || {}),
            },
        })

        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.detail?.message || data.detail || 'Error del servidor')
        }

        return data
    }

    /**
     * Consultar estado de suscripción
     */
    const checkStatus = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await authFetch('/api/subscriptions/status')
            setSubscription(data)
            return data
        } catch (err) {
            // Si es 401, no es un error de suscripción sino de auth
            if (err.message?.includes('No autenticado')) {
                setSubscription(null)
                return null
            }
            setError(err.message)
            // Si no hay backend disponible, verificar directamente en Supabase
            return await checkStatusFallback()
        } finally {
            setLoading(false)
        }
    }, [])

    /**
     * Fallback: consultar directamente en Supabase (cuando el backend no está)
     */
    const checkStatusFallback = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data, error: dbError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle()

            if (dbError) {
                console.warn('Error consultando suscripción:', dbError)
                // Si la tabla no existe aún, dar acceso libre (desarrollo)
                const fallback = {
                    has_access: true,
                    status: 'trial',
                    is_trial: true,
                    days_remaining: 7,
                    message: 'Modo desarrollo — acceso libre',
                }
                setSubscription(fallback)
                return fallback
            }

            if (!data) {
                const noSub = {
                    has_access: false,
                    status: 'no_subscription',
                    is_trial: false,
                    days_remaining: 0,
                    message: 'No tienes una suscripción.',
                }
                setSubscription(noSub)
                return noSub
            }

            // Calcular acceso
            const now = new Date()
            const status = data.subscription_status

            if (status === 'trial') {
                const trialEnd = new Date(data.trial_end_date)
                const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)))
                const result = {
                    has_access: daysLeft > 0,
                    status: daysLeft > 0 ? 'trial' : 'expired',
                    is_trial: true,
                    days_remaining: daysLeft,
                    trial_end_date: data.trial_end_date,
                    message: daysLeft > 0
                        ? `Prueba gratuita: ${daysLeft} días restantes.`
                        : 'Tu prueba gratuita ha expirado.',
                    subscription: data,
                }
                setSubscription(result)
                return result
            }

            if (status === 'active') {
                const result = {
                    has_access: true,
                    status: 'active',
                    is_trial: false,
                    days_remaining: 30,
                    message: 'Suscripción activa.',
                    subscription: data,
                }
                setSubscription(result)
                return result
            }

            // past_due, cancelled, expired
            const result = {
                has_access: false,
                status,
                is_trial: false,
                days_remaining: 0,
                message: 'Tu suscripción no está activa.',
                subscription: data,
            }
            setSubscription(result)
            return result

        } catch (err) {
            console.warn('Fallback error:', err)
            // En desarrollo, dar acceso libre
            const dev = {
                has_access: true,
                status: 'trial',
                is_trial: true,
                days_remaining: 7,
                message: 'Modo desarrollo',
            }
            setSubscription(dev)
            return dev
        }
    }

    /**
     * Crear suscripción (iniciar trial + vincular MP)
     */
    const createSubscription = async () => {
        try {
            setLoading(true)
            const data = await authFetch('/api/subscriptions/create', {
                method: 'POST',
            })

            // Si recibimos init_point, redirigir a checkout de MP
            if (data.init_point) {
                window.location.href = data.init_point
                return data
            }

            // Refrescar estado
            await checkStatus()
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    /**
     * Cancelar suscripción
     */
    const cancelSubscription = async () => {
        try {
            setLoading(true)
            const data = await authFetch('/api/subscriptions/cancel', {
                method: 'POST',
            })
            await checkStatus()
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    /**
     * Obtener URL de checkout
     */
    const getCheckoutUrl = async () => {
        try {
            const data = await authFetch('/api/subscriptions/checkout-url')
            return data.init_point
        } catch (err) {
            setError(err.message)
            return null
        }
    }

    // Consultar al montar
    useEffect(() => {
        checkStatus()
    }, [checkStatus])

    return {
        subscription,
        loading,
        error,
        hasAccess: subscription?.has_access ?? true, // default true en dev
        isTrial: subscription?.is_trial ?? false,
        status: subscription?.status ?? 'loading',
        daysRemaining: subscription?.days_remaining ?? 0,
        checkStatus,
        createSubscription,
        cancelSubscription,
        getCheckoutUrl,
    }
}
