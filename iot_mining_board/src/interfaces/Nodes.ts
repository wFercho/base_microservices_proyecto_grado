import { Sensor } from "./Sensors";

// services/SensorNodeService.ts
export interface SensorNode {
  id: string;
  brand: string;
  description: string;
  zone_category?: string;
  zone_name?: string;
  id_iot_gateway?: string;
  sensors?: Sensor[]; 
}

export interface SensorNodeCreate {
  id: string;
  brand: string;
  description: string;
  zone_category?: string;
  zone_name?: string;
  id_iot_gateway?: string;
}

export interface SensorNodeUpdate {
  brand?: string;
  description?: string;
  zone_category?: string;
  zone_name?: string;
  id_iot_gateway?: string;
}

export interface PaginatedResponse {
  items: SensorNode[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SensorNodeIdResponse {
  node_ids: string[];
}

