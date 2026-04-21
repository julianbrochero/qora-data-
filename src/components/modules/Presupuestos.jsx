"use client"

import React, { useState, useEffect } from 'react'
import {
  FileText, Plus, Download, Search, CheckCircle, XCircle,
  Clock, Trash2, TrendingUp, MoreHorizontal, Edit2, ShoppingCart, Menu
} from 'lucide-react'
import { MenuIcon, PlusIcon, SearchIcon } from "@nimbus-ds/icons"
import { generarPDFPresupuesto } from '../../utils/presupuestoGenerator'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/* ══════════════════════════════════════════
   PALETA NIMBUS
══════════════════════════════════════════ */
const C = {
  pageBg:     "#f8f9fb",
  bg:         "#ffffff",
  border:     "#d1d5db",
  borderMd:   "#9ca3af",
  primary:    "#334139",
  primaryHov: "#2b352f",
  primarySurf:"#eaf0eb",
  successTxt: "#065f46", successSurf: "#d1fae5", successBord: "#6ee7b7",
  warnTxt:    "#92400e", warnSurf:    "#fef3c7", warnBord:    "#fcd34d",
  dangerTxt:  "#991b1b", dangerSurf:  "#fee2e2", dangerBord:  "#fca5a5",
  textBlack:  "#0d0d0d",
  textDark:   "#111827",
  textMid:    "#6b7280",
  textLight:  "#9ca3af",
}

