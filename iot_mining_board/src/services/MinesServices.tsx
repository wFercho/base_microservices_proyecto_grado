// services/mineService.ts
import axios from 'axios';
import { MineStats, MineZone, PaginatedResponse } from '../interfaces/Mines';

const API_BASE_URL = import.meta.env.VITE_API_URL

export const MineService = {
  // Obtener minas paginadas
  async getMines(page: number = 1, perPage: number = 10, status?: string): Promise<PaginatedResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/mine-zones/paginated/`, {
        params: { page, per_page: perPage, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mines:', error);
      throw new Error('Error fetching mines');
    }
  },

  // Obtener todas las minas
  async getAllMines(): Promise<MineZone[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/mine-zones/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all mines:', error);
      throw new Error('Error fetching all mines');
    }
  },

  async getMinesIds(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/mine-zones/ids`);
      return response.data.ids;
    } catch (error) {
      console.error('Error fetching mine IDs:', error);
      throw new Error('Error fetching mine IDs');
    }
  },
  // Obtener mina por ID
  async getMineById(mineId: string): Promise<MineZone> {
    try {
      const response = await axios.get(`${API_BASE_URL}/mine-zones/${mineId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mine:', error);
      throw new Error('Error fetching mine');
    }
  },

  // Crear nueva mina
  async createMine(mineData: Omit<MineZone, 'id' | 'created_at' | 'updated_at' | 'iot_gateways'>): Promise<MineZone> {
    try {
      const response = await axios.post(`${API_BASE_URL}/mine-zones/`, mineData);
      return response.data;
    } catch (error) {
      console.error('Error creating mine:', error);
      throw new Error('Error creating mine');
    }
  },

  // Actualizar mina
  async updateMine(mineId: string, mineData: Partial<MineZone>): Promise<MineZone> {
    try {
          console.log('Updated mine data:', mineData.estado);

      const response = await axios.put(`${API_BASE_URL}/mine-zones/${mineId}`, mineData);
      return response.data;
    } catch (error) {
      console.error('Error updating mine:', error);
      throw new Error('Error updating mine');
    }
  },

  // Eliminar mina
  async deleteMine(mineId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/mine-zones/${mineId}`);
    } catch (error) {
      console.error('Error deleting mine:', error);
      throw new Error('Error deleting mine');
    }
  },

  // Obtener estadísticas
  async getMineStats(): Promise<MineStats> {
    try {
      const mines = await this.getAllMines();

      const stats: MineStats = {
        totalMines: mines.length,
        activeMines: mines.filter(mine => mine.estado === 'activa').length,
        totalGateways: 0,
        totalSensorNodes: 0,
        totalSensors: 0,
        sensorsByVariable: {}
      };

      mines.forEach(mine => {
        stats.totalGateways += mine.iot_gateways.length;

        mine.iot_gateways.forEach(gateway => {
          stats.totalSensorNodes += gateway.sensor_nodes.length;

          gateway.sensor_nodes.forEach(node => {
            const sensors = node.sensors || [];
            stats.totalSensors += sensors.length;

            sensors.forEach(sensor => {
              const variable = sensor.variable;
              stats.sensorsByVariable[variable] = (stats.sensorsByVariable[variable] || 0) + 1;
            });
          });
        });
      });

      return stats;
    } catch (error) {
      console.error('Error calculating mine stats:', error);
      throw new Error('Error calculating mine stats');
    }
  }
};