// interfaces/main.ts
type NodeID = string;

// Sensor básico (para datos iniciales)
type Sensor = {
  id: string;
  category: string;
  status: string
  unit: string;
  value?: number;
  timestamp: string
  alert?: {
    name: string;
    color: string;
  };
};

// Datos en tiempo real del WebSocket
export type IRealTimeSensorData = {
  id: number;
  node_id: string;
  variable: string;
  value: number;
  unit: string;
  status: string;
  timestamp: string;
  metadata: {
    brand: string;
    reference: string;
    zone_name: string;
    zone_category: string;
    mine: string;
  };
  mqtt_topic: string;
};

export interface INodeIn3D {
  id: NodeID;
  zone: {
    category: "bocamina" | "tunel" | "extraction";
    name: string;
  };
  connections: NodeID[];
  position: {
    x: number;
    y: number;
    z: number;
  };
  color: string | null;
  sensors: Sensor[];
}

export interface INodeRealTimeData {
  id: NodeID;
  sensorsData: IRealTimeSensorData[];
}

export interface MineNodes3D {
  id: string;
  mine_id: string;
  nodes: INodeIn3D[];
}

export const ZoneCategory = {
  bocamina: "Bocamina",
  tunel: "Túnel",
  extraction: "Zona de Extracción",
};


// Definir la jerarquía de status
export type SensorStatus = 'normal' | 'warning' | 'danger';

// Mapeo de status a colores
export const STATUS_COLORS: Record<SensorStatus, string> = {
  normal: '#00ff00',    // Verde
  warning: '#ffa500',   // Naranja
  danger: '#ff0000'     // Rojo
};

// Mapeo de prioridad (mayor número = más grave)
export const STATUS_PRIORITY: Record<SensorStatus, number> = {
  normal: 0,
  warning: 1,
  danger: 2
};

// Función para determinar el status más grave
export const getMostCriticalStatus = (statuses: SensorStatus[]): SensorStatus => {
  if (statuses.length === 0) return 'normal';

  return statuses.reduce((mostCritical, current) => {
    return STATUS_PRIORITY[current] > STATUS_PRIORITY[mostCritical] ? current : mostCritical;
  }, 'normal' as SensorStatus);
};

// Función para mapear status string a SensorStatus
export const normalizeStatus = (status: string): SensorStatus => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('danger') || statusLower.includes('peligro')) return 'danger';
  if (statusLower.includes('warning') || statusLower.includes('advertencia')) return 'warning';
  return 'normal';
};

// Función para mapear status a alerta visual
export const mapStatusToAlert = (status: string): { name: string; color: string } => {
  const normalizedStatus = normalizeStatus(status);
  return {
    name: normalizedStatus.toUpperCase(),
    color: STATUS_COLORS[normalizedStatus]
  };
};