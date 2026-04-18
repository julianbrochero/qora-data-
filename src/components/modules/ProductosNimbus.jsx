/**
 * ProductosNimbus.jsx — estética TiendaNube
 */
import { useState, useEffect, useRef } from "react"
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  SearchIcon, PlusIcon,
  DownloadIcon, TagIcon, BoxPackedIcon,
  ChevronLeftIcon, ChevronRightIcon,
  MenuIcon, EyeOffIcon,
} from "@nimbus-ds/icons"
import { CheckCircle, AlertTriangle, Upload, MoreHorizontal, Edit, Trash2, ShoppingCart } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"
import { useAuth } from "../../lib/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const C = {
  pageBg:    "#f8f9fb",
  bg:        "#ffffff",
  border:    "#d1d5db",
  borderMd:  "#9ca3af",
  primary:   "#334139",
  primaryHov:"#2b352f",
  primarySurf:"#eaf0eb",
  successTxt:"#065f46", successSurf:"#d1fae5", successBord:"#6ee7b7",
  warnTxt:   "#92400e", warnSurf:  "#fef3c7", warnBord:   "#fcd34d",
  dangerTxt: "#991b1b", dangerSurf:"#fee2e2", dangerBord: "#fca5a5",
  textBlack: "#0d0d0d",
  textDark:  "#111827",
  textMid:   "#6b7280",
  textLight: "#9ca3af",
}

const fmtP = (n) =>
  Number(n||0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })

const PER_PAGE = 15

const RESPONSIVE = `
  .pn-show-mobile { display: none; }
  .pn-hide-mobile { display: flex; }
  @media (max-width: 767px) {
    .pn-show-mobile { display: flex !important; }
    .pn-hide-mobile { display: none !important; }
  }
`

/* ─── Pill ─── */
const Pill = ({ children, color, bg, border }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:3,
    padding:"2px 7px", borderRadius:4,
    fontSize:11, fontWeight:500, lineHeight:1.7,
    color: color||C.textDark, background: bg||"#f3f4f6",
    border:`1px solid ${border||C.border}`,
    fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap",
  }}>{children}</span>
)

/* ─── Botón — más alargado, menos altura (TiendaNube style) ─── */
const Btn = ({ children, onClick, primary, disabled, style={} }) => {
  if (primary) return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display:"inline-flex", alignItems:"center", gap:6,
        height:32, padding:"0 16px", borderRadius:8,
        background:"#334139", color:"#fff",
        border:"1.5px solid #334139",
        fontSize:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
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
      size="sm"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={style}
    >
      {children}
    </Button>
  )
}

/* ─── Celda inline editable ─── */
const InlineCell = ({ value, onSave, prefix="$" }) => {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState("")
  const inputRef = useRef(null)

  const start = () => { setVal(String(value ?? "")); setEditing(true); setTimeout(()=>inputRef.current?.select(),30) }
  const save  = () => { setEditing(false); const n=parseFloat(val); if(!isNaN(n) && n!==parseFloat(value)) onSave(n===0?null:n) }
  const cancel= () => setEditing(false)

  if (editing) return (
    <input ref={inputRef} type="number" value={val} min="0" step="0.01" autoFocus
      onChange={e=>setVal(e.target.value)}
      onBlur={save}
      onKeyDown={e=>{ if(e.key==="Enter"){e.preventDefault();save()} if(e.key==="Escape") cancel() }}
      style={{
        width:90, height:28, padding:"0 6px", fontSize:13,
        border:`1.5px solid ${C.primary}`, borderRadius:6,
        background:C.bg, color:C.textDark,
        fontFamily:"'Inter',sans-serif", outline:"none", textAlign:"right",
      }}
    />
  )

  return (
    <span
      onClick={start}
      title="Click para editar"
      style={{
        fontSize:13, fontWeight:500, color:C.textDark, cursor:"text",
        display:"inline-block", padding:"3px 6px", borderRadius:5,
        border:"1.5px solid transparent",
        transition:"border-color 0.1s",
      }}
      onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderMd}
      onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}
    >
      {value!=null && value!=='' && parseFloat(value)!==0 ? fmtP(value) : <span style={{color:C.textLight}}>—</span>}
    </span>
  )
}

