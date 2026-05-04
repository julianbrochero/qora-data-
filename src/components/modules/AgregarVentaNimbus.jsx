/**
 * AgregarVentaNimbus.jsx — Diseño POS estilo TiendaNube
 * Desktop: sin cambios respecto al original
 * Mobile: rediseñado al estilo AgregarVentaPOS (tarjetas separadas, footer fijo, grid precio/cant/subtotal)
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { CheckCircle, CheckCircle2, TrendingUp, Search, Plus, Minus, Trash2, X, Save, Menu, User, ChevronDown, UserPlus, PackagePlus, AlertCircle, Calendar, Zap, Banknote, ShoppingBag, CreditCard, Smartphone, Wallet, ArrowLeftRight } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { PlusIcon, MenuIcon, SearchIcon, ChevronDownIcon } from '@nimbus-ds/icons'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

/* ══════════════════════════════════════════
   PALETA (desktop — sin cambios)
══════════════════════════════════════════ */
const C = {
  pageBg: "#f8f9fb",
  bg: "#ffffff",
  border: "#d1d5db",
  borderFocus: "#334139",
  borderLight: "#e5e7eb",
  primary: "#334139",
  primaryHov: "#2b352f",
  primarySurf: "#eaf0eb",
  textBlack: "#0d0d0d",
  textDark: "#111827",
  textMid: "#6b7280",
  textLight: "#9ca3af",
  surface: "#f9fafb",
  success: "#16A34A", successSurf: "#F0FDF4", successBord: "#BBF7D0",
  warning: "#D97706", warnSurf: "#FFFBEB", warnBord: "#FDE68A",
  danger: "#DC2626", dangerSurf: "#FEF2F2", dangerBord: "#FECACA",
}

/* ══════════════════════════════════════════
   DESIGN TOKENS MOBILE (nuevos — POS style)
══════════════════════════════════════════ */
const M = {
  bg: '#ffffff',
  pageBg: '#f4f5f7',
  border: '#e2e4e8',
  borderFocus: '#1a5c45',
  primary: '#1a5c45',
  primaryLight: '#e8f5f0',
  primaryMid: '#c3e0d6',
  text: '#0f1117',
  textMid: '#6b7280',
  textLight: '#9ca3af',
  surface: '#f9fafb',
  success: '#16a34a',
  successBg: '#f0fdf4',
  successBord: '#bbf7d0',
  warning: '#d97706',
  warnBg: '#fffbeb',
  warnBord: '#fde68a',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  dangerBord: '#fecaca',
}

const fMon = n => '$\u00A0' + (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fMonShort = n => '$' + (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })
const cleanNumberValue = v => {
  if (v === '' || v == null) return ''
  const n = Number(v)
  return Number.isFinite(n) ? String(n) : ''
}
const PREF_KEY = 'gestify_pedido_cliente_activo'

const METODOS_PAGO = [
  { val: 'efectivo', lbl: 'Efectivo' },
  { val: 'transferencia', lbl: 'Transferencia' },
  { val: 'debito', lbl: 'Débito' },
  { val: 'credito', lbl: 'Crédito' },
  { val: 'mercadopago', lbl: 'Mercado Pago' },
]

const ESTADOS_PEDIDO = [
  { val: 'pendiente', lbl: 'Pendiente', color: '#d97706', bg: '#fffbeb' },
  { val: 'preparando', lbl: 'Preparando', color: '#2563eb', bg: '#eff6ff' },
  { val: 'enviado', lbl: 'Enviado', color: '#7c3aed', bg: '#f5f3ff' },
  { val: 'entregado', lbl: 'Entregado', color: '#16a34a', bg: '#f0fdf4' },
]

/* ── helpers visuales (desktop — sin cambios) ── */
const Label = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: C.textMid, letterSpacing: '0.05em', marginBottom: 1, fontFamily: "'Inter',sans-serif" }}>
    {children}
  </div>
)

const BtnPrimary = React.forwardRef(({ children, onClick, disabled, loading, style = {}, className = "" }, ref) => {
  const [hov, setHov] = useState(false)
  return (
    <button ref={ref} className={className} onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        height: 34, padding: '0 16px', borderRadius: 6, border: 'none',
        background: disabled ? C.textLight : hov ? C.primaryHov : C.primary,
        color: '#fff', fontSize: 13, fontWeight: 600,
        fontFamily: "'Inter',sans-serif", cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.13s',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {loading ? 'Guardando...' : children}
    </button>
  )
})

const BtnGhost = ({ children, onClick }) => {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 32, padding: '0 18px', borderRadius: 6,
        border: `1.5px solid ${hov ? '#9ca3af' : C.border}`,
        background: hov ? '#f3f4f6' : C.bg, color: C.textDark,
        fontSize: 13, fontWeight: 500,
        fontFamily: "'Inter',sans-serif", cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >{children}</button>
  )
}

const StockBadge = ({ prod }) => {
  if (!prod) return null
  if (!prod.controlaStock) return <span style={{ fontSize: 11, color: C.textMid }}>Stock: ∞</span>
  const s = prod.stock || 0
  const color = s <= 0 ? C.danger : s <= 5 ? C.warning : C.success
  const bg = s <= 0 ? C.dangerSurf : s <= 5 ? C.warnSurf : C.successSurf
  const bord = s <= 0 ? C.dangerBord : s <= 5 ? C.warnBord : C.successBord
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      color, background: bg, border: `1px solid ${bord}`,
      fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap',
    }}>{s}</span>
  )
}

const stockText = (prod) => {
  if (!prod?.controlaStock) return { label: 'Stock: ∞', color: C.textMid }
  const stock = prod.stock || 0
  if (stock <= 0) return { label: 'Sin stock', color: C.danger }
  if (stock <= 5) return { label: `Stock: ${stock}`, color: C.warning }
  return { label: `Stock: ${stock}`, color: C.textMid }
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function AgregarVentaNimbus({
  clientes = [],
  productos = [],
  formActions,
  openModal,
  onOpenMobileSidebar,
  onVentaCreada,
  pedidoAEditar = null,
  productoParaAgregarAlCarrito = null,
}) {
  /* ── estado ── */
  const [clienteActivo, setClienteActivo] = useState(() => { try { return localStorage.getItem(PREF_KEY) !== 'false' } catch { return true } })
  const [clienteId, setClienteId] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [busCliente, setBusCliente] = useState('')
  const [dropCliente, setDropCliente] = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [showOpcionales, setShowOpcionales] = useState(false)
  const [busProducto, setBusProducto] = useState('')
  const [dropProducto, setDropProducto] = useState(false)
  const [carrito, setCarrito] = useState([])
  const [fechaPedido, setFechaPedido] = useState(new Date().toISOString().slice(0, 10))
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [estado, setEstado] = useState(() => { try { return localStorage.getItem('gestify_pedido_estado') || 'pendiente' } catch { return 'pendiente' } })
  const [notas, setNotas] = useState('')
  const [adelanto, setAdelanto] = useState('')
  const [metodoPago, setMetodoPago] = useState(() => { try { return localStorage.getItem('gestify_metodo_pago') || 'efectivo' } catch { return 'efectivo' } })
  const [canalVenta, setCanalVenta] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [exito, setExito] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [fechaEntregaPicker, setFechaEntregaPicker] = useState(false)
  const [pickerViewDate, setPickerViewDate] = useState(() => new Date())
  const [fechaPedidoPicker, setFechaPedidoPicker] = useState(false)
  const [pedidoViewDate, setPedidoViewDate] = useState(() => new Date())
  const [collapseClientPay, setCollapseClientPay] = useState(true)

  const busProductoRef = useRef(null)
  const dropProdRef = useRef(null)
  const cliRef = useRef(null)
  const guardarRef = useRef(null)
  const fechaEntregaRef = useRef(null)
  const fechaPedidoRef = useRef(null)
  const totalRef = useRef(0)
  const prevClientesIds = useRef(new Set(clientes.map(c => c.id)))
  const prevProductosIds = useRef(new Set(productos.map(p => p.id)))
  const waitingNewCliente = useRef(false)
  const waitingNewProd = useRef(false)
  const [prodIdx, setProdIdx] = useState(-1)
  const [recentlyAddedId, setRecentlyAddedId] = useState(null)

  /* ── auto-focus al montar ── */
  useEffect(() => { setTimeout(() => busProductoRef.current?.focus(), 200) }, [])

  const canales = React.useMemo(() => { try { const ls = localStorage.getItem('gestify_canales_venta'); if (ls) return JSON.parse(ls) } catch { } return [] }, [])
  const suggestedRecent = useMemo(() => productos.slice(0, 3), [productos])

  const showToast = (msg, type = 'error') => { setToastMsg({ msg, type }); setTimeout(() => setToastMsg(null), 3500) }

  /* ── cargar pedido a editar ── */
  useEffect(() => {
    if (!pedidoAEditar) return
    if (pedidoAEditar.cliente_id) { setClienteId(pedidoAEditar.cliente_id); setClienteNombre(pedidoAEditar.cliente_nombre || ''); setBusCliente(pedidoAEditar.cliente_nombre || ''); setShowClientSearch(true); }
    let arr = []; try { arr = typeof pedidoAEditar.items === 'string' ? JSON.parse(pedidoAEditar.items) : (pedidoAEditar.items || []) } catch { }
    setCarrito(arr.map((i, idx) => ({ id: Date.now() + idx, productoId: i.productoId || i.producto_id || null, nombre: i.producto || i.nombre || '', codigo: i.codigo || '', variante: i.variante || '', precio: parseFloat(i.precio) || 0, costo: i.costo ?? '', cantidad: parseFloat(i.cantidad) || 1 })))
    if (pedidoAEditar.fecha_pedido) setFechaPedido(pedidoAEditar.fecha_pedido.slice(0, 10))
    if (pedidoAEditar.fecha_entrega_estimada) setFechaEntrega(pedidoAEditar.fecha_entrega_estimada.slice(0, 10))
    if (pedidoAEditar.estado) setEstado(pedidoAEditar.estado)
    if (pedidoAEditar.notas) setNotas(pedidoAEditar.notas)
    if (pedidoAEditar.monto_abonado) setAdelanto(String(pedidoAEditar.monto_abonado))
    if (pedidoAEditar.canal_venta) setCanalVenta(pedidoAEditar.canal_venta)
  }, [pedidoAEditar?.id])

  /* ── auto-selección cliente nuevo ── */
  useEffect(() => {
    if (waitingNewCliente.current) {
      const nuevo = clientes.find(c => !prevClientesIds.current.has(c.id))
      if (nuevo) { selCliente(nuevo); waitingNewCliente.current = false }
    }
    prevClientesIds.current = new Set(clientes.map(c => c.id))
  }, [clientes])

  /* ── auto-agregar producto nuevo ── */
  useEffect(() => {
    if (waitingNewProd.current) {
      const nuevo = productos.find(p => !prevProductosIds.current.has(p.id))
      if (nuevo) { agregarProd(nuevo); waitingNewProd.current = false }
    }
    prevProductosIds.current = new Set(productos.map(p => p.id))
  }, [productos])

  /* ── cálculos ── */
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0)
  totalRef.current = total
  const adelantoNum = parseFloat(adelanto) || 0
  const saldo = Math.max(0, total - adelantoNum)
  const puedeGuardar = carrito.length > 0 && (clienteActivo ? !!clienteId : true) && !isProcessing

  /* ── filtros ── */
  const clientesFilt = clientes.filter(c => c.nombre?.toLowerCase().includes(busCliente.toLowerCase()) || c.telefono?.includes(busCliente))
  const productosFilt = productos.filter(p => p.nombre?.toLowerCase().includes(busProducto.toLowerCase()) || p.codigo?.toLowerCase().includes(busProducto.toLowerCase()))

  /* ── carrito ── */
  const agregarProd = p => {
    const newId = Date.now()
    setCarrito(prev => {
      const defecto = p.variantes ? p.variantes.split(',')[0].trim() : ''
      const ex = prev.find(i => i.productoId === p.id && (i.variante || '') === defecto)
      if (ex) return prev.map(i => i.productoId === p.id && (i.variante || '') === defecto ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { id: newId, productoId: p.id, nombre: p.nombre, codigo: p.codigo, precio: p.precio, costo: p.costo ?? '', cantidad: 1, variante: defecto }]
    })
    setRecentlyAddedId(newId)
    setTimeout(() => setRecentlyAddedId(null), 550)
    setBusProducto(''); setDropProducto(false); setProdIdx(-1)
    setTimeout(() => busProductoRef.current?.focus(), 60)
  }

  useEffect(() => {
    if (!productoParaAgregarAlCarrito) return
    agregarProd(productoParaAgregarAlCarrito)
  }, [productoParaAgregarAlCarrito])

  const cambiarCant = (id, delta) => setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i))
  const setCant = (id, val) => setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, parseFloat(val) || 1) } : i))
  const setPrecio = (id, val) => setCarrito(prev => prev.map(i => i.id === id ? { ...i, precio: parseFloat(val) || 0 } : i))
  const setCosto = (id, val) => setCarrito(prev => prev.map(i => i.id === id ? { ...i, costo: val === '' ? '' : parseFloat(val) || 0 } : i))
  const setVariante = (id, val) => setCarrito(prev => prev.map(i => i.id === id ? { ...i, variante: val } : i))
  const quitarItem = id => setCarrito(prev => prev.filter(i => i.id !== id))

  const selCliente = c => { setClienteId(c.id); setClienteNombre(c.nombre); setBusCliente(c.nombre); setDropCliente(false); setShowClientSearch(false) }
  const limpiarTodo = () => { setClienteId(''); setClienteNombre(''); setBusCliente(''); setBusProducto(''); setCarrito([]); setFechaPedido(new Date().toISOString().slice(0, 10)); setFechaEntrega(''); setEstado('pendiente'); setNotas(''); setAdelanto(''); setCanalVenta(''); setShowClientSearch(false); setShowOpcionales(false) }

  /* ── guardar ── */
  const handleGuardar = useCallback(async () => {
    if (!puedeGuardar) { showToast('Agregá al menos un producto'); return }
    setIsProcessing(true)
    const items = carrito.map(i => {
      const costoNum = (i.costo !== '' && i.costo != null) ? parseFloat(i.costo) : null
      const ganancia = costoNum != null ? (i.precio - costoNum) * i.cantidad : null
      return { id: i.id, productoId: i.productoId, producto: i.nombre, variante: (i.variante || ''), precio: i.precio, cantidad: i.cantidad, subtotal: i.precio * i.cantidad, costo: costoNum, ganancia }
    })
    const final = {
      clienteId: clienteActivo ? clienteId : null,
      clienteNombre: clienteActivo ? clienteNombre : 'Consumidor Final',
      fechaPedido,
      fechaEntrega: fechaEntrega || null,
      estado,
      notas,
      items,
      montoPagado: adelantoNum,
      total,
      canal_venta: canalVenta || null,
      canalVenta: canalVenta || null
    }
    try {
      let r
      if (pedidoAEditar?.id) {
        r = await formActions?.actualizarPedido?.(pedidoAEditar.id, {
          cliente_id: final.clienteId,
          cliente_nombre: final.clienteNombre,
          fecha_pedido: final.fechaPedido,
          fecha_entrega_estimada: final.fechaEntrega,
          estado: final.estado,
          notas: final.notas,
          items: JSON.stringify(final.items),
          monto_abonado: final.montoPagado,
          saldo_pendiente: Math.max(0, final.total - final.montoPagado),
          total: final.total,
          canal_venta: final.canal_venta
        })
      } else {
        r = await formActions?.agregarPedidoSolo?.(final)
      }
      if (r?.success) { formActions?.recargarTodosLosDatos?.(); setExito(true); setTimeout(() => { setExito(null); limpiarTodo(); onVentaCreada?.() }, 900) }
      else showToast('Error: ' + (r?.mensaje || 'Desconocido'))
    } catch (e) { showToast('Error: ' + e.message) }
    finally { setIsProcessing(false) }
  }, [carrito, clienteActivo, clienteId, clienteNombre, fechaPedido, fechaEntrega, estado, notas, adelantoNum, total, puedeGuardar, formActions, pedidoAEditar])

  /* ── atajos de teclado ── */
  useEffect(() => {
    const onDown = e => {
      if (e.key === 'F5') {
        e.preventDefault()
        if (totalRef.current > 0) setAdelanto(String(Math.round(totalRef.current / 2)))
        return
      }
      if (e.key === 'F2' || (e.ctrlKey && e.key === 'Enter')) { e.preventDefault(); handleGuardar(); return }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement
        if (active && !['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) {
          busProductoRef.current?.focus()
        }
      }
    }
    let shiftAlone = false
    const trackDown = e => { if (e.key === 'Shift') { shiftAlone = true } else { shiftAlone = false } }
    const trackUp = e => {
      if (e.key === 'Shift' && shiftAlone && totalRef.current > 0) { setAdelanto(String(totalRef.current)) }
      if (e.key === 'Shift') shiftAlone = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keydown', trackDown)
    window.addEventListener('keyup', trackUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keydown', trackDown)
      window.removeEventListener('keyup', trackUp)
    }
  }, [handleGuardar])

  /* ── scroll item en dropdown ── */
  useEffect(() => {
    if (prodIdx < 0 || !dropProdRef.current) return
    const container = dropProdRef.current
    const el = container.querySelector(`[data-pidx="${prodIdx}"]`)
    if (!el) return
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    if (eRect.top < cRect.top) container.scrollTop -= cRect.top - eRect.top
    else if (eRect.bottom > cRect.bottom) container.scrollTop += eRect.bottom - cRect.bottom
  }, [prodIdx])

  /* ── cerrar drops al hacer click fuera ── */
  useEffect(() => {
    const h = e => {
      if (cliRef.current && !cliRef.current.contains(e.target)) setDropCliente(false)
      if (busProductoRef.current && !busProductoRef.current.closest?.('.pv-prod-wrap')?.contains(e.target)) setDropProducto(false)
      if (fechaEntregaRef.current && !fechaEntregaRef.current.contains(e.target)) setFechaEntregaPicker(false)
      if (fechaPedidoRef.current && !fechaPedidoRef.current.contains(e.target)) setFechaPedidoPicker(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const getProd = (productoId) => productos.find(p => p.id === productoId)

  const estadoActual = ESTADOS_PEDIDO.find(e => e.val === estado) || ESTADOS_PEDIDO[0]

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @keyframes av-fade-in  { from { opacity:0 } to { opacity:1 } }
        @keyframes av-slide-up { from { opacity:0; transform:translateY(16px) scale(.95) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes av-check    { 0% { transform:scale(0); opacity:0 } 55% { transform:scale(1.18) } 100% { transform:scale(1); opacity:1 } }
        @keyframes av-fade-out { 0% { opacity:1 } 70% { opacity:1 } 100% { opacity:0 } }
        @keyframes av-added    { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes m-slideIn   { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes m-toast     { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* ── Overlay de éxito ── */}
      {exito && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'av-fade-out .9s ease forwards',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '44px 52px', textAlign: 'center',
            boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
            animation: 'av-slide-up .18s cubic-bezier(.22,.97,.56,1)', minWidth: 260,
          }}>
            <div style={{
              width: 76, height: 76, borderRadius: '50%',
              background: '#F0FDF4', border: '2.5px solid #86EFAC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
              animation: 'av-check .25s cubic-bezier(.22,.97,.56,1) .08s both',
            }}>
              <CheckCircle2 size={38} strokeWidth={2} style={{ color: '#16A34A' }} />
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
              {pedidoAEditar ? '¡Actualizada!' : '¡Venta creada!'}
            </p>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, minWidth: 280, maxWidth: 360, boxShadow: '0 8px 24px rgba(0,0,0,.12)' }}>
          <Alert variant={toastMsg.type === 'error' ? 'destructive' : 'success'} style={{ paddingRight: 36 }}>
            {toastMsg.type === 'error'
              ? <AlertCircle size={16} style={{ marginTop: 1, color: '#DC2626' }} />
              : <CheckCircle2 size={16} style={{ marginTop: 1, color: '#16A34A' }} />
            }
            <AlertDescription>{toastMsg.msg}</AlertDescription>
            <button onClick={() => setToastMsg(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', opacity: .5, display: 'flex', padding: 2 }}><X size={13} /></button>
          </Alert>
        </div>
      )}

      {/* ══════════════════════════════════════
          HEADER DESKTOP (sin cambios)
      ══════════════════════════════════════ */}
      <div style={{ background: C.pageBg }} className="pv-desktop-header">
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px 12px', gap: 12, boxSizing: 'border-box' }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textBlack, letterSpacing: '-0.3px' }}>
            {pedidoAEditar ? `Editando · ${pedidoAEditar.codigo || ''}` : 'Agregar Venta'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onVentaCreada && (
              <BtnGhost onClick={onVentaCreada}>
                <TrendingUp size={13} /> Ver Ventas
              </BtnGhost>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          HEADER MOBILE (rediseñado)
      ══════════════════════════════════════ */}
      <div className="pv-mobile-header" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: M.bg, borderBottom: `1px solid ${M.border}`,
        display: 'none', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 16px', minHeight: 56, gap: 10,
      }}>
        <button onClick={onOpenMobileSidebar} style={{ width: 36, height: 36, borderRadius: 8, background: 'transparent', border: `1px solid ${M.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', flexShrink: 0 }}>
          <MenuIcon size={20} color={M.text} />
        </button>
        <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 700, fontSize: 17, color: M.text, fontFamily: "'Inter', sans-serif", pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {pedidoAEditar ? 'Editar Venta' : 'Agregar Venta'}
        </span>
        {onVentaCreada ? (
          <button onClick={onVentaCreada} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: M.primary, fontSize: 12, fontWeight: 700, padding: 4 }}>
            <TrendingUp size={14} /> Ventas
          </button>
        ) : <div style={{ marginLeft: 'auto', width: 52 }} />}
      </div>

      {/* ══════════════════════════════════════
          LAYOUT DESKTOP (sin cambios)
      ══════════════════════════════════════ */}
      <div className="pv-content-pad pv-desktop-content">

        {/* CARD 1 – Buscar producto */}
        <div className="pv-sale-card pv-product-search-card" style={{ background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'visible', marginBottom: 10 }}>
          <div className="pv-search-section" style={{ padding: '12px 16px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Producto</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" className="h-8 border shadow-sm px-2 text-[11px] flex items-center gap-1" onClick={() => { waitingNewCliente.current = true; openModal?.('nuevo-cliente') }}>
                  <UserPlus size={10} /> Cliente
                </Button>
                <Button size="sm" className="h-8 border shadow-sm px-2 text-[11px] flex items-center gap-1" onClick={() => { waitingNewProd.current = true; openModal?.('nuevo-producto') }}>
                  <PackagePlus size={10} /> Producto
                </Button>
              </div>
            </div>

            <div className="pv-prod-wrap" style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                  <Search size={15} color={C.textLight} />
                </div>
                <input
                  ref={busProductoRef}
                  type="text"
                  placeholder="Buscar por nombre, código o escanear..."
                  value={busProducto}
                  onChange={e => { setBusProducto(e.target.value); setDropProducto(true); setProdIdx(-1) }}
                  onFocus={() => setDropProducto(true)}
                  onKeyDown={e => {
                    if (!dropProducto || productosFilt.length === 0) return
                    if (e.key === 'ArrowDown') { e.preventDefault(); setProdIdx(i => Math.min(i + 1, productosFilt.length - 1)) }
                    else if (e.key === 'ArrowUp') { e.preventDefault(); setProdIdx(i => Math.max(i - 1, -1)) }
                    else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (prodIdx >= 0) agregarProd(productosFilt[prodIdx])
                      else if (productosFilt.length === 1) agregarProd(productosFilt[0])
                    }
                    else if (e.key === 'Escape') { setDropProducto(false); setProdIdx(-1) }
                  }}
                  style={{
                    width: '100%', height: 48, padding: '0 12px 0 38px',
                    fontSize: 16, color: C.textDark,
                    border: `1.5px solid ${C.border}`, borderRadius: 9,
                    outline: 'none', background: '#f9fafb',
                    fontFamily: "'Inter',sans-serif",
                    boxSizing: 'border-box',
                  }}
                  onFocusCapture={e => { e.target.style.borderColor = C.borderFocus; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,57,.08)' }}
                  onBlurCapture={e => { e.target.style.borderColor = C.border; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none' }}
                />
                {busProducto && (
                  <div style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.textLight, pointerEvents: 'none' }}>
                    {productosFilt.length} {productosFilt.length === 1 ? 'resultado' : 'resultados'}
                  </div>
                )}
              </div>

              {dropProducto && busProducto && productosFilt.length > 0 && (
                <div ref={dropProdRef} style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
                  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
                  boxShadow: '0 8px 28px rgba(0,0,0,.14)', maxHeight: 300, overflowY: 'auto',
                }}>
                  {productosFilt.slice(0, 12).map((p, idx) => {
                    const inCart = carrito.find(i => i.productoId === p.id)
                    const isHl = idx === prodIdx
                    const stock = stockText(p)
                    return (
                      <div key={p.id} data-pidx={idx} onMouseDown={() => agregarProd(p)}
                        onMouseEnter={() => setProdIdx(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', cursor: 'pointer', gap: 10,
                          borderBottom: `1px solid #f3f4f6`,
                          background: isHl ? C.primarySurf : 'transparent',
                          borderLeft: isHl ? `3px solid ${C.primary}` : '3px solid transparent',
                          transition: 'background 0.08s',
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: isHl ? 700 : 600, color: isHl ? C.primary : C.textDark, lineHeight: 1.25 }}>{p.nombre}</div>
                          <div style={{ fontSize: 11, color: C.textMid, marginTop: 3, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            {p.codigo && <span>{p.codigo.replace(/^[Pp][Rr][Oo][Dd][- ]+/, '')}</span>}
                            <span style={{ color: stock.color, fontWeight: 600 }}>{stock.label}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isHl ? C.primary : C.textDark, minWidth: 70, textAlign: 'right' }}>
                            ${(p.precio || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                          </span>
                          {inCart && <span style={{ fontSize: 10, color: '#fff', fontWeight: 700, background: C.primary, padding: '1px 5px', borderRadius: 4 }}>+{inCart.cantidad}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista carrito desktop */}
        <div style={{ background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 10 }}>
          {carrito.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><ShoppingBag size={28} color={C.textLight} /></div>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 4 }}>Buscá un producto para empezar</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {suggestedRecent.map((p) => (
                  <button key={p.id} type='button' onClick={() => agregarProd(p)} style={{ height: 32, padding: '0 10px', borderRadius: 16, border: `1px solid ${C.border}`, background: '#fff', fontSize: 11, fontWeight: 700, color: C.textDark }}>
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ borderTop: `1px solid ${C.border}` }}>
              {carrito.map((item, idx) => {
                const prod = getProd(item.productoId)
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 16px',
                    borderBottom: idx < carrito.length - 1 ? `1px solid ${C.border}` : 'none',
                    background: C.bg,
                    animation: item.id === recentlyAddedId ? 'av-added .28s ease-out' : 'none',
                  }}>
                    <div style={{ flex: '1 1 0', minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.textDark, fontFamily: "'Inter',sans-serif", lineHeight: 1.3 }}>{item.nombre}</div>
                      {item.codigo && <div style={{ fontSize: 11, color: C.textMid, marginTop: 1 }}>SKU: {item.codigo.replace(/^[Pp][Rr][Oo][Dd][- ]+/, '')}</div>}
                    </div>
                    {prod?.variantes && prod.variantes.length > 0 && (
                      <select value={item.variante || ''} onChange={e => setVariante(item.id, e.target.value)}
                        style={{ height: 32, padding: '0 28px 0 10px', fontSize: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.textDark, outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 110 }}>
                        {prod.variantes.split(',').map(v => <option key={v.trim()} value={v.trim()}>{v.trim()}</option>)}
                      </select>
                    )}
                    <input type="number" value={item.precio} onChange={e => setPrecio(item.id, e.target.value)} min="0"
                      style={{ width: 82, height: 32, padding: '0 8px', fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: 8, background: '#f9fafb', color: C.textDark, outline: 'none', textAlign: 'right', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = C.borderFocus; e.target.style.background = '#fff' }}
                      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = '#f9fafb' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => cambiarCant(item.id, -1)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}><Minus size={12} color={C.textDark} /></button>
                      <input type="number" value={item.cantidad} onChange={e => setCant(item.id, e.target.value)} min="1"
                        style={{ width: 42, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 700, border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff', color: C.textDark, outline: 'none', boxSizing: 'border-box' }} />
                      <button onClick={() => cambiarCant(item.id, 1)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}><Plus size={12} color={C.textDark} /></button>
                    </div>
                    <div style={{ minWidth: 82, textAlign: 'right', fontSize: 14, fontWeight: 700, color: C.textDark, flexShrink: 0 }}>
                      {fMon(item.precio * item.cantidad)}
                    </div>
                    <button onClick={() => quitarItem(item.id)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.background = C.dangerSurf} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Trash2 size={14} color={C.danger} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CARD 2 – Cliente + Método de pago desktop */}
        <div style={{ background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 10 }}>
          <div className="pv-form-grid" style={{ marginBottom: 8 }}>
            <div ref={cliRef} style={{ position: 'relative' }}>
              <Label>Cliente</Label>
              {clienteActivo && showClientSearch ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><User size={14} color={C.textMid} /></div>
                    <input autoFocus type="text" value={busCliente}
                      onChange={e => { setBusCliente(e.target.value); setDropCliente(true); if (!e.target.value) { setClienteId(''); setClienteNombre('') } }}
                      placeholder="Buscar cliente..."
                      style={{ width: '100%', height: 36, padding: '0 10px 0 28px', fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, background: C.bg, color: C.textDark, fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = C.borderFocus; setDropCliente(true) }}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                    {dropCliente && clientesFilt.length > 0 && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, boxShadow: '0 4px 16px rgba(0,0,0,.1)', maxHeight: 200, overflowY: 'auto' }}>
                        {clientesFilt.slice(0, 8).map(c => (
                          <div key={c.id} onMouseDown={() => selCliente(c)}
                            style={{ padding: '9px 12px', fontSize: 13, color: C.textDark, cursor: 'pointer', borderBottom: `1px solid #f3f4f6` }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontWeight: 500 }}>{c.nombre}</span>
                            {c.telefono && <span style={{ fontSize: 11, color: C.textMid, marginLeft: 8 }}>{c.telefono}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { setClienteActivo(false); setShowClientSearch(false); setClienteId(''); setClienteNombre(''); setBusCliente('') }}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => { setClienteActivo(true); setShowClientSearch(true) }}
                  style={{ width: '100%', height: 36, padding: '0 12px', fontSize: 13, fontWeight: 600, border: `1.5px ${clienteId ? 'solid' : 'dashed'} ${clienteId ? C.primary : C.border}`, borderRadius: 9, background: clienteId ? '#f8fdf9' : 'transparent', color: clienteId ? C.primary : C.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', transition: 'all .12s' }}>
                  {clienteId ? (
                    <><span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clienteNombre}</span>
                      <span onClick={e => { e.stopPropagation(); setClienteActivo(false); setShowClientSearch(false); setClienteId(''); setClienteNombre(''); setBusCliente('') }} style={{ flexShrink: 0, marginLeft: 8, display: 'flex', alignItems: 'center', opacity: .6 }}><X size={13} /></span></>
                  ) : (
                    <>+ Consumidor Final <span style={{ fontWeight: 400, opacity: .6, marginLeft: 4 }}>(default)</span></>
                  )}
                </button>
              )}
            </div>
            <div>
              <Label>Método de pago</Label>
              <Select value={metodoPago} onValueChange={v => { setMetodoPago(v); try { localStorage.setItem('gestify_metodo_pago', v) } catch { } }}>
                <SelectTrigger className="w-full h-9 text-sm focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white rounded-[9px]">
                  <SelectValue placeholder="Método..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {METODOS_PAGO.map(m => <SelectItem key={m.val} value={m.val}>{m.lbl}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div style={{ marginBottom: showOpcionales ? 10 : 0 }}>
            <button type="button" onClick={() => setShowOpcionales(v => !v)}
              style={{ background: 'none', border: 'none', color: C.textMid, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, transition: 'color .1s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.textDark}
              onMouseLeave={e => e.currentTarget.style.color = C.textMid}
            >
              {showOpcionales ? '− Ocultar notas, canal y fechas' : '+ agregar nota / fecha / canal / estado'}
            </button>
          </div>

          {showOpcionales && (
            <>
              <div className="pv-form-grid" style={{ paddingTop: 8, borderTop: `1px solid ${C.borderLight}` }}>
                <div ref={fechaPedidoRef} style={{ position: 'relative' }}>
                  <Label>Fecha del pedido</Label>
                  <button type="button" onClick={() => { setPedidoViewDate(new Date(fechaPedido + 'T12:00:00')); setFechaPedidoPicker(v => !v) }}
                    style={{ width: '100%', height: 32, display: 'flex', alignItems: 'center', gap: 7, padding: '0 10px', fontSize: 12, border: `1.5px solid ${C.borderFocus}`, borderRadius: 7, background: C.bg, color: C.textDark, cursor: 'pointer', boxSizing: 'border-box' }}>
                    <Calendar size={13} color={C.primary} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{new Date(fechaPedido + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    <ChevronDown size={12} color={C.textLight} style={{ flexShrink: 0 }} />
                  </button>
                  {fechaPedidoPicker && (
                    <div className="pv-dp-wrap">
                      <div className="pv-dp-header">
                        <button type="button" className="pv-dp-nav" onClick={() => setPedidoViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
                        <span className="pv-dp-title">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][pedidoViewDate.getMonth()]} {pedidoViewDate.getFullYear()}</span>
                        <button type="button" className="pv-dp-nav" onClick={() => setPedidoViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="pv-dp-grid">
                        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => <div key={d} className="pv-dp-lbl">{d}</div>)}
                        {(() => {
                          const yr = pedidoViewDate.getFullYear(), mo = pedidoViewDate.getMonth()
                          const firstDay = new Date(yr, mo, 1).getDay()
                          const daysInMo = new Date(yr, mo + 1, 0).getDate()
                          const todayD = new Date()
                          const cells = []
                          for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />)
                          for (let d = 1; d <= daysInMo; d++) {
                            const ds = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                            const isSel = fechaPedido === ds
                            const isTod = todayD.getFullYear() === yr && todayD.getMonth() === mo && todayD.getDate() === d
                            cells.push(<button key={d} type="button" className={`pv-dp-day${isSel ? ' sel' : ''}${isTod ? ' tod' : ''}`} onClick={() => { setFechaPedido(ds); setFechaPedidoPicker(false) }}>{d}</button>)
                          }
                          return cells
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                <div ref={fechaEntregaRef} style={{ position: 'relative' }}>
                  <Label>Fecha de entrega <span style={{ fontWeight: 400, color: C.textLight }}>(opcional)</span></Label>
                  <button type="button" onClick={() => { setPickerViewDate(fechaEntrega ? new Date(fechaEntrega + 'T12:00:00') : new Date()); setFechaEntregaPicker(v => !v) }}
                    style={{ width: '100%', height: 32, display: 'flex', alignItems: 'center', gap: 7, padding: '0 10px', fontSize: 12, border: `1.5px solid ${fechaEntrega ? C.borderFocus : C.border}`, borderRadius: 7, background: C.bg, color: fechaEntrega ? C.textDark : C.textLight, cursor: 'pointer', boxSizing: 'border-box' }}>
                    <Calendar size={13} color={fechaEntrega ? C.primary : C.textLight} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{fechaEntrega ? new Date(fechaEntrega + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sin fecha...'}</span>
                    {fechaEntrega ? <span onMouseDown={e => { e.stopPropagation(); setFechaEntrega(''); setFechaEntregaPicker(false) }} style={{ color: C.textLight, fontSize: 16, lineHeight: 1, cursor: 'pointer', flexShrink: 0, padding: '0 2px' }}>×</span> : <ChevronDown size={12} color={C.textLight} style={{ flexShrink: 0 }} />}
                  </button>
                  {fechaEntregaPicker && (
                    <div className="pv-dp-wrap">
                      <div className="pv-dp-header">
                        <button type="button" className="pv-dp-nav" onClick={() => setPickerViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
                        <span className="pv-dp-title">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][pickerViewDate.getMonth()]} {pickerViewDate.getFullYear()}</span>
                        <button type="button" className="pv-dp-nav" onClick={() => setPickerViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="pv-dp-grid">
                        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => <div key={d} className="pv-dp-lbl">{d}</div>)}
                        {(() => {
                          const yr = pickerViewDate.getFullYear(), mo = pickerViewDate.getMonth()
                          const firstDay = new Date(yr, mo, 1).getDay()
                          const daysInMo = new Date(yr, mo + 1, 0).getDate()
                          const todayD = new Date()
                          const cells = []
                          for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />)
                          for (let d = 1; d <= daysInMo; d++) {
                            const ds = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                            const isSel = fechaEntrega === ds
                            const isTod = todayD.getFullYear() === yr && todayD.getMonth() === mo && todayD.getDate() === d
                            cells.push(<button key={d} type="button" className={`pv-dp-day${isSel ? ' sel' : ''}${isTod ? ' tod' : ''}`} onClick={() => { setFechaEntrega(ds); setFechaEntregaPicker(false) }}>{d}</button>)
                          }
                          return cells
                        })()}
                      </div>
                      {fechaEntrega && (
                        <div className="pv-dp-footer">
                          <button type="button" className="pv-dp-clear" onClick={() => { setFechaEntrega(''); setFechaEntregaPicker(false) }}>Limpiar fecha</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Estado</Label>
                  <Select value={estado} onValueChange={v => { setEstado(v); try { localStorage.setItem('gestify_pedido_estado', v) } catch { } }}>
                    <SelectTrigger className="pv-select-trigger w-full h-8 text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
                      <SelectValue placeholder="Estado..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ESTADOS_PEDIDO.map(e => <SelectItem key={e.val} value={e.val}>{e.lbl}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Canal de venta <span style={{ fontWeight: 400, color: C.textLight }}>(opcional)</span></Label>
                  <Select value={canalVenta} onValueChange={setCanalVenta}>
                    <SelectTrigger className="pv-select-trigger w-full h-8 text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
                      <SelectValue placeholder="CANAL" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", zIndex: 10000, color: "#000", minWidth: 160 }}>
                      <SelectGroup>
                        <SelectItem value="">CANAL</SelectItem>
                        {canales.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div style={{ marginTop: 8 }}>
                <Label>Notas (opcional)</Label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2} placeholder="Observaciones..."
                  style={{ width: '100%', padding: '8px 10px', fontSize: 12, border: `1.5px solid ${C.border}`, borderRadius: 7, background: C.bg, color: C.textDark, resize: 'none', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box', minHeight: 50 }}
                  onFocus={e => e.target.style.borderColor = C.borderFocus}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            </>
          )}
        </div>

        {/* CARD 3 – Total + Botón guardar desktop */}
        <div style={{ background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`, padding: '10px clamp(8px, 1vw, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: 'clamp(6px, 1vw, 16px)', overflowX: 'auto', scrollbarWidth: 'none', maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 8px)', flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: C.textMid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
            <div style={{ fontSize: 'clamp(16px, 3vw, 24px)', fontWeight: 900, color: C.textBlack, letterSpacing: '-0.5px' }}>{fMon(total)}</div>
          </div>
          <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }}></div>
          {total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px', gap: 'clamp(2px, 0.5vw, 4px)', flexShrink: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: C.textMid, fontWeight: 700, textTransform: 'uppercase', padding: '0 4px' }}>Cobro</div>
              <input type="number" value={adelanto} onChange={e => setAdelanto(e.target.value)} placeholder="0"
                style={{ width: (adelanto && adelanto !== '0') ? 'clamp(90px, 12vw, 140px)' : 'clamp(50px, 8vw, 85px)', height: 32, padding: '0 6px', fontSize: 13, fontWeight: 800, textAlign: 'center', border: `1px solid #d1d5db`, borderRadius: 6, background: 'white', color: C.textBlack, outline: 'none', minWidth: 0 }}
                onFocus={e => e.target.style.borderColor = C.primary}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
              {(!adelanto || adelanto === '0') ? (
                <>
                  <button onClick={() => setAdelanto(total > 0 ? String(Math.round(total / 2)) : '0')} type="button" style={{ height: 32, padding: '0 clamp(4px, 1vw, 10px)', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `1px solid #d1d5db`, background: '#fff', color: C.textMid, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>50% <span style={{ fontSize: 9, opacity: 0.6 }}>F5</span></button>
                  <button onClick={() => setAdelanto(String(total))} type="button" style={{ height: 32, padding: '0 clamp(4px, 1vw, 10px)', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: `none`, background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>Total <span style={{ fontSize: 9, opacity: 0.6 }}>Shift</span></button>
                </>
              ) : (
                <button onClick={() => setAdelanto('0')} type="button" style={{ height: 32, width: 32, borderRadius: 6, cursor: 'pointer', border: `none`, background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={14} strokeWidth={3} /></button>
              )}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {adelantoNum > 0 && saldo > 0 && (
              <span style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#b45309', fontWeight: 800, background: '#fffbeb', padding: '0 clamp(6px, 1vw, 12px)', height: 32, display: 'flex', alignItems: 'center', borderRadius: 8, border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
                <span style={{ marginRight: 4 }}>Falta:</span> {fMon(saldo)}
              </span>
            )}
            {adelantoNum >= total && total > 0 && (
              <span style={{ fontSize: 11, color: C.success, fontWeight: 800, background: '#f0fdf4', padding: '0 clamp(6px, 1vw, 14px)', height: 32, display: 'flex', alignItems: 'center', borderRadius: 8, border: `1px solid ${C.successBord}`, gap: 4 }}>
                <CheckCircle size={14} strokeWidth={3} /><span>Pagado</span>
              </span>
            )}
          </div>
          <BtnPrimary onClick={handleGuardar} disabled={!puedeGuardar} loading={isProcessing} ref={guardarRef} style={{ height: 46, opacity: total <= 0 ? 0.45 : 1, background: total > 0 ? '#1a5c45' : C.textLight, padding: '0 clamp(10px, 1.5vw, 20px)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 8px)', flexShrink: 0 }}>
            <Save size={16} />
            <span style={{ fontWeight: 700, fontSize: 12 }}>{pedidoAEditar ? 'Actualizar Venta' : 'Crear Venta'}</span>
            <span style={{ padding: "3px 4px", background: "rgba(0,0,0,0.15)", borderRadius: 4, fontSize: 9, fontWeight: 800 }}>Enter</span>
          </BtnPrimary>
        </div>

        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: C.textMid, display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 15, opacity: 0.7 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={11} color={C.textMid} /> <b>Enter</b>: 1° prod</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Banknote size={11} color={C.textMid} /> <b>Shift</b>: Saldo</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Save size={11} color={C.textMid} /> <b>F2</b>/<b>Ctrl+Enter</b>: Guardar</span>
        </div>
      </div>{/* fin desktop content */}


      {/* ══════════════════════════════════════
          LAYOUT MOBILE (completamente rediseñado)
          Estilo AgregarVentaPOS: tarjetas separadas,
          grid 1fr/auto/1fr, footer fijo
      ══════════════════════════════════════ */}
      <div className="pv-mobile-content" style={{ display: 'none', flexDirection: 'column', gap: 10, padding: '12px 14px 100px' }}>

        {/* ── CARD M1: Buscador ── */}
        <div style={{ background: M.bg, borderRadius: 12, border: `1px solid ${M.border}`, overflow: 'visible' }}>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>
                Agregar producto
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { waitingNewCliente.current = true; openModal?.('nuevo-cliente') }}
                  style={{ height: 32, padding: '0 10px', borderRadius: 8, border: `1px solid ${M.border}`, background: M.bg, color: M.text, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                  <UserPlus size={12} /> Cliente
                </button>
                <button onClick={() => { waitingNewProd.current = true; openModal?.('nuevo-producto') }}
                  style={{ height: 32, padding: '0 10px', borderRadius: 8, border: `1px solid ${M.border}`, background: M.bg, color: M.text, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                  <PackagePlus size={12} /> Producto
                </button>
              </div>
            </div>

            {/* Input búsqueda */}
            <div style={{ position: 'relative' }}>
              <Search size={17} color={M.textLight} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                ref={busProductoRef}
                type="text"
                placeholder="Buscar por nombre o código..."
                value={busProducto}
                onChange={e => { setBusProducto(e.target.value); setDropProducto(true); setProdIdx(-1) }}
                onFocus={e => { setDropProducto(true); e.target.style.borderColor = M.borderFocus; e.target.style.background = M.bg; e.target.style.boxShadow = `0 0 0 3px ${M.primaryLight}` }}
                onKeyDown={e => {
                  if (!dropProducto || productosFilt.length === 0) return
                  if (e.key === 'ArrowDown') { e.preventDefault(); setProdIdx(i => Math.min(i + 1, productosFilt.length - 1)) }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setProdIdx(i => Math.max(i - 1, -1)) }
                  else if (e.key === 'Enter') {
                    e.preventDefault()
                    if (prodIdx >= 0) agregarProd(productosFilt[prodIdx])
                    else if (productosFilt.length === 1) agregarProd(productosFilt[0])
                  }
                  else if (e.key === 'Escape') { setDropProducto(false); setProdIdx(-1) }
                }}
                style={{
                  width: '100%', height: 50, padding: '0 40px 0 44px', fontSize: 16,
                  border: `1.5px solid ${M.border}`, borderRadius: 10,
                  outline: 'none', background: M.surface, color: M.text,
                  fontFamily: "'Inter',sans-serif", boxSizing: 'border-box',
                }}
                onBlur={e => { e.target.style.borderColor = M.border; e.target.style.background = M.surface; e.target.style.boxShadow = 'none' }}
              />
              {busProducto && (
                <button onClick={() => { setBusProducto(''); setDropProducto(false); busProductoRef.current?.focus() }}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}>
                  <X size={15} color={M.textLight} />
                </button>
              )}
            </div>

            {/* Resultados */}
            {dropProducto && busProducto && productosFilt.length > 0 && (
              <div ref={dropProdRef} style={{
                marginTop: 6, border: `1px solid ${M.border}`, borderRadius: 10,
                background: M.bg, boxShadow: '0 4px 12px rgba(0,0,0,.10)', maxHeight: 280, overflowY: 'auto',
              }}>
                {productosFilt.slice(0, 10).map((p, idx) => {
                  const inCart = carrito.find(i => i.productoId === p.id)
                  const isHl = idx === prodIdx
                  const stk = stockText(p)
                  return (
                    <div key={p.id} data-pidx={idx}
                      onMouseDown={() => agregarProd(p)}
                      onMouseEnter={() => setProdIdx(idx)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', cursor: 'pointer', gap: 10,
                        borderBottom: `1px solid #f3f4f6`,
                        background: isHl ? M.primaryLight : 'transparent',
                        borderLeft: `3px solid ${isHl ? M.primary : 'transparent'}`,
                        transition: 'background .08s',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: isHl ? 700 : 600, color: isHl ? M.primary : M.text, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                        <div style={{ fontSize: 11, color: M.textMid, marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                          {p.codigo && <span>{p.codigo.replace(/^[Pp][Rr][Oo][Dd][- ]+/, '')}</span>}
                          <span style={{ color: stk.color, fontWeight: 700 }}>{stk.label}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isHl ? M.primary : M.text }}>{fMonShort(p.precio || 0)}</span>
                        {inCart && <span style={{ fontSize: 10, color: '#fff', fontWeight: 800, background: M.primary, padding: '2px 6px', borderRadius: 4 }}>×{inCart.cantidad}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {dropProducto && busProducto && productosFilt.length === 0 && (
              <div style={{ marginTop: 6, padding: '12px 14px', textAlign: 'center', color: M.textMid, fontSize: 13, border: `1px solid ${M.border}`, borderRadius: 10, background: M.surface }}>
                No se encontraron productos
              </div>
            )}
          </div>
        </div>

        {/* ── CARD M2: Carrito ── */}
        <div style={{ background: M.bg, borderRadius: 12, border: `1px solid ${M.border}`, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 0' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>
              Productos ({carrito.length})
            </span>
            {carrito.length > 0 && (
              <button onClick={() => setCarrito([])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: M.danger, padding: 0, fontFamily: "'Inter',sans-serif" }}>
                Vaciar
              </button>
            )}
          </div>

          {carrito.length === 0 ? (
            <div style={{ padding: '20px 14px', textAlign: 'center' }}>
              <ShoppingBag size={32} color={M.textLight} style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ margin: '0 0 8px', fontSize: 13, color: M.textMid, fontFamily: "'Inter',sans-serif" }}>Buscá un producto para agregar</p>
              {suggestedRecent.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
                  {suggestedRecent.map(p => (
                    <button key={p.id} onClick={() => agregarProd(p)} style={{
                      height: 32, padding: '0 12px', borderRadius: 20,
                      border: `1px solid ${M.border}`, background: M.bg,
                      fontSize: 11, fontWeight: 700, color: M.text, cursor: 'pointer',
                      fontFamily: "'Inter',sans-serif", maxWidth: 160,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{p.nombre}</button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>
              {carrito.map((item, idx) => {
                const prod = getProd(item.productoId)
                return (
                  <div key={item.id} style={{
                    padding: '10px 12px',
                    borderBottom: idx < carrito.length - 1 ? `1px solid ${M.border}` : 'none',
                    background: M.bg,
                    animation: item.id === recentlyAddedId ? 'm-slideIn .22s ease-out' : 'none',
                  }}>
                    {/* Fila nombre + eliminar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: M.text, lineHeight: 1.3, fontFamily: "'Inter',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.nombre}
                        </div>
                        {item.codigo && <div style={{ fontSize: 10, color: M.textLight, marginTop: 1, fontFamily: "'Inter',sans-serif" }}>{item.codigo.replace(/^[Pp][Rr][Oo][Dd][- ]+/, '')}</div>}
                      </div>
                      <button onClick={() => quitarItem(item.id)} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: M.dangerBg, color: M.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Variante (si aplica) */}
                    {prod?.variantes && prod.variantes.length > 0 && (
                      <select value={item.variante || ''} onChange={e => setVariante(item.id, e.target.value)}
                        style={{ width: '100%', height: 32, padding: '0 8px', fontSize: 12, border: `1px solid ${M.border}`, borderRadius: 8, background: M.surface, color: M.text, marginBottom: 8, fontFamily: "'Inter',sans-serif", outline: 'none' }}>
                        {prod.variantes.split(',').map(v => <option key={v.trim()} value={v.trim()}>{v.trim()}</option>)}
                      </select>
                    )}

                    {/* Grid 1fr / auto / 1fr — Precio · Cant · Subtotal */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(74px, 0.85fr) auto minmax(96px, 1.15fr)', alignItems: 'end', gap: 6 }}>
                      {/* Precio */}
                      <div>
                        <div style={{ fontSize: 9, color: M.textLight, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3, fontFamily: "'Inter',sans-serif", textTransform: 'uppercase' }}>Precio</div>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: M.textMid, pointerEvents: 'none', fontFamily: "'Inter',sans-serif" }}>$</span>
                          <input type="number" value={cleanNumberValue(item.precio)} onChange={e => setPrecio(item.id, e.target.value)} min="0"
                            style={{ width: '100%', maxWidth: 92, height: 34, padding: '0 6px 0 16px', fontSize: 13, fontWeight: 700, border: `1px solid ${M.border}`, borderRadius: 8, background: M.surface, color: M.text, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }}
                            onFocus={e => { e.target.style.borderColor = M.borderFocus; e.target.style.background = M.bg }}
                            onBlur={e => { e.target.style.borderColor = M.border; e.target.style.background = M.surface }}
                          />
                        </div>
                      </div>

                      {/* Cantidad stepper */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: 9, color: M.textLight, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3, fontFamily: "'Inter',sans-serif", textTransform: 'uppercase' }}>Cant.</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <button onClick={() => cambiarCant(item.id, -1)} style={{ width: 30, height: 34, borderRadius: 8, border: `1px solid ${M.border}`, background: M.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={11} color={M.text} /></button>
                          <input type="number" value={item.cantidad} onChange={e => setCant(item.id, e.target.value)} min="1"
                            style={{ width: 38, height: 34, textAlign: 'center', fontSize: 14, fontWeight: 800, border: `1px solid ${M.border}`, borderRadius: 8, background: M.bg, color: M.text, outline: 'none', fontFamily: "'Inter',sans-serif" }} />
                          <button onClick={() => cambiarCant(item.id, 1)} style={{ width: 30, height: 34, borderRadius: 8, border: `1px solid ${M.border}`, background: M.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={11} color={M.text} /></button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: M.textLight, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3, fontFamily: "'Inter',sans-serif", textTransform: 'uppercase' }}>Subtotal</div>
                        <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 13, fontWeight: 900, color: M.primary, fontFamily: "'Inter',sans-serif", letterSpacing: '-0.3px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fMon(item.precio * item.cantidad)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── CARD M3: Cliente ── */}
        <div style={{ background: M.bg, borderRadius: 12, border: `1px solid ${M.border}` }}>
          <div style={{ padding: '14px 14px 0' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>Cliente</span>
          </div>
          <div ref={cliRef} style={{ padding: '10px 14px', position: 'relative' }}>
            {showClientSearch ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <User size={14} color={M.textMid} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input autoFocus type="text" value={busCliente}
                    onChange={e => { setBusCliente(e.target.value); setDropCliente(true); if (!e.target.value) { setClienteId(''); setClienteNombre('') } }}
                    placeholder="Buscar cliente..."
                    style={{ width: '100%', height: 44, padding: '0 12px 0 32px', fontSize: 14, border: `1.5px solid ${M.borderFocus}`, borderRadius: 9, background: M.bg, color: M.text, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }}
                    onFocus={() => setDropCliente(true)}
                  />
                  {dropCliente && clientesFilt.length > 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200, background: M.bg, border: `1px solid ${M.border}`, borderRadius: 9, boxShadow: '0 4px 12px rgba(0,0,0,.1)', maxHeight: 200, overflowY: 'auto' }}>
                      {clientesFilt.slice(0, 8).map(c => (
                        <div key={c.id} onMouseDown={() => selCliente(c)}
                          style={{ padding: '10px 14px', fontSize: 14, color: M.text, cursor: 'pointer', borderBottom: `1px solid #f3f4f6`, fontFamily: "'Inter',sans-serif" }}
                          onMouseEnter={e => e.currentTarget.style.background = M.surface}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                          {c.telefono && <div style={{ fontSize: 12, color: M.textMid }}>{c.telefono}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => { setShowClientSearch(false); setClienteId(''); setClienteNombre(''); setBusCliente('') }}
                  style={{ width: 44, height: 44, borderRadius: 9, border: `1px solid ${M.border}`, background: M.bg, color: M.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowClientSearch(true)}
                style={{
                  width: '100%', height: 48, padding: '0 14px', fontSize: 14,
                  border: `1.5px ${clienteId ? 'solid' : 'dashed'} ${clienteId ? M.primary : M.border}`,
                  borderRadius: 10,
                  background: clienteId ? M.primaryLight : 'transparent',
                  color: clienteId ? M.primary : M.textMid, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: "'Inter',sans-serif", fontWeight: 600,
                  transition: 'all .12s',
                }}
              >
                <User size={16} color={clienteId ? M.primary : M.textLight} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {clienteId ? clienteNombre : 'Consumidor Final (tocá para cambiar)'}
                </span>
                {clienteId && (
                  <span onClick={e => { e.stopPropagation(); setClienteId(''); setClienteNombre(''); setBusCliente(''); setShowClientSearch(false) }} style={{ color: M.textLight, display: 'flex' }}>
                    <X size={14} />
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── CARD M4: Método de pago ── */}
        <div style={{ background: M.bg, borderRadius: 12, border: `1px solid ${M.border}`, padding: '14px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", display: 'block', marginBottom: 10 }}>Método de pago</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {METODOS_PAGO.map(m => {
              const sel = metodoPago === m.val
              return (
                <button key={m.val} onClick={() => { setMetodoPago(m.val); try { localStorage.setItem('gestify_metodo_pago', m.val) } catch { } }}
                  style={{
                    height: 44, padding: '0 12px', borderRadius: 10,
                    border: `1.5px solid ${sel ? M.primary : M.border}`,
                    background: sel ? M.primaryLight : M.bg,
                    color: sel ? M.primary : M.textMid,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Inter',sans-serif", transition: 'all .12s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {m.lbl}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── CARD M5: Adelanto ── */}
        {total > 0 && (
          <div style={{ background: M.bg, borderRadius: 12, border: `1px solid ${M.border}`, padding: '14px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", display: 'block', marginBottom: 10 }}>Cobro / Adelanto</span>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: M.textMid, pointerEvents: 'none', fontFamily: "'Inter',sans-serif" }}>$</span>
                <input type="number" value={adelanto} onChange={e => setAdelanto(e.target.value)} placeholder="0.00"
                  style={{ width: '100%', height: 48, padding: '0 12px 0 28px', fontSize: 18, fontWeight: 800, border: `1.5px solid ${M.border}`, borderRadius: 10, background: M.surface, color: M.text, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = M.borderFocus; e.target.style.background = M.bg }}
                  onBlur={e => { e.target.style.borderColor = M.border; e.target.style.background = M.surface }}
                />
              </div>
              {(adelanto && adelanto !== '0') && (
                <button onClick={() => setAdelanto('')} style={{ width: 48, height: 48, borderRadius: 10, border: 'none', background: M.dangerBg, color: M.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['25%', 0.25], ['50%', 0.5], ['75%', 0.75], ['Total', 1]].map(([lbl, pct]) => (
                <button key={lbl} onClick={() => setAdelanto(String(Math.round(total * pct)))}
                  style={{
                    flex: 1, height: 36, borderRadius: 8,
                    border: `1px solid ${lbl === 'Total' ? 'transparent' : M.border}`,
                    background: lbl === 'Total' ? '#dcfce7' : M.bg,
                    color: lbl === 'Total' ? '#166534' : M.textMid,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
            {/* Resumen saldo */}
            {adelantoNum > 0 && (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 9, background: adelantoNum >= total ? M.successBg : M.warnBg, border: `1px solid ${adelantoNum >= total ? M.successBord : M.warnBord}` }}>
                {adelantoNum >= total ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color={M.success} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: M.success, fontFamily: "'Inter',sans-serif" }}>Pago completo</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: M.warning, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>Saldo pendiente</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: M.warning, fontFamily: "'Inter',sans-serif" }}>{fMon(saldo)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CARD M6: Datos opcionales ── */}
        <div style={{ background: M.bg, borderRadius: 12, border: `1px solid ${M.border}` }}>
          <button type="button" onClick={() => setShowOpcionales(v => !v)}
            style={{ width: '100%', padding: '14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>
              Detalles opcionales
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {estado !== 'pendiente' && (
                <span style={{ fontSize: 11, fontWeight: 700, color: estadoActual.color, background: estadoActual.bg, padding: '2px 8px', borderRadius: 4, fontFamily: "'Inter',sans-serif" }}>
                  {estadoActual.lbl}
                </span>
              )}
              <ChevronDown size={16} color={M.textMid} style={{ transform: showOpcionales ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </div>
          </button>

          {showOpcionales && (
            <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${M.border}` }}>
              {/* Estado */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.06em', marginBottom: 6, textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>Estado</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ESTADOS_PEDIDO.map(e => (
                    <button key={e.val} onClick={() => { setEstado(e.val); try { localStorage.setItem('gestify_pedido_estado', e.val) } catch { } }}
                      style={{
                        height: 34, padding: '0 12px', borderRadius: 8,
                        border: `1.5px solid ${estado === e.val ? e.color : M.border}`,
                        background: estado === e.val ? e.bg : M.bg,
                        color: estado === e.val ? e.color : M.textMid,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'Inter',sans-serif", transition: 'all .1s',
                      }}
                    >
                      {e.lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fechas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>Fecha pedido</div>
                  <input type="date" value={fechaPedido} onChange={e => setFechaPedido(e.target.value)}
                    style={{ width: '100%', height: 40, padding: '0 10px', fontSize: 13, border: `1.5px solid ${M.borderFocus}`, borderRadius: 9, background: M.bg, color: M.text, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>Entrega <span style={{ fontWeight: 400 }}>(opc.)</span></div>
                  <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
                    style={{ width: '100%', height: 40, padding: '0 10px', fontSize: 13, border: `1.5px solid ${fechaEntrega ? M.borderFocus : M.border}`, borderRadius: 9, background: M.bg, color: M.text, outline: 'none', fontFamily: "'Inter',sans-serif", boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Canal */}
              {canales.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>Canal de venta</div>
                  <select value={canalVenta} onChange={e => setCanalVenta(e.target.value)}
                    style={{ width: '100%', height: 40, padding: '0 10px', fontSize: 13, border: `1.5px solid ${canalVenta ? M.borderFocus : M.border}`, borderRadius: 9, background: M.bg, color: M.text, fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">Sin canal</option>
                    {canales.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Notas */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: M.textLight, letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>Notas</div>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} placeholder="Observaciones..."
                  style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: `1.5px solid ${M.border}`, borderRadius: 9, background: M.bg, color: M.text, resize: 'none', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = M.borderFocus}
                  onBlur={e => e.target.style.borderColor = M.border}
                />
              </div>
            </div>
          )}
        </div>
      </div>{/* fin mobile content */}


      {/* ══════════════════════════════════════
          FOOTER BAR MOBILE (fijo en la parte inferior)
      ══════════════════════════════════════ */}
      <div className="pv-mobile-footer" style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: M.bg, borderTop: `1px solid ${M.border}`,
        padding: '10px 16px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        alignItems: 'center', gap: 12,
        boxShadow: '0 -4px 16px rgba(0,0,0,.08)',
      }}>
        <div style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: M.textLight, letterSpacing: '0.06em', fontFamily: "'Inter',sans-serif" }}>TOTAL</div>
          <div style={{ fontSize: total >= 1000000 ? 18 : 22, fontWeight: 900, color: M.text, letterSpacing: '-0.5px', lineHeight: 1.1, fontFamily: "'Inter',sans-serif", minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fMon(total)}
          </div>
          {adelantoNum > 0 && saldo > 0 && (
            <div style={{ fontSize: 11, color: M.warning, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>Saldo: {fMon(saldo)}</div>
          )}
          {adelantoNum >= total && total > 0 && (
            <div style={{ fontSize: 11, color: M.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Inter',sans-serif" }}>
              <CheckCircle size={10} /> Pagado
            </div>
          )}
        </div>
        <button onClick={handleGuardar} disabled={!puedeGuardar || isProcessing}
          style={{
            minWidth: 142, height: 52, padding: '0 18px', borderRadius: 12,
            border: 'none', cursor: puedeGuardar ? 'pointer' : 'not-allowed',
            background: !puedeGuardar ? M.textLight : M.primary,
            color: '#fff', fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Inter',sans-serif", flexShrink: 0,
          }}
        >
          <Save size={16} />
          {isProcessing ? 'Guardando...' : pedidoAEditar ? 'Actualizar' : 'Crear Venta'}
        </button>
      </div>


      {/* ══════════════════════════════════════
          ESTILOS GLOBALES
      ══════════════════════════════════════ */}
      <style>{`
        /* ── Mostrar/ocultar según viewport ── */
        @media (max-width: 767px) {
          .pv-desktop-header  { display: none !important; }
          .pv-desktop-content { display: none !important; }
          .pv-mobile-header   { display: flex !important; }
          .pv-mobile-content  { display: flex !important; }
          .pv-mobile-footer   { display: flex !important; }
        }
        @media (min-width: 768px) {
          .pv-desktop-header  { display: block !important; }
          .pv-desktop-content { display: block !important; }
          .pv-mobile-header   { display: none !important; }
          .pv-mobile-content  { display: none !important; }
          .pv-mobile-footer   { display: none !important; }
        }

        /* ── Reset spin buttons ── */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }

        /* ── Desktop layout ── */
        .pv-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 540px) {
          .pv-form-grid { grid-template-columns: 1fr; }
        }

        .pv-content-pad {
          max-width: 860px;
          margin: 0 auto;
          padding: 8px 24px 16px;
        }
        @media (max-width: 600px) {
          .pv-content-pad { padding: 8px 12px 16px; }
        }

        /* ── Selects desktop ── */
        .pv-select-trigger { transition: all 0.2s ease; cursor: pointer; }
        .pv-select-trigger:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #9ca3af !important;
          transform: scale(1.01);
        }
        [role="option"] { transition: all 0.15s ease !important; cursor: pointer !important; }
        [role="option"]:hover, [role="option"][data-highlighted] {
          background-color: #f9fafb !important;
          color: #000 !important;
        }

        /* ── Date picker desktop ── */
        .pv-dp-wrap {
          position: absolute; top: calc(100% + 4px); left: 0; z-index: 500;
          background: #fff; border: 1px solid #d1d5db; border-radius: 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,.12); padding: 8px; width: 220px;
        }
        .pv-dp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .pv-dp-nav {
          width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
          background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;
          cursor: pointer; font-size: 15px; color: #374151;
        }
        .pv-dp-nav:hover { background: #f3f4f6; border-color: #9ca3af; }
        .pv-dp-title { font-size: 12px; font-weight: 700; color: #111827; }
        .pv-dp-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
        .pv-dp-lbl { text-align: center; font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; padding: 2px 0 4px; }
        .pv-dp-day {
          width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #374151;
          border: none; background: transparent; border-radius: 5px;
          cursor: pointer; transition: all .1s; padding: 0;
        }
        .pv-dp-day:hover { background: #f3f4f6; }
        .pv-dp-day.tod { font-weight: 800; color: #334139; }
        .pv-dp-day.sel { background: #334139 !important; color: #fff !important; font-weight: 700; }
        .pv-dp-footer { margin-top: 6px; padding-top: 6px; border-top: 1px solid #f3f4f6; display: flex; justify-content: center; }
        .pv-dp-clear { font-size: 11px; font-weight: 600; color: #9ca3af; background: none; border: none; cursor: pointer; }
        .pv-dp-clear:hover { color: #ef4444; }

        /* ── Scrollbar oculto ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>
    </div>
  )
}
