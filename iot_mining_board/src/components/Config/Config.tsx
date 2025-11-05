/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ConfigurationModule.tsx
import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Plus,
  Trash2,
  Edit3,
  Wifi,
  MapPin,
  AlertCircle,
  Database,
  Network,
  Clock,
  Shield,
  Bell,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Volume2,
  Activity
} from 'lucide-react';
import { Sensor } from '../../interfaces/Sensors';
import { SensorNode } from '../../interfaces/Nodes';
import { SensorService } from '../../services/SensorServices';
import { SensorNodeService } from '../../services/NodesServices';
import { IoTGatewayService } from '../../services/IotGatewaysServices';
import { IoTGateway } from '../../interfaces/IoTGateways';
import { MineZone } from '../../interfaces/Mines';
import { MineService } from '../../services/MinesServices';
import { useNavigate } from 'react-router-dom';
import { AlertRulesConfiguration } from './AlertRulesConfiguration';
import {  MoreVertical, Navigation, Phone } from 'lucide-react';
// Tipos TypeScript para Configuración
type SensorType = 'Temperatura' | 'Humedad' | 'PM2.5' | 'PM10' | 'CO2' | 'Presión' | 'Luminosidad' | 'Ruido';
type IconComponent = React.ComponentType<{ size?: number; className?: string }>;


interface SystemConfig {
  id: string;
  name: string;
  version: string;
  dataRetentionDays: number;
  samplingInterval: number;
  heartbeatInterval: number;
  maxConcurrentAlerts: number;
  emergencyContactEmail: string;
  emergencyContactPhone: string;
  timezone: string;
  language: string;
  autoBackup: boolean;
  backupInterval: number;
}

interface TabContentProps {
  children: React.ReactNode;
  isActive: boolean;
}

// Componente para pestañas
const TabContent: React.FC<TabContentProps> = ({ children, isActive }) => {
  if (!isActive) return null;
  return <div className="mt-6">{children}</div>;
};

