/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { Sensor } from '../../interfaces/Sensors';
import { SensorService } from '../../services/SensorServices';
interface SensorChartProps {
  sensorId: string;
  initialTimeRange?: string;
}

export default function SensorChart({ sensorId, initialTimeRange = '1h' }: SensorChartProps) {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [timeRange, setTimeRange] = useState(initialTimeRange);

  // Rangos de tiempo disponibles
  const timeRanges = [
    { label: '1 hora', value: '1h' },
    { label: '6 horas', value: '6h' },
    { label: '24 horas', value: '24h' },
    { label: '7 días', value: '7d' },
    { label: '30 días', value: '30d' }
  ];

  // Función para cargar datos del sensor
  const fetchSensorData = async () => {
    if (!sensorId) return;

    setLoading(true);
    setError(null);
    
    try {
      // Obtener información del sensor usando SensorService
      const sensorInfo = await SensorService.getSensorById(sensorId);
      setSensor(sensorInfo);

      // Generar datos de ejemplo basados en la información del sensor
      generateDemoData(sensorInfo);
    } catch (err) {
      console.error('Error al cargar datos del sensor:', err);
      setError('No se pudieron cargar los datos del sensor. ' + (err instanceof Error ? err.message : 'Error desconocido'));
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Generar datos de ejemplo usando los valores del sensor como base
  const generateDemoData = (sensorInfo?: Sensor) => {
    const demoData = [];
    const now = new Date();
    const startTime = new Date(now.getTime());
    
    // Usar valores del sensor si están disponibles
    const minValue = sensorInfo?.min_medicion || 0;
    const maxValue = sensorInfo?.max_medicion || 100;
    const unit = sensorInfo?.unidad_medicion || '';

    // Determinar el intervalo basado en el rango de tiempo
    let interval = 5 * 60 * 1000; // 5 minutos en ms por defecto
    let steps = 60;
    
    switch (timeRange) {
      case '1h':
        interval = 1 * 60 * 1000;
        steps = 60;
        break;
      case '6h':
        interval = 6 * 60 * 1000;
        steps = 60;
        break;
      case '24h':
        interval = 24 * 60 * 1000;
        steps = 60;
        break;
      case '7d':
        interval = 2 * 60 * 60 * 1000;
        steps = 84;
        break;
      case '30d':
        interval = 12 * 60 * 60 * 1000;
        steps = 60;
        break;
      default:
        break;
    }
    
    startTime.setTime(now.getTime() - (interval * steps));
    
    for (let i = 0; i < steps; i++) {
      const time = new Date(startTime.getTime() + (interval * i));
      
      // Generar valores dentro del rango del sensor
      const baseValue = minValue + (maxValue - minValue) * 0.5;
      const variation = (maxValue - minValue) * 0.3;
      const value = baseValue + variation * Math.sin(i / 10) + (Math.random() * variation * 0.2 - variation * 0.1);
      
      demoData.push({
        timestamp: time.toISOString(),
        value: parseFloat(value.toFixed(2)),
        displayTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unit
      });
    }
    
    setSensorData(demoData);
  };

  // Cargar datos al montar el componente o cuando cambie el sensorId o timeRange
  useEffect(() => {
    fetchSensorData();
    
    const intervalId = setInterval(fetchSensorData, 60000);
    return () => clearInterval(intervalId);
  }, [sensorId, timeRange]);

  // Función para cambiar el rango de tiempo
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {sensor ? `Datos de ${sensor.variable || 'Sensor'}` : 'Datos del Sensor'}
        </h3>
        <div className="flex items-center gap-4">
          <select 
            className="bg-white border rounded px-2 py-1 text-sm"
            value={timeRange}
            onChange={handleTimeRangeChange}
            disabled={loading}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button 
            className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            onClick={fetchSensorData}
            disabled={loading}
            aria-label="Actualizar datos"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <RefreshCw size={32} className="text-blue-500 animate-spin" />
          </div>
        ) : sensorData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="displayTime" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                domain={['dataMin - 10', 'dataMax + 10']}
                tickFormatter={(value) => `${value} ${sensor?.unidad_medicion || ''}`}
              />
              <Tooltip 
                labelFormatter={() => new Date().toLocaleString()}
                formatter={(value) => [`${value} ${sensor?.unidad_medicion || ''}`, 'Valor']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                name={sensor?.variable || 'Lectura'} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No hay datos disponibles
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Unidad: {sensor?.unidad_medicion || 'N/A'}</p>
        <p>Rango: {sensor?.min_medicion || 'N/A'} - {sensor?.max_medicion || 'N/A'}</p>
        <p>Último dato: {sensorData.length > 0 ? new Date(sensorData[sensorData.length - 1].timestamp).toLocaleString() : 'N/A'}</p>
      </div>
    </div>
  );
}