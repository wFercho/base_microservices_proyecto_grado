import { MetricsCardProps } from "../../interfaces/Boards";

// Componente para métricas generales
export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, unit, status, icon: Icon, trend }) => {
  const getStatusColor = (status: 'normal' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <span className="ml-1 text-sm text-gray-500">{unit}</span>
          </div>
          {trend !== undefined && (
            <p className={`text-xs mt-1 ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs anterior
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${getStatusColor(status)}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};