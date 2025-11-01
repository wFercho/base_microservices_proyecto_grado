// state/mineNodesStore.ts
import { create } from 'zustand';
import {
    MineNodes3D,
    IRealTimeSensorData,
    normalizeStatus,
    getMostCriticalStatus,
    STATUS_COLORS,
    SensorStatus
} from '../interfaces/main';

interface MineNodesState {
    nodes3D: MineNodes3D | null;
    loading: boolean;
    error: string | null;
    wsConnected: boolean;
    setNodes3D: (nodes3D: MineNodes3D) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setWsConnected: (connected: boolean) => void;
    updateSensorData: (sensorData: IRealTimeSensorData) => void;
}

export const useMineNodesStore = create<MineNodesState>((set, get) => ({
    nodes3D: null,
    loading: false,
    error: null,
    wsConnected: false,

    setNodes3D: (nodes3D) => set({ nodes3D }),

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    setWsConnected: (wsConnected) => set({ wsConnected }),
    reset: () => set({
        nodes3D: null,
        loading: false,
        error: null,
        wsConnected: false
    }),
    updateSensorData: (sensorData: IRealTimeSensorData) => {
        const state = get();
        if (!state.nodes3D) {
            console.warn('❌ No hay nodes3D en el store');
            return;
        }

        console.log('🔄 Actualizando sensor en store:', {
            sensor_id: sensorData.sensor_id,
            node_id: sensorData.node_id,
            value: sensorData.value,
            status: sensorData.status
        });

        set((state) => {
            if (!state.nodes3D) return state;

            let wasUpdated = false;

            const updatedNodes = state.nodes3D.nodes.map(node => {
                // Buscar el nodo que coincide con el node_id del mensaje
                if (node.id === sensorData.node_id) {
                    console.log(`🎯 Encontrado nodo: ${node.id}, buscando sensor: ${sensorData.sensor_id}`);

                    // Buscar el sensor específico en este nodo
                    const sensorExists = node.sensors.some(
                        sensor => sensor.id === sensorData.sensor_id.toString()
                    );

                    if (!sensorExists) {
                        console.warn(`❌ Sensor ${sensorData.sensor_id} no encontrado en nodo ${node.id}`);
                        return node;
                    }

                    // Actualizar los sensores del nodo
                    const updatedSensors = node.sensors.map(sensor => {
                        if (sensor.id === sensorData.sensor_id.toString()) {
                            const normalizedStatus = normalizeStatus(sensorData.status);
                            wasUpdated = true;

                            console.log(`✅ Actualizando sensor ${sensor.id}:`, {
                                valor_anterior: sensor.value,
                                valor_nuevo: sensorData.value,
                                status_anterior: sensor.status,
                                status_nuevo: normalizedStatus
                            });

                            return {
                                ...sensor,
                                value: sensorData.value,
                                unit: sensorData.unit,
                                status: normalizedStatus,
                                alert: normalizedStatus !== 'normal' ? {
                                    name: normalizedStatus.toUpperCase(),
                                    color: STATUS_COLORS[normalizedStatus]
                                } : undefined,
                                timestamp: sensorData.timestamp
                            };
                        }
                        return sensor;
                    });

                    // Calcular el status más crítico del nodo
                    const nodeStatuses: SensorStatus[] = updatedSensors
                        .filter(sensor => sensor.status)
                        .map(sensor => sensor.status as SensorStatus);

                    const mostCriticalStatus = getMostCriticalStatus(nodeStatuses);

                    // Determinar el color del nodo
                    let newNodeColor = node.color || getDefaultColor(node.zone.category);
                    if (mostCriticalStatus === 'danger') {
                        newNodeColor = STATUS_COLORS.danger;
                    } else if (mostCriticalStatus === 'warning') {
                        newNodeColor = STATUS_COLORS.warning;
                    }

                    console.log(`🎨 Nodo ${node.id} - Status: ${mostCriticalStatus}, Color: ${newNodeColor}`);

                    return {
                        ...node,
                        sensors: updatedSensors,
                        color: newNodeColor,
                        nodeStatus: mostCriticalStatus
                    };
                }
                return node;
            });

            if (!wasUpdated) {
                console.warn('⚠️ No se actualizó ningún sensor');
                return state;
            }

            console.log('✅ Store actualizado correctamente');

            return {
                nodes3D: {
                    ...state.nodes3D,
                    nodes: updatedNodes
                }
            };
        });
    },
}));

// Función helper para colores por defecto
const getDefaultColor = (category: string) => {
    switch (category) {
        case "bocamina": return "#3b82f6";
        case "extraction": return "#f59e0b";
        case "tunel": return "#6b7280";
        default: return "#6b7280";
    }
};