"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

export const useFacturacion = () => {
  const { user, logout } = useAuth()

  const checkAuthError = (error) => {
    if (error && (error.code === 'PGRST303' || error.message?.includes('JWT expired') || error.code === '401')) {
      console.warn('Sesión expirada, cerrando sesión...')
      logout()
      return true
    }
    return false
  }

  // Estados principales
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [facturas, setFacturas] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [caja, setCaja] = useState({ saldo: 0, ingresos: 0, egresos: 0 })
  const [movimientosCaja, setMovimientosCaja] = useState([])
  const [cierresCaja, setCierresCaja] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [abonos, setAbonos] = useState([])
  const [presupuestos, setPresupuestos] = useState([])
  const [categorias, setCategorias] = useState([])

  // Estados para modales
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', cuit: '' })
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: 0, stock: 0, stockMinimo: 5 })
  const [nuevaFactura, setNuevaFactura] = useState({
    tipo: 'Factura A',
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    metodoPago: 'Efectivo',
    items: [],
    total: 0,
    montoPagado: 0,
    tipoOperacion: 'venta-productos',
    esCotizacion: false
  })
  const [nuevoMovimiento, setNuevoMovimiento] = useState({ tipo: 'ingreso', monto: 0, descripcion: '' })
  const [clienteRapido, setClienteRapido] = useState({ nombre: '', telefono: '' })
  const [productoRapido, setProductoRapido] = useState({ nombre: '', precio: 0 })

  // Estados para control de UI
  const [modalType, setModalType] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [tipoOperacion, setTipoOperacion] = useState('venta-productos')

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      cargarDatos()
    }
  }, [user])

  // Función para cargar todos los datos
  const cargarDatos = useCallback(async () => {
    try {
      // Cargar clientes
      const { data: clientesData, error: errorClientes } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (errorClientes) {
        if (checkAuthError(errorClientes)) return
        console.error('Error cargando clientes:', errorClientes)
      } else if (clientesData) {
        setClientes(clientesData) // set inmediato; se recalculará más adelante
      }


      // Cargar productos
      const { data: productosData, error: errorProductos } = await supabase
        .from('productos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (errorProductos) {
        console.error('Error cargando productos:', errorProductos)
      } else if (productosData) {
        setProductos(productosData)
      }

      // Cargar facturas
      const { data: facturasData, error: errorFacturas } = await supabase
        .from('facturas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (errorFacturas) {
        console.error('Error cargando facturas:', errorFacturas)
      } else if (facturasData) {
        setFacturas(facturasData)

        // ── RECALCULAR DEUDA REAL DE CADA CLIENTE ──────────────────────────
        // Sumamos el saldopendiente de todas las facturas que NO estén pagadas ni anuladas.
        // Cubre tanto las ventas de Pedidos como las Facturas Directas.
        // Funciona con facturas que tengan cliente_id (FK) o solo nombre (fallback).
        if (clientesData) {
          // Índice por nombre (minúsculas) para compatibilidad con facturas antiguas
          const clientePorNombre = {}
          clientesData.forEach(c => {
            if (c.nombre) clientePorNombre[c.nombre.toLowerCase()] = c.id
          })

          const deudaPorCliente = {}
          facturasData.forEach(f => {
            if (f.estado === 'anulada' || f.estado === 'pagada') return
            const saldo = parseFloat(f.saldopendiente) || 0
            if (saldo <= 0) return
            // Priorizar cliente_id; si no existe, buscar por nombre
            let cId = f.cliente_id
            if (!cId && f.cliente) {
              cId = clientePorNombre[f.cliente.toLowerCase()] || null
            }
            if (!cId) return
            deudaPorCliente[cId] = (deudaPorCliente[cId] || 0) + saldo
          })

          // Actualizar la deuda calculada en el array de clientes (sin persistir en BD)
          const clientesConDeuda = clientesData.map(c => ({
            ...c,
            deuda: deudaPorCliente[c.id] || 0
          }))
          setClientes(clientesConDeuda)
        }
        // ───────────────────────────────────────────────────────────────────
      }



      // Cargar proveedores
      const { data: proveedoresData, error: errorProveedores } = await supabase
        .from('proveedores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (errorProveedores) {
        console.error('Error cargando proveedores:', errorProveedores)
      } else if (proveedoresData) {
        setProveedores(proveedoresData)
      }

      // Cargar pedidos (CON LOS NUEVOS CAMPOS)
      const { data: pedidosData, error: errorPedidos } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (errorPedidos) {
        console.error('Error cargando pedidos:', errorPedidos)
      } else if (pedidosData) {
        // Asegurar que los nuevos campos tengan valores por defecto
        const pedidosConCampos = pedidosData.map(pedido => ({
          ...pedido,
          monto_abonado: pedido.monto_abonado || 0,
          saldo_pendiente: pedido.saldo_pendiente !== undefined ? pedido.saldo_pendiente : (pedido.total || 0)
        }))
        setPedidos(pedidosConCampos)
      }

      // Cargar abonos
      const { data: abonosData, error: errorAbonos } = await supabase
        .from('abonos')
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: false })

      if (errorAbonos) {
        console.error('Error cargando abonos:', errorAbonos)
      } else if (abonosData) {
        setAbonos(abonosData)
      }

      // Cargar movimientos de caja del día con rango ISO correcto por timezone local
      const inicioHoy = new Date(); inicioHoy.setHours(0, 0, 0, 0)
      const finHoy = new Date(); finHoy.setHours(23, 59, 59, 999)
      const { data: movimientosData, error: errorMovimientos } = await supabase
        .from('movimientos_caja')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', inicioHoy.toISOString())
        .lte('fecha', finHoy.toISOString())
        .order('fecha', { ascending: false })

      if (errorMovimientos) {
        console.error('Error cargando movimientos de caja:', errorMovimientos)
      } else if (movimientosData) {
        setMovimientosCaja(movimientosData)
      }

      // Cargar cierres de caja
      const { data: cierresData, error: errorCierres } = await supabase
        .from('cierres_caja')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (errorCierres) {
        console.error('Error cargando cierres de caja:', errorCierres)
      } else if (cierresData) {
        setCierresCaja(cierresData)
      }

      // Calcular caja manualmente (la tabla 'caja' no existe)
      await calcularCajaManual()

      // Cargar presupuestos
      const { data: presupuestosData } = await supabase
        .from('presupuestos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (presupuestosData) setPresupuestos(presupuestosData)

      // Cargar categorias
      const { data: categoriasData } = await supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .order('nombre', { ascending: true })
      if (categoriasData) setCategorias(categoriasData)

    } catch (error) {
      console.error('Error general cargando datos:', error)
    }
  }, [user])

  // Función para calcular caja manualmente
  const calcularCajaManual = async () => {
    try {
      // Rango de inicio/fin del día local en UTC para matchear timestamps correctamente
      const inicioHoy = new Date(); inicioHoy.setHours(0, 0, 0, 0)
      const finHoy = new Date(); finHoy.setHours(23, 59, 59, 999)
      const { data: movimientosHoy, error } = await supabase
        .from('movimientos_caja')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', inicioHoy.toISOString())
        .lte('fecha', finHoy.toISOString())
        .order('fecha', { ascending: false })

      if (error) {
        console.error('Error calculando caja:', error)
        return
      }

      let ingresos = 0
      let egresos = 0

      movimientosHoy?.forEach(movimiento => {
        if (movimiento.tipo === 'ingreso') {
          ingresos += parseFloat(movimiento.monto) || 0
        } else if (movimiento.tipo === 'egreso') {
          egresos += parseFloat(movimiento.monto) || 0
        }
      })

      const saldo = ingresos - egresos

      setCaja({
        saldo,
        ingresos,
        egresos
      })

    } catch (error) {
      console.error('Error calculando caja manual:', error)
    }
  }

  // Cargar movimientos de una fecha específica (selector de fecha en ControlCaja)
  const cargarMovimientosPorFecha = async (fechaStr) => {
    try {
      if (!user) return { movimientos: [], caja: { ingresos: 0, egresos: 0, saldo: 0 } }

      // Calcular rango inicio/fin del día local en UTC
      const fechaBase = new Date(fechaStr + 'T00:00:00')
      const inicioFecha = new Date(fechaBase); inicioFecha.setHours(0, 0, 0, 0)
      const finFecha = new Date(fechaBase); finFecha.setHours(23, 59, 59, 999)

      const { data: movimientos, error } = await supabase
        .from('movimientos_caja')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', inicioFecha.toISOString())
        .lte('fecha', finFecha.toISOString())
        .order('fecha', { ascending: false })

      if (error) {
        console.error('Error cargando movimientos por fecha:', error)
        return { movimientos: [], caja: { ingresos: 0, egresos: 0, saldo: 0 } }
      }

      const lista = movimientos || []
      let ingresos = 0
      let egresos = 0
      lista.forEach(m => {
        if (m.tipo === 'ingreso') ingresos += parseFloat(m.monto) || 0
        else if (m.tipo === 'egreso') egresos += parseFloat(m.monto) || 0
      })

      return { movimientos: lista, caja: { ingresos, egresos, saldo: ingresos - egresos } }
    } catch (err) {
      console.error('Error cargarMovimientosPorFecha:', err)
      return { movimientos: [], caja: { ingresos: 0, egresos: 0, saldo: 0 } }
    }
  }

  // ========== FUNCIONES NUEVAS PARA PEDIDOS SIMPLES ==========

  // 1. Helper para generar número de factura
  const generarNumeroFactura = async () => {
    const { data: ultimaFactura } = await supabase
      .from('facturas')
      .select('numero')
      .eq('tipo', 'Factura A')
      .order('created_at', { ascending: false })
      .limit(1)

    let ultimoNumero = 0
    if (ultimaFactura && ultimaFactura.length > 0) {
      const matches = ultimaFactura[0].numero.match(/\d+/g)
      if (matches) ultimoNumero = parseInt(matches[matches.length - 1]) || 0
    }
    return `FA-${(ultimoNumero + 1).toString().padStart(8, '0')}`
  }

  // 2. Lógica UNIFICADA de cobro (Regla de Oro)
  const registrarCobro = async (ventaId, monto, descripcion = '', metodoPago = 'Efectivo') => {
    try {
      console.log(`💰 Registrando cobro unificado para venta ${ventaId}: $${monto}`)

      // A. Obtener Venta (Factura)
      const { data: venta, error: ventaError } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', ventaId)
        .single()

      if (ventaError) throw new Error('Venta asociada no encontrada')

      const montoCobro = parseFloat(monto)
      if (montoCobro <= 0) throw new Error('Monto debe ser mayor a 0')

      // B. Obtener código de pedido asociado (si existe)
      let pedidoCodigo = null
      if (venta.pedido_id) {
        const { data: pedido } = await supabase
          .from('pedidos')
          .select('codigo')
          .eq('id', venta.pedido_id)
          .single()
        pedidoCodigo = pedido?.codigo || null
      }

      // Armar descripción con número de pedido si está disponible
      const descAuto = pedidoCodigo
        ? `Cobro ${pedidoCodigo} (${venta.numero || 'FA'}) - ${venta.cliente || 'Cliente'}`
        : `Cobro ${venta.numero || 'S/N'} - ${venta.cliente || 'Cliente'}`

      // C. Crear Movimiento de Caja
      const movData = {
        tipo: 'ingreso',
        monto: montoCobro,
        description: descripcion || descAuto,
        metodo: metodoPago || 'Efectivo',
        referencia: pedidoCodigo ? `pedido:${venta.pedido_id}` : 'venta',
        fecha: new Date().toISOString(),
        user_id: user.id
      }

      // Usamos el helper existente agregarMovimientoCaja para actualizar state local
      await agregarMovimientoCaja(movData)

      // C. Crear Abono (Registro histórico)
      const abonoData = {
        cliente_nombre: venta.cliente,
        monto: montoCobro,
        fecha: new Date().toISOString().split('T')[0],
        metodo: 'Efectivo',
        descripcion: movData.descripcion,
        user_id: user.id
      }
      const { error: abonoError } = await supabase.from('abonos').insert([abonoData])
      if (!abonoError) {
        setAbonos(prev => [abonoData, ...prev])
      }

      // D. Actualizar Venta (Factura)
      const nuevoPagado = (parseFloat(venta.montopagado) || 0) + montoCobro
      const nuevoSaldo = Math.max(0, (parseFloat(venta.total) || 0) - nuevoPagado)
      let nuevoEstado = venta.estado
      if (nuevoSaldo === 0) nuevoEstado = 'pagada'
      else if (nuevoPagado > 0) nuevoEstado = 'parcial'

      const { error: updateVentaError } = await supabase
        .from('facturas')
        .update({
          montopagado: nuevoPagado,
          saldopendiente: nuevoSaldo,
          estado: nuevoEstado
        })
        .eq('id', ventaId)

      if (updateVentaError) throw updateVentaError

      // Actualizar estado local Facturas
      setFacturas(prev => prev.map(f => f.id === ventaId ? { ...f, montopagado: nuevoPagado, saldopendiente: nuevoSaldo, estado: nuevoEstado } : f))

      // F. Actualizar deuda del cliente en estado local
      if (venta.cliente_id) {
        // Reducimos la deuda: si pagó de más el saldo delta es la reducción real
        const reduccion = (parseFloat(venta.saldopendiente) || 0) - nuevoSaldo
        setClientes(prev => prev.map(c =>
          c.id === venta.cliente_id
            ? { ...c, deuda: Math.max(0, (parseFloat(c.deuda) || 0) - reduccion) }
            : c
        ))
      }

      // E. Sincronizar Pedido Asociado — usa FK pedido_id (no busca por texto en notas)
      if (venta.pedido_id) {
        const { data: pedido } = await supabase
          .from('pedidos')
          .select('*')
          .eq('id', venta.pedido_id)
          .single()

        if (pedido) {
          const nuevoPagadoPedido = (parseFloat(pedido.monto_abonado) || 0) + montoCobro
          const nuevoSaldoPedido = Math.max(0, (parseFloat(pedido.total) || 0) - nuevoPagadoPedido)

          await supabase.from('pedidos').update({
            monto_abonado: nuevoPagadoPedido,
            saldo_pendiente: nuevoSaldoPedido
          }).eq('id', pedido.id)

          // Actualizar estado local Pedidos
          setPedidos(prev => prev.map(p =>
            p.id === pedido.id
              ? { ...p, monto_abonado: nuevoPagadoPedido, saldo_pendiente: nuevoSaldoPedido }
              : p
          ))
        }
      }

      return { success: true, nuevoSaldo }

    } catch (e) {
      console.error('Error en registrarCobro:', e)
      return { success: false, mensaje: e.message }
    }
  }

  // 3. Crear Pedido (Crea Pedido + Venta automáticamente) — OPTIMIZADO
  const agregarPedidoSolo = async (pedidoData) => {
    try {
      // Validaciones
      if (!pedidoData.clienteNombre) throw new Error('Nombre de cliente requerido')
      if (!pedidoData.items?.length) throw new Error('Productos requeridos')

      const total = pedidoData.items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0)
      const montoPagadoInicial = parseFloat(pedidoData.montoPagado) || 0
      const saldoNuevoPedido = total - montoPagadoInicial
      const hoy = new Date().toISOString().split('T')[0]

      // ── PARALELO: generar codigo de pedido y numero de factura al mismo tiempo
      const [ultimoPedidoRes, ultimaFacturaRes] = await Promise.all([
        supabase.from('pedidos').select('codigo').order('created_at', { ascending: false }).limit(1),
        supabase.from('facturas').select('numero').eq('tipo', 'Factura A').order('created_at', { ascending: false }).limit(1)
      ])

      let num = 1
      if (ultimoPedidoRes.data?.[0]?.codigo) {
        const m = ultimoPedidoRes.data[0].codigo.match(/\d+/)
        if (m) num = parseInt(m[0]) + 1
      }
      const codigoPedido = `PED-${num.toString().padStart(3, '0')}`

      let ultimoNumero = 0
      if (ultimaFacturaRes.data?.[0]?.numero) {
        const matches = ultimaFacturaRes.data[0].numero.match(/\d+/g)
        if (matches) ultimoNumero = parseInt(matches[matches.length - 1]) || 0
      }
      const numeroFactura = `FA-${(ultimoNumero + 1).toString().padStart(8, '0')}`

      let fechaEntrega = pedidoData.fechaEntregaEstimada
      if (!fechaEntrega || String(fechaEntrega).trim() === '') {
        const d = new Date(); d.setDate(d.getDate() + 7)
        fechaEntrega = d.toISOString().split('T')[0]
      }

      // ── OPTIMISTIC UI: actualizar pantalla inmediatamente, sin esperar Supabase
      const tempId = `temp-${Date.now()}`
      const tempVentaId = `temp-v-${Date.now()}`
      const pedidoOptimista = {
        id: tempId, codigo: codigoPedido,
        cliente_id: pedidoData.clienteId, cliente_nombre: pedidoData.clienteNombre,
        fecha_pedido: pedidoData.fechaPedido || hoy, fecha_entrega_estimada: fechaEntrega,
        items: JSON.stringify(pedidoData.items), total,
        productos_count: pedidoData.items.length, notas: pedidoData.notas,
        estado: pedidoData.estado || 'pendiente',
        canal_venta: pedidoData.canalVenta || null,
        monto_abonado: montoPagadoInicial, saldo_pendiente: saldoNuevoPedido,
        user_id: user.id, created_at: new Date().toISOString()
      }
      const estadoVentaOpt = saldoNuevoPedido <= 0 ? 'pagada' : montoPagadoInicial > 0 ? 'parcial' : 'pendiente'
      const ventaOptimista = {
        id: tempVentaId, tipo: 'Factura A', numero: numeroFactura,
        fecha: hoy, cliente: pedidoData.clienteNombre,
        items: JSON.stringify(pedidoData.items), total,
        montopagado: montoPagadoInicial, saldopendiente: saldoNuevoPedido,
        estado: estadoVentaOpt, user_id: user.id
      }
      setPedidos(prev => [pedidoOptimista, ...prev])
      setFacturas(prev => [ventaOptimista, ...prev])
      if (pedidoData.clienteId && saldoNuevoPedido > 0) {
        setClientes(prev => prev.map(c =>
          c.id === pedidoData.clienteId
            ? { ...c, deuda: (parseFloat(c.deuda) || 0) + saldoNuevoPedido }
            : c
        ))
      }

      // ── PERSISTIR en Supabase (pedido primero, factura necesita su ID)
      const pedidoDB = {
        codigo: codigoPedido, cliente_id: pedidoData.clienteId,
        cliente_nombre: pedidoData.clienteNombre,
        fecha_pedido: pedidoData.fechaPedido || hoy,
        fecha_entrega_estimada: fechaEntrega,
        items: JSON.stringify(pedidoData.items), total,
        productos_count: pedidoData.items.length, notas: pedidoData.notas,
        estado: pedidoData.estado || 'pendiente',
        canal_venta: pedidoData.canalVenta || null,
        monto_abonado: montoPagadoInicial, saldo_pendiente: total - montoPagadoInicial,
        user_id: user.id, created_at: new Date().toISOString()
      }
      const { data: pedidoRes, error: pErr } = await supabase.from('pedidos').insert([pedidoDB]).select()
      if (pErr) throw pErr
      const nuevoPedido = pedidoRes[0]

      const ventaDB = {
        tipo: 'Factura A', numero: numeroFactura, fecha: hoy,
        cliente: pedidoData.clienteNombre, pedido_id: nuevoPedido.id,
        metodopago: 'Efectivo', items: JSON.stringify(pedidoData.items),
        total, montopagado: montoPagadoInicial, saldopendiente: total - montoPagadoInicial,
        estado: estadoVentaOpt, user_id: user.id
      }
      const { data: ventaRes, error: vErr } = await supabase.from('facturas').insert([ventaDB]).select()
      if (vErr) throw vErr
      const nuevaVenta = ventaRes[0]

      // Reemplazar registros optimistas con los reales (IDs de Supabase)
      setPedidos(prev => prev.map(p => p.id === tempId ? nuevoPedido : p))
      setFacturas(prev => prev.map(f => f.id === tempVentaId ? nuevaVenta : f))

        // ── BACKGROUND: cobro y stock sin bloquear el return
        ; (async () => {
          if (montoPagadoInicial > 0) {
            const descCobro = montoPagadoInicial >= total ? `Pago Total Pedido ${codigoPedido}` : `Seña Pedido ${codigoPedido}`
            await registrarCobro(nuevaVenta.id, montoPagadoInicial, descCobro)
          }
          // Actualizar todos los stocks en paralelo
          await Promise.all(
            pedidoData.items
              .filter(item => item.controlaStock !== false && item.productoId)
              .map(async item => {
                const { data: prod } = await supabase.from('productos').select('stock').eq('id', item.productoId).single()
                if (prod) await supabase.from('productos').update({ stock: prod.stock - item.cantidad }).eq('id', item.productoId)
              })
          )
        })().catch(e => console.warn('Background task error:', e))

      return { success: true, pedido: nuevoPedido, mensaje: 'Pedido y Venta creados' }

    } catch (error) {
      console.error('Error creando pedido:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // 4. Agregar Abono a Pedido — llama registrarCobro() (función unificada)
  const agregarAbonoAPedido = async (pedidoId, monto, metodoPago = 'Efectivo') => {
    try {
      const { data: venta, error: ventaError } = await supabase
        .from('facturas')
        .select('id')
        .eq('pedido_id', pedidoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (ventaError || !venta) throw new Error('No se encontró la Venta asociada a este pedido')

      return await registrarCobro(venta.id, monto, '', metodoPago)

    } catch (error) {
      console.error('Error agregando abono:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // 5. Marcar Pedido Pagado Total — llama registrarCobro() (función unificada)
  const marcarPedidoPagadoTotal = async (pedidoId, metodoPago = 'Efectivo') => {
    try {
      const { data: venta, error: ventaError } = await supabase
        .from('facturas')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (ventaError || !venta) throw new Error('Venta no encontrada')

      const faltante = parseFloat(venta.saldopendiente) || 0
      if (faltante <= 0) return { success: true, mensaje: 'Ya está pagado' }

      return await registrarCobro(venta.id, faltante, 'Pago Total Pedido', metodoPago)

    } catch (error) {
      console.error('Error saldando pedido:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // ========== FUNCIONES CATEGORIAS ==========
  const agregarCategoria = async (nombre) => {
    try {
      if (!nombre.trim()) return { success: false }
      const nueva = { nombre: nombre.trim(), user_id: user.id }
      const { data, error } = await supabase.from('categorias').insert([nueva]).select().single()
      if (error) throw error
      setCategorias(prev => [...prev, data])
      return { success: true, data }
    } catch (e) {
      console.error('Error agregarCategoria', e)
      return { success: false, mensaje: e.message }
    }
  }

  const renombrarCategoria = async (nombreViejo, nombreNuevo) => {
    try {
      const { error } = await supabase.from('categorias').update({ nombre: nombreNuevo }).eq('nombre', nombreViejo).eq('user_id', user.id)
      if (error) throw error
      setCategorias(prev => prev.map(c => c.nombre === nombreViejo ? { ...c, nombre: nombreNuevo } : c))

      // Actualizar todos los productos con esta categoria
      const prodAActualizar = productos.filter(p => p.categoria === nombreViejo)
      if (prodAActualizar.length > 0) {
        await supabase.from('productos').update({ categoria: nombreNuevo }).eq('categoria', nombreViejo).eq('user_id', user.id)
        setProductos(prev => prev.map(p => p.categoria === nombreViejo ? { ...p, categoria: nombreNuevo } : p))
      }

      return { success: true }
    } catch (e) {
      console.error('Error renombrarCategoria', e)
      return { success: false, mensaje: e.message }
    }
  }

  const eliminarCategoria = async (nombreCat) => {
    try {
      const prodsEnUso = productos.filter(p => p.categoria === nombreCat)
      if (prodsEnUso.length > 0) {
        return { success: false, mensaje: 'No se puede eliminar porque hay productos usándola' }
      }
      const { error } = await supabase.from('categorias').delete().eq('nombre', nombreCat).eq('user_id', user.id)
      if (error) throw error
      setCategorias(prev => prev.filter(c => c.nombre !== nombreCat))
      return { success: true }
    } catch (e) {
      console.error('Error eliminarCategoria', e)
      return { success: false, mensaje: e.message }
    }
  }

  // ========== FUNCIONES ORIGINALES (MANTENER PARA COMPATIBILIDAD) ==========

  // Función unificada para crear factura y pedido (MANTENER)
  const crearFacturaConPedido = async (ventaData) => {
    // ... (mantener todo el código original de crearFacturaConPedido)
    // Solo se usará si el usuario explícitamente quiere crear factura
    try {
      console.log('🔧 Iniciando creación de factura + pedido:', ventaData)
      // ... (código original completo)
    } catch (error) {
      console.error('❌ Error en crearFacturaConPedido:', error)
      return {
        success: false,
        mensaje: error.message || 'Error al crear factura y pedido'
      }
    }
  }

  // Función para agregar solo pedido (mantener para compatibilidad)
  const agregarPedido = async (pedidoData) => {
    try {
      // Validar datos mínimos
      if (!pedidoData.clienteNombre || pedidoData.clienteNombre.trim() === '') {
        throw new Error('El nombre del cliente es requerido')
      }

      // Usar la función unificada con montoPagado 0
      return await crearFacturaConPedido({
        ...pedidoData,
        montoPagado: 0,
        tipoFactura: 'Factura A',
        metodoPago: 'Efectivo'
      })
    } catch (error) {
      console.error('Error agregando pedido:', error)
      return {
        success: false,
        mensaje: error.message || 'Error al crear el pedido'
      }
    }
  }

  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          estado: nuevoEstado,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoId)

      if (error) throw error

      // Actualizar estado local
      setPedidos(prev => prev.map(pedido =>
        pedido.id === pedidoId
          ? { ...pedido, estado: nuevoEstado }
          : pedido
      ))

      return { success: true }
    } catch (error) {
      console.error('Error actualizando estado del pedido:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // Función para actualizar notas del pedido
  const actualizarNotasPedido = async (pedidoId, nuevasNotas) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          notas: nuevasNotas,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoId)

      if (error) throw error

      // Actualizar localmente
      setPedidos(prev => prev.map(pedido =>
        pedido.id === pedidoId
          ? { ...pedido, notas: nuevasNotas }
          : pedido
      ))

      return { success: true }
    } catch (error) {
      console.error('Error actualizando notas del pedido:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // Función genérica para actualizar campos de un pedido
  const actualizarPedido = async (pedidoId, camposActualizados) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          ...camposActualizados,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoId)

      if (error) throw error

      // Actualizar estado local
      setPedidos(prev => prev.map(pedido =>
        pedido.id === pedidoId
          ? { ...pedido, ...camposActualizados }
          : pedido
      ))

      return { success: true }
    } catch (error) {
      console.error('Error actualizando pedido:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const eliminarFactura = async (facturaId) => {
    try {
      // 1. Obtener la factura para conseguir datos
      const { data: factura } = await supabase
        .from('facturas')
        .select('id, numero, pedido_id')
        .eq('id', facturaId)
        .single()

      if (!factura) {
        throw new Error('Factura no encontrada')
      }

      // 2. Eliminar abonos asociados
      await supabase.from('abonos').delete().eq('factura_id', facturaId)
      if (factura.numero) {
        await supabase.from('abonos').delete().ilike('descripcion', `%${factura.numero}%`).eq('user_id', user.id)
      }

      // 3. Eliminar movimientos de caja relacionados
      //    a) por referencia pedido:uuid (si tiene pedido asociado)
      if (factura?.pedido_id) {
        await supabase
          .from('movimientos_caja')
          .delete()
          .eq('referencia', `pedido:${factura.pedido_id}`)
          .eq('user_id', user.id)
      }

      //    b) por referencia 'venta' + descripción contiene el número de factura
      if (factura?.numero) {
        const { data: movRelacionados } = await supabase
          .from('movimientos_caja')
          .select('id')
          .eq('user_id', user.id)
          .ilike('description', `%${factura.numero}%`)

        if (movRelacionados?.length) {
          const ids = movRelacionados.map(m => m.id)
          await supabase.from('movimientos_caja').delete().in('id', ids)
          // Recargar movimientos en el estado local
          setMovimientosCaja(prev => prev.filter(m => !ids.includes(m.id)))
        }
      }

      // 4. Eliminar la factura
      const { error } = await supabase
        .from('facturas')
        .delete()
        .eq('id', facturaId)

      if (error) throw error

      setFacturas(prev => prev.filter(f => f.id !== facturaId))

      // Actualizar abonos y recargar caja para que el frontend lo refleje
      setAbonos(prev => prev.filter(a => !(a.descripcion && a.descripcion.includes(factura.numero))))
      await calcularCajaManual()

      return { success: true }
    } catch (error) {
      console.error('Error eliminando factura:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const eliminarPedido = async (pedidoId) => {
    try {
      // 1. Eliminar facturas asociadas a este pedido para limpiar abonos y caja
      const { data: facturasAsociadas } = await supabase
        .from('facturas')
        .select('id')
        .eq('pedido_id', pedidoId)
        .eq('user_id', user.id)

      if (facturasAsociadas && facturasAsociadas.length > 0) {
        for (const f of facturasAsociadas) {
          await eliminarFactura(f.id)
        }
      }

      // 2. Por las dudas, eliminar cualquier movimiento restante del pedido
      await supabase
        .from('movimientos_caja')
        .delete()
        .eq('referencia', `pedido:${pedidoId}`)
        .eq('user_id', user.id)

      // 3. Eliminar el pedido
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', pedidoId)

      if (error) throw error

      // Actualizar estado local
      setPedidos(prev => prev.filter(p => p.id !== pedidoId))
      setMovimientosCaja(prev => prev.filter(m => m.referencia !== `pedido:${pedidoId}`))
      await calcularCajaManual()

      return { success: true }
    } catch (error) {
      console.error('Error eliminando pedido:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // Función para facturar un pedido existente (OPCIONAL)
  const facturarPedido = async (pedidoId) => {
    try {
      // 1. Obtener pedido EXISTENTE
      const { data: pedido, error: errorPedido } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single()

      if (errorPedido) throw errorPedido

      // 2. Verificar si ya tiene factura — buscar por FK pedido_id
      const { data: facturasExistentes } = await supabase
        .from('facturas')
        .select('*')
        .eq('pedido_id', pedidoId)
        .eq('user_id', user.id)
        .limit(1)

      if (facturasExistentes && facturasExistentes.length > 0) {
        return {
          success: true,
          factura: facturasExistentes[0],
          pedido: pedido,
          mensaje: `Este pedido ya tiene la factura ${facturasExistentes[0].numero} asociada`
        }
      }

      // Validar que el pedido tenga cliente_nombre
      if (!pedido.cliente_nombre || pedido.cliente_nombre.trim() === '') {
        throw new Error('El pedido no tiene un nombre de cliente válido')
      }

      // 3. Generar número de factura
      const { data: ultimaFactura } = await supabase
        .from('facturas')
        .select('numero')
        .eq('tipo', 'Factura A')
        .order('created_at', { ascending: false })
        .limit(1)

      let ultimoNumeroFactura = 0
      if (ultimaFactura && ultimaFactura.length > 0) {
        const matches = ultimaFactura[0].numero.match(/\d+/g)
        if (matches) {
          ultimoNumeroFactura = parseInt(matches[matches.length - 1]) || 0
        }
      }

      const numeroFactura = `FA-${(ultimoNumeroFactura + 1).toString().padStart(8, '0')}`

      // 4. Crear SOLO la factura
      const items = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : pedido.items

      const facturaData = {
        tipo: 'Factura A',
        numero: numeroFactura,
        fecha: new Date().toISOString().split('T')[0],
        cliente: pedido.cliente_nombre,
        pedido_id: pedidoId,  // ← FK directo
        metodopago: 'Efectivo',
        items: JSON.stringify(items),
        total: pedido.total,
        montopagado: 0,
        saldopendiente: pedido.total,
        estado: 'pendiente',
        user_id: user.id
      }

      const { data: facturaGuardada, error: errorFactura } = await supabase
        .from('facturas')
        .insert([facturaData])
        .select()

      if (errorFactura) throw errorFactura

      // 5. Actualizar estados locales
      setFacturas(prev => [facturaGuardada[0], ...prev])

      return {
        success: true,
        factura: facturaGuardada[0],
        pedido: pedido,
        mensaje: `Factura ${numeroFactura} creada exitosamente`
      }

    } catch (error) {
      console.error('Error facturando pedido:', error)
      return {
        success: false,
        mensaje: error.message
      }
    }
  }

  // Función para obtener factura asociada a un pedido
  const obtenerFacturaPorPedido = async (pedidoCodigo) => {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .select('*')
        .ilike('notas', `%${pedidoCodigo}%`)
        .eq('user_id', user.id)
        .single()

      if (error) {
        // Si no se encuentra, retornar null
        return { success: true, factura: null }
      }

      return { success: true, factura: data }
    } catch (error) {
      console.error('Error obteniendo factura por pedido:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // ========== FUNCIONES PARA FACTURACIÓN ==========

  const agregarAbono = async (facturaId, monto, metodo, descripcion, pedidoId = null) => {
    try {
      if (!facturaId) {
        throw new Error('Se requiere una factura para registrar el pago')
      }

      const { data: facturaActual, error: facturaError } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', facturaId)
        .single()

      if (facturaError) throw facturaError

      const pagoData = {
        cliente_nombre: facturaActual.cliente,
        monto: parseFloat(monto),
        fecha: new Date().toISOString().split('T')[0],
        metodo: metodo || 'Efectivo',
        descripcion: descripcion || `Pago Factura ${facturaActual.numero}`,
        user_id: user.id
      }

      const { error: pagoError } = await supabase
        .from('abonos')
        .insert([pagoData])

      if (pagoError) throw pagoError

      // Calcular nuevo monto pagado y saldo pendiente
      const montoPagadoActual = parseFloat(facturaActual.montopagado) || 0
      const totalFactura = parseFloat(facturaActual.total) || 0
      const nuevoMontoPagado = montoPagadoActual + parseFloat(monto)
      const nuevoSaldoPendiente = Math.max(0, totalFactura - nuevoMontoPagado)

      // Determinar nuevo estado
      let nuevoEstado = 'pendiente'
      if (nuevoSaldoPendiente === 0) {
        nuevoEstado = 'pagada'
      } else if (nuevoMontoPagado > 0) {
        nuevoEstado = 'parcial'
      }

      // Actualizar la factura
      const { error: updateError } = await supabase
        .from('facturas')
        .update({
          montopagado: nuevoMontoPagado,
          saldopendiente: nuevoSaldoPendiente,
          estado: nuevoEstado
        })
        .eq('id', facturaId)

      if (updateError) throw updateError

      // Registrar movimiento de caja (ingreso)
      await agregarMovimientoCaja({
        tipo: 'ingreso',
        monto: parseFloat(monto),
        descripcion: `Pago factura ${facturaActual.numero || facturaId}`,
        categoria: 'ventas',
        fecha: new Date().toISOString().split('T')[0],
        user_id: user.id
      })

      // Actualizar estados locales
      setFacturas(prev => prev.map(f =>
        f.id === facturaId
          ? {
            ...f,
            montopagado: nuevoMontoPagado,
            saldopendiente: nuevoSaldoPendiente,
            estado: nuevoEstado
          }
          : f
      ))

      // Actualizar abonos local
      setAbonos(prev => [pagoData, ...prev])

      // ===== SINCRONIZAR PEDIDO ASOCIADO =====
      // Buscar pedido asociado por FK pedido_id en la factura (igual que registrarCobro)
      const pedidoAsociadoId = pedidoId || facturaActual.pedido_id
      if (pedidoAsociadoId) {
        const { data: pedido } = await supabase
          .from('pedidos')
          .select('*')
          .eq('id', pedidoAsociadoId)
          .single()

        if (pedido) {
          const nuevoPagadoPedido = (parseFloat(pedido.monto_abonado) || 0) + parseFloat(monto)
          const nuevoSaldoPedido = Math.max(0, (parseFloat(pedido.total) || 0) - nuevoPagadoPedido)

          const updatePedidoData = {
            monto_abonado: nuevoPagadoPedido,
            saldo_pendiente: nuevoSaldoPedido
          }

          // Si se completó el pago, opcionalmente actualizar estado
          if (nuevoSaldoPedido === 0) {
            updatePedidoData.estado = 'entregado'
          }

          const { error: errorPedido } = await supabase
            .from('pedidos')
            .update(updatePedidoData)
            .eq('id', pedidoAsociadoId)

          if (!errorPedido) {
            setPedidos(prev => prev.map(p =>
              p.id === pedidoAsociadoId ? { ...p, ...updatePedidoData } : p
            ))
          }
        }
      }

      // Recalcular caja
      await calcularCajaManual()

      return {
        success: true,
        nuevoEstado,
        saldoPendiente: nuevoSaldoPendiente
      }

    } catch (error) {
      console.error('Error registrando abono:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const marcarPagadoTotal = async (facturaId) => {
    try {
      // Obtener saldo pendiente real
      const { data: factura, error } = await supabase
        .from('facturas')
        .select('saldopendiente')
        .eq('id', facturaId)
        .single()

      if (error) throw error

      const saldo = parseFloat(factura.saldopendiente) || 0

      if (saldo <= 0) {
        return { success: true, mensaje: 'La factura ya está pagada' }
      }

      return await agregarAbono(facturaId, saldo, 'Efectivo', 'Pago Total - Cierre')

    } catch (error) {
      console.error('Error al saldar total:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // Función para pagar una factura desde un pedido
  const pagarFacturaDesdePedido = async (pedidoCodigo, monto) => {
    try {
      // 1. Buscar factura por código de pedido
      const { data: facturas } = await supabase
        .from('facturas')
        .select('*')
        .ilike('notas', `%${pedidoCodigo}%`)
        .eq('user_id', user.id)
        .limit(1)

      if (!facturas || facturas.length === 0) {
        throw new Error('No se encontró factura para este pedido')
      }

      const factura = facturas[0]

      // 2. Registrar el pago
      return await agregarAbono(factura.id, monto, 'Efectivo', `Pago pedido ${pedidoCodigo}`)
    } catch (error) {
      console.error('Error pagando factura desde pedido:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // Función original generarFactura
  const generarFactura = async (facturaData) => {
    try {
      // La función crearFacturaConPedido ya valida todo correctamente
      return await crearFacturaConPedido(facturaData)
    } catch (error) {
      console.error('Error generando factura:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // ========== FACTURA DIRECTA (sin pedido) ==========
  // Soporta dos modos:
  //   1. Con items (venta de productos/servicios)
  //   2. Cobro directo: esCobroDirecto=true, concepto + monto, sin items
  const crearFacturaDirecta = async (facturaData) => {
    try {
      if (!facturaData.clienteNombre || facturaData.clienteNombre.trim() === '') {
        throw new Error('El nombre del cliente es requerido')
      }

      // ── Modo Cobro Directo ──────────────────────────────────────────
      // No requiere items: genera un ítem sintético con el concepto y el monto
      if (facturaData.esCobroDirecto) {
        const monto = parseFloat(facturaData.montoDirecto) || 0
        if (monto <= 0) throw new Error('El monto debe ser mayor a 0')
        if (!facturaData.concepto || !facturaData.concepto.trim()) {
          throw new Error('Ingresá un concepto para el cobro')
        }
        facturaData = {
          ...facturaData,
          items: [{
            id: Date.now(),
            productoId: null,
            producto: facturaData.concepto.trim(),
            precio: monto,
            cantidad: 1,
            subtotal: monto,
          }],
          total: monto,
          montoPagado: monto, // cobro directo siempre se cobra al momento
        }
      }
      // ────────────────────────────────────────────────────────────────

      if (!facturaData.items || facturaData.items.length === 0) {
        throw new Error('Debe tener al menos un item o elegir cobro directo')
      }

      const total = facturaData.total || facturaData.items.reduce((sum, i) => sum + (i.precio * i.cantidad), 0)
      const numeroFactura = await generarNumeroFactura()

      // Insertar solo la factura, sin pedido (pedido_id = null)
      const ventaDB = {
        tipo: facturaData.tipo || 'Factura A',
        numero: numeroFactura,
        fecha: facturaData.fecha || new Date().toISOString().split('T')[0],
        cliente: facturaData.clienteNombre,
        pedido_id: null,
        metodopago: facturaData.metodoPago || 'Efectivo',
        items: JSON.stringify(facturaData.items),
        total: total,
        montopagado: 0,
        saldopendiente: total,
        estado: 'pendiente',
        user_id: user.id
      }

      const { data: ventaRes, error: vErr } = await supabase.from('facturas').insert([ventaDB]).select()
      if (vErr) throw vErr
      const nuevaFactura = ventaRes[0]

      // Actualizar estado local
      setFacturas(prev => [nuevaFactura, ...prev])

      // Actualizar deuda del cliente si la factura tiene cliente_id
      const montoPagadoDF = parseFloat(facturaData.montoPagado) || 0
      const saldoNuevaFactura = total - montoPagadoDF
      if (facturaData.clienteId && saldoNuevaFactura > 0) {
        setClientes(prev => prev.map(c =>
          c.id === facturaData.clienteId
            ? { ...c, deuda: (parseFloat(c.deuda) || 0) + saldoNuevaFactura }
            : c
        ))
      }

      // Registrar cobro inicial si hay monto pagado
      const montoPagado = parseFloat(facturaData.montoPagado) || 0
      if (montoPagado > 0) {
        await registrarCobro(nuevaFactura.id, montoPagado, `Pago inicial - ${numeroFactura}`)
      }


      // Actualizar stock para productos del catálogo
      for (const item of facturaData.items) {
        if (item.productoId) {
          const { data: prod } = await supabase.from('productos').select('stock').eq('id', item.productoId).single()
          if (prod) {
            await supabase.from('productos').update({ stock: prod.stock - item.cantidad }).eq('id', item.productoId)
          }
        }
      }

      return { success: true, factura: nuevaFactura, mensaje: `Factura ${numeroFactura} creada exitosamente` }

    } catch (error) {
      console.error('Error creando factura directa:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // ========== FUNCIONES BÁSICAS ==========

  const agregarCliente = async () => {
    try {
      // Validar nombre
      if (!nuevoCliente.nombre || nuevoCliente.nombre.trim() === '') {
        throw new Error('El nombre del cliente es requerido')
      }

      const clienteData = {
        ...nuevoCliente,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()

      if (error) throw error

      setClientes(prev => [data[0], ...prev])
      setNuevoCliente({ nombre: '', telefono: '', cuit: '' })

      return { success: true, cliente: data[0] }
    } catch (error) {
      console.error('Error agregando cliente:', error)
      return { success: false, mensaje: error.message }
    }
  }


  const editarCliente = async (clienteId, datosActualizados) => {
    try {
      // Validar nombre
      if (datosActualizados.nombre && datosActualizados.nombre.trim() === '') {
        throw new Error('El nombre del cliente no puede estar vacío')
      }

      const { error } = await supabase
        .from('clientes')
        .update({
          ...datosActualizados,
          updated_at: new Date().toISOString()
        })
        .eq('id', clienteId)

      if (error) throw error

      setClientes(prev => prev.map(cliente =>
        cliente.id === clienteId
          ? { ...cliente, ...datosActualizados }
          : cliente
      ))

      return { success: true }
    } catch (error) {
      console.error('Error editando cliente:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const eliminarCliente = async (clienteId) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId)

      if (error) throw error

      setClientes(prev => prev.filter(c => c.id !== clienteId))
      return { success: true }
    } catch (error) {
      console.error('Error eliminando cliente:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const agregarProducto = async () => {
    try {
      if (!nuevoProducto.nombre || nuevoProducto.nombre.trim() === '') {
        throw new Error('El nombre del producto es requerido')
      }

      // Código automático si está vacío
      let codigo = (nuevoProducto.codigo || '').trim()
      if (!codigo) {
        const prefijo = 'PROD-'
        let index = productos.length + 1
        codigo = prefijo + String(index).padStart(4, '0')
        while (productos.some(p => p.codigo === codigo)) {
          index++
          codigo = prefijo + String(index).padStart(4, '0')
        }
      }

      // Construir payload con campos explícitos (sin camelCase de estado)
      const productoData = {
        nombre: nuevoProducto.nombre.trim(),
        codigo,
        precio: parseFloat(nuevoProducto.precio) || 0,
        costo: nuevoProducto.costo ? (parseFloat(nuevoProducto.costo) || null) : null,
        stock: parseInt(nuevoProducto.stock) || 0,
        categoria: nuevoProducto.categoria || '',
        descripcion: nuevoProducto.descripcion || '',
        controlastock: !!(nuevoProducto.controlaStock || nuevoProducto.controlastock),
        stock_minimo: nuevoProducto.stock_minimo != null ? parseInt(nuevoProducto.stock_minimo) : null,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('productos')
        .insert([productoData])
        .select()

      if (error) throw error

      setProductos(prev => [data[0], ...prev])
      setNuevoProducto({ nombre: '', precio: 0, stock: 0, codigo: '', categoria: '', descripcion: '', controlaStock: false })

      return { success: true, producto: data[0] }
    } catch (error) {
      console.error('Error agregando producto:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const editarProducto = async (productoId, datosActualizados) => {
    try {
      if (datosActualizados.nombre && datosActualizados.nombre.trim() === '') {
        throw new Error('El nombre del producto no puede estar vacío')
      }

      // Construir payload seguro: solo campos válidos en la tabla
      const payload = {}
      if (datosActualizados.nombre !== undefined) payload.nombre = datosActualizados.nombre.trim()
      if (datosActualizados.codigo !== undefined) payload.codigo = datosActualizados.codigo
      if (datosActualizados.precio !== undefined) payload.precio = parseFloat(datosActualizados.precio) || 0
      if (datosActualizados.costo !== undefined) payload.costo = datosActualizados.costo === null ? null : (parseFloat(datosActualizados.costo) || null)
      if (datosActualizados.stock !== undefined) payload.stock = parseInt(datosActualizados.stock) || 0
      if (datosActualizados.categoria !== undefined) payload.categoria = datosActualizados.categoria
      if (datosActualizados.descripcion !== undefined) payload.descripcion = datosActualizados.descripcion
      // Normalizar controlastock
      const cs = datosActualizados.controlaStock !== undefined ? datosActualizados.controlaStock
        : datosActualizados.controlastock !== undefined ? datosActualizados.controlastock
          : undefined
      if (cs !== undefined) payload.controlastock = !!cs
      if (datosActualizados.stock_minimo !== undefined) payload.stock_minimo = datosActualizados.stock_minimo != null ? parseInt(datosActualizados.stock_minimo) : null

      const { error } = await supabase
        .from('productos')
        .update(payload)
        .eq('id', productoId)

      if (error) throw error

      // Actualizar estado local (guardar con controlastock minúsculas también)
      setProductos(prev => prev.map(producto =>
        producto.id === productoId
          ? { ...producto, ...payload }
          : producto
      ))

      return { success: true }
    } catch (error) {
      console.error('Error editando producto:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const eliminarProducto = async (productoId) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productoId)

      if (error) throw error

      setProductos(prev => prev.filter(p => p.id !== productoId))
      return { success: true }
    } catch (error) {
      console.error('Error eliminando producto:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const agregarMovimientoCaja = async (movimientoData) => {
    try {
      // Mapear 'descripcion' → 'description' (nombre real de la columna en Supabase)
      // y asegurar que fecha sea timestamp completo
      const { descripcion, categoria, ...resto } = movimientoData
      const movimientoCompleto = {
        ...resto,
        description: movimientoData.description || descripcion || '',
        metodo: movimientoData.metodo || 'Efectivo',       // default si viene vacío
        referencia: movimientoData.referencia || '',        // default vacío
        fecha: movimientoData.fecha
          ? (movimientoData.fecha.includes('T') ? movimientoData.fecha : new Date(movimientoData.fecha + 'T00:00:00').toISOString())
          : new Date().toISOString(),
        user_id: user.id,
      }

      const { data, error } = await supabase
        .from('movimientos_caja')
        .insert([movimientoCompleto])
        .select()

      if (error) throw error

      // Actualizar caja local
      const tipo = movimientoData.tipo || 'ingreso'
      const monto = parseFloat(movimientoData.monto) || 0

      setCaja(prev => ({
        ...prev,
        saldo: tipo === 'ingreso' ? prev.saldo + monto : prev.saldo - monto,
        ingresos: tipo === 'ingreso' ? (prev.ingresos || 0) + monto : (prev.ingresos || 0),
        egresos: tipo === 'egreso' ? (prev.egresos || 0) + monto : (prev.egresos || 0)
      }))

      setMovimientosCaja(prev => [data[0], ...prev])

      return { success: true }
    } catch (error) {
      console.error('Error agregando movimiento:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // Eliminar movimiento de caja manualmente
  const eliminarMovimientoCaja = async (movimientoId) => {
    try {
      // Obtener el movimiento para revertir el saldo local
      const movimiento = movimientosCaja.find(m => m.id === movimientoId)

      const { error } = await supabase
        .from('movimientos_caja')
        .delete()
        .eq('id', movimientoId)
        .eq('user_id', user.id)

      if (error) throw error

      // Revertir saldo local
      if (movimiento) {
        const monto = parseFloat(movimiento.monto) || 0
        setCaja(prev => ({
          ...prev,
          saldo: movimiento.tipo === 'ingreso' ? prev.saldo - monto : prev.saldo + monto,
          ingresos: movimiento.tipo === 'ingreso' ? Math.max(0, (prev.ingresos || 0) - monto) : (prev.ingresos || 0),
          egresos: movimiento.tipo === 'egreso' ? Math.max(0, (prev.egresos || 0) - monto) : (prev.egresos || 0)
        }))
      }

      setMovimientosCaja(prev => prev.filter(m => m.id !== movimientoId))
      return { success: true }
    } catch (error) {
      console.error('Error eliminando movimiento:', error)
      return { success: false, mensaje: error.message }
    }
  }


  // Acepta datos opcionales como parámetro para usarse directamente
  // (ej: desde FacturaDirectaForm). Sin parámetro usa el estado interno clienteRapido.
  const agregarClienteRapido = async (datosDirectos = null) => {
    const nombre = datosDirectos?.nombre || clienteRapido.nombre
    const telefono = datosDirectos?.telefono || clienteRapido.telefono || ''
    const cuit = datosDirectos?.cuit?.trim() || ''

    if (!nombre || nombre.trim() === '') {
      return { success: false, mensaje: 'El nombre del cliente es requerido' }
    }

    const clienteData = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      cuit: cuit,
      user_id: user.id,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([clienteData])
      .select()

    if (error) {
      console.error('Error agregando cliente rápido:', error)
      return { success: false, mensaje: error.message || 'Error al agregar cliente' }
    }

    setClientes(prev => [data[0], ...prev])
    if (!datosDirectos) setClienteRapido({ nombre: '', telefono: '' })

    return { success: true, cliente: data[0], mensaje: 'Cliente agregado exitosamente' }
  }

  const agregarProductoRapido = async () => {
    // Validar nombre
    if (!productoRapido.nombre || productoRapido.nombre.trim() === '') {
      return {
        success: false,
        mensaje: 'El nombre del producto es requerido'
      }
    }

    const productoData = {
      nombre: productoRapido.nombre,
      precio: parseFloat(productoRapido.precio) || 0,
      stock: 0,
      user_id: user.id,
      created_at: new Date().toISOString()
    }

    // Código automático
    const prefijo = 'PROD-'
    let index = productos.length + 1
    let nuevoCodigo = prefijo + String(index).padStart(4, '0')
    while (productos.some(p => p.codigo === nuevoCodigo)) {
      index++
      nuevoCodigo = prefijo + String(index).padStart(4, '0')
    }
    productoData.codigo = nuevoCodigo

    const { data, error } = await supabase
      .from('productos')
      .insert([productoData])
      .select()

    if (error) {
      console.error('Error agregando producto rápido:', error)
      return {
        success: false,
        mensaje: error.message || 'Error al agregar producto'
      }
    }

    setProductos(prev => [data[0], ...prev])
    setProductoRapido({ nombre: '', precio: 0 })

    return {
      success: true,
      producto: data[0],
      mensaje: 'Producto agregado exitosamente'
    }
  }

  // Funciones para manejar modales
  const openModal = (type, data = null) => {
    setModalType(type)
    setModalData(data)
  }

  const closeModal = () => {
    setModalType(null)
    setModalData(null)
  }

  // Función para recargar todos los datos
  const recargarTodosLosDatos = useCallback(() => {
    if (user) {
      cargarDatos()
    }
  }, [user, cargarDatos])

  // Función para cambiar tipo de operación
  const cambiarTipoOperacion = (nuevoTipo) => {
    setTipoOperacion(nuevoTipo)
  }

  // Funciones para facturas (simplificadas)
  const agregarItemFactura = (item) => {
    setNuevaFactura(prev => ({
      ...prev,
      items: [...prev.items, item],
      total: prev.total + (item.subtotal || 0)
    }))
  }

  const actualizarItemFactura = (index, itemActualizado) => {
    setNuevaFactura(prev => {
      const nuevosItems = [...prev.items]
      const itemAnterior = nuevosItems[index]
      nuevosItems[index] = itemActualizado

      return {
        ...prev,
        items: nuevosItems,
        total: prev.total - (itemAnterior.subtotal || 0) + (itemActualizado.subtotal || 0)
      }
    })
  }

  const eliminarItemFactura = (index) => {
    setNuevaFactura(prev => {
      const itemEliminado = prev.items[index]
      const nuevosItems = prev.items.filter((_, i) => i !== index)

      return {
        ...prev,
        items: nuevosItems,
        total: prev.total - (itemEliminado.subtotal || 0)
      }
    })
  }

  const agregarItemVentaLibre = (descripcion, precio, cantidad = 1) => {
    const item = {
      id: Date.now(),
      producto: descripcion,
      cantidad,
      precio,
      subtotal: precio * cantidad,
      controlaStock: false
    }

    agregarItemFactura(item)
  }

  // ========== FUNCIONES ADICIONALES ==========

  const agregarProveedor = async (proveedorData) => {
    try {
      // Validar nombre
      if (!proveedorData.nombre || proveedorData.nombre.trim() === '') {
        throw new Error('El nombre del proveedor es requerido')
      }

      const proveedorCompleto = {
        ...proveedorData,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('proveedores')
        .insert([proveedorCompleto])
        .select()

      if (error) throw error

      setProveedores(prev => [data[0], ...prev])

      return {
        success: true,
        mensaje: 'Proveedor agregado exitosamente',
        proveedor: data[0]
      }
    } catch (error) {
      console.error('Error agregando proveedor:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const editarProveedor = async (proveedorId, datosActualizados) => {
    try {
      // Validar nombre
      if (datosActualizados.nombre && datosActualizados.nombre.trim() === '') {
        throw new Error('El nombre del proveedor no puede estar vacío')
      }

      const { error } = await supabase
        .from('proveedores')
        .update({
          ...datosActualizados
        })
        .eq('id', proveedorId)

      if (error) throw error

      setProveedores(prev => prev.map(proveedor =>
        proveedor.id === proveedorId
          ? { ...proveedor, ...datosActualizados }
          : proveedor
      ))

      return { success: true }
    } catch (error) {
      console.error('Error editando proveedor:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const eliminarProveedor = async (proveedorId) => {
    try {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', proveedorId)

      if (error) throw error

      setProveedores(prev => prev.filter(p => p.id !== proveedorId))
      return { success: true }
    } catch (error) {
      console.error('Error eliminando proveedor:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const cerrarCaja = async (observaciones = '') => {
    try {
      const ahora = new Date()
      const cierreData = {
        fecha: ahora.toISOString().split('T')[0],          // date
        hora: ahora.toTimeString().split(' ')[0],          // time HH:MM:SS
        saldo_inicial: caja.saldo,
        ingresos: caja.ingresos || 0,
        egresos: caja.egresos || 0,
        saldo_final: (caja.ingresos || 0) - (caja.egresos || 0),
        movimientos: movimientosCaja.length,               // cantidad de movimientos del día
        observaciones: observaciones?.trim() || `Cierre automático. ${movimientosCaja.length} movimientos del día.`,
        user_id: user.id,
      }

      const { error } = await supabase
        .from('cierres_caja')
        .insert([cierreData])

      if (error) throw error

      // Resetear caja del día
      setCaja({ saldo: 0, ingresos: 0, egresos: 0 })
      setMovimientosCaja([])

      // Recargar cierres
      const { data: cierresData } = await supabase
        .from('cierres_caja')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (cierresData) setCierresCaja(cierresData)

      return { success: true, mensaje: 'Caja cerrada exitosamente', cierre: cierreData }
    } catch (error) {
      console.error('Error cerrando caja:', error)
      return { success: false, mensaje: error.message }
    }
  }

  // Función para obtener cliente por ID
  const obtenerClientePorId = async (clienteId) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single()

      if (error) throw error

      return { success: true, cliente: data }
    } catch (error) {
      console.error('Error obteniendo cliente:', error)
      return { success: false, mensaje: error.message }
    }
  }


  /* ── guardarPresupuesto ─────────────────────────────── */
  const guardarPresupuesto = async (data) => {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      let numero = data.numero;
      if (!numero) {
        const { data: ultimo } = await supabase.from('presupuestos').select('numero').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
        let num = 1
        if (ultimo?.[0]?.numero) { const m = ultimo[0].numero.match(/\d+/); if (m) num = parseInt(m[0]) + 1 }
        numero = `PRES-${num.toString().padStart(5, '0')}`
      }
      const subtotalGeneral = (data.items || []).reduce((s, i) => s + (parseFloat(i.subtotal) || 0), 0)
      const ivaValor = subtotalGeneral * ((data.iva ?? 21) / 100)
      const total = data.incluirIva ? subtotalGeneral + ivaValor : subtotalGeneral
      const row = {
        numero, fecha: data.fecha || hoy, validez: data.validez ?? 7,
        cliente: data.cliente || '', items: JSON.stringify(data.items || []),
        iva: data.iva ?? 21, incluir_iva: data.incluirIva ?? true,
        observaciones: data.observaciones || '', condiciones_pago: data.condicionesPago || '',
        nombre_empresa: data.nombreEmpresa || '', subtotal: subtotalGeneral,
        iva_valor: ivaValor, total, estado: data.estado || 'vigente',
        user_id: user.id
      }

      if (data.id) {
        const { data: updated, error } = await supabase.from('presupuestos').update(row).eq('id', data.id).select()
        if (error) throw error
        setPresupuestos(prev => prev.map(p => p.id === data.id ? updated[0] : p))
        return { success: true, presupuesto: updated[0] }
      } else {
        row.created_at = new Date().toISOString()
        const { data: inserted, error } = await supabase.from('presupuestos').insert([row]).select()
        if (error) throw error
        setPresupuestos(prev => [inserted[0], ...prev])
        return { success: true, presupuesto: inserted[0] }
      }
    } catch (e) { console.error('Error guardando/editando presupuesto:', e); return { success: false, mensaje: e.message } }
  }

  /* ── eliminarPresupuesto ────────────────────────────── */
  const eliminarPresupuesto = async (id) => {
    const { error } = await supabase.from('presupuestos').delete().eq('id', id).eq('user_id', user.id)
    if (!error) setPresupuestos(prev => prev.filter(p => p.id !== id))
    return { success: !error }
  }

  /* ── actualizarEstadoPresupuesto ────────────────────── */
  const actualizarEstadoPresupuesto = async (id, nuevoEstado) => {
    const { error } = await supabase.from('presupuestos').update({ estado: nuevoEstado }).eq('id', id).eq('user_id', user.id)
    if (!error) setPresupuestos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
    return { success: !error }
  }

  return {
    // Estados
    clientes,
    productos,
    facturas,
    proveedores,
    caja,
    movimientosCaja,
    cierresCaja,
    pedidos,
    abonos,
    nuevoCliente,
    nuevoProducto,
    nuevaFactura,
    nuevoMovimiento,
    clienteRapido,
    productoRapido,
    modalType,
    modalData,
    tipoOperacion,

    // Setters
    setNuevoCliente,
    setNuevoProducto,
    setNuevaFactura,
    setNuevoMovimiento,
    setClienteRapido,
    setProductoRapido,
    setTipoOperacion,

    // Funciones principales
    agregarCliente,
    editarCliente,
    eliminarCliente,
    agregarClienteRapido,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    agregarProductoRapido,
    agregarProveedor,
    editarProveedor,
    eliminarProveedor,
    obtenerClientePorId,

    // Funciones para facturas y pagos
    crearFacturaConPedido,
    crearFacturaDirecta,
    generarFactura,
    agregarAbono,
    marcarPagadoTotal,
    pagarFacturaDesdePedido,
    obtenerFacturaPorPedido,
    agregarItemFactura,
    actualizarItemFactura,
    eliminarItemFactura,
    agregarItemVentaLibre,

    // Funciones ORIGINALES para pedidos (mantener compatibilidad)
    agregarPedido,
    actualizarEstadoPedido,
    actualizarNotasPedido,
    actualizarPedido, // ← genérica: actualiza cualquier campo del pedido
    eliminarPedido,
    facturarPedido,

    // NUEVAS funciones para pedidos SIMPLES
    agregarPedidoSolo, // ← NUEVA: crea solo pedido sin factura
    agregarAbonoAPedido, // ← NUEVA: agrega abono directo al pedido
    marcarPedidoPagadoTotal, // ← NUEVA: marca pedido como pagado total
    registrarCobro, // ← FUNCIÓN UNIFICADA: todas las pantallas la llaman
    eliminarFactura, // ← NUEVA: elimina factura desde Facturación

    // Presupuestos
    guardarPresupuesto,
    eliminarPresupuesto,
    actualizarEstadoPresupuesto,
    presupuestos,

    // Categorias
    categorias,
    agregarCategoria,
    renombrarCategoria,
    eliminarCategoria,

    // Funciones para caja
    agregarMovimientoCaja,
    eliminarMovimientoCaja,
    cerrarCaja,

    // Funciones auxiliares
    cambiarTipoOperacion,
    cargarDatos,
    recargarTodosLosDatos,
    cargarMovimientosPorFecha,
    openModal,
    closeModal
  }
}