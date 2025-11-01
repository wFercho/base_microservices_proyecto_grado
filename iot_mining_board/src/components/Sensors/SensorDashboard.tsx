// pages/SensorDashboard.tsx
import { useState, useEffect } from 'react';
import SensorChart from './SensorChart';
import { ArrowLeft, Plus } from 'lucide-react';
import { SensorService } from '../../services/SensorServices';
import { Sensor } from '../../interfaces/Sensors';
import { SensorTable } from '../Tables/SensorTables';
import { SensorForm } from '../Forms/SensorForm';

export const SensorDashboard = () => {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSensors = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { items, total } = await SensorService.getSensors(page);
      console.log(items, total)
      setSensors(items);
      setTotalPages(Math.ceil(total / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchSensors(currentPage);
    }
  }, [view, currentPage]);

  const handleCreate = () => {
    setSelectedSensor(null);
    setView('form');
  };

  const handleEdit = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setView('form');
  };

  const handleView = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setView('detail');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este sensor?')) {
      setLoading(true);
      try {
        await SensorService.deleteSensor(id);
        fetchSensors(currentPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    fetchSensors(currentPage);
    setView('list');
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Nuevo Sensor
            </h1>
            <p className="text-gray-600 mt-2">Sistema de monitoreo y gestión integral</p>
          </div>
          {view === 'list' && (
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-gradient-to-r cursor-pointer from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuevo Sensor</span>
            </button>
          )}
          {view !== 'list' && (
            <button
              onClick={() => setView('list')}
              className="px-6 py-3 bg-gradient-to-r cursor-pointer from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al Listado</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && view === 'list' ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : view === 'list' ? (
        <>
          <SensorTable
            sensors={sensors}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

        </>
      ) : view === 'form' ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
            <h2 className="text-white font-bold text-lg">
              {selectedSensor ? 'Editar Sensor' : 'Crear Nuevo Sensor'}
            </h2>
            <p className="text-indigo-100 text-sm">
              {selectedSensor ? 'Modifique la información del sensor' : 'Complete el formulario para registrar un nuevo sensor'}
            </p>
          </div>
          <div className="p-8">
            <SensorForm
              initialData={selectedSensor || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setView('list')}
            />
          </div>
        </div>

      ) : view === 'detail' && selectedSensor ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Detalle del Sensor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Información Básica</h3>
                <p>Variable: {selectedSensor.variable}</p>
                <p>Marca: {selectedSensor.marca}</p>
                <p>Referencia: {selectedSensor.referencia}</p>
              </div>
              <div>
                <h3 className="font-medium">Especificaciones</h3>
                <p>Rango: {selectedSensor.min_medicion} - {selectedSensor.max_medicion} {selectedSensor.unidad_medicion}</p>
                <p>Precisión: ±{selectedSensor.precision}</p>
                <p>Resolución: {selectedSensor.resolucion}</p>
              </div>
            </div>
          </div>

          {/* Componente SensorChart integrado */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Histórico de Mediciones</h3>
            <SensorChart
              sensorId={selectedSensor.id}
              initialTimeRange="24h"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};