// interfaces/Sensors.ts
export interface SensorData {
  id: string;
  sensor_id: string;
  type: string;
  value: number;
  unit: string;
  status: string; // 'OK' | 'WARNING' | 'DANGER' | 'ERROR'
  timestamp: string;
  node_id: string;
  manufacturer: string;
  model: string;
  latitude?: number;
  longitude?: number;
  installation_type?: string;
  metadata?: any; // Para conservar datos adicionales
}
export interface Sensor {
  id: string;
  variable: string;
  marca: string;
  referencia: number;
  id_node: string;
  unidad_medicion: string;
  max_medicion: number;
  min_medicion: number;
  precision: number;
  tiempo_respuesta_valor: number;
  tiempo_respuesta_unidad: string;
  resolucion: number;
  temperatura_max: number;
  temperatura_min: number;
  voltaje_tipo: string;
  voltaje_min: number;
  voltaje_max: number;
  corriente_min: number;
  corriente_max: number;
  durabilidad_valor: number;
  durabilidad_unidad: string;
  modo_instalacion: string;
  tipo_salida: string;
  certificados: string;
  created_at?: string;
  updated_at?: string;
}

export interface Node {
  id: string;
  name: string;
  description?: string;
  location?: string;
  status?: string;
}