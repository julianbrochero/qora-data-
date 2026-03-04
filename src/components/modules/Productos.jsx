"use client"

import { useState, useEffect } from "react"
import {
  Plus, Search, Edit, Trash2, Tag, Package, X, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, BarChart2, Archive, Download, Upload
  , Menu
} from "lucide-react"

/* ══════════════════════════════════════════════
   PALETA GESTIFY
   #F5F5F5  fondo app
   #FAFAFA  surface
   #282A28  header
   #334139  acento verde
   #DCED31  Primary Action Lima
   #8B8982  ct3 suave
══════════════════════════════════════════════ */

const bg = '#F5F5F5'
const surface = '#FAFAFA'
const border = 'rgba(48,54,47,.13)'
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const accentL = 'rgba(51,65,57,.08)'

const cardStyle = { background: surface, borderColor: border, boxShadow: '0 1px 4px rgba(48,54,47,.07),0 4px 18px rgba(48,54,47,.07)' }

/* ─── input base ─── */
const inputStyle = { width: '100%', height: 34, padding: '0 12px', fontSize: 12, color: ct1, background: '#fff', border: `1px solid ${border}`, borderRadius: 8, outline: 'none', fontFamily: "'Inter', sans-serif" }
const labelStyle = { fontSize: 11, fontWeight: 600, color: ct2, marginBottom: 4, display: 'block' }

