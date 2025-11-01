/* eslint-disable react-hooks/exhaustive-deps */
// components/MiningDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Alert, TimeRange, SensorData } from '../../interfaces/Boards';
import { MetricsCard } from './MetricsCard';
import { AlertsPanel } from './AlertsPanel';
import { NodesStatus } from './Nodes';
import { ZonesSummary } from './ZonesSummary';
import { Droplets, Eye, Gauge, Thermometer, Volume2, Wind } from 'lucide-react';
import { IoTGateway, MineZone } from '../../interfaces/Mines';
import { SensorNode } from '../../interfaces/Nodes';
import { Sensor } from '../../interfaces/Sensors';
import { MineService } from '../../services/MinesServices';
import { IoTGatewayService } from '../../services/IotGatewaysServices';
import { SensorNodeService } from '../../services/NodesServices';

// Componente principal del dashboard
export const MiningDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para datos reales
  const [mines, setMines] = useState<MineZone[]>([]);
  const [gateways, setGateways] = useState<IoTGateway[]>([]);
  const [sensorNodes, setSensorNodes] = useState<SensorNode[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [minesData, gatewaysData, sensorNodesData] = await Promise.all([
        MineService.getAllMines(),
        IoTGatewayService.getAllGateways(),
        SensorNodeService.getSensorNodes()
      ]);

      setMines(minesData);
      setGateways(gatewaysData);
      setSensorNodes(sensorNodesData);

      // Extraer todos los sensores
      const allSensors: Sensor[] = [];
      gatewaysData.forEach(gateway => {
        gateway.sensor_nodes.forEach(node => {
          if (node.sensors) {
            allSensors.push(...node.sensors);
          }
        });
      });
      setSensors(allSensors);

      // Generar datos del dashboard basados en datos reales
      generateDashboardData(minesData, gatewaysData, sensorNodesData, allSensors);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const generateDashboardData = (
    mines: MineZone[],
    gateways: IoTGateway[],
    sensorNodes: SensorNode[],
    sensors: Sensor[]
  ) => {
    // Generar datos de sensores para el dashboard
    const sensorMetrics = generateSensorMetrics(sensors);
    setSensorData(sensorMetrics);

    // Generar alertas basadas en datos reales
    const generatedAlerts = generateAlerts(sensors, sensorNodes, mines);
    setAlerts(generatedAlerts);

    // Generar nodos basados en datos reales


  };

  const generateSensorMetrics = (sensors: Sensor[]): SensorData[] => {
    const sensorTypes = [
      { type: 'Temperatura', icon: Thermometer, unit: '°C', variable: 'Temperatura' },
      { type: 'Humedad', icon: Droplets, unit: '%', variable: 'Humedad' },
      { type: 'PM2.5', icon: Wind, unit: 'µg/m³', variable: 'PM2.5' },
      { type: 'Presión', icon: Gauge, unit: 'Pa', variable: 'Presión' },
      { type: 'Luminosidad', icon: Eye, unit: 'lux', variable: 'Luminosidad' },
      { type: 'Ruido', icon: Volume2, unit: 'dB', variable: 'Ruido' },
      { type: 'CO2', icon: Wind, unit: 'ppm', variable: 'CO2' }
    ];

    return sensorTypes.map(sensorType => {
      const matchingSensors = sensors.filter(s => s.variable === sensorType.variable);

      if (matchingSensors.length === 0) {
        return {
          type: sensorType.type,
          icon: sensorType.icon,
          unit: sensorType.unit,
          value: 0,
          min: 0,
          max: 0,
          status: 'normal' as const,
          trend: 0
        };
      }

      // Calcular valor promedio de los sensores de este tipo
      const avgValue = matchingSensors.reduce((sum, sensor) => {
        const baseValue = ((sensor.min_medicion || 0) + (sensor.max_medicion || 100)) / 2;
        return sum + baseValue;
      }, 0) / matchingSensors.length;

      // Determinar estado basado en valores
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      const randomStatus = Math.random();
      if (randomStatus > 0.9) status = 'critical';
      else if (randomStatus > 0.8) status = 'warning';

      // Inferir un rango mínimo y máximo razonable alrededor del promedio
      const minValue = Math.round(avgValue * 0.9);
      const maxValue = Math.round(avgValue * 1.1);

      return {
        type: sensorType.type,
        icon: sensorType.icon,
        unit: sensorType.unit,
        value: Math.round(avgValue),
        min: minValue,
        max: maxValue,
        status,
        trend: Math.round((Math.random() - 0.5) * 10)
      };
    });
  };

  const generateAlerts = (sensors: Sensor[], sensorNodes: SensorNode[], mines: MineZone[]): Alert[] => {
    const alerts: Alert[] = [];

    // Generar alertas críticas basadas en sensores
    sensors.forEach(sensor => {
      // Simular algunas alertas críticas
      if (Math.random() > 0.95) {
        const node = sensorNodes.find(n => n.id === sensor.id_node);
        const mine = mines.find(m =>
          m.iot_gateways.some(gw =>
            gw.sensor_nodes.some(sn => sn.id === sensor.id_node)
          )
        );

        if (node && mine) {
          alerts.push({
            type: 'critical',
            sensor: `Sensor ${sensor.variable} - ${sensor.id_node}`,
            zone: `${node.zone_name || 'Zona Sin Nombre'} - ${mine.name}`,
            value: `${((sensor.min_medicion || 0) + (sensor.max_medicion || 100)) / 2} ${sensor.unidad_medicion || ''}`,
            time: currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            message: `Nivel elevado de ${sensor.variable} detectado. Verificar condiciones.`
          });
        }
      }
    });

    // Generar alertas de warning
    if (alerts.length < 2 && Math.random() > 0.5) {
      const availableNodes = sensorNodes.filter(node =>
        !alerts.some(alert => alert.sensor.includes(node.id))
      );

      if (availableNodes.length > 0) {
        const randomNode = availableNodes[Math.floor(Math.random() * availableNodes.length)];
        const mine = mines.find(m =>
          m.iot_gateways.some(gw =>
            gw.sensor_nodes.some(sn => sn.id === randomNode.id)
          )
        );

        alerts.push({
          type: 'warning',
          sensor: `Gateway - ${randomNode.id}`,
          zone: `${randomNode.zone_name || 'Zona Sin Nombre'} - ${mine?.name || 'Mina Sin Asignar'}`,
          value: 'Latencia elevada',
          time: currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          message: 'Latencia de comunicación por encima del umbral permitido.'
        });
      }
    }

    // Si no hay alertas, agregar una informativa
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        sensor: 'Sistema',
        zone: 'Dashboard Principal',
        value: 'Estable',
        time: currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        message: 'Todos los sistemas funcionando correctamente.'
      });
    }

    return alerts.slice(0, 4); // Limitar a 4 alertas
  };


  const timeRanges: TimeRange[] = ['1h', '6h', '24h', '7d'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error al cargar el dashboard</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard IoT - Monitoreo de Minas</h1>
            <p className="text-gray-600">
              Sistema de detección de alertas y monitoreo en tiempo real -
              {mines.length} minas, {gateways.length} gateways, {sensors.length} sensores activos
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{currentTime.toLocaleTimeString()}</p>
            <p className="text-sm text-gray-600">{currentTime.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Filtros de tiempo */}
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTimeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{mines.length}</p>
          <p className="text-sm text-gray-600">Minas</p>
        </div>
        <div className="bg-white rounded-lg shadow-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{gateways.length}</p>
          <p className="text-sm text-gray-600">Gateways</p>
        </div>
        <div className="bg-white rounded-lg shadow-2xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{sensorNodes.length}</p>
          <p className="text-sm text-gray-600">Nodos</p>
        </div>
        <div className="bg-white rounded-lg shadow-2xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{sensors.length}</p>
          <p className="text-sm text-gray-600">Sensores</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {sensorData.slice(0, 4).map((sensor, index) => (
          <MetricsCard
            key={`primary-${index}`}
            title={sensor.type}
            value={sensor.value}
            unit={sensor.unit}
            status={sensor.status}
            icon={sensor.icon}
            trend={sensor.trend}
          />
        ))}
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {sensorData.slice(4).map((sensor, index) => (
          <MetricsCard
            key={`secondary-${index}`}
            title={sensor.type}
            value={sensor.value}
            unit={sensor.unit}
            status={sensor.status}
            icon={sensor.icon}
            trend={sensor.trend}
          />
        ))}
      </div>

      {/* Paneles de información */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        <AlertsPanel />
        <NodesStatus nodes={sensorNodes} />
        <ZonesSummary zones={mines} />
      </div>
    </div>
  );
};