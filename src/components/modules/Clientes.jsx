"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Plus, Search, User, FileText, Mail, Phone, Edit, Trash2, Copy, Check, AlertCircle, DollarSign, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

/* ══════════════════════════════════════════════
   PALETA GESTIFY
   #F5F5F5  fondo app
   #FAFAFA  cards (surface)
   #334139  acento verde musgo
   #30362F  texto oscuro (ct1/ct2)
   #8B8982  piedra / texto suave (ct3)
   #DCED31  Primary Action (Lima Dashboard)
══════════════════════════════════════════════ */

const Clientes = ({ clientes = [], searchTerm = "", setSearchTerm, openModal, eliminarCliente }) => {
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [clienteCopiado, setClienteCopiado] = useState(null)

  const [dialogo, setDialogo] = useState({ open: false, type: 'confirm', title: '', message: '', onConfirm: null, isDestructive: false })

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
            openModal('nuevo-cliente')
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

  const searchInputRef = useRef(null)
  const clientesSeguros = Array.isArray(clientes) ? clientes : []

  const filtrarClientes = clientesSeguros.filter(cliente =>
    (cliente.nombre || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
    (cliente.cuit || "").includes(searchTerm) ||
    (cliente.telefono || "").includes(searchTerm)
  ).sort((a, b) => a.nombre.localeCompare(b.nombre))

  // Paginación
  const totalPaginas = Math.ceil(filtrarClientes.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const indiceFin = indiceInicio + itemsPorPagina
  const clientesPaginados = filtrarClientes.slice(indiceInicio, indiceFin)

  useEffect(() => { setPaginaActual(1) }, [searchTerm, itemsPorPagina])

  const handleCopy = async (texto, tipo, clienteId) => {
    try {
      if (!texto) return
      await navigator.clipboard.writeText(texto)
      setClienteCopiado({ id: clienteId, tipo })
      setTimeout(() => setClienteCopiado(null), 2000)
    } catch (err) {
      console.error('Error al copiar: ', err)
    }
  }

  const customConfirm = (title, message, onConfirm, isDestructive = false) => setDialogo({ open: true, type: 'confirm', title, message, onConfirm, isDestructive })
  const cerrarDialogo = () => setDialogo(p => ({ ...p, open: false }))

  const handleEliminar = (id) => {
    if (!eliminarCliente) return
    customConfirm('Eliminar Cliente', '¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.', async () => {
      await eliminarCliente(id);
      cerrarDialogo()
    }, true)
  }

  const resumenClientes = {
    totalClientes: clientesSeguros.length,
    conDeuda: clientesSeguros.filter(c => (Number.parseFloat(c.deuda) || 0) > 0).length,
    totalDeuda: clientesSeguros.reduce((sum, c) => sum + (Number.parseFloat(c.deuda) || 0), 0),
    clientesActivos: clientesSeguros.filter(c => c.estado === "activo" || !c.estado).length,
  }

  const fMonto = (m) => (Number.parseFloat(m) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  /* ── tokens de color base ── */
  const bg = '#F5F5F5'
  const surface = '#FAFAFA'
  const border = 'rgba(48,54,47,.13)'
  const ct1 = '#1e2320'
  const ct2 = '#30362F'
  const ct3 = '#8B8982'
  const accent = '#334139'
  const accentL = 'rgba(51,65,57,.08)'

  const cardStyle = { background: surface, borderColor: border, boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)' }

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ═══════════ HEADER ═══════════ */}
      <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Clientes</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Nuevo Cliente */}
          <button onClick={() => openModal && openModal("nuevo-cliente")} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, border: '1px solid #DCED31', cursor: 'pointer', transition: 'all .13s',
            background: '#DCED31', color: '#282A28',
          }}>
            <Plus size={12} strokeWidth={2.5} /> Nuevo Cliente
            <span style={{ marginLeft: 4, padding: '2px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontSize: 9, fontFamily: "'DM Mono', monospace" }}>Ctrl</span>
          </button>
        </div>
      </header>

      {/* ═══════════ CARDS RESUMEN ═══════════ */}
      <div style={{ padding: '18px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total de Clientes', val: resumenClientes.totalClientes, icon: User, clr: '#373F47', sub: 'Registrados en el sistema' },
          { label: 'Clientes Activos', val: resumenClientes.clientesActivos, icon: CheckCircle, clr: '#065F46', sub: `${resumenClientes.totalClientes > 0 ? Math.round((resumenClientes.clientesActivos / resumenClientes.totalClientes) * 100) : 0}% del total` },
          { label: 'Con Deuda', val: resumenClientes.conDeuda, icon: AlertCircle, clr: '#92400E', sub: `${resumenClientes.totalClientes > 0 ? Math.round((resumenClientes.conDeuda / resumenClientes.totalClientes) * 100) : 0}% de los clientes` },
          { label: 'Deuda Total', val: `$${fMonto(resumenClientes.totalDeuda)}`, icon: DollarSign, clr: '#991B1B', sub: 'Deuda acumulada global' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl overflow-hidden border relative flex flex-col justify-center cursor-default"
            style={{ ...cardStyle, background: '#E1E1E0', height: 76, padding: '0 20px', transition: 'box-shadow .2s,transform .2s', animation: `kpiIn .35s ${.05 + i * .07}s ease both` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(48,54,47,.11),0 14px 36px rgba(48,54,47,.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = cardStyle.boxShadow }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${s.clr}15, transparent 70%)` }} />
            {/* barra lateral de color */}
            <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: s.clr, borderRadius: '0 2px 2px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: ct3, textTransform: 'uppercase', letterSpacing: '.03em', display: 'block', marginBottom: 2 }}>{s.label}</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: ct1, letterSpacing: '-.03em', display: 'block', lineHeight: 1.1 }}>{s.val}</span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${s.clr}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={15} strokeWidth={2.5} style={{ color: s.clr }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════ MAIN CONTENT (TABLA) ═══════════ */}
      <div style={{ padding: '18px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...cardStyle, borderRadius: 12, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* TOOLBAR CONTROLES */}
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyItems: 'space-between', borderBottom: `1px solid ${border}`, background: surface, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
                <input ref={searchInputRef} type="text" placeholder="Buscar por nombre, CUIT o teléfono..." value={searchTerm} onChange={e => setSearchTerm && setSearchTerm(e.target.value)}
                  style={{ width: '100%', height: 32, padding: '0 12px 0 30px', fontSize: 12, color: ct1, background: '#fff', border: `1px solid ${border}`, borderRadius: 8, outline: 'none', transition: 'all .15s' }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <span style={{ fontSize: 11, color: ct3, fontWeight: 500 }}>{filtrarClientes.length} clientes encontrados</span>
            </div>
          </div>

          {/* TABLA SCROLL */}
          <div style={{ flex: 1, overflow: 'auto', background: '#FDFDFD' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: surface, zIndex: 10, borderBottom: `1px solid ${border}` }}>
                <tr>
                  {['NOMBRE Y DATOS', 'CUIT / CUIL', 'CONTACTO', 'CONDICIÓN IVA', 'ESTADO/DEUDA', 'ACCIONES'].map((col, i) => (
                    <th key={i} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.length > 0 ? (
                  clientesPaginados.map((cliente, i) => {
                    const debe = Number.parseFloat(cliente.deuda) || 0
                    const tieneDeuda = debe > 0

                    return (
                      <tr key={cliente.id} style={{ borderBottom: `1px solid ${border}`, transition: 'background .15s', cursor: 'default' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                        {/* CLIENTE INFO */}
                        <td style={{ padding: '12px 16px', minWidth: 200, verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={15} strokeWidth={2.5} style={{ color: accent }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: ct1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{cliente.nombre || 'Sin nombre'}</div>
                              {cliente.email && <div style={{ fontSize: 11, color: ct3, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={10} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cliente.email}</span></div>}
                            </div>
                          </div>
                        </td>

                        {/* CUIT */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: ct2, fontFamily: "'DM Mono', monospace" }}>
                            <FileText size={12} style={{ color: ct3 }} /> {cliente.cuit || "—"}
                          </div>
                        </td>

                        {/* TELÉFONO */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: ct2 }}>
                            <Phone size={12} style={{ color: ct3 }} />
                            <span style={{ fontFamily: "'DM Mono', monospace" }}>{cliente.telefono || "—"}</span>
                            {cliente.telefono && (
                              <button onClick={() => handleCopy(cliente.telefono, "telefono", cliente.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 3, borderRadius: 4, transition: 'all .1s', color: clienteCopiado?.id === cliente.id ? '#065F46' : ct3 }} title="Copiar Teléfono">
                                {clienteCopiado?.id === cliente.id ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* IVA */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: '#FAFAFA', color: '#373F47', border: '1px solid rgba(55,63,71,.12)', whiteSpace: 'nowrap' }}>
                            {cliente.condicionIVA || "Consumidor Final"}
                          </span>
                        </td>

                        {/* ESTADO / DEUDA */}
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          {tieneDeuda ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                              <AlertCircle size={11} strokeWidth={2.5} /> ${fMonto(debe)}
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: '#F0FDF4', color: '#065F46', border: '1px solid #6EE7B7' }}>
                              <CheckCircle size={11} strokeWidth={2.5} /> Al día
                            </div>
                          )}
                        </td>

                        {/* ACCIONES */}
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openModal && openModal('editar-cliente', cliente)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: surface, border: `1px solid ${border}`, cursor: 'pointer', transition: 'all .15s', color: ct2 }} onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={e => e.currentTarget.style.background = surface} title="Editar">
                              <Edit size={13} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => handleEliminar(cliente.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: surface, border: `1px solid ${border}`, cursor: 'pointer', transition: 'all .15s', color: '#DC2626' }} onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FCA5A5' }} onMouseLeave={e => { e.currentTarget.style.background = surface; e.currentTarget.style.borderColor = border }} title="Eliminar">
                              <Trash2 size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(48,54,47,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <User size={20} style={{ color: ct3 }} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: ct1, marginBottom: 4 }}>Ningún cliente encontrado</p>
                        <p style={{ fontSize: 12, color: ct3 }}>{searchTerm ? 'Revisá los parámetros de búsqueda.' : 'Aún no cargaste ningún cliente en la plataforma.'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER PAGINACIÓN */}
          <div style={{ padding: '12px 16px', background: surface, borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select value={itemsPorPagina} onChange={e => setItemsPorPagina(Number(e.target.value))} style={{ padding: '4px 24px 4px 8px', fontSize: 11, fontWeight: 600, color: ct2, background: '#fff', border: `1px solid ${border}`, borderRadius: 6, outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8982' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}>
                <option value="10">10 / pág</option>
                <option value="20">20 / pág</option>
                <option value="50">50 / pág</option>
              </select>
              <span style={{ fontSize: 11, color: ct3, fontWeight: 500 }}>
                Mostrando {clientesPaginados.length > 0 ? (paginaActual - 1) * itemsPorPagina + 1 : 0} a {((paginaActual - 1) * itemsPorPagina) + clientesPaginados.length} de {filtrarClientes.length}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: paginaActual === 1 ? 'transparent' : '#fff', border: `1px solid ${paginaActual === 1 ? 'transparent' : border}`, cursor: paginaActual === 1 ? 'default' : 'pointer', color: paginaActual === 1 ? 'rgba(0,0,0,.2)' : ct2 }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 11, fontWeight: 600, color: ct2, minWidth: 36, textAlign: 'center' }}>{paginaActual} / {totalPaginas || 1}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual >= totalPaginas} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: paginaActual >= totalPaginas ? 'transparent' : '#fff', border: `1px solid ${paginaActual >= totalPaginas ? 'transparent' : border}`, cursor: paginaActual >= totalPaginas ? 'default' : 'pointer', color: paginaActual >= totalPaginas ? 'rgba(0,0,0,.2)' : ct2 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOGO CONFIRMACION */}
      {dialogo.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(2px)', animation: 'fadeIn .2s ease' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: 360, borderRadius: 16, padding: 24, boxShadow: '0 10px 40px rgba(0,0,0,.1)', animation: 'scaleUp .2s ease' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: ct1, marginBottom: 8 }}>{dialogo.title}</h3>
            <p style={{ fontSize: 13, color: ct3, lineHeight: 1.5, marginBottom: 20 }}>{dialogo.message}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={cerrarDialogo} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: ct2, background: surface, border: `1px solid ${border}`, cursor: 'pointer' }}>Cancelar</button>
              {dialogo.type === 'confirm' && (
                <button onClick={() => { if (dialogo.onConfirm) dialogo.onConfirm(); cerrarDialogo() }} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#fff', background: dialogo.isDestructive ? '#DC2626' : ct1, border: 'none', cursor: 'pointer' }}>
                  Confirmar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KEYFRAMES GLOBALES */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,.15); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,.25); }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(.95) } to { opacity: 1; transform: scale(1) } }
        @keyframes kpiIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

export default Clientes