// services/iotGatewayService.ts
import axios from 'axios';
import {
    IoTGateway,
    IoTGatewayCreate,
    IoTGatewayUpdate,
    PaginatedIoTGatewayResponse,
    IoTGatewayStats
} from '../interfaces/IoTGateways';

const API_BASE_URL = import.meta.env.VITE_API_URL

export const IoTGatewayService = {
    // Obtener gateways paginados
    async getGateways(page: number = 1, perPage: number = 10): Promise<PaginatedIoTGatewayResponse> {
        try {
            const response = await axios.get(`${API_BASE_URL}/iot-gateways/paginated/`, {
                params: { page, per_page: perPage }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching gateways:', error);
            throw new Error('Error fetching gateways');
        }
    },

    // Obtener todos los gateways
    async getAllGateways(): Promise<IoTGateway[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/iot-gateways/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all gateways:', error);
            throw new Error('Error fetching all gateways');
        }

    },
    async getIotIds(): Promise<string[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/iot-gateways/ids`);
            return response.data.ids;
        } catch (error) {
            console.error('Error fetching IoT IDs:', error);
            throw new Error('Error fetching IoT IDs');
        }
    },

    // Obtener gateway por ID
    async getGatewayById(gatewayId: number): Promise<IoTGateway> {
        try {
            const response = await axios.get(`${API_BASE_URL}/iot-gateways/${gatewayId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching gateway:', error);
            throw new Error('Error fetching gateway');
        }
    },

    // Crear nuevo gateway
    async createGateway(gatewayData: IoTGatewayCreate): Promise<IoTGateway> {
        try {
            const response = await axios.post(`${API_BASE_URL}/iot-gateways/`, gatewayData);
            return response.data;
        } catch (error) {
            console.error('Error creating gateway:', error);
            throw new Error('Error creating gateway');
        }
    },

    // Actualizar gateway
    async updateGateway(gatewayId: number, gatewayData: IoTGatewayUpdate): Promise<IoTGateway> {
        try {
            const response = await axios.put(`${API_BASE_URL}/iot-gateways/${gatewayId}`, gatewayData);
            return response.data;
        } catch (error) {
            console.error('Error updating gateway:', error);
            throw new Error('Error updating gateway');
        }
    },

    // Eliminar gateway
    async deleteGateway(gatewayId: number): Promise<void> {
        try {
            await axios.delete(`${API_BASE_URL}/iot-gateways/${gatewayId}`);
        } catch (error) {
            console.error('Error deleting gateway:', error);
            throw new Error('Error deleting gateway');
        }
    },

    // Obtener gateways por mina
    async getGatewaysByMine(mineZoneId: string): Promise<IoTGateway[]> {
        try {
            const allGateways = await this.getAllGateways();
            return allGateways.filter(gateway => gateway.mine_zone_id === mineZoneId);
        } catch (error) {
            console.error('Error fetching gateways by mine:', error);
            throw new Error('Error fetching gateways by mine');
        }
    },

    // Obtener gateways sin mina asignada
    async getUnassignedGateways(): Promise<IoTGateway[]> {
        try {
            const allGateways = await this.getAllGateways();
            return allGateways.filter(gateway => !gateway.mine_zone_id);
        } catch (error) {
            console.error('Error fetching unassigned gateways:', error);
            throw new Error('Error fetching unassigned gateways');
        }
    },

    // Obtener estadísticas
    async getGatewayStats(): Promise<IoTGatewayStats> {
        try {
            const gateways = await this.getAllGateways();

            const stats: IoTGatewayStats = {
                totalGateways: gateways.length,
                totalSensorNodes: 0,
                totalSensors: 0,
                gatewaysByBrand: {},
                nodesByCategory: {},
                sensorsByVariable: {},
                gatewaysWithoutMine: 0
            };

            gateways.forEach(gateway => {
                // Estadísticas por marca
                stats.gatewaysByBrand[gateway.brand] = (stats.gatewaysByBrand[gateway.brand] || 0) + 1;

                // Gateways sin mina asignada
                if (!gateway.mine_zone_id) {
                    stats.gatewaysWithoutMine++;
                }

                // Procesar nodos sensores
                stats.totalSensorNodes += gateway.sensor_nodes.length;

                gateway.sensor_nodes.forEach(node => {
                    // Estadísticas por categoría de nodo
                    if (node.zone_category) {
                        stats.nodesByCategory[node.zone_category] = (stats.nodesByCategory[node.zone_category] || 0) + 1;
                    }

                    // Procesar sensores
                    const sensors = node.sensors || [];
                    stats.totalSensors += sensors.length;

                    sensors.forEach(sensor => {
                        const variable = sensor.variable;
                        stats.sensorsByVariable[variable] = (stats.sensorsByVariable[variable] || 0) + 1;
                    });
                });
            });

            return stats;
        } catch (error) {
            console.error('Error calculating gateway stats:', error);
            throw new Error('Error calculating gateway stats');
        }
    },

    // Obtener conteo de sensores por gateway
    async getSensorsCountByGateway(gatewayId: number): Promise<number> {
        try {
            const gateway = await this.getGatewayById(gatewayId);
            return gateway.sensor_nodes.reduce((total, node) => total + (node.sensors?.length ?? 0), 0);
        } catch (error) {
            console.error('Error counting sensors:', error);
            throw new Error('Error counting sensors');
        }
    },

    // Buscar gateways por marca
    async searchGatewaysByBrand(brand: string): Promise<IoTGateway[]> {
        try {
            const allGateways = await this.getAllGateways();
            return allGateways.filter(gateway =>
                gateway.brand.toLowerCase().includes(brand.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching gateways:', error);
            throw new Error('Error searching gateways');
        }
    }
};