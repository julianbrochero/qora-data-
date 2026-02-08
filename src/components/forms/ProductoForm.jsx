'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Package, Hash, DollarSign, Box, Tag, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

const ProductoForm = ({ type, selectedItem, formData, formActions, closeModal }) => {
  const {
    nuevoProducto, setNuevoProducto,
    productoRapido, setProductoRapido
  } = formData;

  const { agregarProducto, editarProducto, agregarProductoRapido } = formActions;

  const isEdit = type === 'editar-producto';
  const isRapido = type === 'producto-rapido';

  const nombreRef = useRef(null);
  const precioRef = useRef(null);
  const stockRef = useRef(null);
  const codigoRef = useRef(null);
  const categoriaRef = useRef(null);

  const handleChange = (campo, valor) => {
    if (isRapido) {
      setProductoRapido({ ...productoRapido, [campo]: valor });
    } else {
      setNuevoProducto({ ...nuevoProducto, [campo]: valor });
    }
  };

  const data = isRapido ? productoRapido : nuevoProducto;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validaciones básicas
    if (!data.nombre || !data.nombre.trim()) {
      alert('El nombre del producto es requerido');
      nombreRef.current?.focus();
      return;
    }

    const precio = parseFloat(data.precio) || 0;
    if (precio <= 0) {
      alert('El precio debe ser mayor a 0');
      precioRef.current?.focus();
      return;
    }

    // Validar stock si controla stock
    if (!isRapido && data.controlaStock) {
      const stock = parseInt(data.stock) || 0;
      if (stock < 0) {
        alert('El stock no puede ser negativo');
        stockRef.current?.focus();
        return;
      }
    }

    let result;
    if (isRapido) {
      result = await agregarProductoRapido();
    } else if (isEdit) {
      result = await editarProducto(selectedItem?.id, data);
    } else {
      result = await agregarProducto();
    }

    if (result && result.success) {
      closeModal();
    }
  };

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

  useEffect(() => {
    if (!isRapido && !data.controlaStock && data.stock !== 0) {
      handleChange('stock', 0);
    }
  }, [data.controlaStock, isRapido]);

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
          {/* Nombre del producto - Campo principal */}
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Nombre del producto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                ref={nombreRef}
                type="text"
                required
                className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="Ej: Campera de cuero"
                value={data.nombre || ""}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, precioRef)}
              />
            </div>
          </div>

          {/* Código y Categoría */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Código</label>
              <div className="relative">
                <Hash className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  ref={codigoRef}
                  type="text"
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="AUTO"
                  value={data.codigo || ""}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, categoriaRef)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Categoría</label>
              <div className="relative">
                <Tag className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <select
                  ref={categoriaRef}
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
                  value={data.categoria || ""}
                  onChange={(e) => handleChange("categoria", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, precioRef)}
                >
                  <option value="">Seleccionar</option>
                  <option>General</option>
                  <option>Categoría 1</option>
                  <option>Categoría 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Precio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  ref={precioRef}
                  type="number"
                  required
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="0.00"
                  value={data.precio || ""}
                  onChange={(e) => handleChange("precio", e.target.value === "" ? "" : Number.parseFloat(e.target.value) || 0)}
                  onKeyDown={(e) => handleKeyDown(e, null)}
                  step="0.01"
                  min="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Stock inicial
              </label>
              <div className="relative">
                <Box className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  ref={stockRef}
                  type="number"
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="0"
                  value={data.stock ?? 0}
                  onChange={(e) => handleChange("stock", e.target.value === "" ? "" : Number.parseInt(e.target.value) || 0)}
                  min="0"
                  disabled={!isRapido && !data.controlaStock}
                />
              </div>
            </div>
          </div>

          {/* Control de Inventario - Solo para producto normal */}
          {!isRapido && (
            <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {data.controlaStock ? (
                    <ToggleRight className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <label
                      htmlFor="controlaStock"
                      className="text-[11px] font-medium text-gray-700 cursor-pointer block"
                    >
                      Control de inventario
                    </label>
                    <p className="text-[9px] text-gray-500">
                      {data.controlaStock ? 'El stock se descontará en cada venta' : 'Stock ilimitado, no se descontará'}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="controlaStock"
                  checked={data.controlaStock === true}
                  onChange={(e) => handleChange("controlaStock", e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Descripción - Solo para producto normal */}
          {!isRapido && (
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Descripción (opcional)
              </label>
              <div className="relative">
                <FileText className="w-3 h-3 text-gray-400 absolute left-2 top-2" />
                <textarea
                  className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                  rows="2"
                  placeholder="Información adicional del producto..."
                  value={data.descripcion || ""}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Resumen visual */}
        {!isRapido && (
          <div className="border rounded-md p-2 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-gray-600">Precio de venta:</span>
              <span className="text-sm font-bold text-blue-700">
                ${(parseFloat(data.precio) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {data.controlaStock && (
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-blue-200">
                <span className="text-[10px] text-gray-600">Stock disponible:</span>
                <span className="text-[11px] font-semibold text-gray-900">
                  {parseInt(data.stock) || 0} unidades
                </span>
              </div>
            )}
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
            {isRapido ? "Agregar rápido" : isEdit ? "Guardar cambios" : "Crear producto"}
            <kbd className="text-[8px] bg-blue-700 px-1 py-0.5 rounded">↵</kbd>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductoForm;