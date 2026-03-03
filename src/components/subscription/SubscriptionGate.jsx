/**
 * Gestify — SubscriptionGate
 * Controla el acceso al sistema y muestra banners/modales según el estado.
 * - new_user: Modal de bienvenida para iniciar trial
 * - trial: Banner con días restantes
 * - active (PRO): Banner verde PRO
 * - grace: Banner amarillo
 * - suspended: Banner rojo
 * - manually_suspended: Modal BLOQUEANTE — el usuario no puede usar el sistema
 */

import React, { useState } from 'react'
import { useSubscriptionContext } from '../../lib/SubscriptionContext'
import TrialBanner from './TrialBanner'
import PaymentModal from './PaymentModal'
import WelcomeTrialModal from './WelcomeTrialModal'
import { AlertTriangle, AlertCircle, Crown, Shield, Copy, CheckCircle, MessageCircle, Lock, Mail } from 'lucide-react'

// ─── DATOS DE PAGO (iguales a PaymentModal) ────────────────────────────────────
const PAYMENT_INFO = {
    alias: 'gestifypagos',
    cbu: '1430001713032977570013',
    titular: 'Julian Brochero',
    banco: 'Brubank',
    monto: '$14.999',
}
const WHATSAPP_NUMBER = '5493534087718'
const SUPPORT_EMAIL = 'brocherojulian72@gmail.com'
// ────────────────────────────────────────────────────────────────────────────────

