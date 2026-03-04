/**
 * Gestify — Panel Admin
 * Gestión de suscripciones de todos los usuarios.
 * Permite ver el estado de cada cuenta y activar/extender planes manualmente.
 *
 * ⚠️ SOLO ACCESIBLE POR EL ADMINISTRADOR (protegido por email en constante ADMIN_EMAIL).
 */

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'
import {
    Shield, RefreshCw, CheckCircle, AlertTriangle, AlertCircle, Clock,
    Calendar, User, Search, ChevronDown, X, Zap, Trash2
} from 'lucide-react'

// ─── ¡CAMBIA ESTO POR TU EMAIL DE ADMINISTRADOR! ──────────────────────────────
const ADMIN_EMAIL = 'brocherojulian72@gmail.com'
// ─────────────────────────────────────────────────────────────────────────────

const GRACE_DAYS = 7

const getStatus = (row) => {
    if (!row) return 'sin_datos'
    const now = new Date()
    const trialUntil = row.trial_until ? new Date(row.trial_until) : new Date(0)
    const paidUntil = row.paid_until ? new Date(row.paid_until) : null

    // PRO tiene prioridad sobre trial
    if (paidUntil && now <= paidUntil) return 'active'
    if (now <= trialUntil) return 'trial'
    if (paidUntil && now <= new Date(paidUntil.getTime() + GRACE_DAYS * 86400000)) return 'grace'
    if (!paidUntil && now <= new Date(trialUntil.getTime() + GRACE_DAYS * 86400000)) return 'grace'
    return 'suspended'
}

const STATUS_CONFIG = {
    trial: { label: 'Trial', color: '#1D4ED8', bg: '#EFF6FF', icon: Clock },
    active: { label: 'PRO', color: '#15803D', bg: '#F0FDF4', icon: CheckCircle },
    grace: { label: 'Gracia', color: '#B45309', bg: '#FEF3C7', icon: AlertTriangle },
    suspended: { label: 'Suspendido', color: '#B91C1C', bg: '#FEF2F2', icon: AlertCircle },
    sin_datos: { label: 'Sin datos', color: '#6B7280', bg: '#F9FAFB', icon: User },
}

const fmtDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── Componentes pequeños ─────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.sin_datos
    const Icon = cfg.icon
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            background: cfg.bg,
            border: `1px solid ${cfg.color}25`,
            fontSize: 11, fontWeight: 700, color: cfg.color,
        }}>
            <Icon size={11} />
            {cfg.label}
        </span>
    )
}

// ─── Modal para activar/extender plan ────────────────────────────────────────

