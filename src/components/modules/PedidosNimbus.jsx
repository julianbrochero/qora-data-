/**
 * PedidosNimbus.jsx — módulo Ventas con estética TiendaNube
 * Misma interfaz de props que Pedidos.jsx
 */
import React, { useState, useEffect, useRef, useMemo } from "react"
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  SearchIcon, PlusIcon, EditIcon, TrashIcon,
  ChevronLeftIcon, ChevronRightIcon, MenuIcon,
  FileIcon, EyeIcon, CheckCircleIcon, CloseIcon,
  CheckIcon,
} from "@nimbus-ds/icons"
import {
  Clock, Package, Truck, CheckCircle, XCircle,
  DollarSign, Eye, Edit, Trash2, MoreHorizontal, AlertTriangle, Calendar, ChevronDown,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PedidoDetail from "../forms/PedidoDetail"

/* ══════════════════════════════════════════
   PALETA — igual que ProductosNimbus
══════════════════════════════════════════ */
const C = {
  pageBg:     "#f8f9fb",
  bg:         "#ffffff",
  border:     "#d1d5db",
  borderMd:   "#9ca3af",
  primary:    "#334139",
  primaryHov: "#2b352f",
  primarySurf:"#eaf0eb",
  textBlack:  "#0d0d0d",
  textDark:   "#111827",
  textMid:    "#6b7280",
  textLight:  "#9ca3af",
  surface:    "#f9fafb",
}

const ESTADOS = {
  pendiente:  { label: "Pendiente",  bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", Icon: Clock },
  preparando: { label: "Preparando", bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", Icon: Package },
  enviado:    { label: "Enviado",    bg: "#FAF5FF", color: "#9333EA", border: "#E9D5FF", Icon: Truck },
  entregado:  { label: "Entregado",  bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", Icon: CheckCircle },
  cancelado:  { label: "Cancelado",  bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", Icon: XCircle },
}

const fCodigo = (c, id) => {
  if (!c) return id?.toString().slice(-4) || ""
  return c.toString().replace(/order\s*#?/i, '').replace(/^#/, '').trim()
}

const getEstadoPago = (p) => {
  const total   = parseFloat(p.total) || 0
  const abonado = parseFloat(p.monto_abonado) || 0
  const saldo   = p.saldo_pendiente !== undefined ? parseFloat(p.saldo_pendiente) : total - abonado
  if (saldo <= 0.01) return { label: "Pagado",       bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" }
  if (abonado > 0)   return { label: "Pago parcial", bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" }
  return               { label: "Sin pago",       bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" }
}

const RESPONSIVE = `
  .pn-show-mobile { display: none; }
  .pn-hide-mobile { display: flex; }
  @media (max-width: 767px) {
    .pn-show-mobile {
      display: flex !important;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .pn-hide-mobile { display: none !important; }
  }
  [data-radix-portal], [data-slot="dialog-portal"] {
    z-index: 10000 !important;
  }
  .pn-select-trigger { transition: all 0.2s ease; cursor: pointer; }
  .pn-select-trigger:hover { 
    box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
    border-color: #9ca3af !important; 
    transform: scale(1.01);
  }
  [role="option"] { transition: all 0.15s ease !important; cursor: pointer !important; }
  [role="option"]:hover, [role="option"][data-highlighted] { 
    background-color: #f9fafb !important; 
    color: #000 !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transform: translateX(4px) scale(1.02);
  }
`

/* ─── helpers ─── */
const fFecha = (f) => { try { return new Date(f).toLocaleDateString("es-AR", { day:"2-digit", month:"2-digit", year:"numeric" }) } catch { return "—" } }
const fMonto = (m) => (parseFloat(m)||0).toLocaleString("es-AR", { style:"currency", currency:"ARS", maximumFractionDigits:0 })

/* ─── Pill badge ─── */
const Badge = ({ label, bg, color, border, Icon }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:4,
    padding:"2px 8px", borderRadius:4,
    fontSize:11, fontWeight:600, lineHeight:1.7,
    color, background:bg, border:`1px solid ${border}`,
    fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap",
  }}>
    {Icon && <Icon size={10} color={color} strokeWidth={2.5}/>}
    {label}
  </span>
)

/* ─── Botón ─── */
const Btn = ({ children, onClick, primary, small, disabled, style={} }) => {
  if (primary) return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display:"inline-flex", alignItems:"center", gap:6,
        height: small?28:32, padding:`0 ${small?12:16}px`, borderRadius:8,
        background:"#334139", color:"#fff",
        border:"1.5px solid #334139",
        fontSize:small?12:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
        fontFamily:"'Inter',sans-serif",
        transition:"background 0.12s",
        whiteSpace:"nowrap", opacity:disabled?0.5:1,
        ...style
      }}
      onMouseEnter={e=>!disabled&&(e.currentTarget.style.background="#2b352f")}
      onMouseLeave={e=>!disabled&&(e.currentTarget.style.background="#334139")}
    >{children}</button>
  )
  return (
    <Button
      variant="outline"
      size={small ? "sm" : "default"}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={style}
    >
      {children}
    </Button>
  )
}

/* ─── Icono acción ─── */
const IcoBtn = ({ icon: Ico, onClick, title, color }) => {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        width:30, height:30, borderRadius:6,
        display:"flex", alignItems:"center", justifyContent:"center",
        border:`1px solid ${hov?C.border:"transparent"}`,
        background:hov?"#f9fafb":"transparent",
        cursor:"pointer", transition:"all 0.12s",
      }}
    >
      <Ico size={14} color={color||C.textMid} strokeWidth={1.8}/>
    </button>
  )
}

/* ─── Tarjeta resumen clicable ─── */
const StatCard = ({ label, value, sub, color, onClick, active }) => (
  <div
    onClick={onClick}
    style={{
      background: active ? (color ? color+'18' : C.primarySurf) : C.bg,
      borderRadius:8,
      border: active ? `1.5px solid ${color||C.primary}` : `1px solid ${C.border}`,
      padding:"12px 16px", flex:"1 1 120px",
      cursor: onClick ? "pointer" : "default",
      transition:"all .13s",
      position:"relative",
    }}
    onMouseEnter={e => { if(onClick) { e.currentTarget.style.borderColor = color||C.primary; e.currentTarget.style.background = color ? color+'12' : C.primarySurf } }}
    onMouseLeave={e => { if(onClick && !active) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg } }}
  >
    {active && <div style={{ position:'absolute', top:7, right:9, fontSize:9, fontWeight:700, color: color||C.primary, opacity:.7 }}>✕ filtro</div>}
    <div style={{ fontSize:20, fontWeight:700, color: active ? (color||C.primary) : (color||C.textBlack), lineHeight:1, marginBottom:3 }}>
      {value}
    </div>
    <div style={{ fontSize:11, fontWeight:600, color:C.textDark, marginBottom:2 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:C.textMid }}>{sub}</div>}
  </div>
)

