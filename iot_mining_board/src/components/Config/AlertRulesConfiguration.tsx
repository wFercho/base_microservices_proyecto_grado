// components/AlertRulesConfiguration.tsx
import React, { useState } from 'react';
import { Edit3, Trash2, Plus, ToggleLeft, ToggleRight, Download, Upload } from 'lucide-react';
import { AlertRuleForm } from './AlertRuleForm';
import { AlertRule, useAlertRules } from '../context/AlertRulesContext';

export const AlertRulesConfiguration: React.FC = () => {
  const { 
    alertRules, 
    addAlertRule, 
    updateAlertRule, 
    deleteAlertRule, 
    toggleAlertRule,
    getActiveRules,
    exportRules,
    importRules
  } = useAlertRules();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const getConditionText = (condition: AlertRule['condition']): string => {
    switch (condition) {
      case 'greater': return '>';
      case 'less': return '<';
      case 'equal': return '=';
      case 'range': return 'Rango';
      default: return '';
    }
  };

  const getLevelColor = (level: AlertRule['level']): string => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleFormSubmit = (ruleData: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRule) {
      updateAlertRule(editingRule.id, ruleData);
    } else {
      addAlertRule(ruleData);
    }
    setShowForm(false);
    setEditingRule(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRule(null);
  };

  const handleDelete = (rule: AlertRule) => {
    if (window.confirm(`¿Estás seguro de eliminar la regla "${rule.name}"?`)) {
      deleteAlertRule(rule.id);
    }
  };

  const handleExport = () => {
    const rules = exportRules();
    const dataStr = JSON.stringify(rules, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alert-rules-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const rules = JSON.parse(content);
        
        if (Array.isArray(rules) && rules.length > 0) {
          importRules(rules);
          alert(`✅ ${rules.length} reglas importadas correctamente`);
        } else {
          alert('❌ El archivo no contiene reglas válidas');
        }
      } catch (error) {
        console.error('Error importando reglas:', error);
        alert('❌ Error al leer el archivo. Verifica que sea un JSON válido.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const activeRules = getActiveRules();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reglas de Alerta</h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeRules.length} de {alertRules.length} reglas activas
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            disabled={alertRules.length === 0}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exportar reglas"
          >
            <Download size={20} className="mr-2" />
            Exportar
          </button>
          
          <label className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700 transition-colors cursor-pointer">
            <Upload size={20} className="mr-2" />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nueva Regla
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <AlertRuleForm
            rule={editingRule || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Tabla de reglas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {alertRules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Regla
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sensor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notificaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alertRules.map((rule) => (
                  <tr 
                    key={rule.id} 
                    className={`transition-opacity ${rule.isActive ? '' : 'opacity-60 bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAlertRule(rule.id)}
                        className={`p-1 rounded-full transition-all transform hover:scale-110 ${
                          rule.isActive 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={rule.isActive ? 'Desactivar regla' : 'Activar regla'}
                      >
                        {rule.isActive ? (
                          <ToggleRight size={24} className="text-white" />
                        ) : (
                          <ToggleLeft size={24} className="text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-500">
                        {rule.zones.length > 0 ? `${rule.zones.length} zonas específicas` : 'Todas las zonas'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{rule.sensorType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-mono">
                        {getConditionText(rule.condition)} {rule.value}
                        {rule.maxValue && ` - ${rule.maxValue}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelColor(rule.level)}`}>
                        {rule.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {rule.emailNotification && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            📧 Email
                          </span>
                        )}
                       
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(rule)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Editar regla"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(rule)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar regla"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">No hay reglas de alerta configuradas</p>
            <button 
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Crear primera regla →
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {alertRules.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Reglas</div>
            <div className="text-2xl font-bold text-gray-900">{alertRules.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <div className="text-sm text-green-600">Activas</div>
            <div className="text-2xl font-bold text-green-900">{activeRules.length}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Inactivas</div>
            <div className="text-2xl font-bold text-gray-900">
              {alertRules.length - activeRules.length}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <div className="text-sm text-blue-600">Con Notificaciones</div>
            <div className="text-2xl font-bold text-blue-900">
              {alertRules.filter(r => r.emailNotification || r.smsNotification).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};