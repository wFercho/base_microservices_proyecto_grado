import { useState } from 'react';
import { MineZone } from '../../interfaces/Mines';
import PaginationControls from '../PaginationControls';

interface MineTableProps {
    mines: MineZone[];
    onEdit: (mine: MineZone) => void;
    onView: (mine: MineZone) => void;
    onDelete: (id: string) => void;
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export const MineTable = ({ mines, onEdit, onView, onDelete, totalPages, currentPage, onPageChange }: MineTableProps) => {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);


    const handleDelete = (id: string) => {
        setDeletingId(id);
        setTimeout(() => {
            onDelete(id);
            setDeletingId(null);
        }, 300);
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    const getMineTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            underground: 'bg-purple-100 text-purple-800',
            open_pit: 'bg-orange-100 text-orange-800',
            hybrid: 'bg-blue-100 text-blue-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const countTotalSensors = (mine: MineZone): number => {
        return mine.iot_gateways.reduce((total, gateway) => {
            return total + gateway.sensor_nodes.reduce((nodeTotal, node) => {
                return nodeTotal + (node.sensors?.length || 0);
            }, 0);
        }, 0);
    };

    const getMineTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            underground: 'Subterránea',
            open_pit: 'Cielo Abierto',
            hybrid: 'Híbrida',
            processing: 'Procesamiento'
        };
        return labels[type] || type;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
                <h2 className="text-white font-bold text-lg">Zonas Mineras</h2>
                <p className="text-indigo-100 text-sm">Gestión de minas y áreas de monitoreo</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center">
                                <div className="flex justify-center items-center space-x-1">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mina</span>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-center">
                                <div className="flex justify-center items-center space-x-1">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</span>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-center">
                                <div className="flex justify-center items-center space-x-1">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</span>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-center">
                                <div className="flex justify-center items-center space-x-1">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</span>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-center">
                                <div className="flex justify-center items-center space-x-1">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dispositivos</span>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-center">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mines.map((mine) => (
                            <tr
                                key={mine.id}
                                className={`${hoveredRow === mine.id ? 'bg-indigo-50' : 'bg-white'} 
                  ${deletingId === mine.id ? 'animate-pulse opacity-50' : ''}
                  transition-all duration-200`}
                                onMouseEnter={() => setHoveredRow(mine.id)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-sm font-medium text-gray-900">{mine.name}</div>
                                        <div className="text-xs text-gray-500">{mine.description}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="text-sm text-gray-900">{mine.location || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMineTypeColor(mine.mine_type || '')}`}>
                                            {getMineTypeLabel(mine.mine_type || 'N/A')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mine.status)}`}>
                                            {mine.status === 'active' ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center space-y-1 text-sm text-gray-900">
                                        <div className="flex items-center space-x-1">
                                            <span className="font-medium">Gateways:</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {mine.iot_gateways.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="font-medium">Nodos:</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {mine.iot_gateways.reduce((total, gw) => total + gw.sensor_nodes.length, 0)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="font-medium">Sensores:</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {countTotalSensors(mine)}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={() => onView(mine)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => onEdit(mine)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(mine.id)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Paginación */}
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                variant="bottom"
            />

            {/* Footer informativo */}
            <div className="bg-gray-50 px-6 py-3 text-right text-xs text-gray-500">
                Total de minas: {mines.length} • Actualizado automáticamente
            </div>
        </div>
    );
}