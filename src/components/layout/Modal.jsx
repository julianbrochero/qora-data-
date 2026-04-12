// Modal.jsx CORREGIDO
"use client"

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import ClienteForm from '../forms/ClienteForm';
import ProductoForm from '../forms/ProductoForm';
import MovimientoCajaForm from '../forms/MovimientoCajaForm';
import ProveedorForm from '../forms/ProveedorForm';
import DetalleCierreForm from '../forms/DetalleCierreForm';
import FacturaForm from '../forms/FacturaForm';
import PedidoForm from '../forms/pedido-form';
import PedidoDetail from '../forms/PedidoDetail'; // ✅ NUEVO
import VentaForm from '../forms/VentaForm';
import FacturaDirectaForm from '../forms/FacturaDirectaForm';
import PresupuestoForm from '../forms/PresupuestoForm';

/* ─── Gestión de Categorías ─── */
function CategoriasPanel({ categorias = [], formActions = {}, onClose }) {
  const [nueva, setNueva] = useState('')
  const [editando, setEditando] = useState(null) // { nombre }
  const [editVal, setEditVal] = useState('')
  const [loading, setLoading] = useState(false)

  const C = {
    bg: '#ffffff', pageBg: '#f8f9fb', border: '#e5e7eb',
    primary: '#334139', primarySurf: '#eaf0eb',
    textBlack: '#111827', textMid: '#6b7280', textLight: '#9ca3af',
    danger: '#DC2626', dangerSurf: '#FEF2F2',
  }

  const handleAgregar = async () => {
    const n = nueva.trim()
    if (!n || categorias.find(c => (c.nombre||c).toLowerCase() === n.toLowerCase())) return
    setLoading(true)
    await formActions.agregarCategoria?.(n)
    setNueva(''); setLoading(false)
  }

  const handleRenombrar = async () => {
    const n = editVal.trim()
    if (!n || !editando) return
    setLoading(true)
    await formActions.renombrarCategoria?.(editando.nombre, n)
    setEditando(null); setEditVal(''); setLoading(false)
  }

  const handleEliminar = async (nombre) => {
    setLoading(true)
    await formActions.eliminarCategoria?.(nombre)
    setLoading(false)
  }

  const cats = categorias.map(c => typeof c === 'string' ? { nombre: c } : c)

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.primarySurf, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={16} strokeWidth={2} style={{ color: C.primary }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textBlack }}>Categorías</h2>
            <p style={{ margin: 0, fontSize: 11, color: C.textLight }}>{cats.length} categoría{cats.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={14} style={{ color: C.textMid }} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        {/* Agregar nueva */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={nueva}
            onChange={e => setNueva(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAgregar()}
            placeholder="Nueva categoría..."
            style={{
              flex: 1, height: 34, padding: '0 12px', fontSize: 13,
              border: `1.5px solid ${C.border}`, borderRadius: 8,
              background: C.bg, color: C.textBlack, outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = C.primary}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <button
            onClick={handleAgregar}
            disabled={!nueva.trim() || loading}
            style={{
              height: 34, padding: '0 14px', borderRadius: 8, border: 'none',
              background: nueva.trim() ? C.primary : C.border,
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: nueva.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
              transition: 'background .12s',
            }}
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {/* Lista */}
        {cats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.textLight, fontSize: 13 }}>
            No hay categorías aún
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto' }}>
            {cats.map((cat, i) => {
              const nombre = cat.nombre || cat
              const isEdit = editando?.nombre === nombre
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 9,
                  border: `1px solid ${isEdit ? C.primary : C.border}`,
                  background: isEdit ? C.primarySurf : C.pageBg,
                  transition: 'all .12s',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, flexShrink: 0 }} />
                  {isEdit ? (
                    <>
                      <input
                        autoFocus
                        value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onKeyDown={e => { if(e.key==='Enter') handleRenombrar(); if(e.key==='Escape') { setEditando(null); setEditVal('') } }}
                        style={{
                          flex: 1, height: 26, padding: '0 8px', fontSize: 13,
                          border: `1.5px solid ${C.primary}`, borderRadius: 6,
                          background: C.bg, color: C.textBlack, outline: 'none', fontFamily: 'inherit',
                        }}
                      />
                      <button onClick={handleRenombrar} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: C.primary, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => { setEditando(null); setEditVal('') }} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={13} style={{ color: C.textMid }} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.textBlack }}>{nombre}</span>
                      <button
                        onClick={() => { setEditando(cat); setEditVal(nombre) }}
                        title="Renombrar"
                        style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                      >
                        <Pencil size={12} style={{ color: C.textMid }} />
                      </button>
                      <button
                        onClick={() => handleEliminar(nombre)}
                        title="Eliminar"
                        style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.danger; e.currentTarget.style.background = C.dangerSurf }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg }}
                      >
                        <Trash2 size={12} style={{ color: C.danger }} />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const Modal = ({
  isOpen,
  onClose,
  modalType,
  formData = {},
  formActions = {},
  openModal,
  ...props
}) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Si no está abierto, no renderizar
  if (!isOpen) return null;

  const renderModalContent = () => {
    // Combinar categorías de la tabla independiente + las que ya usan productos
    const categoriasExistentes = (() => {
      try {
        const dbCats = (formData.categoriasDb || []).map(c => c.nombre || c).filter(Boolean)
        const prods = formData.productos || []
        const prodCats = prods.map(p => p.categoria).filter(Boolean)
        const merged = [...new Set([...dbCats, ...prodCats])]
        return merged.map(nombre => ({ nombre }))
      } catch { return [] }
    })()

    switch (modalType) {
      case 'nueva-factura':
        return (
          <FacturaForm
            formData={formData}
            formActions={formActions}
            closeModal={onClose}
            openModal={openModal}
          />
        );

      // ✅ AÑADE ESTOS CASOS PARA VENTAS
      case 'nueva-venta':
        return (
          <VentaForm
            type={modalType}
            pedido={modalType === 'editar-pedido' ? (formData.selectedItem || {}) : null}
            clientes={formData.clientes || []}
            productos={formData.productos || []}
            formActions={formActions}
            closeModal={onClose}
            openModal={openModal}
          />
        );

      case 'ver-pedido':
      case 'detalle-pedido':
        const pedidoSeleccionado = formData.pedidos?.find(p => p.id === formData.selectedItem?.id) || formData.selectedItem;
        const facturas = formData.facturas || [];

        return (
          <PedidoDetail
            pedido={pedidoSeleccionado || {}}
            clientes={formData.clientes || []}
            facturas={facturas}
            formActions={formActions}
            closeModal={onClose}
          />
        );

      case 'nuevo-pedido':
      case 'editar-pedido':
        return (
          <PedidoForm
            type={modalType}
            pedido={formData.selectedItem || {}}
            clientes={formData.clientes || []}
            productos={formData.productos || []}
            formActions={formActions}
            closeModal={onClose}
            openModal={openModal}
          />
        );

      case 'factura-directa':
        return (
          <FacturaDirectaForm
            clientes={formData.clientes || []}
            productos={formData.productos || []}
            formActions={formActions}
            closeModal={onClose}
            openModal={openModal}
          />
        );

      case 'nuevo-cliente':
      case 'editar-cliente':
      case 'cliente-rapido':
        return (
          <ClienteForm
            type={modalType}
            formData={formData}
            formActions={formActions}
            closeModal={onClose}
          />
        );

      case 'nuevo-producto':
      case 'editar-producto':
      case 'producto-rapido':
        return (
          <ProductoForm
            type={modalType}
            selectedItem={formData.selectedItem}
            formData={formData}
            formActions={formActions}
            closeModal={onClose}
            categorias={categoriasExistentes}
          />
        );

      case 'ingreso-caja':
      case 'egreso-caja':
        return (
          <MovimientoCajaForm
            type={modalType}
            formData={formData}
            formActions={formActions}
            closeModal={onClose}
          />
        );

      case 'nuevo-proveedor':
      case 'editar-proveedor':
        return (
          <ProveedorForm
            type={modalType}
            formData={formData}
            formActions={formActions}
            closeModal={onClose}
          />
        );

      case 'detalle-cierre':
        return (
          <DetalleCierreForm
            selectedItem={formData.selectedItem}
            closeModal={onClose}
            openModal={openModal}
          />
        );

      case 'categorias-producto':
        return (
          <CategoriasPanel
            categorias={categoriasExistentes}
            formActions={formActions}
            onClose={onClose}
          />
        );

      case 'nuevo-presupuesto':
        return (
          <PresupuestoForm
            clientes={formData.clientes || []}
            productos={formData.productos || []}
            formActions={formActions}
            closeModal={onClose}
          />
        );

      default:
        return (
          <div className="text-center p-8">
            <p className="text-gray-600">Modal tipo "{modalType}" no configurado</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        );
    }
  };

  // Determinar el ancho del modal según el tipo
  const getModalWidth = () => {
    switch (modalType) {
      case 'nueva-factura':
      case 'nueva-venta':
      case 'editar-pedido':
      case 'ingreso-caja':
      case 'egreso-caja':
        return 'max-w-xl';

      case 'nuevo-pedido':
        return 'max-w-3xl';

      case 'factura-directa':
        return 'max-w-lg';

      case 'nuevo-cliente':
      case 'editar-cliente':
      case 'cliente-rapido':
      case 'nuevo-producto':
      case 'editar-producto':
      case 'producto-rapido':
        return 'max-w-xl';

      case 'ver-pedido':
      case 'detalle-pedido':
        return 'max-w-3xl';

      case 'nuevo-proveedor':
      case 'editar-proveedor':
        return 'max-w-xl';

      case 'categorias-producto':
        return 'max-w-sm';

      case 'nuevo-presupuesto':
        return 'max-w-xl';

      case 'detalle-cierre':
        return 'max-w-4xl';

      default:
        return 'max-w-xl';
    }
  };

  return (
    <div onClick={onClose} className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] ${(modalType === 'ver-pedido' || modalType === 'detalle-pedido') ? 'p-2 sm:p-4' : 'p-6 sm:p-10'}`}>
      <div onClick={e => e.stopPropagation()} className={`bg-white text-gray-900 rounded-xl shadow-2xl ${getModalWidth()} w-full ${(modalType === 'ver-pedido' || modalType === 'detalle-pedido') ? 'max-h-[98vh]' : 'max-h-[95vh]'} overflow-y-auto`}>
        <div className={(modalType === 'ver-pedido' || modalType === 'detalle-pedido') ? 'p-3' : 'p-4'}>
          {/* Contenido del modal */}
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default Modal;