/* ─── Fila venta ─── */
const Row = ({ p, onVer, onEditar, onEliminar, menuAbierto, setMenu, menuPos, setMenuPos, isSelected, onToggleSelect, hasSelection }) => {
  const [hov, setHov] = useState(false)
  const estCfg  = ESTADOS[p.estado] || ESTADOS.pendiente
  const pagoCfg = getEstadoPago(p)
  const puedeEditar = p.estado !== "cancelado"

  const abrirMenu = e => {
    e.stopPropagation()
    if (menuAbierto === p.id) { setMenu(null); return }
    const r = e.currentTarget.getBoundingClientRect()
    const menuH = 160
    const abreArriba = r.bottom + menuH > window.innerHeight - 16
    setMenuPos({
      top: abreArriba ? r.top - menuH - 4 : r.bottom + 4,
      left: Math.min(r.right - 168, window.innerWidth - 184),
    })
    setMenu(p.id)
  }

  const menuItem = (label, icon, onClick, color) => (
    <button onClick={e=>{ e.stopPropagation(); onClick(); setMenu(null) }}
      style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 12px",
        background:"transparent", border:"none", fontSize:13, color: color||C.textDark,
        cursor:"pointer", fontFamily:"'Inter',sans-serif", textAlign:"left" }}
      onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
    >
      {icon}{label}
    </button>
  )

  return (
    <tr
      onClick={() => { if(hasSelection) onToggleSelect(p.id); else onVer(p); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#f5f5f5" : C.bg, borderBottom: `1px solid ${C.border}`, transition: "background 0.1s", cursor: "pointer" }}
    >
      {/* Código + cliente */}
      <td style={{ padding: "12px 20px", position: "relative", paddingLeft: 34 }}>
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: (hasSelection || isSelected || hov) ? 1 : 0, transition: 'opacity 0.1s', pointerEvents: (hasSelection || isSelected || hov) ? 'auto' : 'none' }} onClick={e => { e.stopPropagation(); onToggleSelect(p.id); }}>
          <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ cursor: "pointer", width:14, height:14, margin:0, display:"block" }} />
        </div>
        {(!p.cliente_nombre || p.cliente_nombre === "Consumidor Final") ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textBlack, fontFamily: "'Inter',sans-serif", marginBottom: 2 }}>
              {fCodigo(p.codigo, p.id)}
            </div>
            <div style={{ fontSize: 11, color: C.textMid, fontFamily: "'Inter',sans-serif" }}>
              Consumidor Final
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textBlack, fontFamily: "'Inter',sans-serif", marginBottom: 2 }}>
              {p.cliente_nombre}
            </div>
            <div style={{ fontSize: 11, color: C.textMid, fontFamily: "'Inter',sans-serif" }}>
              {fCodigo(p.codigo, p.id)}
            </div>
          </>
        )}
      </td>

      {/* Fecha */}
      <td style={{ padding: "12px 20px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 13, color: C.textDark, fontFamily: "'Inter',sans-serif" }}>
          {fFecha(p.fecha_pedido || p.created_at)}
        </span>
      </td>

      {/* Estado */}
      <td style={{ padding: "12px 20px", verticalAlign: "middle" }}>
        <Badge {...estCfg} />
      </td>

      {/* Pago */}
      <td style={{ padding: "12px 20px", verticalAlign: "middle" }}>
        <Badge {...pagoCfg} />
      </td>

      {/* Total */}
      <td style={{ padding: "12px 20px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: "'Inter',sans-serif" }}>
          {fMonto(p.total)}
        </span>
      </td>

      {/* Acciones — 3 puntitos */}
      <td style={{ padding: "12px 16px", verticalAlign: "middle" }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative" }}>
          <button onClick={abrirMenu} title="Más acciones"
            style={{
              width: 30, height: 30, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${menuAbierto === p.id ? C.border : "transparent"}`,
              background: menuAbierto === p.id ? "#f9fafb" : "transparent",
              cursor: "pointer", transition: "all 0.12s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background="#f9fafb"; e.currentTarget.style.borderColor=C.border }}
            onMouseLeave={e=>{ if(menuAbierto!==p.id){ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent" } }}
          >
            <MoreHorizontal size={15} color={C.textMid} strokeWidth={1.8}/>
          </button>

          {menuAbierto === p.id && (
            <div onClick={e=>e.stopPropagation()} style={{
              position: "fixed", top: menuPos.top, left: menuPos.left,
              width: 168, background: C.bg, borderRadius: 8,
              border: `1px solid ${C.border}`,
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)", zIndex: 9999, padding: "4px 0",
            }}>
              {menuItem("Ver detalle", <Eye size={14} color={C.textMid}/>, ()=>onVer(p))}
              {puedeEditar && menuItem("Editar", <Edit size={14} color={C.textMid}/>, ()=>onEditar(p))}
              <div style={{ height:1, background:C.border, margin:"4px 0" }}/>
              {menuItem("Eliminar", <Trash2 size={14} color="#DC2626"/>, ()=>onEliminar(p.id), "#DC2626")}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ─── Card mobile por venta — botones grandes ─── */
const MobileCard = ({ p, onVer, onEditar, onEliminar, isSelected, onToggleSelect, hasSelection }) => {
  const [expanded, setExpanded] = useState(false)
  const estCfg  = ESTADOS[p.estado] || ESTADOS.pendiente
  const pagoCfg = getEstadoPago(p)
  const puedeEditar = p.estado !== "cancelado"

  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`,
      background: C.bg,
    }}>
      {/* Fila principal — tap abre/cierra acciones */}
      <div
        onClick={() => { if(hasSelection) onToggleSelect(p.id); else setExpanded(v => !v); }}
        style={{ padding: "14px 16px", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 10 }}>
          {(hasSelection || isSelected) && (
            <div style={{ display:'flex', alignItems:'center', paddingTop: 2 }} onClick={e => { e.stopPropagation(); onToggleSelect(p.id); }}>
              <input type="checkbox" checked={isSelected} onChange={()=>{}} style={{ width:18, height:18 }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
            {(!p.cliente_nombre || p.cliente_nombre === "Consumidor Final") ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.textBlack, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {fCodigo(p.codigo, p.id)}
                </div>
                <div style={{ fontSize: 12, color: C.textMid }}>
                  Consumidor Final · {fFecha(p.fecha_pedido || p.created_at)}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.textBlack, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.cliente_nombre}
                </div>
                <div style={{ fontSize: 12, color: C.textMid }}>
                  {fCodigo(p.codigo, p.id)} · {fFecha(p.fecha_pedido || p.created_at)}
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.textBlack, lineHeight: 1, marginBottom: 4 }}>
              {fMonto(p.total)}
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <Badge {...estCfg} />
              <Badge {...pagoCfg} />
            </div>
          </div>
        </div>
        {/* Indicador expand */}
        <div style={{ textAlign: "center", fontSize: 10, color: C.textLight, marginTop: 2 }}>
          {expanded ? "▲ cerrar" : "▼ acciones"}
        </div>
      </div>

      {/* Panel de acciones — aparece al tap */}
      {expanded && (
        <div onClick={e => e.stopPropagation()} style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, padding: "0 12px 14px",
          borderTop: `1px solid ${C.border}`,
          paddingTop: 12,
        }}>
          {/* Ver detalle — ocupa todo el ancho */}
          <button
            onClick={() => { setExpanded(false); onVer(p) }}
            style={{
              gridColumn: "1 / -1",
              height: 48, borderRadius: 10,
              background: C.primary, color: "#fff",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontSize: 14, fontWeight: 700, fontFamily: "'Inter',sans-serif",
            }}
          >
            <Eye size={16}/> Ver detalle
          </button>
          {puedeEditar && (
            <button
              onClick={() => { setExpanded(false); onEditar(p) }}
              style={{
                height: 44, borderRadius: 10,
                background: C.bg, color: C.textDark,
                border: `1.5px solid ${C.border}`, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif",
              }}
            >
              <Edit size={14}/> Editar
            </button>
          )}
          <button
            onClick={() => { setExpanded(false); onEliminar(p.id) }}
            style={{
              height: 44, borderRadius: 10,
              background: "#FEF2F2", color: "#DC2626",
              border: `1.5px solid #FECACA`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif",
            }}
          >
            <Trash2 size={14}/> Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
export default function PedidosNimbus({
  pedidos = [],
  clientes = [],
  searchTerm = "",
  setSearchTerm,
  openModal,
  actualizarEstadoPedido,
  eliminarPedido,
  recargarDatos,
  onNuevaVenta,
  onOpenMobileSidebar,
  formActions = {},
}) {
  const [filtroEstado, setFiltroEstado] = useState(null)
  const [filtroCanalVenta, setFiltroCanalVenta] = useState("")
  const [soloDeuda, setSoloDeuda] = useState(false)
  const [pagina,       setPagina]      = useState(1)
  const [busqueda, setBusqueda] = useState(searchTerm||"")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [menuAbierto,       setMenu]              = useState(null)
  const [menuPos,           setMenuPos]           = useState({ top:0, left:0 })
  const [selectedIds, setSelectedIds] = useState([])
  // Sync búsqueda ↔ searchTerm global
  useEffect(()=>{ const t=setTimeout(()=>setSearchTerm?.(busqueda),200); return()=>clearTimeout(t) }, [busqueda])
  useEffect(()=>{ setPagina(1) }, [busqueda,filtroEstado,soloDeuda,itemsPerPage])
  useEffect(()=>{ const h=()=>setMenu(null); window.addEventListener('click',h); return()=>window.removeEventListener('click',h) }, [])

  /* ── Ctrl solo → Nueva Venta ── */
  useEffect(()=>{
    let ctrlPressed=false; let otherKey=false
    const kd = e => { if(e.key==='Control'){ctrlPressed=true}else if(ctrlPressed){otherKey=true} }
    const ku = e => {
      if(e.key==='Control'){
        if(!otherKey){
          const active=document.activeElement
          if(!active||!['INPUT','TEXTAREA','SELECT'].includes(active.tagName)) onNuevaVenta?.()
        }
        ctrlPressed=false; otherKey=false
      }
    }
    window.addEventListener('keydown',kd); window.addEventListener('keyup',ku)
    return ()=>{ window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku) }
  },[onNuevaVenta])

  const pedidosSeguros = Array.isArray(pedidos) ? pedidos : []

  const filtrados = pedidosSeguros.filter(p => {
    const q = busqueda.toLowerCase()
    const items = (() => { try { const it=typeof p.items==="string"?JSON.parse(p.items):(p.items||[]); return it.map(i=>i.producto||i.nombre||"").join(" ").toLowerCase() } catch { return "" } })()
    const okQ   = !q || String(p.codigo||"").toLowerCase().includes(q) || String(p.cliente_nombre||"").toLowerCase().includes(q) || items.includes(q)
    const okE   = !filtroEstado || p.estado===filtroEstado
    const okD   = !soloDeuda || parseFloat(p.saldo_pendiente)>0.01
    const okC   = !filtroCanalVenta || p.canal_venta===filtroCanalVenta
    return okQ&&okE&&okD&&okC
  }).sort((a,b)=>new Date(b.fecha_pedido||b.created_at)-new Date(a.fecha_pedido||a.created_at))

  const totalPags = Math.max(1,Math.ceil(filtrados.length/itemsPerPage))
  const offset    = (pagina-1)*itemsPerPage
  const pageItems = filtrados.slice(offset,offset+itemsPerPage)

  // Resumen
  const resumen = {
    total:      pedidosSeguros.length,
    pendientes: pedidosSeguros.filter(p=>p.estado==="pendiente").length,
    enProceso:  pedidosSeguros.filter(p=>p.estado==="preparando").length,
    entregados: pedidosSeguros.filter(p=>p.estado==="entregado").length,
  }
  const pedidosConDeuda = pedidosSeguros.filter(p=>parseFloat(p.saldo_pendiente)>0.01)
  const totalDeuda      = pedidosConDeuda.reduce((s,p)=>s+(parseFloat(p.saldo_pendiente)||0),0)

  // Canales disponibles en los pedidos actuales
  const canalesDisponibles = useMemo(() => {
    const fromPedidos = [...new Set(pedidosSeguros.map(p => p.canal_venta).filter(Boolean))]
    try { const ls = localStorage.getItem('gestify_canales_venta'); if(ls) { const saved = JSON.parse(ls); return [...new Set([...saved, ...fromPedidos])] } } catch {}
    return fromPedidos
  }, [pedidosSeguros])

  const [confirmData, setConfirmData] = useState(null)

  const handleVer      = p => setSelectedPedido(p)
  const handleEditar   = p => openModal?.("editar-pedido", p)
  const handleEliminar = id => setConfirmData({
    title: "¿Eliminar esta venta?",
    description: "Se eliminará permanentemente. Esta acción no se puede deshacer.",
    onConfirm: () => { setConfirmData(null); eliminarPedido?.(id).then(r=>{ if(r?.success) recargarDatos?.() }) },
  })

  return (
    <div style={{ minHeight:"100vh", background:C.pageBg, fontFamily:"'Inter',sans-serif" }}>
      <style>{RESPONSIVE}</style>

      {/* ── Mobile topbar ── */}
      <div className="pn-show-mobile" style={{
        alignItems:"center", gap:0, padding:"0 12px",
        height: 54,
        background:C.bg, borderBottom:`1px solid ${C.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <button onClick={onOpenMobileSidebar}
          style={{ background:"none",border:"none",cursor:"pointer",padding:8,display:"flex",alignItems:"center",flexShrink:0 }}>
          <MenuIcon size={22} color={C.textBlack}/>
        </button>
        <span style={{ flex:1, textAlign:"center", fontWeight:700, fontSize:17, color:C.textBlack, fontFamily:"'Inter',sans-serif", letterSpacing:'-0.2px' }}>Ventas</span>
        <button onClick={onNuevaVenta} style={{
          display:"flex", alignItems:"center", gap:5, flexShrink:0,
          height:36, padding:"0 14px", borderRadius:8, fontSize:13, fontWeight:700,
          background:C.primary, color:"#fff", border:"none", cursor:"pointer",
          fontFamily:"'Inter',sans-serif",
        }}>
          <PlusIcon size={14} color="#fff"/> Nueva
        </button>
      </div>

      {/* ── Desktop header ── */}
      <div className="pn-hide-mobile" style={{ background:C.pageBg }}>
        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px 12px", gap:12, boxSizing:"border-box" }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:C.textBlack, letterSpacing:"-0.3px" }}>
            Ventas
          </h1>
          <Btn primary onClick={onNuevaVenta}>
            <PlusIcon size={13} color="#fff"/> Nueva venta
            <span style={{ marginLeft: 4, padding: "2px 5px", background: "rgba(0,0,0,0.15)", borderRadius: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 500 }} className="pn-hide-mobile">Ctrl</span>
          </Btn>
        </div>
      </div>

      {/* ── Contenido centrado ── */}
      <div style={{ maxWidth:1100, margin:"0 auto", width:"100%" }}>

      {/* ── Tarjetas resumen clicables ── */}
      <div style={{ padding:"14px 24px 0", display:"flex", gap:10, flexWrap:"wrap" }}>
        <StatCard
          label="Total ventas" value={resumen.total} color={C.textBlack}
          active={false}
          onClick={() => { setFiltroEstado(null); setSoloDeuda(false); setFiltroCanalVenta(null) }}
        />
        <StatCard
          label="Pendientes" value={resumen.pendientes} color="#D97706"
          active={filtroEstado==="pendiente"}
          onClick={() => setFiltroEstado(v => v==="pendiente" ? null : "pendiente")}
        />
        <StatCard
          label="En proceso" value={resumen.enProceso} color="#2563EB"
          active={filtroEstado==="preparando"}
          onClick={() => setFiltroEstado(v => v==="preparando" ? null : "preparando")}
        />
        <StatCard
          label="Entregados" value={resumen.entregados} color="#16A34A"
          active={filtroEstado==="entregado"}
          onClick={() => setFiltroEstado(v => v==="entregado" ? null : "entregado")}
        />
        {/* Deuda */}
        <StatCard
          label={soloDeuda ? "▼ Con deuda" : "Saldo deudor"}
          value={fMonto(totalDeuda)}
          sub={`${pedidosConDeuda.length} venta${pedidosConDeuda.length!==1?"s":""}  con saldo`}
          color="#DC2626"
          active={soloDeuda}
          onClick={() => setSoloDeuda(v => !v)}
        />
      </div>

      {/* ── Filtros ── */}
      <div style={{
        background:C.pageBg, padding:"12px 24px 0",
        display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
      }}>
        {/* Buscador */}
        <div style={{ flex:"1 1 260px", position:"relative" }}>
          <div style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}>
            <SearchIcon size={15} color={C.textLight}/>
          </div>
          <input type="text" value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, código o producto"
            style={{
              width:"100%", height:36, padding:"0 12px 0 34px", fontSize:13,
              border:`1px solid ${C.border}`, borderRadius:8, outline:"none",
              background:C.bg, color:C.textDark,
              fontFamily:"'Inter',sans-serif", boxSizing:"border-box",
            }}
            onFocus={e=>e.target.style.borderColor=C.primary}
            onBlur={e =>e.target.style.borderColor=C.border}
          />
        </div>

        {/* Selector de Canal de Venta */}
        {canalesDisponibles.length > 0 && (
          <Select value={filtroCanalVenta} onValueChange={setFiltroCanalVenta}>
            <SelectTrigger className="pn-select-trigger w-full max-w-[180px] h-9 text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
              <SelectValue placeholder="CANAL" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", zIndex: 10000, color: "#000", minWidth: 180 }}>
              <SelectGroup>
                <SelectItem value="">CANAL</SelectItem>
                {canalesDisponibles.map(canal => (
                  <SelectItem key={canal} value={canal}>{canal}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {/* ── BOTONERA MINIMALISTA SELECCIÓN MÚLTIPLE ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

          
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                setConfirmData({
                  title: `¿Eliminar ${selectedIds.length} ventas?`,
                  description: "Esta acción no se puede deshacer.",
                  onConfirm: () => {
                    setConfirmData(null)
                    // Hacemos el loop enviando un id por vez en background para que no bloquee y se sienta instantáneo
                    if (eliminarPedido) {
                      const ids = [...selectedIds] // clonar
                      setSelectedIds([])
                      Promise.all(ids.map(id => eliminarPedido(id))).then(() => {
                        recargarDatos?.()
                      })
                    } else {
                      setSelectedIds([])
                    }
                  }
                })
              }}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:8, background:"#FEF2F2", color:"#DC2626", border:"1px solid #FECACA", cursor:"pointer", transition:"all.1s" }}
              title={`Eliminar ${selectedIds.length} ventas`}
            >
              <Trash2 size={16}/>
            </button>
          )}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div style={{ padding:"10px 24px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <p style={{ margin:0, fontSize:13, color:C.textMid }}>
            {filtrados.length} venta{filtrados.length!==1?"s":""}
            {soloDeuda && <span style={{ marginLeft:8, fontSize:11, fontWeight:700, color:"#DC2626", background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:4, padding:"1px 7px" }}>Con deuda</span>}
          </p>
          {soloDeuda && (
            <button onClick={()=>setSoloDeuda(false)}
              style={{ fontSize:11, fontWeight:600, color:C.textMid, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>
              Mostrar todas
            </button>
          )}
        </div>

        <div style={{ background:C.bg, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          {filtrados.length===0 ? (
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", padding:"60px 24px", gap:14,
            }}>
              <div style={{
                width:60, height:60, borderRadius:14, background:C.primarySurf,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <FileIcon size={28} color={C.primary}/>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:15, fontWeight:600, color:C.textBlack, marginBottom:4 }}>
                  No se encontraron ventas
                </div>
                <div style={{ fontSize:13, color:C.textMid }}>
                  Intentá con otra búsqueda o registrá una nueva venta.
                </div>
              </div>
              <Btn primary onClick={onNuevaVenta}>
                <PlusIcon size={14} color="#fff"/> Nueva venta
              </Btn>
            </div>
          ) : (
            <>
              {/* Cards mobile */}
              <div className="pn-show-mobile" style={{ flexDirection:"column" }}>
                {pageItems.map(p=>(
                  <MobileCard key={p.id} p={p}
                    onVer={handleVer} onEditar={handleEditar} onEliminar={handleEliminar}
                    isSelected={selectedIds.includes(p.id)}
                    onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                    hasSelection={selectedIds.length > 0}
                  />
                ))}
              </div>

              {/* Tabla desktop */}
              <div className="pn-hide-mobile" style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ borderBottom:`1px solid ${C.border}`, background:"#f9fafb" }}>
                      <th style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:C.textMid, letterSpacing:"0.06em", fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap", position:"relative", paddingLeft: 34 }}>
                        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: selectedIds.length > 0 ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: selectedIds.length > 0 ? 'auto' : 'none' }}>
                          <input type="checkbox" 
                             checked={pageItems.length > 0 && pageItems.every(p => selectedIds.includes(p.id))} 
                             onChange={(e) => {
                               if (e.target.checked) setSelectedIds(prev => [...new Set([...prev, ...pageItems.map(p=>p.id)])])
                               else setSelectedIds(prev => prev.filter(id => !pageItems.some(p => p.id === id)))
                             }} 
                             style={{ cursor:"pointer", width:14, height:14, margin:0, display:"block" }} 
                          />
                        </div>
                        CLIENTE
                      </th>
                      {["FECHA","ESTADO","PAGO","TOTAL","ACCIONES"].map(h=>(
                        <th key={h} style={{
                          padding:"10px 20px", textAlign:"left",
                          fontSize:11, fontWeight:600, color:C.textMid,
                          letterSpacing:"0.06em", fontFamily:"'Inter',sans-serif",
                          whiteSpace:"nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(p=>(
                      <Row key={p.id} p={p}
                        onVer={handleVer} onEditar={handleEditar}
                        onEliminar={handleEliminar}
                        menuAbierto={menuAbierto} setMenu={setMenu}
                        menuPos={menuPos} setMenuPos={setMenuPos}
                        isSelected={selectedIds.includes(p.id)}
                        onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                        hasSelection={selectedIds.length > 0}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Paginación */}
          {totalPags>1 && (
            <div className="flex items-center justify-between gap-4" style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 12, color: C.textMid }}>Filas por página:</span>
                <Select value={String(itemsPerPage)} onValueChange={v => setItemsPerPage(Number(v))}>
                  <SelectTrigger className="pn-select-trigger w-20 h-8" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                    <SelectGroup>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ fontSize: 12, color: C.textMid }}>
                {offset+1}–{Math.min(offset+itemsPerPage,filtrados.length)} de {filtrados.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagina(p => Math.max(1, p-1))}
                  disabled={pagina === 1}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg,
                    cursor: pagina === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: pagina === 1 ? 0.4 : 1,
                  }}
                >
                  <ChevronLeftIcon size={14} color={C.textMid}/>
                </button>
                <span style={{ fontSize: 12, color: C.textDark, minWidth: 52, textAlign: "center" }}>
                  {pagina} / {totalPags}
                </span>
                <button
                  onClick={() => setPagina(p => Math.min(totalPags, p+1))}
                  disabled={pagina === totalPags}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg,
                    cursor: pagina === totalPags ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: pagina === totalPags ? 0.4 : 1,
                  }}
                >
                  <ChevronRightIcon size={14} color={C.textMid}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      </div>{/* end maxWidth wrapper */}

      <ConfirmDialog
        open={!!confirmData}
        title={confirmData?.title}
        description={confirmData?.description}
        onConfirm={confirmData?.onConfirm}
        onCancel={()=>setConfirmData(null)}
      />

      {/* ── Detalle venta — shadcn Dialog ── */}
      <Dialog open={!!selectedPedido} onOpenChange={open => { if (!open) setSelectedPedido(null) }}>
        <DialogContent
          className="w-[min(680px,calc(100vw-1rem))] max-w-none gap-0 border border-[#e5e7eb] bg-white p-0 text-[#111827] shadow-2xl ring-0 sm:max-w-none"
          showCloseButton={false}
          style={{
            maxHeight: "min(92vh, 820px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Detalle de venta</DialogTitle>
          </DialogHeader>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: "#d1d1d1 transparent" }}>
            {selectedPedido && (
              <PedidoDetail
                pedido={selectedPedido}
                clientes={clientes}
                formActions={{
                  actualizarEstadoPedido,
                  ...formActions,
                }}
                closeModal={() => setSelectedPedido(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
