/* eslint-disable react-refresh/only-export-components */
// components/PredefinedProfiles.tsx
import React, { useState } from 'react';
import { Settings, Check, AlertTriangle, Info, Zap, Shield } from 'lucide-react';
import { AlertRule } from '../context/AlertRulesContext';
import { useAlertRules } from '../context/AlertRulesContext';
// Definición de perfiles predefinidos
export interface PredefinedProfile {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'environmental' | 'equipment' | 'general';
  icon: string;
  rules: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>[];
}

// Perfiles predefinidos basados en normativas
export const PREDEFINED_PROFILES: PredefinedProfile[] = [
  {
    id: 'mining-safety',
    name: 'Seguridad Minera',
    description: 'Reglas para minería conforme a ATEX',
    category: 'safety',
    icon: '⛏️',
    rules: [
      {
        name: 'CO - Monóxido de Carbono Crítico',
        sensorType: 'CO',
        condition: 'mayor que',
        value: 35,
        level: 'critical',
        zones: [],
        emailNotification: true,
        smsNotification: true,
        autoActions: ['Evacuar área', 'Activar ventilación'],
        isActive: true
      },
      {
        name: 'Metano - Límite Explosivo',
        sensorType: 'Metano',
        condition: 'mayor que',
        value: 0.8,
        level: 'critical',
        zones: [],
        emailNotification: true,
        smsNotification: true,
        autoActions: ['Parar maquinaria', 'Evacuar área'],
        isActive: true
      },
      {
        name: 'O2 - Oxígeno Bajo',
        sensorType: 'O2',
        condition: 'menor que',
        value: 19.5,
        level: 'critical',
        zones: [],
        emailNotification: true,
        smsNotification: true,
        autoActions: ['Activar ventilación', 'Notificar rescate'],
        isActive: true
      },
      {
        name: 'Ruido - Exposición Larga',
        sensorType: 'Ruido',
        condition: 'mayor que',
        value: 85,
        level: 'warning',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: ['Requerir protección auditiva'],
        isActive: true
      }
    ]
  },
  {
    id: 'environmental-monitoring',
    name: 'Monitoreo Ambiental',
    description: 'Control de calidad del aire y parámetros ambientales',
    category: 'environmental',
    icon: '🌱',
    rules: [
      {
        name: 'PM2.5 - Material Particulado Fino',
        sensorType: 'PM2.5',
        condition: 'mayor que',
        value: 75,
        level: 'warning',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: ['Activar filtros de aire'],
        isActive: true
      },
      {
        name: 'PM10 - Material Particulado',
        sensorType: 'PM10',
        condition: 'mayor que',
        value: 150,
        level: 'warning',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: ['Activar sistemas de extracción'],
        isActive: true
      },
      {
        name: 'CO2 - Dióxido de Carbono Alto',
        sensorType: 'CO2',
        condition: 'mayor que',
        value: 5000,
        level: 'warning',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: ['Incrementar ventilación'],
        isActive: true
      },
      {
        name: 'Temperatura - Estrés Térmico',
        sensorType: 'Temperatura',
        condition: 'mayor que',
        value: 32,
        level: 'warning',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: ['Activar enfriamiento', 'Pausas de descanso'],
        isActive: true
      }
    ]
  },
  {
    id: 'equipment-protection',
    name: 'Protección de Equipos',
    description: 'Monitoreo para prevención de fallas en equipos',
    category: 'equipment',
    icon: '⚙️',
    rules: [
      {
        name: 'Vibración - Equipo Crítico',
        sensorType: 'Vibracion',
        condition: 'mayor que',
        value: 10,
        level: 'critical',
        zones: [],
        emailNotification: true,
        smsNotification: true,
        autoActions: ['Parar equipo', 'Notificar mantenimiento'],
        isActive: true
      },
      {
        name: 'Temperatura - Sobrecalentamiento',
        sensorType: 'Temperatura',
        condition: 'mayor que',
        value: 80,
        level: 'critical',
        zones: [],
        emailNotification: true,
        smsNotification: true,
        autoActions: ['Apagar equipo', 'Activar enfriamiento'],
        isActive: true
      },
      {
        name: 'Humedad - Corrosión Equipos',
        sensorType: 'Humedad',
        condition: 'mayor que',
        value: 75,
        level: 'warning',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: ['Activar deshumidificadores'],
        isActive: true
      }
    ]
  },
  {
    id: 'general-safety',
    name: 'Seguridad General',
    description: 'Reglas básicas de seguridad para cualquier instalación',
    category: 'general',
    icon: '🛡️',
    rules: [
      {
        name: 'H2S - Sulfuro de Hidrógeno',
        sensorType: 'H2S',
        condition: 'mayor que',
        value: 10,
        level: 'critical',
        zones: [],
        emailNotification: true,
        smsNotification: true,
        autoActions: ['Evacuar área', 'Activar ventilación'],
        isActive: true
      },
      {
        name: 'NO2 - Dióxido de Nitrógeno',
        sensorType: 'NO2',
        condition: 'mayor que',
        value: 3,
        level: 'warning',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: ['Ventilar área'],
        isActive: true
      },
      {
        name: 'Iluminación - Mínimo Seguro',
        sensorType: 'Iluminacion',
        condition: 'menor que',
        value: 50,
        level: 'warning',
        zones: [],
        emailNotification: true,
        smsNotification: false,
        autoActions: ['Encender luces adicionales'],
        isActive: true
      }
    ]
  }
];

interface PredefinedProfilesProps {
  onProfileApplied?: (profile: PredefinedProfile, appliedRules: number) => void;
}

