"use client"

import React, { useState, useEffect } from 'react'
import {
    FileText, Plus, Download, Search, Filter, Trash2, ShoppingCart,
    ChevronDown, Calendar, User, Clock, CheckCircle, XCircle,
    AlertCircle, Menu, TrendingUp, Package, Eye, MoreHorizontal
} from 'lucide-react'
import { generarPDFPresupuesto } from '../../utils/presupuestoGenerator'

/* ── PALETA ─────────────────────────────────────── */
const bg = '#F5F5F5'
const surface = '#FAFAFA'
const border = 'rgba(48,54,47,.13)'
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'
const lime = '#DCED31'
const cardShadow = '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)'

const fNum = (n) => (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fDate = (s) => { try { return new Date(s + (s.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) } catch { return s || '—' } }

/* ── ESTADO PILL ─────────────────────────────────── */
const estadoCfg = {
    vigente: { bg: 'rgba(51,65,57,.1)', fg: accent, dot: accent, label: 'Vigente' },
    vencido: { bg: 'rgba(139,137,130,.1)', fg: ct3, dot: ct3, label: 'Vencido' },
    aceptado: { bg: 'rgba(55,180,100,.1)', fg: '#1a6b3c', dot: '#1a6b3c', label: 'Aceptado' },
    rechazado: { bg: 'rgba(220,38,38,.08)', fg: '#991b1b', dot: '#DC2626', label: 'Rechazado' },
}

const EstadoPill = ({ estado }) => {
    const cfg = estadoCfg[estado] || estadoCfg.vigente
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: cfg.bg }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: cfg.fg, letterSpacing: '.01em' }}>{cfg.label}</span>
        </span>
    )
}

/* ── HELPERS ─────────────────────────────────────── */
const calcEstado = (pres) => {
    if (pres.estado && pres.estado !== 'vigente') return pres.estado
    const vencimiento = new Date(pres.fecha_vencimiento || pres.fecha)
    if (pres.validez) vencimiento.setDate(new Date(pres.fecha).getDate() + parseInt(pres.validez))
    return vencimiento < new Date() ? 'vencido' : 'vigente'
}

