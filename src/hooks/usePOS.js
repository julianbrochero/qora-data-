import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (n) => `$${(parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Intento de autocompletar desde OpenFoodFacts (libre, sin key)
const buscarEnAPIExterna = async (codigoBarras) => {
    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigoBarras}.json`, { signal: AbortSignal.timeout(3500) })
        if (!res.ok) return null
        const data = await res.json()
        if (data.status !== 1) return null
        const p = data.product
        return {
            nombre: p.product_name || p.product_name_es || '',
            marca: p.brands || '',
            categoria: p.categories_tags?.[0]?.replace('en:', '') || '',
        }
    } catch (_) { return null }
}

export const usePOS = () => {
    const { user } = useAuth()

    // ── Carrito ──
    const [carrito, setCarrito] = useState([])

    // ── Estado de UI ──
    const [cargando, setCargando] = useState(false)
    const [modalCobro, setModalCobro] = useState(false)
    const [modalProductoNuevo, setModalProductoNuevo] = useState(null) // { codigoBarras, datosAPI? }
    const [ultimaVenta, setUltimaVenta] = useState(null)
    const [alertasStock, setAlertasStock] = useState([])

    // ── Computed ──
    const totalCarrito = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
    const cantidadItems = carrito.reduce((s, i) => s + i.cantidad, 0)

    // ─── BUSCAR PRODUCTO (por nombre, con intento por código de barras) ──────────────────────
    const buscarProducto = useCallback(async (query) => {
        if (!query?.trim() || !user) return []
        const q = query.trim()

        // Buscar por nombre (ilike es insensible a mayúsculas)
        // Usamos select('*') para no fallar si alguna columna opcional aún no existe
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('user_id', user.id)
            .ilike('nombre', `%${q}%`)
            .limit(10)

        if (error) {
            console.warn('buscarProducto error:', error.message)
            return []
        }
        return data || []
    }, [user])


    // ─── CARRITO ──────────────────────────────────────────────────────────────
    const agregarAlCarrito = useCallback((producto, cantidad = 1) => {
        setCarrito(prev => {
            const idx = prev.findIndex(i => i.productoId === producto.id)
            if (idx >= 0) {
                const copia = [...prev]
                copia[idx] = { ...copia[idx], cantidad: copia[idx].cantidad + cantidad }
                return copia
            }
            return [...prev, {
                productoId: producto.id,
                nombre: producto.nombre,
                precio: parseFloat(producto.precio) || 0,
                cantidad,
                stock: producto.stock,
                stockMinimo: producto.stock_minimo,
            }]
        })
    }, [])

    const quitarUltimo = useCallback(() => {
        setCarrito(prev => {
            if (!prev.length) return prev
            const copia = [...prev]
            const ultimo = copia[copia.length - 1]
            if (ultimo.cantidad > 1) {
                copia[copia.length - 1] = { ...ultimo, cantidad: ultimo.cantidad - 1 }
            } else {
                copia.pop()
            }
            return copia
        })
    }, [])

    const cambiarCantidad = useCallback((index, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            setCarrito(prev => prev.filter((_, i) => i !== index))
        } else {
            setCarrito(prev => prev.map((item, i) => i === index ? { ...item, cantidad: nuevaCantidad } : item))
        }
    }, [])

    const limpiarCarrito = useCallback(() => setCarrito([]), [])

    // Editar precio de un item del carrito on-the-fly
    const editarPrecioItem = useCallback((index, nuevoPrecio) => {
        const p = parseFloat(nuevoPrecio)
        if (isNaN(p) || p < 0) return
        setCarrito(prev => prev.map((item, i) => i === index ? { ...item, precio: p } : item))
    }, [])

    // Agregar producto libre (sin DB): pan, empanada, etc.
    const agregarItemLibre = useCallback((nombre, precio, cantidad = 1) => {
        if (!nombre || !precio) return
        setCarrito(prev => [...prev, {
            productoId: null,
            nombre: nombre.trim(),
            precio: parseFloat(precio) || 0,
            cantidad: parseInt(cantidad) || 1,
            stock: null,
            esLibre: true,
        }])
    }, [])

    // ─── ESCANEAR: lógica completa del escaneo de un código ──────────────────
    const escanear = useCallback(async (codigoBarras) => {
        if (!codigoBarras?.trim() || !user) return { accion: 'nada' }
        const codigo = codigoBarras.trim()

        // 1. Buscar por código de barras (tabla puede tener la columna o no)
        let productoEncontrado = null
        try {
            const { data, error } = await supabase
                .from('productos')
                .select('*')
                .eq('user_id', user.id)
                .eq('codigo_barras', codigo)
                .maybeSingle()
            if (!error) productoEncontrado = data
        } catch (_) { /* columna no existe aún, ignorar */ }

        // 2. Si no encontró por código, buscar por nombre exacto como fallback
        if (!productoEncontrado) {
            try {
                const { data } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('user_id', user.id)
                    .ilike('nombre', codigo)
                    .maybeSingle()
                productoEncontrado = data
            } catch (_) { /* ignorar */ }
        }

        if (productoEncontrado) {
            agregarAlCarrito(productoEncontrado)
            return { accion: 'agregado', producto: productoEncontrado }
        }

        // 3. No existe → intentar API externa y abrir modal de alta rápida
        setCargando(true)
        const datosAPI = await buscarEnAPIExterna(codigo)
        setCargando(false)

        setModalProductoNuevo({ codigoBarras: codigo, datosAPI })
        return { accion: 'nuevo', datosAPI }
    }, [user, agregarAlCarrito])

    // ─── COBRAR VENTA ─────────────────────────────────────────────────────────
    const cobrarVenta = useCallback(async ({ metodoPago = 'Efectivo', montoPagado, descuento = 0 }) => {
        if (!carrito.length || !user) return { success: false, mensaje: 'Carrito vacío' }

        try {
            setCargando(true)
            const total = totalCarrito - (parseFloat(descuento) || 0)
            const pagado = parseFloat(montoPagado) || total
            const vuelto = Math.max(0, pagado - total)
            const hoy = new Date().toISOString().split('T')[0]

            // ── OPTIMIZACIÓN: obtener secuencias en PARALELO (antes eran 2 awaits secuenciales) ──
            const [{ data: ultimoPedido }, { data: ultimaFactura }] = await Promise.all([
                supabase.from('pedidos').select('codigo').order('created_at', { ascending: false }).limit(1),
                supabase.from('facturas').select('numero').eq('tipo', 'Factura A').order('created_at', { ascending: false }).limit(1),
            ])

            let numPedido = 1
            if (ultimoPedido?.[0]?.codigo) {
                const m = ultimoPedido[0].codigo.match(/\d+/)
                if (m) numPedido = parseInt(m[0]) + 1
            }
            const codigoPOS = `POS-${numPedido.toString().padStart(4, '0')}`

            let ultimoNum = 0
            if (ultimaFactura?.[0]?.numero) {
                const matches = ultimaFactura[0].numero.match(/\d+/g)
                if (matches) ultimoNum = parseInt(matches[matches.length - 1]) || 0
            }
            const numeroFactura = `FA-${(ultimoNum + 1).toString().padStart(8, '0')}`

            const itemsJSON = JSON.stringify(carrito.map(i => ({ productoId: i.productoId, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad })))
            const detalleProductos = carrito.map(i => `${i.nombre}${i.cantidad > 1 ? ` x${i.cantidad}` : ''}`).join(', ')

            // 1. Crear Pedido POS
            const { data: pedidoRes, error: pErr } = await supabase.from('pedidos').insert([{
                codigo: codigoPOS,
                cliente_nombre: 'Consumidor Final',
                fecha_pedido: hoy,
                fecha_entrega_estimada: hoy,
                items: itemsJSON,
                total,
                productos_count: carrito.length,
                notas: `Venta POS | ${metodoPago}`,
                estado: 'completado',
                monto_abonado: total,
                saldo_pendiente: 0,
                user_id: user.id,
                created_at: new Date().toISOString()
            }]).select()
            if (pErr) throw pErr
            const nuevoPedido = pedidoRes[0]

            // ── OPTIMIZACIÓN: factura + caja en PARALELO (antes eran 2 awaits secuenciales) ──
            const [{ error: fErr }] = await Promise.all([
                supabase.from('facturas').insert([{
                    tipo: 'Factura A',
                    numero: numeroFactura,
                    fecha: hoy,
                    cliente: 'Consumidor Final',
                    pedido_id: nuevoPedido.id,
                    metodopago: metodoPago,
                    items: itemsJSON,
                    total,
                    montopagado: total,
                    saldopendiente: 0,
                    estado: 'pagada',
                    user_id: user.id
                }]).select(),
                supabase.from('movimientos_caja').insert([{
                    tipo: 'ingreso',
                    monto: total,
                    description: `Venta POS ${codigoPOS} | ${metodoPago} | ${detalleProductos}`,
                    metodo: metodoPago,
                    referencia: `pedido:${nuevoPedido.id}`,
                    fecha: new Date().toISOString(),
                    user_id: user.id
                }]),
            ])
            if (fErr) throw fErr

            // ── OPTIMISTIC: mostrar éxito inmediatamente sin esperar el descuento de stock ──
            const resumen = {
                codigo: codigoPOS,
                numero: numeroFactura,
                total,
                pagado,
                vuelto,
                metodoPago,
                items: [...carrito],
                hora: new Date().toLocaleTimeString('es-AR'),
            }
            setUltimaVenta(resumen)
            limpiarCarrito()
            setModalCobro(false)
            setCargando(false)

            // ── BACKGROUND: descontar stock sin bloquear la UI ──
            ;(async () => {
                const alertas = []
                await Promise.all(carrito.map(async (item) => {
                    if (!item.productoId) return
                    const { data: prod, error: readErr } = await supabase
                        .from('productos').select('*').eq('id', item.productoId).single()
                    if (readErr || !prod) {
                        console.warn(`[POS] No se pudo leer producto ${item.productoId}:`, readErr?.message)
                        return
                    }
                    const stockActual = typeof prod.stock === 'number' ? prod.stock : (parseInt(prod.stock) || 0)
                    const nuevoStock = Math.max(0, stockActual - item.cantidad)
                    const { error: updateErr } = await supabase
                        .from('productos').update({ stock: nuevoStock })
                        .eq('id', item.productoId).eq('user_id', user.id)
                    if (updateErr) { console.error(`[POS] Error stock "${item.nombre}":`, updateErr.message); return }
                    const minimo = prod.stock_minimo ?? prod.stockminimo ?? 5
                    if (nuevoStock <= minimo) alertas.push({ nombre: prod.nombre, stock: nuevoStock, minimo })
                }))
                if (alertas.length) setAlertasStock(alertas)
            })().catch(e => console.warn('[POS] Background stock update error:', e))

            return { success: true, resumen }

        } catch (e) {
            console.error('Error cobrando venta POS:', e)
            return { success: false, mensaje: e.message }
        } finally {
            setCargando(false)
        }
    }, [carrito, totalCarrito, user, limpiarCarrito])

    // ─── ALTA RÁPIDA DE PRODUCTO ──────────────────────────────────────────────
    const crearProductoRapido = useCallback(async ({ nombre, precio, stock = 1, codigoBarras, categoria = '' }) => {
        if (!nombre || !precio || !user) return { success: false, mensaje: 'Datos incompletos' }
        try {
            const { data, error } = await supabase.from('productos').insert([{
                nombre,
                precio: parseFloat(precio),
                stock: parseInt(stock) || 1,
                stock_minimo: 5,
                codigo_barras: codigoBarras || null,
                categoria: categoria || 'General',
                user_id: user.id,
                created_at: new Date().toISOString()
            }]).select().single()
            if (error) throw error
            setModalProductoNuevo(null)
            agregarAlCarrito(data)
            return { success: true, producto: data }
        } catch (e) {
            return { success: false, mensaje: e.message }
        }
    }, [user, agregarAlCarrito])

    // ─── INGRESO MASIVO DE STOCK ──────────────────────────────────────────────
    const actualizarStockMasivo = useCallback(async (movimientos) => {
        // movimientos = [{ productoId, incremento }]
        try {
            await Promise.all(movimientos.map(async ({ productoId, incremento }) => {
                const { data: prod } = await supabase.from('productos').select('stock').eq('id', productoId).single()
                if (!prod) return
                await supabase.from('productos').update({ stock: (prod.stock || 0) + incremento }).eq('id', productoId)
            }))
            return { success: true }
        } catch (e) {
            return { success: false, mensaje: e.message }
        }
    }, [])

    return {
        // Estado
        carrito, totalCarrito, cantidadItems, cargando,
        modalCobro, setModalCobro,
        modalProductoNuevo, setModalProductoNuevo,
        ultimaVenta, setUltimaVenta,
        alertasStock, setAlertasStock,
        // Acciones
        escanear,
        buscarProducto,
        agregarAlCarrito,
        quitarUltimo,
        cambiarCantidad,
        limpiarCarrito,
        cobrarVenta,
        crearProductoRapido,
        actualizarStockMasivo,
        editarPrecioItem,
        agregarItemLibre,
        // Utils
        fmt,
    }
}
