import { useState } from 'react';
import { Sensor } from '../../interfaces/Sensors';
import PaginationControls from '../PaginationControls';

interface SensorTableProps {
  sensors: Sensor[];
  onEdit: (sensor: Sensor) => void;
  onDelete: (id: string) => void;
  onView: (sensor: Sensor) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const SensorTable = ({ sensors, onEdit, onView, onDelete, totalPages, currentPage, onPageChange }: SensorTableProps) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Estado para la animación de eliminación
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    // Añadir un pequeño retraso para la animación
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 300);
  };

  // Determinar el color del badge basado en la variable del sensor
  const getBadgeColor = (variable: string) => {
    const variableMap: Record<string, string> = {
      'Temperatura': 'bg-red-100 text-red-800',
      'Humedad': 'bg-blue-100 text-blue-800',
      'Presión': 'bg-purple-100 text-purple-800',
      'CO2': 'bg-green-100 text-green-800',
      'Luz': 'bg-yellow-100 text-yellow-800'
    };

    return variableMap[variable] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
      {/* Header con estilo mejorado */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
        <h2 className="text-white font-bold text-lg">Sensores del Sistema</h2>
        <p className="text-indigo-100 text-sm">Monitoreo y control en tiempo real</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center">
                <div className="flex justify-center items-center space-x-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Variable</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-3 text-center">
                <div className="flex justify-center items-center space-x-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-3 text-center">
                <div className="flex justify-center items-center space-x-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Salida</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-3 text-center">
                <div className="flex justify-center items-center space-x-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Certificados</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-3 text-center">
                <div className="flex justify-center items-center space-x-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nodo</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </th>
              <th className="px-6 py-3 text-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sensors.map((sensor) => (
              <tr
                key={sensor.id}
                className={`${hoveredRow === sensor.id ? 'bg-indigo-50' : 'bg-white'} 
                 ${deletingId === sensor.id ? 'animate-pulse opacity-50' : ''}
                 transition-all duration-200`}
                onMouseEnter={() => setHoveredRow(sensor.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(sensor.variable)}`}>
                      {sensor.variable}
                    </span>
                    <div className="mt-1 text-sm text-gray-500">
                      {sensor.unidad_medicion}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-sm font-medium text-gray-900">{sensor.marca}</div>
                    <div className="mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{sensor.referencia}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mt-1">
                      <span className="bg-gray-100 px-2 py-2 rounded text-xs">{sensor.tipo_salida}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mt-1">
                      <span className="bg-gray-100 px-2 py-2 rounded text-xs">{sensor.certificados}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Nodo {sensor.id_node}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onView(sensor)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </button>
                    <button
                      onClick={() => onEdit(sensor)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sensor.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        variant="bottom"
      />
      {/* Footer informativo */}
      <div className="bg-gray-50 px-6 py-3 text-right text-xs text-gray-500">
        Total de sensores: {sensors.length} • Actualizado automáticamente
      </div>
    </div>
  );
};