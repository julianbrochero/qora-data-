"use client"

import React, { useState, useCallback } from 'react'
import { Menu, CheckCircle, TrendingUp } from 'lucide-react'
import PedidoForm from '../forms/pedido-form'

const AgregarVenta = ({
  clientes = [],
  productos = [],
  formActions,
  openModal,
  onOpenMobileSidebar,
  onVentaCreada,
}) => {
  const [formKey, setFormKey]         = useState(0)
  const [ultimaVenta, setUltimaVenta] = useState(null)

  const handleFormCerrar = useCallback(() => {}, [])

  const wrappedActions = React.useMemo(() => {
    if (!formActions) return {}

    const afterSuccess = (msg) => {
      setUltimaVenta(msg || '¡Venta creada exitosamente!')
      setTimeout(() => {
        setFormKey(k => k + 1)
        setUltimaVenta(null)
      }, 2200)
    }

    return {
      ...formActions,
      agregarPedidoSolo: async (data) => {
        const r = await formActions.agregarPedidoSolo?.(data)
        if (r?.success) afterSuccess(r.mensaje)
        return r
      },
      guardarVenta: (data, tipo) => {
        formActions.guardarVenta?.(data, tipo)
        afterSuccess()
      },
    }
  }, [formActions])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#F5F5F5',
      fontFamily: "'Inter', -apple-system, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>

      {/* HEADER */}
      <header style={{
        background: '#282A28',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        padding: '0 clamp(12px, 3vw, 24px)',
        minHeight: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
            <Menu size={16} strokeWidth={2} />
          </button>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.45)', marginBottom: 2, letterSpacing: '.06em', textTransform: 'uppercase' }}>Gestión</p>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>Agregar Venta</h2>
          </div>
        </div>

        {onVentaCreada && (
          <button onClick={onVentaCreada} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 8,
            fontSize: 11, fontWeight: 600,
            border: '1px solid rgba(255,255,255,.2)',
            background: 'transparent', color: 'rgba(255,255,255,.65)',
            cursor: 'pointer', transition: 'all .13s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)' }}>
            <TrendingUp size={12} strokeWidth={2} />
            Ver Ventas
          </button>
        )}
      </header>

      {/* CONTENIDO */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 3vw, 32px) clamp(12px, 3vw, 24px)',
      }}>
        <div style={{ width: '100%', maxWidth: 1080 }}>

        {ultimaVenta && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(34,197,94,.08)',
            border: '1px solid rgba(34,197,94,.25)',
            borderRadius: 10,
            padding: '11px 16px',
            marginBottom: 16,
            animation: 'av-fade-in .25s ease',
          }}>
            <CheckCircle size={16} strokeWidth={2.5} style={{ color: '#16a34a', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>{ultimaVenta}</span>
          </div>
        )}

        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(48,54,47,.11)',
          borderRadius: 14,
          padding: 'clamp(20px, 3vw, 32px)',
          boxShadow: '0 2px 12px rgba(0,0,0,.06)',
          zoom: 1.13,
        }}>
          <PedidoForm
            key={formKey}
            type="nuevo-pedido"
            pedido={null}
            clientes={clientes}
            productos={productos}
            formActions={wrappedActions}
            closeModal={handleFormCerrar}
            openModal={openModal}
            autoFocusProducto={true}
          />
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: '#8B8982',
          marginTop: 14,
          letterSpacing: '.01em',
        }}>
          Al guardar, la venta queda registrada en el módulo <strong style={{ color: '#8B8982' }}>Ventas</strong>.
          &nbsp;·&nbsp; Creá un cliente o producto nuevo con <strong style={{ color: '#8B8982' }}>+</strong>.
          &nbsp;·&nbsp; <kbd style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(0,0,0,.07)', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>Shift</kbd> paga el total.
        </p>
        </div>
      </div>

      <style>{`
        @keyframes av-fade-in {
          from { opacity: 0; transform: translateY(-6px) }
          to   { opacity: 1; transform: none }
        }
      `}</style>
    </div>
  )
}

export default AgregarVenta
