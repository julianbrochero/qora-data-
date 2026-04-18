/**
 * AgregarVentaNimbus.jsx — Diseño POS estilo TiendaNube
 * Misma lógica que AgregarVenta.jsx, UI completamente rediseñada
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { CheckCircle, CheckCircle2, TrendingUp, Search, Plus, Minus, Trash2, X, Save, Menu, User, ChevronDown, UserPlus, PackagePlus, AlertCircle, Calendar, Zap, Banknote } from 'lucide-react'
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
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

/* ══════════════════════════════════════════
   PALETA
══════════════════════════════════════════ */
const C = {
  pageBg:     "#f8f9fb",
  bg:         "#ffffff",
  border:     "#d1d5db",
  borderFocus:"#334139",
  borderLight:"#e5e7eb",
  primary:    "#334139",
  primaryHov: "#2b352f",
  primarySurf:"#eaf0eb",
  textBlack:  "#0d0d0d",
  textDark:   "#111827",
  textMid:    "#6b7280",
  textLight:  "#9ca3af",
  surface:    "#f9fafb",
  success:    "#16A34A", successSurf: "#F0FDF4", successBord: "#BBF7D0",
  warning:    "#D97706", warnSurf:    "#FFFBEB", warnBord:    "#FDE68A",
  danger:     "#DC2626", dangerSurf:  "#FEF2F2", dangerBord:  "#FECACA",
}

const fMon = n => '$\u00A0' + (parseFloat(n)||0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})
const PREF_KEY = 'gestify_pedido_cliente_activo'

const METODOS_PAGO = [
  { val:'efectivo',      lbl:'Efectivo'      },
  { val:'transferencia', lbl:'Transferencia'  },
  { val:'debito',        lbl:'Débito'         },
  { val:'credito',       lbl:'Crédito'        },
  { val:'mercadopago',   lbl:'Mercado Pago'   },
]

const ESTADOS_PEDIDO = [
  { val:'pendiente',  lbl:'Pendiente'  },
  { val:'preparando', lbl:'Preparando' },
  { val:'enviado',    lbl:'Enviado'    },
  { val:'entregado',  lbl:'Entregado'  },
]

/* ─── helpers visuales ─── */
const Label = ({children}) => (
  <div style={{fontSize:11,fontWeight:600,color:C.textMid,letterSpacing:'0.05em',marginBottom:3,fontFamily:"'Inter',sans-serif"}}>
    {children}
  </div>
)

const BtnPrimary = React.forwardRef(({children,onClick,disabled,loading}, ref) => {
  const [hov,setHov]=useState(false)
  return (
    <button ref={ref} onClick={onClick} disabled={disabled||loading}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:'inline-flex',alignItems:'center',gap:7,
        height:36, padding:'0 18px', borderRadius:6, border:'none',
        background:disabled ? C.textLight : hov ? C.primaryHov : C.primary,
        color:'#fff', fontSize:13, fontWeight:500,
        fontFamily:"'Inter',sans-serif", cursor:disabled?'not-allowed':'pointer',
        transition:'background 0.13s',
      }}
    >
      {loading ? 'Guardando...' : children}
    </button>
  )
})

const BtnGhost = ({children,onClick}) => {
  const [hov,setHov]=useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:'inline-flex',alignItems:'center',gap:6,
        height:32,padding:'0 18px',borderRadius:6,
        border:`1.5px solid ${hov?'#9ca3af':C.border}`,
        background:hov?'#f3f4f6':C.bg, color:C.textDark,
        fontSize:13, fontWeight:500,
        fontFamily:"'Inter',sans-serif", cursor:'pointer',
        transition:'all 0.12s',
      }}
    >{children}</button>
  )
}

