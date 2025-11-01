/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useSensorData.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { WebSocketMessage } from '../../services/websocketService';
import { Alert } from './useAlerts';
import { AlertRule, useAlertRules } from '../context/AlertRulesContext';
import { useNotifications } from '../../Context/NotificationsContext';
import { SensorData } from '../../interfaces/Sensors';

interface UseSensorDataReturn {
    // Datos crudos de todos los sensores
    allSensorData: SensorData[];
    // Alertas procesadas
    alerts: Alert[];
    // Estado de conexión
    isConnected: boolean;
    connectionState: 'connecting' | 'open' | 'closed' | 'error';
    // Métodos
    clearAllData: () => void;
    dismissAlert: (id: string) => void;
    // Métodos de suscripción
    subscribeToSensors: (sensors: string[]) => void;
    unsubscribeFromSensors: (sensors: string[]) => void;
    getCurrentSubscriptions: () => string[];
    // Contadores
    totalCount: number;
    okCount: number;
    warningCount: number;
    dangerCount: number;
    errorCount: number;
    criticalAlertsCount: number;
    warningAlertsCount: number;
    infoAlertsCount: number;
    // Datos combinados para la tabla
    getTableData: () => (SensorData)[];
}

const MAX_SENSOR_DATA = 1000;
const MAX_ALERTS = 100;

