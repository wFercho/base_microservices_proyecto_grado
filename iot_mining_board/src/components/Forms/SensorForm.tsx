/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {  SensorService } from '../../services/SensorServices';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { PrecisionSlider } from '../PrecisionSlider';
import { Sensor } from '../../interfaces/Sensors';

interface SensorFormProps {
  initialData?: Partial<Sensor>;
  onSuccess: () => void;
  onCancel: () => void;
}
const OPCIONES_REFERENCIA = [
  "P3000", "L5000", "N6000", "C4000", "T1000", "H2000"
];

const OPCIONES_MARCA = [
  "AirQuality", "HumidTech", "NoiseGuard",
  "LightMeter", "TempCorp", "PressSense"
];

const UNIDADES_PERMITIDAS = [
  'µg/m³',
  '°C',
  '%',
  'lux',
  'dB',
  'ppm',
  'Pa'
];

const PRECISION_VALUES = [
  1.12, 1.5, 2.16, 2.23, 0.37, 2.43, 3.67, 3.7, 0.38, 0.42,
  3.29, 2.64, 4.6, 1.09, 1.34, 4.0, 4.57, 0.39, 4.78, 3.68,
  // ... añade todos tus valores aquí
];
// Configuration for variable types with their validation ranges
const VARIABLE_CONFIGS: Record<string, { min: number; max: number; unit: string; precision: number; description: string }> = {
  PM10: {
    min: 0,
    max: 1000,
    unit: 'µg/m³',
    precision: 1,
    description: 'Partículas de 10 micrómetros'
  },
  Temperatura: {
    min: -40,
    max: 125,
    unit: '°C',
    precision: 0.1,
    description: 'Temperatura ambiente'
  },
  Humedad: {
    min: 0,
    max: 100,
    unit: '%RH',
    precision: 0.5,
    description: 'Humedad relativa'
  },
  'PM2.5': {
    min: 0,
    max: 500,
    unit: 'µg/m³',
    precision: 1,
    description: 'Partículas de 2.5 micrómetros'
  },
  Presión: {
    min: 300,
    max: 1100,
    unit: 'hPa',
    precision: 0.1,
    description: 'Presión atmosférica'
  },
  CO2: {
    min: 0,
    max: 10000,
    unit: 'ppm',
    precision: 50,
    description: 'Dióxido de carbono'
  },
  VOC: {
    min: 0,
    max: 60000,
    unit: 'ppb',
    precision: 10,
    description: 'Compuestos orgánicos volátiles'
  },
  Luminosidad: {
    min: 0,
    max: 120000,
    unit: 'lux',
    precision: 100,
    description: 'Nivel de iluminación'
  },
  Ruido: {
    min: 30,
    max: 130,
    unit: 'dB',
    precision: 0.1,
    description: 'Nivel de ruido ambiental'
  }
};

const timeUnits = ['s', 'ms', 'us', 'min', 'h'];
const durabilityUnits = ['años', 'meses', 'dias', 'horas'];
const voltageTypes = ['DC', 'AC'];
const installationModes = ['Superficie', 'Empotrado', 'Colgante', 'Subterraneo'];
const outputTypes = ['Digital', 'Analógica', 'RS485', 'Modbus', '4-20mA', '0-10V'];

