"use client"

import { useState, useEffect, useRef } from "react"
import {
  Plus, Search, Edit, Trash2, Tag, Package, X, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, BarChart2, Archive, Download, Upload,
  Menu, CheckSquare
} from "lucide-react"
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthContext'

/* ══════════════════════════════════════════════
   PALETA GESTIFY
   #F5F5F5  fondo app
   #FAFAFA  surface
   #282A28  header
   #334139  acento verde
   #4ADE80  Primary Action Lima
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
const ModalCategorias = ({ isOpen, onClose, categorias = [], onRenombrar, onEliminar, onNuevoProductoConCategoria, onAgregarCategoria }) => {
  const [editNombre, setEditNombre] = useState('')
  const [editId, setEditId] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [nuevaCat, setNuevaCat] = useState('')

  if (!isOpen) return null

  const filtradas = categorias.filter(c =>
    c.nombre.toLowerCase().includes(filtro.toLowerCase())
  )

  const iniciarEdicion = (cat) => { setEditId(cat.nombre); setEditNombre(cat.nombre) }
  const cancelar = () => { setEditId(null); setEditNombre('') }

  const crearProductoConCategoria = (cat) => {
    onNuevoProductoConCategoria && onNuevoProductoConCategoria(cat)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(3px)', padding: '12px' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 480, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,.15)', overflow: 'hidden', fontFamily: "'Inter', sans-serif", maxHeight: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ background: '#282A28', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(74,222,128,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} style={{ color: '#4ADE80' }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Inventario</p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-.02em', margin: 0 }}>Gestionar Categorías</h3>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,.6)', flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>

          {/* ── Agregar nueva categoría ── */}
          <div style={{ marginBottom: 14, padding: '14px', borderRadius: 12, background: 'rgba(51,65,57,.05)', border: '1px solid rgba(51,65,57,.18)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 10px' }}>
              <Plus size={12} strokeWidth={2.5} /> Nueva categoría
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <Tag size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
                <input
                  value={nuevaCat}
                  onChange={e => setNuevaCat(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === 'Enter' && nuevaCat.trim()) {
                      const catName = nuevaCat.trim()
                      if (onAgregarCategoria) await onAgregarCategoria(catName)
                      setNuevaCat('')
                    }
                  }}
                  placeholder="Ej: Electrónica, Ropa, Bebidas..."
                  style={{ ...inputStyle, paddingLeft: 28, height: 36, fontSize: 13 }}
                  onFocus={e => e.target.style.borderColor = accent}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <button
                onClick={async () => {
                  if (nuevaCat.trim()) {
                    const catName = nuevaCat.trim()
                    if (onAgregarCategoria) await onAgregarCategoria(catName)
                    setNuevaCat('')
                  }
                }}
                disabled={!nuevaCat.trim()}
                style={{ padding: '0 16px', height: 36, borderRadius: 8, fontSize: 13, fontWeight: 700, background: nuevaCat.trim() ? accent : 'rgba(0,0,0,.04)', color: nuevaCat.trim() ? '#fff' : ct3, border: 'none', cursor: nuevaCat.trim() ? 'pointer' : 'default', transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0 }}>
                + Agregar
              </button>
            </div>
          </div>

          {/* buscador + contador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input style={{ ...inputStyle, paddingLeft: 30, height: 32 }} value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar categorías..." onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = border} />
            </div>
            <span style={{ fontSize: 11, color: ct3, whiteSpace: 'nowrap', flexShrink: 0 }}>{filtradas.length} {filtradas.length === 1 ? 'categoría' : 'categorías'}</span>
          </div>

          {/* lista */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtradas.length > 0 ? filtradas.map(cat => (
              <div key={cat.nombre} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, border: `1px solid ${border}`, background: '#fff', gap: 8 }}>
                {editId === cat.nombre ? (
                  <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center', minWidth: 0 }}>
                    <input
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      style={{ ...inputStyle, height: 30, flex: 1, minWidth: 0 }}
                      onFocus={e => e.target.style.borderColor = accent}
                      onBlur={e => e.target.style.borderColor = border}
                      onKeyDown={e => { if (e.key === 'Enter' && editNombre.trim()) { onRenombrar(cat.nombre, editNombre.trim()); cancelar() } if (e.key === 'Escape') cancelar() }}
                      autoFocus
                    />
                    <button onClick={() => { if (editNombre.trim()) { onRenombrar(cat.nombre, editNombre.trim()); cancelar() } }}
                      style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: accent, color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}>OK</button>
                    <button onClick={cancelar}
                      style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: surface, color: ct2, border: `1px solid ${border}`, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Tag size={13} style={{ color: accent }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: ct1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.nombre}</div>
                        <div style={{ fontSize: 10, color: ct3 }}>{cat.cantidad} producto{cat.cantidad !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                      <button onClick={() => iniciarEdicion(cat)} title="Renombrar" style={{ width: 28, height: 28, borderRadius: 7, background: surface, border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ct2 }}>
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => { if (cat.cantidad > 0) { alert('No se puede eliminar una categoría con productos. Primero reasignálos.'); return } onEliminar(cat.nombre) }}
                        title={cat.cantidad > 0 ? 'Tiene productos asignados' : 'Eliminar'}
                        style={{ width: 28, height: 28, borderRadius: 7, background: cat.cantidad > 0 ? 'transparent' : surface, border: `1px solid ${cat.cantidad > 0 ? 'transparent' : border}`, cursor: cat.cantidad > 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', opacity: cat.cantidad > 0 ? 0.3 : 1 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '28px 0', color: ct3, fontSize: 13 }}>
                <Tag size={28} style={{ color: border, display: 'block', margin: '0 auto 10px' }} />
                {categorias.length === 0 ? 'Aún no hay categorías. Creá una arriba ↑' : 'Sin resultados para la búsqueda.'}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'flex-end', flexShrink: 0, background: surface }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: ct2, background: '#fff', border: `1px solid ${border}`, cursor: 'pointer' }}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MÓDULO PRINCIPAL PRODUCTOS
══════════════════════════════════════════════ */
const Productos = ({ productos, searchTerm, setSearchTerm, openModal, eliminarProducto, editarProducto, onOpenMobileSidebar, recargarProductos, categoriasDb, agregarCategoria, renombrarCategoria, eliminarCategoria }) => {
  const { user } = useAuth()
  const [filtroStock, setFiltroStock] = useState("todos")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [paginaActual, setPaginaActual] = useState(1)
  const [itemsPorPagina, setItemsPorPagina] = useState(() => {
    try { const v = parseInt(localStorage.getItem('gestify_items_por_pagina')); return v && [10,25,50,100,99999].includes(v) ? v : 10 } catch { return 10 }
  })
  const [modalCats, setModalCats] = useState(false)
  const [dialogo, setDialogo] = useState({ open: false, title: '', message: '', onConfirm: null })
  // inline edit
  const [inlineEdit, setInlineEdit] = useState({ prodId: null, field: null, val: '' })
  // csv
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvResultado, setCsvResultado] = useState(null) // { tipo:'ok'|'error', msg }
  const csvInputRef = useRef(null)
  // selección múltiple
  const [stockCfg] = useState(() => {
    try {
      return {
        activo: localStorage.getItem('gestify_bajo_stock_activo') !== 'false',
        umbral: parseInt(localStorage.getItem('gestify_bajo_stock_umbral')) || 5,
      }
    } catch { return { activo: true, umbral: 5 } }
  })
  const [modoSeleccion, setModoSeleccion] = useState(false)
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [bulkCatOpen, setBulkCatOpen] = useState(false)
  const [bulkCatPos, setBulkCatPos] = useState({ top: 0, left: 0 })
  const bulkCatBtnRef = useRef(null)
  const [selCatOpen, setSelCatOpen] = useState(false)
  const [selCatPos, setSelCatPos] = useState({ top: 0, left: 0 })
  const selCatBtnRef = useRef(null)
  const [orden, setOrden] = useState({ campo: null, dir: 'asc' })

  const startEdit = (prodId, field, currentVal) => setInlineEdit({ prodId, field, val: String(parseFloat(currentVal) || 0) })
  const cancelEdit = () => setInlineEdit({ prodId: null, field: null, val: '' })
  const commitEdit = async (prod) => {
    const { prodId, field, val } = inlineEdit
    if (!prodId || !field || !editarProducto) { cancelEdit(); return }
    // Costo vacío o cero → guardar null (muestra '— agregar')
    if (field === 'costo' && (val === '' || val === '0' || parseFloat(val) === 0)) {
      const costoActual = parseFloat(prod.costo)
      if (costoActual > 0) await editarProducto(prodId, { costo: null })
      cancelEdit(); return
    }
    const numVal = field === 'stock' ? parseInt(val) : parseFloat(val)
    if (isNaN(numVal) || numVal < 0) { cancelEdit(); return }
    const valActual = parseFloat(prod[field])
    if (numVal !== valActual) await editarProducto(prodId, { [field]: numVal })
    cancelEdit()
  }

  const productosSeguros = Array.isArray(productos) ? productos : []

  // Categorías desde DB combinadas con cantidades para la UI
  const categorias = (() => {
    const mapa = {}
    productosSeguros.forEach(p => {
      const cat = (p.categoria || '').trim()
      if (!cat) return
      if (!mapa[cat]) mapa[cat] = 0
      mapa[cat]++
    })
    return (categoriasDb || []).map(cat => ({
      nombre: cat.nombre,
      cantidad: mapa[cat.nombre] || 0
    }))
  })()

  const handleRenombrarCategoria = async (nombreViejo, nombreNuevo) => {
    if (renombrarCategoria) await renombrarCategoria(nombreViejo, nombreNuevo)
  }

  const handleEliminarCategoria = async (nombreCat) => {
    if (eliminarCategoria) {
      const res = await eliminarCategoria(nombreCat)
      if (!res.success) alert(res.mensaje || 'Error al eliminar la categoría')
    }
  }

  const handleAgregarCategoria = async (nombreCat) => {
    if (agregarCategoria) await agregarCategoria(nombreCat)
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



  const filtrados = productosSeguros.filter(p => {
    const q = (searchTerm || "").toLowerCase()
    const match = (p.nombre || "").toLowerCase().includes(q) || (p.codigo || "").toLowerCase().includes(q)
    if (filtroCategoria !== "todas" && (p.categoria || '').trim() !== filtroCategoria) return false
    const cs = !!(p.controlastock || p.controlaStock)
    if (filtroStock === "en-stock") return match && cs && (p.stock || 0) > stockCfg.umbral
    if (filtroStock === "bajo-stock") return match && cs && stockCfg.activo && (p.stock || 0) <= stockCfg.umbral
    return match
  })

  const toggleOrden = (campo) => setOrden(prev =>
    prev.campo === campo ? { campo, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { campo, dir: 'asc' }
  )

  const filtradosOrdenados = [...filtrados].sort((a, b) => {
    if (!orden.campo) return 0
    const mul = orden.dir === 'asc' ? 1 : -1
    if (orden.campo === 'nombre') return mul * (a.nombre || '').localeCompare(b.nombre || '', 'es')
    if (orden.campo === 'codigo') return mul * (a.codigo || '').localeCompare(b.codigo || '', undefined, { numeric: true, sensitivity: 'base' })
    if (orden.campo === 'precio') return mul * ((parseFloat(a.precio) || 0) - (parseFloat(b.precio) || 0))
    if (orden.campo === 'costo') return mul * ((parseFloat(a.costo) || 0) - (parseFloat(b.costo) || 0))
    if (orden.campo === 'stock') return mul * ((parseInt(a.stock) || 0) - (parseInt(b.stock) || 0))
    return 0
  })

  const totalPaginas = Math.ceil(filtradosOrdenados.length / itemsPorPagina)
  const indiceInicio = (paginaActual - 1) * itemsPorPagina
  const productosPag = filtradosOrdenados.slice(indiceInicio, indiceInicio + itemsPorPagina)

  useEffect(() => { setPaginaActual(1) }, [filtroStock, filtroCategoria, searchTerm, itemsPorPagina])
  useEffect(() => { try { localStorage.setItem('gestify_items_por_pagina', String(itemsPorPagina)) } catch {} }, [itemsPorPagina])
  useEffect(() => { setSeleccionados(new Set()) }, [filtroStock, filtroCategoria, searchTerm])

  const toggleModoSeleccion = () => { setModoSeleccion(v => !v); setSeleccionados(new Set()); setBulkCatOpen(false); setSelCatOpen(false) }
  const toggleSeleccion = (id) => setSeleccionados(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const todosSeleccionados = filtrados.length > 0 && filtrados.every(p => seleccionados.has(p.id))
  const algunoSeleccionado = seleccionados.size > 0
  const toggleTodos = () => setSeleccionados(prev => {
    const s = new Set(prev)
    if (todosSeleccionados) filtrados.forEach(p => s.delete(p.id))
    else filtrados.forEach(p => s.add(p.id))
    return s
  })
  const seleccionarPorCategoria = (nombreCat) => {
    const ids = productosSeguros.filter(p => (p.categoria || '').trim() === nombreCat).map(p => p.id)
    setSeleccionados(prev => { const s = new Set(prev); ids.forEach(id => s.add(id)); return s })
    setSelCatOpen(false)
  }
  const eliminarSeleccionados = () => {
    const ids = [...seleccionados]
    customConfirm(
      `Eliminar ${ids.length} producto${ids.length !== 1 ? 's' : ''}`,
      `¿Estás seguro? Se eliminarán ${ids.length} producto${ids.length !== 1 ? 's' : ''} permanentemente. Esta acción no se puede deshacer.`,
      async () => {
        await Promise.all(ids.map(id => eliminarProducto(id)))
        setSeleccionados(new Set())
        cerrarDialogo()
      }
    )
  }

  const asignarCategoriaSeleccionados = async (nombreCat) => {
    const ids = [...seleccionados]
    await Promise.all(ids.map(id => editarProducto && editarProducto(id, { categoria: nombreCat })))
    setBulkCatOpen(false)
    setSeleccionados(new Set())
    setModoSeleccion(false)
    recargarProductos?.()
  }

  // ── Toggle controla stock masivo ──
  const toggleControlaStockSeleccionados = async (activar) => {
    const ids = [...seleccionados]
    if (!editarProducto || ids.length === 0) return
    await Promise.all(ids.map(id => editarProducto(id, { controlastock: activar })))
    setSeleccionados(new Set())
    setModoSeleccion(false)
    recargarProductos?.()
  }

  const fMonto = v => (parseFloat(v) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const resumen = {
    total: filtrados.length,
    conStock: filtrados.filter(p => (p.controlastock || p.controlaStock) && (p.stock || 0) > 0).length,
    bajoStock: stockCfg.activo ? filtrados.filter(p => (p.controlastock || p.controlaStock) && (p.stock || 0) <= stockCfg.umbral).length : 0,
    sinControl: filtrados.filter(p => !(p.controlastock || p.controlaStock)).length,
  }

  const customConfirm = (title, message, onConfirm) => setDialogo({ open: true, title, message, onConfirm })
  const cerrarDialogo = () => setDialogo(p => ({ ...p, open: false }))

  /* ── CSV EXPORT ── */
  const exportarCSV = () => {
    const headers = ['Código', 'Nombre', 'Categoría', 'Precio', 'Costo', 'Stock', 'Stock Mínimo', 'Descripción', 'Controla Stock']
    const rows = productosSeguros.map(p => [
      p.codigo || '',
      (p.nombre || '').replace(/;/g, ','),
      (p.categoria || '').replace(/;/g, ','),
      p.precio || 0,
      p.costo != null ? p.costo : '',
      p.stock || 0,
      p.stock_minimo != null ? p.stock_minimo : '',
      (p.descripcion || '').replace(/;/g, ',').replace(/\r?\n/g, ' '),
      (p.controlastock || p.controlaStock) ? 'SI' : 'NO'
    ])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\r\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `productos_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── CSV PARSE ── */
  const parseLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ';' && !inQuotes) {
        result.push(current); current = ''
      } else {
        current += ch
      }
    }
    result.push(current)
    return result
  }

  const parsearCSV = (text) => {
    const content = text.startsWith('\uFEFF') ? text.slice(1) : text
    const lines = content.split(/\r?\n/).filter(l => l.trim())
    if (lines.length < 2) return []
    const headers = parseLine(lines[0]).map(h => h.trim())
    const col = (name) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase())
    const colContains = (substr) => headers.findIndex(h => h.toLowerCase().includes(substr.toLowerCase()))

    // Detect Tienda Nube format by checking for 'Identificador de URL' header
    const isTiendaNube = headers.some(h => h.toLowerCase().includes('identificador'))
    const prods = []

    if (isTiendaNube) {
      const iNombre = col('Nombre')
      const iSKU = col('SKU')
      const iCategoria = colContains('Categoría')
      const iPrecio = col('Precio')
      const iStock = col('Stock')
      const iDesc = colContains('Descripción')
      const iCosto = col('Costo')
      const iProp1Val = colContains('Valor de propiedad 1')
      const iPropNom = colContains('Nombre de propiedad 1')
      let lastNombre = ''

      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i])
        const nombre = iNombre >= 0 ? (cols[iNombre] || '').trim() : ''
        const prop1Val = iProp1Val >= 0 ? (cols[iProp1Val] || '').trim() : ''
        const prop1Nom = iPropNom >= 0 ? (cols[iPropNom] || '').trim() : ''
        if (nombre) lastNombre = nombre
        if (!lastNombre) continue
        // Fila sin nombre Y sin variante → saltar (fila vacía de continuación)
        if (!nombre && !prop1Val) continue
        let nombreFinal = nombre || lastNombre
        if (prop1Val) nombreFinal = `${nombre || lastNombre} - ${prop1Val}`

        const precioStr = iPrecio >= 0 ? (cols[iPrecio] || '').trim() : ''
        const stockStr = iStock >= 0 ? (cols[iStock] || '').trim() : ''
        const costoStr = iCosto >= 0 ? (cols[iCosto] || '').trim() : ''
        const cat = iCategoria >= 0 ? (cols[iCategoria] || '').trim() : ''
        const desc = iDesc >= 0 ? (cols[iDesc] || '').trim() : ''
        const sku = iSKU >= 0 ? (cols[iSKU] || '').trim() : ''
        const cleanNum = (s) => parseFloat(s.replace(/[^0-9,.-]/g, '').replace(/,/g, '')) || 0
        const precio = cleanNum(precioStr)
        const stock = parseInt(stockStr) || 0
        const costo = costoStr ? (cleanNum(costoStr) || null) : null
        const controlastock = stockStr !== ''

        prods.push({ nombre: nombreFinal, codigo: sku || null, categoria: cat, precio, stock, costo, controlastock, descripcion: desc })
      }
    } else {
      // Formato propio
      const iCodigo = colContains('Código')
      const iNombre = col('Nombre')
      const iCategoria = colContains('Categoría')
      const iPrecio = col('Precio')
      const iCosto = col('Costo')
      const iStock = col('Stock')
      const iStockMin = colContains('Stock Mínimo')
      const iDesc = colContains('Descripción')
      const iCS = colContains('Controla')

      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i])
        const nombre = iNombre >= 0 ? (cols[iNombre] || '').trim() : ''
        if (!nombre) continue
        const cleanNum = (s) => parseFloat((s || '').replace(/[^0-9,.-]/g, '').replace(',', '.')) || 0
        const precio = cleanNum(cols[iPrecio])
        const stock = parseInt(cols[iStock]) || 0
        const costo = cols[iCosto] ? (cleanNum(cols[iCosto]) || null) : null
        const stockMin = iStockMin >= 0 && cols[iStockMin] ? (parseInt(cols[iStockMin]) || null) : null
        const cs = iCS >= 0 ? (cols[iCS] || '').trim().toUpperCase() === 'SI' : false

        const prodObj = {
          nombre,
          codigo: iCodigo >= 0 ? (cols[iCodigo] || '').trim() || null : null,
          categoria: iCategoria >= 0 ? (cols[iCategoria] || '').trim() : '',
          precio,
          stock,
          costo,
          controlastock: cs,
          descripcion: iDesc >= 0 ? (cols[iDesc] || '').trim() : '',
        }
        if (stockMin !== null) prodObj.stock_minimo = stockMin
        prods.push(prodObj)
      }
    }
    return prods
  }

  /* ── CSV IMPORT ── */
  const importarCSV = async (file) => {
    if (!file || !user) return
    setCsvLoading(true)
    setCsvResultado(null)
    try {
      const text = await file.text()
      const prods = parsearCSV(text)
      if (prods.length === 0) {
        setCsvResultado({ tipo: 'error', msg: 'No se encontraron productos válidos en el archivo.' })
        return
      }
      // Auto-assign codes to products without one
      const existingCodes = new Set(productosSeguros.map(p => p.codigo).filter(Boolean))
      let codeIdx = productosSeguros.length + 1
      const genCode = () => {
        let c
        do { c = 'PROD-' + String(codeIdx++).padStart(4, '0') } while (existingCodes.has(c))
        existingCodes.add(c)
        return c
      }
      const payload = prods.map(p => ({ ...p, codigo: p.codigo || genCode(), user_id: user.id, created_at: new Date().toISOString() }))
      // Insert in batches of 50 to avoid request size limits
      let insertados = 0
      for (let i = 0; i < payload.length; i += 50) {
        const batch = payload.slice(i, i + 50)
        const { data, error } = await supabase.from('productos').insert(batch).select()
        if (error) throw error
        insertados += data.length
      }
      setCsvResultado({ tipo: 'ok', msg: `Se importaron ${insertados} producto${insertados !== 1 ? 's' : ''} correctamente.` })
      recargarProductos?.()
    } catch (err) {
      setCsvResultado({ tipo: 'error', msg: err.message })
    } finally {
      setCsvLoading(false)
      if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  const handleEliminar = (id) => customConfirm('Eliminar Producto', '¿Estás seguro? Esta acción no se puede deshacer.', async () => { eliminarProducto && eliminarProducto(id); cerrarDialogo() })

  // Abrir form de nuevo producto con categoría prellenada
  const handleNuevoProductoConCategoria = (categoria) => {
    openModal && openModal('nuevo-producto', { categoria })
    setModalCats(false)
  }

  /* ── Descargar Lista de Precios PDF ──────────────── */
  const descargarListaPrecios = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const empresa = localStorage.getItem('gestify_empresa') || ''
    const cuitPdf = localStorage.getItem('gestify_cuit') || ''
    const direccionPdf = localStorage.getItem('gestify_direccion') || ''

    // Header fondo oscuro
    doc.setFillColor(40, 42, 40)
    doc.rect(0, 0, W, 38, 'F')

    // Nombre empresa (si lo hay)
    if (empresa) {
      doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(255, 255, 255)
      doc.text(empresa, 14, 13)
      let subY = 19
      if (cuitPdf) { doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(160, 160, 160); doc.text(`CUIT: ${cuitPdf}`, 14, subY); subY += 5 }
      if (direccionPdf) { doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(160, 160, 160); doc.text(direccionPdf, 14, subY) }
    }

    // Título
    doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor(220, 237, 49)
    doc.text('LISTA DE PRECIOS', W - 14, 16, { align: 'right' })

    doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor(180, 180, 180)
    doc.text(`Emitida: ${hoy}`, W - 14, 22, { align: 'right' })
    doc.text(`${productosSeguros.length} producto${productosSeguros.length !== 1 ? 's' : ''}`, W - 14, 27, { align: 'right' })

    // Agrupar por categoría
    const grupos = {}
    productosSeguros
      .slice()
      .sort((a, b) => (a.categoria || 'Sin categoría').localeCompare(b.categoria || 'Sin categoría') || (a.nombre || '').localeCompare(b.nombre || ''))
      .forEach(p => {
        const cat = (p.categoria || '').trim() || 'Sin categoría'
        if (!grupos[cat]) grupos[cat] = []
        grupos[cat].push(p)
      })

    let startY = 44

    Object.entries(grupos).forEach(([cat, prods], gi) => {
      // Encabezado de grupo
      doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(51, 65, 57)
      doc.text(cat.toUpperCase(), 14, startY)
      doc.setDrawColor(51, 65, 57)
      doc.setLineWidth(0.3)
      doc.line(14, startY + 1.5, W - 14, startY + 1.5)
      startY += 4

      const rows = prods.map((p, i) => [
        String(i + 1),
        p.codigo || '—',
        p.nombre || '—',
        `$${fMonto(p.precio)}`,
        p.controlastock ? String(p.stock ?? 0) : '∞',
      ])

      autoTable(doc, {
        startY,
        head: [['#', 'Código', 'Producto', 'Precio', 'Stock']],
        body: rows,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, font: 'helvetica', textColor: [48, 54, 47] },
        headStyles: { fillColor: [239, 239, 237], textColor: [139, 137, 130], fontSize: 8, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 249, 247] },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 28 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
          4: { cellWidth: 20, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
      })

      startY = doc.lastAutoTable.finalY + 8
    })

    // Footer
    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(7).setFont('helvetica', 'normal').setTextColor(180, 180, 180)
      doc.text(`Generado con Gestify • Página ${i}/${pages}`, W / 2, 292, { align: 'center' })
    }

    doc.save(`Lista-de-precios-${hoy.replace(/\//g, '-')}.pdf`)
  }

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
          <button 
            onClick={onOpenMobileSidebar} 
            id="prod-hamburger"
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" 
            style={{ 
              background: 'rgba(255,255,255,.06)', 
              border: '1px solid rgba(255,255,255,.12)', 
              color: 'rgba(255,255,255,.7)',
              display: 'none'
            }}
          >
            <Menu size={16} strokeWidth={2} />
          </button>
          <style>{`
            #prod-hamburger { display: none !important; }
            @media (max-width: 1023px) { 
              #prod-hamburger { display: flex !important; } 
            }
          `}</style>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Productos</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={toggleModoSeleccion} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: modoSeleccion ? '1px solid #4ADE80' : '1px solid rgba(255,255,255,.18)', background: modoSeleccion ? 'rgba(74,222,128,.12)' : 'transparent', color: modoSeleccion ? '#4ADE80' : 'rgba(255,255,255,.7)', cursor: 'pointer', transition: 'all .13s' }}>
            <CheckSquare size={12} strokeWidth={2} /> {modoSeleccion ? 'Cancelar' : 'Selección'}
          </button>

          <button onClick={() => setModalCats(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,.18)', background: 'transparent', color: 'rgba(255,255,255,.7)', cursor: 'pointer', transition: 'all .13s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.07)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Tag size={12} strokeWidth={2} /> Categorías
          </button>

          <button onClick={descargarListaPrecios}
            title="Descargar lista de precios en PDF"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,.18)', background: 'transparent', color: 'rgba(255,255,255,.7)', cursor: 'pointer', transition: 'all .13s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = '#4ADE80' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.7)' }}>
            <Download size={12} strokeWidth={2} />
            <span className="hidden sm:inline">Lista de precios</span>
          </button>

          <button onClick={() => openModal && openModal("nuevo-producto")} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid #4ADE80', cursor: 'pointer', transition: 'all .13s', background: '#4ADE80', color: '#0A1A0E' }}>
            <Plus size={12} strokeWidth={2.5} /> Nuevo <span className="hidden sm:inline">Producto</span>
            <span className="hidden sm:inline-block" style={{ marginLeft: 4, padding: '2px 5px', background: 'rgba(0,0,0,.1)', borderRadius: 4, fontSize: 9, fontFamily: "'DM Mono', monospace" }}>Ctrl</span>
          </button>
        </div>
      </header>

      {/* ══ CARDS RESUMEN ══ */}
      <div style={{ padding: 'clamp(12px, 2vw, 18px) clamp(12px, 3vw, 24px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Productos', val: resumen.total, icon: Package, clr: '#373F47', sub: filtroCategoria !== 'todas' ? filtroCategoria : 'En catálogo' },
          { label: 'Con Stock', val: resumen.conStock, icon: CheckCircle, clr: '#065F46', sub: `${resumen.total > 0 ? Math.round(resumen.conStock / resumen.total * 100) : 0}% disponibles` },
          { label: 'Bajo Stock', val: resumen.bajoStock, icon: AlertTriangle, clr: '#92400E', sub: stockCfg.activo ? `stock ≤ ${stockCfg.umbral} unidades` : 'alertas desactivadas' },
          { label: 'Sin Control', val: resumen.sinControl, icon: Archive, clr: '#6B7280', sub: 'Stock ilimitado' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, background: '#E1E1E0', borderRadius: 12, height: 90, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', cursor: 'default', transition: 'box-shadow .2s,transform .2s', animation: `kpiIn .35s ${.05 + i * .07}s ease both` }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(48,54,47,.11),0 14px 36px rgba(48,54,47,.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = cardStyle.boxShadow }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${s.clr}15, transparent 70%)` }} />
            <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: s.clr, borderRadius: '0 2px 2px 0' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: ct3, textTransform: 'uppercase', letterSpacing: '.03em', display: 'block', marginBottom: 2 }}>{s.label}</span>
                <span style={{ fontSize: 22, fontWeight: 600, color: ct1, letterSpacing: '-.04em', lineHeight: 1, display: 'block', marginBottom: 6 }}>{s.val}</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: '#63655f', display: 'block' }}>{s.sub}</span>
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
              <option value="bajo-stock">Bajo stock</option>
            </select>

            {/* filtro categoria */}
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={pillSelect}>
              <option value="todas">Todas las categorías</option>
              {categorias.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(cat => (
                <option key={cat.nombre} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={exportarCSV}
                title="Exportar productos a CSV"
                style={{ ...pillSelect, display: 'flex', alignItems: 'center', gap: 5, paddingRight: 10 }}>
                <Download size={11} /> CSV
              </button>
              <button
                onClick={() => csvInputRef.current?.click()}
                disabled={csvLoading}
                title="Importar productos desde CSV (Tienda Nube o propio)"
                style={{ ...pillSelect, display: 'flex', alignItems: 'center', gap: 5, paddingRight: 10, opacity: csvLoading ? .6 : 1 }}>
                <Upload size={11} /> {csvLoading ? 'Importando…' : 'CSV'}
              </button>
              <input ref={csvInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) importarCSV(e.target.files[0]) }} />
            </div>

            <span style={{ fontSize: 11, color: ct3, fontWeight: 500, marginLeft: 'auto' }}>{filtrados.length} productos</span>
          </div>

          {/* csv result banner */}
          {csvResultado && (
            <div style={{ margin: '0 clamp(12px,3vw,24px)', marginTop: 8, padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: csvResultado.tipo === 'ok' ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${csvResultado.tipo === 'ok' ? '#A7F3D0' : '#FECACA'}`, color: csvResultado.tipo === 'ok' ? '#065F46' : '#991B1B' }}>
              {csvResultado.tipo === 'ok' ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
              {csvResultado.msg}
              <button onClick={() => setCsvResultado(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 2 }}><X size={13} /></button>
            </div>
          )}

          {/* barra selección múltiple */}
          {modoSeleccion && (
            <div style={{ margin: '0 clamp(12px,3vw,24px)', marginTop: 8, padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, background: algunoSeleccionado ? '#FFF7ED' : 'rgba(51,65,57,.06)', border: `1px solid ${algunoSeleccionado ? '#FED7AA' : 'rgba(51,65,57,.18)'}`, flexWrap: 'wrap', transition: 'all .15s' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: algunoSeleccionado ? '#92400E' : ct2 }}>
                {algunoSeleccionado ? `${seleccionados.size} seleccionado${seleccionados.size !== 1 ? 's' : ''}` : 'Modo selección activo'}
              </span>
              {algunoSeleccionado && (
                <button onClick={toggleTodos} style={{ fontSize: 11, fontWeight: 600, color: '#92400E', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                  {todosSeleccionados ? 'Deseleccionar todos' : `Seleccionar todos (${filtrados.length})`}
                </button>
              )}
              {/* Seleccionar por categoría */}
              <div style={{ position: 'relative' }}>
                <button
                  ref={selCatBtnRef}
                  onClick={() => {
                    if (!selCatOpen && selCatBtnRef.current) {
                      const r = selCatBtnRef.current.getBoundingClientRect()
                      setSelCatPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 244) })
                    }
                    setSelCatOpen(v => !v)
                  }}
                  style={{ fontSize: 11, fontWeight: 600, color: accent, background: 'none', border: `1px solid rgba(51,65,57,.25)`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Tag size={11} /> Por categoría
                </button>
                {selCatOpen && (
                  <>
                    <div onClick={() => setSelCatOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
                    <div style={{ position: 'fixed', top: selCatPos.top, left: selCatPos.left, zIndex: 9999, background: '#fff', borderRadius: 12, border: `1px solid ${border}`, boxShadow: '0 8px 32px rgba(0,0,0,.18)', width: 236, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, background: 'rgba(51,65,57,.04)' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Seleccionar todos de categoría</p>
                      </div>
                      <div style={{ maxHeight: 220, overflowY: 'auto', padding: '6px' }}>
                        {categorias.length > 0 ? categorias.map(cat => {
                          const cnt = productosSeguros.filter(p => (p.categoria || '').trim() === cat.nombre).length
                          return (
                            <button key={cat.nombre} onClick={() => seleccionarPorCategoria(cat.nombre)}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: ct1, textAlign: 'left', fontFamily: "'Inter', sans-serif", justifyContent: 'space-between' }}
                              onMouseEnter={e => e.currentTarget.style.background = accentL}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 26, height: 26, borderRadius: 7, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Tag size={12} style={{ color: accent }} />
                                </div>
                                {cat.nombre}
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 600, color: ct3, background: 'rgba(0,0,0,.05)', borderRadius: 10, padding: '2px 7px' }}>{cnt}</span>
                            </button>
                          )
                        }) : (
                          <div style={{ padding: '14px 12px', fontSize: 12, color: ct3, textAlign: 'center' }}>No hay categorías creadas aún</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {algunoSeleccionado && (
                <button onClick={() => setSeleccionados(new Set())} style={{ fontSize: 11, fontWeight: 600, color: ct3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Limpiar</button>
              )}
              {algunoSeleccionado && <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Asignar categoría */}
                <div style={{ position: 'relative' }}>
                  <button
                    ref={bulkCatBtnRef}
                    onClick={() => {
                      if (!bulkCatOpen && bulkCatBtnRef.current) {
                        const r = bulkCatBtnRef.current.getBoundingClientRect()
                        setBulkCatPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - 244) })
                      }
                      setBulkCatOpen(v => !v)
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, color: accent, background: 'rgba(51,65,57,.1)', border: `1px solid rgba(51,65,57,.2)`, cursor: 'pointer' }}>
                    <Tag size={12} /> Asignar categoría
                  </button>
                  {bulkCatOpen && (
                    <>
                      {/* backdrop para cerrar al hacer click afuera */}
                      <div onClick={() => setBulkCatOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
                      <div style={{ position: 'fixed', top: bulkCatPos.top, left: bulkCatPos.left, zIndex: 9999, background: '#fff', borderRadius: 12, border: `1px solid ${border}`, boxShadow: '0 8px 32px rgba(0,0,0,.18)', width: 236, overflow: 'hidden' }}>
                        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, background: 'rgba(51,65,57,.04)' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: ct3, textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>
                            Asignar categoría · {seleccionados.size} producto{seleccionados.size !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div style={{ maxHeight: 220, overflowY: 'auto', padding: '6px' }}>
                          {categorias.length > 0 ? categorias.map(cat => (
                            <button key={cat.nombre} onClick={() => asignarCategoriaSeleccionados(cat.nombre)}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: ct1, textAlign: 'left', fontFamily: "'Inter', sans-serif" }}
                              onMouseEnter={e => e.currentTarget.style.background = accentL}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <div style={{ width: 26, height: 26, borderRadius: 7, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Tag size={12} style={{ color: accent }} />
                              </div>
                              {cat.nombre}
                            </button>
                          )) : (
                            <div style={{ padding: '14px 12px', fontSize: 12, color: ct3, textAlign: 'center' }}>
                              No hay categorías creadas aún
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '6px', borderTop: `1px solid ${border}`, background: 'rgba(0,0,0,.02)' }}>
                          <button onClick={() => asignarCategoriaSeleccionados('')}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#DC2626', textAlign: 'left', fontFamily: "'Inter', sans-serif" }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            <X size={12} style={{ flexShrink: 0 }} /> Quitar categoría
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Toggle controla stock */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 8, background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.1)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', paddingRight: 4 }}>Stock</span>
                  <button
                    onClick={() => { customConfirm(`Activar control de stock`, `¿Activar control de stock en ${seleccionados.size} producto${seleccionados.size !== 1 ? 's' : ''}? El stock empezará a descontarse en ventas.`, () => { toggleControlaStockSeleccionados(true); cerrarDialogo() }) }}
                    title="Activar control de stock"
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: accent, background: 'rgba(51,65,57,.12)', border: `1px solid rgba(51,65,57,.3)`, cursor: 'pointer' }}>
                    Sí
                  </button>
                  <button
                    onClick={() => { customConfirm(`Desactivar control de stock`, `¿Desactivar control de stock en ${seleccionados.size} producto${seleccionados.size !== 1 ? 's' : ''}? El stock dejará de descontarse y no tendrá límite.`, () => { toggleControlaStockSeleccionados(false); cerrarDialogo() }) }}
                    title="Desactivar control de stock"
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#6B7280', background: 'rgba(107,114,128,.08)', border: '1px solid rgba(107,114,128,.2)', cursor: 'pointer' }}>
                    No
                  </button>
                </div>
                <button onClick={eliminarSeleccionados} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700, color: '#fff', background: '#DC2626', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={12} /> Eliminar {seleccionados.size}
                </button>
              </div>}
            </div>
          )}

          {/* tabla scroll */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: surface, zIndex: 10, borderBottom: `1px solid ${border}` }}>
                <tr>
                  {modoSeleccion && (
                    <th style={{ padding: '10px 0 10px 16px', width: 36 }}>
                      <input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos}
                        title={todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        style={{ width: 15, height: 15, cursor: 'pointer', accentColor: accent }} />
                    </th>
                  )}
                  {[
                    { label: 'CÓDIGO', campo: 'codigo' },
                    { label: 'NOMBRE Y CATEGORÍA', campo: 'nombre' },
                    { label: 'PRECIO', campo: 'precio' },
                    { label: 'COSTO', campo: 'costo' },
                    { label: 'STOCK', campo: 'stock' },
                    { label: 'CONTROL', campo: null },
                    { label: 'ACCIONES', campo: null },
                  ].map(({ label, campo }, i) => {
                    const activo = orden.campo === campo
                    const colColor = label === 'COSTO' ? '#059669' : activo ? accent : ct3
                    return (
                      <th key={i}
                        onClick={campo ? () => toggleOrden(campo) : undefined}
                        style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, color: colColor, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: i >= 2 ? 'right' : 'left', whiteSpace: 'nowrap', cursor: campo ? 'pointer' : 'default', userSelect: 'none' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'transparent' }}>
                          {label}
                          {campo && (
                            <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, opacity: activo ? 1 : 0.35, background: 'transparent' }}>
                              <span style={{ display: 'block', width: 0, height: 0, background: 'transparent', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: `3.5px solid ${colColor}`, opacity: activo && orden.dir === 'asc' ? 1 : activo ? 0.35 : 0.6 }} />
                              <span style={{ display: 'block', width: 0, height: 0, background: 'transparent', borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderTop: `3.5px solid ${colColor}`, opacity: activo && orden.dir === 'desc' ? 1 : activo ? 0.35 : 0.6 }} />
                            </span>
                          )}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {productosPag.length > 0 ? productosPag.map(prod => {
                  const precioNeto = (parseFloat(prod.precio) || 0) * 0.79
                  const csOk = !!(prod.controlastock || prod.controlaStock)
                  const stockLow = stockCfg.activo && csOk && (prod.stock || 0) <= stockCfg.umbral

                  const estaSeleccionado = seleccionados.has(prod.id)
                  return (
                    <tr key={prod.id} style={{ borderBottom: `1px solid ${border}`, transition: 'background .13s', cursor: modoSeleccion ? 'pointer' : 'default', background: modoSeleccion && estaSeleccionado ? 'rgba(51,65,57,.06)' : 'transparent' }}
                      onClick={modoSeleccion ? () => toggleSeleccion(prod.id) : undefined}
                      onMouseEnter={e => { if (!(modoSeleccion && estaSeleccionado)) e.currentTarget.style.background = 'rgba(51,65,57,.02)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = modoSeleccion && estaSeleccionado ? 'rgba(51,65,57,.06)' : 'transparent' }}>

                      {/* checkbox */}
                      {modoSeleccion && (
                        <td style={{ padding: '12px 0 12px 16px', verticalAlign: 'middle', width: 36 }} onClick={e => { e.stopPropagation(); toggleSeleccion(prod.id) }}>
                          <input type="checkbox" checked={estaSeleccionado} onChange={() => toggleSeleccion(prod.id)}
                            style={{ width: 15, height: 15, cursor: 'pointer', accentColor: accent }} />
                        </td>
                      )}

                      {/* código */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: accentL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package size={13} strokeWidth={2.5} style={{ color: accent }} />
                          </div>
                          <span style={{ fontSize: 12, fontFamily: "'Inter', -apple-system, sans-serif", color: ct2, fontWeight: 600, letterSpacing: '.01em', background: 'rgba(51,65,57,.06)', padding: '2px 7px', borderRadius: 5 }}>{prod.codigo || '—'}</span>
                        </div>
                      </td>

                      {/* nombre & categoria */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: ct1, marginBottom: 3 }}>{prod.nombre || '—'}</div>
                        <span style={{ padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(55,63,71,.07)', color: '#373F47', border: '1px solid rgba(55,63,71,.1)' }}>
                          {prod.categoria || 'General'}
                        </span>
                      </td>

                      {/* precio — editable inline */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        {inlineEdit.prodId === prod.id && inlineEdit.field === 'precio' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 12, color: ct3 }}>$</span>
                            <input
                              type="number" value={inlineEdit.val} min="0" step="0.01" autoFocus
                              onChange={e => setInlineEdit(p => ({ ...p, val: e.target.value }))}
                              onBlur={() => commitEdit(prod)}
                              onKeyDown={e => { if (e.key === 'Enter') commitEdit(prod); if (e.key === 'Escape') cancelEdit() }}
                              style={{ width: 90, height: 28, padding: '0 8px', fontSize: 12, fontWeight: 700, color: ct1, background: '#fff', border: `1.5px solid ${accent}`, borderRadius: 7, outline: 'none', textAlign: 'right', fontFamily: "'Inter', sans-serif" }}
                            />
                          </div>
                        ) : (
                          <button onClick={() => startEdit(prod.id, 'precio', prod.precio)}
                            title="Click para editar"
                            style={{ background: 'none', border: 'none', cursor: 'text', padding: '4px 6px', borderRadius: 6, transition: 'background .12s', textAlign: 'right', display: 'block', marginLeft: 'auto' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,57,.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>${fMonto(prod.precio)}</div>
                          </button>
                        )}
                      </td>

                      {/* costo — editable inline */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        {inlineEdit.prodId === prod.id && inlineEdit.field === 'costo' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 12, color: '#059669' }}>$</span>
                            <input
                              type="number" value={inlineEdit.val} min="0" step="0.01" autoFocus
                              onChange={e => setInlineEdit(p => ({ ...p, val: e.target.value }))}
                              onBlur={() => commitEdit(prod)}
                              onKeyDown={e => { if (e.key === 'Enter') commitEdit(prod); if (e.key === 'Escape') cancelEdit() }}
                              style={{ width: 90, height: 28, padding: '0 8px', fontSize: 12, fontWeight: 700, color: '#059669', background: '#f0fdf4', border: '1.5px solid #059669', borderRadius: 7, outline: 'none', textAlign: 'right', fontFamily: "'Inter', sans-serif" }}
                            />
                          </div>
                        ) : (
                          <button onClick={() => startEdit(prod.id, 'costo', prod.costo || 0)}
                            title="Click para editar costo"
                            style={{ background: 'none', border: 'none', cursor: 'text', padding: '4px 6px', borderRadius: 6, transition: 'background .12s', textAlign: 'right', display: 'block', marginLeft: 'auto' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(5,150,105,.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            {parseFloat(prod.costo) > 0 ? (
                              <>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>${fMonto(prod.costo)}</div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#047857', marginTop: 1 }}>
                                  {Math.round((1 - parseFloat(prod.costo) / parseFloat(prod.precio)) * 100)}% margen
                                </div>
                              </>
                            ) : (
                              <span style={{ fontSize: 11, color: 'rgba(0,0,0,.18)', fontStyle: 'italic' }}>— agregar</span>
                            )}
                          </button>
                        )}
                      </td>

                      {/* stock — editable inline */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        {inlineEdit.prodId === prod.id && inlineEdit.field === 'stock' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                            <input
                              type="number" value={inlineEdit.val} min="0" step="1" autoFocus
                              onChange={e => setInlineEdit(p => ({ ...p, val: e.target.value }))}
                              onBlur={() => commitEdit(prod)}
                              onKeyDown={e => { if (e.key === 'Enter') commitEdit(prod); if (e.key === 'Escape') cancelEdit() }}
                              style={{ width: 70, height: 28, padding: '0 8px', fontSize: 12, fontWeight: 700, color: stockLow ? '#991B1B' : '#065F46', background: stockLow ? '#FEF2F2' : '#F0FDF4', border: `1.5px solid ${stockLow ? '#EF4444' : '#059669'}`, borderRadius: 7, outline: 'none', textAlign: 'right', fontFamily: "'Inter', sans-serif" }}
                            />
                          </div>
                        ) : (
                          <button onClick={() => { if (csOk) startEdit(prod.id, 'stock', prod.stock || 0) }}
                            title={csOk ? "Click para editar stock" : "El control de stock está desactivado"}
                            style={{ background: 'none', border: 'none', cursor: csOk ? 'text' : 'default', padding: '4px 6px', borderRadius: 6, transition: 'background .12s', textAlign: 'right', display: 'block', marginLeft: 'auto', opacity: csOk ? 1 : 0.5 }}
                            onMouseEnter={e => { if (csOk) e.currentTarget.style.background = stockLow ? 'rgba(153,27,27,.06)' : 'rgba(5,150,105,.06)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
                            {csOk ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: stockLow ? '#FEF2F2' : '#F0FDF4', color: stockLow ? '#991B1B' : '#065F46', border: `1px solid ${stockLow ? '#FCA5A5' : '#6EE7B7'}` }}>
                                {stockLow && <AlertTriangle size={11} strokeWidth={2.5} />}
                                {prod.stock || 0} u.
                              </div>
                            ) : <span style={{ color: ct3, fontSize: 12 }}>—</span>}
                          </button>
                        )}
                      </td>

                      {/* control */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: csOk ? '#F0FDF4' : surface, color: csOk ? '#065F46' : ct3, border: `1px solid ${csOk ? '#6EE7B7' : border}` }}>
                          {csOk ? 'Sí' : 'No'}
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
                    <td colSpan={8}>
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
                <option value="100">100 / pág</option>
                <option value="99999">Todos</option>
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
        onAgregarCategoria={handleAgregarCategoria}
        onNuevoProductoConCategoria={handleNuevoProductoConCategoria}
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