"use client"

import React, { useState, useEffect } from "react"
import {
  Search, Eye, DollarSign, FileText, Users, CreditCard, CheckCircle,
  Clock, Trash2, CheckSquare, Banknote, XCircle, Plus, ChevronLeft,
  ChevronRight, AlertCircle, Package, Printer, Tag, Download,
  Menu, MoreHorizontal
} from "lucide-react"
import { MenuIcon, PlusIcon, SearchIcon, DownloadIcon } from "@nimbus-ds/icons"
import { generarPDFComprobante } from "../../utils/comprobanteGenerator"

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

const fNum = n => (parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fMon = n => (parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fFec = f => { try { return new Date(f).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) } catch { return "—" } }

const RESPONSIVE = `
  .pn-show-mobile { display: none; }
  .pn-hide-mobile { display: flex; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; padding: 14px 24px 0; }
  @media (max-width: 900px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 767px) {
    .pn-show-mobile { display: flex !important; }
    .pn-hide-mobile { display: none !important; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .kpi-grid { grid-template-columns: 1fr; }
  }
`

/* ─── Botones base ─── */
const Btn = ({ children, onClick, primary, disabled, style }) => {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={disabled ? null : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        height: 32, padding: "0 14px", borderRadius: 6,
        fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
        border: primary ? "none" : `1px solid ${C.border}`,
        background: primary ? (hov ? C.primaryHov : C.primary) : (hov ? "#f9fafb" : C.bg),
        color: primary ? "#fff" : C.textDark,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.1s",
        ...style
      }}
    >
      {children}
    </button>
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
      <Icon size={14} />
    </button>
  )
}

/* ─── Menú tres puntitos por fila ─── */
const RowMenu = ({ factura, saldo, estadoLabel, onVer, onPDF, onCobrar, onEliminar }) => {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = React.useRef(null)

  const abrir = e => {
    e.stopPropagation()
    if (open) { setOpen(false); return }
    const r = btnRef.current.getBoundingClientRect()
    const top = r.bottom + window.scrollY + 4
    const left = Math.min(r.right - 160, window.innerWidth - 176)
    setPos({ top, left })
    setOpen(true)
  }

  React.useEffect(() => {
    if (!open) return
    const h = () => setOpen(false)
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [open])

  const item = (label, icon, onClick, color) => (
    <button
      key={label}
      onClick={e => { e.stopPropagation(); setOpen(false); onClick() }}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '8px 12px',
        background: 'transparent', border: 'none',
        fontSize: 13, color: color || C.textDark,
        cursor: 'pointer', fontFamily: "'Inter', sans-serif", textAlign: 'left',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {icon}{label}
    </button>
  )

  return (
    <div style={{ position: 'relative' }}>
      <button ref={btnRef} onClick={abrir} title="Acciones"
        style={{
          width: 30, height: 30, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${open ? C.border : 'transparent'}`,
          background: open ? '#f9fafb' : 'transparent',
          cursor: 'pointer', transition: 'all 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = C.border }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
      >
        <MoreHorizontal size={15} color={C.textMid} strokeWidth={1.8} />
      </button>

      {open && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'fixed', top: pos.top, left: pos.left,
          width: 160, background: C.bg, borderRadius: 8,
          border: `1px solid ${C.border}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)', zIndex: 9999, padding: '4px 0',
        }}>
          {item('Ver detalle', <Eye size={14} color={C.textMid} />, onVer)}
          {item('Bajar PDF', <Download size={14} color={C.textMid} />, onPDF)}
          {saldo > 0.01 && estadoLabel !== 'Anulada' && item('Cobrar', <DollarSign size={14} color={C.textMid} />, onCobrar)}
          <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
          {item('Eliminar', <Trash2 size={14} color={C.dangerTxt} />, onEliminar, C.dangerTxt)}
        </div>
      )}
    </div>
  )
}

/* ─── Badge Estado ─── */
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

