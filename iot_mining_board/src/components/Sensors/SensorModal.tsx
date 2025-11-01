/* eslint-disable @typescript-eslint/no-explicit-any */
// components/SensorModal.tsx
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorData } from '../../interfaces/Sensors';

interface SensorModalProps {
  sensor: SensorData | null;
  onClose: () => void;
}

const generateHistoricalData = (sensor: SensorData) => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString(),
      value: sensor.value * (0.9 + Math.random() * 0.2), // Variación aleatoria
      unit: sensor.unit
    });
  }
  
  return data;
};

export const SensorModal = ({ sensor, onClose }: SensorModalProps) => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (sensor) {
      setHistoricalData(generateHistoricalData(sensor));
    }
  }, [sensor]);

  // Cerrar modal al hacer clic fuera
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Cerrar modal con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  if (!sensor) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      default:
        return 'bg-red-100 text-red-800 border border-red-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-black px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-1">
                {sensor.node_id}
              </h2>
              <p className="text-blue-100 text-sm">
                Sensor {sensor.type} - {sensor.manufacturer}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-red-200 hover:bg-white/10 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Current Value Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-indigo-100">
            <div className="text-center">
              <p className="text-sm font-medium text-indigo-600 mb-2">Valor Actual</p>
              <div className="text-4xl font-bold text-indigo-800 mb-2">
                {sensor.value.toFixed(2)}
                <span className="text-lg text-indigo-600 ml-2">{sensor.unit}</span>
              </div>
              <div className="flex justify-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sensor.status)}`}>
                  {sensor.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Basic Information */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Información Básica
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Tipo:</span>
                    <span className="text-gray-900 font-semibold">{sensor.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Fabricante:</span>
                    <span className="text-gray-900">{sensor.manufacturer}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Modelo:</span>
                    <span className="text-gray-900">{sensor.model}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Instalación:</span>
                    <span className="text-gray-900">{sensor.installation}</span>
                  </div>
                </div>
              </div>

              {/* Metadata Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Especificaciones
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Precisión:</span>
                    <span className="text-gray-900">{sensor.metadata.accuracy}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Frecuencia:</span>
                    <span className="text-gray-900">{sensor.metadata.sampling_rate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Calibración:</span>
                    <span className="text-gray-900">{sensor.metadata.calibration_date}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Historical Data Chart */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Histórico (Últimos 30 días)
                </h3>
                <div className="h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        stroke="#cbd5e1"
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        stroke="#cbd5e1"
                        label={{ value: sensor.unit, angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#4f46e5' }}
                        name={`Valor (${sensor.unit})`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};