const ActivateModal = ({ user, onClose, onSuccess }) => {
    const [months, setMonths] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    if (!user) return null

    const handleActivate = async () => {
        setLoading(true)
        setError(null)
        try {
            // Si ya tiene paid_until vigente, extendemos desde ahí; si no, desde hoy
            const base = (user.paid_until && new Date(user.paid_until) > new Date())
                ? new Date(user.paid_until)
                : new Date()

            const newPaidUntil = new Date(base)
            newPaidUntil.setMonth(newPaidUntil.getMonth() + months)

            // Activar PRO: poner paid_until, pro_since, y terminar trial
            const { error: upErr } = await supabase
                .from('subscriptions')
                .update({
                    paid_until: newPaidUntil.toISOString(),
                    pro_since: user.pro_since || new Date().toISOString(),
                    trial_until: new Date().toISOString(),
                    manually_suspended: false, // ← Desbloquear al activar
                })
                .eq('user_id', user.user_id)

            if (upErr) throw upErr
            onSuccess()
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const currentStatus = getStatus(user)

    return (
        <>
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(3px)',
            }} />
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                pointerEvents: 'none',
            }}>
                <div style={{
                    width: '100%', maxWidth: 440, background: '#fff',
                    borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    overflow: 'hidden', pointerEvents: 'auto',
                    fontFamily: "'Inter', sans-serif"
                }}>
                    {/* Header */}
                    <div style={{ background: '#1e2320', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={18} color="#DCED31" fill="#DCED31" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-.02em' }}>Activar / Extender Plan</h3>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', margin: '2px 0 0', fontWeight: 500 }}>{user.email}</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}>
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ padding: '24px' }}>
                        {/* Info actual */}
                        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '.05em' }}>ESTADO ACTUAL</p>
                                <StatusBadge status={currentStatus} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '.05em' }}>VENCIMIENTO</p>
                                <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>{fmtDate(user.paid_until)}</p>
                            </div>
                        </div>

                        {/* Selector de meses */}
                        <p style={{ fontSize: 13, color: '#374151', fontWeight: 700, margin: '0 0 12px 0' }}>
                            ¿Cuántos meses querés otorgar?
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                            {[1, 2, 3, 6, 12].map(m => (
                                <button key={m} onClick={() => setMonths(m)} style={{
                                    flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                                    border: months === m ? '2px solid #1e2320' : '1px solid #E5E7EB',
                                    background: months === m ? '#1e2320' : '#fff',
                                    color: months === m ? '#DCED31' : '#4B5563',
                                    fontSize: 13, fontWeight: 700,
                                    transition: 'all .15s',
                                }}>
                                    {m === 12 ? '1 año' : `${m} mes`}{m > 1 && m < 12 ? 'es' : ''}
                                </button>
                            ))}
                        </div>

                        {/* Nueva fecha calculada */}
                        {(() => {
                            const base = (user.paid_until && new Date(user.paid_until) > new Date())
                                ? new Date(user.paid_until) : new Date()
                            const newDate = new Date(base)
                            newDate.setMonth(newDate.getMonth() + months)
                            return (
                                <div style={{
                                    background: '#F0FDF4', borderRadius: 12, padding: '12px 16px',
                                    border: '1px solid #BBF7D0', marginBottom: 24,
                                    display: 'flex', alignItems: 'center', gap: 10
                                }}>
                                    <Calendar size={16} color="#15803D" />
                                    <div>
                                        <div style={{ fontSize: 11, color: '#15803D', fontWeight: 700, marginBottom: 2 }}>
                                            NUEVO VENCIMIENTO
                                        </div>
                                        <div style={{ fontSize: 14, color: '#14532D', fontWeight: 800 }}>
                                            {fmtDate(newDate.toISOString())}
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}

                        {error && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                                <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>Error: {error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleActivate}
                            disabled={loading}
                            style={{
                                width: '100%', height: 48, borderRadius: 10,
                                background: loading ? '#9CA3AF' : '#1e2320', color: '#DCED31', border: 'none',
                                fontSize: 14, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'all .15s', boxShadow: loading ? 'none' : '0 4px 12px rgba(30,35,32,.2)',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.transform = 'none' }}
                        >
                            <Zap size={16} fill="#DCED31" />
                            {loading ? 'Procesando...' : `Confirmar activación de ${months} mes${months > 1 ? 'es' : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Panel Principal ──────────────────────────────────────────────────────────

const AdminPanel = () => {
    const { user: authUser } = useAuth()
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilter] = useState('all')
    const [selected, setSelected] = useState(null)
    const [lastRefresh, setLastRefresh] = useState(null)

    // Bloqueo si no es admin
    if (authUser?.email !== 'brocherojulian72@gmail.com') {
        return (
            <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <Shield size={48} color="#DC2626" style={{ margin: '0 auto 12px' }} />
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e2320' }}>Acceso denegado</h2>
                    <p style={{ fontSize: 13, color: '#6B7280' }}>No tenés permisos para ver esta sección.</p>
                </div>
            </div>
        )
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            // Intentar usar la función RPC que trae emails
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('get_admin_subscriptions')

            if (!rpcError && rpcData) {
                setRows(rpcData)
            } else {
                // Fallback: leer tabla directa (sin emails)
                console.warn('RPC no disponible, usando fallback:', rpcError?.message)
                const { data: subs, error } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .order('created_at', { ascending: false })
                if (error) throw error
                setRows(subs || [])
            }
            setLastRefresh(new Date())
        } catch (e) {
            console.error('Admin panel error:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const onActivated = () => {
        setSelected(null)
        fetchData()
    }

    // Filtrado
    const filtered = rows.filter(r => {
        const matchSearch = !search ||
            (r.email || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.user_id || '').toLowerCase().includes(search.toLowerCase())
        const status = getStatus(r)
        const matchFilter = filterStatus === 'all' || status === filterStatus
        return matchSearch && matchFilter
    })

    // Contadores
    const counts = rows.reduce((acc, r) => {
        const s = getStatus(r)
        acc[s] = (acc[s] || 0) + 1
        return acc
    }, {})

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", height: '100%', overflowY: 'auto', background: '#F5F5F3', padding: 'clamp(16px, 4vw, 32px)' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-.03em', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1e2320', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={18} color="#DCED31" />
                        </div>
                        Panel de Administración
                    </h1>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0, fontWeight: 500 }}>
                        Gestión centralizada de suscripciones · <strong style={{ color: '#111827' }}>{rows.length} usuarios totales</strong>
                        {lastRefresh && ` · Ult. act: ${lastRefresh.toLocaleTimeString('es-AR')}`}
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 18px', borderRadius: 10,
                        background: '#fff', color: '#374151', border: '1px solid #D1D5DB',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,.04)',
                        opacity: loading ? .7 : 1, transition: 'all .15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                    <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    {loading ? 'Sincronizando...' : 'Sincronizar datos'}
                </button>
            </div>

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 24 }}>
                {/* Botón TODOS */}
                <div
                    onClick={() => setFilter('all')}
                    style={{
                        background: filterStatus === 'all' ? '#1e2320' : '#fff',
                        border: filterStatus === 'all' ? '1px solid #1e2320' : '1px solid #E5E7EB',
                        borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
                        boxShadow: filterStatus === 'all' ? '0 4px 12px rgba(30,35,32,.15)' : '0 1px 2px rgba(0,0,0,.03)',
                        transition: 'all .2s ease-out', transform: filterStatus === 'all' ? 'translateY(-2px)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <User size={16} color={filterStatus === 'all' ? '#DCED31' : '#9CA3AF'} />
                        <span style={{ fontSize: 24, fontWeight: 900, color: filterStatus === 'all' ? '#fff' : '#111827', lineHeight: 1 }}>
                            {rows.length}
                        </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: filterStatus === 'all' ? '#D1D5DB' : '#6B7280', margin: 0 }}>Todos</p>
                </div>
                {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'sin_datos').map(([key, cfg]) => {
                    const Icon = cfg.icon
                    const isActive = filterStatus === key
                    return (
                        <div
                            key={key}
                            onClick={() => setFilter(isActive ? 'all' : key)}
                            style={{
                                background: isActive ? cfg.bg : '#fff',
                                border: `1px solid ${isActive ? cfg.color : '#E5E7EB'}`,
                                borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
                                boxShadow: isActive ? `0 4px 12px ${cfg.color}15` : '0 1px 2px rgba(0,0,0,.03)',
                                transition: 'all .2s ease-out', transform: isActive ? 'translateY(-2px)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Icon size={16} color={cfg.color} />
                                <span style={{ fontSize: 24, fontWeight: 900, color: isActive ? cfg.color : '#111827', lineHeight: 1 }}>
                                    {counts[key] || 0}
                                </span>
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: isActive ? cfg.color : '#6B7280', margin: 0 }}>{cfg.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Buscador */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar usuarios por email o ID..."
                    style={{
                        width: '100%', height: 44, paddingLeft: 40, paddingRight: 16,
                        borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 14, fontWeight: 500,
                        fontFamily: "'Inter', sans-serif", outline: 'none',
                        background: '#fff', color: '#111827', boxSizing: 'border-box',
                        boxShadow: '0 1px 2px rgba(0,0,0,.02)', transition: 'border .2s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1e2320'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                />
            </div>

            {/* Tabla */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflowX: 'auto', overflowY: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.03)' }}>
                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <RefreshCw size={28} color="#9CA3AF" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', margin: 0 }}>Cargando usuarios del sistema...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <User size={24} color="#9CA3AF" />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px 0' }}>Ningún usuario encontrado</p>
                        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Intentá con otro filtro o término de búsqueda.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                {['Email', 'Estado', 'Trial hasta', 'PRO desde', 'Plan hasta', 'Acción'].map(h => (
                                    <th key={h} style={{
                                        padding: '14px 20px', textAlign: 'left',
                                        fontSize: 11, fontWeight: 700, color: '#6B7280',
                                        textTransform: 'uppercase', letterSpacing: '.05em',
                                        whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row, i) => {
                                const status = getStatus(row)
                                return (
                                    <tr key={row.id || i} style={{
                                        borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                                        transition: 'background .15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 20px' }}>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>
                                                    {row.email || 'Sin email'}
                                                </p>
                                                <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF', margin: '3px 0 0' }}>
                                                    {row.user_id ? row.user_id.slice(0, 12) + '...' : '—'}
                                                </p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                <StatusBadge status={status} />
                                                {row.manually_suspended && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 3,
                                                        padding: '3px 7px', borderRadius: 6,
                                                        background: '#450a0a', border: '1px solid #7f1d1d',
                                                        fontSize: 10, fontWeight: 700, color: '#fca5a5',
                                                    }}>
                                                        🔒 Bloqueado
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                            {fmtDate(row.trial_until)}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                            {fmtDate(row.pro_since)}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                            {fmtDate(row.paid_until)}
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={() => setSelected(row)}
                                                    style={{
                                                        padding: '6px 14px', borderRadius: 8,
                                                        background: status === 'active' ? '#F0FDF4' : '#1e2320',
                                                        color: status === 'active' ? '#15803D' : '#fff',
                                                        border: status === 'active' ? '1px solid #BBF7D0' : '1px solid #1e2320',
                                                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        whiteSpace: 'nowrap', transition: 'all .15s',
                                                        boxShadow: status !== 'active' ? '0 2px 4px rgba(30,35,32,.2)' : 'none'
                                                    }}
                                                    onMouseEnter={e => { if (status !== 'active') e.currentTarget.style.background = '#282A28' }}
                                                    onMouseLeave={e => { if (status !== 'active') e.currentTarget.style.background = '#1e2320' }}
                                                >
                                                    <Zap size={12} fill={status !== 'active' ? '#DCED31' : 'none'} color={status !== 'active' ? '#DCED31' : 'currentColor'} />
                                                    {status === 'active' ? 'Extender' : 'Activar PRO'}
                                                </button>
                                                {status === 'active' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`¿Desactivar PRO de ${row.email}? Quedará suspendido inmediatamente.`)) return
                                                            const pastDate = new Date(2020, 0, 1).toISOString()
                                                            await supabase
                                                                .from('subscriptions')
                                                                .update({
                                                                    paid_until: null,
                                                                    pro_since: null,
                                                                    trial_until: pastDate,
                                                                    manually_suspended: true, // ← Bloquear al desactivar
                                                                })
                                                                .eq('user_id', row.user_id)
                                                            fetchData()
                                                        }}
                                                        style={{
                                                            padding: '6px 14px', borderRadius: 8,
                                                            background: '#fff', color: '#EF4444',
                                                            border: '1px solid #FECACA',
                                                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: 6,
                                                            whiteSpace: 'nowrap', transition: 'all .15s',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        <AlertCircle size={12} />
                                                        Desactivar
                                                    </button>
                                                )}

                                                <button
                                                    onClick={async () => {
                                                        if (!confirm(`¿Eliminar definitivamente a ${row.email || 'este usuario'} de tu lista?\n\nSi vuelve a iniciar sesión, se creará de nuevo como usuario gratis. Si querés que NO pueda entrar, mejor suspendelo manualmente.`)) return
                                                        await supabase
                                                            .from('subscriptions')
                                                            .delete()
                                                            .eq('user_id', row.user_id)
                                                        fetchData()
                                                    }}
                                                    title="Eliminar de la lista"
                                                    style={{
                                                        padding: '6px', borderRadius: 8,
                                                        background: '#fff', color: '#9CA3AF',
                                                        border: '1px solid #E5E7EB',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        transition: 'all .15s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de activación */}
            {
                selected && (
                    <ActivateModal
                        user={selected}
                        onClose={() => setSelected(null)}
                        onSuccess={onActivated}
                    />
                )
            }

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            `}</style>
        </div >
    )
}

export default AdminPanel
