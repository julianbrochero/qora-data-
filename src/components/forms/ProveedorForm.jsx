'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Truck, Phone, Mail, FileText, MapPin, Package, StickyNote, Building2 } from 'lucide-react';

const ProveedorForm = ({ type, formData, formActions, closeModal }) => {
  const { agregarProveedor, editarProveedor } = formActions;

  const isEdit = type === 'editar-proveedor';
  const itemEdicion = isEdit ? (formData.selectedItem || {}) : {};

  const [error, setError] = useState('')
  const [nuevoProveedor, setNuevoProveedor] = React.useState(
    itemEdicion.id ? itemEdicion : {
      nombre: '',
      telefono: '',
      email: '',
      cuit: '',
      direccion: '',
      productos: '',
      notas: '',
      deuda: 0
    }
  );

  // Refs para los campos
  const nombreRef = useRef(null);
  const telefonoRef = useRef(null);
  const emailRef = useRef(null);
  const cuitRef = useRef(null);
  const direccionRef = useRef(null);
  const productosRef = useRef(null);
  const notasRef = useRef(null);
  const deudaRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validar nombre
    setError('')
    if (!nuevoProveedor.nombre || !nuevoProveedor.nombre.trim()) {
      setError('El nombre del proveedor es requerido');
      nombreRef.current?.focus();
      return;
    }

    // Validar teléfono
    const telefono = nuevoProveedor.telefono?.trim() || '';
    if (!telefono || telefono.length < 8) {
      setError('Ingresá un número de teléfono válido (mínimo 8 dígitos)');
      telefonoRef.current?.focus();
      return;
    }

    let result;
    if (isEdit) {
      result = await editarProveedor(nuevoProveedor.id, nuevoProveedor);
    } else {
      result = await agregarProveedor(nuevoProveedor);
    }

    if (result && result.success) {
      const onSuccess = formData.selectedItem?.onSuccess || formData.onSuccess;
      if (onSuccess) {
        onSuccess(result.proveedor || result.data || result);
      } else {
        closeModal();
      }
    }
  };

  const handleChange = (field, value) => {
    setNuevoProveedor(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar navegación con Enter
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      } else {
        handleSubmit();
      }
    }
  };

  // Focus automático al abrir el modal
  useEffect(() => {
    if (!isEdit) {
      const timer = setTimeout(() => {
        nombreRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEdit]);

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* INFORMACIÓN BÁSICA */}
        <div className="space-y-2">
          {/* Nombre - Campo principal */}
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Razón Social / Nombre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                ref={nombreRef}
                type="text"
                required
                className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Ej: Distribuidora Central"
                value={nuevoProveedor.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, telefonoRef)}
              />
            </div>
          </div>

          {/* Teléfono - Campo principal */}
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                ref={telefonoRef}
                type="tel"
                required
                className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="351-1234567"
                value={nuevoProveedor.telefono || ""}
                onChange={(e) => handleChange("telefono", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, null)} // null = enter hace submit de forma predeterminada, los demás opcionales se ignoran
                minLength="8"
                maxLength="15"
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-1">Presione Enter para guardar directamente o rellene los datos opcionales debajo.</p>
          </div>

          {/* Deuda - Campo principal */}
          <div className="bg-red-50 border border-red-100 rounded-md p-2">
            <label className="block text-[11px] font-semibold text-red-700 mb-0.5">
              Saldo Deudor <span className="text-gray-500 font-normal">(Deuda Inicial / Actual)</span>
            </label>
            <div className="relative">
              <span className="text-[11px] font-medium text-gray-500 absolute left-2 top-1/2 -translate-y-1/2">$</span>
              <input
                ref={deudaRef}
                type="number"
                step="0.01"
                min="0"
                className="w-full pl-6 pr-2 py-1.5 text-[11px] font-bold text-red-700 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent bg-white"
                placeholder="0.00"
                value={nuevoProveedor.deuda || ""}
                onChange={(e) => handleChange("deuda", e.target.value)}
              />
            </div>
            <p className="text-[9px] text-red-600/70 mt-1">Acualice este monto manualmente para reflejar la deuda real.</p>
          </div>

          <div className="border-t border-gray-100 my-2 pt-2">
            <h4 className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Datos Adicionales (Opcional)</h4>

            {/* Email y CUIT */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Email</label>
                <div className="relative">
                  <Mail className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    ref={emailRef}
                    type="email"
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="contacto@empresa.com"
                    value={nuevoProveedor.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, cuitRef)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">CUIT</label>
                <div className="relative">
                  <FileText className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    ref={cuitRef}
                    type="text"
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="30-12345678-9"
                    value={nuevoProveedor.cuit || ""}
                    onChange={(e) => handleChange("cuit", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, direccionRef)}
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="mb-2">
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Dirección</label>
              <div className="relative">
                <MapPin className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  ref={direccionRef}
                  type="text"
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Av. Colón 456, Córdoba"
                  value={nuevoProveedor.direccion || ""}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, productosRef)}
                />
              </div>
            </div>

            {/* Productos */}
            <div className="mb-2">
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Productos o Rubro</label>
              <div className="relative">
                <Package className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  ref={productosRef}
                  type="text"
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Bebidas, Lácteos, Insumos..."
                  value={nuevoProveedor.productos || ""}
                  onChange={(e) => handleChange("productos", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, notasRef)}
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Notas</label>
              <div className="relative">
                <StickyNote className="w-3 h-3 text-gray-400 absolute left-2 top-3 -translate-y-1/2" />
                <textarea
                  ref={notasRef}
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                  placeholder="Condiciones de entrega, días de visita..."
                  rows={2}
                  value={nuevoProveedor.notas || ""}
                  onChange={(e) => handleChange("notas", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumen visual */}
        <div className="border rounded-md p-2 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-gray-900 flex justify-between">
                <span>{nuevoProveedor.nombre || 'Nuevo Proveedor'}</span>
                {parseFloat(nuevoProveedor.deuda) > 0 && (
                  <span className="text-red-600 font-bold ml-2">Deuda: ${parseFloat(nuevoProveedor.deuda).toLocaleString('es-AR')}</span>
                )}
              </div>
              <div className="text-[10px] text-gray-600">
                {nuevoProveedor.telefono || 'Sin teléfono'}
                {nuevoProveedor.productos && ` • ${nuevoProveedor.productos}`}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '7px 10px', borderRadius: 7, background: '#FEF2F2', border: '1px solid #fecaca', fontSize: 12, color: '#DC2626', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 bg-transparent text-gray-700 px-2.5 py-1.5 text-[11px] rounded-md hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-2.5 py-1.5 text-[11px] rounded-md transition-colors font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1.5"
          >
            {isEdit ? "Guardar cambios" : "Crear proveedor"}
            <kbd className="text-[8px] bg-blue-700 px-1 py-0.5 rounded">↵</kbd>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProveedorForm;