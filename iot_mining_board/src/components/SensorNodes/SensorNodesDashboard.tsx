/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/SensorNodeDashboard.tsx
import { useState, useEffect } from 'react';
import { SensorNode } from '../../interfaces/Nodes';
import { SensorNodeService } from '../../services/NodesServices';
import { SensorNodeTable } from '../Tables/SensorNodesTable';
import { SensorNodeForm } from '../Forms/SensorNodeForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Activity, Radio, Plus, ArrowLeft } from 'lucide-react';
import { SensorDetailModal } from './SensorNodeDetailModa';
import { Sensor } from '../../interfaces/Sensors';

// Colores para las gráficas
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Función para generar datos de ejemplo
const generateNodeData = (sensors: Sensor[] = []) => {
    const now = new Date();
    const data = [];

    for (let i = 0; i < 24; i++) {
        const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        const entry: any = {
            hora: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: time.toISOString()
        };

        sensors.forEach((sensor) => {
            const baseValue = (sensor.min_medicion + sensor.max_medicion) / 2;
            const variation = (sensor.max_medicion - sensor.min_medicion) * 0.3;
            const value = baseValue + variation * Math.sin(i / 4) + (Math.random() * variation * 0.2 - variation * 0.1);
            entry[sensor.variable] = parseFloat(value.toFixed(2));
        });

        data.push(entry);
    }

    return data;
};

const generateSensorStats = (sensors: Sensor[] = []) => {
    return sensors.map(sensor => ({
        name: sensor.variable,
        valor: ((sensor.min_medicion + sensor.max_medicion) / 2),
        min: sensor.min_medicion,
        max: sensor.max_medicion,
        unidad: sensor.unidad_medicion
    }));
};

