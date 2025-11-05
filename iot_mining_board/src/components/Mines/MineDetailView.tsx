// components/MineDetailView.tsx
import React, { useState } from 'react';
import {
    Building,
    MapPin,
    Router,
    Edit,
    ArrowLeft,
    ChevronDown,
    ChevronRight,
    Cpu,
    Radio,
    Mail,
} from 'lucide-react';
import { IoTGateway, MineZone } from '../../interfaces/Mines';
import { SensorNode } from '../../interfaces/Nodes';
import { Sensor } from '../../interfaces/Sensors';
import { SensorDetailModal } from '../SensorNodes/SensorNodeDetailModa';

interface MineDetailViewProps {
    mine: MineZone;
    onBack: () => void;
    onEdit: () => void;
}

export const MineDetailView: React.FC<MineDetailViewProps> = ({ mine, onBack, onEdit }) => {
    const [expandedGateways, setExpandedGateways] = useState<Set<number>>(new Set());
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
    const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);

    const toggleGateway = (gatewayId: number) => {
        const newExpanded = new Set(expandedGateways);
        if (newExpanded.has(gatewayId)) {
            newExpanded.delete(gatewayId);
        } else {
            newExpanded.add(gatewayId);
        }
        setExpandedGateways(newExpanded);
    };

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const countTotalSensors = (gateway: IoTGateway): number => {
        return gateway.sensor_nodes?.reduce((total, node) => total + (node.sensors?.length ?? 0), 0) || 0;
    };

    const countTotalMineSensors = (): number => {
        return mine.iot_gateways?.reduce((total, gateway) => total + countTotalSensors(gateway), 0) || 0;
    };

    const handleSensorClick = (sensor: Sensor) => {
        setSelectedSensor(sensor);
        setIsSensorModalOpen(true);
    };

    const handleCloseSensorModal = () => {
        setIsSensorModalOpen(false);
        setSelectedSensor(null);
    };

    const getStatusColor = (status: string) => {
        const statusColors: { [key: string]: string } = {
            activa: 'bg-green-100 text-green-800',
            inactiva: 'bg-red-100 text-red-800',
            mantenimiento: 'bg-yellow-100 text-yellow-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status: string) => {
        const statusLabels: { [key: string]: string } = {
            activa: 'Activa',
            inactiva: 'Inactiva',
            mantenimiento: 'Mantenimiento'
        };
        return statusLabels[status] || status;
    };

    const GatewayCard: React.FC<{ gateway: IoTGateway }> = ({ gateway }) => {
        const isExpanded = expandedGateways.has(gateway.id);

        return (
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                <div
                    className={`p-5 flex justify-between items-center cursor-pointer transition-colors duration-200 ${
                        isExpanded ? 'bg-purple-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleGateway(gateway.id)}
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-purple-100">
                            <Router className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{gateway.brand}</h3>
                            <p className="text-sm text-gray-600 mt-1">{gateway.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Cpu className="w-3 h-3 mr-1" />
                                {gateway.sensor_nodes?.length || 0} nodos
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Radio className="w-3 h-3 mr-1" />
                                {countTotalSensors(gateway)} sensores
                            </span>
                        </div>
                        <div className={`p-2 rounded-full transition-colors duration-200 ${
                            isExpanded ? 'bg-purple-200' : 'bg-gray-100'
                        }`}>
                            {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-purple-600" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            )}
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-5">
                        <div className="space-y-3">
                            {gateway.sensor_nodes?.map((node) => (
                                <SensorNodeCard
                                    key={node.id}
                                    node={node}
                                    isExpanded={expandedNodes.has(node.id)}
                                    onToggle={() => toggleNode(node.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SensorNodeCard: React.FC<{
        node: SensorNode;
        isExpanded: boolean;
        onToggle: () => void;
    }> = ({ node, isExpanded, onToggle }) => {
        return (
            <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                <div
                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors duration-200 ${
                        isExpanded ? 'bg-orange-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={onToggle}
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-orange-100">
                            <Cpu className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">{node.id}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                {node.brand} • {node.zone_category} • {node.zone_name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Radio className="w-3 h-3 mr-1" />
                            {node.sensors?.length || 0} sensores
                        </span>
                        <div className={`p-2 rounded-full transition-colors duration-200 ${
                            isExpanded ? 'bg-orange-200' : 'bg-gray-100'
                        }`}>
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-orange-600" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(node.sensors || []).map((sensor) => (
                                <SensorCard key={sensor.id} sensor={sensor} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SensorCard: React.FC<{ sensor: Sensor }> = ({ sensor }) => {
        return (
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
        );
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Volver al listado</span>
                </button>
                <button
                    onClick={onEdit}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                    <Edit className="w-4 h-4" />
                    <span className="font-medium">Editar Mina</span>
                </button>
            </div>

            {/* Información de la Mina */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-full bg-white bg-opacity-20">
                            <Building className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{mine.nombre}</h1>
                            <p className="text-indigo-100 text-sm mt-1">Información detallada de la zona minera</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full mr-3"></div>
                                    Información General
                                </h3>
                                <div className="space-y-4 bg-gray-50 rounded-lg p-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                                        <p className="text-gray-900">{mine.direccion || 'Sin dirección especificada'}</p>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Ubicación</label>
                                            <p className="text-gray-900">{mine.ubicacion || 'N/A'}</p>
                                            {mine.latitud && mine.longitud && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Coordenadas: {mine.latitud}, {mine.longitud}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Provincia</label>
                                            <p className="text-gray-900 font-semibold">{mine.provincia || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(mine.estado)}`}>
                                                {getStatusLabel(mine.estado)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
                                    Información de Contacto
                                </h3>
                                <div className="space-y-4 bg-gray-50 rounded-lg p-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Empresa</label>
                                        <p className="text-gray-900 font-semibold text-lg">{mine.empresa || 'No especificada'}</p>
                                    </div>
                                    {mine.contacto && (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 rounded-full bg-green-100">
                                                    <Mail className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">Contacto</label>
                                                    <p className="text-gray-900">{mine.contacto}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-gray-200">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Resumen de Dispositivos</label>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="text-2xl font-bold text-purple-600">{mine.iot_gateways?.length || 0}</div>
                                                <div className="text-xs text-gray-600">Gateways</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {mine.iot_gateways?.reduce((total, gw) => total + (gw.sensor_nodes?.length || 0), 0) || 0}
                                                </div>
                                                <div className="text-xs text-gray-600">Nodos</div>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                <div className="text-2xl font-bold text-green-600">{countTotalMineSensors()}</div>
                                                <div className="text-xs text-gray-600">Sensores</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dispositivos IoT */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-white bg-opacity-20">
                                <Router className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Dispositivos IoT</h2>
                                <p className="text-purple-100 text-sm">
                                    {mine.iot_gateways?.length || 0} gateways • {countTotalMineSensors()} sensores totales
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {mine.iot_gateways && mine.iot_gateways.length > 0 ? (
                            mine.iot_gateways.map((gateway) => (
                                <GatewayCard key={gateway.id} gateway={gateway} />
                            ))
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-lg">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                                    <Router className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium">No hay gateways asociados a esta mina</p>
                                <p className="text-gray-500 text-sm mt-2">Agregue dispositivos IoT para comenzar el monitoreo</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SensorDetailModal
                sensor={selectedSensor!}
                isOpen={isSensorModalOpen}
                onClose={handleCloseSensorModal}
            />
        </div>
    );
};