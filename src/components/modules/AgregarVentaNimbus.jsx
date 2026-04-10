/**
 * AgregarVentaNimbus.jsx — Diseño POS estilo TiendaNube
 * Misma lógica que AgregarVenta.jsx, UI completamente rediseñada
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { CheckCircle, CheckCircle2, TrendingUp, Search, Plus, Minus, Trash2, X, Save, Menu, User, ChevronDown, UserPlus, PackagePlus, AlertCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { PlusIcon, MenuIcon, SearchIcon, ChevronDownIcon } from '@nimbus-ds/icons'

/* ══════════════════════════════════════════
   PALETA
══════════════════════════════════════════ */
const C = {
  pageBg:     "#f8f9fb",
  bg:         "#ffffff",
  border:     "#d1d5db",
  borderFocus:"#334139",
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

const SelNativo = ({ value, onChange, children, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    className="app-select"
    style={{ color: value ? C.textDark : C.textLight }}
  >
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {children}
  </select>
)

const InputField = ({value,onChange,placeholder,type='text',min,style:extra}) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min}
    style={{
      width:'100%', height:32, padding:'0 10px',
      fontSize:12, border:`1.5px solid ${C.border}`, borderRadius:7,
      background:C.bg, color:C.textDark,
      fontFamily:"'Inter',sans-serif", outline:'none',
      boxSizing:'border-box', ...extra,
    }}
    onFocus={e=>e.target.style.borderColor=C.borderFocus}
    onBlur={e =>e.target.style.borderColor=C.border}
  />
)

