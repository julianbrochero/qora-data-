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
    Calendar, User, Search, ChevronDown, X, Zap
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
                    pro_since: user.pro_since || new Date().toISOString(), // Solo setear si es la primera vez
                    trial_until: new Date().toISOString(),
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
                    width: '100%', maxWidth: 400, background: '#fff',
                    borderRadius: 18, boxShadow: '0 24px 80px rgba(0,0,0,.18)',
                    overflow: 'hidden', pointerEvents: 'auto',
                    fontFamily: "'Inter', sans-serif",
                }}>
                    {/* Header */}
                    <div style={{ background: '#282A28', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0 }}>Activar / Extender Plan</p>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', margin: 0 }}>{user.email}</p>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', display: 'flex' }}>
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ padding: '20px' }}>
                        {/* Info actual */}
                        <div style={{ background: '#F8F8F7', borderRadius: 10, padding: '12px 14px', marginBottom: 18, display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>ESTADO ACTUAL</p>
                                <StatusBadge status={currentStatus} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginBottom: 4 }}>PLAN VENCE</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#1e2320' }}>{fmtDate(user.paid_until)}</p>
                            </div>
                        </div>

                        {/* Selector de meses */}
                        <p style={{ fontSize: 12, color: '#4B5563', marginBottom: 10, fontWeight: 600 }}>
                            ¿Cuántos meses querés agregar?
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            {[1, 2, 3, 6, 12].map(m => (
                                <button key={m} onClick={() => setMonths(m)} style={{
                                    flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
                                    border: months === m ? '2px solid #334139' : '1.5px solid #E5E7EB',
                                    background: months === m ? '#334139' : '#fff',
                                    color: months === m ? '#fff' : '#374151',
                                    fontSize: 12, fontWeight: 700,
                                    transition: 'all .13s',
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
                                    background: '#F0FDF4', borderRadius: 10, padding: '10px 14px',
                                    border: '1px solid #BBF7D0', marginBottom: 18,
                                    display: 'flex', alignItems: 'center', gap: 8
                                }}>
                                    <Calendar size={14} color="#15803D" />
                                    <div>
                                        <span style={{ fontSize: 11, color: '#15803D', fontWeight: 600 }}>
                                            Nuevo vencimiento: {' '}
                                        </span>
                                        <span style={{ fontSize: 13, color: '#14532D', fontWeight: 800 }}>
                                            {fmtDate(newDate.toISOString())}
                                        </span>
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
                                width: '100%', height: 44, borderRadius: 10,
                                background: loading ? '#9CA3AF' : '#334139', color: '#fff', border: 'none',
                                fontSize: 13, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                transition: 'background .13s',
                            }}
                        >
                            <Zap size={15} />
                            {loading ? 'Guardando...' : `Activar ${months} mes${months > 1 ? 'es' : ''}`}
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
        <div style={{ fontFamily: "'Inter', sans-serif", height: '100%', overflowY: 'auto', background: '#F5F5F3', padding: 24 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#282A28', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={16} color="#DCED31" />
                        </div>
                        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#1e2320', letterSpacing: '-.03em', margin: 0 }}>
                            Panel Admin
                        </h1>
                    </div>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                        Gestión de suscripciones · {rows.length} usuarios
                        {lastRefresh && ` · Actualizado ${lastRefresh.toLocaleTimeString('es-AR')}`}
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 8,
                        background: '#282A28', color: '#fff', border: 'none',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        opacity: loading ? .6 : 1,
                    }}
                >
                    <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    Actualizar
                </button>
            </div>

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
                {/* Botón TODOS */}
                <div
                    onClick={() => setFilter('all')}
                    style={{
                        background: filterStatus === 'all' ? '#282A28' : '#fff',
                        border: `1.5px solid ${filterStatus === 'all' ? '#282A28' : '#E8E8E6'}`,
                        borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                        transition: 'all .13s',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <User size={14} color={filterStatus === 'all' ? '#DCED31' : '#6B7280'} />
                        <span style={{ fontSize: 22, fontWeight: 900, color: filterStatus === 'all' ? '#fff' : '#1e2320' }}>
                            {rows.length}
                        </span>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: filterStatus === 'all' ? '#DCED31' : '#6B7280', margin: 0 }}>Todos</p>
                </div>
                {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'sin_datos').map(([key, cfg]) => {
                    const Icon = cfg.icon
                    return (
                        <div
                            key={key}
                            onClick={() => setFilter(filterStatus === key ? 'all' : key)}
                            style={{
                                background: filterStatus === key ? cfg.bg : '#fff',
                                border: `1.5px solid ${filterStatus === key ? cfg.color : '#E8E8E6'}`,
                                borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                                transition: 'all .13s',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <Icon size={14} color={cfg.color} />
                                <span style={{ fontSize: 22, fontWeight: 900, color: filterStatus === key ? cfg.color : '#1e2320' }}>
                                    {counts[key] || 0}
                                </span>
                            </div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: cfg.color, margin: 0 }}>{cfg.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Buscador */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por email o ID..."
                    style={{
                        width: '100%', height: 38, paddingLeft: 36, paddingRight: 12,
                        borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 12,
                        fontFamily: "'Inter', sans-serif", outline: 'none',
                        background: '#fff', color: '#1e2320', boxSizing: 'border-box',
                    }}
                />
            </div>

            {/* Tabla */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8E8E6', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <RefreshCw size={24} color="#9CA3AF" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: 13, color: '#9CA3AF' }}>Cargando usuarios...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <User size={24} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
                        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No hay usuarios con ese filtro.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #F0F0EE' }}>
                                {['Email', 'Estado', 'PRO desde', 'Plan hasta', 'Acción'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 16px', textAlign: 'left',
                                        fontSize: 10, fontWeight: 700, color: '#9CA3AF',
                                        textTransform: 'uppercase', letterSpacing: '.06em',
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
                                        borderBottom: i < filtered.length - 1 ? '1px solid #F8F8F7' : 'none',
                                        transition: 'background .1s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            <div>
                                                <p style={{ fontSize: 12, fontWeight: 600, color: '#1e2320', margin: 0 }}>
                                                    {row.email || 'Sin email'}
                                                </p>
                                                <p style={{ fontSize: 9, fontFamily: 'monospace', color: '#9CA3AF', margin: '2px 0 0' }}>
                                                    {row.user_id ? row.user_id.slice(0, 12) + '...' : '—'}
                                                </p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <StatusBadge status={status} />
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#4B5563', whiteSpace: 'nowrap' }}>
                                            {fmtDate(row.pro_since)}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#4B5563', whiteSpace: 'nowrap' }}>
                                            {fmtDate(row.paid_until)}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    onClick={() => setSelected(row)}
                                                    style={{
                                                        padding: '5px 10px', borderRadius: 6,
                                                        background: status === 'active' ? '#F0FDF4' : '#334139',
                                                        color: status === 'active' ? '#15803D' : '#fff',
                                                        border: status === 'active' ? '1px solid #BBF7D0' : 'none',
                                                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    <Zap size={11} />
                                                    {status === 'active' ? 'Extender' : 'Activar'}
                                                </button>
                                                {status === 'active' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`¿Desactivar PRO de ${row.email}? Quedará suspendido inmediatamente.`)) return
                                                            const pastDate = new Date(2020, 0, 1).toISOString()
                                                            await supabase
                                                                .from('subscriptions')
                                                                .update({ paid_until: null, pro_since: null, trial_until: pastDate })
                                                                .eq('user_id', row.user_id)
                                                            fetchData()
                                                        }}
                                                        style={{
                                                            padding: '5px 10px', borderRadius: 6,
                                                            background: '#FEF2F2', color: '#DC2626',
                                                            border: '1px solid #FECACA',
                                                            fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: 4,
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        <AlertCircle size={11} />
                                                        Desactivar
                                                    </button>
                                                )}
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
