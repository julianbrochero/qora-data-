"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Package, Truck, CheckCircle, XCircle, Clock,
  DollarSign, TrendingUp, Check, X,
} from "lucide-react"

/* ── Estados ── */
const ESTADOS = [
  { key: "pendiente",  label: "Pendiente",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", Icon: Clock,        kbd: "1" },
  { key: "preparando", label: "Preparando", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", Icon: Package,      kbd: "2" },
  { key: "enviado",    label: "Enviado",    color: "#9333EA", bg: "#FAF5FF", border: "#E9D5FF", Icon: Truck,        kbd: "3" },
  { key: "entregado",  label: "Entregado",  color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", Icon: CheckCircle,  kbd: "4" },
  { key: "cancelado",  label: "Cancelado",  color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", Icon: XCircle,      kbd: "5" },
]

const METODOS = ["Efectivo", "Transferencia", "Débito", "Crédito", "MercadoPago"]

const fM  = m => (parseFloat(m) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fF  = f => { try { return new Date(f).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" }) } catch { return "—" } }

export default function PedidoDetail({ pedido, clientes = [], formActions, closeModal }) {
  const [notas,         setNotas]       = useState(pedido?.notas || "")
  const [metodo,        setMetodo]      = useState("Efectivo")
  const [abono,         setAbono]       = useState("")
  const [modoAbono,     setModoAbono]   = useState(false)
  const [cargando,      setCargando]    = useState(false)
  const [toast,         setToast]       = useState(null)
  // Estado local para actualizaciones optimistas
  const [cobradoLocal, setCobradoLocal] = useState(null)
  const [estadoLocal, setEstadoLocal]   = useState(null)
  const [canalLocal,  setCanalLocal]    = useState(null)
  const abonoRef = useRef(null)

  // Canales configurados en localStorage
  const canales = React.useMemo(() => {
    try { const ls = localStorage.getItem('gestify_canales_venta'); if (ls) return JSON.parse(ls) } catch {}
    return []
  }, [])

  useEffect(() => {
    setNotas(pedido?.notas || "")
    setModoAbono(false)
    setAbono("")
    setCobradoLocal(null)
    setEstadoLocal(null)
    setCanalLocal(null)
  }, [pedido?.id])

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }

  /* ── Datos ── */
  const items = (() => {
    try { return typeof pedido?.items === "string" ? JSON.parse(pedido.items || "[]") : (pedido?.items || []) }
    catch { return [] }
  })()

  const total        = parseFloat(pedido?.total) || 0
  // cobradoLocal permite actualizar la barra de progreso al instante sin esperar al padre
  const cobrado      = cobradoLocal !== null ? cobradoLocal : (parseFloat(pedido?.monto_abonado) || 0)
  const saldo        = Math.max(0, total - cobrado)
  const pagado       = saldo <= 0.01
  const pct          = total > 0 ? Math.min(100, Math.round((cobrado / total) * 100)) : 0
  
  const currentStatusKey = estadoLocal !== null ? estadoLocal : (pedido?.estado || "pendiente")
  const estadoActual     = ESTADOS.find(e => e.key === currentStatusKey) || ESTADOS[0]
  
  const cliente      = clientes.find(c => c.id === pedido?.cliente_id)
  const ganancia     = items.reduce((s, i) => s + (i.ganancia != null ? parseFloat(i.ganancia) : 0), 0)
  const hayGanancia  = items.some(i => i.ganancia != null)

  /* ── Acciones ── */
  const cambiarEstado = async (key) => {
    if (key === (estadoLocal || pedido?.estado)) return
    
    // Actualización optimista
    const prevStatus = estadoLocal || pedido?.estado
    setEstadoLocal(key)
    
    try {
      const r = await formActions?.actualizarEstadoPedido?.(pedido.id, key)
      if (r?.success) {
        showToast("Estado actualizado")
      } else {
        setEstadoLocal(prevStatus) // revertir si falla
        showToast(r?.mensaje || "Error", false)
      }
    } catch (e) { 
      setEstadoLocal(prevStatus) // revertir si falla
      showToast(e.message, false) 
    }
  }

  const saldarTodo = async () => {
    if (pagado || cargando) return
    setCargando(true)
    // ⭐ Actualizar UI al instante (optimista)
    setCobradoLocal(total)
    showToast("¡Saldado! ✓")
    try {
      const r = await formActions?.marcarPedidoPagadoTotal?.(pedido.id, metodo)
      if (!r?.success) {
        // Revertir si falla
        setCobradoLocal(null)
        showToast(r?.mensaje || "Error al saldar", false)
      }
    } catch (e) {
      setCobradoLocal(null)
      showToast(e.message, false)
    }
    finally { setCargando(false) }
  }

  const registrarAbono = async () => {
    const monto = parseFloat(abono)
    if (!monto || monto <= 0) return showToast("Ingresá un monto", false)
    setCargando(true)
    // Actualizar UI al instante
    setCobradoLocal(Math.min(total, cobrado + monto))
    try {
      const r = await formActions?.agregarAbonoAPedido?.(pedido.id, monto, metodo)
      if (r?.success) { showToast(`$${fM(monto)} registrado`); setAbono(""); setModoAbono(false) }
      else { setCobradoLocal(null); showToast(r?.mensaje || "Error", false) }
    } catch (e) { setCobradoLocal(null); showToast(e.message, false) }
    finally { setCargando(false) }
  }

  const guardarNotas = async () => {
    try {
      const r = await formActions?.actualizarNotasPedido?.(pedido.id, notas)
      if (r?.success) showToast("Notas guardadas")
    } catch {}
  }

  /* ── Atajos de teclado ── */
  useEffect(() => {
    const h = e => {
      // ignorar si el foco está en input/textarea/select
      const tag = document.activeElement?.tagName
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        // Dentro de input de abono: Enter = confirmar
        if (tag === "INPUT" && e.key === "Enter") registrarAbono()
        if (e.key === "Escape") { setModoAbono(false); setAbono(""); document.activeElement.blur() }
        return
      }
      // 1–5 → cambiar estado
      const est = ESTADOS.find(s => s.kbd === e.key)
      if (est) { e.preventDefault(); cambiarEstado(est.key) }
      // S → saldar / Shift → pago total
      if ((e.key === "s" || e.key === "S") && e.shiftKey) { e.preventDefault(); saldarTodo() }
      if ((e.key === "s" || e.key === "S") && !e.shiftKey) { e.preventDefault(); if (!pagado) { setModoAbono(true); setTimeout(() => abonoRef.current?.focus(), 60) } }
      // A → abono parcial
      if (e.key === "a" || e.key === "A") { e.preventDefault(); if (!pagado) { setModoAbono(true); setTimeout(() => abonoRef.current?.focus(), 60) } }
      // Esc → cerrar
      if (e.key === "Escape") closeModal?.()
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [pedido?.estado, pedido?.id, pagado, abono, notas])

  const C = { primary: "#334139", border: "#e5e7eb", mid: "#6b7280", light: "#9ca3af" }

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#111827" }}>
      <style>{`
        @keyframes pd-toast-in { from { opacity:0; transform:translateX(-50%) translateY(-8px) scale(.95) } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1) } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: toast.ok ? "#f0fdf4" : "#fef2f2",
          border: `1.5px solid ${toast.ok ? "#6ee7b7" : "#fca5a5"}`,
          color: toast.ok ? "#15803d" : "#dc2626",
          boxShadow: "0 6px 24px rgba(0,0,0,.13)", pointerEvents: "none", whiteSpace: "nowrap",
          animation: "pd-toast-in .18s cubic-bezier(.22,.97,.56,1) both",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ══ HEADER ══ */}
      <div style={{ padding: "14px 20px 10px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0d0d0d", marginBottom: 2 }}>
              {pedido?.cliente_nombre || "Consumidor Final"}
              {cliente?.telefono && (
                <span style={{ fontSize: 12, fontWeight: 400, color: C.light, marginLeft: 8 }}>{cliente.telefono}</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: C.mid, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>#{pedido?.codigo || pedido?.id?.toString().slice(-4)}</span>
              <span>·</span>
              <span>{fF(pedido?.fecha_pedido)}</span>
              {pedido?.canal_venta && <><span>·</span><span style={{ background: "#f3f4f6", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>{pedido.canal_venta}</span></>}
              {pedido?.factura_id && <span style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 4, padding: "1px 6px", fontWeight: 700, fontSize: 11 }}>✓ Facturado</span>}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <button 
                onClick={() => {
                  formActions?.openModal?.("editar-pedido", pedido);
                  closeModal?.();
                }}
                style={{
                  padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`,
                  background: "#fff", fontSize: 11, fontWeight: 600, color: C.mid,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                Editar
              </button>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0d0d0d", letterSpacing: "-0.5px" }}>${fM(total)}</div>
            </div>
            <div style={{ fontSize: 11, color: pagado ? "#16a34a" : "#d97706", fontWeight: 600 }}>
              {pagado ? "✓ Pagado" : `Saldo $${fM(saldo)}`}
            </div>
          </div>
        </div>
      </div>

      {/* ══ PRODUCTOS ══ */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
        {items.length === 0 ? (
          <div style={{ color: C.light, fontSize: 12, textAlign: "center", padding: "8px 0" }}>Sin productos</div>
        ) : (
          <div>
            {items.map((item, i) => {
              const precio   = parseFloat(item.precio) || 0
              const cant     = parseFloat(item.cantidad) || 1
              const subtotal = precio * cant
              const costo    = item.costo != null && item.costo !== '' ? parseFloat(item.costo) : null
              const gan      = item.ganancia != null ? parseFloat(item.ganancia) : null
              return (
                <div key={i} style={{
                  padding: "5px 0", borderBottom: i < items.length - 1 ? `1px solid #f3f4f6` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 500, color: "#111827" }}>{item.producto || item.nombre || "Producto"}</span>
                      <span style={{ color: C.light, fontSize: 11, marginLeft: 6 }}>×{cant}</span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontWeight: 600, color: "#0d0d0d" }}>${fM(subtotal)}</span>
                    </div>
                  </div>
                  {costo != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2, paddingLeft: 2 }}>
                      <span style={{ fontSize: 10, color: C.light }}>
                        Costo: <span style={{ color: C.mid, fontWeight: 600 }}>${fM(costo * cant)}</span>
                      </span>
                      {gan != null && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: gan >= 0 ? "#16a34a" : "#dc2626" }}>
                          {gan >= 0 ? "▲" : "▼"} Ganancia: {gan >= 0 ? "+" : "−"}${fM(Math.abs(gan))}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {hayGanancia && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, color: "#334139", fontWeight: 600 }}>
                <TrendingUp size={11} strokeWidth={2} /> Ganancia total: +${fM(ganancia)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ ESTADO — select ══ */}
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Estado
        </div>
        <select
          value={currentStatusKey}
          onChange={e => cambiarEstado(e.target.value)}
          className="app-select"
          style={{ width: 160, height: 34, fontSize: 12, fontWeight: 600, padding: "0 10px", borderRadius: 7, border: "1.5px solid #e5e7eb", cursor: "pointer" }}
        >
          {ESTADOS.map(est => (
            <option key={est.key} value={est.key}>{est.label}</option>
          ))}
        </select>
      </div>

      {/* ══ CANAL DE VENTA ══ */}
      {canales.length > 0 && (
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Canal de venta
          </div>
          <select
            value={canalLocal !== null ? canalLocal : (pedido?.canal_venta || "")}
            onChange={async e => {
              const val = e.target.value || null
              setCanalLocal(val)
              try {
                await formActions?.actualizarPedido?.(pedido.id, { canal_venta: val })
                showToast("Canal actualizado")
              } catch { showToast("Error al guardar", false) }
            }}
            className="app-select"
            style={{ width: 180, height: 32, fontSize: 12 }}
          >
            <option value="">Sin canal</option>
            {canales.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* ══ COBRO (Diseño Simplificado) ══ */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: pagado ? "#f0fdf4" : "#fff8f1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.mid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              ESTADO DEL PAGO
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: pagado ? "#15803d" : "#c2410c", letterSpacing: "-0.5px" }}>
              {pagado ? "¡Cobrado!" : `Faltan $${fM(saldo)}`}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.mid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              TOTAL
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>${fM(total)}</div>
          </div>
        </div>

        {!pagado && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <select value={metodo} onChange={e => setMetodo(e.target.value)}
              className="app-select" style={{ width: 140, height: 38, fontSize: 13, fontWeight: 600 }}>
              {METODOS.map(m => <option key={m}>{m}</option>)}
            </select>

            {modoAbono ? (
              <div style={{ display: "flex", gap: 4 }}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.mid, fontWeight: 800 }}>$</span>
                  <input ref={abonoRef} type="number" value={abono} onChange={e => setAbono(e.target.value)}
                    placeholder="Monto" autoFocus
                    style={{ width: 105, height: 38, padding: "0 10px 0 22px", borderRadius: 8, border: "2px solid #334139", outline: "none", fontSize: 15, fontWeight: 800 }} />
                </div>
                <button onClick={registrarAbono} style={{ height: 38, padding: "0 16px", borderRadius: 8, background: "#334139", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>OK</button>
                <button onClick={() => { setModoAbono(false); setAbono("") }} style={{ height: 38, width: 38, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>✕</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setModoAbono(true); setTimeout(() => abonoRef.current?.focus(), 60) }}
                  style={{ height: 38, padding: "0 16px", borderRadius: 8, border: "1.5px solid #334139", background: "#fff", color: "#334139", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  Pago Parcial <span style={{ fontSize: 10, opacity: 0.5, background: "#f3f4f6", padding: "1px 5px", borderRadius: 4, fontWeight: 800 }}>S</span>
                </button>
                <button onClick={saldarTodo}
                  style={{ height: 38, padding: "0 16px", borderRadius: 8, border: "none", background: "#334139", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <Check size={15} strokeWidth={3} /> Saldar Todo <span style={{ fontSize: 10, opacity: 0.3, background: "rgba(255,255,255,0.2)", padding: "1px 5px", borderRadius: 4, fontWeight: 800 }}>Shift + S</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ NOTAS ══ */}
      <div style={{ padding: "12px 20px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Notas
        </div>
        <textarea value={notas} onChange={e => setNotas(e.target.value)}
          onBlur={guardarNotas}
          placeholder="Sin notas — se guarda automáticamente"
          rows={2}
          style={{
            width: "100%", resize: "none", padding: "8px 10px",
            fontSize: 12, color: "#374151", lineHeight: 1.5, fontFamily: "inherit",
            border: "1px solid #e5e7eb", borderRadius: 8, outline: "none",
            background: "#fafafa", boxSizing: "border-box", transition: "border-color 0.12s",
          }}
          onFocus={e => e.target.style.borderColor = "#334139"}
        />
      </div>

    </div>
  )
}
