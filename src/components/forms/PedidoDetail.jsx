"use client"

import {
    Package, User, Calendar, DollarSign, FileText, Clock,
    CheckCircle, XCircle, Truck, AlertCircle, CreditCard,
    Edit2, Banknote, BadgeCheck, Pencil, ShoppingBag
} from "lucide-react"
import { useState, useEffect } from "react"

/* ─── tokens del sistema ─────────────────────────────────── */
const SYS = {
    bg: '#F5F5F3',
    surface: '#FFFFFF',
    surface2: '#F5F5F3',
    border: 'rgba(48,54,47,.12)',
    ct1: '#1e2320',
    ct2: '#30362F',
    ct3: '#8B8982',
    accent: '#334139',
    accentL: 'rgba(51,65,57,.08)',
    lime: '#4ADE80',
    header: '#282A28',
}

const PedidoDetail = ({ pedido, clientes = [], facturas = [], formActions, closeModal, abonos = [] }) => {
    const [montoAbono, setMontoAbono] = useState('')
    const [metodoCobro, setMetodoCobro] = useState('Efectivo')
    const [editandoPago, setEditandoPago] = useState(false)
    const [notas, setNotas] = useState(pedido?.notas || '')
    const [cargando, setCargando] = useState(false)
    const [mensajeExito, setMensajeExito] = useState('')
    const [editandoFecha, setEditandoFecha] = useState(false)
    const [fechaEntrega, setFechaEntrega] = useState(pedido?.fecha_entrega_estimada || '')

    useEffect(() => {
        setNotas(pedido?.notas || '')
        setFechaEntrega(pedido?.fecha_entrega_estimada || '')
    }, [pedido])

    /* helpers */
    const items = typeof pedido?.items === 'string'
        ? JSON.parse(pedido.items || '[]')
        : (pedido?.items || [])

    // Ganancia: solo items que tienen costo cargado
    const itemsConGanancia = items.filter(i => parseFloat(i.costo) > 0)
    const gananciaTotal = itemsConGanancia.reduce((s, i) => s + (parseFloat(i.ganancia) || 0), 0)
    const hayGanancia = itemsConGanancia.length > 0

    const fFecha = (f) => {
        if (!f) return '—'
        try { return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
        catch { return '—' }
    }

    const fMonto = (m) => (parseFloat(m) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const estadosConfig = {
        pendiente: { label: 'Pendiente', color: '#b45309', bg: '#fef3c7', border: '#fde68a', icon: Clock },
        preparando: { label: 'Preparando', color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', icon: Package },
        enviado: { label: 'Enviado', color: '#6d28d9', bg: '#ede9fe', border: '#ddd6fe', icon: Truck },
        entregado: { label: 'Entregado', color: '#15803d', bg: '#dcfce7', border: '#bbf7d0', icon: CheckCircle },
        cancelado: { label: 'Cancelado', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca', icon: XCircle },
    }

    const estadoActual = estadosConfig[pedido?.estado] || estadosConfig.pendiente
    const EstadoIcon = estadoActual.icon
    const cliente = clientes.find(c => c.id === pedido?.cliente_id)

    const total = parseFloat(pedido?.total) || 0
    const montoAbonado = parseFloat(pedido?.monto_abonado) || 0
    const saldoPendiente = pedido?.saldo_pendiente !== null && pedido?.saldo_pendiente !== undefined
        ? parseFloat(pedido.saldo_pendiente)
        : total - montoAbonado
    const estaPagadoCompleto = saldoPendiente <= 0.01
    const porcentajePagado = total > 0 ? Math.min(100, (montoAbonado / total) * 100) : 0

    const mostrarExito = (msg) => { setMensajeExito(msg); setTimeout(() => setMensajeExito(''), 3000) }

    /* handlers — sin cambios de lógica */
    const handleRegistrarAbonoDirecto = async () => {
        const monto = parseFloat(montoAbono)
        if (!monto || monto <= 0 || monto > saldoPendiente) { alert('Ingrese un monto válido (mayor a 0 y no mayor al saldo pendiente)'); return }
        if (!formActions?.agregarAbonoAPedido) { alert('Función de pago no disponible'); return }
        setCargando(true)
        try {
            const r = await formActions.agregarAbonoAPedido(pedido.id, monto, metodoCobro)
            if (r.success) {
                mostrarExito(`✅ Abono de $${fMonto(monto)} registrado`)
                setMontoAbono(''); setEditandoPago(false)
                if (formActions.recargarTodosLosDatos) formActions.recargarTodosLosDatos()
            } else { alert('❌ Error: ' + r.mensaje) }
        } catch (e) { alert('❌ Error: ' + e.message) }
        finally { setCargando(false) }
    }

    const handleMarcarPagadoDirecto = async () => {
        if (estaPagadoCompleto) return
        if (!window.confirm(`¿Registrar pago total del saldo restante?\n\nSaldo a saldar: $${fMonto(saldoPendiente)}`)) return
        if (!formActions?.marcarPedidoPagadoTotal) { alert('Función no disponible'); return }
        setCargando(true)
        try {
            const r = await formActions.marcarPedidoPagadoTotal(pedido.id, metodoCobro)
            if (r.success) { mostrarExito('✅ Venta saldada completamente'); if (formActions.recargarTodosLosDatos) formActions.recargarTodosLosDatos() }
            else { alert('❌ Error: ' + r.mensaje) }
        } catch (e) { alert('❌ Error: ' + e.message) }
        finally { setCargando(false) }
    }

    const handleCambiarEstado = async (nuevoEstado) => {
        if (!formActions?.actualizarEstadoPedido || pedido?.estado === nuevoEstado) return
        if (!window.confirm(`¿Cambiar estado a ${estadosConfig[nuevoEstado]?.label || nuevoEstado}?`)) return
        try {
            const r = await formActions.actualizarEstadoPedido(pedido.id, nuevoEstado)
            if (r.success) { mostrarExito('✅ Estado actualizado'); if (formActions.recargarTodosLosDatos) formActions.recargarTodosLosDatos() }
            else { alert('❌ Error: ' + r.mensaje) }
        } catch (e) { alert('❌ Error: ' + e.message) }
    }

    const handleGuardarNotas = async () => {
        if (!formActions?.actualizarNotasPedido) return
        try {
            const r = await formActions.actualizarNotasPedido(pedido.id, notas)
            if (r.success) mostrarExito('✅ Notas guardadas')
            else alert('❌ Error: ' + r.mensaje)
        } catch (e) { alert('❌ Error: ' + e.message) }
    }

    const handleGuardarFechaEntrega = async () => {
        if (!formActions?.actualizarPedido) { alert('Función no disponible'); return }
        try {
            const r = await formActions.actualizarPedido(pedido.id, { fecha_entrega_estimada: fechaEntrega || null })
            if (r?.success) { mostrarExito('✅ Fecha de entrega actualizada'); setEditandoFecha(false); if (formActions.recargarTodosLosDatos) formActions.recargarTodosLosDatos() }
            else { alert('❌ Error: ' + (r?.mensaje || 'Error desconocido')) }
        } catch (e) { alert('❌ Error: ' + e.message) }
    }

    /* ─── render ─────────────────────────────────────────────── */
    return (
        <div className="pd-root" style={{ width: '100%', maxWidth: 480, margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased' }}>
            <style>{`
                .pd-root * { scrollbar-width: none; -ms-overflow-style: none; }
                .pd-root *::-webkit-scrollbar { display: none; width: 0; height: 0; }
                .pd-card { padding: 6px 10px; border-radius: 8px; }
            `}</style>

            {/* ── Mensaje éxito ── */}
            {mensajeExito && (
                <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
                    fontSize: 11, fontWeight: 600, padding: '6px 10px', borderRadius: 8,
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                }}>
                    <BadgeCheck size={13} /> {mensajeExito}
                </div>
            )}

            {/* ══ HEADER ══ */}
            <div style={{ background: SYS.header, borderRadius: 10, padding: '8px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: SYS.accentL, border: `1px solid rgba(74,222,128,.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={15} color={SYS.lime} />
                    </div>
                    <div>
                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 1 }}>
                            Detalle Venta
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-.02em', lineHeight: 1, margin: 0 }}>
                            {pedido?.codigo || 'N/A'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {pedido?.canal_venta && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '4px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                            background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.15)',
                        }}>
                            {pedido.canal_venta}
                        </span>
                    )}
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                        background: estadoActual.bg, color: estadoActual.color, border: `1px solid ${estadoActual.border}`,
                    }}>
                        <EstadoIcon size={10} />
                        {estadoActual.label}
                    </span>
                </div>
            </div>

            {/* ══ INFO PRINCIPAL ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 6 }}>
                {/* Cliente */}
                <div className="pd-card" style={{ background: SYS.surface, border: `1px solid ${SYS.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                        <User size={9} color={SYS.ct3} />
                        <span style={{ fontSize: 8, fontWeight: 700, color: SYS.ct3, letterSpacing: '.07em', textTransform: 'uppercase' }}>Cliente</span>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: SYS.ct1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {pedido?.cliente_nombre || 'Sin especificar'}
                    </p>
                    {cliente?.telefono && <p style={{ fontSize: 9, color: SYS.ct3, marginTop: 1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cliente.telefono}</p>}
                </div>

                {/* Fecha pedido */}
                <div className="pd-card" style={{ background: SYS.surface, border: `1px solid ${SYS.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                        <Calendar size={9} color={SYS.ct3} />
                        <span style={{ fontSize: 8, fontWeight: 700, color: SYS.ct3, letterSpacing: '.07em', textTransform: 'uppercase' }}>Venta</span>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: SYS.ct1, margin: 0 }}>{fFecha(pedido?.fecha_pedido)}</p>
                </div>

                {/* Fecha entrega */}
                <div className="pd-card" style={{ background: SYS.surface, border: `1px solid ${SYS.border}`, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Truck size={9} color={SYS.ct3} />
                            <span style={{ fontSize: 8, fontWeight: 700, color: SYS.ct3, letterSpacing: '.07em', textTransform: 'uppercase' }}>Entrega</span>
                        </div>
                        <button onClick={() => setEditandoFecha(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, color: SYS.accent, display: 'flex' }}>
                            <Pencil size={8} />
                        </button>
                    </div>
                    {editandoFecha ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} autoFocus
                                style={{ width: '100%', border: `1px solid ${SYS.accent}`, borderRadius: 4, padding: '1px 3px', fontSize: 9, fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box' }} />
                            <div style={{ display: 'flex', gap: 3 }}>
                                <button onClick={() => { setEditandoFecha(false); setFechaEntrega(pedido?.fecha_entrega_estimada || '') }}
                                    style={{ flex: 1, fontSize: 8, background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '2px 0', cursor: 'pointer', color: SYS.ct2 }}>✕</button>
                                <button onClick={handleGuardarFechaEntrega}
                                    style={{ flex: 1, fontSize: 8, background: SYS.accent, border: 'none', borderRadius: 4, padding: '2px 0', cursor: 'pointer', color: '#fff', fontWeight: 700 }}>✓</button>
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: 11, fontWeight: 700, color: SYS.ct1, margin: 0 }}>{fFecha(fechaEntrega) || 'Sin fecha'}</p>
                    )}
                </div>
            </div>

            {/* ══ PRODUCTOS ══ */}
            <div style={{ background: SYS.surface, border: `1px solid ${SYS.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ padding: '8px 12px 6px', borderBottom: `1px solid ${SYS.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Package size={11} color={SYS.accent} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: SYS.ct1, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Productos ({items.length})
                    </span>
                </div>
                <div style={{ maxHeight: 'min(12vh, 85px)', overflowY: 'auto' }}>
                    {items.length > 0 ? items.map((item, i) => {
                        const costoItem = parseFloat(item.costo) || 0
                        const ganItem = costoItem > 0 ? (parseFloat(item.ganancia) || 0) : null
                        return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderBottom: i < items.length - 1 ? `1px solid ${SYS.border}` : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 24, height: 24, borderRadius: 6, background: SYS.accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Package size={10} color={SYS.accent} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: SYS.ct1, margin: 0 }}>{item.producto || item.nombre || 'Producto'}</p>
                                    <p style={{ fontSize: 9, color: SYS.ct3, margin: 0 }}>${fMonto(item.precio)} &times; {item.cantidad}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: SYS.ct1, letterSpacing: '-.01em' }}>
                                    ${fMonto((item.precio || 0) * (item.cantidad || 1))}
                                </span>
                                {ganItem !== null && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: ganItem >= 0 ? '#059669' : '#dc2626' }}>
                                        {ganItem >= 0 ? '+' : ''}${fMonto(ganItem)} gan.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}) : (
                        <div style={{ padding: '12px 0', textAlign: 'center' }}>
                            <p style={{ fontSize: 10, color: SYS.ct3, margin: 0 }}>No hay productos registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ══ GANANCIA (privada) ══ */}
            {hayGanancia && (
                <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                    border: '1px solid #86efac',
                    borderRadius: 10, padding: '6px 12px', marginBottom: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#dcfce7', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 8, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '.09em', margin: '0 0 1px' }}>
                                Ganancia est. · Privado
                            </p>
                            <p style={{ fontSize: 9, color: '#6ee7b7', margin: 0 }}>
                                {itemsConGanancia.length}/{items.length} con costo
                            </p>
                        </div>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 900, color: gananciaTotal >= 0 ? '#059669' : '#dc2626', letterSpacing: '-.03em', margin: 0 }}>
                        {gananciaTotal >= 0 ? '+' : ''}${fMonto(gananciaTotal)}
                    </p>
                </div>
            )}

            {/* ══ COBROS ══ */}
            <div style={{
                borderRadius: 10, border: `2px solid ${estaPagadoCompleto ? '#bbf7d0' : 'rgba(51,65,57,.2)'}`,
                background: estaPagadoCompleto ? '#f0fdf4' : SYS.surface,
                padding: '8px 12px', marginBottom: 6,
            }}>
                {/* título */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: estaPagadoCompleto ? '#dcfce7' : SYS.accentL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={11} color={estaPagadoCompleto ? '#15803d' : SYS.accent} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: estaPagadoCompleto ? '#15803d' : SYS.ct1, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Cobros
                    </span>
                </div>

                {/* barra progreso */}
                <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: SYS.ct3, fontWeight: 600 }}>Progreso</span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: estaPagadoCompleto ? '#15803d' : SYS.ct1 }}>{porcentajePagado.toFixed(0)}%</span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: 4, borderRadius: 999, width: `${porcentajePagado}%`, background: estaPagadoCompleto ? '#22c55e' : SYS.accent, transition: 'width .5s ease' }} />
                    </div>
                </div>

                {/* montos */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 6 }}>
                    <div style={{ background: SYS.surface2, border: `1px solid ${SYS.border}`, borderRadius: 8, padding: '6px 0', textAlign: 'center' }}>
                        <p style={{ fontSize: 8, color: SYS.ct3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 2px' }}>Total</p>
                        <p style={{ fontSize: 11, fontWeight: 800, color: SYS.ct1, margin: 0 }}>${fMonto(total)}</p>
                    </div>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 0', textAlign: 'center' }}>
                        <p style={{ fontSize: 8, color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 2px' }}>Cobrado</p>
                        <p style={{ fontSize: 11, fontWeight: 800, color: '#15803d', margin: 0 }}>${fMonto(montoAbonado)}</p>
                    </div>
                    <div style={{ background: estaPagadoCompleto ? '#f0fdf4' : '#fff7ed', border: `1px solid ${estaPagadoCompleto ? '#bbf7d0' : '#fed7aa'}`, borderRadius: 8, padding: '6px 0', textAlign: 'center' }}>
                        <p style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 2px', color: estaPagadoCompleto ? '#15803d' : '#c2410c' }}>Saldo</p>
                        <p style={{ fontSize: 11, fontWeight: 800, margin: 0, color: estaPagadoCompleto ? '#15803d' : '#ea580c' }}>${fMonto(saldoPendiente)}</p>
                    </div>
                </div>

                {/* acciones cobro */}
                {estaPagadoCompleto ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 0' }}>
                        <CheckCircle size={13} color="#15803d" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d' }}>PAGADO COMPLETAMENTE</span>
                    </div>
                ) : (
                    <div>
                        {editandoPago ? (
                            <div style={{ background: SYS.surface2, border: `1px solid ${SYS.border}`, borderRadius: 8, padding: 8 }}>
                                {/* método pago */}
                                <p style={{ fontSize: 9, fontWeight: 700, color: SYS.ct2, marginBottom: 5 }}>Método pago</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                    {['Efectivo', 'Transferencia', 'Tarjeta', 'MercadoPago'].map(m => (
                                        <button key={m} onClick={() => setMetodoCobro(m)} style={{
                                            padding: '4px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all .13s',
                                            background: metodoCobro === m ? SYS.accent : 'transparent',
                                            color: metodoCobro === m ? '#fff' : SYS.ct3,
                                            border: `1px solid ${metodoCobro === m ? SYS.accent : SYS.border}`,
                                        }}>{m}</button>
                                    ))}
                                </div>

                                {/* monto */}
                                <p style={{ fontSize: 9, fontWeight: 700, color: SYS.ct2, marginBottom: 3 }}>
                                    Monto <span style={{ color: SYS.ct3, fontWeight: 500 }}>(máx: ${fMonto(saldoPendiente)})</span>
                                </p>
                                <div style={{ position: 'relative', marginBottom: 4 }}>
                                    <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: SYS.ct3, fontWeight: 700 }}>$</span>
                                    <input type="number" value={montoAbono} onChange={e => setMontoAbono(e.target.value)} autoFocus
                                        placeholder="0.00" step="0.01" min="0.01" max={saldoPendiente} disabled={cargando}
                                        style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${SYS.border}`, borderRadius: 6, paddingLeft: 20, paddingRight: 8, paddingTop: 6, paddingBottom: 6, fontSize: 12, fontWeight: 700, fontFamily: 'Inter', outline: 'none', color: SYS.ct1, background: SYS.surface }} />
                                </div>
                                <button onClick={() => setMontoAbono(saldoPendiente.toString())} style={{ fontSize: 9, color: SYS.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, marginBottom: 8 }}>
                                    Usar saldo completo (${fMonto(saldoPendiente)})
                                </button>

                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => { setEditandoPago(false); setMontoAbono('') }} disabled={cargando}
                                        style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: `1px solid ${SYS.border}`, background: SYS.surface, color: SYS.ct2, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>
                                        Cancelar
                                    </button>
                                    <button onClick={handleRegistrarAbonoDirecto} disabled={cargando || !montoAbono || parseFloat(montoAbono) <= 0}
                                        style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: cargando ? '#9ca3af' : SYS.accent, color: '#fff', fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'Inter' }}>
                                        <Banknote size={11} />
                                        {cargando ? 'Proces...' : 'Cobrar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => setEditandoPago(true)} disabled={cargando}
                                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1.5px solid ${SYS.accent}`, background: 'transparent', color: SYS.accent, fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'Inter', transition: 'all .13s' }}>
                                    <DollarSign size={11} />
                                    Registrar Cobro
                                </button>
                                <button onClick={handleMarcarPagadoDirecto} disabled={cargando}
                                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: 'Inter', boxShadow: '0 2px 8px rgba(22,163,74,.3)', transition: 'all .13s' }}>
                                    <CheckCircle size={11} />
                                    Saldar Todo
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ══ NOTAS ══ */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '6px 10px', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Edit2 size={10} color="#92400e" />
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '.07em' }}>Notas</span>
                </div>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Sin notas..." disabled={cargando}
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 11, color: '#78350f', fontFamily: 'Inter', minHeight: 28, lineHeight: 1.4, boxSizing: 'border-box' }} />
                {notas !== pedido?.notas && (
                    <button onClick={handleGuardarNotas} disabled={cargando}
                        style={{ marginTop: 4, fontSize: 10, fontWeight: 700, background: '#b45309', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter' }}>
                        Guardar
                    </button>
                )}
            </div>

            {/* ══ ESTADO OPERATIVO ══ */}
            <div style={{ marginBottom: 6 }}>
                <p style={{ fontSize: 8, fontWeight: 800, color: SYS.ct3, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
                    Estado Operativo
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {Object.entries(estadosConfig).map(([key, cfg]) => {
                        const Icon = cfg.icon
                        const isActive = pedido?.estado === key
                        return (
                            <button key={key} onClick={() => handleCambiarEstado(key)} disabled={isActive || cargando}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '5px 10px', borderRadius: 999,
                                    fontSize: 10, fontWeight: 700, cursor: isActive ? 'default' : 'pointer',
                                    border: `1.5px solid ${isActive ? cfg.border : SYS.border}`,
                                    background: isActive ? cfg.bg : SYS.surface,
                                    color: isActive ? cfg.color : SYS.ct3,
                                    transition: 'all .13s',
                                }}>
                                <Icon size={10} />
                                {cfg.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ══ FOOTER ══ */}
            <button onClick={closeModal} disabled={cargando}
                style={{
                    width: '100%', padding: '9px 0', borderRadius: 8, border: `1px solid ${SYS.border}`,
                    background: SYS.surface, color: SYS.ct2, fontSize: 11, fontWeight: 800,
                    cursor: 'pointer', fontFamily: 'Inter', letterSpacing: '.02em', transition: 'all .13s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = SYS.surface2 }}
                onMouseLeave={e => { e.currentTarget.style.background = SYS.surface }}>
                CERRAR
            </button>
        </div>
    )
}

export default PedidoDetail