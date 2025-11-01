/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Server, Cpu, AlertCircle, Plus, TrendingUp, Activity, Radio, ArrowLeft } from 'lucide-react';
import { IoTGateway, IoTGatewayStats } from '../../interfaces/IoTGateways';
import { IoTGatewayService } from '../../services/IotGatewaysServices';
import { IoTGatewayTable } from '../Tables/IotGatewayTable';
import { IoTGatewayForm } from '../Forms/IoTGatewayForm';
import { IoTGatewayDetailModal } from './IoTGatewayDetailModal';

const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#6366F1'];

export const IoTGatewayDashboard = () => {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [gateways, setGateways] = useState<IoTGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<IoTGateway | null>(null);
  const [stats, setStats] = useState<IoTGatewayStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchGateways = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await IoTGatewayService.getGateways(page);
      setGateways(response.items);
      setTotalPages(Math.ceil(response.total / response.per_page));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await IoTGatewayService.getGatewayStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchGateways(currentPage);
      fetchStats();
    }
  }, [view, currentPage]);

  const handleCreate = () => {
    setSelectedGateway(null);
    setView('form');
  };

  const handleEdit = (gateway: IoTGateway) => {
    setSelectedGateway(gateway);
    setView('form');
  };

  const handleView = (gateway: IoTGateway) => {
    setSelectedGateway(gateway);
    setView('detail');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este gateway?')) {
      setLoading(true);
      try {
        await IoTGatewayService.deleteGateway(id);
        fetchGateways(currentPage);
        fetchStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSuccess = () => {
    fetchGateways(currentPage);
    fetchStats();
    setView('list');
  };

  const brandData = stats ? Object.entries(stats.gatewaysByBrand).map(([brand, count]) => ({
    name: brand,
    count
  })) : [];

  const categoryData = stats ? Object.entries(stats.nodesByCategory).map(([category, count]) => ({
    name: category,
    count
  })) : [];


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const StatCard = ({ icon: Icon, title, value, color, bgColor, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor} shadow-md`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-600 text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Gestión de IoT Gateways
              </h1>
              <p className="text-gray-600 mt-2">Monitoreo y control de dispositivos IoT en tiempo real</p>
            </div>
            {view === 'list' && (
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-gradient-to-r cursor-pointer from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nuevo Gateway</span>
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
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {view === 'list' && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Server}
                title="Total Gateways"
                value={stats.totalGateways}
                color="text-purple-600"
                bgColor="bg-purple-100"
              />
              <StatCard
                icon={Cpu}
                title="Nodos Sensores"
                value={stats.totalSensorNodes}
                color="text-blue-600"
                bgColor="bg-blue-100"
              />
              <StatCard
                icon={Radio}
                title="Total Sensores"
                value={stats.totalSensors}
                color="text-cyan-600"
                bgColor="bg-cyan-100"
              />
              <StatCard
                icon={AlertCircle}
                title="Sin Asignar"
                value={stats.gatewaysWithoutMine}
                color="text-orange-600"
                bgColor="bg-orange-100"
              />
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Gráfica de marcas */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Gateways por Marca</h3>
                    <p className="text-sm text-gray-500 mt-1">Distribución de dispositivos</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={brandData}>
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                          <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="url(#colorBar)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica de categorías */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Nodos por Categoría</h3>
                    <p className="text-sm text-gray-500 mt-1">Tipos de sensores activos</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Cpu className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {loading && view === 'list' ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
              <div className="absolute top-0 left-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-300 opacity-75"></div>
            </div>
          </div>
        ) : view === 'list' ? (
          <IoTGatewayTable
            gateways={gateways}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        ) : view === 'form' ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4">
              <h2 className="text-white font-bold text-lg">
                {selectedGateway ? 'Editar IoT Gateway' : 'Crear Nuevo IoT Gateway'}
              </h2>
              <p className="text-indigo-100 text-sm">
                {selectedGateway ? 'Modifique la información del IoT Gateway' : 'Complete el formulario para registrar un nuevo IoT Gateway'}
              </p>
            </div>
            <div className="p-8">

              <IoTGatewayForm
                initialData={selectedGateway || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => setView('list')}
              />
            </div>

          </div>
        ) : view === 'detail' && selectedGateway ? (
          <IoTGatewayDetailModal
            gateway={selectedGateway}
            onClose={() => setView('list')}
            onEdit={() => handleEdit(selectedGateway)}
          />
        ) : null}
      </div>
    </div>
  );
};