const BtnPrimary = ({children,onClick,disabled,loading}) => {
  const [hov,setHov]=useState(false)
  return (
    <button onClick={onClick} disabled={disabled||loading}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:'inline-flex',alignItems:'center',gap:7,
        height:32, padding:'0 18px', borderRadius:6, border:'none',
        background:disabled ? C.textLight : hov ? C.primaryHov : C.primary,
        color:'#fff', fontSize:13, fontWeight:500,
        fontFamily:"'Inter',sans-serif", cursor:disabled?'not-allowed':'pointer',
        transition:'background 0.13s',
      }}
    >
      {loading ? 'Guardando...' : children}
    </button>
  )
}

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
  const [toastMsg,      setToastMsg]      = useState(null)

  const busProductoRef = useRef(null)
  const dropProdRef    = useRef(null)
  const cliRef         = useRef(null)
  const guardarRef     = useRef(null)
  const [prodIdx,      setProdIdx]      = useState(-1)

  /* ── auto-focus al montar ── */
  useEffect(()=>{ setTimeout(()=>busProductoRef.current?.focus(), 80) }, [])

  const canales = React.useMemo(()=>{ try{ const ls=localStorage.getItem('gestify_canales_venta'); if(ls) return JSON.parse(ls) }catch{} return [] },[])

  const showToast = (msg,type='error') => { setToastMsg({msg,type}); setTimeout(()=>setToastMsg(null),3500) }

  /* ── cargar pedido a editar ── */
  useEffect(()=>{
    if(!pedidoAEditar) return
    if(pedidoAEditar.cliente_id){ setClienteId(pedidoAEditar.cliente_id); setClienteNombre(pedidoAEditar.cliente_nombre||''); setBusCliente(pedidoAEditar.cliente_nombre||'') }
    let arr=[]; try{ arr=typeof pedidoAEditar.items==='string'?JSON.parse(pedidoAEditar.items):(pedidoAEditar.items||[]) }catch{}
    setCarrito(arr.map((i,idx)=>({ id:Date.now()+idx, productoId:i.productoId||i.producto_id||null, nombre:i.producto||i.nombre||'', codigo:i.codigo||'', precio:parseFloat(i.precio)||0, costo:i.costo??'', cantidad:parseFloat(i.cantidad)||1 })))
    if(pedidoAEditar.fecha_pedido) setFechaPedido(pedidoAEditar.fecha_pedido.slice(0,10))
    if(pedidoAEditar.fecha_entrega_estimada) setFechaEntrega(pedidoAEditar.fecha_entrega_estimada.slice(0,10))
    if(pedidoAEditar.estado) setEstado(pedidoAEditar.estado)
    if(pedidoAEditar.notas) setNotas(pedidoAEditar.notas)
    if(pedidoAEditar.monto_abonado) setAdelanto(String(pedidoAEditar.monto_abonado))
    if(pedidoAEditar.canal_venta) setCanalVenta(pedidoAEditar.canal_venta)
  },[pedidoAEditar?.id])

  /* ── cálculos ── */
  const total       = carrito.reduce((s,i)=>s+i.precio*i.cantidad,0)
  const adelantoNum = parseFloat(adelanto)||0
  const saldo       = Math.max(0,total-adelantoNum)
  const puedeGuardar = carrito.length>0 && (clienteActivo?!!clienteId:true) && !isProcessing

  /* ── filtros ── */
  const clientesFilt  = clientes.filter(c=>c.nombre?.toLowerCase().includes(busCliente.toLowerCase())||c.telefono?.includes(busCliente))
  const productosFilt = productos.filter(p=>p.nombre?.toLowerCase().includes(busProducto.toLowerCase())||p.codigo?.toLowerCase().includes(busProducto.toLowerCase()))

  /* ── carrito ── */
  const agregarProd = p => {
    setCarrito(prev=>{
      const ex = prev.find(i=>i.productoId===p.id)
      if(ex) return prev.map(i=>i.productoId===p.id?{...i,cantidad:i.cantidad+1}:i)
      return [...prev,{id:Date.now(),productoId:p.id,nombre:p.nombre,codigo:p.codigo,precio:p.precio,costo:p.costo??'',cantidad:1}]
    })
    setBusProducto(''); setDropProducto(false); setProdIdx(-1)
    setTimeout(()=>busProductoRef.current?.focus(),60)
  }
  /* ── agregar producto externo (desde módulo Productos) ── */
  useEffect(()=>{
    if(!productoParaAgregarAlCarrito) return
    agregarProd(productoParaAgregarAlCarrito)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[productoParaAgregarAlCarrito])

  const cambiarCant = (id,delta) => setCarrito(prev=>prev.map(i=>i.id===id?{...i,cantidad:Math.max(1,i.cantidad+delta)}:i))
  const setCant     = (id,val)   => setCarrito(prev=>prev.map(i=>i.id===id?{...i,cantidad:Math.max(1,parseFloat(val)||1)}:i))
  const setPrecio   = (id,val)   => setCarrito(prev=>prev.map(i=>i.id===id?{...i,precio:parseFloat(val)||0}:i))
  const setCosto    = (id,val)   => setCarrito(prev=>prev.map(i=>i.id===id?{...i,costo:val===''?'':parseFloat(val)||0}:i))
  const quitarItem  = id          => setCarrito(prev=>prev.filter(i=>i.id!==id))

  const selCliente = c => { setClienteId(c.id); setClienteNombre(c.nombre); setBusCliente(c.nombre); setDropCliente(false) }
  const limpiarTodo = () => { setClienteId(''); setClienteNombre(''); setBusCliente(''); setBusProducto(''); setCarrito([]); setFechaPedido(new Date().toISOString().slice(0,10)); setFechaEntrega(''); setEstado('pendiente'); setNotas(''); setAdelanto(''); setCanalVenta('') }

  /* ── guardar ── */
  const handleGuardar = useCallback(async()=>{
    if(!puedeGuardar){ showToast('Agregá al menos un producto'); return }
    setIsProcessing(true)
    const items = carrito.map(i=>{
      const costoNum = (i.costo!==''&&i.costo!=null) ? parseFloat(i.costo) : null
      const ganancia = costoNum!=null ? (i.precio - costoNum) * i.cantidad : null
      return { id:i.id, productoId:i.productoId, producto:i.nombre, precio:i.precio, cantidad:i.cantidad, subtotal:i.precio*i.cantidad, costo:costoNum, ganancia }
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
    const h = e => {
      const inInput = ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)
      // Ctrl+Enter → guardar (funciona aunque el cursor esté en un input)
      if(e.ctrlKey && e.key==='Enter'){ e.preventDefault(); handleGuardar(); return }
      // Shift solo → pagar total (solo fuera de inputs para no interferir con texto)
      if(!inInput && e.key==='Shift' && !e.ctrlKey && !e.altKey && !e.metaKey){ e.preventDefault(); setAdelanto(String(total)) }
    }
    window.addEventListener('keydown',h)
    return ()=>window.removeEventListener('keydown',h)
  },[handleGuardar, total])

  /* ── scroll item seleccionado en dropdown (arriba y abajo) ── */
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
    }
    document.addEventListener('mousedown',h)
    return ()=>document.removeEventListener('mousedown',h)
  },[])

  /* ── obtener datos de producto por id ── */
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
          background:'rgba(0,0,0,0.3)',
          backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          animation:'av-fade-out .9s ease forwards',
        }}>
          <div style={{
            background:'#fff', borderRadius:20,
            padding:'44px 52px', textAlign:'center',
            boxShadow:'0 24px 64px rgba(0,0,0,0.22)',
            animation:'av-slide-up .18s cubic-bezier(.22,.97,.56,1)',
            minWidth:260,
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
      <div style={{ background:C.pageBg }}>
        {/* Mobile */}
        <div style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 16px' }} className="pv-mobile">
          <button onClick={onOpenMobileSidebar} style={{background:'none',border:'none',cursor:'pointer',display:'flex'}}><MenuIcon size={20} color={C.textBlack}/></button>
          <span style={{fontWeight:700,fontSize:16,color:C.textBlack}}>{pedidoAEditar?'Editar Venta':'Agregar Venta'}</span>
        </div>
        {/* Desktop — mismo maxWidth que el contenido */}
        <div style={{ maxWidth:860, margin:'0 auto', width:'100%', display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px 12px',gap:12,boxSizing:'border-box' }} className="pv-desktop">
          <h1 style={{margin:0,fontSize:22,fontWeight:700,color:C.textBlack,letterSpacing:'-0.3px'}}>
            {pedidoAEditar ? `Editando · ${pedidoAEditar.codigo||''}` : 'Agregar Venta'}
          </h1>
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
      <div style={{ maxWidth:860,margin:'0 auto',padding:'8px 16px 16px' }}>

        {/* ┌─────────────────────────────────┐ */}
        {/* │   CARD 1: Detalles de la Venta  │ */}
        {/* └─────────────────────────────────┘ */}
        <div style={{ background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,padding:'10px 14px',marginBottom:8 }}>
          <h2 style={{margin:'0 0 7px',fontSize:12,fontWeight:700,color:C.textBlack,letterSpacing:'0.02em'}}>Detalles de la Venta</h2>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>

            {/* Cliente */}
            <div ref={cliRef} style={{position:'relative'}}>
              <Label>Cliente</Label>
              <div style={{display:'flex',gap:6}}>
                <div style={{position:'relative',flex:1}}>
                  <div style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}>
                    <User size={14} color={C.textMid}/>
                  </div>
                  <input
                    type="text"
                    value={busCliente}
                    onChange={e=>{setBusCliente(e.target.value);setDropCliente(true);if(!e.target.value){setClienteId('');setClienteNombre('')}}}
                    placeholder={clienteActivo?'Buscar cliente...':'Consumidor Final'}
                    disabled={!clienteActivo}
                    style={{
                      width:'100%',height:32,padding:'0 10px 0 28px',fontSize:12,
                      border:`1.5px solid ${C.border}`,borderRadius:7,
                      background:clienteActivo?C.bg:'#f9fafb',color:C.textDark,
                      fontFamily:"'Inter',sans-serif",outline:'none',boxSizing:'border-box',
                    }}
                    onFocus={e=>{e.target.style.borderColor=C.borderFocus;setDropCliente(true)}}
                    onBlur={e=>e.target.style.borderColor=C.border}
                  />
                  {/* Dropdown clientes */}
                  {dropCliente && clienteActivo && clientesFilt.length>0 && (
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
                {/* Toggle sin cliente */}
                <button
                  onClick={()=>{ setClienteActivo(v=>{ const n=!v; try{localStorage.setItem(PREF_KEY,String(n))}catch{}; if(n===false){setClienteId('');setClienteNombre('');setBusCliente('')}; return n }) }}
                  title={clienteActivo?'Cambiar a sin cliente':'Agregar cliente'}
                  style={{
                    width:32,height:32,borderRadius:7,flexShrink:0,
                    border:`1.5px solid ${clienteActivo?C.primary:C.border}`,
                    background:clienteActivo?C.primary:C.bg,
                    color:clienteActivo?'#fff':C.textMid,
                    cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
                  }}
                >
                  <User size={14}/>
                </button>
              </div>
            </div>

            {/* Fecha pedido */}
            <div>
              <Label>Fecha del pedido</Label>
              <InputField type="date" value={fechaPedido} onChange={e=>setFechaPedido(e.target.value)}/>
            </div>

            {/* Fecha entrega */}
            <div>
              <Label>Fecha de entrega <span style={{fontWeight:400,color:C.textLight}}>(opcional)</span></Label>
              <InputField type="date" value={fechaEntrega} onChange={e=>setFechaEntrega(e.target.value)}
                style={{ color: fechaEntrega ? C.textDark : C.textLight }}
              />
            </div>

            {/* Estado */}
            <div>
              <Label>Estado</Label>
              <SelNativo value={estado} onChange={e=>{ setEstado(e.target.value); try{localStorage.setItem('gestify_pedido_estado',e.target.value)}catch{} }}>
                {ESTADOS_PEDIDO.map(e=><option key={e.val} value={e.val}>{e.lbl}</option>)}
              </SelNativo>
            </div>

            {/* Método de pago */}
            <div>
              <Label>Método de pago</Label>
              <SelNativo value={metodoPago} onChange={e=>{ setMetodoPago(e.target.value); try{localStorage.setItem('gestify_metodo_pago',e.target.value)}catch{} }}>
                {METODOS_PAGO.map(m=><option key={m.val} value={m.val}>{m.lbl}</option>)}
              </SelNativo>
            </div>

          </div>

          {/* Canal de venta */}
          {canales.length > 0 && (
            <div style={{marginTop:5}}>
              <Label>Canal de venta</Label>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {canales.map(c=>(
                  <button key={c} type="button" onClick={()=>setCanalVenta(canalVenta===c?'':c)}
                    style={{
                      padding:'3px 10px',borderRadius:5,fontSize:11,fontWeight:600,cursor:'pointer',
                      border:`1.5px solid ${canalVenta===c?C.primary:C.border}`,
                      background:canalVenta===c?C.primarySurf:C.bg,
                      color:canalVenta===c?C.primary:C.textMid,
                      transition:'all .12s',fontFamily:"'Inter',sans-serif",
                    }}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          <div style={{marginTop:5}}>
            <Label>Notas (opcional)</Label>
            <textarea value={notas} onChange={e=>setNotas(e.target.value)}
              placeholder="Observaciones, instrucciones de entrega..."
              rows={1}
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
        </div>

        {/* ┌─────────────────────────────────┐ */}
        {/* │   CARD 2: Productos / Carrito   │ */}
        {/* └─────────────────────────────────┘ */}
        <div style={{ background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden' }}>
          <div style={{padding:'12px 16px 10px',borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <h2 style={{margin:0,fontSize:13,fontWeight:700,color:C.textBlack}}>Productos</h2>
              <div style={{display:'flex',gap:5}}>
                <button title="Nuevo cliente" onClick={()=>openModal?.('nuevo-cliente')}
                  style={{display:'flex',alignItems:'center',gap:5,height:28,padding:'0 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:`1.5px solid ${C.border}`,background:C.bg,color:C.textMid,transition:'all .12s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid}}
                >
                  <UserPlus size={13}/> Cliente
                </button>
                <button title="Nuevo producto" onClick={()=>openModal?.('nuevo-producto')}
                  style={{display:'flex',alignItems:'center',gap:5,height:28,padding:'0 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:`1.5px solid ${C.border}`,background:C.bg,color:C.textMid,transition:'all .12s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.color=C.primary}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid}}
                >
                  <PackagePlus size={13}/> Producto
                </button>
              </div>
            </div>

            {/* Buscador de productos */}
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
                      else if(e.key==='Enter'){ e.preventDefault(); if(prodIdx>=0) agregarProd(productosFilt[prodIdx]) }
                      else if(e.key==='Escape'){ setDropProducto(false); setProdIdx(-1) }
                    }}
                  />
                  <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}>
                    <ChevronDown size={14} color={C.textMid}/>
                  </div>
                </div>
              </div>

              {/* Dropdown productos */}
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
                        onMouseLeave={()=>{}}
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
                  {productosFilt.length===0 && (
                    <div style={{padding:'14px',fontSize:13,color:C.textMid,textAlign:'center'}}>No se encontraron productos</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabla del carrito */}
          {carrito.length===0 ? (
            <div style={{padding:'20px 24px',textAlign:'center'}}>
              <div style={{fontSize:13,color:C.textMid,marginBottom:6}}>El carrito está vacío</div>
              <div style={{fontSize:12,color:C.textLight}}>Buscá un producto arriba para agregarlo</div>
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
                    {['Nombre','Precio','Costo','Stock','Cant.','Total',''].map(h=>(
                      <th key={h} style={{
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
                        {/* Nombre */}
                        <td style={{padding:'7px 12px',verticalAlign:'middle'}}>
                          <div style={{fontSize:13,fontWeight:600,color:C.textDark,fontFamily:"'Inter',sans-serif"}}>{item.nombre}</div>
                          {item.codigo && <div style={{fontSize:11,color:C.textMid}}>{item.codigo}</div>}
                        </td>
                        {/* Precio editable */}
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
                        {/* Costo editable */}
                        <td style={{padding:'7px 12px',verticalAlign:'middle',whiteSpace:'nowrap'}}>
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
                        {/* Stock */}
                        <td style={{padding:'7px 12px',verticalAlign:'middle'}}>
                          <StockBadge prod={prod}/>
                        </td>
                        {/* Cantidad */}
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
                        {/* Subtotal */}
                        <td style={{padding:'7px 12px',verticalAlign:'middle',whiteSpace:'nowrap'}}>
                          <span style={{fontSize:13,fontWeight:600,color:C.textDark,fontFamily:"'Inter',sans-serif"}}>
                            {fMon(item.precio*item.cantidad)}
                          </span>
                        </td>
                        {/* Eliminar */}
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
          )}

          {/* ── Footer del carrito: Total + Adelanto + Guardar ── */}
          <div style={{
            borderTop:`2px solid #6b7280`,
            padding:'10px 16px',
            background:'#f9fafb',
            display:'flex',alignItems:'center',justifyContent:'space-between',
            flexWrap:'wrap',gap:8,
          }}>
            <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:11,color:C.textMid,fontWeight:500,marginBottom:2}}>Total</div>
                <span style={{fontSize:18,fontWeight:800,color:C.textBlack,fontFamily:"'Inter',sans-serif",letterSpacing:'-0.3px'}}>
                  {fMon(total)}
                </span>
              </div>
              {total>0 && (
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
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
                  {/* Botón pagar total */}
                  <button onClick={()=>setAdelanto(String(total))} type="button"
                    style={{
                      height:34,padding:'0 12px',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',
                      border:`1.5px solid ${C.success}`,background:'#f0fdf4',color:C.success,
                      display:'flex',alignItems:'center',gap:6,fontFamily:"'Inter',sans-serif",
                      transition:'background .12s',whiteSpace:'nowrap',
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
                  {adelantoNum>0 && saldo>0 && (
                    <span style={{fontSize:12,color:C.warning,fontWeight:700,background:C.warnSurf,padding:'3px 8px',borderRadius:6,border:`1px solid ${C.warnBord}`}}>
                      Saldo: {fMon(saldo)}
                    </span>
                  )}
                  {adelantoNum>=total && total>0 && (
                    <span style={{fontSize:12,color:C.success,fontWeight:700,background:'#f0fdf4',padding:'3px 8px',borderRadius:6,border:`1px solid ${C.successBord}`}}>✓ Pagado</span>
                  )}
                </div>
              )}
            </div>
            <BtnPrimary onClick={handleGuardar} disabled={!puedeGuardar} loading={isProcessing} ref={guardarRef}>
              <Save size={15}/>{pedidoAEditar?'Actualizar Venta':'Crear Pedido'}
              <span className="pv-desktop" style={{ marginLeft: 4, padding: "2px 5px", background: "rgba(0,0,0,0.15)", borderRadius: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>Ctrl+Enter</span>
            </BtnPrimary>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width:767px){
          .pv-desktop{display:none!important;}
          .pv-mobile{display:flex!important;}
        }
        @media (min-width:768px){
          .pv-mobile{display:none!important;}
          .pv-desktop{display:flex!important;}
        }
      `}</style>
    </div>
  )
}
