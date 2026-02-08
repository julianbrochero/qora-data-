"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

export const useVentas = () => {
  const { user } = useAuth()

  // Estados principales
  const [ventas, setVentas] = useState([])
  const [facturas, setFacturas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)

  // Función unificada para guardar venta - SIEMPRE crea factura + pedido
  const guardarVenta = async (ventaData, tipoVenta = "factura") => {
    setLoading(true)

    try {
      console.log('Datos recibidos en guardarVenta:', ventaData)

      // 1. Validación inicial de cliente
      if (!ventaData.clienteId) {
        throw new Error('Debe seleccionar un cliente')
      }

      // ✅ ASEGURAR clienteNombre
      let clienteNombreFinal = ventaData.clienteNombre

      if ((!clienteNombreFinal || clienteNombreFinal.trim() === '') && ventaData.clienteId) {
        const { data: clienteDB, error } = await supabase
          .from('clientes')
          .select('nombre')
          .eq('id', ventaData.clienteId)
          .single()

        if (error || !clienteDB?.nombre) {
          throw new Error('El nombre del cliente es requerido')
        }

        clienteNombreFinal = clienteDB.nombre
      }

      // 2. Verificar stock para productos que controlan stock
      for (const item of ventaData.items) {
        // Solo verificar stock si controlaStock no es false explícitamente
        if (item.controlaStock !== false) {
          const { data: producto, error: productoError } = await supabase
            .from('productos')
            .select('stock, nombre')
            .eq('id', item.productoId)
            .single()

          if (productoError) {
            console.warn(`Producto ${item.productoId} no encontrado, saltando verificación de stock`)
            continue
          }

          if (producto && producto.stock < item.cantidad) {
            throw new Error(`Stock insuficiente para ${producto.nombre || item.producto}. Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`)
          }
        }
      }

      // 3. Generar código de pedido
      const codigoPedido = await generarCodigoPedido()

      // 4. Determinar estado del pedido basado en el pago
      const totalVenta = ventaData.total || calcularTotalItems(ventaData.items)
      const montoPagado = parseFloat(ventaData.montoPagado) || 0
      const saldoPendiente = totalVenta - montoPagado

      let estadoPedido = 'pendiente'

      // 5. Crear pedido (SIEMPRE se crea)
      const pedidoData = {
        codigo: codigoPedido,
        cliente_id: ventaData.clienteId,
        cliente_nombre: clienteNombreFinal,
        fecha_pedido: ventaData.fechaVenta || new Date().toISOString().split('T')[0],
        fecha_entrega_estimada: ventaData.fechaEntrega || null,
        items: JSON.stringify(ventaData.items || []),
        total: totalVenta,
        productos_count: (ventaData.items || []).length,
        notas: ventaData.notas || '',
        estado: estadoPedido,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Creando pedido:', pedidoData)

      const { data: pedidoGuardado, error: errorPedido } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select()

      if (errorPedido) {
        console.error('Error creando pedido:', errorPedido)
        throw errorPedido
      }

      console.log('Pedido creado:', pedidoGuardado[0])

      // 6. Crear factura
      const numeroFactura = await generarNumeroFactura(ventaData.tipoFactura || 'Factura A')

      // Determinar estado de factura
      let estadoFactura = 'pendiente'
      if (saldoPendiente === 0) {
        estadoFactura = 'pagada'
      } else if (montoPagado > 0) {
        estadoFactura = 'parcial'
      }

      const facturaData = {
        tipo: ventaData.tipoFactura || 'Factura A',
        numero: numeroFactura,
        fecha: ventaData.fechaVenta || new Date().toISOString().split('T')[0],
        cliente_id: ventaData.clienteId,
        cliente_nombre: clienteNombreFinal,
        pedido_id: pedidoGuardado[0].id,
        metodoPago: ventaData.metodoPago || 'Efectivo',
        items: JSON.stringify(ventaData.items || []),
        total: totalVenta,
        montoPagado: montoPagado,
        saldoPendiente: saldoPendiente,
        estado: estadoFactura,
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      console.log('Creando factura:', facturaData)

      const { data: facturaGuardada, error: errorFactura } = await supabase
        .from('facturas')
        .insert([facturaData])
        .select()

      if (errorFactura) {
        console.error('Error creando factura:', errorFactura)
        throw errorFactura
      }

      console.log('Factura creada:', facturaGuardada[0])

      // 7. Actualizar pedido con ID de factura
      await supabase
        .from('pedidos')
        .update({
          factura_id: facturaGuardada[0].id,
          estado: estadoPedido
        })
        .eq('id', pedidoGuardado[0].id)

      // 8. Registrar pago si hay monto pagado
      if (montoPagado > 0) {
        const pagoData = {
          factura_id: facturaGuardada[0].id,
          monto: montoPagado,
          fecha: ventaData.fechaVenta || new Date().toISOString().split('T')[0],
          metodo: ventaData.metodoPago || 'Efectivo',
          descripcion: `Pago inicial - Factura ${numeroFactura}`,
          user_id: user.id,
          created_at: new Date().toISOString()
        }

        const { error: errorPago } = await supabase
          .from('abonos')
          .insert([pagoData])

        if (errorPago) {
          console.error('Error registrando pago:', errorPago)
          // No lanzamos error aquí para no revertir todo
        }

        // Registrar movimiento de caja
        const movimientoData = {
          tipo: 'ingreso',
          monto: montoPagado,
          descripcion: `Pago factura ${numeroFactura}`,
          categoria: 'ventas',
          fecha: new Date().toISOString().split('T')[0],
          user_id: user.id,
          created_at: new Date().toISOString()
        }

        try {
          await supabase
            .from('movimientos_caja')
            .insert([movimientoData])
        } catch (movimientoError) {
          console.warn('Error registrando movimiento de caja:', movimientoError)
        }
      }

      // 9. Actualizar stock para productos que controlan stock (Manual si RPC no existe)
      for (const item of ventaData.items) {
        if (item.controlaStock !== false && item.productoId) {
          try {
            const { data: prod } = await supabase
              .from('productos')
              .select('stock')
              .eq('id', item.productoId)
              .single()

            if (prod) {
              const nuevoStock = (prod.stock || 0) - item.cantidad
              await supabase
                .from('productos')
                .update({ stock: nuevoStock })
                .eq('id', item.productoId)
              console.log(`Stock actualizado para producto ${item.productoId}: -${item.cantidad}`)
            }
          } catch (stockError) {
            console.error(`Error actualizando stock para producto ${item.productoId}:`, stockError)
          }
        }
      }

      // 10. Actualizar estados locales
      const pedidoCompleto = {
        ...pedidoGuardado[0],
        factura_id: facturaGuardada[0].id,
        estado: estadoPedido
      }

      setPedidos(prev => [pedidoCompleto, ...prev])
      setFacturas(prev => [facturaGuardada[0], ...prev])

      // Actualizar ventas unificadas
      const nuevaVentaUnificada = {
        id: pedidoGuardado[0].id,
        tipo: 'factura',
        codigo: codigoPedido,
        factura_numero: numeroFactura,
        cliente: clienteNombreFinal,
        fecha: ventaData.fechaVenta || new Date().toISOString().split('T')[0],
        total: totalVenta,
        estado: estadoPedido,
        estado_factura: estadoFactura,
        tieneFactura: true,
        factura_id: facturaGuardada[0].id,
        fecha_entrega: ventaData.fechaEntrega || null,
        saldo_pendiente: saldoPendiente
      }

      setVentas(prev => [nuevaVentaUnificada, ...prev])

      return {
        success: true,
        tipo: 'factura',
        pedido: {
          codigo: codigoPedido,
          id: pedidoGuardado[0].id,
          estado: estadoPedido,
          fecha_entrega: ventaData.fechaEntrega
        },
        factura: {
          numero: numeroFactura,
          id: facturaGuardada[0].id,
          estado: estadoFactura,
          saldo_pendiente: saldoPendiente
        },
        mensaje: ventaData.fechaEntrega
          ? `✅ Factura ${numeroFactura} creada y pedido ${codigoPedido} programado para el ${new Date(ventaData.fechaEntrega).toLocaleDateString('es-ES')}`
          : `✅ Factura ${numeroFactura} creada exitosamente`
      }

    } catch (error) {
      console.error('Error guardando venta:', error)
      return {
        success: false,
        mensaje: error.message || 'Error al guardar la venta'
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para facturar un pedido existente
  const facturarPedido = async (pedidoId) => {
    setLoading(true)

    try {
      // 1. Obtener pedido
      const { data: pedido, error: errorPedido } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single()

      if (errorPedido) throw errorPedido

      // 2. Verificar que no tenga factura ya
      if (pedido.factura_id) {
        throw new Error('Este pedido ya tiene una factura asociada')
      }

      // 3. Verificar stock
      const items = typeof pedido.items === 'string' ? JSON.parse(pedido.items) : pedido.items

      for (const item of items) {
        if (item.controlaStock !== false) {
          const { data: producto } = await supabase
            .from('productos')
            .select('stock, nombre')
            .eq('id', item.productoId)
            .single()

          if (producto && producto.stock < item.cantidad) {
            throw new Error(`Stock insuficiente para ${producto.nombre || item.producto}`)
          }
        }
      }

      // 4. Preparar datos para factura
      const ventaData = {
        clienteId: pedido.cliente_id,
        clienteNombre: pedido.cliente_nombre,
        fechaVenta: pedido.fecha_pedido,
        fechaEntrega: pedido.fecha_entrega_estimada,
        items: items,
        total: pedido.total,
        notas: pedido.notas,
        tipoFactura: 'Factura A',
        metodoPago: 'Efectivo',
        montoPagado: 0
      }

      // 5. Usar la misma lógica de guardarVenta pero con montoPagado = 0
      const resultado = await guardarVenta(ventaData, 'factura')

      if (resultado.success) {
        // Actualizar el pedido original para marcar que ya tiene factura
        await supabase
          .from('pedidos')
          .update({
            factura_id: resultado.factura.id,
            estado: 'entregado'
          })
          .eq('id', pedidoId)

        // Actualizar estado local del pedido
        setPedidos(prev => prev.map(p =>
          p.id === pedidoId
            ? { ...p, factura_id: resultado.factura.id, estado: 'entregado' }
            : p
        ))

        return {
          success: true,
          factura: resultado.factura.numero,
          pedido: resultado.pedido.codigo,
          mensaje: `Pedido ${pedido.codigo} facturado como ${resultado.factura.numero}`
        }
      } else {
        throw new Error(resultado.mensaje)
      }

    } catch (error) {
      console.error('Error facturando pedido:', error)
      return {
        success: false,
        mensaje: error.message
      }
    } finally {
      setLoading(false)
    }
  }

  // Función auxiliar para calcular total de items
  const calcularTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  }

  // Funciones auxiliares
  const generarCodigoPedido = async () => {
    const { data: ultimoPedido, error } = await supabase
      .from('pedidos')
      .select('codigo')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error obteniendo último pedido:', error)
      return 'PED-001'
    }

    if (!ultimoPedido || ultimoPedido.length === 0) {
      return 'PED-001'
    }

    const ultimoCodigo = ultimoPedido[0].codigo
    const matches = ultimoCodigo.match(/\d+/g)

    if (!matches) {
      return 'PED-001'
    }

    const numero = parseInt(matches[matches.length - 1]) || 0
    return `PED-${(numero + 1).toString().padStart(3, '0')}`
  }

  const generarNumeroFactura = async (tipo) => {
    const { data: ultimaFactura, error } = await supabase
      .from('facturas')
      .select('numero')
      .eq('tipo', tipo)
      .order('created_at', { ascending: false })
      .limit(1)

    let ultimoNumero = 0

    if (!error && ultimaFactura && ultimaFactura.length > 0) {
      const matches = ultimaFactura[0].numero.match(/\d+/g)
      if (matches) {
        ultimoNumero = parseInt(matches[matches.length - 1]) || 0
      }
    }

    const prefijo = tipo === 'Factura A' ? 'FA-' :
      tipo === 'Factura B' ? 'FB-' :
        tipo === 'Factura C' ? 'FC-' : 'FE-'

    return `${prefijo}${(ultimoNumero + 1).toString().padStart(8, '0')}`
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      cargarDatos()
    }
  }, [user])

  const cargarDatos = async () => {
    setLoading(true)

    try {
      // Cargar pedidos
      const { data: pedidosData, error: errorPedidos } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (errorPedidos) {
        console.error('Error cargando pedidos:', errorPedidos)
      } else if (pedidosData) {
        setPedidos(pedidosData)
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

      // Combinar para ventas unificadas
      const ventasUnificadas = []

      // Agregar pedidos con/sin factura
      pedidosData?.forEach(pedido => {
        const facturaAsociada = facturasData?.find(f => f.pedido_id === pedido.id)

        ventasUnificadas.push({
          id: pedido.id,
          tipo: 'pedido',
          codigo: pedido.codigo,
          cliente: pedido.cliente_nombre,
          fecha: pedido.fecha_pedido,
          total: pedido.total,
          estado: pedido.estado,
          tieneFactura: !!pedido.factura_id,
          factura_id: pedido.factura_id,
          factura_numero: facturaAsociada?.numero,
          estado_factura: facturaAsociada?.estado,
          fecha_entrega: pedido.fecha_entrega_estimada,
          saldo_pendiente: facturaAsociada?.saldoPendiente || pedido.total
        })
      })

      // Agregar facturas sin pedido (directas)
      facturasData?.forEach(factura => {
        if (!factura.pedido_id) {
          ventasUnificadas.push({
            id: factura.id,
            tipo: 'factura_directa',
            codigo: factura.numero,
            cliente: factura.cliente_nombre,
            fecha: factura.fecha,
            total: factura.total,
            estado: 'entregado', // Las facturas directas se consideran entregadas
            tieneFactura: true,
            factura_id: factura.id,
            factura_numero: factura.numero,
            estado_factura: factura.estado,
            fecha_entrega: null,
            saldo_pendiente: factura.saldoPendiente
          })
        }
      })

      // Ordenar por fecha más reciente
      ventasUnificadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

      setVentas(ventasUnificadas)

    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    // Estados
    ventas,
    pedidos,
    facturas,
    loading,

    // Funciones principales
    guardarVenta,
    facturarPedido,
    cargarDatos,

    // Funciones auxiliares
    generarCodigoPedido,
    generarNumeroFactura
  }
}