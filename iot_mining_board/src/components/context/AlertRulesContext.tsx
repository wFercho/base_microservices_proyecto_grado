/* eslint-disable react-refresh/only-export-components */
// contexts/AlertRulesContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface AlertRule {
  id: string;
  name: string;
  sensorType: string;
  condition: 'greater' | 'less' | 'equal' | 'range';
  value: number;
  maxValue?: number;
  level: 'info' | 'warning' | 'critical';
  zones: string[];
  emailNotification: boolean;
  smsNotification: boolean;
  autoActions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AlertRulesContextValue {
  alertRules: AlertRule[];
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>) => AlertRule;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  deleteAlertRule: (id: string) => void;
  toggleAlertRule: (id: string) => void;
  getAlertRuleById: (id: string) => AlertRule | undefined;
  getActiveRules: () => AlertRule[];
  getRulesBySensorType: (sensorType: string) => AlertRule[];
  clearAllRules: () => void;
  importRules: (rules: AlertRule[]) => void;
  exportRules: () => AlertRule[];
}

const AlertRulesContext = createContext<AlertRulesContextValue | undefined>(undefined);

// Reglas iniciales por defecto
const DEFAULT_RULES: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'CO2 Crítico',
    sensorType: 'CO2',
    condition: 'greater',
    value: 1000,
    level: 'critical',
    zones: ['1', '2'],
    emailNotification: true,
    smsNotification: true,
    autoActions: ['Activar ventilación', 'Cerrar accesos'],
    isActive: true
  },
  {
    name: 'Temperatura Alta',
    sensorType: 'Temperatura',
    condition: 'greater',
    value: 40,
    level: 'warning',
    zones: ['1'],
    emailNotification: true,
    smsNotification: false,
    autoActions: ['Notificar supervisor'],
    isActive: true
  },
  {
    name: 'Humedad Baja',
    sensorType: 'Humedad',
    condition: 'less',
    value: 30,
    level: 'warning',
    zones: [],
    emailNotification: true,
    smsNotification: false,
    autoActions: ['Activar humidificador'],
    isActive: true
  }
];

interface AlertRulesProviderProps {
  children: ReactNode;
  storageKey?: string;
  enablePersistence?: boolean;
  initialRules?: AlertRule[];
}

export const AlertRulesProvider: React.FC<AlertRulesProviderProps> = ({
  children,
  storageKey = 'alert_rules_v1',
  enablePersistence = false, 
  initialRules
}) => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar reglas al iniciar
  useEffect(() => {
    if (isInitialized) return;

    let loadedRules: AlertRule[] = [];

    // 1. Intentar cargar desde props si se proporcionan
    if (initialRules && initialRules.length > 0) {
      loadedRules = initialRules;
    }
    // 2. Si está habilitada la persistencia, intentar cargar del storage
    else if (enablePersistence) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedRules = parsed;
            console.log('💾 AlertRules: Cargadas desde localStorage', loadedRules.length);
          }
        }
      } catch (error) {
        console.warn('⚠️ AlertRules: Error cargando desde localStorage', error);
      }
    }

    // 3. Si no hay reglas cargadas, usar las por defecto
    if (loadedRules.length === 0) {
      const now = new Date().toISOString();
      loadedRules = DEFAULT_RULES.map((rule, index) => ({
        ...rule,
        id: `default_${index + 1}`,
        createdAt: now,
        updatedAt: now
      }));
      console.log('🆕 AlertRules: Inicializadas con reglas por defecto', loadedRules.length);
    }

    setAlertRules(loadedRules);
    setIsInitialized(true);
  }, [storageKey, enablePersistence, initialRules, isInitialized]);

  // Persistir reglas cuando cambien (solo si está habilitado)
  useEffect(() => {
    if (!isInitialized || !enablePersistence) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(alertRules));
      console.log('💾 AlertRules: Guardadas en localStorage', alertRules.length);
    } catch (error) {
      console.warn('⚠️ AlertRules: Error guardando en localStorage', error);
    }
  }, [alertRules, storageKey, enablePersistence, isInitialized]);

  const addAlertRule = useCallback((rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): AlertRule => {
    const now = new Date().toISOString();
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };

    setAlertRules(prev => [...prev, newRule]);
    console.log('➕ AlertRules: Regla agregada', newRule.name);
    return newRule;
  }, []);

  const updateAlertRule = useCallback((id: string, updates: Partial<AlertRule>) => {
    setAlertRules(prev => 
      prev.map(rule => 
        rule.id === id 
          ? { ...rule, ...updates, updatedAt: new Date().toISOString() }
          : rule
      )
    );
    console.log('✏️ AlertRules: Regla actualizada', id);
  }, []);

  const deleteAlertRule = useCallback((id: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== id));
    console.log('🗑️ AlertRules: Regla eliminada', id);
  }, []);

  const toggleAlertRule = useCallback((id: string) => {
    setAlertRules(prev => 
      prev.map(rule => 
        rule.id === id 
          ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
          : rule
      )
    );
    console.log('🔄 AlertRules: Regla toggle', id);
  }, []);

  const getAlertRuleById = useCallback((id: string): AlertRule | undefined => {
    return alertRules.find(rule => rule.id === id);
  }, [alertRules]);

  const getActiveRules = useCallback((): AlertRule[] => {
    return alertRules.filter(rule => rule.isActive);
  }, [alertRules]);

  const getRulesBySensorType = useCallback((sensorType: string): AlertRule[] => {
    return alertRules.filter(rule => rule.sensorType === sensorType);
  }, [alertRules]);

  const clearAllRules = useCallback(() => {
    setAlertRules([]);
    console.log('🧹 AlertRules: Todas las reglas eliminadas');
  }, []);

  const importRules = useCallback((rules: AlertRule[]) => {
    setAlertRules(rules);
    console.log('📥 AlertRules: Reglas importadas', rules.length);
  }, []);

  const exportRules = useCallback((): AlertRule[] => {
    console.log('📤 AlertRules: Reglas exportadas', alertRules.length);
    return alertRules;
  }, [alertRules]);

  const value: AlertRulesContextValue = {
    alertRules,
    addAlertRule,
    updateAlertRule,
    deleteAlertRule,
    toggleAlertRule,
    getAlertRuleById,
    getActiveRules,
    getRulesBySensorType,
    clearAllRules,
    importRules,
    exportRules
  };

  return (
    <AlertRulesContext.Provider value={value}>
      {children}
    </AlertRulesContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAlertRules = (): AlertRulesContextValue => {
  const context = useContext(AlertRulesContext);
  if (context === undefined) {
    throw new Error('useAlertRules debe ser usado dentro de un AlertRulesProvider');
  }
  return context;
};

// Exportar el contexto para casos avanzados
export { AlertRulesContext };