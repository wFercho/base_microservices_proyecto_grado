// services/SensorNodeService.ts
import axios from 'axios';
import { PaginatedResponse, SensorNode, SensorNodeCreate, SensorNodeUpdate } from '../interfaces/Nodes';

const API_BASE_URL = import.meta.env.VITE_API_URL

export const SensorNodeService = {
  async getSensorNodes(): Promise<SensorNode[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensor-nodes/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor nodes:', error);
      throw new Error('Error fetching sensor nodes');
    }
  },

  async getSensorNodesPaginated(page: number = 1, perPage: number = 10): Promise<PaginatedResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensor-nodes/paginated/`, {
        params: { page, per_page: perPage }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated sensor nodes:', error);
      throw new Error('Error fetching paginated sensor nodes');
    }
  },

  // Obtener IDs de sensor nodes
  async getSensorNodeIds(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensor-nodes/ids`);
      return response.data.node_ids;
    } catch (error) {
      console.error('Error fetching sensor node IDs:', error);
      throw new Error('Error fetching sensor node IDs');
    }
  },

  // Obtener un sensor node por ID
  async getSensorNodeById(id: string): Promise<SensorNode> {
    try {
      const response = await axios.get(`${API_BASE_URL}/sensor-nodes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor node:', error);
      throw new Error('Error fetching sensor node');
    }
  },

  // Crear un nuevo sensor node
  async createSensorNode(nodeData: SensorNodeCreate): Promise<SensorNode> {
    try {
      const response = await axios.post(`${API_BASE_URL}/sensor-nodes/`, nodeData);
      return response.data;
    } catch (error) {
      console.error('Error creating sensor node:', error);
      throw new Error('Error creating sensor node');
    }
  },

  // Actualizar un sensor node
  async updateSensorNode(id: string, nodeData: SensorNodeUpdate): Promise<SensorNode> {
    try {
      const response = await axios.put(`${API_BASE_URL}/sensor-nodes/${id}`, nodeData);
      return response.data;
    } catch (error) {
      console.error('Error updating sensor node:', error);
      throw new Error('Error updating sensor node');
    }
  },

  // Eliminar un sensor node
  async deleteSensorNode(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/sensor-nodes/${id}`);
    } catch (error) {
      console.error('Error deleting sensor node:', error);
      throw new Error('Error deleting sensor node');
    }
  },
};