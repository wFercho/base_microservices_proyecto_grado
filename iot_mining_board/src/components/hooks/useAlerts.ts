/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useAlerts.ts - Versión actualizada con Context
import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { WebSocketMessage } from '../../services/websocketService';
import { AlertRule, useAlertRules } from '../context/AlertRulesContext';
import { useNotifications } from '../../Context/NotificationsContext';
import { SensorData } from '../../interfaces/Sensors';

export interface Alert {
    type: 'critical' | 'warning' | 'info';
    sensor: string;
    zone: string;
    value: string;
    time: string;
    message: string;
    id: string;
    ruleId?: string; // ID de la regla que activó esta alerta
    sensorData: SensorData;
    status?: 'OK' | 'WARNING' | 'DANGER' | 'ERROR' | string;
}



interface UseAlertsReturn {
    alerts: Alert[];
    isConnected: boolean;
    connectionState: 'connecting' | 'open' | 'closed' | 'error';
    clearAlerts: () => void;
    dismissAlert: (id: string) => void;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
}

const MAX_ALERTS = 50;

export const useAlerts = (): UseAlertsReturn => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    // Usar el contexto de reglas
    const { getActiveRules } = useAlertRules();
    const activeRulesRef = useRef<AlertRule[]>([]);
    const { addAlert } = useNotifications();

    // Actualizar ref con reglas activas
    useEffect(() => {
        activeRulesRef.current = getActiveRules();
    }, [getActiveRules]);

    const mapStatusToSpanish = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            // Estados originales
            'OK': 'NORMAL',
            'WARNING': 'ADVERTENCIA',
            'DANGER': 'PELIGRO',
            'ERROR': 'ERROR',
            // Tipos de alerta
            'critical': 'CRÍTICO',
            'warning': 'ADVERTENCIA',
            'info': 'INFORMATIVO'
        };

        return statusMap[status] || status.toUpperCase();
    };
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
                : `Estado: ${mapStatusToSpanish(data.status)}. Sensor ${data.model} reporta valor fuera de rango normal.`,
            id: `alert_${data.id}_${Date.now()}`,
            ruleId: rule?.id,
            sensorData: modifiedSensorData
        };
    }, []);

    // Función auxiliar para describir la condición
    const getConditionText = (rule: AlertRule): string => {
        switch (rule.condition) {
            case 'greater':
                return `> ${rule.value}`;
            case 'less':
                return `< ${rule.value}`;
            case 'equal':
                return `= ${rule.value}`;
            case 'range':
                return `${rule.value} - ${rule.maxValue}`;
            default:
                return '';
        }
    };
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

    // Evaluar si un sensorData cumple con una regla
    const evaluateRule = useCallback((
        sensorData: SensorData,
        rule: AlertRule
    ): boolean => {
        if (!rule.isActive) return false;
        if (sensorData.type !== rule.sensorType) return false;

        const value = sensorData.value;

        switch (rule.condition) {
            case 'greater':
                return value > rule.value;
            case 'less':
                return value < rule.value;
            case 'equal':
                return Math.abs(value - rule.value) < 0.01; // Tolerancia para flotantes
            case 'range':
                return rule.maxValue
                    ? value >= rule.value && value <= rule.maxValue
                    : false;
            default:
                return false;
        }
    }, []);

    const handleWebSocketMessage = useCallback((data: WebSocketMessage): void => {
        try {
            let sensorData: SensorData;

            // Parsear el mensaje del WebSocket
            if (typeof data === 'object' && 'id' in data && 'status' in data) {
                sensorData = data as unknown as SensorData;
            } else if (typeof data.content === 'string') {
                sensorData = JSON.parse(data.content);
            } else if (typeof data === 'object' && data.content && typeof data.content === 'object') {
                sensorData = data.content as unknown as SensorData;
            } else {
                return;
            }

            // Validar estructura básica
            if (!sensorData ||
                typeof sensorData.id !== 'string' ||
                typeof sensorData.type !== 'string' ||
                typeof sensorData.value !== 'number') {
                return;
            }
            // Obtener reglas activas
            const activeRules = activeRulesRef.current;
            let matchedRule: AlertRule | undefined;

            // Evaluar contra todas las reglas activas
            for (const rule of activeRules) {
                if (evaluateRule(sensorData, rule)) {
                    matchedRule = rule;
                    break; // Usar la primera regla que coincida
                }
            }

            // Crear alerta si:
            // 1. Hay una regla que coincide, O
            // 2. El status original indica alerta (compatibilidad)
            const shouldCreateAlert = matchedRule ||
                sensorData.status === 'WARNING' ||
                sensorData.status === 'DANGER' ||
                sensorData.status === 'ERROR';

            if (shouldCreateAlert) {
                const newAlert: Alert = sensorDataToAlert(sensorData, matchedRule);

                setAlerts(prev => {
                    // Evitar duplicados del mismo sensor
                    const filtered = prev.filter(
                        alert => alert.sensorData.id !== sensorData.id ||
                            alert.ruleId !== matchedRule?.id
                    );
                    return [newAlert, ...filtered].slice(0, MAX_ALERTS);
                });

                // Ejecutar acciones automáticas si la regla lo especifica
                if (matchedRule?.autoActions && matchedRule.autoActions.length > 0) {
                    // Aquí puedes ejecutar las acciones automáticas
                    // Por ejemplo, enviar notificaciones, activar sistemas, etc.
                }
                showAlertNotification(sensorData);
            }

        } catch (error) {
            console.warn("⚠️ useAlerts: Error procesando mensaje:", error);
        }
    }, [sensorDataToAlert, evaluateRule]);

    const { isConnected, connectionState } = useWebSocket({
        onMessage: handleWebSocketMessage
    });

    const clearAlerts = useCallback((): void => {
        setAlerts([]);
    }, []);

    const dismissAlert = useCallback((id: string): void => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, []);

    // Contadores por tipo
    const criticalCount = alerts.filter(alert => alert.type === 'critical').length;
    const warningCount = alerts.filter(alert => alert.type === 'warning').length;
    const infoCount = alerts.filter(alert => alert.type === 'info').length;

    return {
        alerts,
        isConnected,
        connectionState,
        clearAlerts,
        dismissAlert,
        criticalCount,
        warningCount,
        infoCount
    };
};