/* ══════════════════════════════════════════════
   MODAL CATEGORÍAS
══════════════════════════════════════════════ */
const ModalCategorias = ({ isOpen, onClose, categorias = [], onRenombrar, onEliminar }) => {
  const [nombre, setNombre] = useState('')
  const [editNombre, setEditNombre] = useState('')
  const [editId, setEditId] = useState(null)
  const [filtro, setFiltro] = useState('')

  if (!isOpen) return null

  const filtradas = categorias.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase())
  )

  const iniciarEdicion = (cat) => { setEditId(cat.nombre); setEditNombre(cat.nombre) }
  const cancelar = () => { setEditId(null); setEditNombre('') }

  const guardar = () => {
    if (!nombre.trim()) return
    // no duplicadas
    if (categorias.some(c => c.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
      alert('Esa categoría ya existe'); return
    }
    // "crear" no tiene efecto directo en BD (se crea al asignar un producto)
    // solo mostramos una nota
    alert(`La categoría "${nombre.trim()}" se puede usar ahora al cargar un producto.`)
    setNombre('')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', width: '90%', maxWidth: 420, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,.12)', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
        {/* header */}
        <div style={{ background: '#282A28', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Inventario</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-.02em' }}>Gestionar Categorías</h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,.6)' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {/* info */}
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(51,65,57,.06)', border: '1px solid rgba(51,65,57,.15)', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: accent, fontWeight: 600, margin: 0 }}>Las categorías se crean automáticamente
              Cuando asignás una categoría a un producto, aparece acá. Pueden renombrarse y eso actualiza todos los productos de esa categoría.</p>
          </div>

          {/* buscador */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
            <input style={{ ...inputStyle, paddingLeft: 30, height: 30 }} value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar categorías..." onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border} />
          </div>

          {/* lista */}
          <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
            {filtradas.length > 0 ? filtradas.map(cat => (
              <div key={cat.nombre} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: `1px solid ${border}`, marginBottom: 6, background: '#fff' }}>
                {editId === cat.nombre ? (
                  <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center' }}>
                    <input
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      style={{ ...inputStyle, height: 28, flex: 1 }}
                      onFocus={e => e.target.style.borderColor = accent}
                      onBlur={e => e.target.style.borderColor = border}
                      autoFocus
                    />
                    <button onClick={() => { if (editNombre.trim()) { onRenombrar(cat.nombre, editNombre.trim()); cancelar() } }}
                      style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: accent, color: '#fff', border: 'none', cursor: 'pointer' }}>OK</button>
                    <button onClick={cancelar}
                      style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: surface, color: ct2, border: `1px solid ${border}`, cursor: 'pointer' }}>Cancelar</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tag size={12} style={{ color: accent }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: ct1 }}>{cat.nombre}</div>
                        <div style={{ fontSize: 10, color: ct3 }}>{cat.cantidad} producto{cat.cantidad !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={() => iniciarEdicion(cat)} title="Renombrar" style={{ width: 26, height: 26, borderRadius: 6, background: surface, border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct2 }}>
                        <Edit size={11} />
                      </button>
                      <button
                        onClick={() => { if (cat.cantidad > 0) { alert('No se puede eliminar una categoría con productos asignados. Primero reasignálos.'); return } onEliminar(cat.nombre) }}
                        title={cat.cantidad > 0 ? 'Tiene productos asignados' : 'Eliminar'}
                        style={{ width: 26, height: 26, borderRadius: 6, background: cat.cantidad > 0 ? 'transparent' : surface, border: `1px solid ${cat.cantidad > 0 ? 'transparent' : border}`, cursor: cat.cantidad > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', opacity: cat.cantidad > 0 ? 0.3 : 1 }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: ct3, fontSize: 12 }}>
                {categorias.length === 0 ? 'Aún no hay categorías. Asigná una a un producto para que aparezca.' : 'Sin resultados.'}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: ct2, background: surface, border: `1px solid ${border}`, cursor: 'pointer' }}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MÓDULO PRINCIPAL PRODUCTOS
══════════════════════════════════════════════ */
const Productos = ({ productos, searchTerm, setSearchTerm, openModal, eliminarProducto, editarProducto, onOpenMobileSidebar }) => {
  const [filtroStock, setFiltroStock] = useState("todos")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(10)
  const [modalCats, setModalCats] = useState(false)
  const [dialogo, setDialogo] = useState({ open: false, title: '', message: '', onConfirm: null })

  const productosSeguros = Array.isArray(productos) ? productos : []

  // Categorías derivadas dinámicamente de los productos reales
  const categorias = (() => {
    const mapa = {}
    productosSeguros.forEach(p => {
      const cat = (p.categoria || '').trim()
      if (!cat) return
      if (!mapa[cat]) mapa[cat] = 0
      mapa[cat]++
    })
    return Object.entries(mapa).map(([nombre, cantidad]) => ({ nombre, cantidad }))
  })()

  // Renombrar categoría en todos los productos que la tienen
  const handleRenombrarCategoria = async (nombreViejo, nombreNuevo) => {
    // Actualizar en Supabase todos los productos con esa categoría
    const { supabase } = await import('../../lib/supabaseClient')
    const ids = productosSeguros.filter(p => p.categoria === nombreViejo).map(p => p.id)
    await Promise.all(ids.map(id => supabase.from('productos').update({ categoria: nombreNuevo }).eq('id', id)))
    // Recargar la página de productos sería ideal — por ahora lo notificamos
    alert(`Categoría renombrada. Recargá la lista de productos para ver el cambio.`)
  }

  // "Eliminar" categoría = limpiar el campo categoria en todos los productos que la tengan
  const handleEliminarCategoria = async (nombreCat) => {
    const { supabase } = await import('../../lib/supabaseClient')
    const ids = productosSeguros.filter(p => p.categoria === nombreCat).map(p => p.id)
    await Promise.all(ids.map(id => supabase.from('productos').update({ categoria: '' }).eq('id', id)))
    alert(`Categoría eliminada de todos los productos.`)
  }

  /* ── atajo de teclado (solo Ctrl) ── */
  useEffect(() => {
    let ctrlPressed = false
    let otherKeyPressed = false
    const down = (e) => { if (e.key === 'Control') ctrlPressed = true; else if (ctrlPressed) otherKeyPressed = true }
    const up = (e) => {
      if (e.key === 'Control') {
        if (!otherKeyPressed && openModal) {
          const a = document.activeElement
          if (!(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA'))) openModal('nuevo-producto')
        }
        ctrlPressed = false; otherKeyPressed = false
      }
    }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [openModal])

  const productosSeguros = Array.isArray(productos) ? productos : []

  const filtrados = productosSeguros.filter(p => {
    const q = (searchTerm || "").toLowerCase()
    const match = (p.nombre || "").toLowerCase().includes(q) || (p.codigo || "").toLowerCase().includes(q)
    if (filtroStock === "en-stock") return match && p.controlaStock && (p.stock || 0) > 0
    if (filtroStock === "bajo-stock") return match && p.controlaStock && (p.stock || 0) <= 10
    return match
  })

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const productosPag = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina)

  useEffect(() => { setPaginaActual(1) }, [filtroStock, searchTerm, itemsPorPagina])

  const fMonto = v => (parseFloat(v) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const resumen = {
    total: productosSeguros.length,
    conStock: productosSeguros.filter(p => p.controlaStock && (p.stock || 0) > 0).length,
    bajoStock: productosSeguros.filter(p => p.controlaStock && (p.stock || 0) <= 10).length,
    sinControl: productosSeguros.filter(p => !p.controlaStock).length,
  }

  const customConfirm = (title, message, onConfirm) => setDialogo({ open: true, title, message, onConfirm })
  const cerrarDialogo = () => setDialogo(p => ({ ...p, open: false }))

  const handleEliminar = (id) => customConfirm('Eliminar Producto', '¿Estás seguro? Esta acción no se puede deshacer.', async () => { eliminarProducto && eliminarProducto(id); cerrarDialogo() })

  const pillSelect = {
    height: 32, padding: '0 10px', fontSize: 11, fontWeight: 600, color: ct2, background: '#fff',
    border: `1px solid ${border}`, borderRadius: 8, outline: 'none', cursor: 'pointer',
    appearance: 'none', fontFamily: "'Inter', sans-serif"
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, fontFamily: "'Inter',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ══ HEADER ══ */}
      <header style={{ background: '#282A28', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '0 clamp(12px, 3vw, 24px)', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0, flexWrap: 'wrap', paddingBottom: 8, paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
            <Menu size={16} strokeWidth={2} />
          </button>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Productos</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setModalCats(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,.18)', background: 'transparent', color: 'rgba(255,255,255,.7)', cursor: 'pointer', transition: 'all .13s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.07)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Tag size={12} strokeWidth={2} /> Categorías
          </button>

          <button onClick={() => openModal && openModal("nuevo-producto")} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid #DCED31', cursor: 'pointer', transition: 'all .13s', background: '#DCED31', color: '#282A28' }}>
            <Plus size={12} strokeWidth={2.5} /> Nuevo <span className="hidden sm:inline">Producto</span>
            <span className="hidden sm:inline-block" style={{ marginLeft: 4, padding: '2px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontSize: 9, fontFamily: "'DM Mono', monospace" }}>Ctrl</span>
          </button>
        </div>
      </header>

      {/* ══ CARDS RESUMEN ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Productos', val: resumen.total, icon: Package, clr: '#373F47', sub: 'En catálogo' },
          { label: 'Con Stock', val: resumen.conStock, icon: CheckCircle, clr: '#065F46', sub: `${resumen.total > 0 ? Math.round(resumen.conStock / resumen.total * 100) : 0}% disponibles` },
          { label: 'Bajo Stock', val: resumen.bajoStock, icon: AlertTriangle, clr: '#92400E', sub: '≤10 unidades' },
          { label: 'Sin Control', val: resumen.sinControl, icon: Archive, clr: '#6B7280', sub: 'Stock ilimitado' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, background: '#E1E1E0', borderRadius: 12, height: 76, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'box-shadow .2s,transform .2s', animation: `kpiIn .35s ${.05 + i * .07}s ease both` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(48,54,47,.11),0 14px 36px rgba(48,54,47,.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = cardStyle.boxShadow }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${s.clr}15, transparent 70%)` }} />
            <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: s.clr, borderRadius: '0 2px 2px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: ct3, textTransform: 'uppercase', letterSpacing: '.03em', display: 'block', marginBottom: 2 }}>{s.label}</span>
                <span style={{ fontSize: 22, fontWeight: 600, color: ct1, letterSpacing: '-.04em', lineHeight: 1 }}>{s.val}</span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${s.clr}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={15} strokeWidth={2.5} style={{ color: s.clr }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ TABLA ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...cardStyle, borderRadius: 12, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* toolbar */}
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${border}`, background: surface, flexWrap: 'wrap' }}>
            {/* search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input type="text" placeholder="Buscar por nombre o código..." value={searchTerm} onChange={e => setSearchTerm && setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 30, height: 32 }}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border} />
            </div>

            {/* filtro stock */}
            <select value={filtroStock} onChange={e => setFiltroStock(e.target.value)} style={pillSelect}>
              <option value="todos">Todos los productos</option>
              <option value="en-stock">Con stock disponible</option>
              <option value="bajo-stock">Bajo stock (≤10)</option>
            </select>

            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ ...pillSelect, display: 'flex', alignItems: 'center', gap: 5, paddingRight: 10 }}>
                <Download size={11} /> CSV
              </button>
              <button style={{ ...pillSelect, display: 'flex', alignItems: 'center', gap: 5, paddingRight: 10 }}>
                <Upload size={11} /> CSV
              </button>
            </div>

            <span style={{ fontSize: 11, color: ct3, fontWeight: 500, marginLeft: 'auto' }}>{filtrados.length} productos</span>
          </div>

          {/* tabla scroll */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: surface, zIndex: 10, borderBottom: `1px solid ${border}` }}>
                <tr>
                  {['CÓDIGO', 'NOMBRE Y CATEGORÍA', 'PRECIO', 'STOCK', 'CONTROL', 'ACCIONES'].map((col, i) => (
                    <th key={i} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: i >= 2 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productosPag.length > 0 ? productosPag.map(prod => {
                  const precioNeto = (parseFloat(prod.precio) || 0) * 0.79
                  const stockLow = prod.controlaStock && (prod.stock || 0) <= 10 && (prod.stock || 0) >= 0

                  return (
                    <tr key={prod.id} style={{ borderBottom: `1px solid ${border}`, transition: 'background .13s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* código */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={13} strokeWidth={2.5} style={{ color: accent }} />
                          </div>
                          <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: ct2, fontWeight: 600 }}>{prod.codigo || '—'}</span>
                        </div>
                      </td>

                      {/* nombre & categoria */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: ct1, marginBottom: 3 }}>{prod.nombre || '—'}</div>
                        <span style={{ padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(55,63,71,.07)', color: '#373F47', border: '1px solid rgba(55,63,71,.1)' }}>
                          {prod.categoria || 'General'}
                        </span>
                      </td>

                      {/* precio */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>${fMonto(prod.precio)}</div>
                        <div style={{ fontSize: 10, color: ct3, marginTop: 2 }}>Neto: ${fMonto(precioNeto)}</div>
                      </td>

                      {/* stock */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        {prod.controlaStock ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: stockLow ? '#FEF2F2' : '#F0FDF4', color: stockLow ? '#991B1B' : '#065F46', border: `1px solid ${stockLow ? '#FCA5A5' : '#6EE7B7'}` }}>
                            {stockLow && <AlertTriangle size={11} strokeWidth={2.5} />}
                            {prod.stock || 0} u.
                          </div>
                        ) : <span style={{ color: ct3, fontSize: 12 }}>—</span>}
                      </td>

                      {/* control */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: prod.controlaStock ? '#F0FDF4' : surface, color: prod.controlaStock ? '#065F46' : ct3, border: `1px solid ${prod.controlaStock ? '#6EE7B7' : border}` }}>
                          {prod.controlaStock ? 'Sí' : 'No'}
                        </span>
                      </td>

                      {/* acciones */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => openModal && openModal("editar-producto", prod)} style={{ padding: '0 10px', height: 28, borderRadius: 8, background: surface, border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: ct2, fontSize: 11, fontWeight: 600, transition: 'all .13s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'} onMouseLeave={e => e.currentTarget.style.background = surface} title="Editar">
                            <Edit size={12} strokeWidth={2.5} /> Editar
                          </button>
                          <button onClick={() => handleEliminar(prod.id)} style={{ padding: '0 10px', height: 28, borderRadius: 8, background: surface, border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#DC2626', fontSize: 11, fontWeight: 600, transition: 'all .13s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FCA5A5' }} onMouseLeave={e => { e.currentTarget.style.background = surface; e.currentTarget.style.borderColor = border }} title="Eliminar">
                            <Trash2 size={12} strokeWidth={2.5} /> Eliminar
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
                          <Package size={20} style={{ color: ct3 }} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: ct1, marginBottom: 4 }}>Ningún producto encontrado</p>
                        <p style={{ fontSize: 12, color: ct3 }}>{searchTerm ? 'Revisá los parámetros de búsqueda.' : 'Aún no cargaste ningún producto.'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* footer paginación */}
          <div style={{ padding: '12px 16px', background: surface, borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select value={itemsPorPagina} onChange={e => setItemsPorPagina(Number(e.target.value))} style={{ height: 28, padding: '0 22px 0 8px', fontSize: 11, fontWeight: 600, color: ct2, background: '#fff', border: `1px solid ${border}`, borderRadius: 6, outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8982' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 5px center' }}>
                <option value="10">10 / pág</option>
                <option value="25">25 / pág</option>
                <option value="50">50 / pág</option>
              </select>
              <span style={{ fontSize: 11, color: ct3, fontWeight: 500 }}>
                {productosPag.length > 0 ? `${indiceInicio + 1} - ${indiceInicio + productosPag.length}` : '0'} de {filtrados.length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} style={{ width: 28, height: 28, borderRadius: 6, background: paginaActual === 1 ? 'transparent' : '#fff', border: `1px solid ${paginaActual === 1 ? 'transparent' : border}`, cursor: paginaActual === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: paginaActual === 1 ? 'rgba(0,0,0,.2)' : ct2 }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 11, fontWeight: 600, color: ct2, minWidth: 38, textAlign: 'center' }}>{paginaActual} / {totalPaginas || 1}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual >= totalPaginas} style={{ width: 28, height: 28, borderRadius: 6, background: paginaActual >= totalPaginas ? 'transparent' : '#fff', border: `1px solid ${paginaActual >= totalPaginas ? 'transparent' : border}`, cursor: paginaActual >= totalPaginas ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: paginaActual >= totalPaginas ? 'rgba(0,0,0,.2)' : ct2 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CATEGORÍAS */}
      <ModalCategorias
        isOpen={modalCats}
        onClose={() => setModalCats(false)}
        categorias={categorias}
        onRenombrar={handleRenombrarCategoria}
        onEliminar={handleEliminarCategoria}
      />

      {/* DIALOGO CONFIRMACIÓN */}
      {dialogo.open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', width: '90%', maxWidth: 340, borderRadius: 16, padding: 24, boxShadow: '0 10px 40px rgba(0,0,0,.12)', fontFamily: "'Inter', sans-serif" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: ct1, marginBottom: 8 }}>{dialogo.title}</h3>
            <p style={{ fontSize: 13, color: ct3, lineHeight: 1.5, marginBottom: 20 }}>{dialogo.message}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={cerrarDialogo} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: ct2, background: surface, border: `1px solid ${border}`, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { dialogo.onConfirm && dialogo.onConfirm() }} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#fff', background: '#DC2626', border: 'none', cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.14);border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.22)}
        @keyframes kpiIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  )
}

export default Productos