export const PredefinedProfiles: React.FC<PredefinedProfilesProps> = ({
  onProfileApplied
}) => {
  const { addAlertRule, alertRules, getRulesBySensorType } = useAlertRules();
  const [appliedProfiles, setAppliedProfiles] = useState<Set<string>>(new Set());
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);

  // Verificar si un perfil ya fue aplicado
  const isProfileApplied = (profileId: string): boolean => {
    return appliedProfiles.has(profileId);
  };

  // Verificar cuántas reglas de un perfil ya existen
  const getExistingRulesCount = (profile: PredefinedProfile): number => {
    let existingCount = 0;
    
    profile.rules.forEach(profileRule => {
      const existingRules = getRulesBySensorType(profileRule.sensorType);
      const similarRuleExists = existingRules.some(existingRule => 
        existingRule.condition === profileRule.condition &&
        Math.abs(existingRule.value - profileRule.value) < 0.1 &&
        existingRule.level === profileRule.level
      );
      
      if (similarRuleExists) {
        existingCount++;
      }
    });

    return existingCount;
  };

  const applyProfile = async (profile: PredefinedProfile) => {
    setLoadingProfile(profile.id);

    try {
      // Pequeño delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500));

      let appliedCount = 0;
      const newRules: AlertRule[] = [];

      // Aplicar cada regla del perfil
      profile.rules.forEach(profileRule => {
        // Verificar si ya existe una regla similar
        const existingRules = getRulesBySensorType(profileRule.sensorType);
        const similarRuleExists = existingRules.some(existingRule => 
          existingRule.condition === profileRule.condition &&
          Math.abs(existingRule.value - profileRule.value) < 0.1 &&
          existingRule.level === profileRule.level
        );

        if (!similarRuleExists) {
          const newRule = addAlertRule(profileRule);
          newRules.push(newRule);
          appliedCount++;
        }
      });

      // Marcar perfil como aplicado
      setAppliedProfiles(prev => new Set([...prev, profile.id]));

      // Notificar al componente padre
      onProfileApplied?.(profile, appliedCount);

      console.log(`✅ Perfil "${profile.name}" aplicado: ${appliedCount} nuevas reglas`);

    } catch (error) {
      console.error('❌ Error aplicando perfil:', error);
    } finally {
      setLoadingProfile(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <Shield className="text-red-500" size={20} />;
      case 'environmental': return <Zap className="text-green-500" size={20} />;
      case 'equipment': return <Settings className="text-blue-500" size={20} />;
      default: return <Info className="text-gray-500" size={20} />;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'safety': return 'border-red-200 bg-red-50';
      case 'environmental': return 'border-green-200 bg-green-50';
      case 'equipment': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getLevelBadge = (level: 'info' | 'warning' | 'critical') => {
    const styles = {
      critical: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800'
    };

    const labels = {
      critical: 'CRÍTICO',
      warning: 'ADVERTENCIA',
      info: 'INFORMACIÓN'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="text-blue-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Perfiles Predefinidos</h2>
            <p className="text-sm text-gray-600">
              Conjuntos de reglas preconfiguradas basadas en normativas
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {alertRules.length} reglas configuradas
        </div>
      </div>

      {/* Grid de Perfiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PREDEFINED_PROFILES.map(profile => {
          const isApplied = isProfileApplied(profile.id);
          const existingRulesCount = getExistingRulesCount(profile);
          const isApplying = loadingProfile === profile.id;

          return (
            <div
              key={profile.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                isApplied 
                  ? 'border-green-500 bg-green-50' 
                  : getCategoryColor(profile.category)
              } ${
                !isApplied ? 'hover:shadow-md cursor-pointer' : ''
              }`}
              onClick={() => !isApplied && !isApplying && applyProfile(profile)}
            >
              {/* Header del Perfil */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{profile.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getCategoryIcon(profile.category)}
                      <span className="text-xs text-gray-500">{profile.description}</span>
                    </div>
                  </div>
                </div>
                
                {/* Estado de aplicación */}
                {isApplied && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check size={16} />
                    <span className="text-sm font-medium">Aplicado</span>
                  </div>
                )}
              </div>

              {/* Estadísticas del Perfil */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>{profile.rules.length} reglas predefinidas</span>
                {existingRulesCount > 0 && (
                  <span className="text-orange-600">
                    {existingRulesCount} ya existen
                  </span>
                )}
              </div>

              {/* Lista de Reglas */}
              <div className="space-y-2 mb-4">
                {profile.rules.slice(0, 3).map((rule, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1 mr-2">
                      {rule.name}
                    </span>
                    {getLevelBadge(rule.level)}
                  </div>
                ))}
                {profile.rules.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{profile.rules.length - 3} reglas más...
                  </div>
                )}
              </div>

              {/* Botón de Acción */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  applyProfile(profile);
                }}
                disabled={isApplied || isApplying}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isApplied
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : isApplying
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isApplying ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Aplicando...</span>
                  </div>
                ) : isApplied ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Check size={16} />
                    <span>Perfil Aplicado</span>
                  </div>
                ) : (
                  `Aplicar Perfil (${profile.rules.length} reglas)`
                )}
              </button>

              {/* Advertencia de reglas existentes */}
              {existingRulesCount > 0 && !isApplied && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                  <AlertTriangle size={12} />
                  <span>{existingRulesCount} reglas similares existentes</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-start space-x-3">
          <Info className="text-blue-500 mt-0.5" size={16} />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">¿Cómo funcionan los perfiles predefinidos?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Cada perfil agrega un conjunto de reglas basadas en normativas específicas</li>
              <li>Las reglas que ya existen no se duplican</li>
              <li>Puedes modificar las reglas después de aplicarlas</li>
              <li>Los perfiles aplicados se marcan en verde</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};