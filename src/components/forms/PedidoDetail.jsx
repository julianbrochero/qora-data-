"use client"

import { useState, useEffect, useRef } from "react"
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
  // Estado local de cobro para actualizar UI al instante (optimista)
  const [cobradoLocal,  setCobradoLocal] = useState(null)
  const abonoRef = useRef(null)

  useEffect(() => {
    setNotas(pedido?.notas || "")
    setModoAbono(false)
    setAbono("")
    setCobradoLocal(null)  // reset al cambiar de pedido
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
  const estadoActual = ESTADOS.find(e => e.key === pedido?.estado) || ESTADOS[0]
  const cliente      = clientes.find(c => c.id === pedido?.cliente_id)
  const ganancia     = items.reduce((s, i) => s + (i.ganancia != null ? parseFloat(i.ganancia) : 0), 0)
  const hayGanancia  = items.some(i => i.ganancia != null)

  /* ── Acciones ── */
  const cambiarEstado = async (key) => {
    if (key === pedido?.estado) return
    try {
      const r = await formActions?.actualizarEstadoPedido?.(pedido.id, key)
      if (r?.success) showToast("Estado actualizado")
      else showToast(r?.mensaje || "Error", false)
    } catch (e) { showToast(e.message, false) }
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
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0d0d0d", letterSpacing: "-0.5px" }}>${fM(total)}</div>
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
          value={pedido?.estado || "pendiente"}
          onChange={e => cambiarEstado(e.target.value)}
          className="app-select"
          style={{ width: 160, height: 34, fontSize: 12, fontWeight: 600, padding: "0 10px", borderRadius: 7, border: "1.5px solid #e5e7eb", cursor: "pointer" }}
        >
          {ESTADOS.map(est => (
            <option key={est.key} value={est.key}>{est.label}</option>
          ))}
        </select>
      </div>

      {/* ══ COBRO ══ */}
      {!pagado && (
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.light, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Cobro <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>· S = parcial · Shift+S = total</span>
          </div>

          {/* Barra de progreso */}
          {cobrado > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1, height: 4, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: 4, width: `${pct}%`, background: "#f59e0b", borderRadius: 99, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 11, color: C.mid, whiteSpace: "nowrap" }}>
                ${fM(cobrado)} cobrado · ${fM(saldo)} pendiente
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {/* Método */}
            <select value={metodo} onChange={e => setMetodo(e.target.value)}
              className="app-select app-select-sm" style={{ width: 140 }} disabled={cargando}>
              {METODOS.map(m => <option key={m}>{m}</option>)}
            </select>

            {modoAbono ? (
              <>
                <div style={{ position: "relative", width: 110 }}>
                  <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.light, fontSize: 12, pointerEvents: "none" }}>$</span>
                  <input ref={abonoRef} type="number" value={abono} onChange={e => setAbono(e.target.value)}
                    placeholder="0" min="0.01" step="0.01" autoFocus
                    style={{ width: "100%", height: 32, padding: "0 8px 0 20px", fontSize: 13, fontWeight: 700, border: "1.5px solid #334139", borderRadius: 7, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
                <button onClick={registrarAbono} disabled={!abono || cargando}
                  style={{ height: 32, padding: "0 14px", borderRadius: 7, border: "none", background: "#334139", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (!abono || cargando) ? 0.5 : 1 }}>
                  {cargando ? "…" : "OK"}
                </button>
                <button onClick={() => { setModoAbono(false); setAbono("") }}
                  style={{ height: 32, width: 32, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={13} color={C.mid} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setModoAbono(true); setTimeout(() => abonoRef.current?.focus(), 60) }} disabled={cargando}
                  style={{ height: 32, padding: "0 14px", borderRadius: 7, border: "1.5px solid #334139", background: "#fff", color: "#334139", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <DollarSign size={12} /> Parcial
                </button>
                <button onClick={saldarTodo} disabled={cargando}
                  title="Shift + S para pagar todo"
                  style={{ height: 32, padding: "0 14px", borderRadius: 7, border: "none", background: "#334139", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  <Check size={12} /> Saldar todo <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.6, background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: 3 }}>Shift</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {pagado && (
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <CheckCircle size={14} color="#16a34a" strokeWidth={2.5} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>Pagado completo · ${fM(total)}</span>
          </div>
        </div>
      )}

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
