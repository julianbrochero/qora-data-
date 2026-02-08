import React from 'react';

const DetalleCierreForm = ({ selectedItem, closeModal }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Detalles del Cierre - {selectedItem.fecha}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Ingresos</p>
          <p className="text-2xl font-bold text-green-600">+${selectedItem.ingresos.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Egresos</p>
          <p className="text-2xl font-bold text-red-600">-${selectedItem.egresos.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Movimientos del Día ({selectedItem.movimientos})</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {selectedItem.detalles.map(mov => (
            <div key={mov.id} className={`flex justify-between items-center p-2 rounded ${mov.tipo === 'ingreso' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div>
                <p className="font-medium text-sm">{mov.descripcion}</p>
                <p className="text-xs text-gray-600">{mov.fecha} - {mov.metodo}</p>
              </div>
              <p className={`font-semibold ${mov.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                {mov.tipo === 'ingreso' ? '+' : '-'}${mov.monto.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button onClick={closeModal} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DetalleCierreForm;