export const useSensorData = (): UseSensorDataReturn => {
    const [allSensorData, setAllSensorData] = useState<SensorData[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const { addAlert } = useNotifications();

    // Usar el contexto de reglas
    const { getActiveRules } = useAlertRules();
    const activeRulesRef = useRef<AlertRule[]>([]);

    // Referencias para suscripciones
    const currentSubscriptionsRef = useRef<string[]>([]);
    const isSubscribedRef = useRef<boolean>(false);

    // Actualizar ref con reglas activas
    useEffect(() => {
        activeRulesRef.current = getActiveRules();
    }, [getActiveRules]);

    const sensorDataToAlert = useCallback((
        data: SensorData,
        rule?: AlertRule
    ): Alert => {
        const alertType: 'critical' | 'warning' | 'info' =
            data.status === 'DANGER' || data.status === 'ERROR' ? 'critical' :
                data.status === 'WARNING' ? 'warning' : 'info';

        const modifiedSensorData: SensorData = {
            ...data,
            status: alertType === 'critical' ? 'DANGER' : 'WARNING'
        };
        return {
            type: rule?.level || alertType,
            sensor: `${data.type} - ${data.node_id}`,
            zone: `Zona ${data.manufacturer}`,
            value: `${data.value.toFixed(2)} ${data.unit}`,
            time: new Date(data.timestamp).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            message: rule
                ? `⚠️ ${rule.name}: ${data.value} ${data.unit} (${getConditionText(rule)})`
                : `Estado: ${data.status}. Sensor ${data.model} reporta valor fuera de rango normal.`,
            id: `alert_${data.id}_${Date.now()}`,
            ruleId: rule?.id,
            sensorData: modifiedSensorData,
        };
    }, []);


    const getConditionText = (rule: AlertRule): string => {
        switch (rule.condition) {
            case 'greater': return `> ${rule.value}`;
            case 'less': return `< ${rule.value}`;
            case 'equal': return `= ${rule.value}`;
            case 'range': return `${rule.value} - ${rule.maxValue}`;
            default: return '';
        }
    };

    const evaluateRule = useCallback((
        sensorData: SensorData,
        rule: AlertRule
    ): boolean => {
        if (!rule.isActive) return false;
        if (sensorData.type !== rule.sensorType) return false;

        const value = sensorData.value;
        switch (rule.condition) {
            case 'greater': return value > rule.value;
            case 'less': return value < rule.value;
            case 'equal': return Math.abs(value - rule.value) < 0.01;
            case 'range': return rule.maxValue ? value >= rule.value && value <= rule.maxValue : false;
            default: return false;
        }
    }, []);

    const processSensorDataForAlerts = useCallback((sensorData: SensorData): void => {
        try {
            const activeRules = activeRulesRef.current;
            let matchedRule: AlertRule | undefined;

            // Evaluar contra reglas activas
            for (const rule of activeRules) {
                if (evaluateRule(sensorData, rule)) {
                    matchedRule = rule;
                    break;
                }
            }

            // Crear alerta si hay regla que coincide o si el status es de alerta
            const shouldCreateAlert = matchedRule ||
                sensorData.status === 'WARNING' ||
                sensorData.status === 'DANGER' ||
                sensorData.status === 'ERROR';

            if (shouldCreateAlert) {
                const newAlert: Alert = sensorDataToAlert(sensorData, matchedRule);

                setAlerts(prev => {
                    // Reemplazar alerta anterior del mismo sensor y regla
                    const filtered = prev.filter(
                        alert => !(alert.sensorData.id === sensorData.id &&
                            alert.ruleId === matchedRule?.id)
                    );
                    return [newAlert, ...filtered].slice(0, MAX_ALERTS);
                });


                showAlertNotification(sensorData);
            }

        } catch (error) {
            console.warn("⚠️ Error procesando alertas:", error);
        }
    }, [sensorDataToAlert, evaluateRule]);

    // Mostrar notificación para todos los estados
    const showAlertNotification = useCallback((sensorData: SensorData) => {
        const alertMessage = `Sensor ${sensorData.node_id} (${sensorData.type}): ${sensorData.value} ${sensorData.unit}`;

        let alertType: 'INFO' | 'WARNING' | 'DANGER' | 'ERROR' = 'INFO';

        switch (sensorData.status) {
            case 'WARNING':
                alertType = 'WARNING';
                break;
            case 'DANGER':
                alertType = 'DANGER';
                break;
            case 'ERROR':
                alertType = 'ERROR';
                break;
            default:
                alertType = 'INFO';
        }

        addAlert({
            message: alertMessage,
            type: alertType,
            sensorId: sensorData.id
        });

    }, [addAlert]);

    const handleWebSocketMessage = useCallback((data: WebSocketMessage): void => {
        try {
            // console.log('📨 Mensaje WebSocket recibido:', data);

            let sensorDataItem: SensorData;
            let rawData: any;

            // Parsear mensaje
            if (typeof data === 'object' && 'sensor_id' in data) {
                // Es el formato directo que recibimos
                rawData = data;
            } else if (typeof data.content === 'string') {
                try {
                    rawData = JSON.parse(data.content);
                } catch (parseError) {
                    console.log('❌ Error parseando content:', parseError);
                    return;
                }
            } else if (typeof data === 'object' && data.content && typeof data.content === 'object') {
                rawData = data.content;
            } else {
                // Manejar mensajes de conexión y suscripción
                if (data.type === 'connection' || data.type === 'subscription') {
                    // console.log('📡 Mensaje del servidor:', data);
                    if (data.subscriptions) {
                        currentSubscriptionsRef.current = data.subscriptions;
                    }
                    return;
                }
                console.log('❌ Mensaje no reconocido:', data);
                return;
            }

            // Validar estructura básica del mensaje recibido
            if (!rawData || typeof rawData.sensor_id === 'undefined') {
                console.log('❌ Datos de sensor inválidos - falta sensor_id:', rawData);
                return;
            }

            // Mapear la estructura recibida a la interfaz SensorData
            sensorDataItem = {
                // Campos requeridos
                id: rawData.sensor_id?.toString() || `sensor_${rawData.sensor_id}`,
                type: rawData.variable || 'unknown',
                value: typeof rawData.value === 'number' ? rawData.value : 0,
                unit: rawData.unit || '',
                status: mapReceivedStatus(rawData.status),
                timestamp: rawData.timestamp || new Date().toISOString(),
                node_id: rawData.node_id || 'unknown',

                // Campos de metadata mapeados
                manufacturer: rawData.metadata?.brand || 'Unknown',
                model: rawData.metadata?.reference || 'Unknown',

                // Campos opcionales con valores por defecto
                latitude: rawData.metadata?.latitude || 0,
                longitude: rawData.metadata?.longitude || 0,

                // Conservar metadata completo por si se necesita
                metadata: rawData.metadata
            };

            // console.log('✅ Datos de sensor mapeados:', sensorDataItem);

            // Validar estructura final
            if (!sensorDataItem.id || !sensorDataItem.type || typeof sensorDataItem.value !== 'number') {
                console.log('❌ Datos de sensor mapeados inválidos:', sensorDataItem);
                return;
            }

            // 1. Guardar datos crudos
            setAllSensorData(prev => {
                const existingIndex = prev.findIndex(
                    item => item.id === sensorDataItem.id &&
                        item.timestamp === sensorDataItem.timestamp
                );

                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = sensorDataItem;
                    return updated.slice(0, MAX_SENSOR_DATA);
                } else {
                    return [sensorDataItem, ...prev].slice(0, MAX_SENSOR_DATA);
                }
            });

            // 2. Procesar para alertas
            processSensorDataForAlerts(sensorDataItem);

        } catch (error) {
            console.warn("⚠️ Error procesando mensaje:", error);
        }
    }, [processSensorDataForAlerts]);

    // Función auxiliar para mapear estados
    const mapReceivedStatus = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'normal': 'OK',
            'warning': 'WARNING',
            'danger': 'DANGER',
            'error': 'ERROR'
        };
        return statusMap[status.toLowerCase()] || status.toUpperCase();
    };
    const {
        isConnected,
        connectionState,
        subscribe,
        unsubscribe,
        getCurrentSubscriptions
    } = useWebSocket({
        onMessage: handleWebSocketMessage,
        autoConnect: true
    });

    // Suscribirse automáticamente cuando se conecta el WebSocket
    useEffect(() => {
        if (isConnected && !isSubscribedRef.current) {
            console.log('🔌 WebSocket conectado, suscribiendo a todos los sensores...');
            // Suscribirse a todos los sensores por defecto
            subscribe(['all']);
            isSubscribedRef.current = true;
        }
    }, [isConnected, subscribe]);

    // Métodos de suscripción
    const subscribeToSensors = useCallback((sensors: string[]): void => {
        console.log('📡 Suscribiendo a sensores:', sensors);
        subscribe(sensors);
        isSubscribedRef.current = true;
    }, [subscribe]);

    const unsubscribeFromSensors = useCallback((sensors: string[]): void => {
        console.log('📡 Cancelando suscripción a sensores:', sensors);
        unsubscribe(sensors);
    }, [unsubscribe]);

    // Datos combinados para la tabla
    const getTableData = useCallback((): (SensorData)[] => {
        // Combinar datos crudos con alertas
        const combinedData = [...allSensorData];

        // Agregar alertas que no estén ya en los datos crudos
        alerts.forEach(alert => {
            const alreadyInData = allSensorData.some(
                data => data.id === alert.sensorData.id &&
                    data.timestamp === alert.sensorData.timestamp
            );
            if (!alreadyInData) {
                combinedData.push(alert.sensorData);
            }
        });

        return combinedData;
    }, [allSensorData, alerts]);

    const clearAllData = useCallback((): void => {
        setAllSensorData([]);
        setAlerts([]);
    }, []);

    const dismissAlert = useCallback((id: string): void => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, []);

    // Contadores
    const totalCount = allSensorData.length;
    const okCount = allSensorData.filter(item => item.status === 'OK').length;
    const warningCount = allSensorData.filter(item => item.status === 'WARNING').length;
    const dangerCount = allSensorData.filter(item => item.status === 'DANGER').length;
    const errorCount = allSensorData.filter(item => item.status === 'ERROR').length;

    const activeAlerts = alerts;
    const criticalAlertsCount = alerts.filter(alert => alert.type === 'critical').length;
    const warningAlertsCount = alerts.filter(alert => alert.type === 'warning').length;
    const infoAlertsCount = alerts.filter(alert => alert.type === 'info').length;

    return {
        allSensorData,
        alerts: activeAlerts,
        isConnected,
        connectionState,
        clearAllData,
        dismissAlert,
        subscribeToSensors,
        unsubscribeFromSensors,
        getCurrentSubscriptions,
        totalCount,
        okCount,
        warningCount,
        dangerCount,
        errorCount,
        criticalAlertsCount,
        warningAlertsCount,
        infoAlertsCount,
        getTableData
    };
};