/* ─── Badge stock ─── */
const StockBadge = ({prod}) => {
  if(!prod) return null
  if(!prod.controlaStock) return <span style={{fontSize:11,color:C.textMid}}>∞</span>
  const s = prod.stock || 0
  const color = s<=0 ? C.danger : s<=5 ? C.warning : C.success
  const bg    = s<=0 ? C.dangerSurf : s<=5 ? C.warnSurf : C.successSurf
  const bord  = s<=0 ? C.dangerBord : s<=5 ? C.warnBord : C.successBord
  return (
    <span style={{
      display:'inline-flex',alignItems:'center',
      padding:'2px 7px',borderRadius:4,fontSize:11,fontWeight:600,
      color,background:bg,border:`1px solid ${bord}`,
      fontFamily:"'Inter',sans-serif",whiteSpace:'nowrap',
    }}>{s}</span>
  )
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function AgregarVentaNimbus({
  clientes=[],
  productos=[],
  formActions,
  openModal,
  onOpenMobileSidebar,
  onVentaCreada,
  pedidoAEditar=null,
  productoParaAgregarAlCarrito=null,
}) {
  /* ── estado ── */
  const [clienteActivo, setClienteActivo] = useState(()=>{ try{return localStorage.getItem(PREF_KEY)!=='false'}catch{return true} })
  const [clienteId,     setClienteId]     = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [busCliente,    setBusCliente]    = useState('')
  const [dropCliente,   setDropCliente]   = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [showOpcionales, setShowOpcionales] = useState(false)
  const [busProducto,   setBusProducto]   = useState('')
  const [dropProducto,  setDropProducto]  = useState(false)
  const [carrito,       setCarrito]       = useState([])
  const [fechaPedido,   setFechaPedido]   = useState(new Date().toISOString().slice(0,10))
  const [fechaEntrega,  setFechaEntrega]  = useState('')
  const [estado,        setEstado]        = useState(()=>{ try{return localStorage.getItem('gestify_pedido_estado')||'pendiente'}catch{return 'pendiente'} })
  const [notas,         setNotas]         = useState('')
  const [adelanto,      setAdelanto]      = useState('')
  const [metodoPago,    setMetodoPago]    = useState(()=>{ try{return localStorage.getItem('gestify_metodo_pago')||'efectivo'}catch{return 'efectivo'} })
  const [canalVenta,    setCanalVenta]    = useState('')
  const [isProcessing,  setIsProcessing]  = useState(false)
  const [exito,         setExito]         = useState(null)
  const [toastMsg,           setToastMsg]          = useState(null)
  const [fechaEntregaPicker, setFechaEntregaPicker] = useState(false)
  const [pickerViewDate,     setPickerViewDate]     = useState(() => new Date())
  const [fechaPedidoPicker,  setFechaPedidoPicker]  = useState(false)
  const [pedidoViewDate,     setPedidoViewDate]     = useState(() => new Date())

  const busProductoRef    = useRef(null)
  const dropProdRef       = useRef(null)
  const cliRef            = useRef(null)
  const guardarRef        = useRef(null)
  const fechaEntregaRef   = useRef(null)
  const fechaPedidoRef    = useRef(null)
  const totalRef          = useRef(0)
  const prevClientesIds   = useRef(new Set(clientes.map(c => c.id)))
  const prevProductosIds  = useRef(new Set(productos.map(p => p.id)))
  const waitingNewCliente = useRef(false)
  const waitingNewProd    = useRef(false)
  const [prodIdx,       setProdIdx]      = useState(-1)

  /* ── auto-focus al montar ── */
  useEffect(()=>{ setTimeout(()=>busProductoRef.current?.focus(), 200) }, [])

  const canales = React.useMemo(()=>{ try{ const ls=localStorage.getItem('gestify_canales_venta'); if(ls) return JSON.parse(ls) }catch{} return [] },[])

  const showToast = (msg,type='error') => { setToastMsg({msg,type}); setTimeout(()=>setToastMsg(null),3500) }

  /* ── cargar pedido a editar ── */
  useEffect(()=>{
    if(!pedidoAEditar) return
    if(pedidoAEditar.cliente_id){ setClienteId(pedidoAEditar.cliente_id); setClienteNombre(pedidoAEditar.cliente_nombre||''); setBusCliente(pedidoAEditar.cliente_nombre||''); setShowClientSearch(true); }
    let arr=[]; try{ arr=typeof pedidoAEditar.items==='string'?JSON.parse(pedidoAEditar.items):(pedidoAEditar.items||[]) }catch{}
    setCarrito(arr.map((i,idx)=>({ id:Date.now()+idx, productoId:i.productoId||i.producto_id||null, nombre:i.producto||i.nombre||'', codigo:i.codigo||'', variante:i.variante||'', precio:parseFloat(i.precio)||0, costo:i.costo??'', cantidad:parseFloat(i.cantidad)||1 })))
    if(pedidoAEditar.fecha_pedido) setFechaPedido(pedidoAEditar.fecha_pedido.slice(0,10))
    if(pedidoAEditar.fecha_entrega_estimada) setFechaEntrega(pedidoAEditar.fecha_entrega_estimada.slice(0,10))
    if(pedidoAEditar.estado) setEstado(pedidoAEditar.estado)
    if(pedidoAEditar.notas) setNotas(pedidoAEditar.notas)
    if(pedidoAEditar.monto_abonado) setAdelanto(String(pedidoAEditar.monto_abonado))
    if(pedidoAEditar.canal_venta) setCanalVenta(pedidoAEditar.canal_venta)
  },[pedidoAEditar?.id])

  /* ── auto-selección cliente nuevo ── */
  useEffect(() => {
    if (waitingNewCliente.current) {
      const nuevo = clientes.find(c => !prevClientesIds.current.has(c.id))
      if (nuevo) { selCliente(nuevo); waitingNewCliente.current = false }
    }
    prevClientesIds.current = new Set(clientes.map(c => c.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientes])

  /* ── auto-agregar producto nuevo ── */
  useEffect(() => {
    if (waitingNewProd.current) {
      const nuevo = productos.find(p => !prevProductosIds.current.has(p.id))
      if (nuevo) { agregarProd(nuevo); waitingNewProd.current = false }
    }
    prevProductosIds.current = new Set(productos.map(p => p.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productos])

  /* ── cálculos ── */
  const total       = carrito.reduce((s,i)=>s+i.precio*i.cantidad,0)
  totalRef.current  = total
  const adelantoNum = parseFloat(adelanto)||0
  const saldo       = Math.max(0,total-adelantoNum)
  const puedeGuardar = carrito.length>0 && (clienteActivo?!!clienteId:true) && !isProcessing

  /* ── filtros ── */
  const clientesFilt  = clientes.filter(c=>c.nombre?.toLowerCase().includes(busCliente.toLowerCase())||c.telefono?.includes(busCliente))
  const productosFilt = productos.filter(p=>p.nombre?.toLowerCase().includes(busProducto.toLowerCase())||p.codigo?.toLowerCase().includes(busProducto.toLowerCase()))

  /* ── carrito ── */
  const agregarProd = p => {
    setCarrito(prev=>{
      const defecto = p.variantes ? p.variantes.split(',')[0].trim() : ''
      const ex = prev.find(i=>i.productoId===p.id && (i.variante||'') === defecto)
      if(ex) return prev.map(i=>i.productoId===p.id && (i.variante||'') === defecto ? {...i,cantidad:i.cantidad+1} : i)
      return [...prev,{id:Date.now(),productoId:p.id,nombre:p.nombre,codigo:p.codigo,precio:p.precio,costo:p.costo??'',cantidad:1,variante:defecto}]
    })
    setBusProducto(''); setDropProducto(false); setProdIdx(-1)
    setTimeout(()=>busProductoRef.current?.focus(),60)
  }

  useEffect(()=>{
    if(!productoParaAgregarAlCarrito) return
    agregarProd(productoParaAgregarAlCarrito)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[productoParaAgregarAlCarrito])

  const cambiarCant = (id,delta) => setCarrito(prev=>prev.map(i=>i.id===id?{...i,cantidad:Math.max(1,i.cantidad+delta)}:i))
  const setCant     = (id,val)   => setCarrito(prev=>prev.map(i=>i.id===id?{...i,cantidad:Math.max(1,parseFloat(val)||1)}:i))
  const setPrecio   = (id,val)   => setCarrito(prev=>prev.map(i=>i.id===id?{...i,precio:parseFloat(val)||0}:i))
  const setCosto    = (id,val)   => setCarrito(prev=>prev.map(i=>i.id===id?{...i,costo:val===''?'':parseFloat(val)||0}:i))
  const setVariante = (id,val)   => setCarrito(prev=>prev.map(i=>i.id===id?{...i,variante:val}:i))
  const quitarItem  = id          => setCarrito(prev=>prev.filter(i=>i.id!==id))

  const selCliente = c => { setClienteId(c.id); setClienteNombre(c.nombre); setBusCliente(c.nombre); setDropCliente(false); setShowClientSearch(false) }
  const limpiarTodo = () => { setClienteId(''); setClienteNombre(''); setBusCliente(''); setBusProducto(''); setCarrito([]); setFechaPedido(new Date().toISOString().slice(0,10)); setFechaEntrega(''); setEstado('pendiente'); setNotas(''); setAdelanto(''); setCanalVenta(''); setShowClientSearch(false); setShowOpcionales(false) }

  /* ── guardar ── */
  const handleGuardar = useCallback(async()=>{
    if(!puedeGuardar){ showToast('Agregá al menos un producto'); return }
    setIsProcessing(true)
    const items = carrito.map(i=>{
      const costoNum = (i.costo!==''&&i.costo!=null) ? parseFloat(i.costo) : null
      const ganancia = costoNum!=null ? (i.precio - costoNum) * i.cantidad : null
      return { id:i.id, productoId:i.productoId, producto:i.nombre, variante:(i.variante||''), precio:i.precio, cantidad:i.cantidad, subtotal:i.precio*i.cantidad, costo:costoNum, ganancia }
    })
    const final = { clienteId:clienteActivo?clienteId:null, clienteNombre:clienteActivo?clienteNombre:'Consumidor Final', fechaPedido, fechaEntrega:fechaEntrega||null, estado, notas, items, montoPagado:adelantoNum, total, canal_venta:canalVenta||null }
    try {
      let r
      if(pedidoAEditar?.id){
        r = await formActions?.actualizarPedido?.(pedidoAEditar.id,{ cliente_id:final.clienteId, cliente_nombre:final.clienteNombre, fecha_pedido:final.fechaPedido, fecha_entrega_estimada:final.fechaEntrega, estado:final.estado, notas:final.notas, items:JSON.stringify(final.items), monto_abonado:final.montoPagado, saldo_pendiente:Math.max(0,final.total-final.montoPagado), total:final.total })
      } else {
        r = await formActions?.agregarPedidoSolo?.({...final, canal_venta: canalVenta||null})
      }
      if(r?.success){ formActions?.recargarTodosLosDatos?.(); setExito(true); setTimeout(()=>{ setExito(null); limpiarTodo(); onVentaCreada?.() },900) }
      else showToast('Error: '+(r?.mensaje||'Desconocido'))
    } catch(e){ showToast('Error: '+e.message) }
    finally{ setIsProcessing(false) }
  },[carrito,clienteActivo,clienteId,clienteNombre,fechaPedido,fechaEntrega,estado,notas,adelantoNum,total,puedeGuardar,formActions,pedidoAEditar])

  /* ── atajos de teclado ── */
  useEffect(()=>{
    const onDown = e => {
      if(e.key === 'F2' || (e.ctrlKey && e.key==='Enter')){ e.preventDefault(); handleGuardar(); return }
      if(e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement
        if(active && !['INPUT','TEXTAREA','SELECT'].includes(active.tagName)){
          busProductoRef.current?.focus()
        }
      }
    }
    let shiftAlone = false
    const trackDown = e => {
      if(e.key === 'Shift') { shiftAlone = true }
      else { shiftAlone = false }
    }
    const trackUp = e => {
      if(e.key === 'Shift' && shiftAlone && totalRef.current > 0) {
        setAdelanto(String(totalRef.current))
      }
      if(e.key === 'Shift') shiftAlone = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keydown', trackDown)
    window.addEventListener('keyup',   trackUp)
    return ()=>{
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keydown', trackDown)
      window.removeEventListener('keyup',   trackUp)
    }
  },[handleGuardar])

  /* ── scroll item seleccionado en dropdown ── */
  useEffect(()=>{
    if(prodIdx < 0 || !dropProdRef.current) return
    const container = dropProdRef.current
    const el = container.querySelector(`[data-pidx="${prodIdx}"]`)
    if(!el) return
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    if(eRect.top < cRect.top)
      container.scrollTop -= cRect.top - eRect.top
    else if(eRect.bottom > cRect.bottom)
      container.scrollTop += eRect.bottom - cRect.bottom
  },[prodIdx])

  /* ── cerrar drops al hacer click fuera ── */
  useEffect(()=>{
    const h = e => {
      if(cliRef.current && !cliRef.current.contains(e.target)) setDropCliente(false)
      if(busProductoRef.current && !busProductoRef.current.closest?.('.pv-prod-wrap')?.contains(e.target)) setDropProducto(false)
      if(fechaEntregaRef.current && !fechaEntregaRef.current.contains(e.target)) setFechaEntregaPicker(false)
      if(fechaPedidoRef.current && !fechaPedidoRef.current.contains(e.target)) setFechaPedidoPicker(false)
    }
    document.addEventListener('mousedown',h)
    return ()=>document.removeEventListener('mousedown',h)
  },[])

  const getProd = (productoId) => productos.find(p=>p.id===productoId)

  return (
    <div style={{ minHeight:'100vh', background:C.pageBg, fontFamily:"'Inter',sans-serif" }}>
      <style>{`
        @keyframes av-fade-in  { from { opacity:0 } to { opacity:1 } }
        @keyframes av-slide-up { from { opacity:0; transform:translateY(16px) scale(.95) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes av-check    { 0% { transform:scale(0); opacity:0 } 55% { transform:scale(1.18) } 100% { transform:scale(1); opacity:1 } }
        @keyframes av-fade-out { 0% { opacity:1 } 70% { opacity:1 } 100% { opacity:0 } }
      `}</style>

      {/* ── Overlay de éxito ── */}
      {exito && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.3)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'av-fade-out .9s ease forwards',
        }}>
          <div style={{
            background:'#fff', borderRadius:20, padding:'44px 52px', textAlign:'center',
            boxShadow:'0 24px 64px rgba(0,0,0,0.22)',
            animation:'av-slide-up .18s cubic-bezier(.22,.97,.56,1)', minWidth:260,
          }}>
            <div style={{
              width:76, height:76, borderRadius:'50%',
              background:'#F0FDF4', border:'2.5px solid #86EFAC',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 18px',
              animation:'av-check .25s cubic-bezier(.22,.97,.56,1) .08s both',
            }}>
              <CheckCircle2 size={38} strokeWidth={2} style={{ color:'#16A34A' }}/>
            </div>
            <p style={{ margin:'0 0 4px', fontSize:20, fontWeight:800, color:'#111827', letterSpacing:'-0.3px' }}>
              {pedidoAEditar ? '¡Actualizada!' : '¡Venta creada!'}
            </p>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:9999, minWidth:280, maxWidth:360, boxShadow:'0 8px 24px rgba(0,0,0,.12)' }}>
          <Alert variant={toastMsg.type==='error' ? 'destructive' : 'success'} style={{ paddingRight:36 }}>
            {toastMsg.type==='error'
              ? <AlertCircle size={16} style={{ marginTop:1, color: '#DC2626' }}/>
              : <CheckCircle2 size={16} style={{ marginTop:1, color: '#16A34A' }}/>
            }
            <AlertDescription>{toastMsg.msg}</AlertDescription>
            <button onClick={()=>setToastMsg(null)} style={{position:'absolute',top:8,right:8,background:'none',border:'none',cursor:'pointer',opacity:.5,display:'flex',padding:2}}><X size={13}/></button>
          </Alert>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ background:C.bg }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 16px' }} className="pv-mobile">
          <button onClick={onOpenMobileSidebar} style={{background:'none',border:'none',cursor:'pointer',display:'flex'}}><MenuIcon size={20} color={C.textBlack}/></button>
          <span style={{fontWeight:700,fontSize:16,color:C.textBlack}}>{pedidoAEditar?'Editar Venta':'Agregar Venta'}</span>
        </div>
        <div style={{ maxWidth:860, margin:'0 auto', width:'100%', display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px 12px',gap:12,boxSizing:'border-box' }} className="pv-desktop">
          <div style={{display:'flex', alignItems:'center', gap: 24}}>
            <h1 style={{margin:0,fontSize:22,fontWeight:700,color:C.textBlack,letterSpacing:'-0.3px',borderRight:`1px solid ${C.borderLight}`,paddingRight:24}}>
              {pedidoAEditar ? `Editando · ${pedidoAEditar.codigo||''}` : 'Agregar Venta'}
            </h1>
            
            <Menubar style={{ border:'none', background:'transparent', padding:0, height:'auto' }}>
              <MenubarMenu>
                <MenubarTrigger style={{cursor:'pointer', fontWeight:600, color:C.textDark}}>Venta</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={() => window.location.reload()}>
                    Limpiar Pantalla (F5) <MenubarShortcut>F5</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => document.querySelector('.pv-cart-footer-save button')?.click()}>
                    Guardar Pedido <MenubarShortcut>Ctrl+Ent</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem style={{color: C.danger}} onClick={() => document.querySelector('.pv-cart-footer-save button')?.click()} disabled={true}>
                    Descartar Venta Actual
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger style={{cursor:'pointer', fontWeight:600, color:C.textDark}}>Cliente</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={() => document.querySelector('button[title="Nuevo cliente"]')?.click()}>
                    Crear Nuevo Cliente...
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => document.querySelector('button:contains("+ Consumidor Final")')?.click()}>
                    Usar Cliente Existente
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger style={{cursor:'pointer', fontWeight:600, color:C.textDark}}>Opciones</MenubarTrigger>
                <MenubarContent>
                  <MenubarGroup>
                    <MenubarItem onClick={() => {try{localStorage.setItem('gestify_metodo_pago','efectivo'); window.location.reload()}catch{}}}>Predefinir "Efectivo"</MenubarItem>
                    <MenubarItem onClick={() => {try{localStorage.setItem('gestify_metodo_pago','transferencia'); window.location.reload()}catch{}}}>Predefinir "Transferencia"</MenubarItem>
                  </MenubarGroup>
                  <MenubarSeparator />
                  <MenubarItem>Atajos de Teclado...</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {onVentaCreada && (
              <BtnGhost onClick={onVentaCreada}>
                <TrendingUp size={13}/> Ver Ventas
              </BtnGhost>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenido centrado ── */}
      <div className="pv-content-pad">

        {/* ┌─────────────────────────────────┐ */}
        {/* │   CARD: Productos + Detalles    │ */}
        {/* └─────────────────────────────────┘ */}
        <div style={{ background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden' }}>

          {/* ── Buscador de productos ── */}
          <div style={{padding:'12px 16px 10px',borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <h2 style={{margin:0,fontSize:13,fontWeight:700,color:C.textBlack}}>Productos</h2>
              <div style={{display:'flex',gap:5}}>
                <button title="Nuevo cliente" onClick={()=>{ waitingNewCliente.current=true; openModal?.('nuevo-cliente') }}
                  style={{display:'flex',alignItems:'center',gap:5,height:28,padding:'0 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:`1.5px solid ${C.border}`,background:C.bg,color:C.textMid,transition:'all .12s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid}}
                >
                  <UserPlus size={13}/> Cliente
                </button>
                <button title="Nuevo producto" onClick={()=>{ waitingNewProd.current=true; openModal?.('nuevo-producto') }}
                  style={{display:'flex',alignItems:'center',gap:5,height:28,padding:'0 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:`1.5px solid ${C.border}`,background:C.bg,color:C.textMid,transition:'all .12s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid}}
                >
                  <PackagePlus size={13}/> Producto
                </button>
              </div>
            </div>

            <div className="pv-prod-wrap" style={{position:'relative'}}>
              <div style={{display:'flex',gap:10,alignItems:'center'}}>
                <div style={{
                  width:36,height:36,borderRadius:8,flexShrink:0,
                  border:`1.5px solid ${C.border}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  background:C.surface,
                }}>
                  <Search size={15} color={C.textMid}/>
                </div>
                <div style={{flex:1,position:'relative'}}>
                  <input
                    ref={busProductoRef}
                    type="text"
                    value={busProducto}
                    onChange={e=>{setBusProducto(e.target.value);setDropProducto(true);setProdIdx(-1)}}
                    placeholder="Agregar Producto"
                    autoFocus={true}
                    style={{
                      width:'100%',height:36,padding:'0 32px 0 12px',fontSize:13,
                      border:`1.5px solid ${C.border}`,borderRadius:8,
                      background:C.bg,color:C.textDark,
                      fontFamily:"'Inter',sans-serif",outline:'none',boxSizing:'border-box',
                    }}
                    onFocus={e=>{e.target.style.borderColor=C.borderFocus;setDropProducto(true)}}
                    onBlur={e=>e.target.style.borderColor=C.border}
                    onKeyDown={e=>{
                      if(!dropProducto || productosFilt.length===0) return
                      if(e.key==='ArrowDown'){ e.preventDefault(); setProdIdx(i=>Math.min(i+1,productosFilt.length-1)) }
                      else if(e.key==='ArrowUp'){ e.preventDefault(); setProdIdx(i=>Math.max(i-1,-1)) }
                      else if(e.key==='Enter'){
                        e.preventDefault();
                        if(prodIdx>=0) agregarProd(productosFilt[prodIdx])
                        else if(productosFilt.length > 0) agregarProd(productosFilt[0])
                      }
                      else if(e.key==='Escape'){ setDropProducto(false); setProdIdx(-1) }
                    }}
                  />
                  <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}>
                    <ChevronDown size={14} color={C.textMid}/>
                  </div>
                </div>
              </div>

              {dropProducto && busProducto && productosFilt.length>0 && (
                <div ref={dropProdRef} style={{
                  position:'absolute',top:'calc(100% + 4px)',left:50,right:0,zIndex:100,
                  background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,
                  boxShadow:'0 4px 20px rgba(0,0,0,.12)',maxHeight:300,overflowY:'auto',
                }}>
                  {productosFilt.map((p,idx)=>{
                    const inCart = carrito.find(i=>i.productoId===p.id)
                    const isHl = idx===prodIdx
                    return (
                      <div key={p.id} data-pidx={idx} onMouseDown={()=>agregarProd(p)}
                        onMouseEnter={()=>setProdIdx(idx)}
                        style={{
                          display:'flex',alignItems:'center',justifyContent:'space-between',
                          padding:'9px 14px 9px 11px',cursor:'pointer',
                          borderBottom:`1px solid #f3f4f6`,fontFamily:"'Inter',sans-serif",
                          background: isHl ? C.primarySurf : 'transparent',
                          borderLeft: isHl ? `3px solid ${C.primary}` : '3px solid transparent',
                          transition:'background 0.08s',
                        }}
                      >
                        <div>
                          <div style={{fontSize:13,fontWeight: isHl ? 700 : 600,color: isHl ? C.primary : C.textDark}}>{p.nombre}</div>
                          {p.codigo && <div style={{fontSize:11,color:C.textMid,marginTop:1}}>{p.codigo}</div>}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                          <StockBadge prod={p}/>
                          <span style={{fontSize:13,fontWeight:600,color: isHl ? C.primary : C.textDark,minWidth:70,textAlign:'right'}}>
                            ${(p.precio||0).toLocaleString('es-AR',{minimumFractionDigits:0})}
                          </span>
                          {inCart && <span style={{fontSize:10,color:'#fff',fontWeight:700,background:C.primary,padding:'1px 5px',borderRadius:4}}>+{inCart.cantidad}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Tabla del carrito ── */}
          {carrito.length===0 ? (
            <div style={{padding:'20px 24px',textAlign:'center'}}>
              <div style={{fontSize:13,color:C.textMid,marginBottom:6}}>El carrito está vacío</div>
              <div style={{fontSize:12,color:C.textLight}}>Buscá un producto arriba para agregarlo</div>
            </div>
          ) : (
            <>
              {/* DESKTOP: Tabla clásica */}
              <div className="pv-hide-mobile" style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
                      {[['Nombre',''],['Precio',''],['Costo','pv-col-costo'],['Stock','pv-col-stock'],['Cant.',''],['Total',''],['','']].map(([h,cls])=>(
                        <th key={h} className={cls} style={{
                          padding:'7px 12px',textAlign:'left',
                          fontSize:11,fontWeight:600,color:C.textMid,
                          letterSpacing:'0.05em',fontFamily:"'Inter',sans-serif",whiteSpace:'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map(item=>{
                      const prod = getProd(item.productoId)
                      return (
                        <tr key={item.id} style={{borderBottom:`1px solid ${C.border}`}}>
                          <td style={{padding:'7px 12px',verticalAlign:'middle'}}>
                            <div style={{fontSize:13,fontWeight:600,color:C.textDark,fontFamily:"'Inter',sans-serif",marginBottom:2}}>{item.nombre}</div>
                            {item.codigo && <div style={{fontSize:11,color:C.textMid}}>{item.codigo}</div>}
                            {prod?.variantes && prod.variantes.length > 0 && (
                              <div style={{marginTop:4}}>
                                <select
                                  value={item.variante||''}
                                  onChange={e=>setVariante(item.id, e.target.value)}
                                  style={{
                                    padding:'2px 4px', fontSize:11, borderRadius:4, border:`1px solid ${C.border}`,
                                    background:C.surface, color:C.textDark, outline:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif"
                                  }}
                                >
                                  {prod.variantes.split(',').map(v => <option key={v.trim()} value={v.trim()}>{v.trim()}</option>)}
                                </select>
                              </div>
                            )}
                          </td>
                          <td style={{padding:'7px 12px',verticalAlign:'middle',whiteSpace:'nowrap'}}>
                            <input type="number" value={item.precio} onChange={e=>setPrecio(item.id,e.target.value)} min="0"
                              style={{
                                width:84,height:30,padding:'0 8px',fontSize:13,
                                border:`1px solid ${C.border}`,borderRadius:6,
                                background:C.bg,color:C.textDark,
                                fontFamily:"'Inter',sans-serif",outline:'none',textAlign:'right',
                              }}
                              onFocus={e=>e.target.style.borderColor=C.borderFocus}
                              onBlur={e =>e.target.style.borderColor=C.border}
                            />
                          </td>
                          <td className="pv-col-costo" style={{padding:'7px 12px',verticalAlign:'middle',whiteSpace:'nowrap'}}>
                            <input type="number" value={item.costo??''} onChange={e=>setCosto(item.id,e.target.value)} min="0"
                              placeholder="—"
                              style={{
                                width:80,height:30,padding:'0 8px',fontSize:13,
                                border:`1px solid ${C.border}`,borderRadius:6,
                                background:'#fafafa',color:C.textMid,
                                fontFamily:"'Inter',sans-serif",outline:'none',textAlign:'right',
                              }}
                              onFocus={e=>e.target.style.borderColor=C.borderFocus}
                              onBlur={e =>e.target.style.borderColor=C.border}
                            />
                          </td>
                          <td className="pv-col-stock" style={{padding:'7px 12px',verticalAlign:'middle'}}>
                            <StockBadge prod={prod}/>
                          </td>
                          <td style={{padding:'7px 12px',verticalAlign:'middle'}}>
                            <div style={{display:'flex',alignItems:'center',gap:4}}>
                              <button onClick={()=>cambiarCant(item.id,-1)}
                                style={{width:24,height:24,borderRadius:5,border:`1px solid ${C.border}`,background:C.bg,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                <Minus size={11} color={C.textDark}/>
                              </button>
                              <input type="number" value={item.cantidad} onChange={e=>setCant(item.id,e.target.value)} min="1"
                                style={{width:38,height:24,textAlign:'center',fontSize:13,fontWeight:600,border:`1px solid ${C.border}`,borderRadius:5,background:C.bg,color:C.textDark,fontFamily:"'Inter',sans-serif",outline:'none'}}
                              />
                              <button onClick={()=>cambiarCant(item.id,1)}
                                style={{width:24,height:24,borderRadius:5,border:`1px solid ${C.border}`,background:C.bg,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                <Plus size={11} color={C.textDark}/>
                              </button>
                            </div>
                          </td>
                          <td style={{padding:'7px 12px',verticalAlign:'middle',whiteSpace:'nowrap'}}>
                            <span style={{fontSize:13,fontWeight:600,color:C.textDark,fontFamily:"'Inter',sans-serif"}}>
                              {fMon(item.precio*item.cantidad)}
                            </span>
                          </td>
                          <td style={{padding:'7px 10px',verticalAlign:'middle'}}>
                            <button onClick={()=>quitarItem(item.id)}
                              style={{width:26,height:26,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
                              onMouseEnter={e=>e.currentTarget.style.background=C.dangerSurf}
                              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                            >
                              <Trash2 size={13} color={C.danger}/>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE: Tarjetas lista de Items */}
              <div className="pv-show-mobile" style={{flexDirection:'column'}}>
                {carrito.map(item => {
                  const prod = getProd(item.productoId);
                  return (
                    <div key={item.id} style={{padding:'14px 16px', borderBottom:`1px solid ${C.border}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                        <div style={{flex:1,paddingRight:10}}>
                          <div style={{fontSize:14,fontWeight:700,color:C.textBlack,marginBottom:2,lineHeight:1.2}}>{item.nombre}</div>
                          {item.codigo && <div style={{fontSize:12,color:C.textMid}}>{item.codigo}</div>}
                        </div>
                        <button onClick={()=>quitarItem(item.id)} 
                          style={{
                            width:32,height:32,borderRadius:8,border:'none',
                            background:C.dangerSurf,color:C.danger,display:'flex',
                            alignItems:'center',justifyContent:'center',flexShrink:0
                          }}>
                          <Trash2 size={15}/>
                        </button>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:12,alignItems:'flex-end'}}>
                        <div style={{display:'flex',flexDirection:'column',gap:8}}>
                          {prod?.variantes && prod.variantes.length > 0 && (
                            <select value={item.variante||''} onChange={e=>setVariante(item.id, e.target.value)}
                              style={{ height:36, padding:'0 10px', fontSize:13, borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, color:C.textDark, outline:'none' }}>
                                {prod.variantes.split(',').map(v => <option key={v.trim()} value={v.trim()}>{v.trim()}</option>)}
                            </select>
                          )}
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <span style={{fontSize:12,color:C.textMid,fontWeight:600}}>Precio:</span>
                            <div style={{position:'relative',display:'flex',alignItems:'center'}}>
                               <span style={{position:'absolute',left:8,fontSize:14,color:C.textMid,fontWeight:600}}>$</span>
                               <input type="number" value={item.precio} onChange={e=>setPrecio(item.id,e.target.value)} min="0" 
                                style={{ width:88,height:36,padding:'0 8px 0 22px',fontSize:14,fontWeight:600,border:`1.5px solid ${C.border}`,borderRadius:8,background:C.bg,outline:'none' }}/>
                            </div>
                          </div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                          <div style={{display:'flex',alignItems:'center',gap:4}}>
                            <button onClick={()=>cambiarCant(item.id,-1)} style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${C.border}`,background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Minus size={14} color={C.textDark}/></button>
                            <input type="number" value={item.cantidad} onChange={e=>setCant(item.id,e.target.value)} min="1" style={{width:44,height:32,textAlign:'center',fontSize:15,fontWeight:700,border:`1.5px solid ${C.border}`,borderRadius:8,background:C.bg,outline:'none'}}/>
                            <button onClick={()=>cambiarCant(item.id,1)} style={{width:32,height:32,borderRadius:8,border:`1.5px solid ${C.border}`,background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Plus size={14} color={C.textDark}/></button>
                          </div>
                          <div style={{fontSize:16,fontWeight:800,color:C.textBlack}}>{fMon(item.precio*item.cantidad)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ── Separador ── */}

          <div style={{borderTop:`1px solid ${C.border}`}}/>

          {/* ── Sección Detalles: cliente + pago ── */}
          <div style={{padding:'12px 16px'}}>
            <div className="pv-form-grid" style={{marginBottom:8}}>
              {/* Cliente */}
              <div ref={cliRef} style={{position:'relative'}}>
                <Label>Cliente</Label>
                {clienteActivo && showClientSearch ? (
                  <div style={{display:'flex',gap:6}}>
                    <div style={{position:'relative',flex:1}}>
                      <div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}>
                        <User size={14} color={C.textMid}/>
                      </div>
                      <input
                        autoFocus
                        type="text"
                        value={busCliente}
                        onChange={e=>{setBusCliente(e.target.value);setDropCliente(true);if(!e.target.value){setClienteId('');setClienteNombre('')}}}
                        placeholder="Buscar cliente..."
                        style={{
                          width:'100%',height:32,padding:'0 10px 0 28px',fontSize:12,
                          border:`1.5px solid ${C.border}`,borderRadius:7,
                          background:C.bg,color:C.textDark,
                          fontFamily:"'Inter',sans-serif",outline:'none',boxSizing:'border-box',
                        }}
                        onFocus={e=>{e.target.style.borderColor=C.borderFocus;setDropCliente(true)}}
                        onBlur={e=>e.target.style.borderColor=C.border}
                      />
                      {dropCliente && clientesFilt.length>0 && (
                        <div style={{
                          position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:100,
                          background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,
                          boxShadow:'0 4px 16px rgba(0,0,0,.1)',maxHeight:200,overflowY:'auto',
                        }}>
                          {clientesFilt.slice(0,8).map(c=>(
                            <div key={c.id} onMouseDown={()=>selCliente(c)}
                              style={{
                                padding:'9px 12px',fontSize:13,color:C.textDark,cursor:'pointer',
                                borderBottom:`1px solid #f3f4f6`,fontFamily:"'Inter',sans-serif",
                              }}
                              onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                            >
                              <span style={{fontWeight:500}}>{c.nombre}</span>
                              {c.telefono && <span style={{fontSize:11,color:C.textMid,marginLeft:8}}>{c.telefono}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={()=>{ setClienteActivo(false); setShowClientSearch(false); setClienteId(''); setClienteNombre(''); setBusCliente('') }}
                      title="Cancelar" style={{width:32,height:32,borderRadius:7,border:`1px solid ${C.border}`,background:C.bg,color:C.textMid,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={14}/></button>
                  </div>
                ) : (
                  <button type="button" onClick={()=>{ setClienteActivo(true); setShowClientSearch(true) }}
                    style={{
                      width:'100%', height:32, padding:'0 12px', fontSize:13, fontWeight:600,
                      border:`1.5px ${clienteId?'solid':'dashed'} ${clienteId?C.primary:C.border}`, borderRadius:8,
                      background:clienteId?'#f8fdf9':'transparent',
                      color:clienteId?C.primary:C.textMid, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'flex-start',
                      transition:'all .12s'
                    }}
                    onMouseEnter={e=>{if(!clienteId) e.currentTarget.style.borderColor=C.textMid}}
                    onMouseLeave={e=>{if(!clienteId) e.currentTarget.style.borderColor=C.border}}
                  >
                    {clienteId ? (
                      <><span style={{flex:1,textAlign:'left',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{clienteNombre}</span>
                      <span onClick={e=>{e.stopPropagation();setClienteActivo(false);setShowClientSearch(false);setClienteId('');setClienteNombre('');setBusCliente('')}}
                        style={{flexShrink:0,marginLeft:8,display:'flex',alignItems:'center',opacity:.6}}><X size={13}/></span></>
                    ) : (
                      <>+ Consumidor Final <span style={{fontWeight:400,opacity:.6,marginLeft:4}}>(default)</span></>
                    )}
                  </button>
                )}
              </div>

              {/* Método de pago */}
              <div>
                <Label>Método de pago</Label>
                <Select value={metodoPago} onValueChange={v => { setMetodoPago(v); try{localStorage.setItem('gestify_metodo_pago',v)}catch{} }}>
                  <SelectTrigger className="w-full h-8 text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
                    <SelectValue placeholder="Método..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {METODOS_PAGO.map(m=><SelectItem key={m.val} value={m.val}>{m.lbl}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggle campos opcionales */}
            <div style={{marginBottom: showOpcionales ? 12 : 0}}>
              <button type="button" onClick={()=>setShowOpcionales(v=>!v)}
                style={{
                  background:'none', border:'none', color:C.textMid, fontSize:12, fontWeight:600,
                  cursor:'pointer', display:'flex', alignItems:'center', gap:5, padding:0,
                  transition:'color .1s'
                }}
                onMouseEnter={e=>e.currentTarget.style.color=C.textDark}
                onMouseLeave={e=>e.currentTarget.style.color=C.textMid}
              >
                {showOpcionales ? '− Ocultar notas, canal y fechas' : '+ agregar nota / fecha / canal / estado'}
              </button>
            </div>

            {showOpcionales && (
              <>
                <div className="pv-form-grid" style={{paddingTop:12, borderTop:`1px solid ${C.borderLight}`}}>
                  {/* Fecha pedido */}
                  <div ref={fechaPedidoRef} style={{position:'relative'}}>
                    <Label>Fecha del pedido</Label>
                    <button type="button"
                      onClick={()=>{ setPedidoViewDate(new Date(fechaPedido+'T12:00:00')); setFechaPedidoPicker(v=>!v) }}
                      style={{
                        width:'100%',height:32,display:'flex',alignItems:'center',gap:7,padding:'0 10px',
                        fontSize:12,border:`1.5px solid ${C.borderFocus}`,borderRadius:7,
                        background:C.bg,color:C.textDark,
                        fontFamily:"'Inter',sans-serif",cursor:'pointer',boxSizing:'border-box',
                      }}>
                      <Calendar size={13} color={C.primary} style={{flexShrink:0}}/>
                      <span style={{flex:1,textAlign:'left'}}>
                        {new Date(fechaPedido+'T12:00:00').toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'})}
                      </span>
                      <ChevronDown size={12} color={C.textLight} style={{flexShrink:0}}/>
                    </button>
                    {fechaPedidoPicker && (
                      <div className="pv-dp-wrap">
                        <div className="pv-dp-header">
                          <button type="button" className="pv-dp-nav" onClick={()=>setPedidoViewDate(d=>new Date(d.getFullYear(),d.getMonth()-1,1))}>‹</button>
                          <span className="pv-dp-title">{['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][pedidoViewDate.getMonth()]} {pedidoViewDate.getFullYear()}</span>
                          <button type="button" className="pv-dp-nav" onClick={()=>setPedidoViewDate(d=>new Date(d.getFullYear(),d.getMonth()+1,1))}>›</button>
                        </div>
                        <div className="pv-dp-grid">
                          {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d=><div key={d} className="pv-dp-lbl">{d}</div>)}
                          {(()=>{
                            const yr=pedidoViewDate.getFullYear(), mo=pedidoViewDate.getMonth()
                            const firstDay=new Date(yr,mo,1).getDay()
                            const daysInMo=new Date(yr,mo+1,0).getDate()
                            const todayD=new Date()
                            const cells=[]
                            for(let i=0;i<firstDay;i++) cells.push(<div key={`e${i}`}/>)
                            for(let d=1;d<=daysInMo;d++){
                              const ds=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                              const isSel=fechaPedido===ds
                              const isTod=todayD.getFullYear()===yr&&todayD.getMonth()===mo&&todayD.getDate()===d
                              cells.push(
                                <button key={d} type="button"
                                  className={`pv-dp-day${isSel?' sel':''}${isTod?' tod':''}`}
                                  onClick={()=>{setFechaPedido(ds);setFechaPedidoPicker(false)}}>
                                  {d}
                                </button>
                              )
                            }
                            return cells
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fecha entrega */}
                  <div ref={fechaEntregaRef} style={{position:'relative'}}>
                    <Label>Fecha de entrega <span style={{fontWeight:400,color:C.textLight}}>(opcional)</span></Label>
                    <button type="button"
                      onClick={()=>{ setPickerViewDate(fechaEntrega?new Date(fechaEntrega+'T12:00:00'):new Date()); setFechaEntregaPicker(v=>!v) }}
                      style={{
                        width:'100%',height:32,display:'flex',alignItems:'center',gap:7,padding:'0 10px',
                        fontSize:12,border:`1.5px solid ${fechaEntrega?C.borderFocus:C.border}`,borderRadius:7,
                        background:C.bg,color:fechaEntrega?C.textDark:C.textLight,
                        fontFamily:"'Inter',sans-serif",cursor:'pointer',boxSizing:'border-box',
                      }}>
                      <Calendar size={13} color={fechaEntrega?C.primary:C.textLight} style={{flexShrink:0}}/>
                      <span style={{flex:1,textAlign:'left'}}>
                        {fechaEntrega ? new Date(fechaEntrega+'T12:00:00').toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'}) : 'Sin fecha...'}
                      </span>
                      {fechaEntrega
                        ? <span onMouseDown={e=>{e.stopPropagation();setFechaEntrega('');setFechaEntregaPicker(false)}} style={{color:C.textLight,fontSize:16,lineHeight:1,cursor:'pointer',flexShrink:0,padding:'0 2px'}}>×</span>
                        : <ChevronDown size={12} color={C.textLight} style={{flexShrink:0}}/>}
                    </button>
                    {fechaEntregaPicker && (
                      <div className="pv-dp-wrap">
                        <div className="pv-dp-header">
                          <button type="button" className="pv-dp-nav" onClick={()=>setPickerViewDate(d=>new Date(d.getFullYear(),d.getMonth()-1,1))}>‹</button>
                          <span className="pv-dp-title">{['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][pickerViewDate.getMonth()]} {pickerViewDate.getFullYear()}</span>
                          <button type="button" className="pv-dp-nav" onClick={()=>setPickerViewDate(d=>new Date(d.getFullYear(),d.getMonth()+1,1))}>›</button>
                        </div>
                        <div className="pv-dp-grid">
                          {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d=><div key={d} className="pv-dp-lbl">{d}</div>)}
                          {(()=>{
                            const yr=pickerViewDate.getFullYear(), mo=pickerViewDate.getMonth()
                            const firstDay=new Date(yr,mo,1).getDay()
                            const daysInMo=new Date(yr,mo+1,0).getDate()
                            const todayD=new Date()
                            const cells=[]
                            for(let i=0;i<firstDay;i++) cells.push(<div key={`e${i}`}/>)
                            for(let d=1;d<=daysInMo;d++){
                              const ds=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                              const isSel=fechaEntrega===ds
                              const isTod=todayD.getFullYear()===yr&&todayD.getMonth()===mo&&todayD.getDate()===d
                              cells.push(
                                <button key={d} type="button"
                                  className={`pv-dp-day${isSel?' sel':''}${isTod?' tod':''}`}
                                  onClick={()=>{setFechaEntrega(ds);setFechaEntregaPicker(false)}}>
                                  {d}
                                </button>
                              )
                            }
                            return cells
                          })()}
                        </div>
                        {fechaEntrega && (
                          <div className="pv-dp-footer">
                            <button type="button" className="pv-dp-clear"
                              onClick={()=>{setFechaEntrega('');setFechaEntregaPicker(false)}}>
                              Limpiar fecha
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Estado */}
                  <div>
                    <Label>Estado</Label>
                    <Select value={estado} onValueChange={v => { setEstado(v); try{localStorage.setItem('gestify_pedido_estado',v)}catch{} }}>
                      <SelectTrigger className="w-full h-8 text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
                        <SelectValue placeholder="Estado..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {ESTADOS_PEDIDO.map(e=><SelectItem key={e.val} value={e.val}>{e.lbl}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Canal de venta */}
                  <div>
                    <Label>Canal de venta <span style={{fontWeight:400,color:C.textLight}}>(opcional)</span></Label>
                    <Select value={canalVenta} onValueChange={setCanalVenta}>
                      <SelectTrigger className="w-full h-8 text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
                        <SelectValue placeholder="Sin canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="">Sin canal</SelectItem>
                          {canales.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notas */}
                <div style={{marginTop:8}}>
                  <Label>Notas (opcional)</Label>
                  <textarea value={notas} onChange={e=>setNotas(e.target.value)}
                    placeholder="Observaciones, instrucciones de entrega..."
                    rows={2}
                    style={{
                      width:'100%',padding:'6px 10px',fontSize:12,resize:'vertical',
                      border:`1.5px solid ${C.border}`,borderRadius:7,
                      background:C.bg,color:C.textDark,
                      fontFamily:"'Inter',sans-serif",outline:'none',boxSizing:'border-box',
                    }}
                    onFocus={e=>e.target.style.borderColor=C.borderFocus}
                    onBlur={e =>e.target.style.borderColor=C.border}
                  />
                </div>
              </>
            )}
          </div>

          {/* ── Footer: Total + Guardar ── */}
          <div className="pv-cart-footer">
            <div style={{display:'flex',alignItems:'flex-end',gap:16,flexWrap:'wrap'}}>
              <div style={{minWidth:100}}>
                <div style={{fontSize:11,color:C.textMid,fontWeight:500,marginBottom:2}}>Total</div>
                <div style={{fontSize:18,fontWeight:800,color:C.textBlack,fontFamily:"'Inter',sans-serif",letterSpacing:'-0.3px',height:34,display:'flex',alignItems:'center'}}>
                  {fMon(total)}
                </div>
              </div>
              {total > 0 && (
                <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
                  <div>
                    <div style={{fontSize:11,color:C.textMid,fontWeight:500,marginBottom:2}}>Adelanto</div>
                    <input type="number" value={adelanto} onChange={e=>setAdelanto(e.target.value)} placeholder="0"
                      style={{
                        width:110,height:34,padding:'0 10px',fontSize:13,fontWeight:600,
                        border:`1.5px solid ${C.border}`,borderRadius:6,
                        background:C.bg,color:C.textDark,fontFamily:"'Inter',sans-serif",outline:'none',
                      }}
                      onFocus={e=>e.target.style.borderColor=C.primary}
                      onBlur={e =>e.target.style.borderColor=C.border}
                    />
                  </div>
                  <button onClick={()=>setAdelanto(String(total))} type="button"
                    style={{
                      height:34,padding:'0 12px',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',
                      border:`1.5px solid ${C.success}`,background:'#f0fdf4',color:C.success,
                      display:'flex',alignItems:'center',gap:6,fontFamily:"'Inter',sans-serif",
                      transition:'all .12s',whiteSpace:'nowrap',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background='#dcfce7'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f0fdf4'}
                  >
                    ✓ Pagar total
                    <span style={{
                      fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace",
                      background:'rgba(22,163,74,0.15)',color:C.success,
                      padding:'1px 5px',borderRadius:4,letterSpacing:'0.02em',
                    }}>Shift</span>
                  </button>
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',height:34,gap:6}}>
                {adelantoNum > 0 && saldo > 0 && (
                  <span style={{fontSize:12,color:C.warning,fontWeight:700,background:C.warnSurf,padding:'3px 8px',borderRadius:6,border:`1px solid ${C.warnBord}`}}>
                    Saldo: {fMon(saldo)}
                  </span>
                )}
                {adelantoNum >= total && total > 0 && (
                  <span style={{fontSize:11,color:C.success,fontWeight:700,background:'#f0fdf4',padding:'3px 8px',borderRadius:6,border:`1px solid ${C.successBord}`,display:'flex',alignItems:'center',gap:4}}>
                    <CheckCircle size={12}/> Pagado
                  </span>
                )}
              </div>
            </div>
            <div className="pv-cart-footer-save">
              <BtnPrimary onClick={handleGuardar} disabled={!puedeGuardar} loading={isProcessing} ref={guardarRef}>
                <Save size={15}/>{pedidoAEditar?'Actualizar Venta':'Crear Pedido'}
                <span className="pv-desktop" style={{ marginLeft: 4, padding: "2px 5px", background: "rgba(0,0,0,0.15)", borderRadius: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>Ctrl+Enter</span>
              </BtnPrimary>
            </div>
          </div>
        </div>{/* fin card unificado */}

        {/* Atajos info */}
        <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:C.textMid, display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:15, opacity:0.8 }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Zap size={13} color={C.textMid}/> <b>Enter</b>: Agregar 1° producto</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Banknote size={13} color={C.textMid}/> <b>Shift</b>: Saldar total</span>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}><Save size={13} color={C.textMid}/> <b>F2</b> o <b>Ctrl+Enter</b>: Guardar</span>
        </div>
      </div>

      <style>{`
        @media (max-width:767px){
          .pv-desktop{display:none!important;}
          .pv-mobile{display:flex!important;}
          .pv-hide-mobile{display:none!important;}
          .pv-show-mobile{display:flex!important;}
        }
        @media (min-width:768px){
          .pv-mobile{display:none!important;}
          .pv-desktop{display:flex!important;}
          .pv-hide-mobile{display:block!important;}
          .pv-show-mobile{display:none!important;}
        }

        .pv-form-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        }
        @media (max-width:540px) {
          .pv-form-grid { grid-template-columns:1fr; }
        }

        .pv-content-pad {
          max-width:860px; margin:0 auto; padding:16px 24px 24px;
        }
        @media (max-width:600px) {
          .pv-content-pad { padding:8px 12px 16px; }
        }

        .app-select {
          width:100%; height:32px; padding:0 28px 0 10px; font-size:12px;
          border:1.5px solid #d1d5db; border-radius:7px; background:#fff;
          font-family:'Inter',sans-serif; outline:none;
          appearance:none; -webkit-appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 10px center;
          cursor:pointer; box-sizing:border-box; transition:border-color .12s;
        }
        .app-select:focus { border-color:#334139; }

        .pv-dp-wrap {
          position:absolute; top:calc(100% + 4px); left:0; z-index:500;
          background:#fff; border:1px solid #d1d5db; border-radius:10px;
          box-shadow:0 8px 28px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.06);
          padding:8px; width:220px;
        }
        .pv-dp-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .pv-dp-nav {
          width:26px; height:26px; display:flex; align-items:center; justify-content:center;
          background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px;
          cursor:pointer; font-size:15px; color:#374151; transition:all .1s;
        }
        .pv-dp-nav:hover { background:#f3f4f6; border-color:#9ca3af; }
        .pv-dp-title { font-size:12px; font-weight:700; color:#111827; }
        .pv-dp-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
        .pv-dp-lbl { text-align:center; font-size:9px; font-weight:700; color:#9ca3af; text-transform:uppercase; padding:2px 0 4px; }
        .pv-dp-day {
          width:100%; aspect-ratio:1; display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:500; color:#374151;
          border:none; background:transparent; border-radius:5px;
          cursor:pointer; transition:all .1s; padding:0; font-family:'Inter',sans-serif;
        }
        .pv-dp-day:hover { background:#f3f4f6; }
        .pv-dp-day.tod { font-weight:800; color:#334139; position:relative; }
        .pv-dp-day.tod::after { content:''; position:absolute; bottom:1px; left:50%; transform:translateX(-50%); width:3px; height:3px; background:#334139; border-radius:50%; }
        .pv-dp-day.sel { background:#334139 !important; color:#fff !important; font-weight:700; }
        .pv-dp-footer { margin-top:6px; padding-top:6px; border-top:1px solid #f3f4f6; display:flex; justify-content:center; }
        .pv-dp-clear { font-size:11px; font-weight:600; color:#9ca3af; background:none; border:none; cursor:pointer; font-family:'Inter',sans-serif; transition:color .1s; }
        .pv-dp-clear:hover { color:#ef4444; }

        @media (max-width:600px) {
          .pv-col-costo, .pv-col-stock { display:none; }
        }

        .pv-cart-footer {
          border-top:1px solid #e5e7eb;
          padding:12px 16px;
          background:#f9fafb;
          display:flex;
          align-items:center;
          justify-content:space-between;
          flex-wrap:wrap;
          gap:8px;
        }
        @media (max-width:540px) {
          .pv-cart-footer { flex-direction:column; align-items:stretch; }
          .pv-cart-footer-save { width:100%; }
          .pv-cart-footer-save button { width:100%; justify-content:center; }
        }
      `}</style>
    </div>
  )
}
