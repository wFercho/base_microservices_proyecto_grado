import { SensorNode } from "./Nodes";


export interface IoTGateway {
  id: number;
  brand: string;
  description?: string;
  mine_zone_id: string;
  sensor_nodes: SensorNode[];
  created_at?: string;
  updated_at?: string;
}

export interface IoTGatewayCreate {
  brand: string;
  description?: string;
  mine_zone_id?: string;
}

export interface IoTGatewayUpdate {
  brand?: string;
  description?: string;
  mine_zone_id?: string;
}

export interface PaginatedIoTGatewayResponse {
  total: number;
  page: number;
  per_page: number;
  items: IoTGateway[];
}

export interface IoTGatewayStats {
  totalGateways: number;
  totalSensorNodes: number;
  totalSensors: number;
  gatewaysByBrand: { [key: string]: number };
  nodesByCategory: { [key: string]: number };
  sensorsByVariable: { [key: string]: number };
  gatewaysWithoutMine: number;
}