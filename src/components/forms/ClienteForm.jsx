'use client';

import React, { useEffect, useRef } from 'react';
import { User, Phone, Mail, FileText, MapPin, Building2, CreditCard } from 'lucide-react';

const ClienteForm = ({ type, formData, formActions, closeModal }) => {
  const {
    nuevoCliente, setNuevoCliente,
    clienteRapido, setClienteRapido
  } = formData;

  const {
    agregarCliente,
    editarCliente,
    agregarClienteRapido
  } = formActions;

  // Refs para los campos
  const nombreRef = useRef(null);
  const telefonoRef = useRef(null);
  const emailRef = useRef(null);
  const cuitRef = useRef(null);
  const direccionRef = useRef(null);
  const condicionIVARef = useRef(null);

  // Determinar si es formulario rápido o normal
  const isRapido = type === 'cliente-rapido';
  const isEdit = type === 'editar-cliente';
  const clienteData = isRapido ? clienteRapido : nuevoCliente;
  const setClienteData = isRapido ? setClienteRapido : setNuevoCliente;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validar nombre
    if (!clienteData.nombre || !clienteData.nombre.trim()) {
      alert('Por favor, ingrese el nombre del cliente');
      nombreRef.current?.focus();
      return;
    }

    // Validar teléfono
    const telefono = clienteData.telefono?.trim() || '';
    if (!telefono || telefono.length < 8) {
      alert('Por favor, ingrese un número de teléfono válido (mínimo 8 dígitos)');
      telefonoRef.current?.focus();
      return;
    }

    let result;
    if (isRapido) {
      result = await agregarClienteRapido();
    } else if (type === 'nuevo-cliente') {
      result = await agregarCliente();
    } else if (type === 'editar-cliente') {
      result = await editarCliente(clienteData.id, clienteData);
    }

    if (result && result.success) {
      closeModal();
    }
  };

  const handleChange = (field, value) => {
    setClienteData(prev => ({
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
          {/* Nombre del cliente - Campo principal */}
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                ref={nombreRef}
                type="text"
                required
                className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Ej: Juan Pérez"
                value={clienteData.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, telefonoRef)}
              />
            </div>
          </div>

          {/* Teléfono */}
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
                value={clienteData.telefono || ""}
                onChange={(e) => handleChange("telefono", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, null)}
                minLength="8"
                maxLength="15"
              />
            </div>
          </div>

          {/* Campos opcionales - Solo para cliente normal */}
          {!isRapido && (
            <>
              {/* Email y CUIT */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      ref={emailRef}
                      type="email"
                      className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="cliente@email.com"
                      value={clienteData.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, cuitRef)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                    CUIT/CUIL
                  </label>
                  <div className="relative">
                    <FileText className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      ref={cuitRef}
                      type="text"
                      className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="20-12345678-9"
                      value={clienteData.cuit || ""}
                      onChange={(e) => handleChange("cuit", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, direccionRef)}
                    />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    ref={direccionRef}
                    type="text"
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                    placeholder="Av. Colón 123, Córdoba"
                    value={clienteData.direccion || ""}
                    onChange={(e) => handleChange("direccion", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, condicionIVARef)}
                  />
                </div>
              </div>

              {/* Condición IVA */}
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                  Condición IVA
                </label>
                <div className="relative">
                  <Building2 className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <select
                    ref={condicionIVARef}
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                    value={clienteData.condicionIVA || "Consumidor Final"}
                    onChange={(e) => handleChange("condicionIVA", e.target.value)}
                  >
                    <option>Consumidor Final</option>
                    <option>Responsable Inscripto</option>
                    <option>Monotributo</option>
                    <option>Exento</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Resumen visual */}
        <div className="border rounded-md p-2 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-gray-900">
                {clienteData.nombre || 'Nuevo cliente'}
              </div>
              <div className="text-[10px] text-gray-600">
                {clienteData.telefono || 'Sin teléfono'}
                {!isRapido && clienteData.email && ` • ${clienteData.email}`}
              </div>
            </div>
          </div>
          {!isRapido && clienteData.condicionIVA && (
            <div className="mt-1.5 pt-1.5 border-t border-green-200">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] text-gray-600">
                  {clienteData.condicionIVA}
                </span>
              </div>
            </div>
          )}
        </div>

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
            className="flex-1 px-2.5 py-1.5 text-[11px] rounded-md transition-colors font-medium text-white bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1.5"
          >
            {isRapido ? "Agregar rápido" : isEdit ? "Guardar cambios" : "Crear cliente"}
            <kbd className="text-[8px] bg-green-700 px-1 py-0.5 rounded">↵</kbd>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClienteForm;
