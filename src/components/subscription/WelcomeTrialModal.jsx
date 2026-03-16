/**
 * Gestify — WelcomeTrialModal
 * Modal de bienvenida para nuevos usuarios.
 * Se muestra como overlay encima del sistema al primer login.
 * Al confirmar, activa el trial de 7 días en Supabase.
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Sparkles, Check, Zap, BarChart3, FileText, Users, ShoppingCart, ArrowRight, Gift } from 'lucide-react'

const FEATURES = [
    { icon: FileText, text: 'Facturación y ventas profesional' },
    { icon: Users, text: 'Gestión completa de clientes' },
    { icon: ShoppingCart, text: 'Pedidos y presupuestos' },
    { icon: BarChart3, text: 'Reportes y estadísticas en tiempo real' },
    { icon: Zap, text: 'Control de caja integrado' },
]

const WelcomeTrialModal = ({ userId, onTrialStarted }) => {
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)

    // Pequeño delay para que aparezca con animación suave después de que el sistema cargue
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 350)
        return () => clearTimeout(t)
    }, [])

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
                setLoading(false)
            }
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                @keyframes wtm-backdrop-in {
                    from { opacity: 0 }
                    to { opacity: 1 }
                }
                @keyframes wtm-card-in {
                    from { transform: translateY(40px) scale(.94); opacity: 0 }
                    to { transform: translateY(0) scale(1); opacity: 1 }
                }
                @keyframes wtm-shimmer {
                    0%   { background-position: -200% center }
                    100% { background-position:  200% center }
                }
                @keyframes wtm-pulse-ring {
                    0%   { transform: scale(1); opacity: .6 }
                    100% { transform: scale(1.6); opacity: 0 }
                }
                @keyframes wtm-float {
                    0%, 100% { transform: translateY(0) }
                    50% { transform: translateY(-6px) }
                }
                .wtm-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 36px rgba(220,237,49,.35) !important;
                }
                .wtm-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .wtm-feature-row:hover .wtm-feature-icon {
                    background: rgba(220,237,49,.18) !important;
                    border-color: rgba(220,237,49,.35) !important;
                }

                /* ── Responsive móvil ── */
                @media (max-width: 520px) {
                    .wtm-card {
                        border-radius: 18px !important;
                        max-height: 95vh !important;
                    }
                    .wtm-header {
                        padding: 24px 18px 20px !important;
                    }
                    .wtm-header-icon {
                        width: 54px !important;
                        height: 54px !important;
                        border-radius: 15px !important;
                        margin-bottom: 14px !important;
                    }
                    .wtm-title {
                        font-size: 21px !important;
                        margin-bottom: 6px !important;
                    }
                    .wtm-subtitle {
                        font-size: 13px !important;
                    }
                    .wtm-body {
                        padding: 18px 18px 22px !important;
                    }
                    .wtm-pill {
                        padding: 13px 13px !important;
                        gap: 11px !important;
                        margin-bottom: 18px !important;
                        border-radius: 12px !important;
                    }
                    .wtm-pill-icon {
                        width: 36px !important;
                        height: 36px !important;
                        font-size: 17px !important;
                        border-radius: 9px !important;
                        flex-shrink: 0 !important;
                    }
                    .wtm-pill-title {
                        font-size: 13px !important;
                        line-height: 1.3 !important;
                    }
                    .wtm-pill-desc {
                        font-size: 11px !important;
                    }
                    .wtm-section-label {
                        font-size: 9px !important;
                    }
                    .wtm-feature-row {
                        padding: 7px 0 !important;
                        gap: 10px !important;
                    }
                    .wtm-feature-icon-wrap {
                        width: 27px !important;
                        height: 27px !important;
                        border-radius: 7px !important;
                    }
                    .wtm-feature-text {
                        font-size: 12px !important;
                    }
                    .wtm-btn-style {
                        height: 48px !important;
                        border-radius: 12px !important;
                    }
                    .wtm-btn-text {
                        font-size: 13.5px !important;
                        font-weight: 800 !important;
                    }
                    .wtm-footer-text {
                        font-size: 10px !important;
                        margin-top: 10px !important;
                    }
                }
                @media (max-width: 380px) {
                    .wtm-title { font-size: 19px !important; }
                    .wtm-pill-title { font-size: 12px !important; }
                    .wtm-btn-text { font-size: 12.5px !important; }
                    .wtm-header { padding: 20px 14px 16px !important; }
                    .wtm-body { padding: 14px 14px 18px !important; }
                }
            `}</style>

            {/* Backdrop */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,.72)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                fontFamily: "'Inter', -apple-system, sans-serif",
                padding: '16px',
                animation: visible ? 'wtm-backdrop-in .25s ease' : 'none',
                opacity: visible ? 1 : 0,
                transition: 'opacity .25s ease',
            }}>

                {/* Card */}
                <div className="wtm-card" style={{
                    width: '100%', maxWidth: 460,
                    background: '#111713',
                    borderRadius: 28,
                    boxShadow: '0 40px 120px rgba(0,0,0,.6), 0 0 0 1px rgba(220,237,49,.12)',
                    overflow: 'hidden',
                    animation: visible ? 'wtm-card-in .35s cubic-bezier(.22,1,.36,1)' : 'none',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}>

                    {/* ── Header ── */}
                    <div className="wtm-header" style={{
                        background: 'linear-gradient(140deg, #1a2218 0%, #253023 40%, #1f2a1d 100%)',
                        padding: '36px 32px 28px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        borderBottom: '1px solid rgba(220,237,49,.08)',
                    }}>
                        {/* BG decorative blobs */}
                        <div style={{
                            position: 'absolute', top: -60, right: -60,
                            width: 180, height: 180, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(220,237,49,.07) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: -40, left: -40,
                            width: 140, height: 140, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(220,237,49,.04) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />

                        {/* Icon with pulse ring */}
                        <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 18 }}>
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                background: 'rgba(220,237,49,.3)',
                                animation: 'wtm-pulse-ring 2s ease-out infinite',
                                transformOrigin: 'center',
                            }} />
                            <div className="wtm-header-icon" style={{
                                width: 64, height: 64, borderRadius: 18,
                                background: 'linear-gradient(135deg, #DCED31 0%, #c8d828 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 28px rgba(220,237,49,.4)',
                                animation: 'wtm-float 3s ease-in-out infinite',
                                position: 'relative',
                            }}>
                                <Gift size={28} color="#1a2218" strokeWidth={2.2} />
                            </div>
                        </div>

                        <h1 className="wtm-title" style={{
                            fontSize: 26, fontWeight: 900, color: '#fff',
                            letterSpacing: '-.04em', margin: '0 0 8px',
                            lineHeight: 1.15,
                        }}>
                            ¡Bienvenido a{' '}
                            <span style={{
                                background: 'linear-gradient(90deg, #DCED31, #b8d400, #DCED31)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                animation: 'wtm-shimmer 3s linear infinite',
                            }}>Gestify</span>
                            !
                        </h1>
                        <p className="wtm-subtitle" style={{
                            fontSize: 14, color: 'rgba(255,255,255,.55)',
                            margin: 0, lineHeight: 1.5,
                        }}>
                            Tu sistema de gestión profesional está listo para usar.
                        </p>
                    </div>

                    {/* ── Body ── */}
                    <div className="wtm-body" style={{ padding: '24px 32px 32px' }}>

                        {/* Trial pill */}
                        <div className="wtm-pill" style={{
                            background: 'linear-gradient(135deg, rgba(220,237,49,.10) 0%, rgba(220,237,49,.05) 100%)',
                            borderRadius: 14,
                            padding: '16px 18px',
                            marginBottom: 22,
                            border: '1px solid rgba(220,237,49,.18)',
                            display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <div className="wtm-pill-icon" style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: 'rgba(220,237,49,.15)',
                                border: '1px solid rgba(220,237,49,.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: 22,
                            }}>🎁</div>
                            <div>
                                <p className="wtm-pill-title" style={{
                                    fontSize: 15, fontWeight: 800, color: '#DCED31',
                                    margin: '0 0 3px', letterSpacing: '-.02em',
                                }}>
                                    7 días gratis — Sin tarjeta de crédito
                                </p>
                                <p className="wtm-pill-desc" style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', margin: 0, lineHeight: 1.4 }}>
                                    Explorá todas las funciones PRO sin ningún compromiso.
                                </p>
                            </div>
                        </div>

                        {/* Features */}
                        <p className="wtm-section-label" style={{
                            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)',
                            textTransform: 'uppercase', letterSpacing: '.1em',
                            marginBottom: 12, margin: '0 0 12px',
                        }}>
                            INCLUIDO EN TU PRUEBA
                        </p>

                        <div style={{ marginBottom: 26 }}>
                            {FEATURES.map((f, i) => (
                                <div
                                    key={i}
                                    className="wtm-feature-row"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '8px 0',
                                        borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
                                        transition: 'all .15s',
                                        cursor: 'default',
                                    }}
                                >
                                    <div
                                        className="wtm-feature-icon wtm-feature-icon-wrap"
                                        style={{
                                            width: 30, height: 30, borderRadius: 8,
                                            background: 'rgba(255,255,255,.06)',
                                            border: '1px solid rgba(255,255,255,.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all .15s',
                                        }}
                                    >
                                        <f.icon size={14} color="rgba(255,255,255,.6)" />
                                    </div>
                                    <span className="wtm-feature-text" style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontWeight: 500, flex: 1 }}>
                                        {f.text}
                                    </span>
                                    <Check size={15} color="#DCED31" strokeWidth={2.5} />
                                </div>
                            ))}
                        </div>

                        {/* CTA button */}
                        <button
                            className="wtm-btn wtm-btn-style"
                            onClick={handleStartTrial}
                            disabled={loading}
                            style={{
                                width: '100%', height: 54, borderRadius: 14,
                                background: loading
                                    ? 'rgba(255,255,255,.08)'
                                    : 'linear-gradient(135deg, #DCED31 0%, #c8d828 100%)',
                                color: loading ? 'rgba(255,255,255,.4)' : '#1a2218',
                                border: 'none',
                                fontSize: 15, fontWeight: 900,
                                cursor: loading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                transition: 'all .2s cubic-bezier(.22,1,.36,1)',
                                boxShadow: loading ? 'none' : '0 6px 24px rgba(220,237,49,.3)',
                                letterSpacing: '-.02em',
                                marginBottom: 0,
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 18, height: 18,
                                        border: '2px solid rgba(255,255,255,.3)',
                                        borderTopColor: 'rgba(255,255,255,.7)',
                                        borderRadius: '50%',
                                        animation: 'wtm-spin 1s linear infinite',
                                    }} />
                                    Iniciando prueba...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} strokeWidth={2.2} />
                                    <span className="wtm-btn-text" style={{ fontSize: 15, fontWeight: 900 }}>Iniciar prueba gratuita de 7 días</span>
                                    <ArrowRight size={16} strokeWidth={2.5} />
                                </>
                            )}
                        </button>

                        <p className="wtm-footer-text" style={{
                            fontSize: 11, color: 'rgba(255,255,255,.25)',
                            textAlign: 'center', marginTop: 14, lineHeight: 1.5,
                        }}>
                            Sin tarjeta · Cancelá cuando quieras · Luego $14.999/mes
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes wtm-spin { to { transform: rotate(360deg) } }
            `}</style>
        </>
    )
}

export default WelcomeTrialModal