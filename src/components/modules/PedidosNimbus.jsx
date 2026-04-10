/**
 * PedidosNimbus.jsx — módulo Ventas con estética TiendaNube
 * Misma interfaz de props que Pedidos.jsx
 */
import { useState, useEffect } from "react"
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  SearchIcon, PlusIcon, EditIcon, TrashIcon,
  ChevronLeftIcon, ChevronRightIcon, MenuIcon,
  FileIcon, EyeIcon, CheckCircleIcon, CloseIcon,
  CheckIcon,
} from "@nimbus-ds/icons"
import {
  Clock, Package, Truck, CheckCircle, XCircle,
  DollarSign, Eye, Edit, Trash2, MoreHorizontal,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
    .pn-show-mobile { display: flex !important; }
    .pn-hide-mobile { display: none !important; }
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
const Btn = ({ children, onClick, primary, small, disabled }) => {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:"inline-flex", alignItems:"center", gap:6,
        height: small?28:32, padding:`0 ${small?12:18}px`,
        borderRadius:6, cursor:disabled?"not-allowed":"pointer",
        fontSize:small?12:13, fontWeight:500, fontFamily:"'Inter',sans-serif",
        transition:"background 0.12s",
        border: primary ? "none" : `1.5px solid ${hov?C.borderMd:C.border}`,
        background: primary ? (hov?C.primaryHov:C.primary) : (hov?"#f3f4f6":C.bg),
        color: primary?"#fff":C.textDark,
        opacity:disabled?0.5:1, whiteSpace:"nowrap",
      }}
    >{children}</button>
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

/* ─── Tarjeta resumen ─── */
const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background:C.bg, borderRadius:8, border:`1px solid ${C.border}`,
    padding:"12px 16px", flex:"1 1 120px",
  }}>
    <div style={{ fontSize:20, fontWeight:700, color: color||C.textBlack, lineHeight:1, marginBottom:3 }}>
      {value}
    </div>
    <div style={{ fontSize:11, fontWeight:600, color:C.textDark, marginBottom:2 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:C.textMid }}>{sub}</div>}
  </div>
)

/* ─── Fila venta ─── */
const Row = ({ p, onVer, onEditar, onEliminar, menuAbierto, setMenu, menuPos, setMenuPos }) => {
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
      onClick={() => onVer(p)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#f5f5f5" : C.bg, borderBottom: `1px solid ${C.border}`, transition: "background 0.1s", cursor: "pointer" }}
    >
      {/* Código + cliente */}
      <td style={{ padding: "12px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: "'Inter',sans-serif", marginBottom: 2 }}>
          {p.cliente_nombre || "Sin nombre"}
        </div>
        <div style={{ fontSize: 11, color: C.textMid, fontFamily: "'Inter',sans-serif" }}>
          #{p.codigo || p.id?.toString().slice(-4)}
        </div>
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
  const [filtroEstado, setFiltroEstado] = useState(() => { try { return localStorage.getItem("gestify_filtro_estado")||"todos" } catch { return "todos" } })
  const [soloDeuda, setSoloDeuda] = useState(false)
  const [pagina,       setPagina]      = useState(1)
  const [busqueda, setBusqueda] = useState(searchTerm||"")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [menuAbierto,       setMenu]              = useState(null)
  const [menuPos,           setMenuPos]           = useState({ top:0, left:0 })

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
    const okE   = filtroEstado==="todos" || p.estado===filtroEstado
    const okD   = !soloDeuda || parseFloat(p.saldo_pendiente)>0.01
    return okQ&&okE&&okD
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
        alignItems:"center", gap:10, padding:"11px 16px",
        background:C.bg, borderBottom:`1px solid ${C.border}`,
      }}>
        <button onClick={onOpenMobileSidebar}
          style={{ background:"none",border:"none",cursor:"pointer",padding:4,display:"flex" }}>
          <MenuIcon size={20} color={C.textBlack}/>
        </button>
        <span style={{ fontWeight:700, fontSize:17, color:C.textBlack }}>Ventas</span>
        <button onClick={onNuevaVenta} style={{
          marginLeft:"auto", display:"flex", alignItems:"center", gap:5,
          height:32, padding:"0 12px", borderRadius:8, fontSize:13, fontWeight:600,
          background:C.primary, color:"#fff", border:"none", cursor:"pointer",
        }}>
          <PlusIcon size={13} color="#fff"/> Nueva
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

      {/* ── Tarjetas resumen ── */}
      <div style={{ padding:"14px 24px 0", display:"flex", gap:10, flexWrap:"wrap" }}>
        <StatCard label="Total ventas"  value={resumen.total}       color={C.textBlack}/>
        <StatCard label="Pendientes"    value={resumen.pendientes}   color="#D97706"/>
        <StatCard label="En proceso"    value={resumen.enProceso}    color="#2563EB"/>
        <StatCard label="Entregados"    value={resumen.entregados}   color="#16A34A"/>
        {/* Deuda */}
        <div
          onClick={()=>setSoloDeuda(v=>!v)}
          style={{
            background: soloDeuda ? "#FEF2F2" : C.bg,
            borderRadius:8, border:`1.5px solid ${soloDeuda ? "#FCA5A5" : C.border}`,
            padding:"12px 16px", flex:"1 1 150px", cursor:"pointer",
            transition:"all .13s",
          }}
          onMouseEnter={e=>{ if(!soloDeuda){ e.currentTarget.style.borderColor="#FCA5A5"; e.currentTarget.style.background="#FEF2F2" } }}
          onMouseLeave={e=>{ if(!soloDeuda){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.bg } }}
        >
          <div style={{ fontSize:20, fontWeight:700, color:"#DC2626", lineHeight:1, marginBottom:3 }}>
            {fMonto(totalDeuda)}
          </div>
          <div style={{ fontSize:11, fontWeight:600, color:C.textDark, marginBottom:2 }}>
            {soloDeuda ? "▼ Saldo deudor" : "Saldo deudor"}
          </div>
          <div style={{ fontSize:11, color:C.textMid }}>{pedidosConDeuda.length} venta{pedidosConDeuda.length!==1?"s":""} pendientes</div>
        </div>
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

        <select value={filtroEstado} onChange={e=>{ setFiltroEstado(e.target.value); try{localStorage.setItem("gestify_filtro_estado",e.target.value)}catch{} }} className="app-select app-select--inline" style={{ minWidth: 168 }}>
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="preparando">Preparando</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>

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
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${C.border}`, background:"#f9fafb" }}>
                    {["CLIENTE","FECHA","ESTADO","PAGO","TOTAL","ACCIONES"].map(h=>(
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
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPags>1 && (
            <div className="flex items-center justify-between gap-4" style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 12, color: C.textMid }}>Filas por página:</span>
                <Select value={String(itemsPerPage)} onValueChange={v => setItemsPerPage(Number(v))}>
                  <SelectTrigger className="w-20 h-8" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
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
