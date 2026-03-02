/**
 * Gestify — WelcomeTrialModal
 * Se muestra a usuarios nuevos que aún no iniciaron la prueba gratuita.
 * Al aceptar, se activa el trial de 7 días en Supabase.
 */

import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Sparkles, Check, Zap, BarChart3, FileText, Users, ShoppingCart } from 'lucide-react'

const FEATURES = [
    { icon: FileText, text: 'Facturación profesional' },
    { icon: Users, text: 'Gestión de clientes' },
    { icon: ShoppingCart, text: 'Pedidos y presupuestos' },
    { icon: BarChart3, text: 'Reportes y estadísticas' },
    { icon: Zap, text: 'Control de caja en tiempo real' },
]

const WelcomeTrialModal = ({ userId, onTrialStarted }) => {
    const [loading, setLoading] = useState(false)

    const handleStartTrial = async () => {
        setLoading(true)
        try {
            const trialUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

            const { error } = await supabase
                .from('subscriptions')
                .update({
                    trial_until: trialUntil,
                    trial_start_date: new Date().toISOString(),
                })
                .eq('user_id', userId)

            if (error) throw error
            onTrialStarted()
        } catch (e) {
            console.error('Error iniciando trial:', e)
            // Fallback: intentar insertar si no existe
            try {
                const trialUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                await supabase.from('subscriptions').insert({
                    user_id: userId,
                    trial_start_date: new Date().toISOString(),
                    trial_until: trialUntil,
                    plan_name: 'gestify_pro',
                    plan_price: 14999.00,
                })
                onTrialStarted()
            } catch (e2) {
                console.error('Error en fallback:', e2)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: 20,
        }}>
            <div style={{
                width: '100%', maxWidth: 440,
                background: '#fff', borderRadius: 24,
                boxShadow: '0 32px 100px rgba(0,0,0,.25)',
                overflow: 'hidden',
                animation: 'wtmSlideUp .3s ease',
            }}>
                {/* Header con gradiente */}
                <div style={{
                    background: 'linear-gradient(135deg, #282A28 0%, #334139 50%, #282A28 100%)',
                    padding: '32px 28px 24px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Decorative circles */}
                    <div style={{
                        position: 'absolute', top: -30, right: -30,
                        width: 100, height: 100, borderRadius: '50%',
                        background: 'rgba(220,237,49,.08)',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: -20,
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(220,237,49,.05)',
                    }} />

                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: '#DCED31', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 14px',
                        boxShadow: '0 4px 16px rgba(220,237,49,.3)',
                    }}>
                        <Sparkles size={24} color="#282A28" />
                    </div>

                    <h1 style={{
                        fontSize: 22, fontWeight: 900, color: '#fff',
                        letterSpacing: '-.03em', margin: '0 0 6px',
                    }}>
                        ¡Bienvenido a Gestify!
                    </h1>
                    <p style={{
                        fontSize: 13, color: 'rgba(255,255,255,.6)',
                        margin: 0, lineHeight: 1.4,
                    }}>
                        Tu sistema de gestión profesional está listo.
                    </p>
                </div>

                {/* Contenido */}
                <div style={{ padding: '20px 28px 28px' }}>
                    {/* Trial info */}
                    <div style={{
                        background: '#F0FDF4', borderRadius: 12,
                        padding: '14px 16px', marginBottom: 18,
                        border: '1px solid #BBF7D0',
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: '#22c55e', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <span style={{ fontSize: 18 }}>🎁</span>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#14532D', margin: '0 0 2px' }}>
                                7 días gratis — Sin tarjeta
                            </p>
                            <p style={{ fontSize: 11, color: '#166534', margin: 0 }}>
                                Probá todas las funciones sin compromiso.
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                        INCLUYE TODO ESTO
                    </p>
                    <div style={{ marginBottom: 22 }}>
                        {FEATURES.map((f, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '6px 0',
                            }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: 6,
                                    background: 'rgba(51,65,57,.06)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <f.icon size={12} color="#334139" />
                                </div>
                                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{f.text}</span>
                                <Check size={14} color="#22c55e" style={{ marginLeft: 'auto' }} />
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleStartTrial}
                        disabled={loading}
                        style={{
                            width: '100%', height: 48, borderRadius: 12,
                            background: loading ? '#9CA3AF' : '#334139',
                            color: '#fff', border: 'none',
                            fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all .15s',
                            boxShadow: '0 4px 12px rgba(51,65,57,.2)',
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#283330' }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#334139' }}
                    >
                        <Sparkles size={16} />
                        {loading ? 'Iniciando...' : 'Iniciar prueba gratuita de 7 días'}
                    </button>

                    <p style={{
                        fontSize: 10, color: '#9CA3AF', textAlign: 'center',
                        marginTop: 12, lineHeight: 1.4,
                    }}>
                        Sin tarjeta de crédito · Cancelá cuando quieras · Después $14.999/mes
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes wtmSlideUp {
                    from { transform: translateY(30px) scale(.96); opacity: 0 }
                    to { transform: none; opacity: 1 }
                }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            `}</style>
        </div>
    )
}

export default WelcomeTrialModal
