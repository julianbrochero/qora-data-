'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Package, CheckCircle, X } from 'lucide-react'

const C = {
  bg: '#ffffff', pageBg: '#f8f9fb', border: '#d1d5db',
  primary: '#334139', primarySurf: '#eaf0eb',
  textBlack: '#111827', textMid: '#6b7280', textLight: '#9ca3af',
  danger: '#DC2626', dangerSurf: '#FEF2F2',
}

const inp = (err) => ({
  width: '100%', height: 34, padding: '0 10px',
  fontSize: 13, color: C.textBlack, background: C.bg,
  border: `1.5px solid ${err ? C.danger : C.border}`, borderRadius: 7,
  outline: 'none', fontFamily: "'Inter', sans-serif",
  transition: 'border-color .12s',
  boxSizing: 'border-box',
})

const lbl = {
  fontSize: 11, fontWeight: 600, color: C.textMid,
  marginBottom: 4, display: 'block',
}

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

  const [error, setError] = useState('')

  const data    = isRapido ? productoRapido : nuevoProducto
  const setData = isRapido
    ? (fn) => setProductoRapido(typeof fn === 'function' ? fn(productoRapido) : fn)
    : (fn) => setNuevoProducto(typeof fn === 'function' ? fn(nuevoProducto) : fn)

  const csActivo = !!(data.controlaStock || data.controlastock)

  const set = (campo, valor) => {
    setError('')
    setData(prev => ({ ...prev, [campo]: valor }))
  }

  const toggleCS = () => {
    setData(prev => {
      const n = { ...prev, controlaStock: !csActivo }
      delete n.controlastock
      return n
    })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')
    if (!data.nombre?.trim()) { setError('El nombre del producto es requerido'); nombreRef.current?.focus(); return }
    const precioNum = parseFloat(String(data.precio).replace(',', '.'))
    if (!precioNum || precioNum <= 0) { setError('El precio debe ser mayor a 0'); precioRef.current?.focus(); return }
    if (!isRapido && csActivo && (parseInt(data.stock) || 0) < 0) { setError('El stock no puede ser negativo'); stockRef.current?.focus(); return }

    let result
    if (isRapido)  result = await agregarProductoRapido()
    else if (isEdit) result = await editarProducto(selectedItem?.id, data)
    else             result = await agregarProducto()

    if (result?.success) {
      const cb = formData.selectedItem?.onSuccess || formData.onSuccess
      if (cb) cb(result.producto || result.data || result)
      else closeModal()
    } else {
      setError(result?.mensaje || 'Error al guardar. Revisá los datos e intentá de nuevo.')
    }
  }

  const next = (ref) => (e) => {
    if (e.key === 'Enter') { e.preventDefault(); ref?.current ? ref.current.focus() : handleSubmit() }
  }

  // Ctrl+Enter → guardar
  useEffect(() => {
    const h = (e) => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleSubmit() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [data])

  // Auto focus
  useEffect(() => {
    const t = setTimeout(() => nombreRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  // Cargar datos en edición
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

  // Reset stock cuando se desactiva inventario
  useEffect(() => {
    if (!isRapido && !csActivo && data.stock !== 0) set('stock', 0)
  }, [csActivo, isRapido])

  const precioNum = parseFloat(data.precio) || 0
  const costoNum  = parseFloat(data.costo)  || 0
  const margen    = precioNum > 0 && costoNum > 0 ? ((precioNum - costoNum) / precioNum * 100) : null

  const focusOn = (e) => { e.target.style.borderColor = C.primary }
  const blurOff = (e) => { e.target.style.borderColor = error ? C.danger : C.border }

  const title = isRapido ? 'Producto rápido' : isEdit ? 'Editar producto' : 'Nuevo producto'

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.primarySurf, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={16} strokeWidth={2} style={{ color: C.primary }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textBlack }}>{title}</h2>
            {isEdit && <p style={{ margin: 0, fontSize: 11, color: C.textLight }}>Ctrl+Enter para guardar</p>}
          </div>
        </div>
        <button onClick={closeModal} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={14} style={{ color: C.textMid }} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Nombre */}
        <div>
          <label style={lbl}>Nombre <span style={{ color: C.danger }}>*</span></label>
          <input
            ref={nombreRef} type="text" value={data.nombre || ''}
            onChange={e => set('nombre', e.target.value)}
            onKeyDown={next(codigoRef)} onFocus={focusOn} onBlur={blurOff}
            placeholder="Ej: Campera de cuero"
            style={inp(error && !data.nombre?.trim())}
          />
        </div>

        {/* Código + Categoría */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10 }}>
          <div>
            <label style={lbl}>Código</label>
            <input
              ref={codigoRef} type="text" value={data.codigo || ''}
              onChange={e => set('codigo', e.target.value)}
              onKeyDown={next(precioRef)} onFocus={focusOn} onBlur={blurOff}
              placeholder="Automático"
              style={inp()}
            />
          </div>
          <div>
            <label style={lbl}>Categoría</label>
            <input
              type="text" value={data.categoria || ''}
              onChange={e => set('categoria', e.target.value)}
              onKeyDown={next(precioRef)} onFocus={focusOn} onBlur={blurOff}
              placeholder="Indumentaria, Electrónica..."
              style={inp()}
            />
            {categorias.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                {categorias
                  .filter(c => {
                    const n = c.nombre || c
                    const q = (data.categoria || '').toLowerCase()
                    return !q || n.toLowerCase().includes(q)
                  })
                  .map((c, i) => {
                    const n = c.nombre || c
                    const activo = (data.categoria || '').toLowerCase() === n.toLowerCase()
                    return (
                      <button key={i} type="button" tabIndex={-1}
                        onClick={() => set('categoria', n)}
                        onMouseDown={e => e.preventDefault()}
                        style={{
                          padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                          border: activo ? 'none' : `1px solid ${C.border}`,
                          background: activo ? C.primary : C.pageBg,
                          color: activo ? '#fff' : C.textMid,
                          cursor: 'pointer', transition: 'all .1s',
                        }}
                      >{n}</button>
                    )
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Precio + Costo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={lbl}>Precio de venta <span style={{ color: C.danger }}>*</span></label>
            <input
              ref={precioRef} type="number" value={data.precio || ''}
              onChange={e => set('precio', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
              onKeyDown={next(costoRef)} onFocus={focusOn} onBlur={blurOff}
              placeholder="0.00" step="0.01" min="0.01"
              style={inp(error && !(parseFloat(data.precio) > 0))}
            />
          </div>
          <div>
            <label style={lbl}>
              Costo <span style={{ fontSize: 10, color: C.textLight, fontWeight: 400 }}>privado</span>
              {margen !== null && (
                <span style={{ float: 'right', fontWeight: 700, color: margen >= 0 ? '#16a34a' : C.danger }}>
                  {margen.toFixed(1)}% margen
                </span>
              )}
            </label>
            <input
              ref={costoRef} type="number" value={data.costo ?? ''}
              onChange={e => set('costo', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
              onKeyDown={next(csActivo ? stockRef : null)} onFocus={focusOn} onBlur={blurOff}
              placeholder="0.00" step="0.01" min="0"
              style={inp()}
            />
          </div>
        </div>

        {/* Toggle + Stock en misma fila */}
        {!isRapido && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Toggle */}
            <div
              onClick={toggleCS}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, border: `1.5px solid ${csActivo ? C.primary : C.border}`, background: csActivo ? C.primarySurf : C.pageBg, cursor: 'pointer', flex: 1, transition: 'all .12s', userSelect: 'none' }}
            >
              <div style={{ width: 30, height: 17, borderRadius: 9, background: csActivo ? C.primary : C.border, position: 'relative', transition: 'background .15s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, left: csActivo ? 14 : 2, width: 13, height: 13, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)', transition: 'left .15s' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: csActivo ? C.primary : C.textMid }}>
                Control de stock
              </span>
            </div>

            {/* Stock */}
            <div style={{ width: 100, flexShrink: 0 }}>
              <input
                ref={stockRef} type="number" value={data.stock ?? 0}
                onChange={e => set('stock', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                disabled={!csActivo}
                placeholder="0" min="0"
                onFocus={focusOn} onBlur={blurOff}
                style={{
                  ...inp(),
                  background: !csActivo ? C.pageBg : C.bg,
                  color: !csActivo ? C.textLight : C.textBlack,
                  cursor: !csActivo ? 'not-allowed' : 'text',
                  textAlign: 'center',
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: C.textLight, flexShrink: 0 }}>unid.</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '7px 10px', borderRadius: 7, background: C.dangerSurf, border: `1px solid #fecaca`, fontSize: 12, color: C.danger, fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
          <button type="button" onClick={closeModal}
            style={{ flex: 1, height: 34, borderRadius: 7, fontSize: 12, fontWeight: 600, color: C.textMid, background: 'transparent', border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .1s' }}
            onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Cancelar
          </button>
          <button type="submit"
            style={{ flex: 2, height: 34, borderRadius: 7, fontSize: 13, fontWeight: 700, color: '#fff', background: C.primary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', transition: 'background .1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2b352f'}
            onMouseLeave={e => e.currentTarget.style.background = C.primary}>
            {isRapido
              ? '⚡ Agregar rápido'
              : isEdit
                ? <><CheckCircle size={13} strokeWidth={2.5} /> Guardar</>
                : <><Package size={13} strokeWidth={2.5} /> Crear producto</>}
            {!isRapido && (
              <kbd style={{ fontSize: 9, padding: '1.5px 5px', background: 'rgba(255,255,255,.15)', borderRadius: 4, fontFamily: 'monospace' }}>↵</kbd>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductoForm
