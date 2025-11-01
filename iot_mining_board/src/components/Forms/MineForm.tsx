/* eslint-disable @typescript-eslint/no-explicit-any */
// components/MineForm.tsx
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { MineZone } from '../../interfaces/Mines';
import { MineService } from '../../services/MinesServices';

interface MineFormProps {
  initialData?: Partial<MineZone>;
  onSuccess: () => void;
  onCancel: () => void;
}

const MINE_TYPES = [
  'underground',
  'open_pit', 
  'hybrid',
  'alluvial',
  'placer'
];

const ZONE_TYPES = [
  'mine',
  'processing',
  'storage',
  'administrative',
  'access'
];

export const MineForm: React.FC<MineFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MineZone>>(initialData || {
    status: 'active',
    zone_type: 'mine'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name: string, value: any): boolean => {
    const errors = { ...validationErrors };
    let isValid = true;

    if (name === 'name' && !value) {
      errors[name] = 'El nombre es requerido';
      isValid = false;
    } else if (name === 'name' && value && value.length < 3) {
      errors[name] = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    } else if (name === 'zone_type' && !value) {
      errors[name] = 'El tipo de zona es requerido';
      isValid = false;
    } else {
      delete errors[name];
    }

    setValidationErrors(errors);
    return isValid;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name) {
      errors.name = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.zone_type) {
      errors.zone_type = 'El tipo de zona es requerido';
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
      if (initialData?.id) {
        await MineService.updateMine(initialData.id, formData);
      } else {
        await MineService.createMine(formData as any);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-500 p-3 bg-red-50 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la Mina *</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                validationErrors.name ? 'border-red-500' : ''
              }`}
              placeholder="Ej: Mina Principal Subterránea"
              required
            />
            {renderError('name')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Mina</label>
            <select
              name="mine_type"
              value={formData.mine_type || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccionar tipo...</option>
              {MINE_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Zona *</label>
            <select
              name="zone_type"
              value={formData.zone_type || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                validationErrors.zone_type ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">Seleccionar tipo...</option>
              {ZONE_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {renderError('zone_type')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              name="status"
              value={formData.status || 'active'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </select>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Cordillera de los Andes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Coordenadas</label>
            <input
              type="text"
              name="coordinates"
              value={formData.coordinates || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: -33.4489, -70.6693"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Profundidad</label>
              <input
                type="text"
                name="depth"
                value={formData.depth || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: 450m"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Área</label>
              <input
                type="text"
                name="area"
                value={formData.area || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: 120 hectáreas"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Descripción detallada de la mina, características principales, etc."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : initialData?.id ? 'Actualizar Mina' : 'Crear Mina'}
        </button>
      </div>
    </form>
  );
};