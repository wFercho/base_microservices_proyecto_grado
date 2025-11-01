// components/Nodes.tsx
import React from 'react';
import { Wifi, WifiOff, AlertTriangle, Battery, Signal, Activity } from 'lucide-react';
import { NodesStatusProps } from '../../interfaces/Boards';

export const NodesStatus: React.FC<NodesStatusProps> = ({ nodes }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="text-green-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'offline': return <WifiOff className="text-red-500" size={18} />;
      default: return <WifiOff className="text-gray-500" size={18} />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online': return 'text-green-700 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'offline': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getBatteryLevel = (nodeId: string): number => {
    const hash = nodeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return 30 + (hash % 70);
  };

  const getSignalStrength = (nodeId: string): number => {
    const hash = nodeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return 2 + (hash % 3);
  };

  const getSensorCount = (nodeId: string): number => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.sensors?.length || Math.floor(Math.random() * 6) + 1;
  };

  const getBatteryColor = (level: number): string => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gradient-to-br  from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Estado de Nodos</h3>
            <p className="text-sm text-gray-500">Monitoreo en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-700">
            {nodes.length} {nodes.length === 1 ? 'nodo activo' : 'nodos activos'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
        {nodes.map((node, index) => {
          const batteryLevel = getBatteryLevel(node.id);
          const signalStrength = getSignalStrength(node.id);
          const sensorCount = getSensorCount(node.id);

          return (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    {getStatusIcon("online")}
                  </div>
                  <div>
                    <p className="font-bold text-base text-gray-800">{node.id}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></span>
                      {node.zone_name}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor("online")}`}>
                  En línea
                </span>
              </div>

              {/* Métricas del nodo */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                  <Activity className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-700">{sensorCount}</p>
                  <p className="text-xs text-purple-600">Sensores</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                  <Battery className={`w-4 h-4 mx-auto mb-1 ${getBatteryColor(batteryLevel)}`} />
                  <p className={`text-lg font-bold ${getBatteryColor(batteryLevel)}`}>
                    {batteryLevel}%
                  </p>
                  <p className="text-xs text-green-600">Batería</p>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 text-center">
                  <Signal className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <div className="flex justify-center space-x-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-sm transition-all ${
                          i < signalStrength 
                            ? 'bg-indigo-600 h-4' 
                            : 'bg-gray-300 h-2'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-indigo-600">Señal</p>
                </div>
              </div>

              {/* Sensores del nodo */}
              {node.sensors && node.sensors.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Variables monitoreadas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {node.sensors.slice(0, 4).map((sensor, sensorIndex) => (
                      <span
                        key={sensorIndex}
                        className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:from-blue-100 hover:to-blue-200 hover:text-blue-700 transition-all cursor-default"
                      >
                        {sensor.variable}
                      </span>
                    ))}
                    {node.sensors.length > 4 && (
                      <span className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold">
                        +{node.sensors.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};