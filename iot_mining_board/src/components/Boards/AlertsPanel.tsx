// components/AlertsPanel.tsx
import React from 'react';
import { Activity, AlertTriangle } from "lucide-react";
import { Alert, useAlerts } from "../hooks/useAlerts";

export const AlertsPanel: React.FC = () => {
  const {
    alerts,
    isConnected,
    clearAlerts,
    criticalCount,
    warningCount
  } = useAlerts();

  const getAlertIcon = (type: string): React.ReactElement => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <Activity className="text-blue-500" size={20} />;
    }
  };

  const getAlertStyles = (type: 'critical' | 'warning' | 'info'): string => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-500';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500';
      default:
        return 'bg-blue-50 border-blue-500';
    }
  };
  const mapStatusToSpanish = (status: string): string => {
    const statusMap: Record<string, string> = {
      'critical': 'CRÍTICO',
      'warning': 'ADVERTENCIA',
      'info': 'INFORMATIVO'
    };

    return statusMap[status] || status.toUpperCase();
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <AlertTriangle className="mr-2 text-red-500" />
          Alertas Activas
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {isConnected ? '● En vivo' : '● Desconectado'}
          </span>
        </h3>

        <div className="flex gap-3 text-sm">
          {criticalCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
              {criticalCount} críticas
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
              {warningCount} advertencias
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm">
              {isConnected
                ? 'No hay alertas activas en este momento'
                : 'Esperando conexión...'}
            </p>
          </div>
        ) : (
          alerts.map((alert: Alert, index: number) => (
            <div
              key={`${alert.id}-${index}`}
              className={`p-3 rounded-lg border-l-4 ${getAlertStyles(alert.type)} transition-all duration-300 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getAlertIcon(mapStatusToSpanish(alert.type))}
                  <div className="ml-3">
                    <p className="font-medium text-sm">{alert.sensor}</p>
                    <p className="text-xs text-gray-600">{alert.zone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{alert.value}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
              <p className="text-xs text-gray-700 mt-2">{alert.message}</p>
            </div>
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
          <span>Mostrando {alerts.length} de {100} alertas máximas</span>
          <button
            onClick={clearAlerts}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Limpiar todas
          </button>
        </div>
      )}
    </div>
  );
};