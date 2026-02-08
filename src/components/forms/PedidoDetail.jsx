"use client"

import { Package, User, Calendar, DollarSign, FileText, Clock, CheckCircle, XCircle, Truck, AlertCircle, CreditCard, Edit2 } from "lucide-react"
import { useState, useEffect } from "react"

const PedidoDetail = ({ pedido, facturas = [], formActions, closeModal, abonos = [] }) => {
    const [montoAbono, setMontoAbono] = useState('')
    const [editandoPago, setEditandoPago] = useState(false)
    const [notas, setNotas] = useState(pedido?.notas || '')
    const [cargando, setCargando] = useState(false)

    useEffect(() => {
        setNotas(pedido?.notas || '')
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

    // Calcular montos del pedido
    const total = Number.parseFloat(pedido?.total) || 0
    const montoAbonado = Number.parseFloat(pedido?.monto_abonado) || 0
    const saldoPendiente = Number.parseFloat(pedido?.saldo_pendiente) !== undefined
        ? Number.parseFloat(pedido.saldo_pendiente)
        : total - montoAbonado

    const estaPagadoCompleto = saldoPendiente <= 0.01 // Tolerancia pequeña para decimales

    const handleRegistrarAbonoDirecto = async () => {
        const monto = parseFloat(montoAbono)
        if (monto <= 0 || monto > saldoPendiente) {
            alert('Ingrese un monto válido (mayor a 0 y no mayor al saldo pendiente)')
            return
        }

        if (!formActions?.agregarAbonoAPedido) {
            alert('Función de pago no disponible')
            return
        }

        setCargando(true)
        try {
            const resultado = await formActions.agregarAbonoAPedido(pedido.id, monto)

            if (resultado.success) {
                alert('✅ Abono registrado exitosamente')
                setMontoAbono('')
                setEditandoPago(false)

                // Recargar datos
                if (formActions.recargarTodosLosDatos) {
                    formActions.recargarTodosLosDatos()
                }
            } else {
                alert('❌ Error registrando abono: ' + resultado.mensaje)
            }
        } catch (error) {
            console.error('Error registrando abono:', error)
            alert('❌ Error registrando abono: ' + error.message)
        } finally {
            setCargando(false)
        }
    }

    const handleMarcarPagadoDirecto = async () => {
        if (estaPagadoCompleto) {
            alert('Este pedido ya está pagado totalmente')
            return
        }

        const confirmar = window.confirm(`¿Marcar este pedido como PAGADO TOTAL?\n\nTotal: $${formatearMonto(total)}\nSaldo pendiente: $${formatearMonto(saldoPendiente)}`)
        if (!confirmar) return

        if (!formActions?.marcarPedidoPagadoTotal) {
            alert('Función no disponible')
            return
        }

        setCargando(true)
        try {
            const resultado = await formActions.marcarPedidoPagadoTotal(pedido.id)

            if (resultado.success) {
                alert('✅ Pedido marcado como pagado totalmente')

                if (formActions.recargarTodosLosDatos) {
                    formActions.recargarTodosLosDatos()
                }
            } else {
                alert('❌ Error: ' + resultado.mensaje)
            }
        } catch (error) {
            console.error('Error marcando como pagado:', error)
            alert('❌ Error marcando como pagado: ' + error.message)
        } finally {
            setCargando(false)
        }
    }

    const handleCambiarEstado = async (nuevoEstado) => {
        if (!formActions?.actualizarEstadoPedido) {
            alert('Función no disponible')
            return
        }

        if (pedido?.estado === nuevoEstado) {
            return
        }

        try {
            const confirmar = window.confirm(`¿Cambiar estado a ${estadosConfig[nuevoEstado]?.label || nuevoEstado}?`)
            if (!confirmar) return

            const resultado = await formActions.actualizarEstadoPedido(pedido.id, nuevoEstado)
            if (resultado.success) {
                alert('✅ Estado actualizado')
                if (formActions.recargarTodosLosDatos) {
                    formActions.recargarTodosLosDatos()
                }
            } else {
                alert('❌ Error actualizando estado: ' + resultado.mensaje)
            }
        } catch (error) {
            console.error('Error cambiando estado:', error)
            alert('❌ Error cambiando estado: ' + error.message)
        }
    }

    const handleGuardarNotas = async () => {
        if (!formActions?.actualizarNotasPedido) {
            alert('Función no disponible')
            return
        }

        try {
            const resultado = await formActions.actualizarNotasPedido(pedido.id, notas)
            if (resultado.success) {
                alert('✅ Notas guardadas exitosamente')
            } else {
                alert('❌ Error guardando notas: ' + resultado.mensaje)
            }
        } catch (error) {
            console.error('Error guardando notas:', error)
            alert('❌ Error guardando notas: ' + error.message)
        }
    }

    return (
        <div className="w-full max-w-[420px] mx-auto space-y-2">
            {/* Header */}
            <div className="pb-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Detalle del Pedido</h3>
                        <p className="text-xs text-gray-500">Código: <span className="font-mono font-bold">{pedido?.codigo || 'N/A'}</span></p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${estadoActual.color}`}>
                        <EstadoIcon size={12} />
                        {estadoActual.label}
                    </span>
                </div>
            </div>

            {/* Info Principal */}
            <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                    <div className="flex items-center gap-1 mb-0.5">
                        <User size={10} className="text-gray-400" />
                        <span className="text-[9px] text-gray-500 uppercase font-semibold">Cliente</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 truncate">{pedido?.cliente_nombre || 'No especificado'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                    <div className="flex items-center gap-1 mb-0.5">
                        <Calendar size={10} className="text-gray-400" />
                        <span className="text-[9px] text-gray-500 uppercase font-semibold">Fecha</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900">{formatearFecha(pedido?.fecha_pedido)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                    <div className="flex items-center gap-1 mb-0.5">
                        <Truck size={10} className="text-gray-400" />
                        <span className="text-[9px] text-gray-500 uppercase font-semibold">Entrega</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900">{formatearFecha(pedido?.fecha_entrega_estimada)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                    <div className="flex items-center gap-1 mb-0.5">
                        <DollarSign size={10} className="text-gray-400" />
                        <span className="text-[9px] text-gray-500 uppercase font-semibold">Saldo</span>
                    </div>
                    <p className={`text-xs font-bold ${saldoPendiente > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        ${formatearMonto(saldoPendiente)}
                    </p>
                </div>
            </div>

            {/* Productos */}
            <div>
                <div className="flex items-center gap-1 mb-1">
                    <Package size={12} className="text-gray-500" />
                    <span className="text-[11px] font-bold text-gray-700 uppercase">Productos ({items.length})</span>
                </div>
                <div className="border border-gray-100 rounded-lg max-h-[100px] overflow-y-auto bg-white shadow-sm">
                    {items.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <div key={index} className="px-2 py-1.5 flex items-center justify-between bg-white hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 p-1 rounded">
                                            <Package size={10} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-900">{item.producto || item.nombre || 'Producto'}</p>
                                            <p className="text-[10px] text-gray-500">${formatearMonto(item.precio)} x {item.cantidad}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">
                                        ${formatearMonto((item.precio || 0) * (item.cantidad || 1))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-xs text-gray-400">No hay productos registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Resumen de Pago SIMPLIFICADO */}
            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg p-2.5 border border-blue-100">
                <h4 className="text-[10px] uppercase font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                    <CreditCard size={10} />
                    Resumen de Pago
                </h4>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Total del pedido:</span>
                        <span className="font-bold text-gray-900">${formatearMonto(total)}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Monto abonado:</span>
                        <span className="font-medium text-green-600">
                            ${formatearMonto(montoAbonado)}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs border-t border-blue-200/50 pt-1">
                        <span className="text-gray-700 font-bold">Saldo pendiente:</span>
                        <span className={`font-bold ${saldoPendiente > 0 ? 'text-orange-600' : 'text-green-600 text-sm'}`}>
                            ${formatearMonto(saldoPendiente)}
                        </span>
                    </div>
                </div>

                {/* Estado de pago */}
                <div className="mt-1.5 pt-1.5 border-t border-blue-200/50">
                    {estaPagadoCompleto ? (
                        <div className="flex items-center justify-center gap-1 text-green-600 text-[11px] font-bold bg-green-50 py-1 rounded">
                            <CheckCircle size={12} />
                            PAGO COMPLETADO
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1 text-orange-600 text-[10px] font-bold uppercase">
                                <AlertCircle size={10} />
                                {montoAbonado > 0 ? 'Pago Parcial' : 'Sin abonos'}
                            </div>

                            {/* Controles de pago DIRECTOS */}
                            <div className="bg-white/60 rounded p-1.5">
                                {editandoPago ? (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-[10px] text-gray-600 mb-0.5">Monto a abonar:</label>
                                            <div className="flex gap-1">
                                                <input
                                                    type="number"
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                                    placeholder="Monto"
                                                    value={montoAbono}
                                                    onChange={(e) => setMontoAbono(e.target.value)}
                                                    autoFocus
                                                    step="0.01"
                                                    min="0"
                                                    max={saldoPendiente}
                                                    disabled={cargando}
                                                />
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">
                                                Máximo: ${formatearMonto(saldoPendiente)}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditandoPago(false)}
                                                disabled={cargando}
                                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] disabled:opacity-50"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleRegistrarAbonoDirecto}
                                                disabled={cargando || !montoAbono || parseFloat(montoAbono) <= 0}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {cargando ? 'Procesando...' : 'Guardar Abono'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditandoPago(true)}
                                            disabled={cargando || estaPagadoCompleto}
                                            className="flex-1 bg-white border border-green-600 text-green-600 hover:bg-green-50 px-2 py-1.5 rounded text-[10px] font-medium transition-colors disabled:opacity-50"
                                        >
                                            Agregar Abono
                                        </button>
                                        <button
                                            onClick={handleMarcarPagadoDirecto}
                                            disabled={cargando || estaPagadoCompleto}
                                            className="flex-1 bg-green-600 text-white hover:bg-green-700 px-2 py-1.5 rounded text-[10px] font-medium transition-colors disabled:opacity-50"
                                        >
                                            {estaPagadoCompleto ? 'Pagado Total' : 'Marcar Pagado Total'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notas */}
            <div className="bg-yellow-50/50 rounded-lg p-2 border border-yellow-100">
                <label className="text-[9px] uppercase font-bold text-yellow-700 mb-1 flex items-center gap-1">
                    <Edit2 size={10} />
                    Notas del Pedido
                </label>
                <textarea
                    className="w-full bg-transparent text-xs text-gray-700 focus:outline-none resize-none min-h-[35px]"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Sin notas..."
                    disabled={cargando}
                />
                {notas !== pedido?.notas && (
                    <button
                        onClick={handleGuardarNotas}
                        disabled={cargando}
                        className="mt-1 text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                        Guardar Notas
                    </button>
                )}
            </div>

            {/* Acciones de Estado */}
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
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${isActive
                                    ? config.color + ' opacity-100 shadow-sm'
                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-200 hover:text-gray-700'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <Icon size={12} />
                                {config.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2 pt-1.5 border-t border-gray-100">
                <button
                    onClick={closeModal}
                    disabled={cargando}
                    className="flex-1 bg-white text-gray-600 px-3 py-1.5 text-xs rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 font-bold disabled:opacity-50"
                >
                    CERRAR
                </button>

                {/* OPCIÓN para crear factura (OPCIONAL) */}
                {formActions?.facturarPedido && !pedido?.factura_id && (
                    <button
                        onClick={async () => {
                            if (formActions?.facturarPedido) {
                                const confirmar = window.confirm('¿Crear factura para este pedido?\n\nEsto generará una factura separada en el módulo de facturación.')
                                if (!confirmar) return

                                setCargando(true)
                                try {
                                    const resultado = await formActions.facturarPedido(pedido.id)
                                    if (resultado.success) {
                                        alert('✅ Factura creada exitosamente')
                                        if (formActions.recargarTodosLosDatos) {
                                            formActions.recargarTodosLosDatos()
                                        }
                                    } else {
                                        alert('❌ Error creando factura: ' + resultado.mensaje)
                                    }
                                } catch (error) {
                                    console.error('Error creando factura:', error)
                                    alert('❌ Error creando factura: ' + error.message)
                                } finally {
                                    setCargando(false)
                                }
                            }
                        }}
                        disabled={cargando}
                        className="flex-1 bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm shadow-blue-200 disabled:opacity-50"
                    >
                        CREAR FACTURA (OPCIONAL)
                    </button>
                )}
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                    <AlertCircle size={10} className="text-blue-600" />
                    <span className="text-[9px] font-bold text-blue-800">INFORMACIÓN</span>
                </div>
                <p className="text-[10px] text-blue-700">
                    Este pedido maneja pagos directamente. Los abonos se registran aquí y se reflejan en el saldo pendiente.
                </p>
            </div>
        </div>
    )
}

export default PedidoDetail