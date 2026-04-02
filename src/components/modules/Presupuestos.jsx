"use client"

import React, { useState, useEffect } from 'react'
import {
    FileText, Plus, Download, Search, Filter, Trash2, ShoppingCart,
    ChevronDown, Calendar, User, Clock, CheckCircle, XCircle,
    AlertCircle, Menu, TrendingUp, Package, Eye, MoreHorizontal, Edit2
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
const lime = '#4ADE80'
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
    const [menuPos,     setMenuPos] = useState({ top: 0, left: 0 })

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

    /* ── Atajo: Abrir modal con tecla Ctrl sola ───────────── */
    useEffect(() => {
        let ctrlPressed = false
        let otherKeyPressed = false

        const handleKeyDown = (e) => {
            if (e.key === 'Control') {
                ctrlPressed = true
            } else if (ctrlPressed) {
                otherKeyPressed = true
            }
        }

        const handleKeyUp = (e) => {
            if (e.key === 'Control') {
                if (!otherKeyPressed && openModal) {
                    const active = document.activeElement
                    const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
                    if (!isInput) {
                        openModal('nuevo-presupuesto')
                    }
                }
                ctrlPressed = false
                otherKeyPressed = false
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [openModal])

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes kpiIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .pres-row:hover { background: rgba(51,65,57,.035) !important; }
        .pres-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(48,54,47,.12); }
        .btn-action:hover { background: rgba(51,65,57,.12) !important; }
        
        /* ── Responsive Table ── */
        .pres-grid { display: grid; grid-template-columns: 110px 1fr 110px 100px 90px 180px; gap: 0; align-items: center; }
        .pres-col-label { display: none; font-size: 11px; font-weight: 600; color: #8B8982; text-transform: uppercase; letter-spacing: .05em; }
        
        @media (max-width: 800px) {
            .pres-header-row { display: none !important; }
            .pres-grid { display: flex !important; flex-direction: column; align-items: stretch !important; gap: 8px !important; padding: 16px 14px !important; }
            .pres-grid > div { display: flex; justify-content: space-between; align-items: center; width: 100%; min-width: 0; }
            .pres-col-label { display: block; }
            
            /* Specific column adjustments */
            .pres-col-cliente { flex-direction: column; align-items: flex-end !important; text-align: right; }
            .pres-col-cliente p { max-width: 100%; }
            .pres-col-estado { border-top: 1px solid rgba(48,54,47,.08); padding-top: 12px; margin-top: 4px; }
        }
      `}</style>

            {/* ═══════════ HEADER ═══════════ */}
            <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 clamp(12px, 3vw, 24px)', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0, flexWrap: 'wrap', py: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button 
                        onClick={onOpenMobileSidebar} 
                        id="pres-hamburger"
                        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" 
                        style={{ 
                            background: 'rgba(255,255,255,.06)', 
                            border: '1px solid rgba(255,255,255,.12)', 
                            color: 'rgba(255,255,255,.7)',
                            display: 'none'
                        }}
                    >
                        <Menu size={16} strokeWidth={2} />
                    </button>
                    <style>{`
                        #pres-hamburger { display: none !important; }
                        @media (max-width: 1023px) { 
                            #pres-hamburger { display: flex !important; } 
                        }
                    `}</style>
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Comercial</p>
                        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Presupuestos</h2>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {/* Nuevo Presupuesto */}
                    <button onClick={() => openModal && openModal("nuevo-presupuesto")} style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
                        fontSize: 11, fontWeight: 700, border: '1px solid #4ADE80', cursor: 'pointer', transition: 'all .13s',
                        background: '#4ADE80', color: '#0A1A0E',
                    }}>
                        <Plus size={12} strokeWidth={2.5} /> Nuevo Presupuesto
                        <span className="hidden sm:inline-block" style={{ marginLeft: 4, padding: '2px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontSize: 9, fontFamily: "'DM Mono', monospace" }}>Ctrl</span>
                    </button>
                </div>
            </header>

            {/* ═══ CONTENT ═══════════════════════════════ */}
            <main style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 24px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

                {/* Toolbar & Controles Superiores */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
                        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
                        <input
                            type="text"
                            placeholder="Buscar presupuesto..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', height: 32, padding: '0 12px 0 30px', fontSize: 12, color: ct1, background: surface, border: `1px solid ${border}`, borderRadius: 8, outline: 'none', transition: 'all .15s' }}
                            onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border}
                        />
                    </div>
                </div>



                {/* ═══════════ CARDS RESUMEN ═══════════ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Total', val: presupuestos.length, icon: FileText, clr: '#373F47' },
                        { label: 'Vigentes', val: vigentes, icon: Clock, clr: '#334139' },
                        { label: 'Aceptados', val: aceptados, icon: CheckCircle, clr: '#065F46' },
                        { label: 'Facturado', val: `$${fNum(totalVal)}`, icon: TrendingUp, clr: '#991B1B' },
                    ].map((s, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border relative flex flex-col justify-center cursor-default"
                            style={{ background: '#E1E1E0', borderRadius: 12, border: `1px solid ${border}`, boxShadow: cardShadow, height: 76, padding: '0 20px', transition: 'box-shadow .2s,transform .2s', animation: `kpiIn .35s ${.05 + i * .07}s ease both` }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(48,54,47,.11),0 14px 36px rgba(48,54,47,.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = cardShadow }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${s.clr}15, transparent 70%)` }} />
                            {/* barra lateral de color */}
                            <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: s.clr, borderRadius: '0 2px 2px 0' }} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: ct3, textTransform: 'uppercase', letterSpacing: '.03em', display: 'block', marginBottom: 2 }}>{s.label}</span>
                                    <span style={{ fontSize: 20, fontWeight: 600, color: ct1, letterSpacing: '-.03em', display: 'block', lineHeight: 1.1 }}>{s.val}</span>
                                </div>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${s.clr}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <s.icon size={15} strokeWidth={2.5} style={{ color: s.clr }} />
                                </div>
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
                <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

                    {/* Header tabla */}
                    <div className="pres-header-row pres-grid" style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, background: '#EFEFED', flexShrink: 0 }}>
                        {['Número', 'Cliente', 'Fecha', 'Válido', 'Total', 'Estado'].map(h => (
                            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
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
                                    <Plus size={12} strokeWidth={2.5} /> Nuevo Presupuesto <span style={{ fontSize: 9, opacity: 0.6, background: 'rgba(255,255,255,0.15)', padding: '1px 4px', borderRadius: 4, marginLeft: 2, fontFamily: "'DM Mono', monospace" }}>Ctrl</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        filtrados.map((pres, idx) => {
                            const estado = calcEstado(pres)
                            const items = (() => { try { return JSON.parse(pres.items || '[]') } catch { return [] } })()
                            return (
                                <div key={pres.id} className="pres-row pres-grid"
                                    style={{ padding: '11px 14px', borderBottom: idx < filtrados.length - 1 ? `1px solid ${border}` : 'none', transition: 'background .13s' }}>

                                    {/* Número */}
                                    <div>
                                        <span className="pres-col-label">Número</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: ct1, fontVariantNumeric: 'tabular-nums' }}>{pres.numero}</span>
                                    </div>

                                    {/* Cliente */}
                                    <div className="pres-col-cliente">
                                        <span className="pres-col-label" style={{ alignSelf: 'flex-start' }}>Cliente</span>
                                        <div>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: ct1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {pres.cliente || <span style={{ color: ct3, fontWeight: 400 }}>Sin cliente</span>}
                                            </p>
                                            <p style={{ fontSize: 10, color: ct3, margin: '2px 0 0' }}>{items.length} producto{items.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>

                                    {/* Fecha */}
                                    <div>
                                        <span className="pres-col-label">Fecha</span>
                                        <div style={{ fontSize: 11, color: ct2 }}>{fDate(pres.fecha)}</div>
                                    </div>

                                    {/* Validez */}
                                    <div>
                                        <span className="pres-col-label">Válido</span>
                                        <div style={{ fontSize: 11, color: ct3 }}>{pres.validez ?? 7} días</div>
                                    </div>

                                    {/* Total */}
                                    <div>
                                        <span className="pres-col-label">Total</span>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>${fNum(pres.total)}</div>
                                    </div>

                                    {/* Estado + Acciones */}
                                    <div className="pres-col-estado" style={{ gap: 6 }}>
                                        <EstadoPill estado={estado} />

                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {/* Acción Rápida: Descargar PDF */}
                                            <button onClick={e => { e.stopPropagation(); handlePDF(pres) }} title="Descargar PDF"
                                                style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct3, transition: 'all .13s' }}
                                                onMouseEnter={e => { e.currentTarget.style.color = ct2; e.currentTarget.style.background = 'rgba(51,65,57,.06)' }}
                                                onMouseLeave={e => { e.currentTarget.style.color = ct3; e.currentTarget.style.background = 'transparent' }}>
                                                <Download size={13} strokeWidth={2.5} />
                                            </button>

                                            {/* Menú acciones secundarias */}
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    className="btn-action"
                                                    onClick={e => {
                                                        e.stopPropagation()
                                                        if (menuAbierto === pres.id) { setMenu(null); return }
                                                        const r = e.currentTarget.getBoundingClientRect()
                                                        const menuH = 200
                                                        const abreArriba = r.bottom + menuH > window.innerHeight - 16
                                                        setMenuPos({
                                                            top: abreArriba ? r.top - menuH - 4 : r.bottom + 4,
                                                            left: Math.min(r.right - 180, window.innerWidth - 196)
                                                        })
                                                        setMenu(pres.id)
                                                    }}
                                                    style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct3, transition: 'all .13s' }}>
                                                    <MoreHorizontal size={13} strokeWidth={2} />
                                                </button>

                                                {menuAbierto === pres.id && (
                                                    <div onClick={e => e.stopPropagation()}
                                                        style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: 180, background: '#fff', borderRadius: 10, border: `1px solid ${border}`, boxShadow: '0 8px 28px rgba(0,0,0,.12)', zIndex: 9999, overflow: 'hidden' }}>
                                                        {[
                                                            {
                                                                icon: ShoppingCart, label: 'Convertir en Venta', color: accent, fn: () => {
                                                                    const itemsParsed = typeof pres.items === 'string' ? JSON.parse(pres.items) : (pres.items || []);
                                                                    const pedidoData = {
                                                                        cliente_nombre: pres.cliente || '',
                                                                        notas: `Ref: Presupuesto ${pres.numero}`,
                                                                        items: itemsParsed.map((it, idx) => ({
                                                                            id: Date.now() + idx,
                                                                            productoId: it.productoId || null,
                                                                            producto: it.producto || it.descripcion,
                                                                            precio: parseFloat(it.precio) || 0,
                                                                            cantidad: parseFloat(it.cantidad) || 1,
                                                                            subtotal: parseFloat(it.subtotal) || 0
                                                                        }))
                                                                    }
                                                                    openModal && openModal('nuevo-pedido', pedidoData);
                                                                    setMenu(null)
                                                                }
                                                            },
                                                            { icon: CheckCircle, label: 'Marcar Aceptado', fn: () => { actualizarEstadoPresupuesto?.(pres.id, 'aceptado'); setMenu(null) }, color: '#1a6b3c' },
                                                            { icon: XCircle, label: 'Marcar Rechazado', fn: () => { actualizarEstadoPresupuesto?.(pres.id, 'rechazado'); setMenu(null) }, color: '#991b1b' },
                                                            { icon: Edit2, label: 'Editar Presupuesto', fn: () => { openModal && openModal('editar-presupuesto', pres); setMenu(null) }, color: ct2 },
                                                            { icon: Trash2, label: 'Eliminar Presupuesto', fn: () => { if (confirm('¿Eliminar este presupuesto?')) { eliminarPresupuesto?.(pres.id) }; setMenu(null) }, color: '#DC2626' },
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
                                </div>
                            )
                        })
                    )}
                    </div>
                </div>


            </main>
        </div>
    )
}

export default Presupuestos