/* ─── Card Mobile ─── */
const MobileCard = ({ prod, onEdit, onDel, onAgregarAlCarrito, isSelected, onToggleSelect }) => {
  const [hov, setHov] = useState(false)
  const sinStock  = prod.controlaStock && (prod.stock ?? 0) <= 0
  const stockBajo = prod.controlaStock && (prod.stock ?? 0) > 0 && (prod.stock ?? 0) <= (prod.stock_minimo||5)

  return (
    <div 
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onEdit(prod)}
      style={{
        padding: "12px 16px",
        background: isSelected ? C.primarySurf : C.bg,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "relative"
      }}
    >
      <div style={{
        position: "absolute",
        left: 8,
        top: 8,
        zIndex: 10,
        opacity: (isSelected || hov) ? 1 : 0,
        pointerEvents: (isSelected || hov) ? "auto" : "none",
        transition: "opacity 0.15s"
      }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => { e.stopPropagation(); onToggleSelect(prod.id) }}
          style={{ width: 20, height: 20, cursor: "pointer", accentColor: C.primary }}
        />
      </div>

      <div style={{
        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
        background: "#f9fafb", border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {prod.imagen_url
          ? <img src={prod.imagen_url} alt={prod.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <BoxPackedIcon size={20} color={C.textLight} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: 14, fontWeight: 600, color: C.textDark, 
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
        }}>
          {prod.nombre}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{fmtP(prod.precio)}</span>
          {!prod.controlaStock ? (
             <span style={{ fontSize: 11, color: C.textMid }}>Stock: ∞</span>
          ) : (
            sinStock 
              ? <span style={{ fontSize: 11, color: "#DC2626", fontWeight: 600 }}>Sin stock</span>
              : stockBajo
                ? <span style={{ fontSize: 11, color: "#D97706", fontWeight: 600 }}>{prod.stock} bajo</span>
                : <span style={{ fontSize: 11, color: C.textMid }}>Stock: {prod.stock}</span>
          )}
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center" }}>
         <button 
          onClick={(e) => { e.stopPropagation(); onEdit(prod) }}
          style={{ background: "none", border: "none", padding: 8, cursor: "pointer" }}
        >
          <Edit size={16} color={C.textMid} />
        </button>
      </div>
    </div>
  )
}

/* ─── Fila producto ─── */
const Row = ({ prod, onEdit, onDel, onSaveField, onAgregarAlCarrito, menuAbierto, setMenu, menuPos, setMenuPos, isSelected, onToggleSelect }) => {
  const [hov, setHov] = useState(false)

  const abrirMenu = e => {
    e.stopPropagation()
    if (menuAbierto === prod.id) { setMenu(null); return }
    const r = e.currentTarget.getBoundingClientRect()
    const menuH = 110
    const abreArriba = r.bottom + menuH > window.innerHeight - 16
    setMenuPos({
      top: abreArriba ? r.top - menuH - 4 : r.bottom + 4,
      left: Math.min(r.right - 160, window.innerWidth - 176),
    })
    setMenu(prod.id)
  }

  const menuItem = (label, icon, onClick, color) => (
    <button onClick={e => { e.stopPropagation(); onClick(); setMenu(null) }}
      style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 12px",
        background:"transparent", border:"none", fontSize:13, color: color || C.textDark,
        cursor:"pointer", fontFamily:"'Inter',sans-serif", textAlign:"left" }}
      onMouseEnter={e => e.currentTarget.style.background="#f9fafb"}
      onMouseLeave={e => e.currentTarget.style.background="transparent"}
    >
      {icon}{label}
    </button>
  )
  const sinStock  = prod.controlaStock && prod.stock <= 0
  const stockBajo = prod.controlaStock && prod.stock > 0 && prod.stock <= (prod.stock_minimo||5)

  return (
    <tr
      onClick={() => onToggleSelect(prod.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#f5f5f5" : isSelected ? C.primarySurf : C.bg, borderBottom: `1px solid ${C.border}`, transition: "background 0.1s", cursor: "pointer" }}
    >
      {/* Nombre */}
      <td style={{ padding:"10px 16px", minWidth:200, maxWidth:320, position:"relative", paddingLeft: 34 }}>
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: (isSelected || hov) ? 1 : 0, transition: 'opacity 0.1s', pointerEvents: (isSelected || hov) ? 'auto' : 'none' }}>
          <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ cursor: "pointer", width:14, height:14, margin:0, display:"block", accentColor: C.primary }} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:6, flexShrink:0,
            background:"#f9fafb", border:`1px solid ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
          }}>
            {prod.imagen_url
              ? <img src={prod.imagen_url} alt={prod.nombre} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <BoxPackedIcon size={18} color={C.textLight}/>}
          </div>
          <div style={{ minWidth:0 }}>
            <div
              style={{
                fontSize:13, fontWeight:600, color:C.primary,
                fontFamily:"'Inter',sans-serif",
                wordBreak:"break-word",
              }}
            >{prod.nombre}</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:3 }}>
              {prod.codigo && <Pill>{prod.codigo}</Pill>}
              {prod.categoria && (
                <Pill color={C.primary} bg={C.primarySurf} border="#c6ddc8">{prod.categoria}</Pill>
              )}
              {prod.activo===false && (
                <Pill color={C.warnTxt} bg={C.warnSurf} border={C.warnBord}>
                  <EyeOffIcon size={10} color={C.warnTxt}/> Oculto
                </Pill>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Stock */}
      <td style={{ padding:"10px 16px", verticalAlign:"middle", whiteSpace:"nowrap" }}>
        {!prod.controlaStock
          ? <span style={{ fontSize:13, color:C.textMid }}>∞</span>
          : sinStock
            ? <Pill color={C.dangerTxt} bg={C.dangerSurf} border={C.dangerBord}>Sin stock</Pill>
            : stockBajo
              ? <Pill color={C.warnTxt} bg={C.warnSurf} border={C.warnBord}>{prod.stock} bajo</Pill>
              : <span style={{ fontSize:13, color:C.textDark }}>{prod.stock}</span>}
      </td>

      {/* Precio — editable inline */}
      <td style={{ padding:"10px 16px", verticalAlign:"middle", whiteSpace:"nowrap" }} onClick={e => e.stopPropagation()}>
        <InlineCell
          value={prod.precio}
          onSave={v => onSaveField(prod.id, "precio", v ?? 0)}
        />
      </td>

      {/* Costo — editable inline */}
      <td style={{ padding:"10px 16px", verticalAlign:"middle", whiteSpace:"nowrap" }} onClick={e => e.stopPropagation()}>
        <InlineCell
          value={prod.costo}
          onSave={v => onSaveField(prod.id, "costo", v)}
        />
      </td>

      <td style={{ padding:"8px 12px", verticalAlign:"middle" }} onClick={e => e.stopPropagation()}>
        <div style={{ position:"relative" }}>
          <button onClick={abrirMenu} title="Más acciones"
            style={{
              width:30, height:30, borderRadius:6,
              display:"flex", alignItems:"center", justifyContent:"center",
              border:`1px solid ${menuAbierto === prod.id ? C.border : "transparent"}`,
              background: menuAbierto === prod.id ? "#f9fafb" : "transparent",
              cursor:"pointer", transition:"all 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="#f9fafb"; e.currentTarget.style.borderColor=C.border }}
            onMouseLeave={e => { if(menuAbierto !== prod.id){ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent" } }}
          >
            <MoreHorizontal size={15} color={C.textMid} strokeWidth={1.8}/>
          </button>

          {menuAbierto === prod.id && (
            <div onClick={e => e.stopPropagation()} style={{
              position:"fixed", top:menuPos.top, left:menuPos.left,
              width:160, background:C.bg, borderRadius:8,
              border:`1px solid ${C.border}`,
              boxShadow:"0 8px 16px rgba(0,0,0,0.1)", zIndex:9999, padding:"4px 0",
            }}>
              {menuItem("Editar", <Edit size={14} color={C.textMid}/>, () => onEdit(prod))}
              {onAgregarAlCarrito && menuItem("Agregar al carrito", <ShoppingCart size={14} color={C.textMid}/>, () => onAgregarAlCarrito(prod))}
              <div style={{ height:1, background:C.border, margin:"4px 0" }}/>
              {menuItem("Eliminar", <Trash2 size={14} color="#DC2626"/>, () => onDel(prod), "#DC2626")}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ══════════════════════════════════════════ */
export default function ProductosNimbus({
  productos=[], searchTerm, setSearchTerm,
  openModal, eliminarProducto, eliminarMultiplesProductos, editarProducto, recargarProductos, onOpenMobileSidebar,
  categoriasDb=[], onAgregarAlCarrito,
}) {
  const { user } = useAuth()
  const [selectedIds, setSelectedIds] = useState([])
  const [csvMenuOpen, setCsvMenuOpen] = useState(false)
  const [showCsvHelp, setShowCsvHelp] = useState(false)
  const [filtroCat,    setFiltroCat]    = useState("todas")
  const [filtroStock,  setFiltroStock]  = useState("todos")
  const [pagina, setPagina] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [busqueda, setBusqueda] = useState(searchTerm||"")
  const [csvLoading,   setCsvLoading]   = useState(false)
  const [csvResultado, setCsvResultado] = useState(null)
  const [menuAbierto,  setMenu]         = useState(null)
  const [menuPos,      setMenuPos]      = useState({ top:0, left:0 })
  const csvInputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(()=>setSearchTerm?.(busqueda), 200)
    return ()=>clearTimeout(t)
  }, [busqueda])

  useEffect(() => {
    const h = () => { setMenu(null); setCsvMenuOpen(false) }
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [])

  useEffect(()=>{ setPagina(1) }, [busqueda,filtroCat,filtroStock,itemsPerPage])

  const filtrados = productos.filter(p => {
    const q = busqueda.toLowerCase()
    const okQ = !q||[p.nombre,p.codigo,p.categoria].some(v=>String(v||"").toLowerCase().includes(q))
    const okC = filtroCat==="todas"||p.categoria===filtroCat
    const okS =
      filtroStock==="sin-stock"  ? (p.controlaStock&&p.stock<=0) :
      filtroStock==="stock-bajo" ? (p.controlaStock&&p.stock>0&&p.stock<=5) : true
    return okQ&&okC&&okS
  })

  const totalPags = Math.max(1,Math.ceil(filtrados.length/itemsPerPage))
  const offset    = (pagina-1)*itemsPerPage
  const pageItems = filtrados.slice(offset,offset+PER_PAGE)

  const [confirmData, setConfirmData] = useState(null)
  const handleDel  = p => setConfirmData({ title:`¿Eliminar "${p.nombre}"?`, description:"Se eliminará permanentemente. Esta acción no se puede deshacer.", onConfirm:()=>{ setConfirmData(null); eliminarProducto?.(p.id) } })
  const handleEdit = p => openModal?.("editar-producto",p)

  const handleSaveField = async (prodId, field, value) => {
    if (!editarProducto) return
    await editarProducto(prodId, { [field]: value })
  }

  /* ── CSV EXPORT ── */
  const exportarCSV = () => {
    const headers = ['Código','Nombre','Categoría','Precio','Costo','Stock','Stock Mínimo','Descripción','Controla Stock']
    const rows = productos.map(p=>[
      p.codigo||'', (p.nombre||'').replace(/;/g,','), (p.categoria||'').replace(/;/g,','),
      p.precio||0, p.costo!=null?p.costo:'', p.stock||0,
      p.stock_minimo!=null?p.stock_minimo:'',
      (p.descripcion||'').replace(/;/g,',').replace(/\r?\n/g,' '),
      (p.controlastock||p.controlaStock)?'SI':'NO'
    ])
    const csv=[headers,...rows].map(r=>r.join(';')).join('\r\n')
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a'); a.href=url
    a.download=`productos_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  /* ── CSV PARSE ── */
  const parseLine = line => {
    const res=[]; let cur='',inQ=false
    for(let i=0;i<line.length;i++){
      const ch=line[i]
      if(ch==='"'){ if(inQ&&line[i+1]==='"'){cur+='"';i++} else inQ=!inQ }
      else if(ch===';'&&!inQ){ res.push(cur);cur='' }
      else cur+=ch
    }
    res.push(cur); return res
  }

  const parsearCSV = text => {
    const content=text.startsWith('\uFEFF')?text.slice(1):text
    const lines=content.split(/\r?\n/).filter(l=>l.trim())
    if(lines.length<2) return []
    const headers=parseLine(lines[0]).map(h=>h.trim())
    const col=name=>headers.findIndex(h=>h.toLowerCase()===name.toLowerCase())
    const colC=sub=>headers.findIndex(h=>h.toLowerCase().includes(sub.toLowerCase()))
    const isTN=headers.some(h=>h.toLowerCase().includes('identificador'))
    const prods=[]
    if(isTN){
      const iN=col('Nombre'),iSKU=col('SKU'),iCat=colC('Categoría'),iP=col('Precio'),iS=col('Stock'),iD=colC('Descripción'),iCosto=col('Costo'),iPV=colC('Valor de propiedad 1')
      let last=''
      for(let i=1;i<lines.length;i++){
        const cols=parseLine(lines[i])
        const nom=iN>=0?(cols[iN]||'').trim():''
        const pv=iPV>=0?(cols[iPV]||'').trim():''
        if(nom) last=nom; if(!last) continue; if(!nom&&!pv) continue
        let nf=nom||last; if(pv) nf=`${nom||last} - ${pv}`
        const pStr=iP>=0?(cols[iP]||'').trim():'', sStr=iS>=0?(cols[iS]||'').trim():''
        const cStr=iCosto>=0?(cols[iCosto]||'').trim():'', sku=iSKU>=0?(cols[iSKU]||'').trim():''
        const cleanN=s=>parseFloat(s.replace(/[^0-9,.-]/g,'').replace(/,/g,''))||0
        prods.push({nombre:nf,codigo:sku||null,categoria:iCat>=0?(cols[iCat]||'').trim():'',precio:cleanN(pStr),stock:parseInt(sStr)||0,costo:cStr?(cleanN(cStr)||null):null,controlastock:sStr!=='',descripcion:iD>=0?(cols[iD]||'').trim():''})
      }
    } else {
      const iCod=colC('Código'),iN=col('Nombre'),iCat=colC('Categoría'),iP=col('Precio'),iCosto=col('Costo'),iS=col('Stock'),iSM=colC('Stock Mínimo'),iD=colC('Descripción'),iCS=colC('Controla')
      for(let i=1;i<lines.length;i++){
        const cols=parseLine(lines[i])
        const nom=iN>=0?(cols[iN]||'').trim():''; if(!nom) continue
        const cleanN=s=>parseFloat((s||'').replace(/[^0-9,.-]/g,'').replace(',','.'))||0
        const costo=cols[iCosto]?(cleanN(cols[iCosto])||null):null
        const sm=iSM>=0&&cols[iSM]?(parseInt(cols[iSM])||null):null
        const obj={nombre:nom,codigo:iCod>=0?(cols[iCod]||'').trim()||null:null,categoria:iCat>=0?(cols[iCat]||'').trim():'',precio:cleanN(cols[iP]),stock:parseInt(cols[iS])||0,costo,controlastock:iCS>=0?(cols[iCS]||'').trim().toUpperCase()==='SI':false,descripcion:iD>=0?(cols[iD]||'').trim():''}
        if(sm!==null) obj.stock_minimo=sm
        prods.push(obj)
      }
    }
    return prods
  }

  /* ── CSV IMPORT (upsert: actualiza existentes, inserta nuevos) ── */
  const importarCSV = async file => {
    if(!file||!user) return
    setCsvLoading(true); setCsvResultado(null)
    try {
      const text = await file.text()
      const prods = parsearCSV(text)
      if(prods.length === 0){ setCsvResultado({tipo:'error',msg:'No se encontraron productos válidos.'}); return }

      // Índices para match rápido
      const porCodigo = new Map(productos.filter(p=>p.codigo).map(p=>[p.codigo.trim().toLowerCase(), p]))
      const porNombre = new Map(productos.map(p=>[p.nombre.trim().toLowerCase(), p]))

      // Generar códigos únicos para los que no tienen
      const existingCodes = new Set(productos.map(p=>p.codigo).filter(Boolean))
      let codeIdx = productos.length + 1
      const genCode = () => { let c; do{ c='PROD-'+String(codeIdx++).padStart(4,'0') }while(existingCodes.has(c)); existingCodes.add(c); return c }

      const toUpdate = [] // { id, fields }
      const toInsert = [] // full objects

      for(const p of prods) {
        const keyCode = p.codigo?.trim().toLowerCase()
        const keyNom  = p.nombre.trim().toLowerCase()

        const existing = (keyCode && porCodigo.get(keyCode)) || porNombre.get(keyNom)

        if(existing) {
          // Producto encontrado → actualizar precio (y costo/stock si vienen en el CSV)
          const fields = { precio: p.precio }
          if(p.costo != null) fields.costo = p.costo
          if(p.stock != null && p.stock > 0) fields.stock = p.stock
          toUpdate.push({ id: existing.id, fields })
        } else {
          toInsert.push({
            ...p,
            codigo: p.codigo || genCode(),
            user_id: user.id,
            created_at: new Date().toISOString()
          })
        }
      }

      let actualizados = 0, insertados = 0

      // Actualizar existentes uno a uno (Supabase no soporta batch update bien)
      for(const { id, fields } of toUpdate) {
        const { error } = await supabase.from('productos').update(fields).eq('id', id)
        if(!error) actualizados++
      }

      // Insertar nuevos en batches de 50
      for(let i = 0; i < toInsert.length; i += 50) {
        const batch = toInsert.slice(i, i+50)
        const { data, error } = await supabase.from('productos').insert(batch).select()
        if(error) throw error
        insertados += data.length
      }

      const partes = []
      if(actualizados > 0) partes.push(`${actualizados} actualizado${actualizados!==1?'s':''}`)
      if(insertados  > 0) partes.push(`${insertados} nuevo${insertados!==1?'s':''}`)
      const resumen = partes.length ? partes.join(' · ') : 'Sin cambios'
      setCsvResultado({tipo:'ok', msg:`CSV procesado — ${resumen}.`})
      recargarProductos?.()
    } catch(e){ setCsvResultado({tipo:'error', msg: e.message}) }
    finally{ setCsvLoading(false); if(csvInputRef.current) csvInputRef.current.value='' }
  }

  const cats = ["todas",...new Set(productos.map(p=>p.categoria).filter(Boolean))]

  return (
    <div style={{ minHeight:"100vh", background:C.pageBg, fontFamily:"'Inter',sans-serif" }}>
      <style>{RESPONSIVE}</style>

      {/* ── Mobile topbar ── */}
      <div className="pn-show-mobile" style={{
        alignItems:"center", gap:10, padding:"11px 16px",
        background:C.bg, borderBottom:`1px solid ${C.border}`,
      }}>
        <button onClick={onOpenMobileSidebar}
          style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex" }}>
          <MenuIcon size={20} color={C.textBlack}/>
        </button>
        <span style={{ fontWeight:700, fontSize:17, color:C.textBlack }}>Productos</span>
        <button onClick={()=>openModal?.("nuevo-producto")} style={{
          marginLeft:"auto", display:"flex", alignItems:"center", gap:5,
          height:30, padding:"0 12px", borderRadius:6, fontSize:13, fontWeight:600,
          background:C.primary, color:"#fff", border:"none", cursor:"pointer",
        }}>
          <PlusIcon size={13} color="#fff"/> Agregar
        </button>
      </div>

      {/* ── Desktop header ── */}
      <div className="pn-hide-mobile" style={{ background:C.pageBg }}>
        <div style={{ maxWidth:1200, margin:"0 auto", width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px 12px", gap:12, boxSizing:"border-box" }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:C.textBlack, letterSpacing:"-0.3px" }}>
            Productos
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {selectedIds.length > 0 && (
              <Btn 
                onClick={() => setConfirmData({
                  title: `¿Eliminar ${selectedIds.length} productos?`,
                  description: "Esta acción no se puede deshacer.",
                  onConfirm: () => { 
                    setConfirmData(null); 
                    eliminarMultiplesProductos?.(selectedIds).then(() => setSelectedIds([])) 
                  }
                })}
                style={{ background: C.dangerSurf, border: `1px solid ${C.dangerBord}`, color: C.dangerTxt }}
              >
                <Trash2 size={13} /> Eliminar ({selectedIds.length})
              </Btn>
            )}
            <Btn onClick={()=>openModal?.("categorias-producto")}>
              <TagIcon size={13} color={C.textDark}/> Categorías
            </Btn>

            <div style={{ position:"relative" }}>
              <Btn onClick={(e)=>{ e.stopPropagation(); setCsvMenuOpen(!csvMenuOpen) }}>
                <DownloadIcon size={13} color={C.textDark}/> CSV {csvLoading ? "..." : ""}
              </Btn>
              {csvMenuOpen && (
                <div onClick={e => e.stopPropagation()} style={{
                  position:"absolute", top:36, right:0,
                  width:180, background:C.bg, borderRadius:8,
                  border:`1px solid ${C.border}`,
                  boxShadow:"0 8px 16px rgba(0,0,0,0.1)", zIndex:9999, padding:"4px 0",
                }}>
                  <button onClick={() => { setCsvMenuOpen(false); exportarCSV() }}
                    style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 12px",
                      background:"transparent", border:"none", fontSize:13, color: C.textDark,
                      cursor:"pointer", fontFamily:"'Inter',sans-serif", textAlign:"left" }}
                    onMouseEnter={e => e.currentTarget.style.background="#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <DownloadIcon size={14} color={C.textMid}/> Exportar
                  </button>
                  <button onClick={() => { setCsvMenuOpen(false); csvInputRef.current?.click() }}
                    disabled={csvLoading}
                    style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 12px",
                      background:"transparent", border:"none", fontSize:13, color: C.textDark,
                      cursor:csvLoading?"not-allowed":"pointer", fontFamily:"'Inter',sans-serif", textAlign:"left", opacity:csvLoading?0.5:1 }}
                    onMouseEnter={e => e.currentTarget.style.background="#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <Upload size={14} color={C.textMid}/> {csvLoading ? "Importando..." : "Importar"}
                  </button>
                  <div style={{ height:1, background:C.border, margin:"4px 0" }}/>
                  <button onClick={() => { setCsvMenuOpen(false); setShowCsvHelp(v => !v) }}
                    style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 12px",
                      background:"transparent", border:"none", fontSize:13, color: C.primary,
                      cursor:"pointer", fontFamily:"'Inter',sans-serif", textAlign:"left", fontWeight:600 }}
                    onMouseEnter={e => e.currentTarget.style.background="#eaf0eb"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    ℹ️ Guía TiendaNube CSV
                  </button>
                </div>
              )}
            </div>

            <input ref={csvInputRef} type="file" accept=".csv,text/csv" style={{display:"none"}}
              onChange={e=>{ if(e.target.files?.[0]) importarCSV(e.target.files[0]) }}/>
            


            <button
              onClick={()=>openModal?.("nuevo-producto")}
              style={{
                display:"inline-flex", alignItems:"center", gap:6,
                height:32, padding:"0 16px", borderRadius:8,
                background:"#334139", color:"#fff",
                border:"1.5px solid #334139",
                fontSize:13, fontWeight:600, cursor:"pointer",
                fontFamily:"'Inter',sans-serif",
                transition:"background 0.12s",
                whiteSpace:"nowrap", flexShrink:0,
              }}
              onMouseEnter={e=>e.currentTarget.style.background="#2b352f"}
              onMouseLeave={e=>e.currentTarget.style.background="#334139"}
            >
              <PlusIcon size={13} color="#fff"/> Agregar producto
            </button>
          </div>
        </div>
      </div>

      {/* ── Filtros + Contenido — mismo maxWidth ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", width:"100%" }}>

      {/* ── Guía CSV TiendaNube ── */}
      {showCsvHelp && (
        <div style={{ margin:"10px 24px 0", padding:"14px 18px", borderRadius:10, background:C.primarySurf, border:`1px solid rgba(51,65,57,.18)` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ fontWeight:700, fontSize:13, color:C.primary }}>📦 Cómo importar productos desde TiendaNube</div>
            <button onClick={() => setShowCsvHelp(false)}
              style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:C.textLight, lineHeight:1 }}>×</button>
          </div>
          <ol style={{ margin:0, paddingLeft:18, display:"flex", flexDirection:"column", gap:6 }}>
            {[
              ['Entrá a tu panel de TiendaNube', 'Panel → Productos → Exportar productos como CSV'],
              ['Descargá el archivo CSV', 'El archivo se descargará con todas las columnas de TiendaNube'],
              ['Columnas que se importan automáticamente', <span style={{fontFamily:"monospace",fontSize:11,background:"rgba(51,65,57,.1)",padding:"1px 5px",borderRadius:3}}>nombre, precio, descripcion, sku (→ codigo), stock</span>],
              ['Importá el archivo', 'Hacé click en CSV → Importar y seleccioná el archivo descargado'],
              ['Verificá los datos', 'Los productos aparecerán en la lista con sus precios y stock actualizados'],
            ].map(([title, desc], i) => (
              <li key={i} style={{ fontSize:12, color:C.textDark }}>
                <span style={{ fontWeight:700, color:C.primary }}>{title}</span>
                <br/>
                <span style={{ color:C.textMid }}>{desc}</span>
              </li>
            ))}
          </ol>
          <div style={{ marginTop:10, padding:"7px 10px", borderRadius:7, background:"rgba(51,65,57,.07)", fontSize:11, color:C.primary, fontWeight:600 }}>
            💡 Tip: Si el CSV viene en formato UTF-8 con separador coma (,) se importa sin configuración adicional.
          </div>
        </div>
      )}

      {/* ── Banner CSV resultado ── */}
      {csvResultado && (
        <div style={{
          margin:"10px 24px 0", padding:"9px 14px", borderRadius:8,
          fontSize:12, fontWeight:600,
          display:"flex", alignItems:"center", gap:8,
          background: csvResultado.tipo==="ok" ? "#ECFDF5" : "#FEF2F2",
          border:`1px solid ${csvResultado.tipo==="ok" ? "#A7F3D0" : "#FECACA"}`,
          color: csvResultado.tipo==="ok" ? "#065F46" : "#991B1B",
        }}>
          {csvResultado.tipo==="ok"
            ? <CheckCircle size={13}/>
            : <AlertTriangle size={13}/>}
          {csvResultado.msg}
          <button onClick={()=>setCsvResultado(null)}
            style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", color:"inherit", fontSize:14 }}>
            ✕
          </button>
        </div>
      )}

      {/* ── Filtros ── */}
      <div style={{
        background:C.pageBg, padding:"10px 24px",
        display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
      }}>
        <div style={{ flex:"1 1 240px", position:"relative" }}>
          <div style={{
            position:"absolute", left:10, top:"50%",
            transform:"translateY(-50%)", pointerEvents:"none",
          }}>
            <SearchIcon size={14} color={C.textLight}/>
          </div>
          <input type="text" value={busqueda} onChange={e=>setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, SKU o categoría"
            style={{
              width:"100%", height:32, padding:"0 10px 0 30px", fontSize:13,
              border:`1px solid ${C.border}`, borderRadius:6, outline:"none",
              background:C.bg, color:C.textDark,
              fontFamily:"'Inter',sans-serif", boxSizing:"border-box",
            }}
            onFocus={e=>e.target.style.borderColor=C.primary}
            onBlur={e =>e.target.style.borderColor=C.border}
          />
        </div>
        {/* Selector de Categoría */}
        <Select value={filtroCat} onValueChange={setFiltroCat}>
          <SelectTrigger className="w-full max-w-[200px] h-9 text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {cats.map(c=><SelectItem key={c} value={c}>{c==="todas"?"Todas las categorías":c}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Selector de Stock */}
        <Select value={filtroStock} onValueChange={setFiltroStock}>
          <SelectTrigger className="w-full max-w-[160px] h-9 text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
            <SelectValue placeholder="Todo el stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="todos">Todo el stock</SelectItem>
              <SelectItem value="sin-stock">Sin stock</SelectItem>
              <SelectItem value="stock-bajo">Stock bajo</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* ── Contenido ── */}
      <div style={{ padding:"16px 24px" }}>
        <p style={{ margin:"0 0 10px", fontSize:12, color:C.textMid }}>
          {filtrados.length} producto{filtrados.length!==1?"s":""}
        </p>

        <div style={{ background:C.bg, borderRadius:8, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          {filtrados.length===0 ? (
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", padding:"48px 24px", gap:12,
            }}>
              <div style={{
                width:52, height:52, borderRadius:12, background:C.primarySurf,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <BoxPackedIcon size={24} color={C.primary}/>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:14, fontWeight:600, color:C.textBlack, marginBottom:4 }}>
                  No se encontraron productos
                </div>
                <div style={{ fontSize:13, color:C.textMid }}>
                  Intentá con otra búsqueda o agregá un nuevo producto.
                </div>
              </div>
              <Btn primary onClick={()=>openModal?.("nuevo-producto")}>
                <PlusIcon size={13} color="#fff"/> Agregar producto
              </Btn>
            </div>
          ) : (
            <>
              {/* Cards mobile */}
              <div className="pn-show-mobile" style={{ flexDirection:"column" }}>
                {pageItems.map(prod=>(
                  <MobileCard key={prod.id} prod={prod}
                    onEdit={handleEdit} onDel={handleDel}
                    onAgregarAlCarrito={onAgregarAlCarrito}
                    isSelected={selectedIds.includes(prod.id)}
                    onToggleSelect={(id) => {
                      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
                    }}
                  />
                ))}
              </div>

              {/* Tabla desktop */}
              <div className="pn-hide-mobile" style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead style={{ position:"sticky", top:0, zIndex:20 }}>
                    <tr style={{ background:"#f9fafb", borderBottom:`2px solid ${C.border}` }}>
                      <th style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textLight, position:"relative", paddingLeft: 34 }}>
                        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: (selectedIds.length > 0) ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: (selectedIds.length > 0) ? 'auto' : 'none' }}>
                          <input 
                            type="checkbox"
                            checked={pageItems.length > 0 && pageItems.every(p => selectedIds.includes(p.id))}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds(prev => [...new Set([...prev, ...pageItems.map(p=>p.id)])])
                              else setSelectedIds(prev => prev.filter(id => !pageItems.some(p => p.id === id)))
                            }}
                            style={{ cursor:"pointer", width:14, height:14, margin:0, display:"block", accentColor: C.primary }}
                          />
                        </div>
                        NOMBRE
                      </th>
                      <th style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textLight }}>STOCK</th>
                      <th style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textLight }}>PRECIO</th>
                      <th style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:C.textLight }}>COSTO</th>
                      <th style={{ padding:"10px 16px", textAlign:"center", fontSize:11, fontWeight:700, color:C.textLight, width:80 }}>ACCIONES</th>
                    </tr>
                  </thead>
                <tbody>
                  {pageItems.map(prod=>(
                    <Row key={prod.id} prod={prod}
                      onEdit={handleEdit} onDel={handleDel}
                      onSaveField={handleSaveField}
                      onAgregarAlCarrito={onAgregarAlCarrito}
                      menuAbierto={menuAbierto} setMenu={setMenu}
                      menuPos={menuPos} setMenuPos={setMenuPos}
                      isSelected={selectedIds.includes(prod.id)}
                      onToggleSelect={(id) => {
                        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
                      }}
                    />
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}

          {/* Paginación */}
          {totalPags>1 && (
            <div className="flex items-center justify-between gap-4" style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
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
                    width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg,
                    cursor: pagina === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: pagina === 1 ? 0.4 : 1,
                  }}
                >
                  <ChevronLeftIcon size={13} color={C.textMid}/>
                </button>
                <span style={{ fontSize: 12, color: C.textDark, minWidth: 48, textAlign: "center" }}>
                  {pagina} / {totalPags}
                </span>
                <button
                  onClick={() => setPagina(p => Math.min(totalPags, p+1))}
                  disabled={pagina === totalPags}
                  style={{
                    width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg,
                    cursor: pagina === totalPags ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: pagina === totalPags ? 0.4 : 1,
                  }}
                >
                  <ChevronRightIcon size={13} color={C.textMid}/>
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
    </div>
  )
}
