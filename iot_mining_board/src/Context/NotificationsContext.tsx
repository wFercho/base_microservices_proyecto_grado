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

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<AlertNotification[]>([]);

    const addAlert = (alert: Omit<AlertNotification, 'id' | 'timestamp'>) => {
        const newAlert: AlertNotification = {
            ...alert,
            id: generateUUID(), // UUID único para la alerta
            sensorId: alert.sensorId, // Mantener el ID del sensor original
            timestamp: new Date()
        };
        setAlerts(prev => [newAlert, ...prev]);
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