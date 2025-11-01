import axios from 'axios';
import { Sensor } from '../interfaces/Sensors';

const API_BASE_URL = import.meta.env.VITE_API_URL


export const SensorService = {
  // Obtener todos los sensores
  async getSensors(page: number = 1, perPage: number = 10): Promise<{ items: Sensor[]; total: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors/paginated/sensors`, {
        params: { page, per_page: perPage }
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching sensors:', error);
      throw new Error('Error fetching sensors');
    }
  },

  // Obtener sensores por nodo
  async getSensorsByNode(nodeId: string, page: number = 1, perPage: number = 10): Promise<{ items: Sensor[]; total: number }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors/node/${nodeId}`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sensors by node:', error);
      throw new Error('Error fetching sensors by node');
    }
  },

  // Obtener un sensor por ID
  async getSensorById(id: string): Promise<Sensor> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor:', error);
      throw new Error('Error fetching sensor');
    }
  },

  async getIdsSensors(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensor-nodes/ids`);
      return response.data.node_ids;
    } catch (error) {
      console.error('Error fetching sensor IDs:', error);
      throw new Error('Error fetching sensor IDs');
    }
  },

  // Crear un nuevo sensor
  async createSensor(sensorData: Omit<Sensor, 'id' | 'created_at' | 'updated_at'>): Promise<Sensor> {
    try {
      const response = await axios.post(`${API_BASE_URL}/sensors`, sensorData);
      return response.data;
    } catch (error) {
      console.error('Error creating sensor:', error);
      throw new Error('Error creating sensor');
    }
  },

  // Actualizar un sensor
  async updateSensor(id: string, sensorData: Partial<Sensor>): Promise<Sensor> {
    try {
      console.log(sensorData)
      const response = await axios.put(`${API_BASE_URL}/sensors/${id}`, sensorData);
      return response.data;
    } catch (error) {
      console.error('Error updating sensor:', error);
      throw new Error('Error updating sensor');
    }
  },

  // Eliminar un sensor
  async deleteSensor(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/sensors/${id}`);
    } catch (error) {
      console.error('Error deleting sensor:', error);
      throw new Error('Error deleting sensor');
    }
  },

  // Obtener todos los nodos
  async getNodes(): Promise<Node[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/nodes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching nodes:', error);
      throw new Error('Error fetching nodes');
    }
  },
};