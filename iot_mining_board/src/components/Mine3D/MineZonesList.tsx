/* eslint-disable @typescript-eslint/no-explicit-any */
// components/MineZonesList.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from "../MainLayout";

export interface MineZone {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  zone_type: string;
  status: 'active' | 'inactive' | 'maintenance';
  mine_type: string | null;
  coordinates: string | null;
  depth: string | null;
  area: string | null;
  created_at: string;
  updated_at: string | null;
}

interface MineZonesListProps {
  onEdit?: (zone: MineZone) => void;
  onDelete?: (zoneId: string) => void;
}
const API_MINES_URL = import.meta.env.VITE_API_URL_MINES


export default function MineZonesList({ onEdit, onDelete }: MineZonesListProps) {
  const [zones, setZones] = useState<MineZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    // Resetear estados de upload cuando se navega de vuelta
    setUploading(null);
    setUploadError(null);
    setUploadSuccess(null);
    setSearchTerm('');
    setStatusFilter('all');
  }, [location.key]); // Se ejecuta cuando la clave de ubicación cambia

  // Fetch zones from API
  const fetchZones = async () => {
    try {
      setLoading(true);
      setError(null); // Resetear error al hacer fetch
      const response = await fetch(`${API_MINES_URL}/mines`);

      if (!response.ok) {
        throw new Error('Error al cargar las zonas mineras');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      setZones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // Función para manejar valores nulos o vacíos
  const getSafeValue = (value: any, defaultValue: string = 'No especificado'): string => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  };

  // Filter zones based on search and status
  const filteredZones = zones.filter(zone => {
    const safeName = getSafeValue(zone.name, '').toLowerCase();
    const safeDescription = getSafeValue(zone.description, '').toLowerCase();
    const safeLocation = getSafeValue(zone.location, '').toLowerCase();
    const safeZoneType = getSafeValue(zone.zone_type, '').toLowerCase();

    const matchesSearch =
      safeName.includes(searchTerm.toLowerCase()) ||
      safeDescription.includes(searchTerm.toLowerCase()) ||
      safeLocation.includes(searchTerm.toLowerCase()) ||
      safeZoneType.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || zone.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle delete
  const handleDelete = async (zoneId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta zona?')) {
      return;
    }

    try {
      const response = await fetch(`/api/mine-zones/${zoneId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la zona');
      }

      // Refresh the list
      fetchZones();

      // Call parent handler if provided
      if (onDelete) {
        onDelete(zoneId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  // Navigate to 3D view
  const handleView3D = (zoneId: string) => {
    // Limpiar estados antes de navegar
    setUploadError(null);
    setUploadSuccess(null);

    // Usar replace: false para mantener el historial
    navigate(`/mine/${zoneId}/3d`, {
      replace: false,
      state: { from: location.pathname } // Guardar de dónde venimos
    });
  };

  // Handle CSV upload
  const handleCSVUpload = async (zoneId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea un archivo CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Por favor, selecciona un archivo CSV');
      return;
    }

    setUploading(zoneId);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_MINES_URL}/mine-nodes3d/upload-csv/${zoneId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el archivo CSV');
      }

      const result = await response.json();
      setUploadSuccess(`Archivo CSV subido exitosamente: ${result.message}`);
      console.log('CSV upload result:', result);

      // Limpiar el input de archivo
      event.target.value = '';

    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setUploading(null);
    }
  };

  // Clear upload messages
  const clearUploadMessages = () => {
    setUploadError(null);
    setUploadSuccess(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={fetchZones}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Mensajes de upload */}
      {uploadError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm">{uploadError}</span>
            </div>
            <button onClick={clearUploadMessages} className="text-red-600 hover:text-red-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700 text-sm">{uploadSuccess}</span>
            </div>
            <button onClick={clearUploadMessages} className="text-green-600 hover:text-green-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Zonas Mineras</h2>
              <p className="text-gray-600 text-sm">Gestión de áreas y zonas de la mina</p>
            </div>
            <div className="text-sm text-gray-500">
              Total: {filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
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
                  placeholder="Buscar por nombre, descripción, ubicación o tipo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>
        </div>

        {/* Zones List */}
        <div className="divide-y divide-gray-200">
          {filteredZones.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron zonas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Intenta con otros términos de búsqueda o filtros.'
                  : 'No hay zonas mineras registradas.'}
              </p>
            </div>
          ) : (
            filteredZones.map((zone) => (
              <div key={zone.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {getSafeValue(zone.name, 'Nombre no disponible')}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${zone.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : zone.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {zone.status === 'active' ? 'Activo' :
                          zone.status === 'inactive' ? 'Inactivo' : 'Mantenimiento'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Tipo de Zona:</span> {getSafeValue(zone.zone_type)}
                      </div>
                      <div>
                        <span className="font-medium">Ubicación:</span> {getSafeValue(zone.location)}
                      </div>
                      <div>
                        <span className="font-medium">Tipo de Mina:</span> {getSafeValue(zone.mine_type)}
                      </div>
                      {zone.area && (
                        <div>
                          <span className="font-medium">Área:</span> {getSafeValue(zone.area)}
                        </div>
                      )}
                      {zone.depth && (
                        <div>
                          <span className="font-medium">Profundidad:</span> {getSafeValue(zone.depth)}
                        </div>
                      )}
                      {zone.coordinates && (
                        <div>
                          <span className="font-medium">Coordenadas:</span> {getSafeValue(zone.coordinates)}
                        </div>
                      )}
                    </div>

                    {zone.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {getSafeValue(zone.description)}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Creado: {new Date(zone.created_at).toLocaleDateString()}
                      </span>
                      {zone.updated_at && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Actualizado: {new Date(zone.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {/* Botón para vista 3D - Mejorado */}
                    <button
                      onClick={() => handleView3D(zone.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                      title="Ver en vista 3D"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                      <span className="text-sm font-medium">Vista 3D</span>
                    </button>

                    {/* Botón para subir CSV */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleCSVUpload(zone.id, e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id={`csv-upload-${zone.id}`}
                        disabled={uploading === zone.id}
                      />
                      <label
                        htmlFor={`csv-upload-${zone.id}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${uploading === zone.id
                          ? 'bg-gray-100 text-gray-400 border-gray-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        title="Subir distribución CSV"
                      >
                        {uploading === zone.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        )}
                        <span className="text-sm font-medium">
                          {uploading === zone.id ? 'Subiendo...' : 'Subir CSV'}
                        </span>
                      </label>
                    </div>

                    {/* Acciones existentes */}
                    <div className="flex gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(zone)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar zona"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar zona"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}