const SuspendedBlockingModal = ({ email }) => {
    const [copiedAlias, setCopiedAlias] = useState(false)
    const [copiedCbu, setCopiedCbu] = useState(false)

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
        const text = `Hola Gestify! 👋\n\nMi cuenta fue suspendida y ya realicé el pago.\n📧 Email: ${email}\n💰 Monto: ${PAYMENT_INFO.monto}\n\n[Adjuntá la foto del comprobante acá]`
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank')
    }

    const handleEmail = () => {
        const subject = encodeURIComponent('Solicitud de reactivación - Gestify PRO')
        const body = encodeURIComponent(`Hola,\n\nMi cuenta fue suspendida y ya realicé el pago.\n\nEmail de la cuenta: ${email}\nMonto transferido: ${PAYMENT_INFO.monto}\n\nAdjunto el comprobante de pago.\n\nGracias.`)
        window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, '_blank')
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(12px)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            padding: 20,
        }}>
            <div style={{
                width: '100%', maxWidth: 460,
                background: '#fff', borderRadius: 24,
                boxShadow: '0 32px 100px rgba(0,0,0,.35)',
                overflow: 'hidden',
                animation: 'sbmSlideUp .3s ease',
            }}>
                {/* Header rojo bloqueante */}
                <div style={{
                    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                    padding: '28px 28px 22px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Decorative circles */}
                    <div style={{
                        position: 'absolute', top: -30, right: -30,
                        width: 100, height: 100, borderRadius: '50%',
                        background: 'rgba(255,255,255,.05)',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: -20,
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(255,255,255,.03)',
                    }} />

                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 14px',
                        border: '2px solid rgba(255,255,255,.15)',
                    }}>
                        <Lock size={26} color="#fca5a5" />
                    </div>

                    <h1 style={{
                        fontSize: 20, fontWeight: 900, color: '#fff',
                        letterSpacing: '-.03em', margin: '0 0 6px',
                    }}>
                        Cuenta suspendida
                    </h1>
                    <p style={{
                        fontSize: 12, color: 'rgba(255,255,255,.65)',
                        margin: 0, lineHeight: 1.5,
                    }}>
                        Tu acceso fue bloqueado por falta de pago.
                    </p>
                </div>

                {/* Contenido */}
                <div style={{ padding: '22px 28px 28px' }}>

                    {/* Alerta principal */}
                    <div style={{
                        background: '#FEF2F2', borderRadius: 12,
                        padding: '14px 16px', marginBottom: 18,
                        border: '1px solid #FECACA',
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                        <Shield size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', margin: '0 0 4px' }}>
                                Para reactivar tu cuenta:
                            </p>
                            <p style={{ fontSize: 11, color: '#B91C1C', margin: 0, lineHeight: 1.5 }}>
                                Realizá la transferencia con los datos de abajo y enviá el comprobante.
                                Tu cuenta se activará manualmente una vez verificado el pago.
                            </p>
                        </div>
                    </div>

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

                    {/* Alias */}
                    <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>ALIAS</p>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#F8F8F7', borderRadius: 8, padding: '8px 10px',
                            border: '1px solid #E8E8E6',
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e2320' }}>
                                {PAYMENT_INFO.alias}
                            </span>
                            <button onClick={() => copy(PAYMENT_INFO.alias, 'alias')} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: copiedAlias ? '#22c55e' : '#9CA3AF', padding: '2px 4px', display: 'flex',
                                transition: 'color .13s',
                            }}>
                                {copiedAlias ? <CheckCircle size={15} /> : <Copy size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* CBU */}
                    <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>CBU / CVU</p>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#F8F8F7', borderRadius: 8, padding: '8px 10px',
                            border: '1px solid #E8E8E6',
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e2320', fontFamily: 'monospace', letterSpacing: '.04em' }}>
                                {PAYMENT_INFO.cbu}
                            </span>
                            <button onClick={() => copy(PAYMENT_INFO.cbu, 'cbu')} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: copiedCbu ? '#22c55e' : '#9CA3AF', padding: '2px 4px', display: 'flex',
                                transition: 'color .13s',
                            }}>
                                {copiedCbu ? <CheckCircle size={15} /> : <Copy size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Titular */}
                    <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>TITULAR</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1e2320', margin: 0 }}>{PAYMENT_INFO.titular}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{PAYMENT_INFO.banco}</p>
                    </div>

                    {/* Separador */}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 18, marginBottom: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 12, textAlign: 'center' }}>
                            Enviá el comprobante para activar tu cuenta
                        </p>
                    </div>

                    {/* Botón WhatsApp */}
                    <button
                        onClick={handleWhatsApp}
                        style={{
                            width: '100%', height: 48, borderRadius: 12,
                            background: '#25D366', color: '#fff', border: 'none',
                            fontSize: 14, fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            transition: 'filter .13s',
                            marginBottom: 10,
                            boxShadow: '0 4px 12px rgba(37,211,102,.25)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(.9)'}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                        <MessageCircle size={18} />
                        Enviar comprobante por WhatsApp
                    </button>

                    {/* Botón Email */}
                    <button
                        onClick={handleEmail}
                        style={{
                            width: '100%', height: 42, borderRadius: 10,
                            background: 'transparent', color: '#374151',
                            border: '1.5px solid #D1D5DB',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'border-color .13s, background .13s',
                            marginBottom: 14,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#334139'; e.currentTarget.style.background = 'rgba(51,65,57,.04)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = 'transparent' }}
                    >
                        <Mail size={14} />
                        Contactar soporte por email
                    </button>

                    {/* Nota final */}
                    <div style={{
                        background: '#FFFBEB', borderRadius: 10, padding: '10px 14px',
                        border: '1px solid #FDE68A',
                    }}>
                        <p style={{
                            fontSize: 10, color: '#92400E', margin: 0, lineHeight: 1.5,
                            textAlign: 'center', fontWeight: 600,
                        }}>
                            ⚠️ Tu cuenta será reactivada manualmente una vez verificado el pago.
                            Si ya pagaste, enviá el comprobante y nos comunicaremos a la brevedad.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes sbmSlideUp {
                    from { transform: translateY(30px) scale(.96); opacity: 0 }
                    to { transform: none; opacity: 1 }
                }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            `}</style>
        </div>
    )
}

const SubscriptionGate = ({ children }) => {
    const { status, loading, daysRemaining, email, isPro, userId, manuallySuspended, checkStatus } = useSubscriptionContext()
    const [modalOpen, setModalOpen] = useState(false)

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#F5F5F5',
                fontFamily: "'Inter', sans-serif",
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40, height: 40, border: '3px solid rgba(51,65,57,.15)',
                        borderTopColor: '#334139', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto 16px',
                    }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#30362F' }}>Verificando suscripción...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            </div>
        )
    }

    // Usuario nuevo — mostrar modal de bienvenida
    if (status === 'new_user') {
        return (
            <WelcomeTrialModal
                userId={userId}
                onTrialStarted={() => checkStatus()}
            />
        )
    }

    // ★ CUENTA BLOQUEADA MANUALMENTE — Modal bloqueante sin cierre, solo admin puede reactivar
    if (manuallySuspended && status === 'suspended') {
        return <SuspendedBlockingModal email={email} />
    }

    // ★ CUENTA SUSPENDIDA NATURALMENTE — Modal de pago con auto-activación posible
    if (status === 'suspended' && !manuallySuspended) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(8px)',
                fontFamily: "'Inter', -apple-system, sans-serif",
                padding: 20,
            }}>
                <div style={{
                    width: '100%', maxWidth: 440,
                    background: '#fff', borderRadius: 24,
                    boxShadow: '0 32px 100px rgba(0,0,0,.3)',
                    overflow: 'hidden',
                    animation: 'sbmSlideUp .3s ease',
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e2320 0%, #334139 50%, #1e2320 100%)',
                        padding: '28px 28px 22px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: -30, right: -30,
                            width: 100, height: 100, borderRadius: '50%',
                            background: 'rgba(220,237,49,.06)',
                        }} />

                        <div style={{
                            width: 56, height: 56, borderRadius: 16,
                            background: 'rgba(220,237,49,.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 14px',
                            border: '2px solid rgba(220,237,49,.2)',
                        }}>
                            <AlertCircle size={26} color="#DCED31" />
                        </div>

                        <h1 style={{
                            fontSize: 20, fontWeight: 900, color: '#fff',
                            letterSpacing: '-.03em', margin: '0 0 6px',
                        }}>
                            Suscripción expirada
                        </h1>
                        <p style={{
                            fontSize: 12, color: 'rgba(255,255,255,.6)',
                            margin: 0, lineHeight: 1.5,
                        }}>
                            Tu período de prueba o plan PRO ha finalizado.
                        </p>
                    </div>

                    {/* Contenido */}
                    <div style={{ padding: '22px 28px 28px' }}>
                        <div style={{
                            background: '#FEF3C7', borderRadius: 12,
                            padding: '14px 16px', marginBottom: 18,
                            border: '1px solid #FCD34D',
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                        }}>
                            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 4px' }}>
                                    Activá tu Plan PRO para seguir usando Gestify
                                </p>
                                <p style={{ fontSize: 11, color: '#B45309', margin: 0, lineHeight: 1.5 }}>
                                    Realizá la transferencia y tu cuenta se activará automáticamente, o enviá el comprobante para una activación más rápida.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setModalOpen(true)}
                            style={{
                                width: '100%', height: 48, borderRadius: 12,
                                background: '#334139', color: '#DCED31', border: 'none',
                                fontSize: 14, fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                transition: 'all .15s',
                                boxShadow: '0 4px 12px rgba(51,65,57,.2)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#283330'}
                            onMouseLeave={e => e.currentTarget.style.background = '#334139'}
                        >
                            💳 Ver datos de pago y activar PRO
                        </button>

                        <p style={{
                            fontSize: 10, color: '#9CA3AF', textAlign: 'center',
                            marginTop: 14, lineHeight: 1.5,
                        }}>
                            Plan Gestify PRO · $14.999/mes · Acceso completo a todas las funciones
                        </p>
                    </div>
                </div>

                <PaymentModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    userEmail={email}
                    userId={userId}
                    manuallySuspended={false}
                    onProActivated={() => checkStatus()}
                />

                <style>{`
                    @keyframes sbmSlideUp {
                        from { transform: translateY(30px) scale(.96); opacity: 0 }
                        to { transform: none; opacity: 1 }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Banner Trial (solo si NO es PRO) */}
            {status === 'trial' && !isPro && <TrialBanner daysRemaining={daysRemaining} />}

            {/* PRO activo: sin banner (se muestra en Configuración y avatar) */}

            {/* Banner Grace Period */}
            {status === 'grace' && (
                <div style={{
                    background: '#FEF3C7', borderBottom: '1px solid #FCD34D',
                    padding: '10px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 14, flexWrap: 'wrap',
                    zIndex: 50, position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400E' }}>
                        <AlertTriangle size={16} />
                        <span style={{ fontSize: 12, fontWeight: 600 }}>
                            {isPro ? 'Tu plan PRO venció' : 'Tu prueba venció'}. Tenés {daysRemaining} días antes de la suspensión.
                        </span>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        style={{
                            background: '#D97706', color: 'white', border: 'none',
                            padding: '5px 14px', borderRadius: 6, fontSize: 11,
                            fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        Ver datos de pago
                    </button>
                </div>
            )}

            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {children}
            </div>

            <PaymentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                userEmail={email}
                userId={userId}
                manuallySuspended={manuallySuspended}
                onProActivated={() => checkStatus()}
            />
        </div>
    )
}

export default SubscriptionGate
