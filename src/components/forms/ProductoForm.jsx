'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Package, Tag, Info, DollarSign, Layers, Hash, BarChart2 } from 'lucide-react'

/* ══════════════════════════════════════════════
   PALETA — consistente con ClienteForm / sistema
══════════════════════════════════════════════ */
const ct1    = '#1e2320'
const ct2    = '#30362F'
const ct3    = '#8B8982'
const accent = '#334139'
const border = 'rgba(48,54,47,.13)'

const inputBase = {
  width: '100%', height: 36, padding: '0 12px',
  fontSize: 12, color: ct1, background: '#fff',
  border: `1px solid ${border}`, borderRadius: 8,
  outline: 'none', fontFamily: "'Inter', sans-serif",
  transition: 'border-color .15s, box-shadow .15s',
  boxSizing: 'border-box',
}

const labelBase = {
  fontSize: 11, fontWeight: 600, color: ct2,
  marginBottom: 5, display: 'block', letterSpacing: '.01em',
}

const focusStyle  = (e) => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,57,.08)' }
const blurStyle   = (e) => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }

const Icon = ({ ico: Ico, style = {} }) => (
  <Ico size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3, ...style }} />
)

const ProductoForm = ({ type, selectedItem, formData, formActions, closeModal, categorias = [] }) => {
  const { nuevoProducto, setNuevoProducto, productoRapido, setProductoRapido } = formData
  const { agregarProducto, editarProducto, agregarProductoRapido } = formActions

  const isEdit   = type === 'editar-producto'
  const isRapido = type === 'producto-rapido'

  const nombreRef  = useRef(null)
  const codigoRef  = useRef(null)
  const precioRef  = useRef(null)
  const costoRef   = useRef(null)
  const stockRef   = useRef(null)
  const submittingRef = useRef(false)

  const [error, setError]           = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const data    = isRapido ? productoRapido : nuevoProducto
  const setData = isRapido
    ? (fn) => setProductoRapido(typeof fn === 'function' ? fn(productoRapido) : fn)
    : (fn) => setNuevoProducto(typeof fn === 'function' ? fn(nuevoProducto) : fn)

  const csActivo = !!(data.controlaStock || data.controlastock)

  const set = (campo, valor) => { setError(''); setData(prev => ({ ...prev, [campo]: valor })) }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (submittingRef.current) return
    if (!data.nombre?.trim()) { setError('El nombre del producto es requerido'); nombreRef.current?.focus(); return }
    const precioNum = parseFloat(String(data.precio).replace(',', '.'))
    if (!precioNum || precioNum <= 0) { setError('El precio debe ser mayor a 0'); precioRef.current?.focus(); return }

    submittingRef.current = true
    setIsSubmitting(true)
    setError('')
    try {
      let result
      if (isRapido)  result = await agregarProductoRapido()
      else if (isEdit) result = await editarProducto(selectedItem?.id, data)
      else             result = await agregarProducto()

      if (result?.success) {
        const cb = formData.selectedItem?.onSuccess || formData.onSuccess
        if (cb) cb(result.producto || result.data || result)
        else closeModal()
      } else {
        setError(result?.mensaje || 'Error al guardar. Revisá los datos.')
      }
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const h = (e) => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleSubmit() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [data])

  useEffect(() => {
    if (isEdit && selectedItem?.id) {
      const cs = !!(selectedItem.controlaStock || selectedItem.controlastock)
      setNuevoProducto({
        nombre: selectedItem.nombre || '',
        codigo: selectedItem.codigo || '',
        precio: selectedItem.precio ?? 0,
        costo: selectedItem.costo ?? '',
        stock: selectedItem.stock ?? 0,
        categoria: selectedItem.categoria || '',
        descripcion: selectedItem.descripcion || '',
        controlaStock: cs,
      })
    }
  }, [selectedItem?.id])

  useEffect(() => {
    const t = setTimeout(() => nombreRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  const precioNum = parseFloat(data.precio) || 0
  const costoNum  = parseFloat(data.costo)  || 0
  const margen    = precioNum > 0 && costoNum > 0 ? ((precioNum - costoNum) / precioNum * 100) : null
  const ganancia  = precioNum > 0 && costoNum > 0 ? (precioNum - costoNum) : null

  const title = isRapido ? 'Producto rápido' : isEdit ? 'Editar producto' : 'Nuevo producto'

  const catsUnicas = useMemo(() => {
    const raw = categorias.map(c => typeof c === 'object' ? (c.nombre || c.label) : c).filter(Boolean)
    return [...new Set(raw)].sort()
  }, [categorias])

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') { e.preventDefault(); nextRef?.current ? nextRef.current.focus() : handleSubmit() }
  }

  return (
    <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

      {/* Chip tipo */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', background: 'rgba(51,65,57,.1)', color: accent, border: '1px solid rgba(51,65,57,.2)' }}>
          {title}
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Nombre */}
        <div>
          <label style={labelBase}>Nombre del producto <span style={{ color: '#DC2626' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <Icon ico={Tag} />
            <input ref={nombreRef} type="text" value={data.nombre || ''} placeholder="Ej: Remera negra talle M"
              onChange={e => set('nombre', e.target.value)}
              onKeyDown={e => handleKeyDown(e, codigoRef)}
              onFocus={focusStyle} onBlur={blurStyle}
              style={{ ...inputBase, paddingLeft: 30 }} />
          </div>
        </div>

        {/* Categoría + Código */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <div>
            <label style={labelBase}>Categoría <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span></label>
            <div style={{ position: 'relative' }}>
              <Icon ico={Layers} />
              <select
                value={data.categoria || ''}
                onChange={e => set('categoria', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                style={{ ...inputBase, paddingLeft: 30, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Sin categoría</option>
                {catsUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelBase}>SKU / Código <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span></label>
            <div style={{ position: 'relative' }}>
              <Icon ico={Hash} />
              <input ref={codigoRef} type="text" value={data.codigo || ''} placeholder="PROD-0001"
                onChange={e => set('codigo', e.target.value)}
                onKeyDown={e => handleKeyDown(e, precioRef)}
                onFocus={focusStyle} onBlur={blurStyle}
                style={{ ...inputBase, paddingLeft: 30 }} />
            </div>
          </div>
        </div>

        {/* Precio + Costo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelBase}>Precio de venta <span style={{ color: '#DC2626' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Icon ico={DollarSign} />
              <input ref={precioRef} type="number" step="0.01" min="0" value={data.precio || ''} placeholder="0.00"
                onChange={e => set('precio', e.target.value)}
                onKeyDown={e => handleKeyDown(e, costoRef)}
                onFocus={focusStyle} onBlur={blurStyle}
                style={{ ...inputBase, paddingLeft: 30 }} />
            </div>
          </div>
          <div>
            <label style={labelBase}>
              Costo <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Icon ico={DollarSign} />
              <input ref={costoRef} type="number" step="0.01" min="0" value={data.costo || ''} placeholder="0.00"
                onChange={e => set('costo', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                style={{ ...inputBase, paddingLeft: 30 }} />
            </div>
          </div>
        </div>

        {/* Preview de margen */}
        {margen !== null && (
          <div style={{ borderRadius: 10, padding: '10px 14px', background: margen >= 30 ? 'rgba(16,185,129,.06)' : margen >= 10 ? 'rgba(245,158,11,.06)' : 'rgba(239,68,68,.06)', border: `1px solid ${margen >= 30 ? 'rgba(16,185,129,.2)' : margen >= 10 ? 'rgba(245,158,11,.2)' : 'rgba(239,68,68,.2)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart2 size={14} style={{ color: margen >= 30 ? '#10b981' : margen >= 10 ? '#f59e0b' : '#ef4444', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: margen >= 30 ? '#065f46' : margen >= 10 ? '#92400e' : '#991b1b' }}>
                  Margen {margen.toFixed(1)}% · Ganancia ${ganancia.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </div>
                <div style={{ fontSize: 10, color: ct3, marginTop: 1 }}>
                  {margen >= 30 ? 'Margen saludable ✓' : margen >= 10 ? 'Margen bajo — revisá el precio' : 'Margen muy bajo — producto sin rentabilidad'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control de stock */}
        {!isRapido && (
          <div style={{ borderRadius: 10, padding: '10px 14px', background: 'rgba(51,65,57,.04)', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                onClick={() => set('controlaStock', !csActivo)}
                style={{ width: 38, height: 22, borderRadius: 11, background: csActivo ? accent : '#d1d5db', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}
              >
                <div style={{ position: 'absolute', top: 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s', left: csActivo ? 19 : 3 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>Control de stock</div>
                <div style={{ fontSize: 10, color: ct3, marginTop: 1 }}>Llevar registro de existencias</div>
              </div>
            </div>
            {csActivo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ ...labelBase, marginBottom: 0, whiteSpace: 'nowrap' }}>Stock inicial</label>
                <input ref={stockRef} type="number" min="0" value={data.stock || 0}
                  onChange={e => set('stock', e.target.value)}
                  onFocus={focusStyle} onBlur={blurStyle}
                  style={{ ...inputBase, width: 70, textAlign: 'center', padding: '0 8px' }} />
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '7px 10px', borderRadius: 7, background: '#FEF2F2', border: '1px solid #fecaca', fontSize: 12, color: '#DC2626', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={closeModal}
            style={{ flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600, color: ct2, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all .13s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}
            style={{ flex: 2, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', background: '#334139', border: '1px solid #334139', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Inter', sans-serif", transition: 'all .13s' }}
            onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#2b352f' }}
            onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = '#334139' }}>
            {isSubmitting ? 'Guardando...' : isEdit
              ? <><Package size={13} strokeWidth={2.5} /> Guardar cambios</>
              : <><Package size={13} strokeWidth={2.5} /> {isRapido ? 'Agregar rápido' : 'Crear producto'}</>}
            {!isSubmitting && <kbd style={{ fontSize: 9, padding: '1.5px 5px', background: 'rgba(255,255,255,.15)', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>↵</kbd>}
          </button>
        </div>

      </form>
    </div>
  )
}

export default ProductoForm
