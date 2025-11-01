// components/Tables/IoTGatewayTable.tsx
import { useState } from 'react';
import { IoTGateway } from '../../interfaces/IoTGateways';
import { Cpu, Radio, Edit, Eye, Trash2 } from 'lucide-react';
import PaginationControls from '../PaginationControls';

interface IoTGatewayTableProps {
    gateways: IoTGateway[];
    onEdit: (gateway: IoTGateway) => void;
    onDelete: (id: number) => void;
    onView: (gateway: IoTGateway) => void;
    currentPage?: number;
    totalPages?: number;
    onPageChange: (page: number) => void;
}

export const IoTGatewayTable = ({
    gateways,
    onEdit,
    onView,
    onDelete,
    currentPage = 1,
    totalPages = 1,
    onPageChange
}: IoTGatewayTableProps) => {
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const countTotalSensors = (gateway: IoTGateway): number => {
        return gateway.sensor_nodes.reduce((total, node) =>
            total + (node.sensors?.length ?? 0), 0
        );
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
        setTimeout(() => {
            onDelete(id);
            setDeletingId(null);
        }, 300);
    };



    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-xl font-bold text-gray-900">Lista de Gateways</h3>
                <p className="text-sm text-gray-500 mt-1">Gestiona todos tus dispositivos IoT</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Marca
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Descripción
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Nodos
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Sensores
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                ID Mina
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {gateways.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Cpu className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 font-medium">No hay gateways registrados</p>
                                        <p className="text-gray-500 text-sm mt-1">Comienza agregando un nuevo gateway</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            gateways.map((gateway) => (
                                <tr
                                    key={gateway.id}
                                    className={`transition-all duration-200 ${hoveredRow === gateway.id
                                            ? 'bg-purple-50 scale-[1.01]'
                                            : 'hover:bg-purple-50'
                                        } ${deletingId === gateway.id
                                            ? 'opacity-50 scale-95'
                                            : ''
                                        }`}
                                    onMouseEnter={() => setHoveredRow(gateway.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-semibold text-gray-900">
                                            #{gateway.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {gateway.brand}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <span className="text-sm text-gray-600 line-clamp-2">
                                            {gateway.description || 'Sin descripción'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                            <Cpu className="w-3 h-3 mr-1" />
                                            {gateway.sensor_nodes.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                            <Radio className="w-3 h-3 mr-1" />
                                            {countTotalSensors(gateway)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {gateway.mine_zone_id ? (
                                            <span className="text-sm text-gray-900 font-mono">
                                                {gateway.mine_zone_id}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">
                                                No asignado
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => onView(gateway)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-150 hover:scale-110"
                                                title="Ver detalles"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(gateway)}
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-150 hover:scale-110"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(gateway.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-150 hover:scale-110"
                                                title="Eliminar"
                                                disabled={deletingId === gateway.id}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                variant="bottom"
            />

            {/* Footer informativo */}
            <div className="bg-gray-50 px-6 py-3 text-right text-xs text-gray-500">
                Total de minas: {gateways.length} • Actualizado automáticamente
            </div>
        </div>
    );
};