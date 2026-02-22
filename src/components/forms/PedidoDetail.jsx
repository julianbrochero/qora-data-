"use client"

import { Package, User, Calendar, DollarSign, FileText, Clock, CheckCircle, XCircle, Truck, AlertCircle, CreditCard, Edit2, Banknote, BadgeCheck, Pencil } from "lucide-react"
import { useState, useEffect } from "react"

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

    // Parsear items del pedido
    const items = typeof pedido?.items === 'string'
        ? JSON.parse(pedido.items || '[]')
        : (pedido?.items || [])

    const formatearFecha = (fecha) => {
        if (!fecha) return "No especificada"
        try {
            return new Date(fecha).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        } catch {
            return "Fecha inválida"
        }
    }

    const formatearMonto = (monto) => {
        const numero = Number.parseFloat(monto) || 0
        return numero.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    const estadosConfig = {
        pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
        preparando: { label: 'Preparando', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
        enviado: { label: 'Enviado', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
        entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
        cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    }

    const estadoActual = estadosConfig[pedido?.estado] || estadosConfig.pendiente
    const EstadoIcon = estadoActual.icon
    const cliente = clientes.find(c => c.id === pedido?.cliente_id)

    // Calcular montos del pedido
    const total = Number.parseFloat(pedido?.total) || 0
    const montoAbonado = Number.parseFloat(pedido?.monto_abonado) || 0
    const saldoPendiente = pedido?.saldo_pendiente !== null && pedido?.saldo_pendiente !== undefined
        ? Number.parseFloat(pedido.saldo_pendiente)
        : total - montoAbonado

    const estaPagadoCompleto = saldoPendiente <= 0.01
    const porcentajePagado = total > 0 ? Math.min(100, (montoAbonado / total) * 100) : 0

    const mostrarExito = (msg) => {
        setMensajeExito(msg)
        setTimeout(() => setMensajeExito(''), 3000)
    }

    const handleRegistrarAbonoDirecto = async () => {
        const monto = parseFloat(montoAbono)
        if (!monto || monto <= 0 || monto > saldoPendiente) {
            alert('Ingrese un monto válido (mayor a 0 y no mayor al saldo pendiente)')
            return
        }

        if (!formActions?.agregarAbonoAPedido) {
            alert('Función de pago no disponible')
            return
        }

        setCargando(true)
        try {
            const resultado = await formActions.agregarAbonoAPedido(pedido.id, monto, metodoCobro)

            if (resultado.success) {
                mostrarExito(`✅ Abono de $${formatearMonto(monto)} registrado`)
                setMontoAbono('')
                setEditandoPago(false)
                if (formActions.recargarTodosLosDatos) {
                    formActions.recargarTodosLosDatos()
                }
            } else {
                alert('❌ Error: ' + resultado.mensaje)
            }
        } catch (error) {
            alert('❌ Error: ' + error.message)
        } finally {
            setCargando(false)
        }
    }

    const handleMarcarPagadoDirecto = async () => {
        if (estaPagadoCompleto) return

        const confirmar = window.confirm(
            `¿Registrar pago total del saldo restante?\n\nSaldo a saldar: $${formatearMonto(saldoPendiente)}`
        )
        if (!confirmar) return

        if (!formActions?.marcarPedidoPagadoTotal) {
            alert('Función no disponible')
            return
        }

        setCargando(true)
        try {
            const resultado = await formActions.marcarPedidoPagadoTotal(pedido.id, metodoCobro)

            if (resultado.success) {
                mostrarExito('✅ Pedido saldado completamente')
                if (formActions.recargarTodosLosDatos) {
                    formActions.recargarTodosLosDatos()
                }
            } else {
                alert('❌ Error: ' + resultado.mensaje)
            }
        } catch (error) {
            alert('❌ Error: ' + error.message)
        } finally {
            setCargando(false)
        }
    }

    const handleCambiarEstado = async (nuevoEstado) => {
        if (!formActions?.actualizarEstadoPedido || pedido?.estado === nuevoEstado) return

        try {
            const confirmar = window.confirm(`¿Cambiar estado a ${estadosConfig[nuevoEstado]?.label || nuevoEstado}?`)
            if (!confirmar) return

            const resultado = await formActions.actualizarEstadoPedido(pedido.id, nuevoEstado)
            if (resultado.success) {
                mostrarExito('✅ Estado actualizado')
                if (formActions.recargarTodosLosDatos) formActions.recargarTodosLosDatos()
            } else {
                alert('❌ Error: ' + resultado.mensaje)
            }
        } catch (error) {
            alert('❌ Error: ' + error.message)
        }
    }

    const handleGuardarNotas = async () => {
        if (!formActions?.actualizarNotasPedido) return
        try {
            const resultado = await formActions.actualizarNotasPedido(pedido.id, notas)
            if (resultado.success) {
                mostrarExito('✅ Notas guardadas')
            } else {
                alert('❌ Error: ' + resultado.mensaje)
            }
        } catch (error) {
            alert('❌ Error: ' + error.message)
        }
    }

    const handleGuardarFechaEntrega = async () => {
        if (!formActions?.actualizarPedido) {
            alert('Función no disponible')
            return
        }
        try {
            const resultado = await formActions.actualizarPedido(pedido.id, { fecha_entrega_estimada: fechaEntrega || null })
            if (resultado?.success) {
                mostrarExito('✅ Fecha de entrega actualizada')
                setEditandoFecha(false)
                if (formActions.recargarTodosLosDatos) formActions.recargarTodosLosDatos()
            } else {
                alert('❌ Error: ' + (resultado?.mensaje || 'Error desconocido'))
            }
        } catch (error) {
            alert('❌ Error: ' + error.message)
        }
    }

    return (
        <div className="w-full max-w-[440px] mx-auto space-y-2">

            {/* Mensaje de éxito flotante */}
            {mensajeExito && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                    <BadgeCheck size={14} />
                    {mensajeExito}
                </div>
            )}

            {/* Header */}
            <div className="pb-1.5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Detalle del Pedido</h3>
                        <p className="text-[10px] text-gray-500">Ref: <span className="font-mono font-bold text-blue-600">{pedido?.codigo || 'N/A'}</span></p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${estadoActual.color}`}>
                        <EstadoIcon size={10} />
                        {estadoActual.label}
                    </span>
                </div>
            </div>

            {/* Info Principal */}
            <div className="grid grid-cols-3 gap-1.5">
                <div className="col-span-1 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <div className="flex items-center gap-1 mb-0.5">
                        <User size={8} className="text-gray-400" />
                        <span className="text-[8px] text-gray-500 uppercase font-semibold">Cliente</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-900 truncate">{pedido?.cliente_nombre || 'No especificado'}</p>
                    {cliente?.telefono && (
                        <p className="text-[8px] text-gray-500 truncate">{cliente.telefono}</p>
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <span className="text-[8px] text-gray-500 uppercase font-semibold block mb-0.5">Pedido</span>
                    <p className="text-[9px] font-bold text-gray-900">{formatearFecha(pedido?.fecha_pedido)}</p>
                </div>

                {/* Fecha entrega editable */}
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[8px] text-gray-500 uppercase font-semibold">Entrega</span>
                        <button
                            onClick={() => setEditandoFecha(v => !v)}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="Editar fecha"
                        >
                            <Pencil size={8} />
                        </button>
                    </div>
                    {editandoFecha ? (
                        <div className="space-y-1">
                            <input
                                type="date"
                                className="w-full border border-blue-300 rounded px-1 py-0.5 text-[9px] focus:ring-1 focus:ring-blue-500"
                                value={fechaEntrega}
                                onChange={e => setFechaEntrega(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-1">
                                <button
                                    onClick={() => { setEditandoFecha(false); setFechaEntrega(pedido?.fecha_entrega_estimada || '') }}
                                    className="flex-1 text-[8px] bg-gray-100 hover:bg-gray-200 text-gray-600 rounded py-0.5"
                                >
                                    ✕
                                </button>
                                <button
                                    onClick={handleGuardarFechaEntrega}
                                    className="flex-1 text-[8px] bg-blue-600 hover:bg-blue-700 text-white rounded py-0.5 font-bold"
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[9px] font-bold text-gray-900">{formatearFecha(fechaEntrega) || 'Sin fecha'}</p>
                    )}
                </div>
            </div>

            {/* Productos */}
            <div>
                <div className="flex items-center gap-1 mb-1">
                    <Package size={10} className="text-gray-500" />
                    <span className="text-[10px] font-bold text-gray-700 uppercase">Productos ({items.length})</span>
                </div>
                <div className="border border-gray-100 rounded-lg max-h-[90px] overflow-y-auto bg-white shadow-sm">
                    {items.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <div key={index} className="px-2.5 py-1.5 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-50 p-1 rounded">
                                            <Package size={11} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900">{item.producto || item.nombre || 'Producto'}</p>
                                            <p className="text-[10px] text-gray-500">${formatearMonto(item.precio)} × {item.cantidad}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-800">
                                        ${formatearMonto((item.precio || 0) * (item.cantidad || 1))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 text-center">
                            <p className="text-xs text-gray-400">No hay productos registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== PANEL DE COBRO ===== */}
            <div className={`rounded-xl border-2 p-3 ${estaPagadoCompleto ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-1.5 mb-2">
                    <CreditCard size={12} className={estaPagadoCompleto ? 'text-green-600' : 'text-blue-600'} />
                    <h4 className={`text-[10px] uppercase font-bold ${estaPagadoCompleto ? 'text-green-700' : 'text-blue-700'}`}>
                        Cobros
                    </h4>
                </div>

                {/* Barra de progreso */}
                <div className="mb-2">
                    <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
                        <span>Progreso de pago</span>
                        <span className="font-bold">{porcentajePagado.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${estaPagadoCompleto ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${porcentajePagado}%` }}
                        />
                    </div>
                </div>

                {/* Montos */}
                <div className="grid grid-cols-3 gap-1 mb-2">
                    <div className="bg-white rounded-lg p-1.5 text-center border border-gray-100">
                        <p className="text-[8px] text-gray-500 uppercase">Total</p>
                        <p className="text-[11px] font-bold text-gray-900">${formatearMonto(total)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-1.5 text-center border border-green-100">
                        <p className="text-[8px] text-green-600 uppercase">Cobrado</p>
                        <p className="text-[11px] font-bold text-green-600">${formatearMonto(montoAbonado)}</p>
                    </div>
                    <div className={`rounded-lg p-1.5 text-center border ${estaPagadoCompleto ? 'bg-green-100 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                        <p className={`text-[8px] uppercase ${estaPagadoCompleto ? 'text-green-600' : 'text-orange-600'}`}>Saldo</p>
                        <p className={`text-[11px] font-bold ${estaPagadoCompleto ? 'text-green-600' : 'text-orange-600'}`}>
                            ${formatearMonto(saldoPendiente)}
                        </p>
                    </div>
                </div>

                {/* Acciones de cobro */}
                {estaPagadoCompleto ? (
                    <div className="flex items-center justify-center gap-2 bg-green-100 border border-green-300 py-2 rounded-lg">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-xs font-bold text-green-700">PAGADO COMPLETAMENTE</span>
                    </div>
                ) : (
                    <div>
                        {editandoPago ? (
                            /* Formulario de abono */
                            <div className="bg-white rounded-lg p-2 border border-blue-200 space-y-2">
                                {/* Método de pago */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">Método de pago</label>
                                    <div className="flex flex-wrap gap-1">
                                        {['Efectivo', 'Transferencia', 'Tarjeta', 'MercadoPago'].map(metodo => (
                                            <button
                                                key={metodo}
                                                type="button"
                                                onClick={() => setMetodoCobro(metodo)}
                                                className={`px-2 py-0.5 text-[9px] rounded-full border font-medium transition-colors ${metodoCobro === metodo
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                                    }`}
                                            >
                                                {metodo}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                                        Monto a cobrar <span className="text-gray-400">(máx: ${formatearMonto(saldoPendiente)})</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-lg pl-5 pr-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0.00"
                                            value={montoAbono}
                                            onChange={(e) => setMontoAbono(e.target.value)}
                                            autoFocus
                                            step="0.01"
                                            min="0.01"
                                            max={saldoPendiente}
                                            disabled={cargando}
                                        />
                                    </div>
                                    {/* Acceso rápido: pagar todo */}
                                    <button
                                        onClick={() => setMontoAbono(saldoPendiente.toString())}
                                        className="mt-1 text-[9px] text-blue-600 hover:underline"
                                    >
                                        Usar saldo completo (${formatearMonto(saldoPendiente)})
                                    </button>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => { setEditandoPago(false); setMontoAbono('') }}
                                        disabled={cargando}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded-lg text-[10px] font-medium disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRegistrarAbonoDirecto}
                                        disabled={cargando || !montoAbono || parseFloat(montoAbono) <= 0}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                    >
                                        <Banknote size={11} />
                                        {cargando ? 'Procesando...' : 'Confirmar Cobro'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Botones principales */
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditandoPago(true)}
                                    disabled={cargando}
                                    className="flex-1 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-2 py-2 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                    <DollarSign size={11} />
                                    Registrar Cobro
                                </button>
                                <button
                                    onClick={handleMarcarPagadoDirecto}
                                    disabled={cargando}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm"
                                >
                                    <CheckCircle size={11} />
                                    Saldar Todo
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Notas */}
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                <label className="text-[9px] uppercase font-bold text-yellow-700 mb-1 flex items-center gap-1">
                    <Edit2 size={9} />
                    Notas
                </label>
                <textarea
                    className="w-full bg-transparent text-[11px] text-gray-700 focus:outline-none resize-none min-h-[28px]"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Sin notas..."
                    disabled={cargando}
                />
                {notas !== pedido?.notas && (
                    <button
                        onClick={handleGuardarNotas}
                        disabled={cargando}
                        className="mt-0.5 text-[10px] bg-yellow-600 text-white px-2 py-0.5 rounded hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                        Guardar
                    </button>
                )}
            </div>

            {/* Estado Operativo */}
            <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Estado Operativo</p>
                <div className="flex flex-wrap gap-1">
                    {Object.entries(estadosConfig).map(([key, config]) => {
                        const Icon = config.icon
                        const isActive = pedido?.estado === key
                        return (
                            <button
                                key={key}
                                onClick={() => handleCambiarEstado(key)}
                                disabled={isActive || cargando}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${isActive
                                    ? config.color + ' shadow-sm'
                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                    } disabled:cursor-not-allowed`}
                            >
                                <Icon size={10} />
                                {config.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 pt-1 border-t border-gray-100">
                <button
                    onClick={closeModal}
                    disabled={cargando}
                    className="flex-1 bg-white text-gray-600 px-3 py-1.5 text-[11px] rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 font-bold disabled:opacity-50"
                >
                    CERRAR
                </button>
            </div>
        </div>
    )
}

export default PedidoDetail