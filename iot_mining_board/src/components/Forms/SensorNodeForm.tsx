/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Forms/SensorNodeForm.tsx
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { SensorNode, SensorNodeCreate, SensorNodeUpdate } from '../../interfaces/Nodes';
import { SensorNodeService } from '../../services/NodesServices';
import { IoTGatewayService } from '../../services/IotGatewaysServices';

interface SensorNodeFormProps {
  initialData?: Partial<SensorNode>;
  onSuccess: () => void;
  onCancel: () => void;
}

const ZONE_CATEGORIES = [
  'Interior',
  'Exterior',
  'Industrial',
  'Residencial',
  'Comercial',
  'Laboratorio',
  'Almacenamiento'
];

export const SensorNodeForm = ({ initialData, onSuccess, onCancel }: SensorNodeFormProps) => {
  const [formData, setFormData] = useState<Partial<SensorNode>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [iotIds, setIotIds] = useState<string[]>([]);
  const [loadingIds, setLoadingIds] = useState(true);

  const validateField = (name: string, value: any): boolean => {
    const errors = { ...validationErrors };
    let isValid = true;

    if (name === 'id' && !value) {
      errors[name] = 'El ID es requerido';
      isValid = false;
    } else if (name === 'id' && value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
      errors[name] = 'El ID solo puede contener letras, números, guiones y guiones bajos';
      isValid = false;
    } else if (name === 'brand' && !value) {
      errors[name] = 'La marca es requerida';
      isValid = false;
    } else if (name === 'description' && !value) {
      errors[name] = 'La descripción es requerida';
      isValid = false;
    } else if (name === 'description' && value && value.length < 5) {
      errors[name] = 'La descripción debe tener al menos 5 caracteres';
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

    if (!formData.id) {
      errors.id = 'El ID es requerido';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      errors.id = 'El ID solo puede contener letras, números, guiones y guiones bajos';
      isValid = false;
    }

    if (!formData.brand) {
      errors.brand = 'La marca es requerida';
      isValid = false;
    }

    if (!formData.description) {
      errors.description = 'La descripción es requerida';
      isValid = false;
    } else if (formData.description.length < 5) {
      errors.description = 'La descripción debe tener al menos 5 caracteres';
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
      if (formData.id && initialData?.id) {
        // Actualizar nodo existente
        await SensorNodeService.updateSensorNode(formData.id, formData as SensorNodeUpdate);
      } else {
        // Crear nuevo nodo - el ID es requerido
        await SensorNodeService.createSensorNode({
          id: formData.id!,
          brand: formData.brand!,
          description: formData.description!,
          zone_category: formData.zone_category,
          zone_name: formData.zone_name,
          id_iot_gateway: formData.id_iot_gateway
        } as SensorNodeCreate);
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

  useEffect(() => {
    const fetchNodeIds = async () => {
      setLoadingIds(true);
      try {
        const ids = await IoTGatewayService.getIotIds();
        console.log("IDs de nodos obtenidos:", ids)
        setIotIds(ids);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-500 p-2 bg-red-50 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID del Nodo*</label>
            <input
              type="text"
              name="id"
              value={formData.id || ''}
              onChange={handleChange}
              disabled={!!initialData?.id} // No permitir editar el ID si ya existe
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.id ? 'border-red-500' : ''
                } ${initialData?.id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ej: node_001, sala_servidores, etc."
              required
            />
            {renderError('id')}
            {renderValidationInfo('id')}
            <p className="text-xs text-gray-500 mt-1">
              Usa letras, números, guiones y guiones bajos. No se puede cambiar después de crear.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marca*</label>
            <input
              type="text"
              name="brand"
              value={formData.brand || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.brand ? 'border-red-500' : ''
                }`}
              placeholder="Ej: Siemens, Honeywell, Arduino, etc."
              required
            />
            {renderError('brand')}
            {renderValidationInfo('brand')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría de Zona</label>
            <select
              name="zone_category"
              value={formData.zone_category || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccionar categoría...</option>
              {ZONE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de Zona</label>
            <input
              type="text"
              name="zone_name"
              value={formData.zone_name || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Sala de Servidores, Laboratorio Principal, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ID Gateway IoT</label>
            {loadingIds ? (
              <select
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
              >
                <option>Cargando nodos...</option>
              </select>
            ) : (
              <select
                name="id_iot_gateway"
                value={formData.id_iot_gateway || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.id_node ? 'border-red-500' : ''
                  }`}
                required
              >
                <option value="">Seleccione un nodo...</option>
                {iotIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Identificador del gateway IoT al que está conectado este nodo
            </p>
          </div>

        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción*</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${validationErrors.description ? 'border-red-500' : ''
            }`}
          placeholder="Descripción detallada del propósito, características y ubicación del nodo sensor..."
          required
        />
        {renderError('description')}
        {renderValidationInfo('description')}
      </div>

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
          {loading ? 'Guardando...' : formData.id && initialData?.id ? 'Actualizar Nodo' : 'Crear Nodo'}
        </button>
      </div>
    </form>
  );
};