export const SensorNodeDashboard = () => {
    const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
    const [sensorNodes, setSensorNodes] = useState<SensorNode[]>([]);
    const [selectedSensorNode, setSelectedSensorNode] = useState<SensorNode | null>(null);
    const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
    const [nodeData, setNodeData] = useState<any[]>([]);
    const [sensorStats, setSensorStats] = useState<any[]>([]);

    const fetchSensorNodes = async (page: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await SensorNodeService.getSensorNodesPaginated(page);
            console.log(response);
            setSensorNodes(response.items);
            setTotalPages(Math.ceil(response.total / 10));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchSensorNodes(currentPage);
        }
    }, [view, currentPage]);

    useEffect(() => {
        if (selectedSensorNode?.sensors) {
            const data = generateNodeData(selectedSensorNode.sensors);
            const stats = generateSensorStats(selectedSensorNode.sensors);
            setNodeData(data);
            setSensorStats(stats);
        }
    }, [selectedSensorNode]);

    const handleCreate = () => {
        setSelectedSensorNode(null);
        setView('form');
    };

    const handleEdit = (sensorNode: SensorNode) => {
        setSelectedSensorNode(sensorNode);
        setView('form');
    };

    const handleView = (sensorNode: SensorNode) => {
        setSelectedSensorNode(sensorNode);
        setView('detail');
    };

    const handleSensorClick = (sensor: Sensor) => {
        setSelectedSensor(sensor);
        setIsSensorModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este nodo sensor?')) {
            setLoading(true);
            try {
                await SensorNodeService.deleteSensorNode(id);
                fetchSensorNodes(currentPage);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al eliminar');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleFormSuccess = () => {
        fetchSensorNodes(currentPage);
        setView('list');
    };

    const handleCloseSensorModal = () => {
        setIsSensorModalOpen(false);
        setSelectedSensor(null);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    return (
        <div className="container mx-auto px-4 py-8">

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                            Gestión de Nodos Sensores
                        </h1>
                        <p className="text-gray-600 mt-2">Sistema de monitoreo y gestión integral</p>
                    </div>
                    {view === 'list' && (
                        <button
                            onClick={handleCreate}
                            className="px-6 py-3 bg-gradient-to-r cursor-pointer from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Nuevo Nodo Sensor</span>
                        </button>
                    )}
                    {view !== 'list' && (
                        <button
                            onClick={() => setView('list')}
                            className="px-6 py-3 bg-gradient-to-r cursor-pointer from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Volver al Listado</span>
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {loading && view === 'list' ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : view === 'list' ? (
                <>
                    <SensorNodeTable
                        sensorNodes={sensorNodes}
                        onEdit={handleEdit}
                        onView={handleView}
                        onDelete={handleDelete}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            ) : view === 'form' ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
                        <h2 className="text-white font-bold text-lg">
                            {selectedSensorNode ? 'Editar Nodo Sensor' : 'Crear Nuevo Nodo Sensor'}
                        </h2>
                        <p className="text-indigo-100 text-sm">
                            {selectedSensorNode ? 'Modifique la información del nodo sensor' : 'Complete el formulario para registrar un nuevo nodo sensor'}
                        </p>
                    </div>
                    <div className="p-8">

                        <SensorNodeForm
                            initialData={selectedSensorNode || undefined}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setView('list')}
                        />
                    </div>

                </div>
            ) : view === 'detail' && selectedSensorNode ? (
                <div className="space-y-6">
                    {/* Información del Nodo */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Detalle del Nodo Sensor</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-medium text-lg text-gray-900">Información Básica</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">ID del Nodo</label>
                                        <p className="mt-1 text-sm text-gray-900 font-mono">{selectedSensorNode.id}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Marca</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedSensorNode.brand}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Descripción</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedSensorNode.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-lg text-gray-900">Información de Zona</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Categoría de Zona</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedSensorNode.zone_category || 'No especificada'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Nombre de Zona</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {selectedSensorNode.zone_name || 'No especificado'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Gateway IoT</label>
                                        <p className="mt-1 text-sm text-gray-900 font-mono">
                                            {selectedSensorNode.id_iot_gateway || 'No asignado'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficas del Nodo */}
                    {selectedSensorNode.sensors && selectedSensorNode.sensors.length > 0 && (
                        <div className="space-y-6">
                            {/* Gráfica de Líneas - Tendencias */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex items-center space-x-2 mb-4">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold">Tendencias de Sensores (Últimas 24h)</h3>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={nodeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="hora" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            {selectedSensorNode.sensors.map((sensor, index) => (
                                                <Line
                                                    key={sensor.id}
                                                    type="monotone"
                                                    dataKey={sensor.variable}
                                                    stroke={COLORS[index % COLORS.length]}
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Gráfica de Barras - Valores Promedio */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Activity className="w-5 h-5 text-green-600" />
                                        <h3 className="text-lg font-semibold">Valores Promedio</h3>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={sensorStats}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip formatter={(value) => [`${value}`, 'Valor']} />
                                                <Bar dataKey="valor" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Gráfica de Pie - Distribución */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                        <h3 className="text-lg font-semibold">Distribución de Sensores</h3>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={sensorStats}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="valor"
                                                >
                                                    {sensorStats.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sensores Asociados */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Sensores Asociados</h3>
                        {selectedSensorNode.sensors && selectedSensorNode.sensors.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedSensorNode.sensors.map((sensor) => (
                                    <div
                                        key={sensor.id}
                                        className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
                                        onClick={() => handleSensorClick(sensor)}
                                    >
                                        <div className="flex items-center space-x-2 mb-3">
                                            <div className="p-2 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors duration-200">
                                                <Radio className="w-4 h-4 text-red-600" />
                                            </div>
                                            <h5 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                                                {sensor.variable}
                                            </h5>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-700">Marca:</span>
                                                <span className="text-gray-600">{sensor.marca}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-700">Referencia:</span>
                                                <span className="text-gray-600">{sensor.referencia}</span>
                                            </div>
                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Rango:</span> {sensor.min_medicion} - {sensor.max_medicion} {sensor.unidad_medicion}
                                                </p>
                                                <p className="text-gray-600 mt-1">
                                                    <span className="font-medium">Precisión:</span> ±{sensor.precision}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                            <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700">
                                                Ver detalles
                                            </span>
                                            <svg className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No hay sensores asociados a este nodo.</p>
                        )}
                    </div>

                </div>
            ) : null}

            {/* Modal de Detalles del Sensor */}
            {selectedSensor && (
                <SensorDetailModal
                    sensor={selectedSensor}
                    isOpen={isSensorModalOpen}
                    onClose={handleCloseSensorModal}
                />
            )}
        </div>
    );
};