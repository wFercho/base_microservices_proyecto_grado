// hooks/useWebSocket.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService, WebSocketMessage, ConnectionEvent, ErrorEvent } from '../../services/websocketService';

interface UseWebSocketProps {
  onMessage: (data: WebSocketMessage) => void;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'open' | 'closed' | 'error';
  subscribe: (sensors: string[]) => void;
  unsubscribe: (sensors: string[]) => void;
  getCurrentSubscriptions: () => string[];
  reconnect: () => Promise<void>;
  disconnect: () => void;
}

export const useWebSocket = ({
  onMessage,
  autoConnect = true
}: UseWebSocketProps): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'open' | 'closed' | 'error'>('closed');
  const onMessageRef = useRef(onMessage);

  // Actualizar la referencia del callback
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const handleMessage = useCallback((data: WebSocketMessage) => {
    onMessageRef.current(data);
  }, []);

  const handleConnection = useCallback((event: ConnectionEvent) => {
    setIsConnected(event.isConnected);
    setConnectionState(event.isConnected ? 'open' : 'closed');
  }, []);

  const handleError = useCallback((event: ErrorEvent) => {
    console.error('WebSocket error:', event.error);
    setConnectionState('error');
  }, []);

  useEffect(() => {
    // Suscribirse a eventos
    const unsubscribeMessage = webSocketService.subscribeMessage(handleMessage);
    const unsubscribeConnection = webSocketService.subscribeConnection(handleConnection);
    const unsubscribeError = webSocketService.subscribeError(handleError);

    // Conectar automáticamente si está configurado
    if (autoConnect) {
      webSocketService.connect().catch(console.error);
    }

    // Estado inicial
    setIsConnected(webSocketService.isConnected());
    setConnectionState(webSocketService.getConnectionState());

    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      unsubscribeError();
    };
  }, [autoConnect, handleMessage, handleConnection, handleError]);

  const subscribe = useCallback((sensors: string[]) => {
    try {
      webSocketService.subscribe(sensors);
    } catch (error) {
      console.error('Error al suscribirse:', error);
    }
  }, []);

  const unsubscribe = useCallback((sensors: string[]) => {
    try {
      webSocketService.unsubscribe(sensors);
    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
    }
  }, []);

  const getCurrentSubscriptions = useCallback((): string[] => {
    return webSocketService.getCurrentSubscriptions();
  }, []);

  const reconnect = useCallback(async (): Promise<void> => {
    try {
      setConnectionState('connecting');
      await webSocketService.connect();
    } catch (error) {
      console.error('Error al reconectar:', error);
      setConnectionState('error');
      throw error;
    }
  }, []);

  const disconnect = useCallback((): void => {
    webSocketService.disconnect();
  }, []);

  return {
    isConnected,
    connectionState,
    subscribe,
    unsubscribe,
    getCurrentSubscriptions,
    reconnect,
    disconnect
  };
};