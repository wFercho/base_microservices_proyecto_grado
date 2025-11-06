// components/DeviceTable.tsx
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { useSensorData } from "../hooks/useSensorData";
import { SensorData } from "../../interfaces/Sensors";
import PaginationControls from "../PaginationControls";
import { SensorModal } from "../Sensors/SensorModal";

const PAGE_SIZE = 10;

export default function DeviceTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof SensorData;
        direction: 'ascending' | 'descending'
    } | null>(null);
    const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [subscriptionInput, setSubscriptionInput] = useState("");
    const [currentSubscriptions, setCurrentSubscriptions] = useState<string[]>([]);

    // Usar el hook unificado
    const {
        allSensorData,
        getTableData,
        alerts,
        totalCount,
        okCount,
        criticalAlertsCount,
        warningAlertsCount,
        infoAlertsCount,
        isConnected,
        connectionState,
        dismissAlert,
        subscribeToSensors,
        unsubscribeFromSensors,
        getCurrentSubscriptions
    } = useSensorData();

    // Obtener datos combinados para la tabla
    const tableData = getTableData();

    // Actualizar suscripciones actuales
    useEffect(() => {
        setCurrentSubscriptions(getCurrentSubscriptions());
    }, [getCurrentSubscriptions]);

    // Manejar suscripción
    const handleSubscribe = () => {
        if (!subscriptionInput.trim()) return;

        const sensors = subscriptionInput === 'all'
            ? ['all']
            : subscriptionInput.split(',').map(s => s.trim()).filter(s => s);

        if (sensors.length > 0) {
            subscribeToSensors(sensors);
            setSubscriptionInput("");
        }
    };

    // Manejar cancelación de suscripción
    const handleUnsubscribe = () => {
        if (!subscriptionInput.trim()) return;

        const sensors = subscriptionInput === 'all'
            ? ['all']
            : subscriptionInput.split(',').map(s => s.trim()).filter(s => s);

        if (sensors.length > 0) {
            unsubscribeFromSensors(sensors);
            setSubscriptionInput("");
        }
    };

    // Suscribirse a todos los sensores
    const handleSubscribeAll = () => {
        subscribeToSensors(['all']);
        setSubscriptionInput("");
    };

    // Cancelar todas las suscripciones
    const handleUnsubscribeAll = () => {
        // Obtener suscripciones actuales y cancelarlas todas
        const currentSubs = getCurrentSubscriptions();
        if (currentSubs.length > 0) {
            unsubscribeFromSensors(currentSubs);
        }
        setSubscriptionInput("");
    };

    // Manejar cambio de página
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Ordenar datos
    const sortedData = [...tableData];
    if (sortConfig !== null) {
        sortedData.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            // Manejar valores nulos/indefinidos
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (bVal == null) return sortConfig.direction === 'ascending' ? 1 : -1;

            // Comparación numérica cuando ambos son números
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
            }

            // Comparación por cadena (insensible a mayúsculas)
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();

            if (aStr < bStr) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aStr > bStr) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    // Filtrar datos
    const filteredData = sortedData.filter(item => {
        const lowerSearchTerm = searchTerm.toLowerCase();

        // Filtro especial para alertas
        if (lowerSearchTerm === 'status:warning,danger,error') {
            return item.status === 'WARNING' || item.status === 'DANGER' || item.status === 'ERROR';
        }

        // Filtro para solo OK
        if (lowerSearchTerm === 'status:ok') {
            return item.status === 'OK';
        }

        // Filtro para solo alertas procesadas
        if (lowerSearchTerm === 'type:alert') {
            return alerts.some(alert => alert.sensorData.id === item.id);
        }

        // Filtro normal
        return (
            item.id.toLowerCase().includes(lowerSearchTerm) ||
            item.sensor_id.toLowerCase().includes(lowerSearchTerm) ||
            item.type.toLowerCase().includes(lowerSearchTerm) ||
            item.status?.toLowerCase().includes(lowerSearchTerm) ||
            item.manufacturer.toLowerCase().includes(lowerSearchTerm)
        );
    });

    // Manejar clic en notificación
    const handleNotificationClick = useCallback((sensorId: string) => {
        const sensorIndex = tableData.findIndex(m => m.id === sensorId);

        if (sensorIndex === -1) return;

        const filteredIndex = filteredData.findIndex(m => m.id === sensorId);
        const page = Math.ceil((filteredIndex + 1) / PAGE_SIZE);

        setSearchTerm(sensorId);
        setCurrentPage(page);
        setHighlightedRow(sensorId);

        setTimeout(() => setHighlightedRow(null), 3000);
    }, [tableData, filteredData]);

    // Manejar clic en fila
    const handleRowClick = (sensor: SensorData) => {
        setSelectedSensor(sensor);
        setShowModal(true);
    };

    // Procesar parámetros de URL
    useEffect(() => {
        const alertId = searchParams.get('alert');
        if (alertId) {
            handleNotificationClick(alertId);
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.delete('alert');
                return newParams;
            });
        }
    }, [searchParams, handleNotificationClick, setSearchParams]);

    // Paginación
    const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const requestSort = (key: keyof SensorData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Datos para filtros
    const alertData = tableData.filter(m =>
        m.status === 'WARNING' || m.status === 'DANGER' || m.status === 'ERROR'
    );

    // Función para mapear estados a español
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

    return (
        <div className="flex flex-col h-screen">
            {showModal && selectedSensor && (
                <SensorModal
                    sensor={selectedSensor}
                    onClose={() => setShowModal(false)}
                />
            )}

            <div className="flex-1 bg-white container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 ">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                Datos de Sensores
                            </h1>
                            <p className="text-gray-600 mt-2">Sistema de monitoreo y gestión integral</p>
                        </div>

                        {/* Controles de suscripción */}
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium">
                                    {isConnected ? 'Conectado' : 'Desconectado'} - {connectionState}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {/* Input para suscripciones */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="IDs de sensores (ej: sensor1,sensor2) o 'all'"
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[250px]"
                                    value={subscriptionInput}
                                    onChange={(e) => setSubscriptionInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubscribe();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSubscribe}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                >
                                    Suscribir
                                </button>
                                <button
                                    onClick={handleUnsubscribe}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>

                            {/* Botones para todos */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSubscribeAll}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex-1"
                                >
                                    Suscribir a Todos
                                </button>
                                <button
                                    onClick={handleUnsubscribeAll}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium flex-1"
                                >
                                    Cancelar Todas
                                </button>
                            </div>

                            {/* Mostrar suscripciones actuales */}
                            {currentSubscriptions.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 mb-1">Suscripciones activas:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {currentSubscriptions.map((sub, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                                            >
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filtros mejorados con diseño moderno */}
                <div className="mb-6 space-y-4">
                    {/* Fila de filtros principales */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                            className={`group cursor-pointer relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${!searchTerm
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                Todos
                                <span className={`px-2 py-0.5 rounded-full text-xs ${!searchTerm ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                    {totalCount}
                                </span>
                            </span>
                        </button>

                        <button
                            onClick={() => { setSearchTerm('status:OK'); setCurrentPage(1); }}
                            className={`group cursor-pointer relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${searchTerm === 'status:OK'
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-200'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-sm'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${searchTerm === 'status:OK' ? 'bg-white' : 'bg-green-500'
                                    }`}></span>
                                OK
                                <span className={`px-2 py-0.5 rounded-full text-xs ${searchTerm === 'status:OK' ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                    {okCount}
                                </span>
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setCurrentPage(1);
                                setSearchTerm('status:WARNING,DANGER,ERROR')
                            }}
                            className={`group cursor-pointer relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${searchTerm === 'status:WARNING,DANGER,ERROR'
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300 hover:shadow-sm'
                                }`}
                        >
                            <span className="flex cursor-pointer items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${searchTerm === 'status:WARNING,DANGER,ERROR' ? 'bg-white' : 'bg-red-500'
                                    }`}></span>
                                Alertas
                                <span className={`px-2 py-0.5 rounded-full text-xs ${searchTerm === 'status:WARNING,DANGER,ERROR' ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                    {alertData.length}
                                </span>
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                setSearchTerm('type:alert')
                                setCurrentPage(1);

                            }}
                            className={`group relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${searchTerm === 'type:alert'
                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-200'
                                : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:shadow-sm'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${searchTerm === 'type:alert' ? 'bg-white' : 'bg-purple-500'
                                    }`}></span>
                                Procesadas
                                <span className={`px-2 py-0.5 rounded-full text-xs ${searchTerm === 'type:alert' ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                    {alerts.length}
                                </span>
                            </span>
                        </button>

                        {/* Separador vertical */}
                        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

                        {/* Barra de búsqueda mejorada */}
                        <div className="relative flex-1 min-w-[250px] max-w-md">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar nodo, tipo o fabricante..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setCurrentPage(1);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Badges de alertas activas */}
                    {(criticalAlertsCount > 0 || warningAlertsCount > 0 || infoAlertsCount > 0) && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Alertas Activas:</span>
                            <div className="flex items-center gap-2">
                                {criticalAlertsCount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                        Críticas: {criticalAlertsCount}
                                    </span>
                                )}
                                {warningAlertsCount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-100">
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                        Advertencias: {warningAlertsCount}
                                    </span>
                                )}
                                {infoAlertsCount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        Info: {infoAlertsCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabla (mantener tu JSX existente) */}
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <div className="bg-black px-6 py-4">
                        <h2 className="text-white font-bold text-lg">Zonas Mineras</h2>
                        <p className="text-indigo-100 text-sm">Gestión de minas y áreas de monitoreo</p>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr >
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('node_id')}
                                >
                                    Id Sensor {sortConfig?.key === 'id' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('node_id')}
                                >
                                    Nodo {sortConfig?.key === 'node_id' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer "
                                    onClick={() => requestSort('type')}
                                >
                                    Tipo {sortConfig?.key === 'type' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                    Valor
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer "
                                    onClick={() => requestSort('manufacturer')}
                                >
                                    Fabricante {sortConfig?.key === 'manufacturer' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer "
                                    onClick={() => requestSort('timestamp')}
                                >
                                    Fecha {sortConfig?.key === 'timestamp' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => {
                                    // Obtener la alerta completa para este sensor
                                    const alert = alerts.find(alert => alert.sensorData.id === item.id);
                                    const hasAlert = !!alert; // Convertir a booleano

                                    return (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            id={`sensor-${item.id}`}
                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${highlightedRow === item.id ? 'bg-blue-100 animate-pulse' : ''
                                                } ${hasAlert
                                                    ? `ring-2 ${alert.type === 'critical' ? 'ring-red-400 bg-red-50 hover:bg-red-100' :
                                                        alert.type === 'warning' ? 'ring-yellow-400 bg-yellow-50 hover:bg-yellow-100' :
                                                            'ring-blue-400 bg-blue-50 hover:bg-blue-100'
                                                    }`
                                                    : `${item.status === 'ERROR' ? 'bg-red-50 hover:bg-red-100' :
                                                        item.status === 'DANGER' ? 'bg-red-50 hover:bg-red-100' :
                                                            item.status === 'WARNING' ? 'bg-yellow-50 hover:bg-yellow-100' :
                                                                'bg-green-50 hover:bg-green-100'
                                                    }`
                                                }`}
                                            onClick={() => handleRowClick(alert ? alert.sensorData : item)}
                                        >
                                            <td className="px-6 py-4 text-centerwhitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    {hasAlert && (
                                                        <span className={`
                                ${alert.type === 'critical' ? 'text-red-600' :
                                                                alert.type === 'warning' ? 'text-yellow-600' :
                                                                    'text-blue-600'}
                            `}>
                                                            ⚠️
                                                        </span>
                                                    )}
                                                    {!hasAlert && (
                                                        <>
                                                            {item.status === 'OK' && '🟢'}
                                                            {item.status === 'WARNING' && '🟡'}
                                                            {(item.status === 'DANGER' || item.status === 'ERROR') && '🔴'}
                                                        </>
                                                    )}
                                                    <span className="ml-2">{item.sensor_id}</span>
                                                    {hasAlert && (
                                                        <span className={`
                                ml-2 px-2 py-1 text-xs font-semibold rounded-full
                                ${alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                                                alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-blue-100 text-blue-800'}
                            `}>
                                                            {alert.type.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-centerwhitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    {hasAlert && (
                                                        <span className={`
                                ${alert.type === 'critical' ? 'text-red-600' :
                                                                alert.type === 'warning' ? 'text-yellow-600' :
                                                                    'text-blue-600'}
                            `}>
                                                            ⚠️
                                                        </span>
                                                    )}
                                                    {!hasAlert && (
                                                        <>
                                                            {item.status === 'OK' && '🟢'}
                                                            {item.status === 'WARNING' && '🟡'}
                                                            {(item.status === 'DANGER' || item.status === 'ERROR') && '🔴'}
                                                        </>
                                                    )}
                                                    <span className="ml-2">{item.node_id}</span>
                                                    {hasAlert && (
                                                        <span className={`
                                ml-2 px-2 py-1 text-xs font-semibold rounded-full
                                ${alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                                                alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-blue-100 text-blue-800'}
                            `}>
                                                            {alert.type.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.type}
                                                {hasAlert && alert.ruleId && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Regla: {alert.ruleId}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{item.value.toFixed(2)} {item.unit}</span>
                                                    {hasAlert && (
                                                        <span className="text-xs text-gray-600 mt-1">
                                                            {alert.message}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.manufacturer} ({item.model})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                                                    {hasAlert && (
                                                        <span className="text-xs text-gray-500">
                                                            Alerta: {alert.time}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col space-y-2">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hasAlert
                                                        ? alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                        : item.status === 'OK' ? 'bg-green-100 text-green-800' :
                                                            item.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {hasAlert ? `${mapStatusToSpanish(alert.type)}` : mapStatusToSpanish(item.status)}
                                                    </span>
                                                    {hasAlert && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Evitar que se active el click de la fila
                                                                dismissAlert(alert.id);
                                                            }}
                                                            className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                                        >
                                                            Descartar alerta
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No hay datos disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        variant="bottom"
                    />
                </div>
            </div>
        </div>
    );
}