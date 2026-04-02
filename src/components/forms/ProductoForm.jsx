'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Package, Hash, DollarSign, Box, Tag, FileText, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react'

/* ══════════════════════════════════════════════
   PALETA GESTIFY - consistente con Pedidos / Clientes
══════════════════════════════════════════════ */
const ct1 = '#1e2320'
const ct2 = '#30362F'
const ct3 = '#8B8982'
const accent = '#334139'
const border = 'rgba(48,54,47,.13)'

const inputBase = {
  width: '100%', height: 36, padding: '0 12px',
  fontSize: 12, color: ct1, background: '#fff',
  border: `1px solid ${border}`, borderRadius: 8,
  outline: 'none', fontFamily: "'Inter', sans-serif",
  transition: 'border-color .15s',
}

const labelBase = {
  fontSize: 11, fontWeight: 600, color: ct2,
  marginBottom: 5, display: 'block', letterSpacing: '.01em',
}

const ProductoForm = ({ type, selectedItem, formData, formActions, closeModal, categorias = [] }) => {
  const { nuevoProducto, setNuevoProducto, productoRapido, setProductoRapido } = formData
  const { agregarProducto, editarProducto, agregarProductoRapido } = formActions

  const isEdit = type === 'editar-producto'
  const isRapido = type === 'producto-rapido'

  const nombreRef = useRef(null)
  const precioRef = useRef(null)
  const costoRef  = useRef(null)
  const stockRef = useRef(null)
  const codigoRef = useRef(null)
  const categoriaRef = useRef(null)

  const data = isRapido ? productoRapido : nuevoProducto

  // Normalizar: Supabase devuelve 'controlastock' (minúsculas), el form usa 'controlaStock'
  // Aceptamos ambas variantes
  const csActivo = !!(data.controlaStock || data.controlastock)

  const handleChange = (campo, valor) => {
    if (isRapido) setProductoRapido(prev => ({ ...prev, [campo]: valor }))
    else setNuevoProducto(prev => ({ ...prev, [campo]: valor }))
  }

  const toggleControlaStock = () => {
    const nov = !csActivo
    // Actualizar unificadamente para evitar carreras entre estados
    const update = (prev) => {
      const n = { ...prev, controlaStock: nov }
      delete n.controlastock
      return n
    }
    if (isRapido) setProductoRapido(update)
    else setNuevoProducto(update)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!data.nombre?.trim()) { alert('El nombre del producto es requerido'); nombreRef.current?.focus(); return }
    const precioNum = parseFloat(String(data.precio).replace(',', '.'))
    if (!precioNum || precioNum <= 0) { alert('El precio debe ser mayor a 0'); precioRef.current?.focus(); return }
    if (!isRapido && csActivo && (parseInt(data.stock) || 0) < 0) { alert('El stock no puede ser negativo'); stockRef.current?.focus(); return }

    let result
    if (isRapido) result = await agregarProductoRapido()
    else if (isEdit) result = await editarProducto(selectedItem?.id, data)
    else result = await agregarProducto()

    if (result?.success) {
      const cb = formData.selectedItem?.onSuccess || formData.onSuccess
      if (cb) cb(result.producto || result.data || result)
      else closeModal()
    } else {
      alert(result?.mensaje || 'Error al guardar el producto. Revisá los datos e intentá de nuevo.')
    }
  }

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // En modo edición, permitimos guardar directamente desde campos clave para agilizar
      const camposQueGuardan = ['nombre', 'precio', 'categoria', 'codigo']
      const campoActual = Object.keys(refs).find(k => refs[k].current === e.target)
      
      if (isEdit && camposQueGuardan.includes(campoActual)) {
        handleSubmit()
      } else if (nextRef?.current) {
        nextRef.current.focus()
      } else {
        handleSubmit()
      }
    }
  }

  // Mapa de refs para identificar el campo actual en handleKeyDown
  const refs = { nombre: nombreRef, precio: precioRef, costo: costoRef, stock: stockRef, codigo: codigoRef, categoria: categoriaRef }

  useEffect(() => {
    if (!isRapido && !csActivo) {
      if (data.stock !== 0) handleChange('stock', 0)
    }
  }, [csActivo, isRapido])

  useEffect(() => {
    if (!isEdit) { const t = setTimeout(() => nombreRef.current?.focus(), 100); return () => clearTimeout(t) }
  }, [isEdit])

  // Prellenar categoría si vino del modal de categorías (solo en nuevo producto)
  useEffect(() => {
    if (!isEdit && !isRapido && selectedItem?.categoria) {
      setNuevoProducto(prev => ({ ...prev, categoria: selectedItem.categoria }))
    }
  }, [])

  // EDICIÓN: cargar TODOS los datos del producto directamente desde selectedItem
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

  const fmtPrecio = (parseFloat(data.precio) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const precioNum = parseFloat(data.precio) || 0
  const costoNum  = parseFloat(data.costo)  || 0
  const margenPesos = precioNum - costoNum
  const margenPorc  = precioNum > 0 && costoNum > 0 ? ((margenPesos / precioNum) * 100) : null

  const focusStyle = (e) => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,57,.08)' }
  const blurStyle = (e) => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }

  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Chips de tipo */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { k: isRapido ? 'Producto rápido' : isEdit ? 'Editar producto' : 'Nuevo producto', active: true },
        ].map((c, i) => (
          <span key={i} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', background: c.active ? 'rgba(51,65,57,.1)' : 'transparent', color: accent, border: `1px solid rgba(51,65,57,.2)` }}>
            {c.k}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Nombre */}
        <div>
          <label style={labelBase}>Nombre del producto <span style={{ color: '#DC2626' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <Package size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
            <input ref={nombreRef} type="text" required value={data.nombre || ''} onChange={e => handleChange('nombre', e.target.value)} onKeyDown={e => handleKeyDown(e, precioRef)}
              onFocus={focusStyle} onBlur={blurStyle} placeholder="Ej: Campera de cuero"
              style={{ ...inputBase, paddingLeft: 30 }} />
          </div>
        </div>

        {/* Código + Categoría */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelBase}>Código</label>
            <div style={{ position: 'relative' }}>
              <Hash size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input ref={codigoRef} type="text" value={data.codigo || ''} onChange={e => handleChange('codigo', e.target.value)} onKeyDown={e => handleKeyDown(e, categoriaRef)}
                onFocus={focusStyle} onBlur={blurStyle} placeholder="AUTO"
                style={{ ...inputBase, paddingLeft: 30 }} />
            </div>
          </div>

          <div>
            <label style={labelBase}>
              Categoría <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Tag size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input
                ref={categoriaRef}
                type="text"
                value={data.categoria || ''}
                onChange={e => handleChange('categoria', e.target.value)}
                onKeyDown={e => handleKeyDown(e, precioRef)}
                onFocus={focusStyle}
                onBlur={blurStyle}
                placeholder="Ej: Indumentaria, Electrónica..."
                style={{ ...inputBase, paddingLeft: 30 }}
              />
            </div>
            {/* Chips de categorías existentes */}
            {categorias.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
                {categorias
                  .filter(c => {
                    const nombre = c.nombre || c
                    const q = (data.categoria || '').toLowerCase()
                    return !q || nombre.toLowerCase().includes(q)
                  })
                  .map((c, i) => {
                    const nombre = c.nombre || c
                    const activo = (data.categoria || '').toLowerCase() === nombre.toLowerCase()
                    return (
                      <button
                        key={i}
                        type="button"
                        tabIndex={-1}
                        onClick={e => { e.preventDefault(); handleChange('categoria', nombre) }}
                        onMouseDown={e => e.preventDefault()} // Evitar pérdida de foco
                        style={{
                          padding: '3px 9px', borderRadius: 16, fontSize: 10, fontWeight: 700,
                          border: activo ? 'none' : `1px solid ${border}`,
                          background: activo ? accent : 'rgba(48,54,47,.05)',
                          color: activo ? '#fff' : ct2,
                          cursor: 'pointer', transition: 'all .12s',
                        }}
                      >
                        {nombre}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Precio + Costo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelBase}>Precio de venta <span style={{ color: '#DC2626' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input ref={precioRef} type="number" required value={data.precio || ''} onChange={e => handleChange('precio', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                onKeyDown={e => handleKeyDown(e, isEdit ? costoRef : null)}
                onFocus={focusStyle} onBlur={blurStyle} placeholder="0.00" step="0.01" min="0.01"
                style={{ ...inputBase, paddingLeft: 30 }} />
            </div>
          </div>
          <div>
            <label style={labelBase}>Costo <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional, privado)</span></label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input ref={costoRef} type="number" value={data.costo ?? ''} onChange={e => handleChange('costo', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                onKeyDown={e => handleKeyDown(e, stockRef)}
                onFocus={focusStyle} onBlur={blurStyle} placeholder="0.00" step="0.01" min="0"
                style={{ ...inputBase, paddingLeft: 30 }} />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div>
          <label style={labelBase}>Stock {isEdit ? 'actual' : 'inicial'}</label>
          <div style={{ position: 'relative' }}>
            <Box size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
            <input ref={stockRef} type="number" value={data.stock ?? 0} onChange={e => handleChange('stock', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              disabled={!isRapido && !csActivo}
              onFocus={focusStyle} onBlur={blurStyle} placeholder="0" min="0"
              style={{ ...inputBase, paddingLeft: 30, background: (!isRapido && !csActivo) ? 'rgba(0,0,0,.03)' : '#fff', color: (!isRapido && !csActivo) ? ct3 : ct1, cursor: (!isRapido && !csActivo) ? 'not-allowed' : 'text' }} />
          </div>
        </div>

        {/* Toggle control de inventario */}
        {!isRapido && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: csActivo ? 'rgba(51,65,57,.07)' : 'rgba(48,54,47,.04)', border: `1px solid ${csActivo ? 'rgba(51,65,57,.25)' : border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all .15s' }}
            onClick={toggleControlaStock}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {csActivo
                ? <ToggleRight size={20} style={{ color: accent }} />
                : <ToggleLeft size={20} style={{ color: ct3 }} />}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: ct1 }}>Control de inventario</div>
                <div style={{ fontSize: 10, color: ct3, marginTop: 1 }}>
                  {csActivo ? 'Stock se descontará en cada venta.' : 'Stock ilimitado, no se descontará.'}
                </div>
              </div>
            </div>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: csActivo ? accent : 'rgba(0,0,0,.15)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: csActivo ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transition: 'left .2s' }} />
            </div>
          </div>
        )}

        {/* Descripción */}
        {!isRapido && (
          <div>
            <label style={labelBase}>Descripción <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span></label>
            <div style={{ position: 'relative' }}>
              <FileText size={13} style={{ position: 'absolute', left: 10, top: 10, color: ct3 }} />
              <textarea value={data.descripcion || ''} onChange={e => handleChange('descripcion', e.target.value)} rows={2} placeholder="Información adicional del producto..."
                onFocus={focusStyle} onBlur={blurStyle}
                style={{ ...inputBase, height: 'auto', paddingLeft: 30, paddingTop: 8, paddingBottom: 8, resize: 'none' }} />
            </div>
          </div>
        )}

        {/* Resumen visual */}
        {!isRapido && (
          <div style={{ borderRadius: 10, padding: '10px 14px', background: 'rgba(51,65,57,.05)', border: `1px solid rgba(51,65,57,.12)` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: ct3, fontWeight: 600 }}>Precio de venta</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: accent, letterSpacing: '-.03em' }}>${fmtPrecio}</span>
            </div>
            {costoNum > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: `1px solid rgba(51,65,57,.12)` }}>
                  <span style={{ fontSize: 11, color: ct3, fontWeight: 600 }}>Costo</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>${costoNum.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: ct3, fontWeight: 600 }}>Ganancia estimada</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: margenPesos >= 0 ? '#065F46' : '#991B1B' }}>
                      {margenPesos >= 0 ? '+' : ''}${margenPesos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {margenPorc !== null && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 5, background: margenPorc >= 0 ? '#D1FAE5' : '#FEE2E2', color: margenPorc >= 0 ? '#065F46' : '#991B1B' }}>
                        {margenPorc.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
            {csActivo && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: `1px solid rgba(51,65,57,.12)` }}>
                <span style={{ fontSize: 11, color: ct3, fontWeight: 600 }}>Stock disponible</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: ct1 }}>{parseInt(data.stock) || 0} u.</span>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={closeModal} style={{ flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600, color: ct2, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer', transition: 'all .13s', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Cancelar
          </button>
          <button type="submit" style={{ flex: 2, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#0A1A0E', background: '#4ADE80', border: '1px solid #4ADE80', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Inter', sans-serif", transition: 'all .13s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {isRapido ? '⚡ Agregar rápido' : isEdit ? <><CheckCircle size={13} strokeWidth={2.5} /> Guardar cambios</> : <><Package size={13} strokeWidth={2.5} /> Crear producto</>}
            {!isRapido && <kbd style={{ fontSize: 9, padding: '1.5px 5px', background: 'rgba(0,0,0,.08)', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>↵</kbd>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductoForm