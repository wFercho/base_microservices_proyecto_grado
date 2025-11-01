import { Cpu, MapPin, Calendar, Edit, X, Server, Radio, Activity, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { IoTGateway } from '../../interfaces/IoTGateways';
import { SensorDetailModal } from '../SensorNodes/SensorNodeDetailModa';
import { Sensor } from '../../interfaces/Sensors';

interface IoTGatewayDetailModalProps {
  gateway: IoTGateway;
  onClose: () => void;
  onEdit: () => void;
}

export const IoTGatewayDetailModal = ({ gateway, onClose, onEdit }: IoTGatewayDetailModalProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const totalSensors = gateway.sensor_nodes.reduce((total, node) =>
    total + (node.sensors?.length || 0), 0
  );

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };


  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      'Temperatura': 'bg-red-100 text-red-700 border-red-200',
      'Presión': 'bg-blue-100 text-blue-700 border-blue-200',
      'Vibración': 'bg-purple-100 text-purple-700 border-purple-200',
      'Humedad': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Gas': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleSensorClick = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setIsSensorModalOpen(true);
  };

  const handleCloseSensorModal = () => {
    setIsSensorModalOpen(false);
    setSelectedSensor(null);
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <Server className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">Gateway #{gateway.id}</h2>
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    Activo
                  </span>
                </div>
                <p className="text-purple-100 text-lg">{gateway.brand}</p>
                <p className="text-purple-200 text-sm mt-1">{gateway.description || 'Sin descripción'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-200 shadow-lg"
              >
                <Edit className="w-4 h-4" />
                <span className="font-medium">Editar</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] bg-gradient-to-br from-gray-50 to-purple-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-purple-100">
                  <Cpu className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Nodos Conectados</p>
                  <p className="text-2xl font-bold text-gray-900">{gateway.sensor_nodes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Radio className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sensores</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSensors}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-green-100">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Información Básica */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Información del Gateway</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">ID del Gateway</span>
                  <span className="font-mono font-bold text-purple-600">#{gateway.id}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">Marca</span>
                  <span className="font-semibold text-gray-900">{gateway.brand}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600 block mb-2">Descripción</span>
                  <p className="text-gray-900">{gateway.description || 'Sin descripción'}</p>
                </div>
              </div>
            </div>

            {/* Información de Ubicación y Metadatos */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Ubicación</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">ID Mina/Zona</span>
                    <span className="font-mono font-semibold text-blue-600">{gateway.mine_zone_id || 'No asignado'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Metadatos</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600 block mb-1">Creado</span>
                    <p className="text-gray-900 text-sm">{gateway.created_at ? new Date(gateway.created_at).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600 block mb-1">Última actualización</span>
                    <p className="text-gray-900 text-sm">{gateway.updated_at ? new Date(gateway.updated_at).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nodos Sensores con diseño accordion */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Nodos Sensores Asociados</h3>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-xl font-semibold text-sm">
                {gateway.sensor_nodes.length} nodos activos
              </span>
            </div>

            {gateway.sensor_nodes.length > 0 ? (
              <div className="space-y-4">
                {gateway.sensor_nodes.map((node) => {
                  const isExpanded = expandedNodes.has(node.id);
                  return (
                    <div key={node.id} className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 transition-all duration-200">
                      <div
                        className={`p-5 cursor-pointer transition-all duration-200 ${isExpanded
                          ? 'bg-gradient-to-r from-purple-50 to-blue-50'
                          : 'bg-white hover:bg-gray-50'
                          }`}
                        onClick={() => toggleNode(node.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`p-3 rounded-xl ${isExpanded ? 'bg-purple-100' : 'bg-gray-100'}`}>
                              <Cpu className={`w-6 h-6 ${isExpanded ? 'text-purple-600' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-bold text-gray-900 text-lg">{node.brand}</h4>
                                {node.zone_category && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(node.zone_category)}`}>
                                    {node.zone_category}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{node.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <span className="font-medium mr-1">ID:</span>
                                  <span className="font-mono">{node.id}</span>
                                </span>
                                {node.zone_name && (
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {node.zone_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-blue-100 text-blue-800">
                              <Radio className="w-4 h-4 mr-2" />
                              {node.sensors?.length || 0} sensores
                            </span>
                            <div className={`p-2 rounded-lg transition-all duration-200 ${isExpanded ? 'bg-purple-200 rotate-180' : 'bg-gray-200'
                              }`}>
                              <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-purple-600' : 'text-gray-600'}`} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t-2 border-gray-200 bg-white p-6">
                          {node.sensors && node.sensors.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {node.sensors.map((sensor) => (
                                <div
                                  key={sensor.id}
                                  className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg hover:border-purple-300 transition-all duration-200 group cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 group-hover:from-red-200 group-hover:to-orange-200 transition-all duration-200">
                                        <Radio className="w-4 h-4 text-red-600" />
                                      </div>
                                      <h5 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                                        {sensor.variable}
                                      </h5>
                                    </div>
                                    <span className="text-xs font-mono text-gray-500">#{sensor.id}</span>
                                  </div>

                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                      <span className="font-medium text-gray-600">Marca:</span>
                                      <span className="text-gray-900">{sensor.marca}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                      <span className="font-medium text-gray-600">Ref:</span>
                                      <span className="text-gray-900 font-mono">{sensor.referencia}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200">
                                      <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-600">Rango:</span>
                                        <span className="text-gray-900">{sensor.min_medicion} - {sensor.max_medicion} {sensor.unidad_medicion}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-gray-600">Precisión:</span>
                                        <span className="text-gray-900">±{sensor.precision}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div onClick={() => handleSensorClick(sensor)}
                                    className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                    <span className="text-xs font-medium text-purple-600 group-hover:text-purple-700"
                                    >
                                      Ver detalles completos
                                    </span>
                                    <svg className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Radio className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="font-medium">No hay sensores asociados a este nodo</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 mb-4">
                  <Cpu className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium text-lg">No hay nodos sensores asociados</p>
                <p className="text-gray-500 text-sm mt-2">Agregue nodos sensores para comenzar el monitoreo</p>
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