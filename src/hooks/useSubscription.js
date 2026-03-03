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

            // Si no existe fila (trigger no la creó), crear con trial_until = NULL
            // para que muestre el modal de bienvenida
            if (!data) {
                const { data: newData, error: insertError } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: user.id,
                        trial_start_date: new Date().toISOString(),
                        trial_until: null,
                        plan_price: 14999.00
                    })
                    .select('trial_until, paid_until, plan_price')
                    .single()

                if (insertError) {
                    console.warn('Error creando suscripción, intentando leer de nuevo:', insertError)
                    // Tal vez el trigger ya la creó pero no la podemos leer aún
                    const { data: retryData } = await supabase
                        .from('subscriptions')
                        .select('trial_until, paid_until, plan_price')
                        .eq('user_id', user.id)
                        .maybeSingle()

                    if (retryData) {
                        data = retryData
                    } else {
                        return fallbackReturn(user)
                    }
                } else {
                    data = newData
                }
            }

            return evaluateDates(data, user.email, user.id)

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
     * Prioridad: new_user > paid_until (PRO) > trial_until > grace > suspended
     */
    const evaluateDates = (data, email, userId) => {
        const now = new Date()

        const trialUntilDt = data.trial_until ? new Date(data.trial_until) : null
        const paidUntilDt = data.paid_until ? new Date(data.paid_until) : null

        let estado = 'suspended'
        let title = ''
        let daysLeft = 0
        let isPro = false
        let trialDaysLeft = 0

        // 0. ¿Usuario nuevo? (no inició trial ni pagó)
        if (!trialUntilDt && !paidUntilDt) {
            const result = {
                hasAccess: false,
                isTrial: false,
                isPro: false,
                isNewUser: true,
                trialDaysLeft: 0,
                status: 'new_user',
                daysRemaining: 0,
                message: 'Bienvenido — iniciá tu prueba gratuita.',
                email: email,
                userId: userId,
                subscription: data
            }
            setSubscription(result)
            return result
        }

        // Calcular días restantes de trial
        if (trialUntilDt && now <= trialUntilDt) {
            trialDaysLeft = Math.ceil((trialUntilDt - now) / (1000 * 60 * 60 * 24))
        }

        // 1. ¿Pago vigente? (PRIORIDAD — si pagó, es PRO sin importar el trial)
        if (paidUntilDt && now <= paidUntilDt) {
            estado = 'active'
            isPro = true
            daysLeft = Math.ceil((paidUntilDt - now) / (1000 * 60 * 60 * 24))
            title = `Gestify PRO activo. Renueva en ${daysLeft} días.`
        }
        // 2. ¿Está en prueba? (solo si no pagó)
        else if (now <= trialUntilDt) {
            estado = 'trial'
            daysLeft = trialDaysLeft
            title = `Prueba gratuita: ${daysLeft} días restantes.`
        }
        // 3. ¿Grace period tras vencer el pago?
        else if (paidUntilDt && now <= new Date(paidUntilDt.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            estado = 'grace'
            isPro = true // Fue PRO, está en gracia
            const limit = new Date(paidUntilDt.getTime() + 7 * 24 * 60 * 60 * 1000)
            daysLeft = Math.ceil((limit - now) / (1000 * 60 * 60 * 24))
            title = `Tu plan PRO venció. Tenés ${daysLeft} días de tolerancia para pagar.`
        }
        // 4. ¿Grace period tras terminar la prueba sin pagar?
        else if (!paidUntilDt && now <= new Date(trialUntilDt.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            estado = 'grace'
            const limit = new Date(trialUntilDt.getTime() + 7 * 24 * 60 * 60 * 1000)
            daysLeft = Math.ceil((limit - now) / (1000 * 60 * 60 * 24))
            title = `Tu prueba venció. Tenés ${daysLeft} días para activar tu suscripción.`
        }
        // 5. Suspendido
        else {
            estado = 'suspended'
            title = 'Suscripción expirada o suspendida.'
        }

        const result = {
            hasAccess: estado !== 'suspended',
            isTrial: estado === 'trial',
            isPro: isPro,
            isNewUser: false,
            trialDaysLeft: trialDaysLeft,
            status: estado,
            daysRemaining: daysLeft,
            message: title,
            email: email,
            userId: userId,       // ← ESTABA FALTANDO — causa que el pago no se guarde
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
        isPro: subscription?.isPro || false,
        isNewUser: subscription?.isNewUser || false,
        userId: subscription?.userId || null,
        trialDaysLeft: subscription?.trialDaysLeft || 0,
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