const estadoInfo = (estado) => {
  if (estado === "pagada") return { label: "Pagada", color: C.successTxt, bg: C.successSurf, border: C.successBord }
  if (estado === "parcial") return { label: "Pago parcial", color: "#1E40AF", bg: "#DBEAFE", border: "#93C5FD" }
  if (estado === "anulada") return { label: "Anulada", color: C.dangerTxt, bg: C.dangerSurf, border: C.dangerBord }
  return { label: "Pendiente", color: C.warnTxt, bg: C.warnSurf, border: C.warnBord }
}

/* ─── Tarjeta Resumen Superior (KpiCard) ─── */
const KpiCard = ({ icon: Icon, label, value, color }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bg, border: `1px solid ${hov ? C.borderMd : C.border}`,
        borderRadius: 8, padding: '16px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ marginTop: 2 }}>
        <Icon size={16} color={color || C.textMid} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.textBlack, fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: C.textMid, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  )
}

export default function FacturacionNimbus({
  facturas = [], pedidos = [], searchTerm = "", setSearchTerm,
  onNuevaFactura, registrarCobro, eliminarFactura, recargarDatos,
  onOpenMobileSidebar
}) {
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroCanal, setFiltroCanal] = useState("todos")
  const [pestaña, setPestaña] = useState("todas")
  
  const [facturaSeleccionada, setFacturaSel] = useState(null)
  const [mostrarPago, setMostrarPago] = useState(false)
  const [montoPago, setMontoPago] = useState("")
  const [metodoPago, setMetodoPago] = useState("Efectivo")
  const [cargandoPago, setCargandoPago] = useState(false)
  const [mostrarFormAbono, setMostrarAbono] = useState(false)
  
  const [detalleFactura, setDetalle] = useState(null)
  const [dialogo, setDialogo] = useState({ open: false, type: 'alert', title: '', message: '', onConfirm: null, isDestructive: false })

  const canalesConfig = (() => {
    try {
      const ls = localStorage.getItem('gestify_canales_venta')
      if (ls) return JSON.parse(ls)
    } catch { }
    return []
  })()

  const alert2 = (title, message) => setDialogo({ open: true, type: 'alert', title, message, onConfirm: null, isDestructive: false })
  const confirm2 = (title, message, onConfirm, isDestructive = false) => setDialogo({ open: true, type: 'confirm', title, message, onConfirm, isDestructive })
  const cerrarDialogo = () => setDialogo(p => ({ ...p, open: false }))

  const facturasArr = Array.isArray(facturas) ? facturas : []
  const getCodigoPedido = id => { if (!id) return null; return pedidos.find(p => p.id === id)?.codigo || null }

  const filtradas = facturasArr
    .filter(f => {
      const q = (searchTerm || "").toLowerCase()
      const bus = (f.numero || "").toLowerCase().includes(q) ||
        (f.cliente_nombre || f.cliente || "").toLowerCase().includes(q) ||
        (getCodigoPedido(f.pedido_id) || "").toLowerCase().includes(q)
      const pst = pestaña === "todas" || (pestaña === "pagadas" && f.estado === "pagada") || (pestaña === "deudas" && f.estado !== "pagada")
      const est = filtroEstado === "todos" || f.estado === filtroEstado || (filtroEstado === "pendientes" && (f.estado === "pendiente" || f.estado === "parcial"))
      const canal = filtroCanal === "todos" || f.canal_venta === filtroCanal || (filtroCanal === "sin-canal" && !f.canal_venta)
      return bus && pst && est && canal
    })
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))

  const resumen = {
    totalDeuda: facturasArr.filter(f => f.estado !== "pagada").reduce((s, f) => s + (parseFloat(f.saldopendiente) || parseFloat(f.total) || 0), 0),
    pendientes: facturasArr.filter(f => f.estado !== "pagada").length,
    deudores: [...new Set(facturasArr.filter(f => f.estado !== "pagada").map(f => f.cliente_nombre || f.cliente).filter(Boolean))].length,
    mesActual: facturasArr.filter(f => { const d = new Date(f.fecha), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }).reduce((s, f) => s + (parseFloat(f.total) || 0), 0),
  }

  const handleRegistrarPago = async () => {
    if (!facturaSeleccionada) return
    const monto = parseFloat(montoPago) || 0
    if (monto <= 0) { alert2("Monto inválido", "El monto debe ser mayor a 0"); return }
    const saldo = parseFloat(facturaSeleccionada.saldopendiente) || parseFloat(facturaSeleccionada.total) || 0
    if (monto > saldo) { alert2("Monto excedido", `El monto excede el saldo ($${fMon(saldo)})`); return }
    if (!registrarCobro) return
    setCargandoPago(true)
    try {
      const cod = getCodigoPedido(facturaSeleccionada.pedido_id)
      const r = await registrarCobro(facturaSeleccionada.id, monto, `Pago parcial - ${cod || facturaSeleccionada.numero}`)
      if (r?.success) { handleCerrarModal(); recargarDatos?.() }
      else alert2("Error", r?.mensaje || "Error desconocido")
    } catch (e) { alert2("Error", e.message) }
    finally { setCargandoPago(false) }
  }

  const handleSaldarTodo = () => {
    if (!facturaSeleccionada || !registrarCobro) return
    const saldo = parseFloat(facturaSeleccionada.saldopendiente) || parseFloat(facturaSeleccionada.total) || 0
    if (saldo <= 0) return
    confirm2("Saldar Todo", `¿Registrar pago total?\\n\\nSaldo: $${fMon(saldo)}`, async () => {
      setCargandoPago(true)
      try {
        const cod = getCodigoPedido(facturaSeleccionada.pedido_id)
        const r = await registrarCobro(facturaSeleccionada.id, saldo, `Saldo total - ${cod || facturaSeleccionada.numero}`)
        if (r?.success) { handleCerrarModal(); recargarDatos?.() }
        else alert2("Error", r?.mensaje || "Error")
      } catch (e) { alert2("Error", e.message) }
      finally { setCargandoPago(false) }
    })
  }

  const handleCerrarModal = () => { setMostrarPago(false); setFacturaSel(null); setMontoPago(""); setMostrarAbono(false) }

  const handleEliminar = factura => {
    confirm2("Eliminar Factura", `¿Eliminar la factura ${factura.numero}? Esta acción no se puede deshacer.`,
      async () => { const r = await eliminarFactura?.(factura.id); if (r?.success) recargarDatos?.(); else alert2("Error", r?.mensaje || "Error") }, true)
  }

  const PillFilter = ({ active, onClick, text }) => (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif",
        border: `1px solid ${active ? C.primary : C.border}`,
        background: active ? C.primary : C.bg,
        color: active ? "#ffffff" : C.textMid,
        cursor: "pointer"
      }}
    >{text}</button>
  )

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
        <span style={{ fontWeight: 700, fontSize: 17, color: C.textBlack }}>Facturación</span>
        <button onClick={onNuevaFactura} style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
          height: 32, padding: "0 12px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: C.primary, color: "#fff", border: "none", cursor: "pointer",
        }}>
          <PlusIcon size={13} color="#fff" /> Nueva
        </button>
      </div>

      {/* ── Desktop header ── */}
      <div className="pn-hide-mobile" style={{ background: C.pageBg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px 12px", gap: 12, boxSizing: "border-box" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textBlack, letterSpacing: "-0.3px" }}>
            Facturación
          </h1>
          <Btn primary onClick={onNuevaFactura}>
            <PlusIcon size={13} color="#fff" /> Factura Directa
          </Btn>
        </div>
      </div>

      {/* ── Contenido centrado ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* ── Tarjetas resumen ── */}
        <div className="kpi-grid">
          <KpiCard icon={AlertCircle} label="Deuda Total" value={`$${fNum(resumen.totalDeuda)}`} color={C.dangerTxt} />
          <KpiCard icon={Clock} label="Facturas Pendientes" value={resumen.pendientes} color={C.textBlack} />
          <KpiCard icon={Users} label="Clientes Deudores" value={resumen.deudores} color={C.textBlack} />
          <KpiCard icon={DollarSign} label="Facturado este mes" value={`$${fNum(resumen.mesActual)}`} color={C.successTxt} />
        </div>

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
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por número o cliente..."
              style={{
                width: "100%", height: 34, padding: "0 12px 0 34px", fontSize: 13,
                border: `1px solid ${C.border}`, borderRadius: 8, outline: "none",
                background: '#f2f2f2', color: C.textDark, fontFamily: "'Inter', sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          <select value={pestaña} onChange={e => setPestaña(e.target.value)} className="app-select app-select--inline" style={{ minWidth: 168, height: 34, paddingLeft: 12 }}>
            <option value="todas">Todas las facturas</option>
            <option value="pagadas">Pagadas</option>
            <option value="deudas">Con deuda</option>
          </select>

          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="app-select app-select--inline" style={{ minWidth: 200, height: 34, paddingLeft: 12 }}>
            <option value="todos">Todos los estados</option>
            <option value="pendientes">Pendientes / Parciales</option>
            <option value="pagada">Totalmente pagada</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>

        {canalesConfig.length > 0 && (
          <div style={{ padding: "12px 24px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
            <PillFilter active={filtroCanal === "todos"} onClick={() => setFiltroCanal("todos")} text="Todos los canales" />
            {canalesConfig.map(c => (
              <PillFilter key={c} active={filtroCanal === c} onClick={() => setFiltroCanal(c)} text={c} />
            ))}
            <PillFilter active={filtroCanal === "sin-canal"} onClick={() => setFiltroCanal("sin-canal")} text="Sin canal" />
          </div>
        )}

        {/* ── Contenido principal ── */}
        <div style={{ padding: "16px 24px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: C.textMid }}>
            {filtradas.length} factura{filtradas.length !== 1 ? "s" : ""}
          </p>

          <div style={{ background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {filtradas.length === 0 ? (
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
                    No hay facturas
                  </div>
                  <div style={{ fontSize: 13, color: C.textMid }}>
                    Crea una para comenzar a registrar.
                  </div>
                </div>
                <Btn primary onClick={onNuevaFactura}>
                  <PlusIcon size={13} color="#fff" /> Nueva
                </Btn>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: `1px solid ${C.border}` }}>
                      {["FACTURA", "FECHA", "TOTAL", "ESTADO", "ACCIONES"].map(h => (
                        <th key={h} style={{
                          padding: "10px 16px", textAlign: "left",
                          fontSize: 10, fontWeight: 600, color: C.textMid,
                          letterSpacing: "0.06em", fontFamily: "'Inter', sans-serif"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map(f => {
                      const mPagado = parseFloat(f.montopagado) || 0
                      const total = parseFloat(f.total) || 0
                      const saldo = parseFloat(f.saldopendiente) ?? (total - mPagado)
                      const st = estadoInfo(f.estado || "pendiente")
                      const codPed = getCodigoPedido(f.pedido_id)

                      return (
                        <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          
                          {/* Factura e info */}
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
                              {f.cliente_nombre || f.cliente || "Consumidor Final"}
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                              <span style={{ fontSize: 11, color: C.textMid }}>{f.numero}</span>
                              {codPed && (
                                <span style={{ fontSize: 10, background: C.primarySurf, color: C.primary, padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                                  Ref: {codPed}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Fecha */}
                          <td style={{ padding: "12px 16px", fontSize: 13, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
                            {fFec(f.fecha)}
                          </td>

                          {/* Total y saldo */}
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
                              $ {fMon(total)}
                            </div>
                            {saldo > 0 && st.label !== "Anulada" && (
                              <div style={{ fontSize: 11, color: C.dangerTxt, marginTop: 2 }}>
                                Resta: $ {fMon(saldo)}
                              </div>
                            )}
                          </td>

                          {/* Estado */}
                          <td style={{ padding: "12px 16px" }}>
                            <Pill color={st.color} bg={st.bg} border={st.border}>{st.label}</Pill>
                          </td>

                          {/* Acciones */}
                          <td style={{ padding: "12px 16px" }}>
                            <RowMenu
                              factura={f}
                              saldo={saldo}
                              estadoLabel={st.label}
                              onVer={() => setDetalle(f)}
                              onPDF={() => generarPDFComprobante(f)}
                              onCobrar={() => { setFacturaSel(f); setMostrarPago(true); setMontoPago(saldo.toString()) }}
                              onEliminar={() => handleEliminar(f)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Pago ── */}
      {mostrarPago && facturaSeleccionada && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.bg, width: "100%", maxWidth: 400, borderRadius: 12, padding: 24 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, color: C.textBlack }}>Registrar Cobro</h2>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 4 }}>Para la factura</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{facturaSeleccionada.numero} - {facturaSeleccionada.cliente_nombre}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 4 }}>Saldo Pendiente</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.dangerTxt }}>$ {fMon(parseFloat(facturaSeleccionada.saldopendiente) || parseFloat(facturaSeleccionada.total))}</div>
            </div>
            
            <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
              <button 
                onClick={() => setMostrarAbono(true)}
                style={{ flex: 1, padding: "8px", border: `1px solid ${C.border}`, background: C.bg, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                Abonar Parcial
              </button>
              <button 
                onClick={handleSaldarTodo}
                style={{ flex: 1, padding: "8px", border: "none", background: C.successTxt, color: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                Saldar Todo
              </button>
            </div>

            {mostrarAbono && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, color: C.textMid, marginBottom: 4 }}>Monto a cobrar</label>
                <input type="number" step="0.01" value={montoPago} onChange={e => setMontoPago(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", fontSize: 14, boxSizing: "border-box" }}
                />
                <Btn primary style={{ width: "100%", marginTop: 12, justifyContent: "center" }} onClick={handleRegistrarPago} disabled={cargandoPago}>
                  {cargandoPago ? "Procesando..." : "Confirmar Cobro"}
                </Btn>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn onClick={handleCerrarModal}>Cancelar</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detalle ── */}
      {detalleFactura && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.bg, width: "100%", maxWidth: 500, borderRadius: 12, padding: 24 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, color: C.textBlack }}>Detalle de Factura</h2>
            <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: C.textMid, textTransform: "uppercase" }}>Número</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{detalleFactura.numero}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.textMid, textTransform: "uppercase" }}>Fecha</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{fFec(detalleFactura.fecha)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.textMid, textTransform: "uppercase" }}>Cliente</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{detalleFactura.cliente_nombre || detalleFactura.cliente}</div>
              </div>
            </div>
            
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontWeight: 600 }}>
                <span>Total Facturado</span>
                <span>$ {fMon(parseFloat(detalleFactura.total))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: C.successTxt }}>
                <span>Total Cobrado</span>
                <span>$ {fMon(parseFloat(detalleFactura.montopagado) || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: C.dangerTxt, fontWeight: 600 }}>
                <span>Saldo Pendiente</span>
                <span>$ {fMon(parseFloat(detalleFactura.saldopendiente) || (parseFloat(detalleFactura.total) - (parseFloat(detalleFactura.montopagado)||0)))}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
               <Btn primary onClick={() => generarPDFComprobante(detalleFactura)}>
                 <Download size={14} /> Descargar PDF
               </Btn>
               <Btn onClick={() => setDetalle(null)}>Cerrar</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Diálogo Global ── */}
      {dialogo.open && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.bg, width: "100%", maxWidth: 350, borderRadius: 12, padding: 24, textAlign: "center" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, color: dialogo.isDestructive ? C.dangerTxt : C.textBlack }}>{dialogo.title}</h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: C.textMid }}>{dialogo.message}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {dialogo.type === 'confirm' && (
                <Btn onClick={cerrarDialogo}>Cancelar</Btn>
              )}
              <Btn primary onClick={() => { if (dialogo.type === 'confirm' && dialogo.onConfirm) dialogo.onConfirm(); cerrarDialogo() }} style={{ background: dialogo.isDestructive ? C.dangerTxt : C.primary }}>
                {dialogo.type === 'confirm' ? 'Confirmar' : 'Entendido'}
              </Btn>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
