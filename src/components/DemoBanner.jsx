/**
 * DemoBanner.jsx
 * Banner amarillo que aparece cuando el usuario está viendo datos de ejemplo.
 * Desaparece al borrar los datos demo o al hacer "empezar de cero".
 */
import React, { useState } from 'react'
import { Sparkles, X } from 'lucide-react'

export default function DemoBanner({ onDismiss, onBorrarTodo }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fef9c3, #fef3c7)',
      border: '1px solid #fde68a',
      borderRadius: 10,
      padding: '10px 14px',
      margin: '8px 0 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
      color: '#92400e',
      fontFamily: "'Inter', sans-serif",
      flexWrap: 'wrap',
    }}>
      <Sparkles size={15} style={{ flexShrink: 0, color: '#d97706' }}/>
      <span style={{ flex: 1, fontWeight: 600 }}>
        Estás viendo datos de ejemplo.{' '}
        <span style={{ fontWeight: 400 }}>
          Creados para que explores el sistema. Podés borrarlos cuando quieras.
        </span>
      </span>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {!confirmando ? (
          <button
            onClick={() => setConfirmando(true)}
            style={{
              padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
              border: '1.5px solid #d97706', background: '#fffbeb',
              color: '#92400e', fontWeight: 600, fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            Empezar de cero
          </button>
        ) : (
          <>
            <span style={{ fontSize: 12, fontWeight: 600 }}>¿Seguro?</span>
            <button
              onClick={async () => { await onBorrarTodo?.(); onDismiss?.() }}
              style={{
                padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                border: '1.5px solid #ef4444', background: '#fef2f2',
                color: '#ef4444', fontWeight: 700, fontFamily: "'Inter', sans-serif",
              }}
            >Sí, borrar</button>
            <button
              onClick={() => setConfirmando(false)}
              style={{
                padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                border: '1px solid #d1d5db', background: '#fff',
                color: '#6b7280', fontFamily: "'Inter', sans-serif",
              }}
            >No</button>
          </>
        )}

        <button
          onClick={onDismiss}
          title="Ocultar aviso"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 2, display: 'flex', alignItems: 'center', opacity: 0.5,
          }}
        >
          <X size={14}/>
        </button>
      </div>
    </div>
  )
}
