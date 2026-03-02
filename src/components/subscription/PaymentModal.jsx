/**
 * Gestify — PaymentModal
 * Modal premium de 3 pasos:
 *   1. Datos de transferencia (alias/CBU)
 *   2. Enviar comprobante por WhatsApp (opcional pero recomendado)
 *   3. Confirmación de pago realizado
 */

import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { X, Copy, CheckCircle, MessageCircle, CreditCard, ChevronRight, Clock, PartyPopper } from 'lucide-react'

// ─── CONFIGURA ESTOS DATOS ────────────────────────────────────────────────────
const PAYMENT_INFO = {
    alias: 'gestifypagos',
    cbu: '1430001713032977570013',
    titular: 'Julian Brochero',
    banco: 'Brubank',
    monto: '$14.999',
}
const WHATSAPP_NUMBER = '5493534087718'
// ─────────────────────────────────────────────────────────────────────────────

const PaymentModal = ({ isOpen, onClose, userEmail = '', userId = null, onProActivated = null }) => {
    const [copiedAlias, setCopiedAlias] = useState(false)
    const [copiedCbu, setCopiedCbu] = useState(false)
    const [step, setStep] = useState(1)
    const [activating, setActivating] = useState(false)

    if (!isOpen) return null

    const copy = (text, which) => {
        navigator.clipboard.writeText(text).catch(() => {
            const el = document.createElement('textarea')
            el.value = text
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
        })
        if (which === 'alias') { setCopiedAlias(true); setTimeout(() => setCopiedAlias(false), 2000) }
        else { setCopiedCbu(true); setTimeout(() => setCopiedCbu(false), 2000) }
    }

    const handleWhatsApp = () => {
        const text = `Hola Gestify! 👋\n\nVengo a enviar el comprobante de mi pago mensual.\n📧 Email: ${userEmail}\n💰 Monto: ${PAYMENT_INFO.monto}\n\n[Adjuntá la foto del comprobante acá]`
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank')
    }

    // Activar PRO cuando el usuario confirma el pago
    const activatePro = async () => {
        if (!userId || activating) return
        setActivating(true)
        try {
            const paidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            await supabase
                .from('subscriptions')
                .update({
                    paid_until: paidUntil,
                    pro_since: new Date().toISOString(),
                    trial_until: new Date().toISOString(), // Terminar trial
                })
                .eq('user_id', userId)
        } catch (e) {
            console.error('Error activando PRO:', e)
        }
        setActivating(false)
    }

    // Cuando pasa al paso 3, activar PRO automáticamente
    const goToStep3 = async () => {
        setStep(3)
        await activatePro()
    }

    const handleClose = () => {
        setStep(1)
        if (onProActivated) onProActivated()
        onClose()
    }

    const steps = [
        { n: 1, label: 'Transferir' },
        { n: 2, label: 'Comprobante' },
        { n: 3, label: 'Confirmar' },
    ]

    return (
        <>
            {/* Overlay */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(0,0,0,.45)',
                    backdropFilter: 'blur(3px)',
                    animation: 'pmFadeIn .15s ease',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20, pointerEvents: 'none',
            }}>
                <div style={{
                    width: '100%', maxWidth: 420,
                    background: '#fff',
                    borderRadius: 20,
                    boxShadow: '0 24px 80px rgba(0,0,0,.18), 0 4px 16px rgba(0,0,0,.08)',
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                    animation: 'pmSlideUp .2s ease',
                    fontFamily: "'Inter', -apple-system, sans-serif",
                }}>

                    {/* Header */}
                    <div style={{
                        background: '#282A28', padding: '16px 22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: '#DCED31', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CreditCard size={16} color="#282A28" />
                            </div>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0 }}>Activar Plan Pro</p>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', margin: 0 }}>{PAYMENT_INFO.monto}/mes</p>
                            </div>
                        </div>
                        <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', padding: 4, display: 'flex' }}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Steps indicator */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #F0F0EE' }}>
                        {steps.map(s => (
                            <div key={s.n} style={{
                                flex: 1, padding: '10px 0', textAlign: 'center',
                                borderBottom: step === s.n ? '2px solid #334139' : '2px solid transparent',
                            }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    color: step === s.n ? '#334139' : step > s.n ? '#22c55e' : '#D1D5DB',
                                    letterSpacing: '.01em'
                                }}>
                                    {step > s.n ? '✓ ' : `${s.n}. `}{s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* ═══ PASO 1: Datos de pago ═══ */}
                    {step === 1 && (
                        <div style={{ padding: '20px 22px' }}>
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
                                Realizá una transferencia bancaria con los siguientes datos:
                            </p>

                            {/* Monto */}
                            <div style={{
                                background: 'rgba(51,65,57,.05)', borderRadius: 12,
                                padding: '12px 16px', marginBottom: 14,
                                border: '1px solid rgba(51,65,57,.1)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>MONTO A TRANSFERIR</span>
                                <span style={{ fontSize: 22, fontWeight: 800, color: '#1e2320', letterSpacing: '-.03em' }}>
                                    {PAYMENT_INFO.monto}
                                </span>
                            </div>

                            <DataRow label="ALIAS" value={PAYMENT_INFO.alias} copied={copiedAlias} onCopy={() => copy(PAYMENT_INFO.alias, 'alias')} />
                            <DataRow label="CBU / CVU" value={PAYMENT_INFO.cbu} copied={copiedCbu} onCopy={() => copy(PAYMENT_INFO.cbu, 'cbu')} mono />

                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>TITULAR</p>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#1e2320', margin: 0 }}>{PAYMENT_INFO.titular}</p>
                                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{PAYMENT_INFO.banco}</p>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                style={{
                                    width: '100%', height: 42, borderRadius: 10,
                                    background: '#334139', color: '#fff', border: 'none',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    transition: 'background .13s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#283330'}
                                onMouseLeave={e => e.currentTarget.style.background = '#334139'}
                            >
                                Ya transferí <ChevronRight size={15} />
                            </button>
                        </div>
                    )}

                    {/* ═══ PASO 2: Comprobante (opcional) ═══ */}
                    {step === 2 && (
                        <div style={{ padding: '20px 22px' }}>
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6, lineHeight: 1.5 }}>
                                Envianos el comprobante para que tu activación sea más rápida.
                            </p>

                            {/* Recomendado badge */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                background: '#FEF3C7', border: '1px solid #FCD34D',
                                borderRadius: 6, padding: '4px 10px', marginBottom: 16,
                            }}>
                                <Clock size={12} color="#92400E" />
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#92400E' }}>
                                    RECOMENDADO — Acelera tu activación
                                </span>
                            </div>

                            <button
                                onClick={handleWhatsApp}
                                style={{
                                    width: '100%', height: 46, borderRadius: 10,
                                    background: '#25D366', color: '#fff', border: 'none',
                                    fontSize: 14, fontWeight: 800, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'filter .13s',
                                    marginBottom: 10,
                                }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(.9)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                            >
                                <MessageCircle size={18} />
                                Enviar comprobante por WhatsApp
                            </button>

                            <p style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 }}>
                                (Opcional) Si no lo enviás ahora, verificaremos tu pago en las próximas horas.
                            </p>

                            <div style={{ borderTop: '1px solid #F0F0EE', paddingTop: 14 }}>
                                <button
                                    onClick={goToStep3}
                                    style={{
                                        width: '100%', height: 40, borderRadius: 10,
                                        background: 'transparent', color: '#334139',
                                        border: '1.5px solid #D1D5DB',
                                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                        transition: 'border-color .13s, background .13s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#334139'; e.currentTarget.style.background = 'rgba(51,65,57,.04)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = 'transparent' }}
                                >
                                    Ya realicé el pago <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══ PASO 3: Confirmación ═══ */}
                    {step === 3 && (
                        <div style={{ padding: '28px 22px', textAlign: 'center' }}>
                            {/* Logo + badge PRO */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 8, marginBottom: 16,
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: '#282A28', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                                }}>
                                    <img src="/logogestify3.png" alt="Gestify" style={{ height: 22 }} />
                                </div>
                                <div style={{
                                    padding: '4px 10px', borderRadius: 6,
                                    background: '#DCED31', border: '1.5px solid #282A28',
                                }}>
                                    <span style={{ fontSize: 12, fontWeight: 900, color: '#282A28', letterSpacing: '.04em' }}>PRO</span>
                                </div>
                            </div>

                            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e2320', marginBottom: 4, letterSpacing: '-.02em' }}>
                                ¡Bienvenido a Gestify <span style={{ color: '#334139' }}>PRO</span>!
                            </h2>
                            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, marginBottom: 18, maxWidth: 320, margin: '0 auto 18px' }}>
                                Tu pago está siendo procesado. En cuanto lo verifiquemos, tu plan se activará automáticamente.
                            </p>

                            {/* Resumen */}
                            <div style={{
                                background: '#F0FDF4', borderRadius: 12, padding: '14px 16px',
                                border: '1px solid #BBF7D0', marginBottom: 14, textAlign: 'left',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <CheckCircle size={16} color="#22c55e" />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Pago registrado correctamente</span>
                                </div>
                                {[
                                    { icon: '📧', text: `${userEmail}` },
                                    { icon: '💰', text: `Plan Gestify PRO · ${PAYMENT_INFO.monto}/mes` },
                                    { icon: '⚡', text: 'Activación: en minutos (con comprobante) o dentro de 24hs' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 2 ? 6 : 0 }}>
                                        <span style={{ fontSize: 13, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                                        <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 500 }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 16 }}>
                                Si enviaste el comprobante por WhatsApp, tu activación será aún más rápida ⚡
                            </p>

                            <button
                                onClick={handleClose}
                                style={{
                                    width: '100%', height: 44, borderRadius: 10,
                                    background: '#334139', color: '#fff', border: 'none',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    transition: 'background .13s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#283330'}
                                onMouseLeave={e => e.currentTarget.style.background = '#334139'}
                            >
                                Entendido, volver al sistema
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes pmFadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes pmSlideUp { from { transform: translateY(20px); opacity: 0 } to { transform: none; opacity: 1 } }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            `}</style>
        </>
    )
}

const DataRow = ({ label, value, copied, onCopy, mono }) => (
    <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{label}</p>
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#F8F8F7', borderRadius: 8, padding: '8px 10px',
            border: '1px solid #E8E8E6',
        }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e2320', fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '.04em' : 'normal' }}>
                {value}
            </span>
            <button onClick={onCopy} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: copied ? '#22c55e' : '#9CA3AF', padding: '2px 4px', display: 'flex',
                transition: 'color .13s',
            }}>
                {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
            </button>
        </div>
    </div>
)

export default PaymentModal
