/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Forms/IoTGatewayForm.tsx
import { useState, useEffect } from 'react';
import { IoTGateway, IoTGatewayCreate, IoTGatewayUpdate } from '../../interfaces/IoTGateways';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { IoTGatewayService } from '../../services/IotGatewaysServices';
import { MineService } from '../../services/MinesServices';

interface IoTGatewayFormProps {
    initialData?: IoTGateway;
    onSuccess: () => void;
    onCancel: () => void;
}

export const IoTGatewayForm = ({ initialData, onSuccess, onCancel }: IoTGatewayFormProps) => {
    const [formData, setFormData] = useState<IoTGatewayCreate | IoTGatewayUpdate>({
        brand: '',
        description: '',
        mine_zone_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [mineZones, setMineZones] = useState<string[]>([]);
    const [loadingIds, setLoadingIds] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                brand: initialData.brand,
                description: initialData.description || '',
                mine_zone_id: initialData.mine_zone_id || ''
            });

        }
    }, [initialData]);

    useEffect(() => {
        const fetchNodeIds = async () => {
            setLoadingIds(true);
            try {
                const ids = await MineService.getMinesIds();
                console.log("IDs de nodos obtenidos:", ids)
                setMineZones(ids);
            } catch (error) {
                console.error("Error al obtener IDs de nodos:", error);
                // Opcional: mostrar mensaje de error al usuario
            } finally {
                setLoadingIds(false);
            }
        };

        fetchNodeIds();
    }, []);
    const validateField = (name: string, value: any): boolean => {
        const errors = { ...validationErrors };
        let isValid = true;

        if (name === 'brand' && !value) {
            errors[name] = 'La marca es requerida';
            isValid = false;
        } else if (name === 'brand' && value.length < 2) {
            errors[name] = 'La marca debe tener al menos 2 caracteres';
            isValid = false;
        } else {
            delete errors[name];
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        let isValid = true;

        if (!formData.brand) {
            errors.brand = 'La marca es requerida';
            isValid = false;
        }

        if (formData.brand && formData.brand.length < 2) {
            errors.brand = 'La marca debe tener al menos 2 caracteres';
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            setError('Por favor corrija los errores en el formulario');
            return;
        }

        setLoading(true);
        try {
            if (initialData) {
                await IoTGatewayService.updateGateway(initialData.id, formData);
            } else {
                await IoTGatewayService.createGateway(formData as IoTGatewayCreate);
            }
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const renderError = (field: string) => {
        if (!validationErrors[field]) return null;
        return (
            <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors[field]}
            </div>
        );
    };

    const renderValidationInfo = (field: string) => {
        if (validationErrors[field]) return null;
        if (!(formData as any)[field]) return null;
        return (
            <div className="text-green-500 text-xs mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Válido
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="text-red-500 p-2 bg-red-50 rounded flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Marca *</label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand || ''}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 ${validationErrors.brand ? 'border-red-500' : ''
                                }`}
                            placeholder="Ej: Siemens, Allen-Bradley, Schneider"
                            required
                        />
                        {renderError('brand')}
                        {renderValidationInfo('brand')}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID Mina/Zona</label>
                        {loadingIds ? (
                            <select
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                            >
                                <option>Cargando nodos...</option>
                            </select>
                        ) : (
                            <select
                                name="mine_zone_id"
                                value={formData.mine_zone_id || ''}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.id_node ? 'border-red-500' : ''
                                    }`}
                                required
                            >
                                <option value="">Seleccione un nodo...</option>
                                {mineZones.map(id => (
                                    <option key={id} value={id}>{id}</option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Opcional - puede asignarse posteriormente
                        </p>
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            placeholder="Descripción del gateway, ubicación, características..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Opcional - información adicional sobre el gateway
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading || Object.keys(validationErrors).length > 0}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
};