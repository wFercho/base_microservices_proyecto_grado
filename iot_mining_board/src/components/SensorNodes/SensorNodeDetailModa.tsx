/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Modals/SensorDetailModal.tsx
import { useState, useEffect } from 'react';
import { X, BarChart3, Gauge, Activity, Cpu, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sensor } from '../../interfaces/Sensors';

interface SensorDetailModalProps {
    sensor: Sensor;
    isOpen: boolean;
    onClose: () => void;
}


// Generar datos de ejemplo para el sensor
const generateSensorData = (sensor: Sensor) => {
    const now = new Date();
    const data = [];

    for (let i = 0; i < 24; i++) {
        const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        const baseValue = (sensor.min_medicion + sensor.max_medicion) / 2;
        const variation = (sensor.max_medicion - sensor.min_medicion) * 0.3;
        const value = baseValue + variation * Math.sin(i / 4) + (Math.random() * variation * 0.2 - variation * 0.1);

        data.push({
            hora: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: time.toISOString(),
            valor: parseFloat(value.toFixed(2)),
            min: sensor.min_medicion,
            max: sensor.max_medicion
        });
    }

    return data;
};

export const SensorDetailModal = ({ sensor, isOpen, onClose }: SensorDetailModalProps) => {
    const [activeTab, setActiveTab] = useState<'info' | 'charts' | 'specs'>('info');
    const [sensorData, setSensorData] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            const data = generateSensorData(sensor);
            setSensorData(data);
        }
    }, [isOpen, sensor]);

    if (!isOpen) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCurrentValue = () => {
        if (sensorData.length === 0) return 0;
        return sensorData[sensorData.length - 1].valor;
    };

    const getStatusColor = (value: number) => {
        const range = sensor.max_medicion - sensor.min_medicion;
        const normalized = (value - sensor.min_medicion) / range;

        if (normalized < 0.3) return 'text-green-600';
        if (normalized < 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
                <div className="flex items-center space-x-3">
                    <Gauge className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{sensor.variable}</h2>
                        <p className="text-gray-600">{sensor.marca} - {sensor.referencia}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex space-x-8 px-6">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'info'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4" />
                            <span>Información</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('charts')}
                        className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'charts'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4" />
                            <span>Gráficas</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('specs')}
                        className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'specs'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center space-x-2">
                            <Cpu className="w-4 h-4" />
                            <span>Especificaciones</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {activeTab === 'info' && (
                    <div className="space-y-6">
                        {/* Valor Actual */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold">Valor Actual</h3>
                                    <p className="text-sm opacity-90">Lectura en tiempo real</p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-3xl font-bold ${getStatusColor(getCurrentValue())}`}>
                                        {getCurrentValue()} {sensor.unidad_medicion}
                                    </div>
                                    <p className="text-sm opacity-90">
                                        Rango: {sensor.min_medicion} - {sensor.max_medicion} {sensor.unidad_medicion}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información Básica */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Variable</label>
                                        <p className="mt-1 text-gray-900 font-medium">{sensor.variable}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Marca</label>
                                        <p className="mt-1 text-gray-900">{sensor.marca}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Referencia</label>
                                        <p className="mt-1 text-gray-900">{sensor.referencia}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Unidad</label>
                                        <p className="mt-1 text-gray-900">{sensor.unidad_medicion}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rango y Precisión */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Mediciones</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Rango de Medición</label>
                                        <p className="mt-1 text-gray-900">
                                            {sensor.min_medicion} - {sensor.max_medicion} {sensor.unidad_medicion}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Precisión</label>
                                        <p className="mt-1 text-gray-900">±{sensor.precision} {sensor.unidad_medicion}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Resolución</label>
                                        <p className="mt-1 text-gray-900">{sensor.resolucion || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'charts' && (
                    <div className="space-y-6">
                        {/* Gráfica de Líneas - Tendencias */}
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Tendencias (Últimas 24h)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sensorData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hora" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`${value} ${sensor.unidad_medicion}`, 'Valor']}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="valor"
                                            stroke="#0088FE"
                                            strokeWidth={2}
                                            dot={false}
                                            name={sensor.variable}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="min"
                                            stroke="#00C49F"
                                            strokeWidth={1}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="Mínimo"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="max"
                                            stroke="#FF8042"
                                            strokeWidth={1}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="Máximo"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfica de Barras - Distribución horaria */}
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Distribución por Hora</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sensorData.slice(-12)}> {/* Últimas 12 horas */}
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hora" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`${value} ${sensor.unidad_medicion}`, 'Valor']} />
                                        <Bar dataKey="valor" fill="#8884d8" name={sensor.variable} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'specs' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Especificaciones Técnicas */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Especificaciones Técnicas</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Tiempo de Respuesta</label>
                                        <p className="mt-1 text-gray-900">
                                            {sensor.tiempo_respuesta_valor} {sensor.tiempo_respuesta_unidad || 's'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Tipo de Salida</label>
                                        <p className="mt-1 text-gray-900">{sensor.tipo_salida || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Modo de Instalación</label>
                                        <p className="mt-1 text-gray-900">{sensor.modo_instalacion || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Certificados</label>
                                        <p className="mt-1 text-gray-900">{sensor.certificados || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Condiciones Operativas */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Condiciones Operativas</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Rango de Temperatura</label>
                                        <p className="mt-1 text-gray-900">
                                            {sensor.temperatura_min || 'N/A'}°C - {sensor.temperatura_max || 'N/A'}°C
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Voltaje</label>
                                        <p className="mt-1 text-gray-900">
                                            {sensor.voltaje_min || 'N/A'} - {sensor.voltaje_max || 'N/A'} V {sensor.voltaje_tipo || ''}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Corriente</label>
                                        <p className="mt-1 text-gray-900">
                                            {sensor.corriente_min || 'N/A'} - {sensor.corriente_max || 'N/A'} A
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Durabilidad</label>
                                        <p className="mt-1 text-gray-900">
                                            {sensor.durabilidad_valor || 'N/A'} {sensor.durabilidad_unidad || ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadatos */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>Metadatos</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Creado</label>
                                    <p className="mt-1 text-gray-900">{formatDate(sensor.created_at)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Actualizado</label>
                                    <p className="mt-1 text-gray-900">{formatDate(sensor.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};