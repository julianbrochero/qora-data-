import React, { useState, useEffect, useRef, useCallback } from 'react'
import { usePOS } from '../../hooks/usePOS'
import {
    Search, ShoppingCart, Trash2, Plus, Minus, CreditCard,
    Banknote, Smartphone, ArrowLeft, Package, AlertTriangle,
    CheckCircle2, X, Zap, Loader2, ChevronRight, RotateCcw,
    Edit3, Tag
} from 'lucide-react'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const ACCENT = '#DCED31'
const BG_DARK = '#1a1c1a'
const BG_CARD = '#222422'
const BG_ROW = '#2a2c2a'
const BORDER = 'rgba(255,255,255,.07)'
const FONT = "'Inter', -apple-system, sans-serif"

const METODOS_PAGO = [
    { id: 'Efectivo', label: 'Efectivo', icon: Banknote, color: '#4ade80', key: '1' },
    { id: 'Tarjeta', label: 'Tarjeta', icon: CreditCard, color: '#60a5fa', key: '2' },
    { id: 'Transferencia', label: 'Transferencia', icon: Smartphone, color: '#a78bfa', key: '3' },
    { id: 'MercadoPago', label: 'MercadoPago', icon: Smartphone, color: '#3b82f6', key: '4' },
]

const Kbd = ({ children, big }) => (
    <kbd style={{
        fontSize: big ? 11 : 9,
        fontFamily: "'DM Mono', monospace",
        background: 'rgba(255,255,255,.1)',
        color: 'rgba(255,255,255,.5)',
        border: '1px solid rgba(255,255,255,.15)',
        borderRadius: 4,
        padding: big ? '2px 8px' : '1px 5px',
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
    }}>{children}</kbd>
)

