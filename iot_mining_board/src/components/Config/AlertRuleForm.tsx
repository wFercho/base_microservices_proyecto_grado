// components/AlertRuleForm.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, Info } from 'lucide-react';
import { AlertRule } from '../context/AlertRulesContext';
import { MineService } from '../../services/MinesServices';
import { MineZone } from '../../interfaces/Mines';

interface AlertRuleFormProps {
    rule?: AlertRule;
    onSubmit: (ruleData: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

// Basado en las normativas del backend
const SENSOR_TYPES = [
    { value: 'PM10', label: 'PM10 - Material particulado ≤10µm', norm: 'ISO 14001' },
    { value: 'PM2.5', label: 'PM2.5 - Material particulado ≤2.5µm', norm: 'EPA Standard' },
    { value: 'Temperatura', label: 'Temperatura ambiente', norm: 'ATEX' },
    { value: 'Humedad', label: 'Humedad relativa', norm: 'OSHA' },
    { value: 'CO', label: 'Monóxido de carbono (CO)', norm: 'ATEX' },
    { value: 'CO2', label: 'Dióxido de carbono (CO2)', norm: 'ATEX' },
    { value: 'O2', label: 'Oxígeno (O2)', norm: 'ATEX' },
    { value: 'H2S', label: 'Sulfuro de hidrógeno (H2S)', norm: 'ATEX' },
    { value: 'NO2', label: 'Dióxido de nitrógeno (NO2)', norm: 'ATEX' },
    { value: 'Ruido', label: 'Nivel de presión sonora', norm: 'ATEX' },
    { value: 'Vibracion', label: 'Vibración cuerpo completo', norm: 'ISO 2631' },
    { value: 'Metano', label: 'Gas metano (CH4)', norm: 'ATEX' },
    { value: 'Polvo_Respirable', label: 'Polvo respirable', norm: 'ATEX' },
    { value: 'Iluminacion', label: 'Nivel de iluminación', norm: 'ATEX' }
];


/* 
const AUTO_ACTIONS = [
    'Activar ventilación',
    'Cerrar accesos',
    'Notificar supervisor',
    'Activar deshumidificadores',
    'Encender luces de emergencia',
    'Activar sistema de extracción',
    'Enviar alerta a seguridad',
    'Registrar en log del sistema',
    'Activar modo ahorro energía',
    'Notificar mantenimiento',
    'Parar maquinaria',
    'Evacuar área'
]; */

// Valores por defecto basados en normativas
const DEFAULT_THRESHOLDS: Record<string, { warning: number; critical: number; unit: string }> = {
    'PM10': { warning: 150, critical: 250, unit: 'µg/m³' },
    'PM2.5': { warning: 75, critical: 150, unit: 'µg/m³' },
    'Temperatura': { warning: 32, critical: 35, unit: '°C' },
    'Humedad': { warning: 75, critical: 85, unit: '%' },
    'CO': { warning: 35, critical: 50, unit: 'ppm' },
    'CO2': { warning: 7500, critical: 10000, unit: 'ppm' },
    'O2': { warning: 19, critical: 18, unit: '%' },
    'H2S': { warning: 10, critical: 15, unit: 'ppm' },
    'NO2': { warning: 3, critical: 5, unit: 'ppm' },
    'Ruido': { warning: 90, critical: 100, unit: 'dB' },
    'Vibracion': { warning: 10, critical: 15, unit: 'm/s²' },
    'Metano': { warning: 0.8, critical: 1.0, unit: '%' },
    'Polvo_Respirable': { warning: 4, critical: 5, unit: 'mg/m³' },
    'Iluminacion': { warning: 30, critical: 20, unit: 'lux' }
};

export const AlertRuleForm: React.FC<AlertRuleFormProps> = ({
    rule,
    onSubmit,
    onCancel
}) => {
    const [formData, setFormData] = useState<Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>>({
        name: '',
        sensorType: '',
        condition: 'greater',
        value: 0,
        maxValue: undefined,
        level: 'info',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: [],
        isActive: true
    });

    const [zones, setZones] = useState<MineZone[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (rule) {
            // Cargar datos de la regla existente
            setFormData({
                name: rule.name,
                sensorType: rule.sensorType,
                condition: rule.condition,
                value: rule.value,
                maxValue: rule.maxValue,
                level: rule.level,
                zones: rule.zones,
                emailNotification: rule.emailNotification,
                smsNotification: rule.smsNotification,
                autoActions: rule.autoActions,
                isActive: rule.isActive
            });
        }
    }, [rule]);

    useEffect(() => {
        const fetchZones = async () => {
            const zones = await MineService.getAllMines();
            setZones(zones);
        };
        fetchZones();

    }, [rule]);

    const handleSensorTypeChange = (sensorType: string) => {
        const thresholds = DEFAULT_THRESHOLDS[sensorType];
        const newFormData: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'> = {
            ...formData,
            sensorType,
            value: thresholds?.warning ?? 0,
            level: 'warning'
        };

        // Para O2, la condición debe ser "less" ya que es peligroso cuando baja
        if (sensorType === 'O2') {
            newFormData.condition = 'less';
            newFormData.value = thresholds?.critical ?? 0;
            newFormData.level = 'critical';
        }

        // Para iluminación, también puede ser "less" cuando hay poca luz
        if (sensorType === 'Iluminacion') {
            newFormData.condition = 'less';
            newFormData.value = thresholds?.critical ?? 0;
        }

        setFormData(newFormData);
    };