const fNum = (n) => (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fDate = (s) => { try { return new Date(s + (s.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) } catch { return s || '—' } }

const RESPONSIVE = `
  .pn-show-mobile { display: none; }
  .pn-hide-mobile { display: flex; }
  @media (max-width: 767px) {
    .pn-show-mobile { display: flex !important; }
    .pn-hide-mobile { display: none !important; }
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

/* ─── Botones base ─── */
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

const IcoBtn = ({ icon: Icon, onClick, title, color = C.textDark, danger }) => {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", background: hov ? (danger ? C.dangerSurf : "#f3f4f6") : "transparent",
        color: danger && hov ? C.dangerTxt : color, cursor: "pointer", transition: "all 0.1s"
      }}
    >
      <Icon size={14} strokeWidth={2} />
    </button>
  )
}

/* ─── Badge Estado ─── */
const estadoCfg = {
  vigente: { bg: C.primarySurf, fg: C.primary, border: C.borderMd, label: 'Vigente' },
  vencido: { bg: "#f3f4f6", fg: C.textMid, border: "#d1d5db", label: 'Vencido' },
  aceptado: { bg: C.successSurf, fg: C.successTxt, border: C.successBord, label: 'Aceptado' },
  rechazado: { bg: C.dangerSurf, fg: C.dangerTxt, border: C.dangerBord, label: 'Rechazado' },
}

const Pill = ({ color, bg, border, children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 8px", borderRadius: 6,
    fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif",
    color, background: bg, border: `1px solid ${border}`,
    whiteSpace: "nowrap"
  }}>
    {children}
  </span>
)

/* ─── Fila Presupuesto ─── */
const PresupuestoRow = ({ pres, isSelected, onToggle, handlePDF, menuAbierto, setMenu, setMenuPos, openModal, actualizarEstadoPresupuesto, eliminarPresupuesto }) => {
  const [hov, setHov] = useState(false)
  const estado = calcEstado(pres)
  const st = estadoCfg[estado] || estadoCfg.vigente
  const items = (() => { try { return JSON.parse(pres.items || '[]') } catch { return [] } })()

  return (
    <tr 
      onClick={() => onToggle(pres.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderBottom: `1px solid ${C.border}`, background: isSelected ? C.primarySurf : (hov ? "#f9fafb" : "transparent"), transition: "background 0.1s", cursor: "pointer" }}
    >
      {/* Numero */}
      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.textDark, position: "relative", paddingLeft: 34 }}>
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: (isSelected || hov) ? 1 : 0, transition: 'opacity 0.1s', pointerEvents: (isSelected || hov) ? 'auto' : 'none' }}>
          <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ cursor: "pointer", width:14, height:14, margin:0, display:"block", accentColor: C.primary }} />
        </div>
        {pres.numero}
      </td>

      {/* Cliente e info */}
      <td style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
          {pres.cliente || "Sin cliente"}
        </div>
        <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>
          {items.length} producto{items.length !== 1 ? 's' : ''}
        </div>
      </td>

      {/* Fecha */}
      <td style={{ padding: "12px 16px", fontSize: 13, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
        {fDate(pres.fecha)}
      </td>
      
      {/* Valido */}
      <td style={{ padding: "12px 16px", fontSize: 13, color: C.textMid, fontFamily: "'Inter', sans-serif" }}>
        {pres.validez ?? 7} días
      </td>

      {/* Total */}
      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
        $ {fNum(pres.total)}
      </td>

      {/* Estado */}
      <td style={{ padding: "12px 16px" }}>
        <Pill color={st.fg} bg={st.bg} border={st.border}>{st.label}</Pill>
      </td>

      {/* Acciones */}
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 4, position: "relative" }}>
          <IcoBtn icon={Download} title="Descargar PDF" onClick={() => handlePDF(pres)} />
          
          <IcoBtn icon={MoreHorizontal} title="Más acciones" onClick={e => {
            e.stopPropagation()
            if (menuAbierto === pres.id) { setMenu(null); return }
            const r = e.currentTarget.getBoundingClientRect()
            const menuH = 180
            const abreArriba = r.bottom + menuH > window.innerHeight - 16
            setMenuPos({
              top: abreArriba ? r.top - menuH - 4 : r.bottom + 4,
              left: Math.min(r.right - 180, window.innerWidth - 196)
            })
            setMenu(pres.id)
          }} />
        </div>
      </td>
    </tr>
  )
}

const calcEstado = (pres) => {
  if (pres.estado && pres.estado !== 'vigente') return pres.estado
  const vencimiento = new Date(pres.fecha_vencimiento || pres.fecha)
  if (pres.validez) vencimiento.setDate(new Date(pres.fecha).getDate() + parseInt(pres.validez))
  return vencimiento < new Date() ? 'vencido' : 'vigente'
}


/* ════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════ */
export default function Presupuestos({
  presupuestos = [],
  clientes = [],
  productos = [],
  openModal,
  onOpenMobileSidebar,
  eliminarPresupuesto,
  actualizarEstadoPresupuesto,
  convertirPresupuestoPedido,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltro] = useState('')
  const [menuAbierto, setMenu] = useState(null)
  
  // Para ubicar el dropdown de la tuerquita / 3 puntitos
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  /* ── Métricas ── */
  const vigentes = presupuestos.filter(p => calcEstado(p) === 'vigente').length
  const aceptados = presupuestos.filter(p => calcEstado(p) === 'aceptado').length
  const totalVal = presupuestos.filter(p => calcEstado(p) === 'aceptado').reduce((s, p) => s + (parseFloat(p.total) || 0), 0)

  /* ── Filtrado ── */
  const filtrados = presupuestos
    .filter(p => {
      const q = search.toLowerCase()
      const match = !q || (p.numero || '').toLowerCase().includes(q) || (p.cliente || '').toLowerCase().includes(q)
      const estado = calcEstado(p)
      const matchE = !filtroEstado || estado === filtroEstado
      return match && matchE
    })
    .sort((a, b) => new Date(b.created_at || b.fecha) - new Date(a.created_at || a.fecha))

  /* ── Descargar PDF ── */
  const handlePDF = (pres) => {
    generarPDFPresupuesto({
      numero: pres.numero, fecha: pres.fecha, validez: pres.validez,
      cliente: pres.cliente, items: JSON.parse(pres.items || '[]'),
      iva: pres.iva ?? 21, incluirIva: pres.incluir_iva ?? true,
      observaciones: pres.observaciones || '', condicionesPago: pres.condiciones_pago || '',
      nombreEmpresa: pres.nombre_empresa || localStorage.getItem('gestify_empresa') || '',
      subtotalGeneral: pres.subtotal || 0, ivaValor: pres.iva_valor || 0, total: pres.total || 0,
    })
  }

  /* ── Cerrar menu al click fuera ── */
  useEffect(() => {
    const handler = () => setMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, fontFamily: "'Inter', sans-serif" }}>
      <style>{RESPONSIVE}</style>

      {/* ── Mobile topbar ── */}
      <div className="pn-show-mobile" style={{
        alignItems: "center", gap: 10, padding: "11px 16px",
        background: C.bg, borderBottom: `1px solid ${C.border}`
      }}>
        <button onClick={onOpenMobileSidebar} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
          <MenuIcon size={20} color={C.textBlack} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: C.textBlack }}>Presupuestos</span>
        <button onClick={() => openModal("nuevo-presupuesto")} style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
          height: 32, padding: "0 12px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: C.primary, color: "#fff", border: "none", cursor: "pointer",
        }}>
          <PlusIcon size={13} color="#fff" /> Nuevo
        </button>
      </div>

      {/* ── Desktop header ── */}
      <div className="pn-hide-mobile" style={{ background: C.pageBg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px 12px", gap: 12, boxSizing: "border-box" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textBlack, letterSpacing: "-0.3px" }}>
            Presupuestos
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {selectedIds.length > 0 && (
              <Btn 
                onClick={() => {
                  if (confirm(`¿Eliminar ${selectedIds.length} presupuestos?`)) {
                    Promise.all(selectedIds.map(id => eliminarPresupuesto?.(id))).then(() => setSelectedIds([]))
                  }
                }}
                style={{ background: C.dangerSurf, border: `1px solid ${C.dangerBord}`, color: C.dangerTxt }}
              >
                <Trash2 size={13} /> Eliminar ({selectedIds.length})
              </Btn>
            )}
            <Btn primary onClick={() => openModal("nuevo-presupuesto")}>
              <PlusIcon size={13} color="#fff" /> Nuevo Presupuesto
            </Btn>
          </div>
        </div>
      </div>

      {/* ── Contenido centrado ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>


        {/* ── Filtros ── */}
        <div style={{
          background: C.pageBg, padding: "12px 24px 0",
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          {/* Buscador */}
          <div style={{ flex: "1 1 260px", position: "relative" }}>
            <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <SearchIcon size={15} color={C.textLight} />
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar p. ej. número o cliente..."
              style={{
                width: "100%", height: 34, padding: "0 12px 0 34px", fontSize: 13,
                border: `1px solid ${C.border}`, borderRadius: 8, outline: "none",
                background: '#f2f2f2', color: C.textDark, fontFamily: "'Inter', sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          <Select value={filtroEstado} onValueChange={setFiltro}>
            <SelectTrigger className="pn-select-trigger w-full max-w-[220px] h-[34px] text-xs focus:ring-0 focus:ring-offset-0 border-[#d1d5db] bg-white">
              <SelectValue placeholder="PRESUPUESTOS" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", zIndex: 10000, color: "#000", minWidth: 220 }}>
              <SelectGroup>
                <SelectItem value="">PRESUPUESTOS</SelectItem>
                <SelectItem value="vigente">Vigentes</SelectItem>
                <SelectItem value="aceptado">Aceptados</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
                <SelectItem value="rechazado">Rechazados</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* ── Contenido principal ── */}
        <div style={{ padding: "16px 24px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: C.textMid }}>
            {filtrados.length} presupuesto{filtrados.length !== 1 ? "s" : ""}
          </p>

          <div style={{ background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {filtrados.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "48px 24px", gap: 12,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, background: C.primarySurf,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={24} color={C.primary} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textBlack, marginBottom: 4 }}>
                    Sin presupuestos
                  </div>
                  <div style={{ fontSize: 13, color: C.textMid }}>
                    Crea un nuevo presupuesto para enviarlo a los clientes.
                  </div>
                </div>
                <Btn primary onClick={() => openModal("nuevo-presupuesto")}>
                  <PlusIcon size={13} color="#fff" /> Nuevo Presupuesto
                </Btn>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: `1px solid ${C.border}` }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.textMid, letterSpacing: "0.06em", fontFamily: "'Inter', sans-serif", position: "relative", paddingLeft: 34 }}>
                        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: (selectedIds.length > 0) ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: (selectedIds.length > 0) ? 'auto' : 'none' }}>
                          <input 
                            type="checkbox"
                            checked={filtrados.length > 0 && filtrados.every(p => selectedIds.includes(p.id))}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds([...new Set([...selectedIds, ...filtrados.map(p => p.id)])])
                              else {
                                const pIds = filtrados.map(p => p.id)
                                setSelectedIds(selectedIds.filter(id => !pIds.includes(id)))
                              }
                            }}
                            style={{ cursor: "pointer", width: 14, height: 14, margin: 0, display: "block", accentColor: C.primary }}
                          />
                        </div>
                        NÚMERO
                      </th>
                      {["CLIENTE", "FECHA", "VÁLIDO", "TOTAL", "ESTADO", "ACCIONES"].map(h => (
                        <th key={h} style={{
                          padding: "10px 16px", textAlign: "left",
                          fontSize: 10, fontWeight: 600, color: C.textMid,
                          letterSpacing: "0.06em", fontFamily: "'Inter', sans-serif"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map(pres => (
                      <PresupuestoRow 
                        key={pres.id}
                        pres={pres}
                        isSelected={selectedIds.includes(pres.id)}
                        onToggle={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                        handlePDF={handlePDF}
                        menuAbierto={menuAbierto}
                        setMenu={setMenu}
                        setMenuPos={setMenuPos}
                        openModal={openModal}
                        actualizarEstadoPresupuesto={actualizarEstadoPresupuesto}
                        eliminarPresupuesto={eliminarPresupuesto}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
