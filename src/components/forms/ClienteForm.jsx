'use client'

import React, { useEffect, useRef, useState } from 'react'
import { User, Phone, Mail, FileText, MapPin, Building2, CreditCard, CheckCircle } from 'lucide-react'

/* ══════════════════════════════════════════════
   PALETA GESTIFY — consistente con Pedidos / Productos
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

const ClienteForm = ({ type, formData, formActions, closeModal }) => {
  const { nuevoCliente, setNuevoCliente, clienteRapido, setClienteRapido } = formData
  const { agregarCliente, editarCliente, agregarClienteRapido } = formActions

  const nombreRef = useRef(null)
  const telefonoRef = useRef(null)
  const emailRef = useRef(null)
  const cuitRef = useRef(null)
  const direccionRef = useRef(null)
  const condicionIVARef = useRef(null)
  const submittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRapido = type === 'cliente-rapido'
  const isEdit = type === 'editar-cliente'
  const data = isRapido ? clienteRapido : nuevoCliente
  const setData = isRapido ? setClienteRapido : setNuevoCliente

  const handleChange = (field, value) => setData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (submittingRef.current) return
    if (!data.nombre?.trim()) { alert('Por favor, ingrese el nombre del cliente'); nombreRef.current?.focus(); return }

    submittingRef.current = true
    setIsSubmitting(true)
    try {
      let result
      if (isRapido) result = await agregarClienteRapido()
      else if (type === 'nuevo-cliente') result = await agregarCliente()
      else if (isEdit) result = await editarCliente(data.id, data)

      if (result?.success) {
        const cb = formData.selectedItem?.onSuccess || formData.onSuccess
        if (cb) cb(result.cliente || result.data || result)
        else closeModal()
      }
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') { e.preventDefault(); nextRef?.current ? nextRef.current.focus() : handleSubmit() }
  }

  useEffect(() => {
    const t = setTimeout(() => nombreRef.current?.focus(), 100); return () => clearTimeout(t)
  }, [])

  const focusStyle = (e) => { e.target.style.borderColor = accent; e.target.style.boxShadow = '0 0 0 3px rgba(51,65,57,.08)' }
  const blurStyle = (e) => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none' }

  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* chip tipo */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', background: 'rgba(51,65,57,.1)', color: accent, border: '1px solid rgba(51,65,57,.2)' }}>
          {isRapido ? 'Cliente rápido' : isEdit ? 'Editar cliente' : 'Nuevo cliente'}
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Nombre */}
        <div>
          <label style={labelBase}>Nombre completo <span style={{ color: '#DC2626' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <User size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
            <input ref={nombreRef} type="text" required value={data.nombre || ''} placeholder="Ej: Juan Pérez"
              onChange={e => handleChange('nombre', e.target.value)} onKeyDown={e => handleKeyDown(e, telefonoRef)}
              onFocus={focusStyle} onBlur={blurStyle}
              style={{ ...inputBase, paddingLeft: 30 }} />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label style={labelBase}>Teléfono <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span></label>
          <div style={{ position: 'relative' }}>
            <Phone size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
            <input ref={telefonoRef} type="tel" value={data.telefono || ''} placeholder="351-1234567"
              onChange={e => handleChange('telefono', e.target.value)} onKeyDown={e => handleKeyDown(e, null)}
              onFocus={focusStyle} onBlur={blurStyle} maxLength="15"
              style={{ ...inputBase, paddingLeft: 30 }} />
          </div>
        </div>

        {/* Campos extra — no rápido */}
        {!isRapido && (<>

          {/* Email + CUIT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            <div>
              <label style={labelBase}>Email <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
                <input ref={emailRef} type="email" value={data.email || ''} placeholder="cliente@email.com"
                  onChange={e => handleChange('email', e.target.value)} onKeyDown={e => handleKeyDown(e, cuitRef)}
                  onFocus={focusStyle} onBlur={blurStyle}
                  style={{ ...inputBase, paddingLeft: 30 }} />
              </div>
            </div>
            <div>
              <label style={labelBase}>CUIT/CUIL <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span></label>
              <div style={{ position: 'relative' }}>
                <FileText size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
                <input ref={cuitRef} type="text" value={data.cuit || ''} placeholder="20-12345678-9"
                  onChange={e => handleChange('cuit', e.target.value)} onKeyDown={e => handleKeyDown(e, direccionRef)}
                  onFocus={focusStyle} onBlur={blurStyle}
                  style={{ ...inputBase, paddingLeft: 30 }} />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label style={labelBase}>Dirección <span style={{ fontSize: 10, color: ct3, fontWeight: 400 }}>(opcional)</span></label>
            <div style={{ position: 'relative' }}>
              <MapPin size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3 }} />
              <input ref={direccionRef} type="text" value={data.direccion || ''} placeholder="Av. Colón 123, Córdoba"
                onChange={e => handleChange('direccion', e.target.value)} onKeyDown={e => handleKeyDown(e, condicionIVARef)}
                onFocus={focusStyle} onBlur={blurStyle}
                style={{ ...inputBase, paddingLeft: 30 }} />
            </div>
          </div>

          {/* Condición IVA */}
          <div>
            <label style={labelBase}>Condición IVA</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: ct3, zIndex: 1 }} />
              <select ref={condicionIVARef} value={data.condicionIVA || 'Consumidor Final'}
                onChange={e => handleChange('condicionIVA', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
                style={{ ...inputBase, paddingLeft: 30, cursor: 'pointer', appearance: 'none' }}>
                <option>Consumidor Final</option>
                <option>Responsable Inscripto</option>
                <option>Monotributo</option>
                <option>Exento</option>
              </select>
            </div>
          </div>
        </>)}

        {/* Resumen visual */}
        <div style={{ borderRadius: 10, padding: '10px 14px', background: 'rgba(51,65,57,.05)', border: '1px solid rgba(51,65,57,.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(51,65,57,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={15} strokeWidth={2.5} style={{ color: accent }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: ct1 }}>{data.nombre || 'Nuevo cliente'}</div>
              <div style={{ fontSize: 10, color: ct3, marginTop: 1 }}>
                {data.telefono || 'Sin teléfono'}
                {!isRapido && data.email && ` · ${data.email}`}
              </div>
            </div>
            {!isRapido && data.condicionIVA && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, background: 'rgba(51,65,57,.07)', border: '1px solid rgba(51,65,57,.12)' }}>
                <CreditCard size={10} strokeWidth={2.5} style={{ color: ct3 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: ct2 }}>{data.condicionIVA}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={closeModal}
            style={{ flex: 1, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 600, color: ct2, background: 'transparent', border: `1px solid ${border}`, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all .13s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}
            style={{ flex: 2, height: 36, borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#0A1A0E', background: '#4ADE80', border: '1px solid #4ADE80', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Inter', sans-serif", transition: 'all .13s' }}
            onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.opacity = '.9' }}
            onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.opacity = '1' }}>
            {isSubmitting ? 'Guardando...' : isRapido ? '⚡ Agregar rápido' : isEdit
              ? <><CheckCircle size={13} strokeWidth={2.5} /> Guardar cambios</>
              : <><User size={13} strokeWidth={2.5} /> Crear cliente</>}
            {!isRapido && !isSubmitting && <kbd style={{ fontSize: 9, padding: '1.5px 5px', background: 'rgba(0,0,0,.08)', borderRadius: 4, fontFamily: "'DM Mono', monospace" }}>↵</kbd>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClienteForm
