/**
 * seedDemoData.js
 * Carga datos de ejemplo realistas cuando un usuario entra por primera vez.
 * Se ejecuta una sola vez y se marca en user_metadata para no repetirse.
 */
import { supabase } from '../lib/supabaseClient'

const hoy   = () => new Date().toISOString().slice(0, 10)
const hace  = (dias) => new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10)
const futuro= (dias) => new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10)

export async function seedDemoData(userId, onboardingData = {}) {
  const { rubro = 'Comercio', moneda = 'ARS' } = onboardingData

  // ── 1. Productos ──────────────────────────────────────────────────────────
  const prodBase = {
    Tecnología: [
      { nombre:'iPhone 15 Pro 256GB',    codigo:'PROD-0001', precio:1850000, costo:1400000, stock:6,  categoria:'Celulares',   controlastock:true  },
      { nombre:'AirPods Pro 2da gen',    codigo:'PROD-0002', precio:320000,  costo:210000,  stock:12, categoria:'Audio',       controlastock:true  },
      { nombre:'Cable USB-C 2m',         codigo:'PROD-0003', precio:8500,    costo:3200,    stock:80, categoria:'Accesorios',  controlastock:true  },
      { nombre:'Funda silicona iPhone',  codigo:'PROD-0004', precio:14000,   costo:5500,    stock:35, categoria:'Accesorios',  controlastock:true  },
      { nombre:'Power Bank 20000mAh',    codigo:'PROD-0005', precio:38000,   costo:22000,   stock:10, categoria:'Electrónica', controlastock:true  },
    ],
    Ropa: [
      { nombre:'Camiseta básica negra',  codigo:'PROD-0001', precio:8500,    costo:4200,    stock:25, categoria:'Remeras',     controlastock:true  },
      { nombre:'Jean slim fit talle 40', codigo:'PROD-0002', precio:18000,   costo:9000,    stock:12, categoria:'Pantalones',  controlastock:true  },
      { nombre:'Zapatillas urbanas',     codigo:'PROD-0003', precio:34000,   costo:18000,   stock:8,  categoria:'Calzado',     controlastock:true  },
      { nombre:'Gorra snapback',         codigo:'PROD-0004', precio:4500,    costo:1800,    stock:40, categoria:'Accesorios',  controlastock:true  },
      { nombre:'Buzo con capucha',       codigo:'PROD-0005', precio:14500,   costo:7000,    stock:0,  categoria:'Buzos',       controlastock:true  },
    ],
    Muebles: [
      { nombre:'Silla de escritorio ergonómica', codigo:'PROD-0001', precio:85000,  costo:48000, stock:5,  categoria:'Sillas',   controlastock:true  },
      { nombre:'Escritorio en L 160cm',          codigo:'PROD-0002', precio:120000, costo:72000, stock:3,  categoria:'Escritorios',controlastock:true },
      { nombre:'Estantería modular 5 estantes',  codigo:'PROD-0003', precio:42000,  costo:24000, stock:8,  categoria:'Estantes', controlastock:true  },
      { nombre:'Mesa de comedor madera 6 sillas',codigo:'PROD-0004', precio:280000, costo:160000,stock:2,  categoria:'Mesas',    controlastock:true  },
      { nombre:'Cuadro decorativo 60x90',        codigo:'PROD-0005', precio:18000,  costo:8000,  stock:15, categoria:'Deco',     controlastock:true  },
    ],
    Vehículos: [
      { nombre:'Filtro de aceite Toyota',        codigo:'PROD-0001', precio:4800,   costo:2200,  stock:30, categoria:'Filtros',    controlastock:true },
      { nombre:'Pastillas de freno delanteras',  codigo:'PROD-0002', precio:12500,  costo:6800,  stock:15, categoria:'Frenos',     controlastock:true },
      { nombre:'Batería 12V 65Ah',               codigo:'PROD-0003', precio:38000,  costo:22000, stock:8,  categoria:'Eléctricas', controlastock:true },
      { nombre:'Llanta 205/55 R16',              codigo:'PROD-0004', precio:45000,  costo:28000, stock:12, categoria:'Ruedas',     controlastock:true },
      { nombre:'Aceite sintético 5W-30 4L',      codigo:'PROD-0005', precio:9800,   costo:5200,  stock:40, categoria:'Lubricantes',controlastock:true },
    ],
  }

  const prodPayload = (prodBase[rubro] || prodBase.Ropa).map(p => ({ ...p, user_id: userId }))

  const { data: prodData, error: prodErr } = await supabase
    .from('productos').insert(prodPayload).select()
  if (prodErr) throw prodErr

  // ── 2. Clientes ───────────────────────────────────────────────────────────
  const cliPayload = [
    { nombre:'María González',   email:'maria@ejemplo.com',   telefono:'11-4523-0011', user_id:userId },
    { nombre:'Carlos Rodríguez', email:'carlos@demo.com',     telefono:'11-5641-9922', user_id:userId },
    { nombre:'Laura Martínez',   email:'laura@clientes.com',  telefono:'11-3312-4455', user_id:userId },
    { nombre:'Empresa Demo SRL', email:'compras@demo.com.ar', telefono:'0800-555-0000', user_id:userId },
  ]

  const { data: cliData, error: cliErr } = await supabase
    .from('clientes').insert(cliPayload).select()
  if (cliErr) throw cliErr

  const [c1, c2, c3, c4] = cliData
  const [p1, p2, p3, p4, p5] = prodData

  // ── 3. Pedidos ────────────────────────────────────────────────────────────
  const pedidosSeed = [
    {
      cliente_id: c1?.id, cliente_nombre: c1?.nombre,
      fecha_pedido: hace(5), fecha_entrega_estimada: futuro(2),
      estado:'preparando', notas:'Traer bolsa de regalo', canal_venta:'Instagram',
      total:26500, monto_abonado:10000, saldo_pendiente:16500,
      metodo_pago:'transferencia', user_id:userId,
      items: JSON.stringify([
        { productoId:p1?.id, producto:p1?.nombre, precio:8500,  cantidad:1, subtotal:8500  },
        { productoId:p2?.id, producto:p2?.nombre, precio:18000, cantidad:1, subtotal:18000 },
      ])
    },
    {
      cliente_id: c2?.id, cliente_nombre: c2?.nombre,
      fecha_pedido: hace(2), fecha_entrega_estimada: futuro(5),
      estado:'pendiente', notas:'', canal_venta:'WhatsApp',
      total:34000, monto_abonado:34000, saldo_pendiente:0,
      metodo_pago:'mercadopago', user_id:userId,
      items: JSON.stringify([
        { productoId:p3?.id, producto:p3?.nombre, precio:34000, cantidad:1, subtotal:34000 },
      ])
    },
    {
      cliente_id: c3?.id, cliente_nombre: c3?.nombre,
      fecha_pedido: hace(10), fecha_entrega_estimada: hace(1),
      estado:'entregado', notas:'Entregado en mano', canal_venta:'Tienda',
      total:13000, monto_abonado:13000, saldo_pendiente:0,
      metodo_pago:'efectivo', user_id:userId,
      items: JSON.stringify([
        { productoId:p4?.id, producto:p4?.nombre, precio:4500, cantidad:1, subtotal:4500 },
        { productoId:p2?.id, producto:p2?.nombre, precio:8500, cantidad:1, subtotal:8500 },
      ])
    },
    {
      cliente_id: null, cliente_nombre:'Consumidor Final',
      fecha_pedido: hoy(), fecha_entrega_estimada: null,
      estado:'pendiente', notas:'', canal_venta:'Local',
      total:8500, monto_abonado:8500, saldo_pendiente:0,
      metodo_pago:'efectivo', user_id:userId,
      items: JSON.stringify([
        { productoId:p1?.id, producto:p1?.nombre, precio:8500, cantidad:1, subtotal:8500 },
      ])
    },
    {
      cliente_id: c4?.id, cliente_nombre: c4?.nombre,
      fecha_pedido: hace(1), fecha_entrega_estimada: futuro(7),
      estado:'preparando', notas:'Pedido mayorista — 3 colores', canal_venta:'Email',
      total:148500, monto_abonado:50000, saldo_pendiente:98500,
      metodo_pago:'transferencia', user_id:userId,
      items: JSON.stringify([
        { productoId:p1?.id, producto:p1?.nombre, precio:8500,  cantidad:5, subtotal:42500  },
        { productoId:p2?.id, producto:p2?.nombre, precio:18000, cantidad:3, subtotal:54000  },
        { productoId:p4?.id, producto:p4?.nombre, precio:4500,  cantidad:6, subtotal:27000  },
        { productoId:p5?.id, producto:p5?.nombre, precio:14500, cantidad:1, subtotal:14500  },
      ])
    },
  ]

  const { error: pedErr } = await supabase.from('pedidos').insert(pedidosSeed)
  if (pedErr) throw pedErr

  return { productos: prodData.length, clientes: cliData.length, pedidos: pedidosSeed.length }
}
