"use client"

import React, { useState, useRef, useEffect } from 'react'
import {
    X, Plus, Trash2, Search, Package, FileText,
    ChevronDown, Download, ShoppingCart, Loader,
    CheckCircle, User, Calendar, Tag, Building2
} from 'lucide-react'
import { generarPDFPresupuesto } from '../../utils/presupuestoGenerator'

/* ── PALETA ────────────────────────────────────── */
const bg = '#F5F5F5'
const surface = '#FAFAFA'
const surface2 = '#F2F2F2'
const border = 'rgba(48,54,47,.13)'
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'
const lime = '#4ADE80'

const fNum = (n) => (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const inputSt = {
    height: 34, padding: '0 10px', fontSize: 12, color: ct1,
    background: '#fff', border: `1px solid ${border}`, borderRadius: 8,
    outline: 'none', fontFamily: "'Inter', sans-serif", width: '100%',
    transition: 'border-color .15s',
}

const labelSt = {
    display: 'block', fontSize: 10, fontWeight: 700, color: ct3,
    textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5,
}

/* ════════════════════════════════════════════════ */
const PresupuestoForm = ({
    clientes = [],
    productos = [],
    formActions = {},
    closeModal,
    openModal,
    presupuestoEditar = null,   // para futura edición
}) => {
    const { guardarPresupuesto, agregarPedido, agregarPedidoSolo } = formActions

    /* ── Estado del formulario ─────────────────── */
    const [numero, setNumero] = useState(presupuestoEditar?.numero || '')
    const [fecha, setFecha] = useState(presupuestoEditar?.fecha || new Date().toISOString().split('T')[0])
    const [validez, setValidez] = useState(presupuestoEditar?.validez ?? 7)
    const [clienteInput, setClienteInput] = useState(presupuestoEditar?.cliente || '')

    /* ── Items parse ────────────────────────────── */
    const getInitialItems = () => {
        if (!presupuestoEditar?.items) return []
        if (typeof presupuestoEditar.items === 'string') {
            try { return JSON.parse(presupuestoEditar.items) } catch { return [] }
        }
        return presupuestoEditar.items
    }
    const [items, setItems] = useState(getInitialItems)
    const [iva, setIva] = useState(presupuestoEditar?.iva ?? 21)
    const [incluirIva, setIncluirIva] = useState(presupuestoEditar?.incluirIva ?? false)
    const [observaciones, setObs] = useState(presupuestoEditar?.observaciones || '')
    const [condicionesPago, setCond] = useState(presupuestoEditar?.condicionesPago || '')
    const [nombreEmpresa, setNombreEmpresa] = useState(() => localStorage.getItem('gestify_empresa') || '')

    /* ── UI state ──────────────────────────────── */
    const [busqProd, setBusqProd] = useState('')
    const [dropProd, setDropProd] = useState(false)
    const [saving, setSaving] = useState(false)
    const [pdfOk, setPdfOk] = useState(false)
    const [convirtiendo, setConv] = useState(false)
    const [tab, setTab] = useState('items') // 'items' | 'datos'
    const busqRef = useRef(null)

    /* ── Número autoincramental simple ────────── */
    useEffect(() => {
        if (!numero) {
            const base = Date.now().toString().slice(-5)
            setNumero(`PRES-${base}`)
        }
    }, [])

    /* ── Cálculos ──────────────────────────────── */
    const subtotalGeneral = items.reduce((s, i) => s + (parseFloat(i.subtotal) || 0), 0)
    const ivaValor = subtotalGeneral * (iva / 100)
    const total = incluirIva ? subtotalGeneral + ivaValor : subtotalGeneral

    /* ── Agregar producto desde DB ─────────────── */
    const agregarDesdeDB = (prod) => {
        setItems(prev => [...prev, {
            id: Date.now(),
            productoId: prod.id,
            producto: prod.nombre,
            descripcion: prod.descripcion || '',
            cantidad: 1,
            precio: parseFloat(prod.precio) || 0,
            subtotal: parseFloat(prod.precio) || 0,
        }])
        setBusqProd('')
        setDropProd(false)
    }

    /* ── Agregar producto nuevo manual ─────────── */
    const agregarManual = () => {
        setItems(prev => [...prev, {
            id: Date.now(),
            productoId: null,
            producto: '',
            descripcion: '',
            cantidad: 1,
            precio: 0,
            subtotal: 0,
        }])
    }

    /* ── Actualizar campo de un ítem ───────────── */
    const updateItem = (id, campo, valor) => {
        setItems(prev => prev.map(it => {
            if (it.id !== id) return it
            const updated = { ...it, [campo]: valor }
            if (campo === 'cantidad' || campo === 'precio') {
                const q = campo === 'cantidad' ? parseFloat(valor) || 0 : parseFloat(it.cantidad) || 0
                const p = campo === 'precio' ? parseFloat(valor) || 0 : parseFloat(it.precio) || 0
                updated.subtotal = q * p
            }
            return updated
        }))
    }

    /* ── Eliminar ítem ──────────────────────────── */
    const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id))

    /* ── Datos para PDF / guardado ─────────────── */
    const buildData = () => ({
        id: presupuestoEditar?.id,
        numero, fecha, validez, cliente: clienteInput,
        items, iva, incluirIva, observaciones, condicionesPago,
        subtotalGeneral, ivaValor, total,
        nombreEmpresa,
    })

    /* ── Generar PDF ───────────────────────────── */
    const handlePDF = () => {
        const ok = generarPDFPresupuesto(buildData())
        if (ok) { setPdfOk(true); setTimeout(() => setPdfOk(false), 3000) }
    }

    /* ── Guardar en DB ──────────────────────────── */
    const handleGuardar = async () => {
        if (items.length === 0) return
        setSaving(true)
        try {
            if (guardarPresupuesto) {
                await guardarPresupuesto(buildData())
            }
            handlePDF()
            closeModal?.()
        } finally {
            setSaving(false)
        }
    }

    /* ── Convertir en Pedido ───────────────────── */
    const handleConvertirPedido = async () => {
        if (items.length === 0 || !clienteInput) return
        setConv(true)
        try {
            if (openModal) {
                // Cerramos este modal actual
                closeModal?.()
                // Y abrimos el modal de nuevo pedido con estos datos precargados
                openModal('nuevo-pedido', {
                    cliente_nombre: clienteInput,
                    notas: `Ref: Presupuesto ${numero}${observaciones ? ' — ' + observaciones : ''}`,
                    items: items.map((it, idx) => ({
                        id: Date.now() + idx,
                        productoId: it.productoId || null,
                        producto: it.producto || it.descripcion,
                        precio: parseFloat(it.precio) || 0,
                        cantidad: parseFloat(it.cantidad) || 1,
                        subtotal: parseFloat(it.subtotal) || 0
                    }))
                })
            }
        } finally {
            setConv(false)
        }
    }

    /* ── Productos filtrados ────────────────────── */
    const prodsFiltrados = productos.filter(p =>
        (p.nombre || '').toLowerCase().includes(busqProd.toLowerCase())
    ).slice(0, 8)

    /* ── Atajo de teclado: Ctrl+Enter para Guardar ── */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                e.stopPropagation()
                if (!saving && items.length > 0) handleGuardar()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleGuardar, saving, items.length])

    return (
        <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", color: ct1, WebkitFontSmoothing: 'antialiased' }}>

            {/* ═══ HEADER ═══ */}
            <div style={{ background: '#282A28', margin: '-16px -16px 0', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(74,222,128,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={15} style={{ color: lime }} />
                    </div>
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.45)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 1 }}>Nuevo</p>
                        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1 }}>Presupuesto</h2>
                    </div>
                </div>
                <button onClick={closeModal} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>

            {/* ═══ TABS ═══ */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, background: surface2, margin: '0 -16px', padding: '0 18px' }}>
                {[['items', 'Productos'], ['datos', 'Datos']].map(([k, lbl]) => (
                    <button key={k} onClick={() => setTab(k)} style={{
                        padding: '9px 14px', fontSize: 12, fontWeight: 700, border: 'none',
                        background: 'transparent', cursor: 'pointer', position: 'relative',
                        color: tab === k ? ct1 : ct3, transition: 'color .13s',
                    }}>
                        {lbl}
                        {tab === k && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: accent, borderRadius: '2px 2px 0 0' }} />}
                    </button>
                ))}
            </div>

            <div style={{ padding: '14px 0', maxHeight: '60vh', overflowY: 'auto' }}>

                {/* ══════════ TAB: ITEMS ══════════ */}
                {tab === 'items' && (
                    <div>
                        {/* Buscar producto */}
                        <div style={{ position: 'relative', marginBottom: 10 }}>
                            <label style={labelSt}>Agregar producto</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3, pointerEvents: 'none' }} />
                                <input
                                    ref={busqRef}
                                    type="text"
                                    placeholder="Buscar en catálogo..."
                                    value={busqProd}
                                    onChange={e => { setBusqProd(e.target.value); setDropProd(true) }}
                                    onFocus={() => setDropProd(true)}
                                    onBlur={() => setTimeout(() => setDropProd(false), 180)}
                                    style={{ ...inputSt, paddingLeft: 30 }}
                                />
                            </div>

                            {/* Dropdown */}
                            {dropProd && busqProd && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200,
                                    overflowY: 'auto', background: '#fff', border: `1px solid ${border}`,
                                    borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 50,
                                    marginTop: 4,
                                }}>
                                    {prodsFiltrados.length > 0 ? prodsFiltrados.map(p => (
                                        <div key={p.id}
                                            onMouseDown={() => agregarDesdeDB(p)}
                                            style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            onMouseEnter={e => e.currentTarget.style.background = accentL}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: ct1 }}>{p.nombre}</div>
                                                {p.descripcion && <div style={{ fontSize: 10, color: ct3 }}>{p.descripcion}</div>}
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>${fNum(p.precio)}</div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '12px', fontSize: 11, color: ct3, textAlign: 'center' }}>Sin resultados</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Botón agregar manual */}
                        <button onClick={agregarManual} style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                            borderRadius: 8, border: `1px dashed ${border}`, background: 'transparent',
                            cursor: 'pointer', fontSize: 11, fontWeight: 600, color: ct3, width: '100%',
                            justifyContent: 'center', marginBottom: 12, transition: 'all .13s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = ct3 }}>
                            <Plus size={12} strokeWidth={2.5} /> Agregar producto manual
                        </button>

                        {/* Lista de ítems */}
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '28px 0', color: ct3 }}>
                                <Package size={28} style={{ opacity: .3, marginBottom: 8 }} />
                                <p style={{ fontSize: 12 }}>Sin productos agregados</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {items.map((it, idx) => (
                                    <div key={it.id} style={{
                                        background: surface2, borderRadius: 10, border: `1px solid ${border}`,
                                        padding: '10px 12px', position: 'relative',
                                    }}>
                                        {/* Número */}
                                        <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 9, fontWeight: 700, color: ct3 }}>#{idx + 1}</div>

                                        {/* Eliminar */}
                                        <button onClick={() => removeItem(it.id)} style={{
                                            position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 6,
                                            border: 'none', background: 'transparent', cursor: 'pointer', color: ct3,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ct3 }}>
                                            <Trash2 size={11} strokeWidth={2.5} />
                                        </button>

                                        {/* Nombre */}
                                        <input
                                            type="text" placeholder="Nombre del producto *"
                                            value={it.producto}
                                            onChange={e => updateItem(it.id, 'producto', e.target.value)}
                                            style={{ ...inputSt, marginTop: 14, marginBottom: 5, fontWeight: 600 }}
                                        />
                                        {/* Descripción */}
                                        <input
                                            type="text" placeholder="Descripción (opcional)"
                                            value={it.descripcion}
                                            onChange={e => updateItem(it.id, 'descripcion', e.target.value)}
                                            style={{ ...inputSt, fontSize: 11, color: ct2, marginBottom: 8 }}
                                        />

                                        {/* Cant / Precio / Subtotal */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                                            <div>
                                                <label style={labelSt}>Cantidad</label>
                                                <input type="number" min="1" value={it.cantidad}
                                                    onChange={e => updateItem(it.id, 'cantidad', e.target.value)}
                                                    style={{ ...inputSt, textAlign: 'center', fontWeight: 700 }} />
                                            </div>
                                            <div>
                                                <label style={labelSt}>Precio unit.</label>
                                                <input type="number" min="0" step="0.01" value={it.precio}
                                                    onChange={e => updateItem(it.id, 'precio', e.target.value)}
                                                    style={{ ...inputSt, textAlign: 'right' }} />
                                            </div>
                                            <div>
                                                <label style={labelSt}>Subtotal</label>
                                                <div style={{ ...inputSt, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', background: accentL, fontWeight: 700, color: accent }}>
                                                    ${fNum(it.subtotal)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* IVA toggle */}
                        {items.length > 0 && (
                            <div style={{ marginTop: 12, padding: '10px 12px', background: surface2, borderRadius: 10, border: `1px solid ${border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: incluirIva ? 8 : 0 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: ct2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <input type="checkbox" checked={incluirIva} onChange={e => setIncluirIva(e.target.checked)}
                                            style={{ accentColor: accent, width: 14, height: 14 }} />
                                        Incluir IVA
                                    </label>
                                    {incluirIva && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <input type="number" min="0" max="100" value={iva} onChange={e => setIva(e.target.value)}
                                                style={{ width: 52, height: 28, textAlign: 'center', border: `1px solid ${border}`, borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'Inter', outline: 'none' }} />
                                            <span style={{ fontSize: 11, color: ct3 }}>%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Totales */}
                                <div style={{ borderTop: `1px solid ${border}`, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: ct3 }}>
                                        <span>Subtotal</span><span style={{ fontWeight: 600, color: ct2 }}>${fNum(subtotalGeneral)}</span>
                                    </div>
                                    {incluirIva && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: ct3 }}>
                                            <span>IVA ({iva}%)</span><span style={{ fontWeight: 600, color: ct2 }}>${fNum(ivaValor)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: ct1, marginTop: 2 }}>
                                        <span>TOTAL</span><span style={{ color: accent }}>${fNum(total)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════ TAB: DATOS ══════════ */}
                {tab === 'datos' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                        {/* Nombre de empresa */}
                        <div style={{ background: accentL, borderRadius: 10, padding: '10px 12px', border: `1px solid rgba(51,65,57,.15)` }}>
                            <label style={{ ...labelSt, color: accent, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Building2 size={9} /> Nombre de empresa (aparece en el PDF)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Mi Empresa S.A."
                                value={nombreEmpresa}
                                onChange={e => {
                                    setNombreEmpresa(e.target.value)
                                    localStorage.setItem('gestify_empresa', e.target.value)
                                }}
                                style={{ ...inputSt, fontWeight: 700, fontSize: 13 }}
                            />
                            <p style={{ fontSize: 9.5, color: ct3, marginTop: 5, lineHeight: 1.4 }}>
                                Se guarda automáticamente y se mostrará en el encabezado de todos tus presupuestos.
                            </p>
                        </div>

                        {/* Número */}
                        <div>
                            <label style={labelSt}>Número de presupuesto</label>
                            <input type="text" value={numero} onChange={e => setNumero(e.target.value)} style={inputSt} />
                        </div>

                        {/* Cliente */}
                        <div>
                            <label style={labelSt}><User size={9} style={{ marginRight: 3 }} />Cliente</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" placeholder="Nombre del cliente" value={clienteInput}
                                    onChange={e => setClienteInput(e.target.value)}
                                    list="clientes-lista"
                                    style={inputSt} />
                                <datalist id="clientes-lista">
                                    {clientes.map(c => <option key={c.id} value={c.nombre} />)}
                                </datalist>
                            </div>
                        </div>

                        {/* Fecha + Validez */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div>
                                <label style={labelSt}><Calendar size={9} style={{ marginRight: 3 }} />Fecha</label>
                                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputSt} />
                            </div>
                            <div>
                                <label style={labelSt}><Tag size={9} style={{ marginRight: 3 }} />Validez (días)</label>
                                <input type="number" min="1" value={validez} onChange={e => setValidez(e.target.value)} style={{ ...inputSt, textAlign: 'center' }} />
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label style={labelSt}>Observaciones</label>
                            <textarea value={observaciones} onChange={e => setObs(e.target.value)}
                                rows={3} placeholder="Notas adicionales para el cliente..."
                                style={{ ...inputSt, height: 'auto', padding: '8px 10px', resize: 'none' }} />
                        </div>

                        {/* Condiciones de pago */}
                        <div>
                            <label style={labelSt}>Condiciones de pago</label>
                            <textarea value={condicionesPago} onChange={e => setCond(e.target.value)}
                                rows={2} placeholder="Ej: 50% anticipo, saldo a entrega..."
                                style={{ ...inputSt, height: 'auto', padding: '8px 10px', resize: 'none' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ FOOTER ACCIONES ═══ */}
            <div style={{ borderTop: `1px solid ${border}`, paddingTop: 12, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 7 }}>

                {/* Fila 1: PDF + Guardar */}
                <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={handlePDF} disabled={items.length === 0} style={{
                        flex: 1, height: 36, borderRadius: 9, border: `1px solid ${border}`,
                        background: '#fff', cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 11, fontWeight: 700, color: pdfOk ? '#065F46' : ct2,
                        opacity: items.length === 0 ? .4 : 1, transition: 'all .15s',
                    }}>
                        {pdfOk ? <CheckCircle size={13} style={{ color: '#065F46' }} /> : <Download size={13} />}
                        {pdfOk ? 'PDF generado' : 'Descargar PDF'}
                    </button>

                    <button onClick={handleGuardar} disabled={saving || items.length === 0} style={{
                        flex: 1, height: 36, borderRadius: 9, border: `1px solid ${accent}`,
                        background: accentL, cursor: saving || items.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 11, fontWeight: 700, color: accent,
                        opacity: saving || items.length === 0 ? .4 : 1, transition: 'all .15s',
                    }}>
                        {saving ? <Loader size={13} style={{ animation: 'spin .7s linear infinite' }} /> : <FileText size={13} />}
                        {saving ? 'Guardando...' : (
                            <>
                                Guardar <span style={{ fontSize: 9, opacity: 0.6, background: 'rgba(51,65,57,0.1)', padding: '2px 5px', borderRadius: 4, letterSpacing: '0.02em' }}>Ctrl+↵</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Fila 2: Convertir en Pedido */}
                <button onClick={handleConvertirPedido} disabled={convirtiendo || items.length === 0 || !clienteInput} style={{
                    width: '100%', height: 38, borderRadius: 9, border: 'none',
                    background: items.length === 0 || !clienteInput ? surface2 : '#282A28',
                    cursor: convirtiendo || items.length === 0 || !clienteInput ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    fontSize: 12, fontWeight: 700,
                    color: items.length > 0 && clienteInput ? lime : ct3,
                    opacity: items.length === 0 || !clienteInput ? .5 : 1, transition: 'all .15s',
                }}>
                    {convirtiendo
                        ? <Loader size={14} style={{ animation: 'spin .7s linear infinite' }} />
                        : <ShoppingCart size={14} strokeWidth={2.5} />}
                    {convirtiendo ? 'Convirtiendo...' : 'Convertir en Pedido'}
                </button>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none }
      `}</style>
        </div>
    )
}

export default PresupuestoForm
