import { SensorNode } from "./Nodes";

// interfaces/Mines.ts
export interface IoTGateway {
  id: number;
  brand: string;
  description?: string;
  mine_zone_id: string;
  sensor_nodes: SensorNode[];
}

export interface MineZone {
  id: string;
  nombre: string;
  ubicacion?: string;
  provincia?: string;
  latitud?: string;
  longitud?: string;
  direccion?: string;
  empresa?: string;
  contacto?: string;
  estado: string;  // Nuevo campo: 'activa', 'inactiva', 'mantenimiento'
  iot_gateways: IoTGateway[];
}

export interface PaginatedResponse {
  total: number;
  page: number;
  per_page: number;
  items: MineZone[];
}

export interface MineStats {
  totalMines: number;
  activeMines: number;
  totalGateways: number;
  totalSensorNodes: number;
  totalSensors: number;
  sensorsByVariable: { [key: string]: number };
}