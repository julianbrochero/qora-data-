/**
 * Gestify — PaymentModal
 * Modal premium que muestra los datos de pago (alias/CBU) y luego permite
 * enviar el comprobante por WhatsApp.
 */

import React, { useState } from 'react'
import { X, Copy, CheckCircle, MessageCircle, CreditCard, ChevronRight } from 'lucide-react'

// ─── CONFIGURA ESTOS DATOS ────────────────────────────────────────────────────
const PAYMENT_INFO = {
    alias: 'gestify.pagos',          // ← Cambiá por tu alias real
    cbu: '0000003100037000000001', // ← Cambiá por tu CBU/CVU real
    titular: 'Julian Brochero',      // ← Tu nombre
    banco: 'Mercado Pago / Banco',   // ← Tu banco / billetera
    monto: '$14.999',
    moneda: 'ARS',
}
const WHATSAPP_NUMBER = '5493534087718'
// ─────────────────────────────────────────────────────────────────────────────

const PaymentModal = ({ isOpen, onClose, userEmail = '' }) => {
    const [copiedAlias, setCopiedAlias] = useState(false)
    const [copiedCbu, setCopiedCbu] = useState(false)
    const [step, setStep] = useState(1) // 1: datos de pago, 2: enviar comprobante

    if (!isOpen) return null

    const copy = (text, which) => {
        navigator.clipboard.writeText(text).catch(() => {
            // fallback
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
        onClose()
    }

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(0,0,0,.45)',
                    backdropFilter: 'blur(3px)',
                    animation: 'fadeIn .15s ease',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20, pointerEvents: 'none',
            }}>
                <div style={{
                    width: '100%', maxWidth: 400,
                    background: '#fff',
                    borderRadius: 20,
                    boxShadow: '0 24px 80px rgba(0,0,0,.18), 0 4px 16px rgba(0,0,0,.08)',
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                    animation: 'slideUp .2s ease',
                    fontFamily: "'Inter', -apple-system, sans-serif",
                }}>

                    {/* Header */}
                    <div style={{
                        background: '#282A28', padding: '18px 22px',
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
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', padding: 4, display: 'flex' }}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Steps indicator */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #F0F0EE' }}>
                        {[
                            { n: 1, label: 'Transferir' },
                            { n: 2, label: 'Enviar comprobante' },
                        ].map(s => (
                            <div key={s.n} style={{
                                flex: 1, padding: '10px 0', textAlign: 'center',
                                borderBottom: step === s.n ? '2px solid #334139' : '2px solid transparent',
                                cursor: 'pointer',
                            }} onClick={() => setStep(s.n)}>
                                <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    color: step === s.n ? '#334139' : '#9CA3AF',
                                    letterSpacing: '.01em'
                                }}>
                                    {s.n}. {s.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Datos de pago */}
                    {step === 1 && (
                        <div style={{ padding: '20px 22px' }}>
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
                                Realizá una transferencia bancaria con los siguientes datos:
                            </p>

                            {/* Monto destacado */}
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

                            {/* Alias */}
                            <DataRow
                                label="ALIAS"
                                value={PAYMENT_INFO.alias}
                                copied={copiedAlias}
                                onCopy={() => copy(PAYMENT_INFO.alias, 'alias')}
                            />

                            {/* CBU */}
                            <DataRow
                                label="CBU / CVU"
                                value={PAYMENT_INFO.cbu}
                                copied={copiedCbu}
                                onCopy={() => copy(PAYMENT_INFO.cbu, 'cbu')}
                                mono
                            />

                            {/* Titular */}
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
                                Ya transferí, enviar comprobante <ChevronRight size={15} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: WhatsApp */}
                    {step === 2 && (
                        <div style={{ padding: '20px 22px' }}>
                            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 20, lineHeight: 1.5 }}>
                                Envianos la foto del comprobante de transferencia por WhatsApp y te activamos el plan en minutos ⚡
                            </p>

                            <div style={{
                                background: '#F0FDF4', borderRadius: 12, padding: '14px 16px',
                                border: '1px solid #BBF7D0', marginBottom: 20,
                            }}>
                                {[
                                    '✅ Verificamos tu transferencia',
                                    '✅ Activamos tu cuenta en minutos',
                                    '✅ Recibís confirmación por WhatsApp',
                                ].map((t, i) => (
                                    <p key={i} style={{ fontSize: 12, color: '#166534', margin: i < 2 ? '0 0 6px' : 0, fontWeight: 500 }}>{t}</p>
                                ))}
                            </div>

                            <button
                                onClick={handleWhatsApp}
                                style={{
                                    width: '100%', height: 46, borderRadius: 10,
                                    background: '#25D366', color: '#fff', border: 'none',
                                    fontSize: 14, fontWeight: 800, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'filter .13s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(.9)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                            >
                                <MessageCircle size={18} />
                                Enviar comprobante por WhatsApp
                            </button>

                            <button onClick={() => setStep(1)} style={{
                                width: '100%', marginTop: 8, padding: '8px 0',
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 11, color: '#9CA3AF', fontFamily: "'Inter', sans-serif"
                            }}>
                                ← Volver a los datos de pago
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: none; opacity: 1 } }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            `}</style>
        </>
    )
}

// Sub-componente fila de dato copiable
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