    const handleConditionChange = (condition: AlertRule['condition']) => {
        setFormData(prev => ({ ...prev, condition }));

        // Si cambia a rango, inicializar maxValue
        if (condition === 'range' && !formData.maxValue) {
            const thresholds = DEFAULT_THRESHOLDS[formData.sensorType];
            setFormData(prev => ({
                ...prev,
                maxValue: thresholds?.critical || (formData.value * 1.5)
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre de la regla es requerido';
        }

        if (!formData.sensorType) {
            newErrors.sensorType = 'Debe seleccionar un tipo de sensor';
        }

        if (formData.value === undefined || formData.value === null) {
            newErrors.value = 'El valor umbral es requerido';
        }

        if (formData.condition === 'range' && (!formData.maxValue || formData.maxValue <= formData.value)) {
            newErrors.maxValue = 'El valor máximo debe ser mayor al valor mínimo';
        }

        if (formData.zones.length === 0) {
            newErrors.zones = 'Debe seleccionar al menos una zona';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const getNormativaInfo = (sensorType: string) => {
        const sensor = SENSOR_TYPES.find(s => s.value === sensorType);
        const thresholds = DEFAULT_THRESHOLDS[sensorType];

        if (!sensor || !thresholds) return null;

        return {
            normativa: sensor.norm,
            warning: thresholds.warning,
            critical: thresholds.critical,
            unit: thresholds.unit
        };
    };

    const normativaInfo = getNormativaInfo(formData.sensorType);

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {rule ? 'Editar Regla de Alerta' : 'Nueva Regla de Alerta'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información de Normativa */}
                    {normativaInfo && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Info size={20} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-blue-800 text-sm">
                                        Normativa de Referencia: {normativaInfo.normativa}
                                    </h4>
                                    <p className="text-blue-700 text-sm mt-1">
                                        Valores recomendados:
                                        <span className="font-medium"> Advertencia: {normativaInfo.warning} {normativaInfo.unit}</span>,
                                        <span className="font-medium"> Crítico: {normativaInfo.critical} {normativaInfo.unit}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre de la Regla */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la Regla *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Ej: CO2 Crítico en Galería Principal"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Tipo de Sensor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Sensor *
                            </label>
                            <select
                                value={formData.sensorType}
                                onChange={(e) => handleSensorTypeChange(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sensorType ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="">Seleccionar sensor</option>
                                {SENSOR_TYPES.map(sensor => (
                                    <option key={sensor.value} value={sensor.value}>
                                        {sensor.label}
                                    </option>
                                ))}
                            </select>
                            {errors.sensorType && (
                                <p className="text-red-500 text-sm mt-1">{errors.sensorType}</p>
                            )}
                        </div>

                        {/* Nivel de Alerta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nivel de Alerta
                            </label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    level: e.target.value as AlertRule['level']
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="info">Informativo</option>
                                <option value="warning">Advertencia</option>
                                <option value="critical">Crítico</option>
                            </select>
                        </div>

                        {/* Condición */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condición *
                            </label>
                            <select
                                value={formData.condition}
                                onChange={(e) => handleConditionChange(e.target.value as AlertRule['condition'])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="greater">Mayor que</option>
                                <option value="less">Menor que</option>
                                <option value="equal">Igual a</option>
                                <option value="range">En rango</option>
                            </select>
                        </div>

                        {/* Valor Umbral */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {formData.condition === 'range' ? 'Valor Mínimo *' : 'Valor Umbral *'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    value: parseFloat(e.target.value) || 0
                                }))}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.value ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.value && (
                                <p className="text-red-500 text-sm mt-1">{errors.value}</p>
                            )}
                        </div>

                        {/* Valor Máximo (solo para rango) */}
                        {formData.condition === 'range' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor Máximo *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.maxValue || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        maxValue: parseFloat(e.target.value) || undefined
                                    }))}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.maxValue ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.maxValue && (
                                    <p className="text-red-500 text-sm mt-1">{errors.maxValue}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Zonas Afectadas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zonas Afectadas *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-md">
                            {zones.map(zone => (
                                <label key={zone.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.zones.includes(zone.id)}
                                        onChange={(e) => {
                                            const newZones = e.target.checked
                                                ? [...formData.zones, zone.id]
                                                : formData.zones.filter(z => z !== zone.id);
                                            setFormData(prev => ({ ...prev, zones: newZones }));
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{zone.nombre}</span>
                                </label>
                            ))}
                        </div>
                        {errors.zones && (
                            <p className="text-red-500 text-sm mt-1">{errors.zones}</p>
                        )}
                    </div>

                    {/* Notificaciones */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Notificaciones
                        </label>
                        <div className="flex space-x-6">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.emailNotification}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        emailNotification: e.target.checked
                                    }))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">📧 Email</span>
                            </label>
                         
                        </div>
                    </div>

                    {/* Acciones Automáticas */}
                    {/*   <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Acciones Automáticas
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-md">
                            {AUTO_ACTIONS.map(action => (
                                <label key={action} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.autoActions.includes(action)}
                                        onChange={(e) => {
                                            const newActions = e.target.checked
                                                ? [...formData.autoActions, action]
                                                : formData.autoActions.filter(a => a !== action);
                                            setFormData(prev => ({ ...prev, autoActions: newActions }));
                                        }}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{action}</span>
                                </label>
                            ))}
                        </div>
                    </div> */}

                    {/* Estado */}
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isActive: e.target.checked
                                }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Regla activa</span>
                        </label>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center transition-colors"
                        >
                            <Save size={16} className="mr-2" />
                            {rule ? 'Actualizar Regla' : 'Crear Regla'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};