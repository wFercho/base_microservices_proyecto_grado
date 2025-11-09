import { createContext, useContext, useState, ReactNode } from 'react';

interface AlertNotification {
    id: string;
    message: string;
    type: 'WARNING' | 'DANGER' | 'ERROR' | 'INFO';
    timestamp: Date;
    sensorId: string;
}

interface NotificationsContextType {
    alerts: AlertNotification[];
    addAlert: (alert: Omit<AlertNotification, 'id' | 'timestamp'>) => void;
    markAsRead: () => void;
    unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const MAX_NOTIFICATIONS = 50;

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<AlertNotification[]>([]);

    const addAlert = (alert: Omit<AlertNotification, 'id' | 'timestamp'>) => {
        const newAlert: AlertNotification = {
            ...alert,
            id: generateUUID(), // UUID único para la alerta
            sensorId: alert.sensorId, // Mantener el ID del sensor original
            timestamp: new Date()
        };
        
        setAlerts(prev => {
            // Agregar la nueva alerta al inicio
            const updatedAlerts = [newAlert, ...prev];
            
            // Si excede el límite, mantener solo las primeras 50 (las más recientes)
            if (updatedAlerts.length > MAX_NOTIFICATIONS) {
                return updatedAlerts.slice(0, MAX_NOTIFICATIONS);
            }
            
            return updatedAlerts;
        });
    };

    const markAsRead = () => {
        setAlerts([]);
    };

    return (
        <NotificationsContext.Provider
            value={{
                alerts,
                addAlert,
                markAsRead,
                unreadCount: alerts.length
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};