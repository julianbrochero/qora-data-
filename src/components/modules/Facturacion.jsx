"use client"

import { useState, useEffect } from "react"
import {
  Search, Eye, DollarSign, FileText, Users, CreditCard, CheckCircle,
  Clock, Trash2, CheckSquare, Banknote, XCircle, Plus, ChevronLeft,
  ChevronRight, AlertCircle, Package, Printer
} from "lucide-react"

/* ── PALETA (igual a Pedidos) ── */
const bg = '#F5F5F5'
const surface = '#FAFAFA'
const surface2 = '#F2F2F2'
const border = 'rgba(48,54,47,.13)'
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'
const cardShadow = '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)'

const estadosCfg = {
  pendiente: { label: 'Pendiente', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', Icon: Clock },
  parcial: { label: 'Pago Parcial', bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD', Icon: DollarSign },
  pagada: { label: 'Pagada', bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7', Icon: CheckCircle },
  anulada: { label: 'Anulada', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', Icon: XCircle },
}

const fNum = n => (parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fMon = n => (parseFloat(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fFec = f => { try { return new Date(f).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) } catch { return "—" } }

const pillSel = {
  background: surface, border: `1px solid ${border}`, color: ct2,
  borderRadius: 8, padding: '6px 11px', fontSize: 11, fontWeight: 600,
  fontFamily: 'Inter,sans-serif', cursor: 'pointer', outline: 'none', appearance: 'none'
}

const Facturacion = ({
  facturas = [], pedidos = [], searchTerm = "", setSearchTerm,
  onNuevaFactura, registrarCobro, eliminarFactura, recargarDatos
}) => {
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [pestaña, setPestaña] = useState("todas")
  const [facturaSeleccionada, setFacturaSel] = useState(null)
  const [mostrarPago, setMostrarPago] = useState(false)
  const [montoPago, setMontoPago] = useState("")
  const [metodoPago, setMetodoPago] = useState("Efectivo")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [detalleFactura, setDetalle] = useState(null)
  const [seleccionadas, setSeleccionadas] = useState(new Set())
  const [eliminandoMasivo, setEliminandoMasivo] = useState(false)
  const [modoSeleccion, setModoSeleccion] = useState(false)
  const [cargandoPago, setCargandoPago] = useState(false)
  const [mostrarFormAbono, setMostrarAbono] = useState(false)
  const [dialogo, setDialogo] = useState({ open: false, type: 'alert', title: '', message: '', onConfirm: null, isDestructive: false })

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
      return bus && pst && est
    })
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))

  const totalPaginas = Math.ceil(filtradas.length / itemsPorPagina)
  const paginadas = filtradas.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)

  useEffect(() => { setPaginaActual(1); setSeleccionadas(new Set()) }, [pestaña, filtroEstado, searchTerm, itemsPorPagina])

  const toggleModoSeleccion = () => { setModoSeleccion(p => !p); setSeleccionadas(new Set()) }
  const toggleSel = id => setSeleccionadas(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleTodaPagina = () => {
    const ids = paginadas.map(f => f.id)
    const all = ids.every(id => seleccionadas.has(id))
    setSeleccionadas(p => { const n = new Set(p); all ? ids.forEach(id => n.delete(id)) : ids.forEach(id => n.add(id)); return n })
  }

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
    confirm2("Saldar Todo", `¿Registrar pago total?\n\nSaldo: $${fMon(saldo)}`, async () => {
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

  const handleEliminarMasivo = () => {
    if (seleccionadas.size === 0) return
    confirm2("Eliminar Múltiples", `¿Eliminar ${seleccionadas.size} factura(s)? No se puede deshacer.`, async () => {
      setEliminandoMasivo(true)
      for (const id of seleccionadas) await eliminarFactura?.(id)
      setEliminandoMasivo(false); setSeleccionadas(new Set()); recargarDatos?.()
    }, true)
  }

  /* ─── RENDER ─── */
  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ═══ HEADER ═══ */}
      <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Facturación</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={toggleModoSeleccion} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: modoSeleccion ? '1px solid #DCED31' : '1px solid rgba(255,255,255,.2)', background: 'transparent', color: modoSeleccion ? '#DCED31' : 'rgba(255,255,255,.6)', cursor: 'pointer' }}>
            <CheckSquare size={12} strokeWidth={2} /> {modoSeleccion ? 'Cancelar' : 'Selección'}
          </button>
          <button onClick={() => onNuevaFactura?.()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid #DCED31', cursor: 'pointer', background: '#DCED31', color: '#282A28' }}>
            <Plus size={12} strokeWidth={2.5} /> Factura Directa
          </button>
        </div>
      </header>

      {/* ═══ KPI CARDS ═══ */}
      <div style={{ padding: '12px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Deuda Total', val: `$${fNum(resumen.totalDeuda)}`, sub: 'Saldo pendiente total', bar: '#334139', iconBg: 'rgba(51,65,57,.1)', iconC: '#334139', Icon: CreditCard },
          { label: 'Facturas Pendientes', val: resumen.pendientes, sub: 'Con saldo pendiente', bar: '#373F47', iconBg: 'rgba(55,63,71,.1)', iconC: '#373F47', Icon: FileText },
          { label: 'Clientes Deudores', val: resumen.deudores, sub: 'Con deuda activa', bar: '#606B6C', iconBg: 'rgba(96,107,108,.1)', iconC: '#606B6C', Icon: Users },
          { label: 'Facturado este Mes', val: `$${fNum(resumen.mesActual)}`, sub: 'Total del mes en curso', bar: 'rgba(139,137,130,.4)', iconBg: 'rgba(139,137,130,.08)', iconC: ct3, Icon: DollarSign },
        ].map(({ label, val, sub, bar, iconBg, iconC, Icon }, i) => (
          <div key={i} style={{ background: '#E1E1E0', borderRadius: 12, border: `1px solid ${border}`, boxShadow: `0 2px 8px ${bar}28, 0 6px 20px ${bar}18`, padding: '12px 14px 10px', position: 'relative', animation: `kpiIn .35s ${.05 + i * .07}s ease both`, transition: 'box-shadow .2s, transform .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${bar}45, 0 10px 32px ${bar}28` }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 8px ${bar}28, 0 6px 20px ${bar}18` }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#6B7274', borderRadius: '12px 0 0 12px' }} />
            <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Icon size={13} strokeWidth={1.8} style={{ color: iconC }} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: ct1, lineHeight: 1, marginBottom: 4 }}>{val}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: ct2, marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 10, color: ct3 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ═══ TABLA ═══ */}
      <div style={{ padding: '14px 24px 32px' }}>
        <div style={{ background: surface, borderRadius: 12, border: `1px solid ${border}`, boxShadow: cardShadow, overflow: 'hidden' }}>

          {/* Filtros */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', gap: 8, flexWrap: 'wrap', background: surface2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 200, height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${border}`, background: surface }}>
              <Search size={12} strokeWidth={2} style={{ color: ct3, flexShrink: 0 }} />
              <input type="text" placeholder="Buscar por número, cliente o pedido…" value={searchTerm}
                onChange={e => setSearchTerm?.(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12, fontFamily: 'Inter,sans-serif', color: ct1, width: '100%' }} />
            </div>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={pillSel}>
              <option value="todos">Todos los estados</option>
              <option value="pendientes">Pendientes</option>
              <option value="parcial">Pago Parcial</option>
              <option value="pagada">Pagadas</option>
              <option value="anulada">Anuladas</option>
            </select>
          </div>

          {/* Pestañas */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, padding: '0 16px', background: surface }}>
            {[
              { key: 'todas', label: 'Todas', count: facturasArr.length },
              { key: 'pagadas', label: 'Pagadas', count: facturasArr.filter(f => f.estado === 'pagada').length },
              { key: 'deudas', label: 'Deudas', count: facturasArr.filter(f => f.estado !== 'pagada').length },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setPestaña(key)} style={{ position: 'relative', padding: '10px 12px', fontSize: 12, fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer', color: pestaña === key ? ct1 : ct3, display: 'flex', alignItems: 'center', gap: 6, transition: 'color .13s' }}>
                {label}
                <span style={{ padding: '1px 7px', borderRadius: 6, fontSize: 10, fontWeight: 800, background: pestaña === key ? '#282A28' : surface2, color: pestaña === key ? '#fff' : ct3 }}>{count}</span>
                {pestaña === key && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#334139', borderRadius: '2px 2px 0 0' }} />}
              </button>
            ))}
          </div>

          {/* Cabecera tabla */}
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 860 }}>
              <div style={{ display: 'grid', gridTemplateColumns: modoSeleccion ? '32px 1.3fr 1.6fr .8fr .8fr .9fr .9fr 1fr 140px' : '1.3fr 1.6fr .8fr .8fr .9fr .9fr 1fr 140px', gap: 10, padding: '10px 16px', borderBottom: `1px solid ${border}`, background: surface2 }}>
                {modoSeleccion && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" style={{ accentColor: accent, width: 14, height: 14, cursor: 'pointer' }}
                      checked={paginadas.length > 0 && paginadas.every(f => seleccionadas.has(f.id))}
                      onChange={toggleTodaPagina} />
                  </div>
                )}
                {['Número', 'Cliente', 'Fecha', 'Origen', 'Total', 'Cobrado', 'Estado', 'Acciones'].map((col, i) => (
                  <div key={i} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: ct3, textAlign: i >= 4 && i <= 5 ? 'right' : i === 6 ? 'center' : i === 7 ? 'right' : 'left' }}>{col}</div>
                ))}
              </div>

              {/* Filas */}
              <div>
                {paginadas.length > 0 ? paginadas.map(factura => {
                  const mPagado = parseFloat(factura.montopagado) || 0
                  const total = parseFloat(factura.total) || 0
                  const saldo = parseFloat(factura.saldopendiente) ?? (total - mPagado)
                  const estado = factura.estado || 'pendiente'
                  const eCfg = estadosCfg[estado] || estadosCfg.pendiente
                  const sel = seleccionadas.has(factura.id)

                  return (
                    <div key={factura.id}
                      onClick={modoSeleccion ? () => toggleSel(factura.id) : undefined}
                      style={{ display: 'grid', gridTemplateColumns: modoSeleccion ? '32px 1.3fr 1.6fr .8fr .8fr .9fr .9fr 1fr 140px' : '1.3fr 1.6fr .8fr .8fr .9fr .9fr 1fr 140px', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${border}`, background: sel ? accentL : 'transparent', cursor: modoSeleccion ? 'pointer' : 'default', alignItems: 'center', position: 'relative', transition: 'background .13s' }}
                      onMouseEnter={e => { if (!sel && !modoSeleccion) e.currentTarget.style.background = 'rgba(51,65,57,.02)' }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = sel ? accentL : 'transparent' }}>

                      {/* Barra lateral */}
                      <div style={{ position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 3, background: eCfg.border, borderRadius: '0 2px 2px 0', opacity: .6 }} />

                      {modoSeleccion && (
                        <div style={{ display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" style={{ accentColor: accent, width: 14, height: 14, cursor: 'pointer' }} checked={sel} onChange={() => toggleSel(factura.id)} />
                        </div>
                      )}

                      {/* Número */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: factura.pedido_id ? 'rgba(51,65,57,.08)' : surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={13} strokeWidth={2} style={{ color: factura.pedido_id ? accent : ct3 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{factura.numero || 'N/A'}</div>
                          <div style={{ fontSize: 10, color: ct3 }}>{factura.tipo || 'Factura'}</div>
                        </div>
                      </div>

                      {/* Cliente */}
                      <div style={{ fontSize: 12, fontWeight: 600, color: ct1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{factura.cliente_nombre || factura.cliente || '—'}</div>

                      {/* Fecha */}
                      <div style={{ fontSize: 11, fontWeight: 500, color: ct2 }}>{fFec(factura.fecha)}</div>

                      {/* Origen */}
                      <div>
                        {factura.pedido_id ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: accentL, color: accent }}>
                            <Package size={9} strokeWidth={2.5} />
                            {getCodigoPedido(factura.pedido_id) || 'Pedido'}
                          </span>
                        ) : (
                          <span style={{ fontSize: 10, fontWeight: 600, color: ct3 }}>Directa</span>
                        )}
                      </div>

                      {/* Total */}
                      <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: ct1 }}>${fNum(total)}</div>

                      {/* Cobrado */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>${fNum(mPagado)}</div>
                        {mPagado > 0 && <div style={{ fontSize: 9, color: ct3 }}>{((mPagado / total) * 100).toFixed(0)}%</div>}
                      </div>

                      {/* Estado */}
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: eCfg.bg, color: eCfg.color, border: `1px solid ${eCfg.border}`, width: 'fit-content' }}>
                          <eCfg.Icon size={10} strokeWidth={2.5} />
                          {eCfg.label}
                        </span>
                      </div>

                      {/* Acciones */}
                      {!modoSeleccion && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
                          <FBtn text="Ver" title="Ver detalle" onClick={e => { e.stopPropagation(); setDetalle(factura) }}><Eye size={11} strokeWidth={2} /></FBtn>
                          {saldo > 0.01 && estado !== 'anulada' && (
                            <FBtn text="Cobrar" title="Registrar pago" success onClick={e => { e.stopPropagation(); setFacturaSel(factura); setMostrarPago(true); setMontoPago((parseFloat(factura.saldopendiente) || parseFloat(factura.total) || 0).toString()) }}>
                              <DollarSign size={11} strokeWidth={2} />
                            </FBtn>
                          )}
                          <FBtn text="Borrar" title="Eliminar factura" danger onClick={e => { e.stopPropagation(); handleEliminar(factura) }}><Trash2 size={11} strokeWidth={2} /></FBtn>
                        </div>
                      )}
                    </div>
                  )
                }) : (
                  <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: accentL, border: `1px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      <FileText size={18} strokeWidth={1.5} style={{ color: accent, opacity: .6 }} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: ct3 }}>No se encontraron facturas</p>
                    <p style={{ fontSize: 11, color: ct3, opacity: .6, marginTop: 3 }}>Intentá cambiar los filtros</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Paginación */}
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${border}`, background: surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: ct3 }}>Mostrando {Math.min(filtradas.length, paginadas.length)} de {filtradas.length}</span>
              <select value={itemsPorPagina} onChange={e => setItemsPorPagina(Number(e.target.value))} style={{ ...pillSel, padding: '4px 8px', fontSize: 11 }}>
                <option value="5">5 / pág</option>
                <option value="10">10 / pág</option>
                <option value="25">25 / pág</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PagBtn onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1}><ChevronLeft size={13} strokeWidth={2.5} /></PagBtn>
              <span style={{ fontSize: 11, fontWeight: 600, color: ct2, padding: '0 6px' }}>{paginaActual} / {totalPaginas || 1}</span>
              <PagBtn onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas || totalPaginas === 0}><ChevronRight size={13} strokeWidth={2.5} /></PagBtn>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BARRA SELECCIÓN MASIVA ═══ */}
      {modoSeleccion && seleccionadas.size > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50, padding: '10px 16px', borderRadius: 14, border: `1px solid ${border}`, background: surface, boxShadow: '0 8px 32px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{seleccionadas.size} seleccionada{seleccionadas.size > 1 ? 's' : ''}</span>
          <div style={{ width: 1, height: 16, background: border }} />
          <button onClick={handleEliminarMasivo} disabled={eliminandoMasivo}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'rgba(180,60,60,.08)', color: 'rgba(150,40,40,.9)', transition: 'all .13s' }}>
            <Trash2 size={12} strokeWidth={2.5} />{eliminandoMasivo ? 'Eliminando…' : 'Eliminar'}
          </button>
          <button onClick={() => setSeleccionadas(new Set())} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: ct3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* ═══ MODAL PAGO ═══ */}
      {mostrarPago && facturaSeleccionada && (() => {
        const total = parseFloat(facturaSeleccionada.total) || 0
        const mPag = parseFloat(facturaSeleccionada.montopagado) || 0
        const saldo = parseFloat(facturaSeleccionada.saldopendiente) ?? (total - mPag)
        const pct = total > 0 ? Math.min(100, (mPag / total) * 100) : 0
        const pagado = saldo <= 0.01
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,25,22,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 360, borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}`, background: surface, boxShadow: '0 16px 48px rgba(0,0,0,.35)' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, background: '#282A28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>Registrar Pago</p>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{facturaSeleccionada.cliente_nombre || facturaSeleccionada.cliente}</h3>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{facturaSeleccionada.numero}</p>
                </div>
                <button onClick={handleCerrarModal} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.1)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={14} strokeWidth={2} />
                </button>
              </div>
              <div style={{ padding: 16 }}>
                {/* Progreso */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: ct3, marginBottom: 4 }}>
                    <span>Progreso de pago</span><span style={{ fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: surface2, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pagado ? '#10b981' : accent, borderRadius: 99, transition: 'width .5s' }} />
                  </div>
                </div>
                {/* Montos */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[['Total', `$${fNum(total)}`, ct1, surface2], ['Cobrado', `$${fNum(mPag)}`, '#065F46', '#D1FAE5'], ['Saldo', `$${fNum(saldo)}`, pagado ? '#065F46' : '#92400E', pagado ? '#D1FAE5' : '#FEF3C7']].map(([lbl, val, col, bg2]) => (
                    <div key={lbl} style={{ background: bg2, borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: `1px solid ${border}` }}>
                      <p style={{ fontSize: 9, color: ct3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>{lbl}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: col }}>{val}</p>
                    </div>
                  ))}
                </div>
                {/* Acciones */}
                {pagado ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
                    <CheckCircle size={14} style={{ color: '#065F46' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#065F46' }}>PAGADO COMPLETAMENTE</span>
                  </div>
                ) : mostrarFormAbono ? (
                  <div style={{ background: surface2, borderRadius: 10, padding: 12, border: `1px solid ${border}` }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Monto a cobrar (máx: ${fMon(saldo)})</label>
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3, fontSize: 12 }}>$</span>
                      <input type="number" step="0.01" min="0.01" max={saldo} autoFocus value={montoPago} onChange={e => setMontoPago(e.target.value)} disabled={cargandoPago}
                        style={{ width: '100%', height: 36, paddingLeft: 22, paddingRight: 10, border: `1px solid ${border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: ct1, background: surface, outline: 'none', fontFamily: 'Inter,sans-serif' }} />
                    </div>
                    <button onClick={() => setMontoPago(saldo.toString())} style={{ fontSize: 10, color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: 10 }}>
                      Usar saldo completo (${fMon(saldo)})
                    </button>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Método</label>
                    <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={{ ...pillSel, width: '100%', marginBottom: 10 }}>
                      <option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option><option>MercadoPago</option>
                    </select>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setMostrarAbono(false); setMontoPago('') }} style={{ flex: 1, height: 34, borderRadius: 8, border: `1px solid ${border}`, background: surface, color: ct2, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                      <button onClick={handleRegistrarPago} disabled={cargandoPago || !montoPago || parseFloat(montoPago) <= 0} style={{ flex: 1, height: 34, borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: (cargandoPago || !montoPago) ? .5 : 1 }}>
                        <Banknote size={12} strokeWidth={2} />{cargandoPago ? 'Procesando…' : 'Confirmar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setMostrarAbono(true)} style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${border}`, background: surface, color: ct2, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <DollarSign size={12} /> Abono Parcial
                    </button>
                    <button onClick={handleSaldarTodo} style={{ flex: 1, height: 36, borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <CheckCircle size={12} /> Saldar Todo
                    </button>
                  </div>
                )}
              </div>
              <div style={{ padding: '10px 16px', borderTop: `1px solid ${border}`, background: surface2 }}>
                <button onClick={handleCerrarModal} style={{ width: '100%', height: 32, borderRadius: 8, border: `1px solid ${border}`, background: surface, color: ct2, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Cerrar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ═══ MODAL DETALLE ═══ */}
      {detalleFactura && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,25,22,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}`, background: surface, boxShadow: '0 16px 48px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, background: '#282A28', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Detalle</p>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{detalleFactura.numero}</h3>
              </div>
              <button onClick={() => setDetalle(null)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.1)', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={14} strokeWidth={2} />
              </button>
            </div>
            <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[['Cliente', detalleFactura.cliente_nombre || detalleFactura.cliente], ['Fecha', fFec(detalleFactura.fecha)], ['Tipo', detalleFactura.tipo || 'Factura A'], ['Origen', detalleFactura.pedido_id ? (getCodigoPedido(detalleFactura.pedido_id) || 'Pedido') : 'Directa']].map(([k, v]) => (
                  <div key={k} style={{ background: surface2, borderRadius: 8, padding: '8px 10px', border: `1px solid ${border}` }}>
                    <p style={{ fontSize: 9, color: ct3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>{k}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{v}</p>
                  </div>
                ))}
              </div>
              {/* Items */}
              <div style={{ border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ padding: '8px 12px', background: surface2, borderBottom: `1px solid ${border}`, fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.07em' }}>Productos / Servicios</div>
                {(() => {
                  try {
                    const items = typeof detalleFactura.items === 'string' ? JSON.parse(detalleFactura.items) : (detalleFactura.items || [])
                    return items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: `1px solid ${border}` }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: ct1 }}>{item.producto}</p>
                          <p style={{ fontSize: 10, color: ct3 }}>{item.cantidad} × ${fMon(item.precio)}</p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>${fMon(item.subtotal)}</span>
                      </div>
                    ))
                  } catch { return <div style={{ padding: 12, fontSize: 11, color: ct3 }}>No se pudieron cargar los ítems</div> }
                })()}
              </div>
              {/* Totales */}
              <div style={{ background: surface2, borderRadius: 10, padding: '12px 14px', border: `1px solid ${border}` }}>
                {[['Total', `$${fMon(detalleFactura.total)}`, ct1], ['Cobrado', `$${fMon(detalleFactura.montopagado || 0)}`, '#065F46'], ['Saldo Pendiente', `$${fMon(detalleFactura.saldopendiente || 0)}`, '#92400E']].map(([k, v, col]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: k === 'Cobrado' ? `1px solid ${border}` : 'none' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: ct3 }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: col }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${border}`, background: surface2 }}>
              <button onClick={() => setDetalle(null)} style={{ width: '100%', height: 32, borderRadius: 8, border: `1px solid ${border}`, background: surface, color: ct2, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DIÁLOGO ═══ */}
      {dialogo.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,25,22,.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 360, borderRadius: 14, overflow: 'hidden', border: `1px solid ${border}`, background: surface, boxShadow: '0 16px 48px rgba(0,0,0,.35)' }}>
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}`, background: surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: dialogo.isDestructive ? 'rgba(180,60,60,.08)' : accentL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {dialogo.isDestructive ? <Trash2 size={13} strokeWidth={2} style={{ color: '#c62828' }} /> : <AlertCircle size={13} strokeWidth={2} style={{ color: accent }} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>{dialogo.title}</span>
              </div>
              <button onClick={cerrarDialogo} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: ct3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={13} strokeWidth={2.5} />
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: ct2, whiteSpace: 'pre-wrap' }}>{dialogo.message}</p>
            </div>
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${border}`, background: surface2, display: 'flex', gap: 6 }}>
              {dialogo.type === 'confirm' && (
                <button onClick={cerrarDialogo} style={{ flex: 1, padding: '7px 12px', fontSize: 11, fontWeight: 600, borderRadius: 8, border: `1px solid ${border}`, background: surface, color: ct2, cursor: 'pointer' }}>Cancelar</button>
              )}
              <button onClick={() => { if (dialogo.type === 'confirm' && dialogo.onConfirm) dialogo.onConfirm(); cerrarDialogo() }}
                style={{ flex: 1, padding: '7px 12px', fontSize: 11, fontWeight: 700, borderRadius: 8, border: 'none', background: dialogo.isDestructive ? '#c62828' : accent, color: '#fff', cursor: 'pointer' }}>
                {dialogo.type === 'confirm' ? 'Confirmar' : 'Entendido'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes kpiIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  )
}

/* ── Sub-componentes ── */
const FBtn = ({ children, text, onClick, title, danger, success }) => {
  const [hov, setHov] = useState(false)
  const textColor = hov ? (danger ? '#c62828' : success ? '#065F46' : '#30362F') : (danger ? 'rgba(180,60,60,.75)' : success ? 'rgba(6,95,70,.75)' : 'rgba(139,137,130,.9)')
  return (
    <button style={{ height: 26, padding: '0 8px', borderRadius: 6, border: '1px solid', borderColor: hov ? (danger ? 'rgba(180,60,60,.15)' : success ? 'rgba(6,95,70,.15)' : 'rgba(48,54,47,.1)') : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', color: textColor, fontSize: 11, fontWeight: 600, WebkitTapHighlightColor: 'transparent', width: 'max-content', transition: 'all .12s' }}
      onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}{text && <span>{text}</span>}
    </button>
  )
}

const PagBtn = ({ children, onClick, disabled }) => {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid rgba(48,54,47,.13)`, background: hov && !disabled ? 'rgba(48,54,47,.04)' : '#FAFAFA', color: '#30362F', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .13s', opacity: disabled ? .35 : 1 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  )
}

export default Facturacion