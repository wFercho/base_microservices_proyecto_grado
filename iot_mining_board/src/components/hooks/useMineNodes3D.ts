import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import axios from "axios";
import { MineNodes3D, IRealTimeSensorData } from "../../interfaces/main";
import { useMineNodesStore } from "../../state/mineNodesStore";
import { webSocketService, WebSocketMessage } from "../../services/websocketService";

const MINES_API_HOST = "localhost:8082";

export const useMineNodes3D = (mineId: string | undefined) => {
  const {
    nodes3D,
    loading,
    error,
    wsConnected,
    setNodes3D,
    setLoading,
    setError,
    setWsConnected,
    updateSensorData,
  } = useMineNodesStore();

  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closed' | 'error'>('closed');

  // Referencias para control
  const subscribedSensorIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef<boolean>(false);

  const wsUrl = useMemo(() => {
    if (!mineId) return;
    return `ws://${MINES_API_HOST}/ws/mine_nodes/${mineId}`;
  }, [mineId]);

  // Obtener IDs de sensores
  const getAllSensorIds = useCallback((nodes: any[]): string[] => {
    const sensorIds: string[] = [];
    nodes.forEach(node => {
      if (node.sensors && Array.isArray(node.sensors)) {
        node.sensors.forEach((sensor: any) => {
          if (sensor.id) {
            sensorIds.push(sensor.id.toString());
          }
        });
      }
    });
    return [...new Set(sensorIds)];
  }, []);

  // Suscribirse a sensores
  const subscribeToSensors = useCallback((sensorIds: string[]) => {
    if (!webSocketService.isConnected()) return;

    const newSensorIds = sensorIds.filter(id => !subscribedSensorIdsRef.current.has(id));
    if (newSensorIds.length === 0) return;

    try {
      webSocketService.subscribe(newSensorIds);
      newSensorIds.forEach(id => subscribedSensorIdsRef.current.add(id));
      console.log(`✅ Suscrito a ${newSensorIds.length} sensores`);
    } catch (error) {
      console.error('Error suscribiendo a sensores:', error);
    }
  }, []);

  // Cancelar suscripciones
  const unsubscribeFromAllSensors = useCallback(() => {
    if (webSocketService.isConnected() && subscribedSensorIdsRef.current.size > 0) {
      const sensorIds = Array.from(subscribedSensorIdsRef.current);
      try {
        webSocketService.unsubscribe(sensorIds);
      } catch (error) {
        console.error('Error cancelando suscripciones:', error);
      }
    }
    subscribedSensorIdsRef.current.clear();
  }, []);

  // Cargar datos
  const fetchNodes3D = useCallback(async () => {
    if (!mineId) return null;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<MineNodes3D>(
        `http://${MINES_API_HOST}/mine-nodes3d/mine/${mineId}`
      );

      const nodesWithColor = response.data.nodes.map((node) => ({
        ...node,
        color: node.color || getDefaultColor(node.zone.category),
        // Asegurar que los sensores tengan la estructura completa
        sensors: node.sensors.map(sensor => ({
          id: sensor.id.toString(), // Convertir a string para coincidir con sensor_id
          category: sensor.category,
          unit: sensor.unit,
          value: sensor.value !== undefined ? sensor.value : undefined,
          status: sensor.status || 'normal',
          alert: sensor.alert || undefined,
          timestamp: sensor.timestamp
        }))
      }));
      const updatedNodes3D = {
        ...response.data,
        nodes: nodesWithColor,
      };

      setNodes3D(updatedNodes3D);
      return updatedNodes3D;
    } catch (err) {
      setNodes3D(null)
      const errorMsg = err instanceof Error ? err.message : "Error al obtener los nodos 3D";
      setError(errorMsg);
      console.error("Error fetching nodes:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mineId, setLoading, setError, setNodes3D]);

  // Helper para colores por defecto
  const getDefaultColor = (category: string) => {
    switch (category) {
      case "bocamina": return "blue";
      case "extraction": return "orange";
      default: return "#2268e0";
    }
  };

  // Manejador de mensajes WebSocket SIMPLIFICADO
  const handleWebSocketMessage = useCallback(
    (data: WebSocketMessage) => {
      try {
        let sensorData: IRealTimeSensorData;

        if (typeof data.content === 'string') {
          sensorData = JSON.parse(data.content);
        } else {
          sensorData = data as any;
        }

        console.warn({ sensorData });

        // Validación básica
        if (sensorData?.sensor_id && sensorData?.node_id && sensorData.value !== undefined) {
          updateSensorData(sensorData);
        }
      } catch (err) {
        console.error("Error parsing WebSocket data:", err);
      }
    },
    [updateSensorData]
  );

  // Manejadores de conexión
  const handleWebSocketConnection = useCallback(
    (event: { isConnected: boolean; timestamp: Date }) => {
      setWsConnected(event.isConnected);
      setConnectionState(webSocketService.getConnectionState());

      if (event.isConnected && nodes3D?.nodes) {
        // Reconectar suscripciones después de un delay
        setTimeout(() => {
          const sensorIds = getAllSensorIds(nodes3D.nodes);
          subscribeToSensors(sensorIds);
        }, 500);
      }
    },
    [setWsConnected, nodes3D, getAllSensorIds, subscribeToSensors]
  );

  const handleWebSocketError = useCallback(
    (event: { error: Error; type: string; timestamp: Date }) => {
      console.error("WebSocket error:", event.error);
      setError(`Error en WebSocket: ${event.error.message}`);
      setWsConnected(false);
      setConnectionState('error');
    },
    [setError, setWsConnected]
  );

  // Conectar WebSocket
  const connectWebSocket = useCallback(async () => {
    if (!wsUrl) return;

    try {
      unsubscribeFromAllSensors();

      const unsubscribeMessage = webSocketService.subscribeMessage(handleWebSocketMessage);
      const unsubscribeConnection = webSocketService.subscribeConnection(handleWebSocketConnection);
      const unsubscribeError = webSocketService.subscribeError(handleWebSocketError);

      await webSocketService.connect();
      setConnectionState(webSocketService.getConnectionState());

      return () => {
        unsubscribeMessage();
        unsubscribeConnection();
        unsubscribeError();
        unsubscribeFromAllSensors();
      };
    } catch (err) {
      console.error("Error al conectar WebSocket:", err);
      setError("Error al iniciar la conexión WebSocket");
      setWsConnected(false);
      setConnectionState('error');
    }
  }, [wsUrl, handleWebSocketMessage, handleWebSocketConnection, handleWebSocketError, setError, setWsConnected, unsubscribeFromAllSensors]);

  // Efecto principal - UNA SOLA VEZ por mineId
  useEffect(() => {
    if (!mineId || isInitializedRef.current) return;

    let cleanupWebSocket: (() => void) | undefined;
    let mounted = true;

    const initialize = async () => {
      try {
        isInitializedRef.current = true;

        // 1. Cargar datos
        const nodesData = await fetchNodes3D();
        if (!mounted || !nodesData) return;

        // 2. Conectar WebSocket
        cleanupWebSocket = await connectWebSocket();

      } catch (err) {
        console.error("Error en inicialización:", err);
      }
    };

    initialize();

    return () => {
      mounted = false;
      isInitializedRef.current = false;
      cleanupWebSocket?.();
    };
  }, [mineId]); // Solo mineId

  // Reconectar
  const reconnect = useCallback(async () => {
    try {
      unsubscribeFromAllSensors();
      await connectWebSocket();
    } catch (err) {
      console.error("Error en reconexión manual:", err);
    }
  }, [connectWebSocket, unsubscribeFromAllSensors]);

  return {
    nodes3D,
    loading,
    error,
    wsConnected,
    connectionState,
    refreshData: fetchNodes3D,
    reconnectWebSocket: reconnect,
  };
};