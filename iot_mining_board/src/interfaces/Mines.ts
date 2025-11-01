import { SensorNode } from "./Nodes";





export interface IoTGateway {
  id: number;
  brand: string;
  description?: string;
  mine_zone_id: string;
  sensor_nodes: SensorNode[];
}

export interface MineZone {
  id: string;
  name: string;
  description?: string;
  location?: string;
  zone_type: string;
  status: string;
  mine_type?: string;
  coordinates?: string;
  depth?: string;
  area?: string;
  created_at: string;
  updated_at?: string;
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
