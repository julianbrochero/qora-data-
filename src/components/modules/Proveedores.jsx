"use client"

import React, { useState, useEffect } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
  Building, Search, FileText, Mail, Phone, Edit2, Trash2, CheckCircle, AlertCircle
} from 'lucide-react'
import { MenuIcon, PlusIcon, SearchIcon } from "@nimbus-ds/icons"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeftIcon, ChevronRightIcon } from "@nimbus-ds/icons"

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

const fNum = (n) => (parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const RESPONSIVE = `
  .pn-show-mobile { display: none; }
  .pn-hide-mobile { display: flex; }
  @media (max-width: 767px) {
    .pn-show-mobile { display: flex !important; }
    .pn-hide-mobile { display: none !important; }
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
        height: 32, padding: "0 18px", borderRadius: 6,
        fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif",
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
      <Icon size={14} strokeWidth={2} />
    </button>
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


/* ════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════ */
export default function Proveedores({
  proveedores = [],
  searchTerm = "",
  setSearchTerm,
  openModal,
  eliminarProveedor,
  onOpenMobileSidebar
}) {
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(50)

  const proveedoresSeguros = Array.isArray(proveedores) ? proveedores : []

  /* ── Métricas ── */
  const activos = proveedoresSeguros.filter(p => p.estado === 'activo' || !p.estado).length
  const conDeuda = proveedoresSeguros.filter(p => (parseFloat(p.deuda) || 0) > 0).length
  const totalDeuda = proveedoresSeguros.reduce((s, p) => s + (parseFloat(p.deuda) || 0), 0)

  /* ── Filtrado ── */
  const filtrados = proveedoresSeguros
    .filter(p => {
      const q = (searchTerm || "").toLowerCase()
      if (!q) return true
      return (p.nombre || '').toLowerCase().includes(q) ||
             (p.cuit || '').includes(q)
    })
    .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""))

  /* ── Paginación ── */
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const paginados = filtrados.slice(indiceInicio, indiceFin)
  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina)

  useEffect(() => { setPaginaActual(1) }, [searchTerm, itemsPorPagina])

  /* ── Atajo Ctrl → nuevo ── */
  useEffect(() => {
    const h = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
      if (e.key === 'Control') {
        e.preventDefault()
        openModal?.('nuevo-proveedor')
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [openModal])

  const [confirmData, setConfirmData] = useState(null)

  /* ── Acciones ── */
  const handleEliminar = (id) => {
    setConfirmData({
      title: "¿Eliminar proveedor?",
      description: "Esta acción no se puede deshacer.",
      onConfirm: () => { setConfirmData(null); eliminarProveedor?.(id) },
    })
  }

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
        <span style={{ fontWeight: 700, fontSize: 17, color: C.textBlack }}>Proveedores</span>
        <button onClick={() => openModal && openModal("nuevo-proveedor")} style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
          height: 32, padding: "0 18px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: C.primary, color: "#fff", border: "none", cursor: "pointer",
        }}>
          <PlusIcon size={13} color="#fff" /> Nuevo
          <span style={{ marginLeft: 4, padding: "2px 5px", background: "rgba(0,0,0,0.15)", borderRadius: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>Ctrl</span>
        </button>
      </div>

      {/* ── Desktop header ── */}
      <div className="pn-hide-mobile" style={{ background: C.pageBg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px 12px", gap: 12, boxSizing: "border-box" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textBlack, letterSpacing: "-0.3px" }}>
            Proveedores
          </h1>
          <Btn primary onClick={() => openModal && openModal("nuevo-proveedor")}>
            <PlusIcon size={13} color="#fff" /> Nuevo Proveedor
            <span style={{ marginLeft: 4, padding: "2px 5px", background: "rgba(0,0,0,0.15)", borderRadius: 4, fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>Ctrl</span>
          </Btn>
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
            <input type="text" value={searchTerm} onChange={e => setSearchTerm?.(e.target.value)}
              placeholder="Buscar p. ej. distribuidor, CUIT..."
              style={{
                width: "100%", height: 34, padding: "0 12px 0 34px", fontSize: 13,
                border: `1px solid ${C.border}`, borderRadius: 8, outline: "none",
                background: C.bg, color: C.textDark, fontFamily: "'Inter', sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        </div>

        {/* ── Contenido principal ── */}
        <div style={{ padding: "16px 24px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: C.textMid }}>
            {filtrados.length} proveedor{filtrados.length !== 1 ? "es" : ""}
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
                  <Building size={24} color={C.primary} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.textBlack, marginBottom: 4 }}>
                    Sin proveedores
                  </div>
                  <div style={{ fontSize: 13, color: C.textMid }}>
                    Crea un nuevo proveedor para gestionar tus compras y deudas.
                  </div>
                </div>
                <Btn primary onClick={() => openModal && openModal("nuevo-proveedor")}>
                  <PlusIcon size={13} color="#fff" /> Nuevo Proveedor
                </Btn>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: `1px solid ${C.border}` }}>
                      {["NOMBRE Y CONTACTO", "EMAIL", "CUIT / CUIL", "ESTADO", "DEUDA", "ACCIONES"].map(h => (
                        <th key={h} style={{
                          padding: "10px 16px", textAlign: "left",
                          fontSize: 10, fontWeight: 600, color: C.textMid,
                          letterSpacing: "0.06em", fontFamily: "'Inter', sans-serif"
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginados.map(prov => {
                      const deuda = parseFloat(prov.deuda) || 0
                      const activo = !prov.estado || prov.estado === 'activo'

                      return (
                        <tr key={prov.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          
                          {/* Nombre y Contacto */}
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: "'Inter', sans-serif" }}>
                              {prov.nombre || "Sin nombre"}
                            </div>
                            {prov.telefono && (
                              <div style={{ fontSize: 11, color: C.textMid, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                <Phone size={12} /> {prov.telefono}
                              </div>
                            )}
                          </td>

                          {/* Email */}
                          <td style={{ padding: "12px 16px" }}>
                            {prov.email ? (
                              <div style={{ fontSize: 13, color: C.textDark, display: "flex", alignItems: "center", gap: 6 }}>
                                <Mail size={13} color={C.textMid} />
                                {prov.email}
                              </div>
                            ) : (
                              <span style={{ fontSize: 13, color: C.textMid }}>—</span>
                            )}
                          </td>

                          {/* CUIT */}
                          <td style={{ padding: "12px 16px", fontSize: 13, color: C.textDark, fontFamily: "'DM Mono', monospace" }}>
                            {prov.cuit || "—"}
                          </td>

                          {/* Estado */}
                          <td style={{ padding: "12px 16px" }}>
                            {activo ? (
                              <Pill color={C.successTxt} bg={C.successSurf} border={C.successBord}>
                                Activo
                              </Pill>
                            ) : (
                              <Pill color={C.dangerTxt} bg={C.dangerSurf} border={C.dangerBord}>
                                Inactivo
                              </Pill>
                            )}
                          </td>

                          {/* Deuda */}
                          <td style={{ padding: "12px 16px" }}>
                            {deuda > 0 ? (
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.dangerTxt, display: "flex", alignItems: "center", gap: 4 }}>
                                <AlertCircle size={13} /> $ {fNum(deuda)}
                              </div>
                            ) : (
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>
                                $ {fNum(0)}
                              </div>
                            )}
                          </td>

                          {/* Acciones */}
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <IcoBtn icon={Edit2} title="Editar" onClick={() => openModal && openModal('editar-proveedor', prov)} />
                              <IcoBtn icon={Trash2} title="Eliminar" danger onClick={() => handleEliminar(prov.id)} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between gap-4" style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, color: C.textMid }}>Filas por página:</span>
                      <Select value={String(itemsPorPagina)} onValueChange={v => setItemsPorPagina(Number(v))}>
                        <SelectTrigger className="w-20 h-8" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                          <SelectGroup>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMid }}>
                      {indiceInicio + 1}–{Math.min(indiceFin, filtrados.length)} de {filtrados.length}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                        disabled={paginaActual === 1}
                        style={{
                          width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg,
                          cursor: paginaActual === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: paginaActual === 1 ? 0.4 : 1,
                        }}
                      >
                        <ChevronLeftIcon size={13} color={C.textMid}/>
                      </button>
                      <span style={{ fontSize: 12, color: C.textDark, minWidth: 48, textAlign: "center" }}>
                        {paginaActual} / {totalPaginas}
                      </span>
                      <button
                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                        disabled={paginaActual === totalPaginas}
                        style={{
                          width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg,
                          cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: paginaActual === totalPaginas ? 0.4 : 1,
                        }}
                      >
                        <ChevronRightIcon size={13} color={C.textMid}/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

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