// ─── MODAL DE COBRO ───────────────────────────────────────────────────────────
const ModalCobro = ({ total, onCobrar, onCerrar, cargando }) => {
    const [metodoIdx, setMetodoIdx] = useState(0)
    const [montoPagado, setMontoPagado] = useState('')
    const [descuento, setDescuento] = useState('')
    const montoRef = useRef(null)
    const descRef = useRef(null)
    const cobrarRef = useRef(null)

    const metodo = METODOS_PAGO[metodoIdx].id
    const totalConDesc = Math.max(0, total - (parseFloat(descuento) || 0))
    const vuelto = Math.max(0, (parseFloat(montoPagado) || 0) - totalConDesc)
    const esEfectivo = metodo === 'Efectivo'

    useEffect(() => { setTimeout(() => montoRef.current?.focus(), 60) }, [])

    // Teclado dentro del modal
    useEffect(() => {
        const handler = (e) => {
            // 1-4 cambia método de pago
            if (['1', '2', '3', '4'].includes(e.key) && document.activeElement.tagName !== 'INPUT') {
                setMetodoIdx(Number(e.key) - 1)
                return
            }
            if (e.key === 'Tab') {
                e.preventDefault()
                const fields = [descRef.current, montoRef.current, cobrarRef.current].filter(Boolean)
                const idx = fields.indexOf(document.activeElement)
                fields[(idx + 1) % fields.length]?.focus()
            }
            if (e.key === 'Enter') { e.preventDefault(); onCobrar({ metodoPago: metodo, montoPagado: montoPagado || totalConDesc, descuento: parseFloat(descuento) || 0 }) }
            if (e.key === 'Escape') { e.preventDefault(); onCerrar() }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [metodo, montoPagado, descuento, totalConDesc, onCobrar, onCerrar])

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, fontFamily: FONT }}>
            <div style={{ background: BG_CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: '0 32px 80px rgba(0,0,0,.6)', width: '100%', maxWidth: 430, padding: 32, animation: 'fadeUp .2s ease both' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 19, margin: 0 }}>Cobrar Venta</h2>
                    <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', padding: 4 }}><X size={18} /></button>
                </div>

                {/* Total */}
                <div style={{ textAlign: 'center', marginBottom: 20, padding: '14px 0', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.12em' }}>Total a Cobrar</p>
                    <p style={{ fontSize: 42, fontWeight: 900, color: ACCENT, letterSpacing: '-.04em', margin: 0, fontFamily: "'DM Mono',monospace" }}>
                        ${totalConDesc.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* Descuento */}
                <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Descuento (opcional) <Kbd>Tab</Kbd>
                    </label>
                    <input ref={descRef} type="number" placeholder="$0" value={descuento}
                        onChange={e => setDescuento(e.target.value)}
                        style={{ width: '100%', background: BG_ROW, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: FONT, boxSizing: 'border-box' }} />
                </div>

                {/* Método de pago */}
                <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Método de Pago <Kbd>1</Kbd><Kbd>2</Kbd><Kbd>3</Kbd><Kbd>4</Kbd>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {METODOS_PAGO.map((m, i) => {
                            const Icon = m.icon
                            const activo = metodoIdx === i
                            return (
                                <button key={m.id} onClick={() => setMetodoIdx(i)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 7, padding: '9px 11px', borderRadius: 9, cursor: 'pointer', fontFamily: FONT, fontWeight: 600, fontSize: 12,
                                        background: activo ? ACCENT : BG_ROW, border: `1px solid ${activo ? ACCENT : BORDER}`, color: activo ? '#1a1c1a' : 'rgba(255,255,255,.6)', transition: 'all .12s'
                                    }}>
                                    <Icon size={14} /> {m.label}
                                    <Kbd>{m.key}</Kbd>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Monto recibido */}
                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {esEfectivo ? 'Monto Recibido' : 'Monto Confirmado'} <Kbd>Tab</Kbd>
                    </label>
                    <input ref={montoRef} type="number"
                        placeholder={`$${totalConDesc.toFixed(2)}`}
                        value={montoPagado}
                        onChange={e => setMontoPagado(e.target.value)}
                        style={{ width: '100%', background: BG_ROW, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 24, fontWeight: 800, outline: 'none', fontFamily: "'DM Mono',monospace", boxSizing: 'border-box' }} />
                    {montoPagado && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, padding: '10px 14px', background: vuelto > 0 ? 'rgba(74,222,128,.08)' : 'rgba(255,100,100,.06)', borderRadius: 9, border: `1px solid ${vuelto > 0 ? 'rgba(74,222,128,.2)' : 'rgba(255,100,100,.15)'}` }}>
                            <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>Vuelto</span>
                            <span style={{ color: vuelto > 0 ? '#4ade80' : '#ef4444', fontWeight: 900, fontSize: 20, fontFamily: "'DM Mono',monospace" }}>
                                ${vuelto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Botón Cobrar */}
                <button ref={cobrarRef}
                    onClick={() => onCobrar({ metodoPago: metodo, montoPagado: montoPagado || totalConDesc, descuento: parseFloat(descuento) || 0 })}
                    disabled={cargando}
                    style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer', background: ACCENT, color: '#1a1c1a', fontWeight: 900, fontSize: 17, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: cargando ? .7 : 1, transition: 'all .15s' }}>
                    {cargando ? <Loader2 size={18} style={{ animation: 'spin .8s linear infinite' }} /> : <CheckCircle2 size={18} />}
                    Confirmar Cobro
                </button>
                <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.2)', marginTop: 8 }}>
                    <Kbd>Enter</Kbd> confirmar · <Kbd>ESC</Kbd> cerrar · <Kbd>Tab</Kbd> navegar campos
                </p>
            </div>
        </div>
    )
}

// ─── MODAL PRODUCTO NUEVO ─────────────────────────────────────────────────────
const ModalProductoNuevo = ({ datos, onGuardar, onCancelar, cargando }) => {
    const [nombre, setNombre] = useState(datos?.datosAPI?.nombre || datos?.datosAPI?.marca || '')
    const [precio, setPrecio] = useState('')
    const [stock, setStock] = useState('1')
    const nombreRef = useRef(null)
    const precioRef = useRef(null)
    const stockRef = useRef(null)
    const hayAPI = !!datos?.datosAPI?.nombre

    // Si la API completó el nombre, ir directo al precio
    useEffect(() => {
        setTimeout(() => (hayAPI ? precioRef : nombreRef).current?.focus(), 60)
    }, [])

    const guardar = () => { if (nombre && precio) onGuardar({ nombre, precio, stock, codigoBarras: datos?.codigoBarras, categoria: datos?.datosAPI?.categoria }) }

    useEffect(() => {
        const h = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); guardar() }
            if (e.key === 'Escape') { e.preventDefault(); onCancelar() }
            if (e.key === 'Tab') {
                e.preventDefault()
                const fields = [nombreRef.current, precioRef.current, stockRef.current].filter(Boolean)
                const idx = fields.indexOf(document.activeElement)
                fields[(idx + 1) % fields.length]?.focus()
            }
        }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [nombre, precio, stock])

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, fontFamily: FONT }}>
            <div style={{ background: BG_CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: '0 32px 80px rgba(0,0,0,.6)', width: '100%', maxWidth: 400, padding: 32, animation: 'fadeUp .2s ease both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: 0 }}>Producto Nuevo</h2>
                    <button onClick={onCancelar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)' }}><X size={18} /></button>
                </div>

                {/* Badge API */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, padding: '7px 11px', background: hayAPI ? 'rgba(220,237,49,.07)' : 'rgba(255,255,255,.04)', borderRadius: 8, border: `1px solid ${hayAPI ? 'rgba(220,237,49,.2)' : BORDER}` }}>
                    {hayAPI ? <Zap size={12} color={ACCENT} /> : <Package size={12} color="rgba(255,255,255,.4)" />}
                    <span style={{ fontSize: 11, color: hayAPI ? ACCENT : 'rgba(255,255,255,.4)' }}>
                        {hayAPI ? `Auto-completado: ${datos?.datosAPI?.nombre}` : `Código: ${datos?.codigoBarras || 'sin código'}`}
                    </span>
                </div>

                {[
                    { label: 'Nombre del Producto *', val: nombre, set: setNombre, type: 'text', ref: nombreRef, placeholder: 'Ej: Coca Cola 500ml' },
                    { label: 'Precio de Venta ($) *', val: precio, set: setPrecio, type: 'number', ref: precioRef, placeholder: '0.00' },
                    { label: 'Stock Inicial', val: stock, set: setStock, type: 'number', ref: stockRef, placeholder: '1' },
                ].map(({ label, val, set, type, ref, placeholder }) => (
                    <div key={label} style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                            {label} <Kbd>Tab</Kbd>
                        </label>
                        <input ref={ref} type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                            style={{ width: '100%', background: BG_ROW, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '10px 13px', color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none', fontFamily: FONT, boxSizing: 'border-box' }} />
                    </div>
                ))}

                <button onClick={guardar} disabled={!nombre || !precio || cargando}
                    style={{ width: '100%', padding: '13px', borderRadius: 11, border: 'none', cursor: nombre && precio ? 'pointer' : 'default', background: nombre && precio ? ACCENT : 'rgba(255,255,255,.07)', color: nombre && precio ? '#1a1c1a' : 'rgba(255,255,255,.25)', fontWeight: 800, fontSize: 14, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .15s' }}>
                    {cargando ? <Loader2 size={16} style={{ animation: 'spin .8s linear infinite' }} /> : <Plus size={16} />}
                    Guardar y Agregar al Ticket
                </button>
                <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.2)', marginTop: 8 }}>
                    <Kbd>Enter</Kbd> guardar · <Kbd>Tab</Kbd> navegar · <Kbd>ESC</Kbd> cancelar
                </p>
            </div>
        </div>
    )
}

// ─── MODAL PRODUCTO LIBRE ─────────────────────────────────────────────────────
const ModalLibre = ({ onAgregar, onCerrar }) => {
    const [nombre, setNombre] = useState('')
    const [precio, setPrecio] = useState('')
    const [cantidad, setCantidad] = useState('1')
    const nombreRef = useRef(null)

    useEffect(() => { setTimeout(() => nombreRef.current?.focus(), 50) }, [])

    const agregar = () => {
        if (!nombre.trim() || !precio) return
        onAgregar(nombre, precio, cantidad)
    }

    useEffect(() => {
        const h = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); agregar() }
            if (e.key === 'Escape') { e.preventDefault(); onCerrar() }
            if (e.key === 'Tab') {
                e.preventDefault()
                const fields = [nombreRef.current, document.querySelector('#libre-precio'), document.querySelector('#libre-cant')].filter(Boolean)
                const idx = fields.indexOf(document.activeElement)
                fields[(idx + 1) % fields.length]?.focus()
            }
        }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [nombre, precio, cantidad])

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, fontFamily: FONT }}>
            <div style={{ background: BG_CARD, borderRadius: 18, border: `1px solid ${BORDER}`, boxShadow: '0 32px 80px rgba(0,0,0,.6)', width: '100%', maxWidth: 380, padding: 28, animation: 'fadeUp .2s ease both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(220,237,49,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tag size={15} color={ACCENT} />
                        </div>
                        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 17, margin: 0 }}>Producto Libre</h2>
                    </div>
                    <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)' }}><X size={16} /></button>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 16, lineHeight: 1.5 }}>
                    Agregá un producto sin código ni base de datos. Ideal para pan, facturas, empanadas, etc.
                </p>

                {[
                    { id: 'libre-nombre', label: 'Nombre', val: nombre, set: setNombre, type: 'text', ref: nombreRef, placeholder: 'Ej: Pan, Empanada, Medialuna...' },
                    { id: 'libre-precio', label: 'Precio ($)', val: precio, set: setPrecio, type: 'number', ref: null, placeholder: '0.00' },
                    { id: 'libre-cant', label: 'Cantidad', val: cantidad, set: setCantidad, type: 'number', ref: null, placeholder: '1' },
                ].map(({ id, label, val, set, type, ref, placeholder }) => (
                    <div key={id} style={{ marginBottom: 11 }}>
                        <label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', display: 'block', marginBottom: 4 }}>{label}</label>
                        <input id={id} ref={ref} type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                            style={{ width: '100%', background: BG_ROW, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '10px 13px', color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none', fontFamily: FONT, boxSizing: 'border-box' }} />
                    </div>
                ))}

                <button onClick={agregar} disabled={!nombre || !precio}
                    style={{ width: '100%', padding: '12px', marginTop: 4, borderRadius: 10, border: 'none', cursor: nombre && precio ? 'pointer' : 'default', background: nombre && precio ? ACCENT : 'rgba(255,255,255,.07)', color: nombre && precio ? '#1a1c1a' : 'rgba(255,255,255,.25)', fontWeight: 800, fontSize: 14, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all .15s' }}>
                    <Plus size={16} /> Agregar al Ticket
                </button>
                <p style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,.2)', marginTop: 7 }}>
                    <Kbd>Enter</Kbd> agregar · <Kbd>Tab</Kbd> navegar · <Kbd>ESC</Kbd> cerrar
                </p>
            </div>
        </div>
    )
}

// ─── TICKET EXITOSO ───────────────────────────────────────────────────────────
const TicketExitoso = ({ venta, onNuevaVenta }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, fontFamily: FONT }}>
        <div style={{ background: BG_CARD, borderRadius: 24, border: '1px solid rgba(74,222,128,.15)', boxShadow: '0 0 80px rgba(74,222,128,.06)', width: '100%', maxWidth: 360, padding: 36, textAlign: 'center', animation: 'fadeUp .3s ease both' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,222,128,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle2 size={32} color="#4ade80" />
            </div>
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 22, marginBottom: 4 }}>¡Venta Registrada!</h2>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginBottom: 20 }}>{venta.codigo} · {venta.hora}</p>

            <div style={{ background: BG_ROW, borderRadius: 14, padding: '18px 22px', marginBottom: 16 }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>TOTAL COBRADO</p>
                <p style={{ fontSize: 44, fontWeight: 900, color: ACCENT, letterSpacing: '-.04em', margin: 0, fontFamily: "'DM Mono',monospace" }}>
                    ${venta.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 4 }}>{venta.metodoPago}</p>
                {venta.vuelto > 0 && (
                    <div style={{ marginTop: 12, padding: '10px', background: 'rgba(74,222,128,.08)', borderRadius: 10, border: '1px solid rgba(74,222,128,.2)' }}>
                        <p style={{ color: '#4ade80', fontWeight: 900, fontSize: 22, margin: 0, fontFamily: "'DM Mono',monospace" }}>
                            Vuelto: ${venta.vuelto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                )}
            </div>

            <button onClick={onNuevaVenta}
                style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: ACCENT, color: '#1a1c1a', fontWeight: 900, fontSize: 16, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <RotateCcw size={18} /> Nueva Venta
            </button>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', marginTop: 8 }}>
                <Kbd>Enter</Kbd> o <Kbd>ESC</Kbd> para continuar
            </p>
        </div>
    </div>
)

