// Modal.jsx CORREGIDO
"use client"

import React from 'react';
import { X } from 'lucide-react';
import ClienteForm from '../forms/ClienteForm';
import ProductoForm from '../forms/ProductoForm';
import MovimientoCajaForm from '../forms/MovimientoCajaForm';
import ProveedorForm from '../forms/ProveedorForm';
import DetalleCierreForm from '../forms/DetalleCierreForm';
import FacturaForm from '../forms/FacturaForm';
import PedidoForm from '../forms/pedido-form';
import PedidoDetail from '../forms/PedidoDetail'; // ✅ NUEVO
import VentaForm from '../forms/VentaForm';

const Modal = ({
  isOpen,
  onClose,
  modalType,
  formData = {},
  formActions = {},
  openModal,
  ...props
}) => {
  // Si no está abierto, no renderizar
  if (!isOpen) return null;

  const renderModalContent = () => {
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
      case 'editar-pedido':
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
        const pedidoSeleccionado = formData.pedidos?.find(p => p.id === formData.selectedItem?.id) || formData.selectedItem;
        const facturas = formData.facturas || [];

        return (
          <PedidoDetail
            pedido={pedidoSeleccionado || {}}
            facturas={facturas}
            formActions={formActions}
            closeModal={onClose}
          />
        );

      case 'nuevo-pedido':
        return (
          <PedidoForm
            type={modalType}
            pedido={formData.selectedItem || {}}
            clientes={formData.clientes || []}
            productos={formData.productos || []}
            formActions={formActions}
            closeModal={onClose}
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
            formData={formData}
            formActions={formActions}
            closeModal={onClose}
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
            closeModal={onClose}
            openModal={openModal}
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
      case 'nueva-venta': // ✅ AÑADE ESTE
      case 'editar-pedido': // ✅ AÑADE ESTE
      case 'ingreso-caja':
      case 'egreso-caja':
        return 'max-w-md';

      case 'nuevo-pedido':
      case 'nuevo-cliente':
      case 'editar-cliente':
      case 'cliente-rapido':
      case 'nuevo-producto':
      case 'editar-producto':
      case 'producto-rapido':
        return 'max-w-lg';

      case 'ver-pedido':
        return 'max-w-md';

      case 'nuevo-proveedor':
      case 'editar-proveedor':
        return 'max-w-lg';

      case 'detalle-cierre':
        return 'max-w-4xl';

      default:
        return 'max-w-md';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white text-gray-900 rounded-xl shadow-2xl ${getModalWidth()} w-full max-h-[95vh] overflow-y-auto`}>
        <div className="p-4 md:p-5">
          {/* Botón de cerrar */}
          <div className="flex justify-end mb-1">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contenido del modal */}
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default Modal;