// Componente para configuración de sensores con paginación
const SensorsConfiguration: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorNodes, setSensorNodes] = useState<SensorNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const sensorTypeIcons: Record<SensorType, IconComponent> = {
    'Temperatura': Thermometer,
    'Humedad': Droplets,
    'PM2.5': Wind,
    'PM10': Wind,
    'CO2': Wind,
    'Presión': Gauge,
    'Luminosidad': Eye,
    'Ruido': Volume2
  };

  useEffect(() => {
    loadSensorsData();
  }, []);

  useEffect(() => {
    // Recalcular páginas cuando cambian los sensores
    setTotalPages(Math.ceil(sensors.length / itemsPerPage));
    // Asegurarse de que la página actual sea válida
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [sensors, itemsPerPage, totalPages, currentPage]);

  const loadSensorsData = async () => {
    try {
      setLoading(true);
      const [gatewaysData, sensorNodesData] = await Promise.all([
        IoTGatewayService.getAllGateways(),
        SensorNodeService.getSensorNodes()
      ]);

      // Extraer todos los sensores de los gateways y nodos
      const allSensors: Sensor[] = [];
      gatewaysData.forEach(gateway => {
        gateway.sensor_nodes.forEach(node => {
          if (node.sensors) {
            allSensors.push(...node.sensors);
          }
        });
      });

      setSensors(allSensors);
      setSensorNodes(sensorNodesData);
    } catch (error) {
      console.error('Error loading sensors data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener sensores para la página actual
  const getCurrentPageSensors = (): Sensor[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sensors.slice(startIndex, endIndex);
  };


  const handleSaveSensor = async (sensor: Sensor): Promise<void> => {
    try {
      if (sensors.find(s => s.id === sensor.id)) {
        // Actualizar sensor existente
        await SensorService.updateSensor(sensor.id.toString(), sensor);
      } else {
        // Crear nuevo sensor
        await SensorService.createSensor(sensor);
      }
      await loadSensorsData();
      setShowForm(false);
      setEditingSensor(null);
    } catch (error) {
      console.error('Error saving sensor:', error);
    }
  };

  const handleDeleteSensor = async (id: string): Promise<void> => {
    try {
      await SensorService.deleteSensor(id);
      await loadSensorsData();
    } catch (error) {
      console.error('Error deleting sensor:', error);
    }
  };

  const SensorIcon = ({ type }: { type: string }) => {
    const IconComp = sensorTypeIcons[type as SensorType] || Activity;
    return <IconComp size={20} className="text-blue-600" />;
  };

  const getNodeName = (nodeId: string): string => {
    const node = sensorNodes.find(n => n.id === nodeId);
    return node ? `${node.id} - ${node.brand}` : nodeId;
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Generar array de páginas para mostrar
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar startPage si endPage está en el límite
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentSensors = getCurrentPageSensors();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Configuración de Sensores ({sensors.length} sensores)
        </h2>
        <button
          onClick={() => navigate("/sensores")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Agregar Sensor
        </button>
      </div>

      {/* Controles de paginación superiores */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">por página</span>
          </div>
          <span className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sensors.length)} de {sensors.length} sensores
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sensor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nodo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rango</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precisión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSensors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron sensores
                  </td>
                </tr>
              ) : (
                currentSensors.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <SensorIcon type={sensor.variable} />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{sensor.variable}</div>
                          <div className="text-sm text-gray-500">{sensor.referencia}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getNodeName(sensor.id_node)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sensor.marca}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-xs">
                        <div>{sensor.min_medicion} - {sensor.max_medicion} {sensor.unidad_medicion}</div>
                        <div className="text-gray-500">Precisión: ±{sensor.precision}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sensor.precision} {sensor.unidad_medicion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingSensor(sensor);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Editar sensor"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSensor(sensor.id.toString())}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar sensor"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación inferiores */}
        {sensors.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>

              <div className="flex items-center space-x-2">
                {/* Botón Primera Página */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  «
                </button>

                {/* Botón Página Anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  ‹
                </button>

                {/* Números de página */}
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Botón Página Siguiente */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  ›
                </button>

                {/* Botón Última Página */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                >
                  »
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Ir a página:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.max(1, Math.min(totalPages, Number(e.target.value)));
                    handlePageChange(page);
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm text-center"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para formulario de sensor */}
      {showForm && editingSensor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {sensors.find(s => s.id === editingSensor.id) ? 'Editar Sensor' : 'Agregar Sensor'}
            </h3>
            <SensorForm
              sensor={editingSensor}
              sensorNodes={sensorNodes}
              onSave={handleSaveSensor}
              onCancel={() => {
                setShowForm(false);
                setEditingSensor(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Formulario de sensor actualizado
const SensorForm: React.FC<{
  sensor: Sensor;
  sensorNodes: SensorNode[];
  onSave: (sensor: Sensor) => void;
  onCancel: () => void;
}> = ({ sensor, sensorNodes, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Sensor>(sensor);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Sensor, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nodo</label>
          <select
            value={formData.id_node}
            onChange={(e) => handleChange('id_node', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Seleccionar nodo...</option>
            {sensorNodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.id} - {node.brand}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Variable</label>
          <select
            value={formData.variable}
            onChange={(e) => handleChange('variable', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="Temperatura">Temperatura</option>
            <option value="Humedad">Humedad</option>
            <option value="PM2.5">PM2.5</option>
            <option value="PM10">PM10</option>
            <option value="CO2">CO2</option>
            <option value="Presión">Presión</option>
            <option value="Luminosidad">Luminosidad</option>
            <option value="Ruido">Ruido</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input
            type="text"
            value={formData.marca}
            onChange={(e) => handleChange('marca', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
          <input
            type="text"
            value={formData.referencia}
            onChange={(e) => handleChange('referencia', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
          <input
            type="text"
            value={formData.unidad_medicion}
            onChange={(e) => handleChange('unidad_medicion', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
          <input
            type="number"
            value={formData.min_medicion}
            onChange={(e) => handleChange('min_medicion', parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Máximo</label>
          <input
            type="number"
            value={formData.max_medicion}
            onChange={(e) => handleChange('max_medicion', parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

// Componente para configuración de gateways con datos reales
const GatewaysConfiguration: React.FC = () => {
  const [gateways, setGateways] = useState<IoTGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      setLoading(true);
      const gatewaysData = await IoTGatewayService.getAllGateways();
      setGateways(gatewaysData);
    } catch (error) {
      console.error('Error loading gateways:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSensorNodeCount = (gateway: IoTGateway): number => {
    return gateway.sensor_nodes.length;
  };

  const getTotalSensors = (gateway: IoTGateway): number => {
    return gateway.sensor_nodes.reduce((total, node) => total + (node.sensors?.length || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Configuración de Gateways ({gateways.length} gateways)
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          onClick={() => navigate("/minas")}>
          <Plus size={20} className="mr-2" />
          Agregar Gateway
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gateways.map((gateway) => (
          <div key={gateway.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Network className="text-blue-600 mr-3" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{gateway.brand}</h3>
                  <p className="text-sm text-gray-600">{gateway.description}</p>
                </div>
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Activo
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ID:</span>
                  <p className="font-medium">{gateway.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Mina:</span>
                  <p className="font-medium">{gateway.mine_zone_id || 'No asignada'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nodos:</span>
                  <p className="font-medium">{getSensorNodeCount(gateway)} nodos</p>
                </div>
                <div>
                  <span className="text-gray-600">Sensores:</span>
                  <p className="font-medium">{getTotalSensors(gateway)} total</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-600">
                  <Clock size={14} className="mr-1" />
                  Última actualización: {new Date().toLocaleString()}
                </div>
              </div>
            </div>


          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para configuración de zonas con datos reales
const ZonesConfiguration: React.FC = () => {
  const [mines, setMines] = useState<MineZone[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    loadMines();
  }, []);

  const loadMines = async () => {
    try {
      setLoading(true);
      const minesData = await MineService.getAllMines();
      setMines(minesData);
    } catch (error) {
      console.error('Error loading mines:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const getTotalGateways = (mine: MineZone): number => {
    return mine.iot_gateways?.length || 0;
  };

  const getTotalSensorNodes = (mine: MineZone): number => {
    return mine.iot_gateways?.reduce((total, gateway) =>
      total + (gateway.sensor_nodes?.length || 0), 0) || 0;
  };

  const getTotalSensors = (mine: MineZone): number => {
    return mine.iot_gateways?.reduce((totalGateways, gateway) =>
      totalGateways + (gateway.sensor_nodes?.reduce((totalNodes, node) =>
        totalNodes + (node.sensors?.length || 0), 0) || 0), 0) || 0;
  };

  const getSafetyLevel = (mine: MineZone): string => {
    const totalSensors = getTotalSensors(mine);
    const totalGateways = getTotalGateways(mine);

    if (totalGateways === 0 || totalSensors === 0) return 'baja';
    if (totalSensors >= 10 && totalGateways >= 2) return 'alta';
    if (totalSensors >= 5 && totalGateways >= 1) return 'media';
    return 'baja';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Configuración de Zonas ({mines.length} minas)
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          onClick={() => navigate("/minas")}>
          <Plus size={20} className="mr-2" />
          Agregar Zona
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mines.map((mine) => (
          <div key={mine.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
            {/* Header con información principal */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="text-blue-600 mr-3" size={20} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{mine.nombre}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${mine.estado === 'activa' ? 'bg-green-100 text-green-800' :
                      mine.estado === 'inactiva' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {mine.estado === 'activa' ? 'Activa' :
                        mine.estado === 'inactiva' ? 'Inactiva' :
                          'En Mantenimiento'}
                    </span>
                    {mine.empresa && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {mine.empresa}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <MoreVertical
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                size={18}
              />
            </div>

            {/* Información de ubicación */}
            <div className="space-y-3 mb-4">
              {mine.ubicacion && (
                <div className="flex items-start">
                  <Navigation className="text-gray-400 mr-2 mt-0.5" size={16} />
                  <span className="text-sm text-gray-600">{mine.ubicacion}</span>
                </div>
              )}

              {mine.provincia && (
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-1">Provincia:</span>
                  <span className="font-medium">{mine.provincia}</span>
                </div>
              )}
            </div>

            {/* Estadísticas de dispositivos */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Dispositivos IoT</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{getTotalGateways(mine)}</div>
                  <div className="text-xs text-gray-500">Gateways</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{getTotalSensorNodes(mine)}</div>
                  <div className="text-xs text-gray-500">Nodos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">{getTotalSensors(mine)}</div>
                  <div className="text-xs text-gray-500">Sensores</div>
                </div>
              </div>
            </div>

            {/* Información de contacto y coordenadas */}
            <div className="space-y-2 text-sm">
              {mine.contacto && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <Phone className="mr-1" size={14} />
                    Contacto:
                  </span>
                  <span className="font-medium text-blue-600">{mine.contacto}</span>
                </div>
              )}

              {mine.direccion && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dirección:</span>
                  <span className="font-medium text-right max-w-[150px] truncate" title={mine.direccion}>
                    {mine.direccion}
                  </span>
                </div>
              )}

              {(mine.latitud && mine.longitud) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Coordenadas:</span>
                  <span className="font-medium text-xs">
                    {mine.latitud}, {mine.longitud}
                  </span>
                </div>
              )}

              {/* Nivel de seguridad */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-600">Seguridad:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSafetyLevel(mine) === 'alta' ? 'bg-green-100 text-green-800' :
                  getSafetyLevel(mine) === 'media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {getSafetyLevel(mine).toUpperCase()}
                </span>
              </div>
            </div>

         
          </div>
        ))}
      </div>
    </div>
  );
};

export const ConfigurationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('sensors');
  const [systemStats, setSystemStats] = useState({
    totalSensors: 0,
    totalGateways: 0,
    totalMines: 0,
    totalNodes: 0
  });

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const [mines, gateways, sensorNodes] = await Promise.all([
        MineService.getAllMines(),
        IoTGatewayService.getAllGateways(),
        SensorNodeService.getSensorNodes()
      ]);

      // Calcular total de sensores
      const totalSensors = gateways.reduce((total, gateway) => {
        return total + gateway.sensor_nodes.reduce((nodeTotal, node) => {
          return nodeTotal + (node.sensors?.length || 0);
        }, 0);
      }, 0);

      setSystemStats({
        totalSensors,
        totalGateways: gateways.length,
        totalMines: mines.length,
        totalNodes: sensorNodes.length
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const tabs = [
    { id: 'sensors', name: 'Sensores', icon: Wifi, count: systemStats.totalSensors },
    { id: 'gateways', name: 'Gateways', icon: Network, count: systemStats.totalGateways },
    { id: 'zones', name: 'Zonas', icon: MapPin, count: systemStats.totalMines },
    { id: 'alerts', name: 'Alertas', icon: AlertCircle, count: 0 },
    { id: 'system', name: 'Sistema', icon: Settings, count: 0 }
  ];


  const SystemConfiguration: React.FC = () => {
    const [config, setConfig] = useState<SystemConfig>({
      id: '1',
      name: 'Sistema IoT Minería',
      version: '2.1.4',
      dataRetentionDays: 90,
      samplingInterval: 30,
      heartbeatInterval: 60,
      maxConcurrentAlerts: 100,
      emergencyContactEmail: 'emergencias@mina.com',
      emergencyContactPhone: '+57 300 123 4567',
      timezone: 'America/Bogota',
      language: 'es',
      autoBackup: true,
      backupInterval: 24
    });

    const handleConfigChange = (field: keyof SystemConfig, value: any): void => {
      setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = (): void => {
      // Aquí iría la lógica para guardar la configuración
      console.log('Configuración guardada:', config);
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Configuración del Sistema</h2>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
          >
            <Save size={20} className="mr-2" />
            Guardar Cambios
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración General */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="mr-2 text-blue-600" />
              Configuración General
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Sistema</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Versión</label>
                <input
                  type="text"
                  value={config.version}
                  onChange={(e) => handleConfigChange('version', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retención de Datos (días)</label>
                <input
                  type="number"
                  value={config.dataRetentionDays}
                  onChange={(e) => handleConfigChange('dataRetentionDays', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo de Muestreo (segundos)</label>
                <input
                  type="number"
                  value={config.samplingInterval}
                  onChange={(e) => handleConfigChange('samplingInterval', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Configuración de Alertas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="mr-2 text-yellow-600" />
              Configuración de Alertas
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Máximo Alertas Concurrentes</label>
                <input
                  type="number"
                  value={config.maxConcurrentAlerts}
                  onChange={(e) => handleConfigChange('maxConcurrentAlerts', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Emergencias</label>
                <input
                  type="email"
                  value={config.emergencyContactEmail}
                  onChange={(e) => handleConfigChange('emergencyContactEmail', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Emergencias</label>
                <input
                  type="tel"
                  value={config.emergencyContactPhone}
                  onChange={(e) => handleConfigChange('emergencyContactPhone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                <select
                  value={config.timezone}
                  onChange={(e) => handleConfigChange('timezone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="America/Bogota">Colombia (UTC-5)</option>
                  <option value="America/Mexico_City">México (UTC-6)</option>
                  <option value="America/Lima">Perú (UTC-5)</option>
                  <option value="America/Santiago">Chile (UTC-3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración de Respaldo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="mr-2 text-green-600" />
              Configuración de Respaldo
            </h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoBackup"
                  checked={config.autoBackup}
                  onChange={(e) => handleConfigChange('autoBackup', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoBackup" className="ml-2 text-sm text-gray-700">
                  Respaldo Automático Habilitado
                </label>
              </div>

              {config.autoBackup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo de Respaldo (horas)</label>
                  <input
                    type="number"
                    value={config.backupInterval}
                    onChange={(e) => handleConfigChange('backupInterval', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo Heartbeat (segundos)</label>
                <input
                  type="number"
                  value={config.heartbeatInterval}
                  onChange={(e) => handleConfigChange('heartbeatInterval', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="mr-2 text-purple-600" />
              Estado del Sistema
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Estado General</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Operativo
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Sensores Activos</span>
                <span className="text-sm font-medium text-gray-900">245/250</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Gateways Online</span>
                <span className="text-sm font-medium text-gray-900">5/5</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Último Respaldo</span>
                <span className="text-sm font-medium text-gray-900">Hace 2 horas</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Tiempo de Actividad</span>
                <span className="text-sm font-medium text-gray-900">15 días, 3 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };




  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="mr-3" />
              Configuración del Sistema IoT
            </h1>
            <p className="text-gray-600 mt-1">
              Sistema monitorizando {systemStats.totalSensors} sensores, {systemStats.totalGateways} gateways, y {systemStats.totalMines} minas
            </p>
          </div>
          {/*     <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={20} className="mr-2" />
              Actualizar
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors">
              <Save size={20} className="mr-2" />
              Guardar Todo
            </button>
          </div> */}
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon size={20} className="mr-2" />
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <TabContent isActive={activeTab === 'sensors'}>
        <SensorsConfiguration />
      </TabContent>

      <TabContent isActive={activeTab === 'gateways'}>
        <GatewaysConfiguration />
      </TabContent>

      <TabContent isActive={activeTab === 'zones'}>
        <ZonesConfiguration />
      </TabContent>

      <TabContent isActive={activeTab === 'alerts'}>
        <AlertRulesConfiguration />
      </TabContent>

      <TabContent isActive={activeTab === 'system'}>
        <SystemConfiguration />
      </TabContent>
    </div>
  );
};

// Los componentes AlertRulesConfiguration y SystemConfiguration se mantienen similares
// pero puedes actualizarlos de manera similar si necesitas datos reales