export const SensorForm = ({ initialData, onSuccess, onCancel }: SensorFormProps) => {
  const [formData, setFormData] = useState<Partial<Sensor>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [nodeIds, setNodeIds] = useState<string[]>([]);
  const [loadingIds, setLoadingIds] = useState(true);

  // Set default values when variable changes
  useEffect(() => {
    if (formData.variable && VARIABLE_CONFIGS[formData.variable]) {
      const config = VARIABLE_CONFIGS[formData.variable];
      setFormData(prev => ({
        ...prev,
        unidad_medicion: config.unit,
        min_medicion: config.min,
        max_medicion: config.max,
        precision: config.precision
      }));
    }
  }, [formData.variable]);

  const validateField = (name: string, value: any): boolean => {
    const errors = { ...validationErrors };
    let isValid = true;

    // Required fields validation
    if (['variable', 'marca', 'referencia', 'id_node', 'unidad_medicion'].includes(name) && !value) {
      errors[name] = 'Este campo es requerido';
      isValid = false;
    } else if (name === 'id_node' && value && !/^node_\d+$/.test(value)) {
      errors[name] = 'Formato inválido (ej: node_1)';
      isValid = false;
    } else if (name === 'min_medicion' && formData.max_medicion && value >= formData.max_medicion) {
      errors[name] = 'Debe ser menor que el máximo';
      isValid = false;
    } else if (name === 'max_medicion' && formData.min_medicion && value <= formData.min_medicion) {
      errors[name] = 'Debe ser mayor que el mínimo';
      isValid = false;
    } else if (name === 'temperatura_min' && value < -273) {
      errors[name] = 'No puede ser menor que -273°C';
      isValid = false;
    } else if (name === 'temperatura_max' && formData.temperatura_min && value <= formData.temperatura_min) {
      errors[name] = 'Debe ser mayor que la temperatura mínima';
      isValid = false;
    } else if (name === 'voltaje_min' && formData.voltaje_max && value >= formData.voltaje_max) {
      errors[name] = 'Debe ser menor que el voltaje máximo';
      isValid = false;
    } else if (name === 'voltaje_max' && formData.voltaje_min && value <= formData.voltaje_min) {
      errors[name] = 'Debe ser mayor que el voltaje mínimo';
      isValid = false;
    } else {
      delete errors[name];
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    const newValue = type === 'number' ? (value === '' ? undefined : Number(value)) :
      type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
    validateField(name, newValue);
  };

  const handleSliderChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateForm = (): boolean => {
    const requiredFields = ['variable', 'marca', 'referencia', 'id_node', 'unidad_medicion'];
    let isValid = true;
    const errors: Record<string, string> = {};

    // Validate required fields
    requiredFields.forEach(field => {
      if (!formData[field as keyof Sensor]) {
        errors[field] = 'Este campo es requerido';
        isValid = false;
      }
    });

    // Validate numeric ranges
    if (formData.min_medicion !== undefined && formData.max_medicion !== undefined &&
      formData.min_medicion >= formData.max_medicion) {
      errors.min_medicion = 'Debe ser menor que el máximo';
      isValid = false;
    }

    if (formData.temperatura_min !== undefined && formData.temperatura_max !== undefined &&
      formData.temperatura_min >= formData.temperatura_max) {
      errors.temperatura_min = 'Debe ser menor que la temperatura máxima';
      isValid = false;
    }

    if (formData.voltaje_min !== undefined && formData.voltaje_max !== undefined &&
      formData.voltaje_min >= formData.voltaje_max) {
      errors.voltaje_min = 'Debe ser menor que el voltaje máximo';
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
    console.log(formData)
    try {
      if (formData.id) {
        await SensorService.updateSensor(formData.id, formData);
      } else {
        await SensorService.createSensor(formData as Omit<Sensor, 'id'>);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getRangeForVariable = () => {
    if (!formData.variable || !VARIABLE_CONFIGS[formData.variable]) {
      return { min: 0, max: 100, step: 1 };
    }
    const config = VARIABLE_CONFIGS[formData.variable];
    return {
      min: config.min,
      max: config.max,
      step: config.precision
    };
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

  useEffect(() => {
    const fetchNodeIds = async () => {
      setLoadingIds(true);
      try {
        const ids = await SensorService.getIdsSensors();
        setNodeIds(ids);
      } catch (error) {
        console.error("Error al obtener IDs de nodos:", error);
        // Opcional: mostrar mensaje de error al usuario
      } finally {
        setLoadingIds(false);
      }
    };

    fetchNodeIds();
  }, []);
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 p-2 bg-red-50 rounded flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Variable*</label>
            <select
              name="variable"
              value={formData.variable || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.variable ? 'border-red-500' : ''
                }`}
              required
            >
              <option value="">Seleccionar variable...</option>
              {Object.keys(VARIABLE_CONFIGS).map(variable => (
                <option key={variable} value={variable}>{variable}</option>
              ))}
            </select>
            {renderError('variable')}
            {formData.variable && VARIABLE_CONFIGS[formData.variable] && (
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {VARIABLE_CONFIGS[formData.variable].description}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marca*</label>
            <select
              name="marca"
              value={formData.marca || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.marca ? 'border-red-500' : ''
                }`}
              required
            >
              <option value="">Seleccione una marca...</option>
              {OPCIONES_MARCA.map(opcion => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
            {renderError('marca')}
            {renderValidationInfo('marca')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Referencia*</label>
            <select
              name="referencia"
              value={formData.referencia || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.referencia ? 'border-red-500' : ''
                }`}
              required
            >
              <option value="">Seleccione una referencia...</option>
              {OPCIONES_REFERENCIA.map(opcion => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
            {renderError('referencia')}
            {renderValidationInfo('referencia')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ID Nodo*</label>
            {loadingIds ? (
              <select
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
              >
                <option>Cargando nodos...</option>
              </select>
            ) : (
              <select
                name="id_node"
                value={formData.id_node || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.id_node ? 'border-red-500' : ''
                  }`}
                required
              >
                <option value="">Seleccione un nodo...</option>
                {nodeIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            )}
            {renderError('id_node')}
            {renderValidationInfo('id_node')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Unidad de Medición*</label>
            <select
              name="unidad_medicion"
              value={formData.unidad_medicion || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.unidad_medicion ? 'border-red-500' : ''
                }`}
              required
            >
              <option value="">Seleccione una unidad...</option>
              {UNIDADES_PERMITIDAS.map(unidad => (
                <option key={unidad} value={unidad}>{unidad}</option>
              ))}
            </select>
            {renderError('unidad_medicion')}
          </div>
        </div>

        {/* Right Column - Measurement Range */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rango de Medición</label>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mínima Medición*</label>
                <RangeSlider
                  min={getRangeForVariable().min}
                  max={getRangeForVariable().max}
                  value={formData.min_medicion || getRangeForVariable().min}
                  onChange={(value) => handleSliderChange('min_medicion', value)}
                  step={getRangeForVariable().step}
                  unit={formData.unidad_medicion}
                />
                {renderError('min_medicion')}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Máxima Medición*</label>
                <RangeSlider
                  min={getRangeForVariable().min}
                  max={getRangeForVariable().max}
                  value={formData.max_medicion || getRangeForVariable().max}
                  onChange={(value) => handleSliderChange('max_medicion', value)}
                  step={getRangeForVariable().step}
                  unit={formData.unidad_medicion}
                />
                {renderError('max_medicion')}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precisión del Sensor
            </label>
            <PrecisionSlider
              value={formData.precision || PRECISION_VALUES[0]}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, precision: value }));
                validateField('precision', value);
              }} possibleValues={PRECISION_VALUES}
              unit="%"
            />
            {renderError('precision')}
          </div>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {showAdvanced ? 'Ocultar configuración avanzada' : 'Mostrar configuración avanzada'}
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Settings */}
      {
        showAdvanced && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiempo Respuesta (Valor)</label>
                    <input
                      type="number"
                      name="tiempo_respuesta_valor"
                      placeholder='0,1,2,3,4,5'
                      value={formData.tiempo_respuesta_valor ?? ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiempo Respuesta (Unidad)</label>
                    <select
                      name="tiempo_respuesta_unidad"
                      value={formData.tiempo_respuesta_unidad || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      {timeUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolución</label>
                  <RangeSlider
                    min={0.0}
                    max={1}
                    value={formData.referencia || 0}
                    onChange={(value) => handleSliderChange('referencia', value)}
                    step={0.001}
                    unit={formData.unidad_medicion}
                  />
                  {renderError('min_medicion')}
                </div>
            

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rango de Temperatura de Operación</label>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Mínima (°C)</label>
                      <RangeSlider
                        min={-273}
                        max={150}
                        value={formData.temperatura_min || 0}
                        onChange={(value) => handleSliderChange('temperatura_min', value)}
                        step={0.1}
                        unit="°C"
                      />
                      {renderError('temperatura_min')}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Máxima (°C)</label>
                      <RangeSlider
                        min={-273}
                        max={150}
                        value={formData.temperatura_max || 50}
                        onChange={(value) => handleSliderChange('temperatura_max', value)}
                        step={0.1}
                        unit="°C"
                      />
                      {renderError('temperatura_max')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Voltaje</label>
                  <select
                    name="voltaje_tipo"
                    value={formData.voltaje_tipo || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    {voltageTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rango de Voltaje</label>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Mínimo (V)</label>
                      <RangeSlider
                        min={0}
                        max={24}
                        value={formData.voltaje_min || 0}
                        onChange={(value) => handleSliderChange('voltaje_min', value)}
                        step={0.1}
                        unit="V"
                      />
                      {renderError('voltaje_min')}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Máximo (V)</label>
                      <RangeSlider
                        min={0}
                        max={24}
                        value={formData.voltaje_max || 5}
                        onChange={(value) => handleSliderChange('voltaje_max', value)}
                        step={0.1}
                        unit="V"
                      />
                      {renderError('voltaje_max')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Corriente Mín (A)</label>
                    <input
                      type="number"
                      name="corriente_min"
                      value={formData.corriente_min ?? ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      step="any"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Corriente Máx (A)</label>
                    <input
                      type="number"
                      name="corriente_max"
                      value={formData.corriente_max ?? ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      step="any"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Durabilidad (Valor)</label>
                <input
                  type="number"
                  name="durabilidad_valor"
                  value={formData.durabilidad_valor ?? ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Durabilidad (Unidad)</label>
                <select
                  name="durabilidad_unidad"
                  value={formData.durabilidad_unidad || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  {durabilityUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Modo de Instalación</label>
                <select
                  name="modo_instalacion"
                  value={formData.modo_instalacion || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  {installationModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Salida</label>
                <select
                  name="tipo_salida"
                  value={formData.tipo_salida || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  {outputTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Certificados</label>
                <input
                  type="text"
                  name="certificados"
                  value={formData.certificados || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="ISO, CE, UL, etc."
                />
              </div>
            </div>
          </div>
        )
      }

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form >
  );
};

// RangeSlider component
interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  className?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  unit = '',
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          className="flex-1"
        />
        <span className="text-sm font-medium bg-blue-100 px-2 py-1 rounded w-20 text-center">
          {value}{unit}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};