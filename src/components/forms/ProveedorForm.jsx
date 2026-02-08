import React from 'react';

const ProveedorForm = ({ type, selectedItem, formData, formActions, closeModal }) => {
  const { nuevoProveedor, setNuevoProveedor } = formData;
  const { agregarProveedor, editarProveedor } = formActions;

  const isEdit = type === 'editar-proveedor';

  const handleSubmit = () => {
    if (isEdit) {
      editarProveedor();
    } else {
      agregarProveedor();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        {isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
            placeholder="Proveedor SA" 
            value={nuevoProveedor.nombre}
            onChange={(e) => setNuevoProveedor({...nuevoProveedor, nombre: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
            placeholder="30-12345678-9" 
            value={nuevoProveedor.cuit}
            onChange={(e) => setNuevoProveedor({...nuevoProveedor, cuit: e.target.value})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
            placeholder="contacto@proveedor.com" 
            value={nuevoProveedor.email}
            onChange={(e) => setNuevoProveedor({...nuevoProveedor, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input 
            type="tel" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
            placeholder="351-9999999" 
            value={nuevoProveedor.telefono}
            onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <input 
          type="text" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
          placeholder="Calle 123" 
          value={nuevoProveedor.direccion}
          onChange={(e) => setNuevoProveedor({...nuevoProveedor, direccion: e.target.value})}
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <button 
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {isEdit ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
        </button>
        <button onClick={closeModal} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ProveedorForm;