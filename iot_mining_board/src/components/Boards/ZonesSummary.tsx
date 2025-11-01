// Componente para sensores por zona
import React from 'react';
import { MapPin, Activity, CheckCircle, AlertTriangle, XCircle, Cpu } from 'lucide-react';
import { MineZone } from '../../interfaces/Mines';

interface ZonesSummaryProps {
    zones: MineZone[];
}

export const ZonesSummary: React.FC<ZonesSummaryProps> = ({ zones }) => {
    const getZoneColor = (zoneType: string): string => {
        switch (zoneType.toLowerCase()) {
            case 'tunel': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            case 'extraction': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
            case 'bocamina': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    const getZoneIcon = (zoneType: string) => {
        switch (zoneType.toLowerCase()) {
            case 'tunel': return '🚇';
            case 'extraction': return '⛏️';
            case 'bocamina': return '🏔️';
            default: return '📍';
        }
    };

    const getZoneStats = (zone: MineZone) => {
        const totalGateways = zone.iot_gateways?.length || 0;
        const totalNodes = zone.iot_gateways?.reduce((acc, gateway) =>
            acc + (gateway.sensor_nodes?.length || 0), 0) || 0;
        const totalSensors = zone.iot_gateways?.reduce((acc, gateway) =>
            gateway.sensor_nodes?.reduce((nodeAcc, node) =>
                nodeAcc + (node.sensors?.length || 0), 0) || 0, 0) || 0;

        // Simular estados basados en el ID de la zona para demo
        const hash = zone.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const online = Math.floor(totalNodes * (0.7 + (hash % 30) / 100));
        const warning = Math.floor(totalNodes * (0.1 + (hash % 15) / 100));
        const offline = totalNodes - online - warning;

        return { totalGateways, totalNodes, totalSensors, online, warning, offline };
    };

    const getTotalGateways = () => zones.reduce((acc, zone) =>
        acc + (zone.iot_gateways?.length || 0), 0);



    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <MapPin className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Resumen por Zonas</h3>
                        <p className="text-sm text-gray-500">
                            {zones.length} {zones.length === 1 ? 'zona activa' : 'zonas activas'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">{getTotalGateways()}</p>
                    <p className="text-xs text-gray-500">Gateways IoT</p>
                </div>
            </div>

          

            {/* Lista de zonas */}
            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-2">
                {zones.map((zone) => {
                    const stats = getZoneStats(zone);
                    const totalActive = stats.online + stats.warning + stats.offline;
                    const healthPercentage = totalActive > 0 ? Math.round((stats.online / totalActive) * 100) : 0;

                    return (
                        <div
                            key={zone.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getZoneIcon(zone.zone_type)}</span>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-bold text-gray-800">{zone.name}</h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getZoneColor(zone.zone_type)}`}>
                                                {zone.zone_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <Cpu className="w-3 h-3 mr-1" />
                                                {stats.totalGateways} {stats.totalGateways === 1 ? 'gateway' : 'gateways'}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <Activity className="w-3 h-3 mr-1" />
                                                {stats.totalNodes} {stats.totalNodes === 1 ? 'nodo' : 'nodos'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Información adicional de la zona */}
                            {zone.location && (
                                <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-700">
                                        <span className="font-semibold">Ubicación:</span> {zone.location}
                                    </p>
                                </div>
                            )}

                            {/* Barra de progreso de salud */}
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${healthPercentage >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                            healthPercentage >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                'bg-gradient-to-r from-red-400 to-red-600'
                                            }`}
                                        style={{ width: `${healthPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Estado de nodos */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                                    <div className="flex items-center justify-center mb-1">
                                        <CheckCircle className="text-green-500 mr-1" size={14} />
                                        <p className="text-xl font-bold text-green-700">{stats.online}</p>
                                    </div>
                                    <p className="text-xs text-green-600 font-medium">Online</p>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 text-center border border-yellow-200">
                                    <div className="flex items-center justify-center mb-1">
                                        <AlertTriangle className="text-yellow-500 mr-1" size={14} />
                                        <p className="text-xl font-bold text-yellow-700">{stats.warning}</p>
                                    </div>
                                    <p className="text-xs text-yellow-600 font-medium">Alerta</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 text-center border border-red-200">
                                    <div className="flex items-center justify-center mb-1">
                                        <XCircle className="text-red-500 mr-1" size={14} />
                                        <p className="text-xl font-bold text-red-700">{stats.offline}</p>
                                    </div>
                                    <p className="text-xs text-red-600 font-medium">Offline</p>
                                </div>
                            </div>

                            {/* Total de sensores */}
                            {stats.totalSensors > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-800">{stats.totalSensors}</span> sensores totales
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};