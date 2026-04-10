"use client"

import { User, Zap, DollarSign, Plus, X, UserPlus, Wallet } from "lucide-react"
import { useState, useEffect, useRef } from "react"

/* ── Paleta Gestify ── */
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const border = 'rgba(48,54,47,.13)'
const surface = '#FAFAFA'
const surface2 = '#F2F2F2'

const inputBase = {
    width: '100%', height: 36, padding: '0 12px',
    fontSize: 12, color: ct1, background: '#fff',
    border: `1px solid ${border}`, borderRadius: 8,
    outline: 'none', fontFamily: "'Inter', sans-serif",
    transition: 'border-color .15s, box-shadow .15s',
    boxSizing: 'border-box',
}

const labelBase = {
    fontSize: 11, fontWeight: 600, color: ct2,
    marginBottom: 5, display: 'block', letterSpacing: '.01em',
}

const focusStyle = (e) => {
    e.target.style.borderColor = accent
    e.target.style.boxShadow = '0 0 0 3px rgba(51,65,57,.08)'
}
const blurStyle = (e) => {
    e.target.style.borderColor = border
    e.target.style.boxShadow = 'none'
}

const FacturaDirectaForm = ({ clientes = [], formActions, closeModal }) => {
    const [busquedaCliente, setBusquedaCliente] = useState("")
    const [mostrarDropdown, setMostrarDropdown] = useState(false)
    const [clienteSeleccionado, setClienteSeleccionado] = useState({ id: "", nombre: "" })
    const [concepto, setConcepto] = useState("VARIOS")
    const [monto, setMonto] = useState("")
    const [metodoPago, setMetodoPago] = useState("Efectivo")
    const [guardando, setGuardando] = useState(false)

    const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false)
    const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "", cuit: "" })
    const [creandoCliente, setCreandoCliente] = useState(false)
    const [formError, setFormError] = useState('')

    const clienteRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (clienteRef.current && !clienteRef.current.contains(e.target))
                setMostrarDropdown(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const clientesFiltrados = clientes.filter(
        (c) =>
            c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
            c.telefono?.includes(busquedaCliente)
    )

    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado({ id: cliente.id, nombre: cliente.nombre })
        setBusquedaCliente(cliente.nombre)
        setMostrarDropdown(false)
        setMostrarNuevoCliente(false)
    }

    const handleCrearCliente = async () => {
        if (!nuevoCliente.nombre.trim()) { setFormError("El nombre del cliente es requerido"); return }
        setCreandoCliente(true)
        try {
            const resultado = await formActions.agregarClienteRapido?.({
                nombre: nuevoCliente.nombre.trim(),
                telefono: nuevoCliente.telefono.trim(),
                cuit: nuevoCliente.cuit.trim() || "-",
            })
            if (resultado?.success && resultado?.cliente) {
                seleccionarCliente(resultado.cliente)
                setNuevoCliente({ nombre: "", telefono: "", cuit: "" })
                setMostrarNuevoCliente(false)
                formActions?.recargarTodosLosDatos?.()
            } else {
                setClienteSeleccionado({ id: "", nombre: nuevoCliente.nombre.trim() })
                setBusquedaCliente(nuevoCliente.nombre.trim())
                setNuevoCliente({ nombre: "", telefono: "", cuit: "" })
                setMostrarNuevoCliente(false)
            }
        } catch (error) {
            setFormError("Error creando cliente: " + error.message)
        } finally {
            setCreandoCliente(false)
        }
    }

    const montoNum = parseFloat(monto) || 0
    const puedeGuardar = clienteSeleccionado.nombre.trim() && concepto.trim() && montoNum > 0

    const handleGuardar = async () => {
        if (!puedeGuardar) return
        setGuardando(true)
        try {
            const data = {
                esCobroDirecto: true,
                clienteId: clienteSeleccionado.id,
                clienteNombre: clienteSeleccionado.nombre,
                concepto: concepto.trim(),
                montoDirecto: montoNum,
                metodoPago,
                fecha: new Date().toISOString().split("T")[0],
                notas: concepto.trim(),
            }
            const resultado = await formActions?.crearFacturaDirecta?.(data)
            if (resultado?.success) {
                formActions?.recargarTodosLosDatos?.()
                closeModal?.()
            } else {
                setFormError("Error: " + (resultado?.mensaje || "Error desconocido"))
            }
        } catch (error) {
            setFormError("Error: " + error.message)
        } finally {
            setGuardando(false)
        }
    }

    const metodosPago = ["Efectivo", "Transferencia", "Tarjeta de Débito", "Tarjeta de Crédito", "MercadoPago"]

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); handleGuardar() }}
            style={{ width: '100%', maxWidth: 380, fontFamily: "'Inter', sans-serif" }}
        >
            {/* Chip tipo */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
                <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '.04em',
                    background: 'rgba(51,65,57,.1)', color: accent, border: '1px solid rgba(51,65,57,.2)'
                }}>
                    Cobro directo
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* ── CLIENTE ── */}
                <div>
                    <label style={labelBase}>
                        Cliente <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <div ref={clienteRef} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <User size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
                                <input
                                    type="text"
                                    autoFocus
                                    style={{ ...inputBase, paddingLeft: 30 }}
                                    placeholder="Buscar cliente..."
                                    value={busquedaCliente}
                                    onChange={(e) => {
                                        setBusquedaCliente(e.target.value)
                                        setClienteSeleccionado({ id: "", nombre: e.target.value })
                                        setMostrarDropdown(true)
                                        if (mostrarNuevoCliente) setMostrarNuevoCliente(false)
                                    }}
                                    onFocus={(e) => { setMostrarDropdown(true); focusStyle(e) }}
                                    onBlur={blurStyle}
                                />
                                {mostrarDropdown && clientesFiltrados.length > 0 && (
                                    <div style={{
                                        position: 'absolute', zIndex: 20, width: '100%', top: '100%', marginTop: 3,
                                        background: '#fff', border: `1px solid ${border}`, borderRadius: 8,
                                        boxShadow: '0 4px 16px rgba(0,0,0,.1)', maxHeight: 140, overflowY: 'auto'
                                    }}>
                                        {clientesFiltrados.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => seleccionarCliente(c)}
                                                style={{
                                                    width: '100%', padding: '8px 12px', textAlign: 'left', background: 'transparent',
                                                    border: 'none', borderBottom: `1px solid ${border}`, cursor: 'pointer', transition: 'background .1s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.04)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{c.nombre}</div>
                                                {c.telefono && <div style={{ fontSize: 10, color: ct3 }}>{c.telefono}</div>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Botón nuevo cliente */}
                            <button
                                type="button"
                                onClick={() => {
                                    setMostrarNuevoCliente(!mostrarNuevoCliente)
                                    setMostrarDropdown(false)
                                    if (!mostrarNuevoCliente) setNuevoCliente({ nombre: busquedaCliente, telefono: "", cuit: "" })
                                }}
                                title={mostrarNuevoCliente ? "Cancelar" : "Nuevo cliente"}
                                style={{
                                    flexShrink: 0, width: 36, height: 36, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', borderRadius: 8, cursor: 'pointer', transition: 'all .13s',
                                    border: mostrarNuevoCliente ? '1px solid rgba(180,60,60,.2)' : `1px solid ${border}`,
                                    background: mostrarNuevoCliente ? 'rgba(180,60,60,.06)' : surface2,
                                    color: mostrarNuevoCliente ? '#c62828' : ct2,
                                }}
                            >
                                {mostrarNuevoCliente ? <X size={13} /> : <Plus size={13} />}
                            </button>
                        </div>

                        {/* Mini formulario inline */}
                        {mostrarNuevoCliente && (
                            <div style={{
                                marginTop: 8, background: 'rgba(51,65,57,.04)', border: '1px solid rgba(51,65,57,.15)',
                                borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                    <UserPlus size={11} style={{ color: accent }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: accent }}>Nuevo cliente</span>
                                </div>
                                <input
                                    type="text"
                                    autoFocus
                                    style={{ ...inputBase, height: 32, fontSize: 11 }}
                                    placeholder="Nombre *"
                                    value={nuevoCliente.nombre}
                                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                                    onFocus={focusStyle} onBlur={blurStyle}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <input
                                        type="text"
                                        style={{ ...inputBase, height: 32, fontSize: 11 }}
                                        placeholder="Teléfono"
                                        value={nuevoCliente.telefono}
                                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                    />
                                    <input
                                        type="text"
                                        style={{ ...inputBase, height: 32, fontSize: 11 }}
                                        placeholder="CUIT (opcional)"
                                        value={nuevoCliente.cuit}
                                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, cuit: e.target.value })}
                                        onFocus={focusStyle} onBlur={blurStyle}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCrearCliente}
                                    disabled={!nuevoCliente.nombre.trim() || creandoCliente}
                                    style={{
                                        width: '100%', height: 32, borderRadius: 8, border: 'none',
                                        background: accent, color: '#fff', fontSize: 11, fontWeight: 700,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: 5, opacity: (!nuevoCliente.nombre.trim() || creandoCliente) ? .5 : 1,
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    <UserPlus size={11} strokeWidth={2.5} />
                                    {creandoCliente ? "Creando..." : "Crear y seleccionar"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── CONCEPTO ── */}
                <div>
                    <label style={labelBase}>Concepto <span style={{ color: '#DC2626' }}>*</span></label>
                    <input
                        type="text"
                        style={inputBase}
                        placeholder="Ej: Honorarios, adelanto, seña, servicio..."
                        value={concepto}
                        onChange={(e) => setConcepto(e.target.value)}
                        onFocus={(e) => { e.target.select(); focusStyle(e) }}
                        onBlur={blurStyle}
                    />
                </div>

                {/* ── MONTO ── */}
                <div>
                    <label style={labelBase}>Monto <span style={{ color: '#DC2626' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            fontSize: 13, fontWeight: 700, color: ct3
                        }}>$</span>
                        <input
                            type="number"
                            style={{ ...inputBase, paddingLeft: 26, fontSize: 15, fontWeight: 700 }}
                            placeholder="0.00"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            onFocus={focusStyle}
                            onBlur={blurStyle}
                            step="0.01"
                            min="0.01"
                        />
                    </div>
                </div>

                {/* ── MÉTODO DE PAGO ── */}
                <div>
                    <label style={labelBase}>Método de pago</label>
                    <div style={{ position: 'relative' }}>
                        <Wallet size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3, zIndex: 1 }} />
                        <select
                            className="app-select app-select--icon-left"
                            style={{ paddingLeft: 30 }}
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            onFocus={focusStyle}
                            onBlur={blurStyle}
                        >
                            {metodosPago.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>

                {/* ── PREVIEW ── */}
                {puedeGuardar && (
                    <div style={{
                        borderRadius: 10, padding: '10px 14px',
                        background: 'rgba(51,65,57,.05)', border: '1px solid rgba(51,65,57,.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: accent, marginBottom: 2 }}>Se registrará como cobrado</p>
                            <p style={{ fontSize: 10, color: ct3, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {clienteSeleccionado.nombre} · {concepto}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <DollarSign size={13} style={{ color: accent }} />
                            <span style={{ fontSize: 16, fontWeight: 800, color: ct1 }}>
                                {montoNum.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Error */}
                {formError && (
                  <div style={{ padding: '7px 10px', borderRadius: 7, background: '#FEF2F2', border: '1px solid #fecaca', fontSize: 12, color: '#DC2626', fontWeight: 500 }}>
                    {formError}
                  </div>
                )}

                {/* ── BOTONES ── */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={guardando}
                        style={{
                            flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600,
                            color: ct2, background: 'transparent', border: `1px solid ${border}`,
                            cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all .13s',
                            opacity: guardando ? .5 : 1,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!puedeGuardar || guardando}
                        style={{
                            flex: 2, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 700,
                            color: '#0A1A0E', background: '#4ADE80', border: '1px solid #4ADE80',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 6, fontFamily: "'Inter', sans-serif", transition: 'all .13s',
                            opacity: (!puedeGuardar || guardando) ? .5 : 1,
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = (!puedeGuardar || guardando) ? '.5' : '.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity = (!puedeGuardar || guardando) ? '.5' : '1'}
                    >
                        <Zap size={13} strokeWidth={2.5} />
                        {guardando ? "Registrando..." : "Registrar Cobro"}
                        {!guardando && <kbd style={{ fontSize: 9, padding: '1.5px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>↵</kbd>}
                    </button>
                </div>
            </div>
        </form>
    )
}

export default FacturaDirectaForm
