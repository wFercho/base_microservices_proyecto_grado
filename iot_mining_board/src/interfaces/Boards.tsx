// interfaces/Boards.ts
import { LucideIcon } from 'lucide-react';
import { SensorNode } from './Nodes';

export interface SensorData {
  type: string;
  icon: LucideIcon;
  unit: string;
  value: number;
  status: 'normal' | 'warning' | 'critical';
  trend: number;
}

export interface Alert {
  type: 'critical' | 'warning' | 'info';
  sensor: string;
  zone: string;
  value: string;
  time: string;
  message: string;
}

export interface Node {
  id: string;
  zone: string;
  status: 'online' | 'warning' | 'offline';
  lastSeen: string;
}

export interface Zone {
  name: string;
  type: 'tunel' | 'extraction' | 'bocamina';
  sensors: number;
  online: number;
  warning: number;
  offline: number;
}

export type TimeRange = '1h' | '6h' | '24h' | '7d';

export interface MetricsCardProps {
  title: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: LucideIcon;
  trend?: number;
}

export interface AlertsPanelProps {
  alerts: Alert[];
}

export interface NodesStatusProps {
  nodes: SensorNode[];
}

export interface ZonesSummaryProps {
  zones: Zone[];
}