/* ════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════ */
const Presupuestos = ({
    presupuestos = [],
    clientes = [],
    productos = [],
    openModal,
    onOpenMobileSidebar,
    eliminarPresupuesto,
    actualizarEstadoPresupuesto,
    convertirPresupuestoPedido,
}) => {
    const [search, setSearch] = useState('')
    const [filtroEstado, setFiltro] = useState('todos')
    const [menuAbierto, setMenu] = useState(null)

    /* ── Métricas ──────────────────────────────────── */
    const vigentes = presupuestos.filter(p => calcEstado(p) === 'vigente').length
    const aceptados = presupuestos.filter(p => calcEstado(p) === 'aceptado').length
    const vencidos = presupuestos.filter(p => calcEstado(p) === 'vencido').length
    const totalVal = presupuestos.filter(p => calcEstado(p) === 'aceptado').reduce((s, p) => s + (parseFloat(p.total) || 0), 0)

    /* ── Filtrado ──────────────────────────────────── */
    const filtrados = presupuestos
        .filter(p => {
            const q = search.toLowerCase()
            const match = !q || (p.numero || '').toLowerCase().includes(q) || (p.cliente || '').toLowerCase().includes(q)
            const estado = calcEstado(p)
            const matchE = filtroEstado === 'todos' || estado === filtroEstado
            return match && matchE
        })
        .sort((a, b) => new Date(b.created_at || b.fecha) - new Date(a.created_at || a.fecha))

    /* ── Descargar PDF ──────────────────────────────── */
    const handlePDF = (pres) => {
        generarPDFPresupuesto({
            numero: pres.numero,
            fecha: pres.fecha,
            validez: pres.validez,
            cliente: pres.cliente,
            items: JSON.parse(pres.items || '[]'),
            iva: pres.iva ?? 21,
            incluirIva: pres.incluir_iva ?? true,
            observaciones: pres.observaciones || '',
            condicionesPago: pres.condiciones_pago || '',
            nombreEmpresa: pres.nombre_empresa || localStorage.getItem('gestify_empresa') || '',
            subtotalGeneral: pres.subtotal || 0,
            ivaValor: pres.iva_valor || 0,
            total: pres.total || 0,
        })
    }

    /* ── Cerrar menu al click fuera ─────────────────── */
    useEffect(() => {
        const handler = () => setMenu(null)
        window.addEventListener('click', handler)
        return () => window.removeEventListener('click', handler)
    }, [])

    return (
        <div style={{ width: '100%', minHeight: '100vh', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes kpiIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .pres-row:hover { background: rgba(51,65,57,.035) !important; }
        .pres-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(48,54,47,.12); }
        .btn-action:hover { background: rgba(51,65,57,.12) !important; }
      `}</style>

            {/* ═══ TOPBAR ════════════════════════════════ */}
            <header style={{ height: 52, padding: '0 20px', background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button onClick={onOpenMobileSidebar}
                    className="md:hidden"
                    style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Menu size={14} strokeWidth={2} />
                </button>

                {/* Search */}
                <div style={{ height: 30, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '0 10px', flex: 1, maxWidth: 220 }}>
                    <Search size={11} strokeWidth={2} style={{ color: 'rgba(255,255,255,.4)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Buscar presupuesto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 11.5, color: '#fff', width: '100%', fontFamily: 'Inter,sans-serif' }}
                    />
                </div>

                <div style={{ flex: 1 }} />

                {/* Nuevo presupuesto */}
                <button
                    onClick={() => openModal && openModal('nuevo-presupuesto')}
                    style={{ height: 30, padding: '0 12px', borderRadius: 8, background: lime, border: '1px solid ' + lime, color: '#282A28', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter,sans-serif' }}>
                    <Plus size={12} strokeWidth={2.5} />
                    <span className="hidden md:inline">Nuevo Presupuesto</span>
                    <span className="md:hidden">Nuevo</span>
                </button>
            </header>

            {/* ═══ CONTENT ═══════════════════════════════ */}
            <main style={{ padding: 'clamp(14px,3vw,28px)', maxWidth: 1200, margin: '0 auto' }}>

                {/* Page header */}
                <div style={{ marginBottom: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(51,65,57,.15)` }}>
                            <FileText size={15} strokeWidth={2} style={{ color: accent }} />
                        </div>
                        <h1 style={{ fontSize: 'clamp(18px,3.5vw,24px)', fontWeight: 800, color: ct1, letterSpacing: '-0.03em', margin: 0 }}>Presupuestos</h1>
                    </div>
                    <p style={{ fontSize: 12, color: ct3, margin: 0 }}>Creá, descargá y convertí presupuestos en ventas</p>
                </div>

                {/* ── KPI Cards ──────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Total', value: presupuestos.length, icon: FileText, color: ct3, delay: 0 },
                        { label: 'Vigentes', value: vigentes, icon: Clock, color: accent, delay: 1 },
                        { label: 'Aceptados', value: aceptados, icon: CheckCircle, color: '#1a6b3c', delay: 2 },
                        { label: 'Facturado', value: `$${fNum(totalVal)}`, icon: TrendingUp, color: accent, delay: 3 },
                    ].map(({ label, value, icon: Icon, color, delay }) => (
                        <div key={label} className="pres-card"
                            style={{ background: '#E1E1E0', borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, padding: '14px 16px', transition: 'all .2s', animation: `kpiIn .4s ${.05 + delay * .07}s ease both`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `rgba(51,65,57,.07)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={15} strokeWidth={2} style={{ color }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 22, fontWeight: 800, color: ct1, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>{value}</p>
                                <p style={{ fontSize: 11, fontWeight: 600, color: ct3, margin: '3px 0 0' }}>{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filtros ──────────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    {['todos', 'vigente', 'aceptado', 'vencido', 'rechazado'].map(f => (
                        <button key={f} onClick={() => setFiltro(f)}
                            style={{
                                height: 28, padding: '0 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .13s', fontFamily: 'Inter,sans-serif',
                                background: filtroEstado === f ? ct1 : 'transparent',
                                color: filtroEstado === f ? '#fff' : ct3,
                                border: filtroEstado === f ? `1px solid ${ct1}` : `1px solid ${border}`,
                            }}>
                            {f === 'todos' ? 'Todos' : estadoCfg[f]?.label || f}
                        </button>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: ct3 }}>{filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}</span>
                </div>

                {/* ── Tabla ──────────────────────────────── */}
                <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, overflow: 'hidden' }}>

                    {/* Header tabla */}
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 100px 90px 110px', gap: 0, padding: '8px 14px', borderBottom: `1px solid ${border}`, background: '#EFEFED' }}>
                        {['Número', 'Cliente', 'Fecha', 'Válido', 'Total', 'Estado'].map(h => (
                            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
                        ))}
                    </div>

                    {filtrados.length === 0 ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <FileText size={36} style={{ color: border, marginBottom: 12 }} />
                            <p style={{ fontSize: 13, fontWeight: 600, color: ct2, margin: '0 0 5px' }}>Sin presupuestos</p>
                            <p style={{ fontSize: 11, color: ct3, margin: '0 0 16px' }}>
                                {search ? 'No hay resultados para tu búsqueda' : 'Creá tu primer presupuesto con el botón superior'}
                            </p>
                            {!search && (
                                <button onClick={() => openModal && openModal('nuevo-presupuesto')}
                                    style={{ height: 34, padding: '0 16px', borderRadius: 8, background: ct1, color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <Plus size={12} strokeWidth={2.5} /> Nuevo Presupuesto
                                </button>
                            )}
                        </div>
                    ) : (
                        filtrados.map((pres, idx) => {
                            const estado = calcEstado(pres)
                            const items = (() => { try { return JSON.parse(pres.items || '[]') } catch { return [] } })()
                            return (
                                <div key={pres.id} className="pres-row"
                                    style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 100px 90px 110px', gap: 0, padding: '11px 14px', borderBottom: idx < filtrados.length - 1 ? `1px solid ${border}` : 'none', transition: 'background .13s', alignItems: 'center' }}>

                                    {/* Número */}
                                    <div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: ct1, fontVariantNumeric: 'tabular-nums' }}>{pres.numero}</span>
                                    </div>

                                    {/* Cliente */}
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: ct1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {pres.cliente || <span style={{ color: ct3, fontWeight: 400 }}>Sin cliente</span>}
                                        </p>
                                        <p style={{ fontSize: 10, color: ct3, margin: '2px 0 0' }}>{items.length} producto{items.length !== 1 ? 's' : ''}</p>
                                    </div>

                                    {/* Fecha */}
                                    <div style={{ fontSize: 11, color: ct2 }}>{fDate(pres.fecha)}</div>

                                    {/* Validez */}
                                    <div style={{ fontSize: 11, color: ct3 }}>{pres.validez ?? 7} días</div>

                                    {/* Total */}
                                    <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>${fNum(pres.total)}</div>

                                    {/* Estado + Acciones */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                        <EstadoPill estado={estado} />
                                        {/* Menú acciones */}
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                className="btn-action"
                                                onClick={e => { e.stopPropagation(); setMenu(menuAbierto === pres.id ? null : pres.id) }}
                                                style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct3, transition: 'all .13s' }}>
                                                <MoreHorizontal size={13} strokeWidth={2} />
                                            </button>

                                            {menuAbierto === pres.id && (
                                                <div onClick={e => e.stopPropagation()}
                                                    style={{ position: 'absolute', right: 0, top: 30, width: 180, background: '#fff', borderRadius: 10, border: `1px solid ${border}`, boxShadow: '0 8px 28px rgba(0,0,0,.12)', zIndex: 100, overflow: 'hidden' }}>
                                                    {[
                                                        { icon: Download, label: 'Descargar PDF', fn: () => { handlePDF(pres); setMenu(null) }, color: ct2 },
                                                        { icon: ShoppingCart, label: 'Convertir en Venta', fn: () => { convertirPresupuestoPedido?.(pres); setMenu(null) }, color: accent },
                                                        { icon: CheckCircle, label: 'Marcar Aceptado', fn: () => { actualizarEstadoPresupuesto?.(pres.id, 'aceptado'); setMenu(null) }, color: '#1a6b3c' },
                                                        { icon: XCircle, label: 'Marcar Rechazado', fn: () => { actualizarEstadoPresupuesto?.(pres.id, 'rechazado'); setMenu(null) }, color: '#991b1b' },
                                                        { icon: Trash2, label: 'Eliminar', fn: () => { if (confirm('¿Eliminar este presupuesto?')) { eliminarPresupuesto?.(pres.id); setMenu(null) } }, color: '#DC2626' },
                                                    ].map(({ icon: Icon, label, fn, color }) => (
                                                        <button key={label} onClick={fn}
                                                            style={{ width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, fontWeight: 500, color, fontFamily: 'Inter,sans-serif', textAlign: 'left', transition: 'background .1s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = accentL}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                            <Icon size={13} strokeWidth={2} /> {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* ── SQL hint ──────────────────────────────── */}
                {presupuestos.length === 0 && (
                    <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 10, background: 'rgba(51,65,57,.05)', border: `1px solid rgba(51,65,57,.15)` }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: accent, margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertCircle size={12} /> Tabla requerida en Supabase
                        </p>
                        <p style={{ fontSize: 10.5, color: ct3, margin: 0, lineHeight: 1.6 }}>
                            Crear la tabla <strong>presupuestos</strong> con el SQL que se muestra en la documentación del módulo.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Presupuestos
