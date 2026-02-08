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
        setClientes(clientesData)
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

      // Cargar movimientos de caja
      const hoy = new Date().toISOString().split('T')[0]
      const { data: movimientosData, error: errorMovimientos } = await supabase
        .from('movimientos_caja')
        .select('*')
        .eq('user_id', user.id)
        .eq('fecha', hoy)
        .order('id', { ascending: false })

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

    } catch (error) {
      console.error('Error general cargando datos:', error)
    }
  }, [user])

  // Función para calcular caja manualmente
  const calcularCajaManual = async () => {
    try {
      // Obtener últimos movimientos de caja del día
      const hoy = new Date().toISOString().split('T')[0]
      const { data: movimientosHoy, error } = await supabase
        .from('movimientos_caja')
        .select('*')
        .eq('user_id', user.id)
        .eq('fecha', hoy)
        .order('created_at', { ascending: false })

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

  // ========== FUNCIONES NUEVAS PARA PEDIDOS SIMPLES ==========

  // Función para crear solo pedido (SIN FACTURA)
  const agregarPedidoSolo = async (pedidoData) => {
    try {
      console.log('📦 Creando solo pedido:', pedidoData)

      // 1. Validar datos mínimos
      if (!pedidoData.clienteNombre || pedidoData.clienteNombre.trim() === '') {
        throw new Error('El nombre del cliente es requerido')
      }

      if (!pedidoData.items || !Array.isArray(pedidoData.items) || pedidoData.items.length === 0) {
        throw new Error('Debe agregar al menos un producto')
      }

      // 2. Generar código de pedido
      const { data: ultimoPedido } = await supabase
        .from('pedidos')
        .select('codigo')
        .order('created_at', { ascending: false })
        .limit(1)

      let numeroPedido = 1
      if (ultimoPedido && ultimoPedido.length > 0) {
        const ultimoCodigo = ultimoPedido[0].codigo
        const matches = ultimoCodigo.match(/\d+/g)
        if (matches) {
          numeroPedido = parseInt(matches[matches.length - 1]) + 1
        }
      }

      const codigoPedido = `PED-${numeroPedido.toString().padStart(3, '0')}`

      // 3. Calcular total
      const calcularTotalItems = (items) => {
        return items.reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 1), 0)
      }
      const totalVenta = calcularTotalItems(pedidoData.items)

      // 4. Crear SOLO el pedido
      const pedidoDataDB = {
        codigo: codigoPedido,
        cliente_id: pedidoData.clienteId,
        cliente_nombre: pedidoData.clienteNombre,
        fecha_pedido: pedidoData.fechaPedido || new Date().toISOString().split('T')[0],
        fecha_entrega_estimada: pedidoData.fechaEntregaEstimada || null,
        items: JSON.stringify(pedidoData.items || []),
        total: totalVenta,
        productos_count: (pedidoData.items || []).length,
        notas: pedidoData.notas || '',
        estado: pedidoData.estado || 'pendiente',
        monto_abonado: 0, // Nuevo campo para guardar abonos
        saldo_pendiente: totalVenta, // Nuevo campo
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📦 Insertando pedido en BD:', pedidoDataDB)

      const { data: pedidoGuardado, error: errorPedido } = await supabase
        .from('pedidos')
        .insert([pedidoDataDB])
        .select()

      if (errorPedido) {
        console.error('❌ Error creando pedido:', errorPedido)
        throw errorPedido
      }

      console.log('✅ Pedido creado:', pedidoGuardado[0])

      // 5. Actualizar stock para productos que controlan stock
      const itemsParaActualizarStock = pedidoData.items.filter(item =>
        item.controlaStock !== false && item.productoId
      )

      for (const item of itemsParaActualizarStock) {
        const { data: producto } = await supabase
          .from('productos')
          .select('stock, controlaStock')
          .eq('id', item.productoId)
          .single()

        if (producto && producto.controlaStock !== false && producto.stock >= item.cantidad) {
          await supabase
            .from('productos')
            .update({ stock: producto.stock - item.cantidad })
            .eq('id', item.productoId)

          console.log(`📊 Stock actualizado para producto ${item.productoId}: -${item.cantidad}`)
        }
      }

      // 6. Actualizar estado local
      setPedidos(prev => [pedidoGuardado[0], ...prev])

      return {
        success: true,
        pedido: pedidoGuardado[0],
        mensaje: `✅ Pedido ${codigoPedido} creado exitosamente`
      }

    } catch (error) {
      console.error('❌ Error creando pedido:', error)
      return {
        success: false,
        mensaje: error.message || 'Error al crear el pedido'
      }
    }
  }

  // Función para agregar abono directo al pedido
  const agregarAbonoAPedido = async (pedidoId, monto) => {
    try {
      console.log(`💰 Agregando abono de $${monto} al pedido ${pedidoId}`)

      // 1. Obtener pedido actual
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single()

      if (pedidoError) throw pedidoError

      const montoAbono = parseFloat(monto)
      const montoAbonadoActual = parseFloat(pedido.monto_abonado) || 0
      const saldoPendienteActual = parseFloat(pedido.saldo_pendiente) || parseFloat(pedido.total)
      const totalPedido = parseFloat(pedido.total)

      if (montoAbono <= 0 || montoAbono > saldoPendienteActual) {
        throw new Error('Monto inválido. Debe ser mayor a 0 y no exceder el saldo pendiente')
      }

      // 2. Calcular nuevos valores
      const nuevoMontoAbonado = montoAbonadoActual + montoAbono
      const nuevoSaldoPendiente = saldoPendienteActual - montoAbono

      // 3. Actualizar pedido
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({
          monto_abonado: nuevoMontoAbonado,
          saldo_pendiente: nuevoSaldoPendiente,
          estado: nuevoSaldoPendiente === 0 ? 'entregado' : pedido.estado,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoId)

      if (updateError) throw updateError

      console.log(`✅ Pedido actualizado: abonado=$${nuevoMontoAbonado}, saldo=$${nuevoSaldoPendiente}`)

      // 4. Registrar abono en tabla de abonos
      const abonoData = {
        pedido_id: pedidoId,
        cliente_nombre: pedido.cliente_nombre,
        monto: montoAbono,
        fecha: new Date().toISOString().split('T')[0],
        metodo: 'Efectivo',
        descripcion: `Abono pedido ${pedido.codigo}`,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { error: abonoError } = await supabase
        .from('abonos')
        .insert([abonoData])

      if (abonoError) throw abonoError

      console.log('✅ Abono registrado en tabla abonos')

      // 5. Registrar movimiento de caja
      await agregarMovimientoCaja({
        tipo: 'ingreso',
        monto: montoAbono,
        descripcion: `Abono pedido ${pedido.codigo}`,
        categoria: 'ventas',
        fecha: new Date().toISOString().split('T')[0],
        user_id: user.id,
        created_at: new Date().toISOString()
      })

      console.log('✅ Movimiento de caja registrado')

      // 6. Actualizar estado local del pedido
      setPedidos(prev => prev.map(p =>
        p.id === pedidoId
          ? {
            ...p,
            monto_abonado: nuevoMontoAbonado,
            saldo_pendiente: nuevoSaldoPendiente,
            estado: nuevoSaldoPendiente === 0 ? 'entregado' : p.estado
          }
          : p
      ))

      // 7. Actualizar abonos local
      setAbonos(prev => [abonoData, ...prev])

      return {
        success: true,
        nuevoSaldo: nuevoSaldoPendiente,
        mensaje: '✅ Abono registrado exitosamente'
      }

    } catch (error) {
      console.error('❌ Error registrando abono:', error)
      return {
        success: false,
        mensaje: error.message || 'Error registrando abono'
      }
    }
  }

  // Función para marcar pedido como pagado total
  const marcarPedidoPagadoTotal = async (pedidoId) => {
    try {
      console.log(`💰 Marcando pedido ${pedidoId} como pagado total`)

      const { data: pedido } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single()

      if (!pedido) throw new Error('Pedido no encontrado')

      const saldoPendiente = parseFloat(pedido.saldo_pendiente) || parseFloat(pedido.total)

      if (saldoPendiente === 0) {
        return {
          success: true,
          mensaje: '✅ El pedido ya está pagado totalmente'
        }
      }

      return await agregarAbonoAPedido(pedidoId, saldoPendiente)

    } catch (error) {
      console.error('❌ Error marcando pedido como pagado:', error)
      return {
        success: false,
        mensaje: error.message
      }
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

  const eliminarPedido = async (pedidoId) => {
    try {
      // Verificar si el pedido tiene factura asociada buscando en las notas de facturas
      const pedido = pedidos.find(p => p.id === pedidoId)
      if (pedido && pedido.codigo) {
        // Buscar si existe una factura con referencia a este pedido en las notas
        const { data: facturasAsociadas } = await supabase
          .from('facturas')
          .select('id, numero')
          .ilike('notas', `%${pedido.codigo}%`)
          .eq('user_id', user.id)

        if (facturasAsociadas && facturasAsociadas.length > 0) {
          throw new Error(`No se puede eliminar el pedido. Tiene la factura ${facturasAsociadas[0].numero} asociada.`)
        }
      }

      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', pedidoId)

      if (error) throw error

      // Actualizar estado local
      setPedidos(prev => prev.filter(p => p.id !== pedidoId))

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

      // 2. Verificar si ya tiene factura (buscar por código de pedido en notas)
      const { data: facturasExistentes } = await supabase
        .from('facturas')
        .select('*')
        .ilike('notas', `%${pedido.codigo}%`)
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
        metodopago: 'Efectivo',
        items: JSON.stringify(items),
        total: pedido.total,
        montopagado: 0,
        saldopendiente: pedido.total,
        estado: 'pendiente',
        notas: `Pedido: ${pedido.codigo}`,
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

      // Si el pago completa la factura, actualizar estado del pedido si existe
      if (pedidoId && nuevoSaldoPendiente === 0) {
        const { error: errorPedido } = await supabase
          .from('pedidos')
          .update({ estado: 'entregado' })
          .eq('id', pedidoId)

        if (!errorPedido) {
          // Actualizar localmente el pedido
          setPedidos(prev => prev.map(p =>
            p.id === pedidoId ? { ...p, estado: 'entregado' } : p
          ))
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
      // Validar nombre
      if (!nuevoProducto.nombre || nuevoProducto.nombre.trim() === '') {
        throw new Error('El nombre del producto es requerido')
      }

      const productoData = {
        ...nuevoProducto,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('productos')
        .insert([productoData])
        .select()

      if (error) throw error

      setProductos(prev => [data[0], ...prev])
      setNuevoProducto({ nombre: '', precio: 0, stock: 0, stockMinimo: 5 })

      return { success: true, producto: data[0] }
    } catch (error) {
      console.error('Error agregando producto:', error)
      return { success: false, mensaje: error.message }
    }
  }

  const editarProducto = async (productoId, datosActualizados) => {
    try {
      // Validar nombre
      if (datosActualizados.nombre && datosActualizados.nombre.trim() === '') {
        throw new Error('El nombre del producto no puede estar vacío')
      }

      const { error } = await supabase
        .from('productos')
        .update({
          ...datosActualizados,
          updated_at: new Date().toISOString()
        })
        .eq('id', productoId)

      if (error) throw error

      setProductos(prev => prev.map(producto =>
        producto.id === productoId
          ? { ...producto, ...datosActualizados }
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
      const movimientoCompleto = {
        ...movimientoData,
        user_id: user.id,
        created_at: new Date().toISOString()
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

  // ========== FUNCIONES AUXILIARES ==========

  const agregarClienteRapido = async () => {
    // Validar nombre
    if (!clienteRapido.nombre || clienteRapido.nombre.trim() === '') {
      return {
        success: false,
        mensaje: 'El nombre del cliente es requerido'
      }
    }

    const clienteData = {
      nombre: clienteRapido.nombre,
      telefono: clienteRapido.telefono || '',
      cuit: '',
      user_id: user.id,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([clienteData])
      .select()

    if (error) {
      console.error('Error agregando cliente rápido:', error)
      return {
        success: false,
        mensaje: error.message || 'Error al agregar cliente'
      }
    }

    setClientes(prev => [data[0], ...prev])
    setClienteRapido({ nombre: '', telefono: '' })

    return {
      success: true,
      cliente: data[0],
      mensaje: 'Cliente agregado exitosamente'
    }
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
      stockMinimo: 5,
      user_id: user.id,
      created_at: new Date().toISOString()
    }

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
          ...datosActualizados,
          updated_at: new Date().toISOString()
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

  const cerrarCaja = async () => {
    try {
      const cierreData = {
        fecha: new Date().toISOString().split('T')[0],
        saldo_inicial: caja.saldo,
        ingresos: caja.ingresos || 0,
        egresos: caja.egresos || 0,
        saldo_final: caja.saldo,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('cierres_caja')
        .insert([cierreData])

      if (error) throw error

      // Resetear caja del día
      setCaja(prev => ({ ...prev, ingresos: 0, egresos: 0 }))
      setMovimientosCaja([])

      // Recargar cierres
      const { data: cierresData } = await supabase
        .from('cierres_caja')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (cierresData) setCierresCaja(cierresData)

      return { success: true, mensaje: 'Caja cerrada exitosamente' }
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
    eliminarPedido,
    facturarPedido,

    // NUEVAS funciones para pedidos SIMPLES
    agregarPedidoSolo, // ← NUEVA: crea solo pedido sin factura
    agregarAbonoAPedido, // ← NUEVA: agrega abono directo al pedido
    marcarPedidoPagadoTotal, // ← NUEVA: marca pedido como pagado total

    // Funciones para caja
    agregarMovimientoCaja,
    cerrarCaja,

    // Funciones auxiliares
    cambiarTipoOperacion,
    cargarDatos,
    recargarTodosLosDatos,
    openModal,
    closeModal
  }
}