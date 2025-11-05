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

const PROVINCES = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 
  'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 
  'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 
  'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
];

const STATUS_TYPES = [
  'activa',
  'inactiva', 
  'mantenimiento'
];

export const MineForm: React.FC<MineFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MineZone>>(initialData || {
    estado: 'activa'
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

    if (name === 'nombre' && !value) {
      errors[name] = 'El nombre es requerido';
      isValid = false;
    } else if (name === 'nombre' && value && value.length < 3) {
      errors[name] = 'El nombre debe tener al menos 3 caracteres';
      isValid = false;
    } else if (name === 'ubicacion' && !value) {
      errors[name] = 'La ubicación es requerida';
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

    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.ubicacion) {
      errors.ubicacion = 'La ubicación es requerida';
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
      console.log('Submitting form data:', formData, initialData);
      if (initialData?.id) {
        console.log('Updating mine with ID:', initialData.id);
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
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                validationErrors.nombre ? 'border-red-500' : ''
              }`}
              placeholder="Ej: Mina Principal Subterránea"
              required
            />
            {renderError('nombre')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ubicación *</label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                validationErrors.ubicacion ? 'border-red-500' : ''
              }`}
              placeholder="Ej: Cordillera de los Andes"
              required
            />
            {renderError('ubicacion')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Provincia</label>
            <select
              name="provincia"
              value={formData.provincia || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccionar provincia...</option>
              {PROVINCES.map(province => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Empresa</label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Minera del Sur S.A."
            />
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Av. Principal 123, Sector Industrial"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitud</label>
              <input
                type="text"
                name="latitud"
                value={formData.latitud || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: -2.170998"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitud</label>
              <input
                type="text"
                name="longitud"
                value={formData.longitud || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ej: -79.922356"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contacto</label>
            <input
              type="text"
              name="contacto"
              value={formData.contacto || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Juan Pérez - juan@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              name="estado"
              value={formData.estado || 'activa'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {STATUS_TYPES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Información Adicional</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Los campos marcados con * son obligatorios</p>
          <p>• La ubicación debe ser una descripción general del área minera</p>
          <p>• Las coordenadas (latitud/longitud) son opcionales pero recomendadas</p>
          <p>• El contacto puede ser una persona, email o teléfono de referencia</p>
        </div>
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