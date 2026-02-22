"use client"

import { User, Zap, DollarSign, Plus, X, UserPlus } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const FacturaDirectaForm = ({ clientes = [], formActions, closeModal }) => {
    const [busquedaCliente, setBusquedaCliente] = useState("")
    const [mostrarDropdown, setMostrarDropdown] = useState(false)
    const [clienteSeleccionado, setClienteSeleccionado] = useState({ id: "", nombre: "" })
    const [concepto, setConcepto] = useState("VARIOS")
    const [monto, setMonto] = useState("")
    const [metodoPago, setMetodoPago] = useState("Efectivo")
    const [guardando, setGuardando] = useState(false)

    // Mini formulario inline para crear cliente rápido
    const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false)
    const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", telefono: "", cuit: "" })
    const [creandoCliente, setCreandoCliente] = useState(false)

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

    // Crear cliente rápido inline y seleccionarlo automáticamente
    const handleCrearCliente = async () => {
        if (!nuevoCliente.nombre.trim()) {
            alert("El nombre del cliente es requerido")
            return
        }
        setCreandoCliente(true)
        try {
            // Usa agregarCliente del hook (igual que ClienteForm)
            if (formActions?.agregarCliente) {
                // Necesitamos pasar el estado del cliente al hook y llamar agregarCliente
                // La forma más directa: llamar directamente a supabase vía agregarClienteRapido
                // que ya existe en el hook y devuelve el cliente creado
                const resultado = await formActions.agregarClienteRapido?.({
                    nombre: nuevoCliente.nombre.trim(),
                    telefono: nuevoCliente.telefono.trim(),
                    cuit: nuevoCliente.cuit.trim() || "-",
                })
                if (resultado?.success && resultado?.cliente) {
                    seleccionarCliente(resultado.cliente)
                    setNuevoCliente({ nombre: "", telefono: "", cuit: "" })
                    setMostrarNuevoCliente(false)
                    if (formActions?.recargarTodosLosDatos) formActions.recargarTodosLosDatos()
                } else {
                    // Fallback: seleccionar por nombre aunque no tengamos el id
                    setClienteSeleccionado({ id: "", nombre: nuevoCliente.nombre.trim() })
                    setBusquedaCliente(nuevoCliente.nombre.trim())
                    setNuevoCliente({ nombre: "", telefono: "", cuit: "" })
                    setMostrarNuevoCliente(false)
                }
            }
        } catch (error) {
            alert("Error creando cliente: " + error.message)
        } finally {
            setCreandoCliente(false)
        }
    }

    const montoNum = parseFloat(monto) || 0

    const puedeGuardar =
        clienteSeleccionado.nombre.trim() &&
        concepto.trim() &&
        montoNum > 0

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
                alert("Error: " + (resultado?.mensaje || "Error desconocido"))
            }
        } catch (error) {
            alert("Error: " + error.message)
        } finally {
            setGuardando(false)
        }
    }

    const metodosPago = [
        { value: "Efectivo", label: "Efectivo" },
        { value: "Transferencia", label: "Transferencia" },
        { value: "Tarjeta de Débito", label: "Tarjeta de Débito" },
        { value: "Tarjeta de Crédito", label: "Tarjeta de Crédito" },
        { value: "MercadoPago", label: "MercadoPago" },
    ]

    const montoNum2 = parseFloat(monto) || 0

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); handleGuardar() }}
            className="w-full max-w-[340px] mx-auto space-y-3"
        >
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                    <Zap size={14} className="text-blue-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Cobro Directo</h3>
                    <p className="text-[9px] text-gray-500">Registrá un cobro rápido sin pedido previo</p>
                </div>
            </div>

            {/* ── CLIENTE ─────────────────────────────────────────────── */}
            <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Cliente</label>
                <div ref={clienteRef} className="relative">
                    <div className="flex gap-1">
                        <div className="relative flex-1">
                            <User className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                autoFocus
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                placeholder="Buscar cliente..."
                                value={busquedaCliente}
                                onChange={(e) => {
                                    setBusquedaCliente(e.target.value)
                                    setClienteSeleccionado({ id: "", nombre: e.target.value })
                                    setMostrarDropdown(true)
                                    if (mostrarNuevoCliente) setMostrarNuevoCliente(false)
                                }}
                                onFocus={() => setMostrarDropdown(true)}
                            />
                            {mostrarDropdown && clientesFiltrados.length > 0 && (
                                <div className="absolute z-20 w-full mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                                    {clientesFiltrados.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => seleccionarCliente(c)}
                                            className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors text-xs border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-semibold text-gray-900">{c.nombre}</div>
                                            {c.telefono && <div className="text-[10px] text-gray-400">{c.telefono}</div>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botón crear cliente */}
                        <button
                            type="button"
                            onClick={() => {
                                setMostrarNuevoCliente(!mostrarNuevoCliente)
                                setMostrarDropdown(false)
                                if (!mostrarNuevoCliente) {
                                    setNuevoCliente({ nombre: busquedaCliente, telefono: "", cuit: "" })
                                }
                            }}
                            title={mostrarNuevoCliente ? "Cancelar" : "Nuevo cliente"}
                            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${mostrarNuevoCliente
                                ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                                : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                                }`}
                        >
                            {mostrarNuevoCliente ? <X size={13} /> : <Plus size={13} />}
                        </button>
                    </div>

                    {/* Mini formulario inline para crear cliente */}
                    {mostrarNuevoCliente && (
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5 space-y-1.5">
                            <div className="flex items-center gap-1 mb-1">
                                <UserPlus size={10} className="text-blue-600" />
                                <span className="text-[10px] font-bold text-blue-700">Nuevo cliente</span>
                            </div>
                            <input
                                type="text"
                                autoFocus
                                className="w-full px-2.5 py-1.5 text-xs border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                placeholder="Nombre *"
                                value={nuevoCliente.nombre}
                                onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-1">
                                <input
                                    type="text"
                                    className="px-2.5 py-1.5 text-xs border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    placeholder="Teléfono"
                                    value={nuevoCliente.telefono}
                                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="px-2.5 py-1.5 text-xs border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    placeholder="CUIT (opcional)"
                                    value={nuevoCliente.cuit}
                                    onChange={(e) => setNuevoCliente({ ...nuevoCliente, cuit: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleCrearCliente}
                                disabled={!nuevoCliente.nombre.trim() || creandoCliente}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 text-[11px] rounded-md font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-colors"
                            >
                                <UserPlus size={10} />
                                {creandoCliente ? "Creando..." : "Crear y seleccionar"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── CONCEPTO ────────────────────────────────────────────── */}
            <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Concepto</label>
                <input
                    type="text"
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    placeholder="Ej: Honorarios, adelanto, seña, servicio..."
                    value={concepto}
                    onChange={(e) => setConcepto(e.target.value)}
                    onFocus={(e) => e.target.select()}
                />
            </div>

            {/* ── MONTO ───────────────────────────────────────────────── */}
            <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Monto</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                    <input
                        type="number"
                        className="w-full pl-7 pr-3 py-2 text-base font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900"
                        placeholder="0.00"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        step="0.01"
                        min="0.01"
                    />
                </div>
            </div>

            {/* ── MÉTODO DE PAGO ──────────────────────────────────────── */}
            <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Método de pago</label>
                <select
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                >
                    {metodosPago.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            {/* ── PREVIEW ─────────────────────────────────────────────── */}
            {puedeGuardar && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-blue-600 font-semibold">Se registrará como cobrado</p>
                        <p className="text-[10px] text-blue-500 truncate max-w-[180px]">
                            {clienteSeleccionado.nombre} · {concepto}
                        </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <DollarSign size={13} className="text-blue-700" />
                        <span className="text-base font-bold text-blue-800">
                            {montoNum2.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            )}

            {/* ── BOTONES ─────────────────────────────────────────────── */}
            <div className="flex gap-2 pt-1">
                <button
                    type="button"
                    onClick={closeModal}
                    disabled={guardando}
                    className="flex-1 bg-white text-gray-700 px-3 py-2 text-xs rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 font-medium disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!puedeGuardar || guardando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs rounded-lg transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-sm"
                >
                    <Zap size={12} />
                    {guardando ? "Registrando..." : "Registrar Cobro"}
                </button>
            </div>
        </form>
    )
}

export default FacturaDirectaForm
