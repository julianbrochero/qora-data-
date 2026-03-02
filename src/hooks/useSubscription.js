/**
 * Gestify — Hook de Suscripción
 * Consulta y gestiona el estado de suscripción del usuario.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const hasCheckedPayment = useRef(false)

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
            const errMsg = typeof data.detail === 'string' ? data.detail : data.detail?.message || JSON.stringify(data.detail) || 'Error del servidor'
            throw new Error(errMsg)
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
            if (err.message?.includes('No autenticado')) {
                setSubscription(null)
                return null
            }
            setError(err.message)
            return await checkStatusFallback()
        } finally {
            setLoading(false)
        }
    }, [])

    /**
     * Fallback: consultar directamente en Supabase
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

            const now = new Date()
            const status = data.subscription_status

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
     * Confirmar pago exitoso (cuando el usuario vuelve de MP)
     */
    const confirmPayment = async () => {
        try {
            const data = await authFetch('/api/subscriptions/confirm-payment', {
                method: 'POST',
            })
            console.log('✅ Pago confirmado:', data)
            // Actualizar estado local inmediatamente
            if (data.has_access) {
                setSubscription(data)
            }
            return data
        } catch (err) {
            console.warn('Error confirmando pago:', err)
            // Fallback: refrescar estado
            await checkStatus()
        }
    }

    /**
     * Crear suscripción (iniciar trial + generar checkout)
     */
    const createSubscription = async () => {
        try {
            setLoading(true)
            const data = await authFetch('/api/subscriptions/create-subscription', {
                method: 'POST',
            })

            // Si recibimos init_point, redirigir a checkout de Mobbex
            if (data.init_point) {
                window.location.href = data.init_point
                return data
            }

            // Si ya está activo, no hacer nada más
            if (data.status === 'active') {
                await checkStatus()
                return data
            }

            await checkStatus()
            return data
        } catch (err) {
            console.error('❌ Error createSubscription:', err)
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

    // Al montar: consultar estado + verificar retorno de MP
    useEffect(() => {
        const init = async () => {
            // Verificar si volvemos de MP con pago exitoso
            const urlParams = new URLSearchParams(window.location.search)
            const paymentStatus = urlParams.get('payment') || urlParams.get('status')
            const collectionStatus = urlParams.get('collection_status')

            if ((paymentStatus === 'success' || paymentStatus === 'approved' || collectionStatus === 'approved') && !hasCheckedPayment.current) {
                hasCheckedPayment.current = true
                console.log('🎉 Retorno de MP con pago exitoso, confirmando...')

                // Limpiar URL
                window.history.replaceState({}, '', window.location.pathname)

                // Confirmar pago en el backend
                await confirmPayment()
            } else {
                await checkStatus()
            }
        }
        init()
    }, [checkStatus])

    return {
        subscription,
        loading,
        error,
        hasAccess: subscription?.has_access ?? true,
        isTrial: subscription?.is_trial ?? false,
        status: subscription?.status ?? 'loading',
        daysRemaining: subscription?.days_remaining ?? 0,
        checkStatus,
        createSubscription,
        cancelSubscription,
        getCheckoutUrl,
        confirmPayment,
    }
}