// ─── COMPONENTE PRINCIPAL POS ─────────────────────────────────────────────────
const POS = ({ onVolver, embebido = false }) => {
    const {
        carrito, totalCarrito, cantidadItems, cargando,
        modalCobro, setModalCobro,
        modalProductoNuevo, setModalProductoNuevo,
        ultimaVenta, setUltimaVenta,
        alertasStock,
        escanear, buscarProducto,
        agregarAlCarrito, quitarUltimo, cambiarCantidad, limpiarCarrito,
        cobrarVenta, crearProductoRapido, editarPrecioItem, agregarItemLibre,
    } = usePOS()

    const [inputVal, setInputVal] = useState('')
    const [resultados, setResultados] = useState([])
    const [buscando, setBuscando] = useState(false)
    const [showResultados, setShowResultados] = useState(false)
    const [resIdx, setResIdx] = useState(-1) // índice seleccionado con flechas
    const [editandoPrecio, setEditandoPrecio] = useState(null) // { idx, valor }
    const [showModalLibre, setShowModalLibre] = useState(false)
    const inputRef = useRef(null)
    const debounceRef = useRef(null)

    // ── Autofocus permanente en el input
    useEffect(() => {
        const refocus = () => {
            if (!modalCobro && !modalProductoNuevo && !ultimaVenta && !editandoPrecio && !showModalLibre) {
                setTimeout(() => inputRef.current?.focus(), 80)
            }
        }
        refocus()
    }, [modalCobro, modalProductoNuevo, ultimaVenta])

    // ── Atajos globales
    useEffect(() => {
        const handler = async (e) => {
            if (modalCobro || modalProductoNuevo || ultimaVenta) return

            // F2 → abrir cobro
            if (e.key === 'F2') { e.preventDefault(); if (carrito.length) setModalCobro(true); return }
            // F4 → quitar último
            if (e.key === 'F4') { e.preventDefault(); quitarUltimo(); return }
            // F8 → foco en buscador
            if (e.key === 'F8') { e.preventDefault(); inputRef.current?.focus(); return }
            // ESC → cancelar todo
            if (e.key === 'Escape') {
                e.preventDefault()
                if (showResultados) { setShowResultados(false); setResultados([]); return }
                if (carrito.length && window.confirm('¿Cancelar la venta y vaciar el carrito?')) limpiarCarrito()
                setInputVal('')
                return
            }
            // Enter sin texto → cobrar
            if (e.key === 'Enter' && !inputVal.trim() && carrito.length) {
                e.preventDefault(); setModalCobro(true); return
            }
            // Flechas en dropdown resultados
            if (e.key === 'ArrowDown' && showResultados) {
                e.preventDefault()
                setResIdx(i => Math.min(i + 1, resultados.length - 1))
                return
            }
            if (e.key === 'ArrowUp' && showResultados) {
                e.preventDefault()
                setResIdx(i => Math.max(i - 1, 0))
                return
            }
            // Enter con selección en dropdown
            if (e.key === 'Enter' && showResultados && resIdx >= 0 && resultados[resIdx]) {
                e.preventDefault()
                agregarAlCarrito(resultados[resIdx])
                setInputVal(''); setResultados([]); setShowResultados(false); setResIdx(-1)
                return
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [modalCobro, modalProductoNuevo, ultimaVenta, carrito, inputVal, showResultados, resIdx, resultados, quitarUltimo, limpiarCarrito, setModalCobro, agregarAlCarrito])

    // ── Escuchar Enter/ESC en pantalla de ticket exitoso
    useEffect(() => {
        if (!ultimaVenta) return
        const h = (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
                setUltimaVenta(null)
                setTimeout(() => inputRef.current?.focus(), 80)
            }
        }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [ultimaVenta, setUltimaVenta])

    // ── Lógica del input (búsqueda + detección de código de barras)
    const handleInput = useCallback(async (val) => {
        setInputVal(val)
        setResIdx(-1)
        if (!val.trim()) { setResultados([]); setShowResultados(false); return }

        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            // Solo dígitos >= 6 → tratamos como código de barras (pistola)
            if (/^\d{6,}$/.test(val.trim())) {
                setBuscando(true)
                const res = await escanear(val.trim())
                setBuscando(false)
                if (res.accion === 'agregado') { setInputVal(''); setResultados([]); setShowResultados(false) }
                return
            }
            // Texto libre → buscar por nombre
            setBuscando(true)
            const lista = await buscarProducto(val)
            setBuscando(false)
            setResultados(lista)
            setShowResultados(lista.length > 0)
            setResIdx(lista.length > 0 ? 0 : -1) // pre-seleccionar el primero
        }, 250)
    }, [escanear, buscarProducto])

    // ── Enter en el input (con o sin resultados)
    const handleEnterInput = useCallback(async () => {
        if (!inputVal.trim()) return

        // Si hay un resultado seleccionado con flecha, agregar ese
        if (showResultados && resIdx >= 0 && resultados[resIdx]) {
            agregarAlCarrito(resultados[resIdx])
            setInputVal(''); setResultados([]); setShowResultados(false); setResIdx(-1)
            return
        }
        // Si hay exactamente 1 resultado, agregar directo
        if (showResultados && resultados.length === 1) {
            agregarAlCarrito(resultados[0])
            setInputVal(''); setResultados([]); setShowResultados(false); setResIdx(-1)
            return
        }
        // Si parece código de barras largo, escanear
        if (/^\d{4,}$/.test(inputVal.trim())) {
            const res = await escanear(inputVal.trim())
            if (res.accion === 'agregado') { setInputVal(''); setResultados([]); setShowResultados(false) }
        }
    }, [inputVal, showResultados, resIdx, resultados, agregarAlCarrito, escanear])

    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

    return (
        <div style={{ height: embebido ? '100%' : '100vh', display: 'flex', flexDirection: 'column', background: BG_DARK, fontFamily: FONT, overflow: 'hidden', userSelect: 'none' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin   { to { transform:rotate(360deg) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
        * { box-sizing:border-box }
        input:focus { outline:none !important }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px }
      `}</style>

            {/* ── TOPBAR (solo en modo standalone) ── */}
            {!embebido && (
                <div style={{ display: 'flex', alignItems: 'center', height: 48, padding: '0 16px', background: '#111211', borderBottom: `1px solid ${BORDER}`, flexShrink: 0, gap: 12 }}>
                    <button onClick={onVolver}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 12, fontFamily: FONT, padding: '4px 8px', borderRadius: 7 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.4)'}>
                        <ArrowLeft size={14} /> Volver al sistema
                    </button>
                    <div style={{ width: 1, height: 22, background: BORDER }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s ease infinite' }} />
                        <span style={{ color: ACCENT, fontWeight: 800, fontSize: 13, letterSpacing: '-.02em' }}>MODO KIOSCO</span>
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {[['F2', 'Cobrar'], ['F4', 'Quitar último'], ['F8', 'Buscar'], ['ESC', 'Cancelar']].map(([k, l]) => (
                            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Kbd>{k}</Kbd><span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>{l}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ width: 1, height: 22, background: BORDER }} />
                    {alertasStock.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 7 }}>
                            <AlertTriangle size={12} color="#fbbf24" />
                            <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 600 }}>{alertasStock.length} bajo stock</span>
                        </div>
                    )}
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', fontFamily: "'DM Mono',monospace" }}>{hora}</span>
                </div>
            )}

            {/* ── BODY ── */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>

                {/* ════ IZQUIERDA: Scanner + Ticket ════ */}
                <div style={{ display: 'flex', flexDirection: 'column', borderRight: `1px solid ${BORDER}`, overflow: 'hidden' }}>

                    {/* Scanner + botón producto libre */}
                    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0, position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, height: 50, background: '#0e100e', borderRadius: 13, border: `2px solid rgba(220,237,49,.35)`, padding: '0 15px' }}>
                                {buscando
                                    ? <Loader2 size={18} color={ACCENT} style={{ animation: 'spin .8s linear infinite', flexShrink: 0 }} />
                                    : <Search size={18} color={ACCENT} style={{ flexShrink: 0 }} />
                                }
                                <input ref={inputRef} type="text"
                                    placeholder="Escanear código de barras o escribir nombre..."
                                    value={inputVal}
                                    onChange={e => handleInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleEnterInput() }}
                                    style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: FONT, outline: 'none', minWidth: 0 }}
                                />
                                {inputVal && (
                                    <button onClick={() => { setInputVal(''); setResultados([]); setShowResultados(false); inputRef.current?.focus() }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.3)', padding: 3 }}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {/* Botón producto libre */}
                            <button onClick={() => setShowModalLibre(true)}
                                title="Agregar producto libre (sin código)"
                                style={{ height: 50, padding: '0 14px', borderRadius: 12, border: `1px solid rgba(220,237,49,.25)`, background: 'rgba(220,237,49,.07)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, flexShrink: 0 }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,237,49,.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,237,49,.07)'}>
                                <Tag size={15} color={ACCENT} />
                                <span style={{ fontSize: 8, color: ACCENT, fontWeight: 700, fontFamily: FONT, letterSpacing: '.05em' }}>LIBRE</span>
                            </button>
                        </div>

                        {/* Dropdown resultados — navegar con ↑↓ y Enter */}
                        {showResultados && resultados.length > 0 && (
                            <div style={{ position: 'absolute', top: 68, left: 14, right: 14, zIndex: 100, background: '#181a18', borderRadius: 13, border: `1px solid ${BORDER}`, boxShadow: '0 16px 48px rgba(0,0,0,.65)', overflow: 'hidden' }}>
                                {/* Pista de navegación */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 13px', borderBottom: `1px solid ${BORDER}`, background: 'rgba(220,237,49,.04)' }}>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>↑↓ navegar</span>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.15)' }}>·</span>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Enter agregar</span>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.15)' }}>·</span>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>ESC cerrar</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 9, color: ACCENT }}>{resultados.length} resultado{resultados.length !== 1 ? 's' : ''}</span>
                                </div>
                                {resultados.map((p, i) => (
                                    <button key={p.id}
                                        onClick={() => { agregarAlCarrito(p); setInputVal(''); setResultados([]); setShowResultados(false); setResIdx(-1); inputRef.current?.focus() }}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', background: resIdx === i ? 'rgba(220,237,49,.08)' : 'none', border: 'none', borderTop: i > 0 ? `1px solid ${BORDER}` : 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT, transition: 'background .1s',
                                            borderLeft: resIdx === i ? `2px solid ${ACCENT}` : '2px solid transparent'
                                        }}
                                        onMouseEnter={e => { setResIdx(i); e.currentTarget.style.background = 'rgba(220,237,49,.06)' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = resIdx === i ? 'rgba(220,237,49,.08)' : 'none' }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(220,237,49,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Package size={15} color={ACCENT} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                                            <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 10 }}>Stock: {p.stock ?? '—'} u. {p.codigo_barras ? `· #${p.codigo_barras}` : ''}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                                            <span style={{ color: ACCENT, fontWeight: 900, fontSize: 15, fontFamily: "'DM Mono',monospace" }}>
                                                ${parseFloat(p.precio).toLocaleString('es-AR')}
                                            </span>
                                            {resIdx === i && <span style={{ fontSize: 8, color: ACCENT, opacity: .7 }}>← Enter</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Sin resultados */}
                        {showResultados && resultados.length === 0 && !buscando && inputVal.trim() && (
                            <div style={{ position: 'absolute', top: 68, left: 14, right: 14, zIndex: 100, background: '#181a18', borderRadius: 13, border: `1px solid ${BORDER}`, padding: '14px 16px', textAlign: 'center' }}>
                                <Package size={20} color="rgba(255,255,255,.2)" style={{ margin: '0 auto 6px' }} />
                                <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 12, margin: 0 }}>Sin resultados para «{inputVal}»</p>
                                <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 10, margin: '4px 0 0' }}>Presioná Enter para crear un producto nuevo</p>
                            </div>
                        )}
                    </div>

                    {/* Ticket */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
                        {carrito.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShoppingCart size={28} color="rgba(255,255,255,.2)" />
                                </div>
                                <p style={{ color: 'rgba(255,255,255,.2)', fontSize: 13, textAlign: 'center', lineHeight: 1.7 }}>
                                    Escaneá o buscá un producto<br />para iniciar la venta
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Cabecera */}
                                <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 110px 80px 32px', padding: '5px 14px 5px 14px', gap: 8 }}>
                                    {['#', 'Producto', 'Cantidad', 'Subtotal', ''].map(h => (
                                        <span key={h} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{h}</span>
                                    ))}
                                </div>
                                {carrito.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 110px 80px 32px', alignItems: 'center', padding: '7px 14px', gap: 8, borderBottom: `1px solid ${BORDER}` }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', textAlign: 'center' }}>{idx + 1}</span>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.nombre}
                                                {item.esLibre && <span style={{ marginLeft: 5, fontSize: 8, fontWeight: 700, background: 'rgba(220,237,49,.15)', color: ACCENT, padding: '1px 4px', borderRadius: 3, verticalAlign: 'middle' }}>LIBRE</span>}
                                            </p>
                                            {/* Precio editable al hacer click */}
                                            {editandoPrecio?.idx === idx ? (
                                                <input
                                                    type="number" autoFocus
                                                    defaultValue={item.precio}
                                                    onBlur={e => { editarPrecioItem(idx, e.target.value); setEditandoPrecio(null) }}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') { editarPrecioItem(idx, e.target.value); setEditandoPrecio(null) }
                                                        if (e.key === 'Escape') setEditandoPrecio(null)
                                                    }}
                                                    onClick={e => e.stopPropagation()}
                                                    style={{ width: 80, background: 'rgba(220,237,49,.1)', border: `1px solid ${ACCENT}`, borderRadius: 5, padding: '2px 6px', color: ACCENT, fontSize: 11, fontWeight: 700, outline: 'none', fontFamily: "'DM Mono',monospace" }}
                                                />
                                            ) : (
                                                <p
                                                    onClick={() => setEditandoPrecio({ idx, valor: item.precio })}
                                                    title="Click para editar precio"
                                                    style={{ color: 'rgba(255,255,255,.3)', fontSize: 10, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    ${parseFloat(item.precio).toLocaleString('es-AR')} c/u
                                                    <Edit3 size={9} style={{ opacity: .5 }} />
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <button onClick={() => cambiarCantidad(idx, item.cantidad - 1)}
                                                style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(255,255,255,.06)', border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                <Minus size={11} />
                                            </button>
                                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, width: 26, textAlign: 'center', fontFamily: "'DM Mono',monospace" }}>{item.cantidad}</span>
                                            <button onClick={() => cambiarCantidad(idx, item.cantidad + 1)}
                                                style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(255,255,255,.06)', border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                <Plus size={11} />
                                            </button>
                                        </div>
                                        <span style={{ color: ACCENT, fontWeight: 800, fontSize: 14, fontFamily: "'DM Mono',monospace", textAlign: 'right' }}>
                                            ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                                        </span>
                                        <button onClick={() => cambiarCantidad(idx, 0)}
                                            style={{ width: 24, height: 24, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.2)', transition: 'color .1s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.2)'}>
                                            <X size={13} />
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer ticket */}
                    {carrito.length > 0 && (
                        <div style={{ padding: '8px 14px', borderTop: `1px solid ${BORDER}`, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{cantidadItems} artículo{cantidadItems !== 1 ? 's' : ''}</span>
                            <button onClick={() => { if (window.confirm('¿Cancelar la venta?')) limpiarCarrito() }}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,.5)', fontSize: 11, fontFamily: FONT }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,.5)'}>
                                <Trash2 size={12} /> Cancelar <Kbd>ESC</Kbd>
                            </button>
                        </div>
                    )}
                </div>

                {/* ════ DERECHA: Panel cobro ════ */}
                <div style={{ display: 'flex', flexDirection: 'column', background: '#141614', overflow: 'hidden' }}>
                    {/* Total */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 6 }}>TOTAL</p>
                        <p style={{ fontSize: 46, fontWeight: 900, color: carrito.length ? ACCENT : 'rgba(255,255,255,.08)', letterSpacing: '-.05em', margin: 0, fontFamily: "'DM Mono',monospace", lineHeight: 1, transition: 'color .3s' }}>
                            ${totalCarrito.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                        {cantidadItems > 0 && <p style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 6 }}>{cantidadItems} artículo{cantidadItems !== 1 ? 's' : ''}</p>}
                    </div>

                    {/* Cobro rápido (sin vuelto) */}
                    <div style={{ padding: '0 14px', marginBottom: 10 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', marginBottom: 6 }}>Cobro directo</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {METODOS_PAGO.map(m => {
                                const Icon = m.icon
                                return (
                                    <button key={m.id} disabled={!carrito.length}
                                        onClick={() => cobrarVenta({ metodoPago: m.id, montoPagado: null })}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 10px', background: 'rgba(255,255,255,.04)', border: `1px solid ${BORDER}`, borderRadius: 9, cursor: carrito.length ? 'pointer' : 'default', color: carrito.length ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.15)', fontFamily: FONT, fontSize: 11, fontWeight: 600, opacity: carrito.length ? 1 : .4, transition: 'all .12s' }}
                                        onMouseEnter={e => { if (carrito.length) e.currentTarget.style.background = 'rgba(255,255,255,.08)' }}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}>
                                        <Icon size={13} color={m.color} /> {m.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Botón COBRAR principal */}
                    <div style={{ padding: '10px 14px', borderTop: `1px solid ${BORDER}` }}>
                        <button onClick={() => carrito.length && setModalCobro(true)} disabled={!carrito.length}
                            style={{ width: '100%', padding: '16px', borderRadius: 13, border: 'none', background: carrito.length ? ACCENT : 'rgba(255,255,255,.04)', color: carrito.length ? '#0f110f' : 'rgba(255,255,255,.15)', fontWeight: 900, fontSize: 17, fontFamily: FONT, cursor: carrito.length ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, transition: 'all .2s', letterSpacing: '-.01em' }}>
                            <CreditCard size={18} /> COBRAR <Kbd big>F2</Kbd>
                        </button>
                        <p style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,.12)', marginTop: 6 }}>
                            <Kbd>Enter</Kbd> sin texto = cobrar · <Kbd>F2</Kbd> = abrir cobro con vuelto
                        </p>
                    </div>
                </div>
            </div>

            {/* ── MODALES ── */}
            {modalCobro && (
                <ModalCobro total={totalCarrito} cargando={cargando}
                    onCobrar={params => cobrarVenta(params)}
                    onCerrar={() => setModalCobro(false)} />
            )}
            {modalProductoNuevo && (
                <ModalProductoNuevo datos={modalProductoNuevo} cargando={cargando}
                    onGuardar={d => crearProductoRapido(d)}
                    onCancelar={() => setModalProductoNuevo(null)} />
            )}
            {showModalLibre && (
                <ModalLibre
                    onAgregar={(nombre, precio, cantidad) => {
                        agregarItemLibre(nombre, precio, cantidad)
                        setShowModalLibre(false)
                        setTimeout(() => inputRef.current?.focus(), 50)
                    }}
                    onCerrar={() => { setShowModalLibre(false); setTimeout(() => inputRef.current?.focus(), 50) }}
                />
            )}
            {ultimaVenta && (
                <TicketExitoso venta={ultimaVenta}
                    onNuevaVenta={() => { setUltimaVenta(null); setTimeout(() => inputRef.current?.focus(), 80) }} />
            )}
        </div>
    )
}

export default POS
