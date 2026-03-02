/**
 * Gestify — Hook de Suscripción (Manual Automático)
 * Decide el estado del usuario en el frontend basado puramente en fechas (trial_until, paid_until).
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useSubscription = () => {
    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    /**
     * Consultar fechas de suscripción directo en Supabase Auth y DB
     */
    const checkStatus = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setSubscription(null)
                return null
            }

            // Consultar base de datos
            let { data, error: dbError } = await supabase
                .from('subscriptions')
                .select('trial_until, paid_until, plan_price')
                .eq('user_id', user.id)
                .maybeSingle()

            if (dbError) {
                console.warn('Advertencia leyendo suscripción:', dbError)
                return fallbackReturn(user)
            }

            // Auto-crear si la bd no tiene el trigger aún y le falta el row
            if (!data) {
                const trialUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                const { data: newData, error: insertError } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: user.id,
                        trial_start_date: new Date().toISOString(),
                        trial_until: trialUntil,
                        plan_price: 14999.00
                    })
                    .select('trial_until, paid_until, plan_price')
                    .single()

                if (insertError) {
                    return fallbackReturn(user)
                }
                data = newData
            }

            return evaluateDates(data, user.email)

        } catch (err) {
            console.error('Error general en useSubscription:', err)
            setError(err.message)
            return fallbackReturn({ email: 'usuario@gestify.com' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        checkStatus()
    }, [checkStatus])

    const fallbackReturn = (user) => {
        const fall = {
            hasAccess: true,
            status: 'trial',
            isTrial: true,
            daysRemaining: 7,
            message: 'Modo desarrollo',
            email: user?.email || '',
            subscription: {}
        }
        setSubscription(fall)
        return fall
    }

    /**
     * Motor de Evaluación de Fechas
     */
    const evaluateDates = (data, email) => {
        const now = new Date()

        // Parsear fechas
        const trialUntilDt = data.trial_until ? new Date(data.trial_until) : new Date(0)
        const paidUntilDt = data.paid_until ? new Date(data.paid_until) : null

        let estado = 'suspended'
        let title = ''
        let daysLeft = 0

        // 1. ¿Está en prueba?
        if (now <= trialUntilDt) {
            estado = 'trial'
            daysLeft = Math.ceil((trialUntilDt - now) / (1000 * 60 * 60 * 24))
            title = `Prueba gratuita: ${daysLeft} días restantes.`
        }
        // 2. ¿Pago vigente?
        else if (paidUntilDt && now <= paidUntilDt) {
            estado = 'active'
            daysLeft = Math.ceil((paidUntilDt - now) / (1000 * 60 * 60 * 24))
            title = `Suscripción activa. Renueva en ${daysLeft} días.`
        }
        // 3. ¿Grace period? (Tolerancia de 7 días luego de vencer el pago)
        else if (paidUntilDt && now <= new Date(paidUntilDt.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            estado = 'grace'
            const limit = new Date(paidUntilDt.getTime() + 7 * 24 * 60 * 60 * 1000)
            daysLeft = Math.ceil((limit - now) / (1000 * 60 * 60 * 24))
            title = `Tu plan venció. Tenés ${daysLeft} días de tolerancia para pagar.`
        }
        // * ¿Grace period tras terminar la prueba? (Asumimos 7 días extra si venció el trial sin pagar)
        else if (!paidUntilDt && now <= new Date(trialUntilDt.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            estado = 'grace'
            const limit = new Date(trialUntilDt.getTime() + 7 * 24 * 60 * 60 * 1000)
            daysLeft = Math.ceil((limit - now) / (1000 * 60 * 60 * 24))
            title = `Tu prueba venció. Tenés ${daysLeft} días para validar tu suscripción.`
        }
        // 4. Suspendido
        else {
            estado = 'suspended'
            title = 'Suscripción expirada o suspendida.'
        }

        const result = {
            hasAccess: estado !== 'suspended', // Suspended se bloquea, Grace y el resto NO.
            isTrial: estado === 'trial',
            status: estado,
            daysRemaining: daysLeft,
            message: title,
            email: email,
            subscription: data
        }

        setSubscription(result)
        return result
    }

    // Ya no hay endpoints de Mobbex o MercadoPago
    const createSubscription = async () => {
        // En nuestro nuevo modelo, esto no hace nada transaccional por backend.
        return true
    }

    const getCheckoutUrl = async () => {
        return null
    }

    const cancelSubscription = async () => {
        return true
    }

    return {
        subscription,
        loading,
        error,
        status: subscription?.status || 'loading',
        hasAccess: subscription?.hasAccess || false,
        isTrial: subscription?.isTrial || false,
        daysRemaining: subscription?.daysRemaining || 0,
        message: subscription?.message || '',
        email: subscription?.email || '',

        // Exportamos la info cruda si la necesitamos
        rawSubscription: subscription?.subscription || null,

        checkStatus,
        createSubscription,
        getCheckoutUrl,
        cancelSubscription
    }
}
