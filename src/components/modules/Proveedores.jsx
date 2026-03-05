"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Search, DollarSign, Building, Edit, Trash2, FileText, Mail, Phone, ChevronLeft, ChevronRight, PackageCheck, AlertCircle, Menu } from "lucide-react"

/* ══════════════════════════════════════════════
   PALETA GESTIFY
══════════════════════════════════════════════ */
const bg = '#F5F5F5'
const surface = '#FAFAFA'
const surface2 = '#FFFFFF'
const border = 'rgba(48,54,47,.13)'
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'
const cardShadow = '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)'

const inputStyle = {
  background: 'transparent',
  border: 'none', outline: 'none',
  fontSize: 12, fontFamily: "'Inter', sans-serif",
  color: ct1, width: '100%',
}
const pillSelect = {
  height: 32, padding: '0 24px 0 12px', fontSize: 11, fontWeight: 600,
  color: ct2, background: surface2, border: `1px solid ${border}`,
  borderRadius: 8, outline: 'none', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8982' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
  fontFamily: "'Inter', sans-serif", transition: 'border-color .15s'
}

const Proveedores = ({ proveedores = [], searchTerm = "", setSearchTerm, openModal, eliminarProveedor, onOpenMobileSidebar }) => {
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)

  const proveedoresSeguros = Array.isArray(proveedores) ? proveedores : []

  const filtrarProveedores = proveedoresSeguros.filter(proveedor =>
    (proveedor.nombre || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (proveedor.cuit || "").includes(searchTerm)
  ).sort((a, b) => a.nombre.localeCompare(b.nombre))

  const totalPaginas = Math.ceil(filtrarProveedores.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const proveedoresPaginados = filtrarProveedores.slice(indiceInicio, indiceFin)

  useEffect(() => { setPaginaActual(1) }, [searchTerm, itemsPorPagina])

  /* ── atajo de teclado (solo Ctrl) ── */
  useEffect(() => {
    let ctrlPressed = false
    let otherKeyPressed = false

    const handleKeyDown = (e) => {
      if (e.key === 'Control') {
        ctrlPressed = true
      } else if (ctrlPressed) {
        otherKeyPressed = true
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'Control') {
        if (!otherKeyPressed && openModal) {
          const active = document.activeElement
          const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')
          if (!isInput) {
            openModal('nuevo-proveedor')
          }
        }
        ctrlPressed = false
        otherKeyPressed = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [openModal])

  const resumenProveedores = {
    totalProveedores: proveedoresSeguros.length,
    proveedoresActivos: proveedoresSeguros.filter(p => !p.estado || p.estado === "activo").length,
    deudaTotal: proveedoresSeguros.reduce((sum, p) => sum + (Number.parseFloat(p.deuda) || 0), 0),
    proximosPagos: proveedoresSeguros.filter(p => (Number.parseFloat(p.deuda) || 0) > 0).length,
  }

  const fCorto = (monto) => (Number.parseFloat(monto) || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const fMonto = (monto) => (Number.parseFloat(monto) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const kpis = [
    { label: 'Total Proveedores', val: resumenProveedores.totalProveedores, icon: Building, color: '#334139' },
    { label: 'Activos', val: resumenProveedores.proveedoresActivos, icon: PackageCheck, color: '#065F46' },
    { label: 'Deuda Total', val: `$${fCorto(resumenProveedores.deudaTotal)}`, icon: DollarSign, color: '#991B1B' },
    { label: 'Con Saldo Pendiente', val: resumenProveedores.proximosPagos, icon: AlertCircle, color: '#92400E' },
  ]

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ══ HEADER ══ */}
      <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 clamp(12px, 3vw, 24px)', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', py: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
            <Menu size={16} strokeWidth={2} />
          </button>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión / Compras</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Proveedores</h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openModal && openModal("nuevo-proveedor")} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 32, borderRadius: 8, background: '#DCED31', color: '#1e2320', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .13s', boxShadow: '0 2px 8px rgba(220,237,49,.2)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = ''}>
            <Plus size={14} strokeWidth={2.5} /> <span className="hidden sm:inline">Nuevo Proveedor</span>
            <span className="hidden sm:inline-block" style={{ marginLeft: 4, padding: '2px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontSize: 9, fontFamily: "'DM Mono', monospace" }}>Ctrl</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </header>

      {/* ══ TOOLBAR BUSCADOR ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 0', display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', background: surface, border: `1px solid ${border}`, borderRadius: 8, height: 32, padding: '0 12px', boxShadow: '0 1px 3px rgba(48,54,47,.04)' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = accent} onBlurCapture={e => e.currentTarget.style.borderColor = border}>
          <Search size={13} style={{ color: ct3, marginRight: 8, flexShrink: 0 }} />
          <input type="text" placeholder="Buscar por nombre, CUIT o teléfono..." value={searchTerm} onChange={e => setSearchTerm && setSearchTerm(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {/* ══ CARDS KPI ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: '#E1E1E0', borderRadius: 12, border: `1px solid ${border}`, boxShadow: cardShadow, height: 76, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'box-shadow .2s,transform .2s', animation: `kpiIn .35s ${.05 + i * .07}s ease both` }}
            onMouseEnter={e => { e.currentTarget.style.transform = `translateY(-2px)`; e.currentTarget.style.boxShadow = `0 6px 18px rgba(48,54,47,.11),0 14px 36px rgba(48,54,47,.08)` }} onMouseLeave={e => { e.currentTarget.style.transform = ``; e.currentTarget.style.boxShadow = cardShadow }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${k.color}15, transparent 70%)` }} />
            <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: k.color, borderRadius: '0 2px 2px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: ct3, textTransform: 'uppercase', letterSpacing: '.03em', display: 'block', marginBottom: 2 }}>{k.label}</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: ct1, letterSpacing: '-.03em', display: 'block', lineHeight: 1.1 }}>{k.val}</span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.icon size={15} strokeWidth={2.5} style={{ color: k.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ TABLA DE PROVEEDORES ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: surface, borderRadius: 14, border: `1px solid ${border}`, boxShadow: cardShadow, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: surface2, borderBottom: `1px solid ${border}` }}>
                <tr>
                  {['Nombre y Contacto', 'Email', 'CUIT / CUIL', 'Estado', 'Deuda', 'Acciones'].map((col, i) => (
                    <th key={i} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: i >= 4 ? 'right' : 'left' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proveedoresPaginados.length > 0 ? proveedoresPaginados.map(prov => {
                  const deuda = Number.parseFloat(prov.deuda) || 0
                  const activo = !prov.estado || prov.estado === 'activo'

                  return (
                    <tr key={prov.id} style={{ borderBottom: `1px solid ${border}`, transition: 'background .13s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Nombre y Contacto */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building size={14} strokeWidth={2.5} style={{ color: accent }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>{prov.nombre || '—'}</div>
                            <div style={{ fontSize: 10, color: ct3, display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                              <Phone size={9} /> {prov.telefono || 'Sin teléfono'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 12, color: ct2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={11} style={{ color: ct3 }} />
                          {prov.email || '—'}
                        </div>
                      </td>

                      {/* CUIT */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 600, color: ct2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FileText size={11} style={{ color: ct3 }} />
                          {prov.cuit || '—'}
                        </div>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: activo ? '#F0FDF4' : '#FEF2F2', color: activo ? '#065F46' : '#991B1B', border: `1px solid ${activo ? '#6EE7B7' : '#FCA5A5'}` }}>
                          {activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Deuda */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: deuda > 0 ? '#991B1B' : ct1 }}>
                          ${fMonto(deuda)}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => openModal && openModal("editar-proveedor", prov)} style={{ padding: '0 10px', height: 28, borderRadius: 8, background: surface2, border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: ct2, fontSize: 11, fontWeight: 600, transition: 'all .13s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={e => e.currentTarget.style.background = surface2} title="Editar">
                            <Edit size={12} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => eliminarProveedor && eliminarProveedor(prov.id)} style={{ padding: '0 10px', height: 28, borderRadius: 8, background: surface2, border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#DC2626', fontSize: 11, fontWeight: 600, transition: 'all .13s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FCA5A5' }} onMouseLeave={e => { e.currentTarget.style.background = surface2; e.currentTarget.style.borderColor = border }} title="Eliminar">
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6}>
                      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <Building size={20} style={{ color: ct3 }} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: ct1, marginBottom: 4 }}>Ningún proveedor encontrado</p>
                        <p style={{ fontSize: 12, color: ct3 }}>{searchTerm ? 'Revisá los parámetros de búsqueda.' : 'Aún no cargaste ningún proveedor.'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${border}`, background: surface2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: ct3 }}>
                Mostrando {Math.min(filtrarProveedores.length, proveedoresPaginados.length)} de {filtrarProveedores.length}
              </span>
              <select value={itemsPorPagina} onChange={e => setItemsPorPagina(Number(e.target.value))} style={{ ...pillSelect, padding: '4px 24px 4px 8px', height: 26, fontSize: 11 }}>
                <option value="5">5 / pág</option>
                <option value="10">10 / pág</option>
                <option value="25">25 / pág</option>
                <option value="50">50 / pág</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: paginaActual === 1 ? 'default' : 'pointer', border: `1px solid ${border}`, background: surface2, color: paginaActual === 1 ? 'rgba(0,0,0,.2)' : ct2, transition: 'all .13s' }}>
                <ChevronLeft size={13} strokeWidth={2.5} />
              </button>
              <span style={{ fontSize: 11, fontWeight: 600, color: ct2, padding: '0 6px', letterSpacing: '-0.01em' }}>
                {paginaActual} / {totalPaginas || 1}
              </span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas || totalPaginas === 0} style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (paginaActual === totalPaginas || totalPaginas === 0) ? 'default' : 'pointer', border: `1px solid ${border}`, background: surface2, color: (paginaActual === totalPaginas || totalPaginas === 0) ? 'rgba(0,0,0,.2)' : ct2, transition: 'all .13s' }}>
                <ChevronRight size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes kpiIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

export default Proveedores