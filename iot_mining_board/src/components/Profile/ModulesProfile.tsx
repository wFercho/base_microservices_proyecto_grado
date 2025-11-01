/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/ModulesPage.tsx
import React, { useState } from 'react';
import { Search, Filter, Info, Download, Check, AlertTriangle } from 'lucide-react';
import { PREDEFINED_PROFILES, PredefinedProfile } from './PredefinedProfile';
import { useAlertRules } from '../context/AlertRulesContext';

export const ModulesPage: React.FC = () => {
    const [selectedModule, setSelectedModule] = useState<PredefinedProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [appliedModules, setAppliedModules] = useState<Set<string>>(new Set());
    const [applyingModule, setApplyingModule] = useState<string | null>(null);

    const { addAlertRule, getRulesBySensorType } = useAlertRules();

    // Categorías únicas
    const categories = ['all', ...new Set(PREDEFINED_PROFILES.map(p => p.category))];

    // Filtrar módulos
    const filteredModules = PREDEFINED_PROFILES.filter(module => {
        const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Verificar si un módulo ya fue aplicado
    const isModuleApplied = (moduleId: string): boolean => {
        return appliedModules.has(moduleId);
    };

    // Verificar cuántas reglas de un módulo ya existen
    const getExistingRulesCount = (module: PredefinedProfile): number => {
        let existingCount = 0;

        module.rules.forEach(moduleRule => {
            const existingRules = getRulesBySensorType(moduleRule.sensorType);
            const similarRuleExists = existingRules.some(existingRule =>
                existingRule.condition === moduleRule.condition &&
                Math.abs(existingRule.value - moduleRule.value) < 0.1 &&
                existingRule.level === moduleRule.level
            );

            if (similarRuleExists) {
                existingCount++;
            }
        });

        return existingCount;
    };

    // Aplicar módulo (agregar reglas al sistema)
    const applyModule = async (module: PredefinedProfile) => {
        setApplyingModule(module.id);

        try {
            // Pequeño delay para mejor UX
            await new Promise(resolve => setTimeout(resolve, 500));

            let appliedCount = 0;
            const newRules: any[] = [];

            // Aplicar cada regla del módulo
            module.rules.forEach(moduleRule => {
                // Verificar si ya existe una regla similar
                const existingRules = getRulesBySensorType(moduleRule.sensorType);
                const similarRuleExists = existingRules.some(existingRule =>
                    existingRule.condition === moduleRule.condition &&
                    Math.abs(existingRule.value - moduleRule.value) < 0.1 &&
                    existingRule.level === moduleRule.level
                );

                if (!similarRuleExists) {
                    const newRule = addAlertRule(moduleRule);
                    newRules.push(newRule);
                    appliedCount++;
                }
            });

            // Marcar módulo como aplicado
            setAppliedModules(prev => new Set([...prev, module.id]));


            // Mostrar notificación de éxito
            alert(`✅ Módulo "${module.name}" aplicado exitosamente!\nSe agregaron ${appliedCount} nuevas reglas.`);

        } catch (error) {
            console.error('❌ Error aplicando módulo:', error);
            alert('❌ Error al aplicar el módulo. Por favor, intenta nuevamente.');
        } finally {
            setApplyingModule(null);
        }
    };

    /*  // Obtener icono de categoría
     const getCategoryIcon = (category: string) => {
       switch (category) {
         case 'safety': return <Shield className="text-red-500" size={20} />;
         case 'environmental': return <Zap className="text-green-500" size={20} />;
         case 'equipment': return <Settings className="text-blue-500" size={20} />;
         case 'general': return <Factory className="text-purple-500" size={20} />;
         default: return <Info className="text-gray-500" size={20} />;
       }
     }; */

    // Obtener color de categoría
    const getCategoryColor = (category: string): string => {
        switch (category) {
            case 'safety': return 'bg-red-100 text-red-800 border-red-200';
            case 'environmental': return 'bg-green-100 text-green-800 border-green-200';
            case 'equipment': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'general': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Obtener nombre de categoría en español
    const getCategoryName = (category: string): string => {
        const names: { [key: string]: string } = {
            'safety': 'Seguridad',
            'environmental': 'Ambiental',
            'equipment': 'Equipos',
            'general': 'General',
            'all': 'Todos'
        };
        return names[category] || category;
    };

    // Exportar información del módulo
    const exportModuleInfo = (module: PredefinedProfile) => {
        const data = {
            nombre: module.name,
            descripcion: module.description,
            categoria: getCategoryName(module.category),
            total_reglas: module.rules.length,
            reglas: module.rules.map(rule => ({
                nombre: rule.name,
                sensor: rule.sensorType,
                condicion: rule.condition,
                valor: rule.value,
                nivel: rule.level,
                acciones_automaticas: rule.autoActions
            }))
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `modulo-${module.id}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (selectedModule) {
        const isApplied = isModuleApplied(selectedModule.id);
        const existingRulesCount = getExistingRulesCount(selectedModule);
        const isApplying = applyingModule === selectedModule.id;

        return (
            <div className="min-h-screen bg-white p-6">
                {/* Header de Detalles */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSelectedModule(null)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                ← Volver a módulos
                            </button>
                            <span className="text-4xl">{selectedModule.icon}</span>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{selectedModule.name}</h1>
                                <p className="text-gray-600">{selectedModule.description}</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => exportModuleInfo(selectedModule)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Download size={16} />
                                <span>Exportar Info</span>
                            </button>
                            {!isApplied && (
                                <button
                                    onClick={() => applyModule(selectedModule)}
                                    disabled={isApplying}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isApplying
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    {isApplying ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Aplicando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            <span>Aplicar Módulo</span>
                                        </>
                                    )}
                                </button>
                            )}
                            {isApplied && (
                                <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                                    <Check size={16} />
                                    <span>Módulo Aplicado</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{selectedModule.rules.length}</div>
                            <div className="text-sm text-blue-800">Total de Reglas</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-600">
                                {selectedModule.rules.filter(r => r.level === 'critical').length}
                            </div>
                            <div className="text-sm text-green-800">Reglas Críticas</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-600">
                                {selectedModule.rules.filter(r => r.level === 'warning').length}
                            </div>
                            <div className="text-sm text-yellow-800">Reglas de Advertencia</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedModule.category)}`}>
                                {getCategoryName(selectedModule.category)}
                            </div>
                            <div className="text-sm text-purple-800 mt-2">Categoría</div>
                        </div>
                    </div>

                    {/* Información de Aplicación */}
                    {existingRulesCount > 0 && !isApplied && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="text-yellow-600" size={20} />
                                <div>
                                    <p className="text-yellow-800 font-medium">
                                        {existingRulesCount} reglas similares ya existen en el sistema
                                    </p>
                                    <p className="text-yellow-700 text-sm">
                                        Solo se agregarán las reglas que no estén duplicadas
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lista de Reglas */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Reglas Incluidas en este Módulo</h2>
                    <div className="space-y-4">
                        {selectedModule.rules.map((rule, index) => {
                            const existingRules = getRulesBySensorType(rule.sensorType);
                            const isDuplicate = existingRules.some(existingRule =>
                                existingRule.condition === rule.condition &&
                                Math.abs(existingRule.value - rule.value) < 0.1 &&
                                existingRule.level === rule.level
                            );

                            return (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-4 transition-colors ${isDuplicate ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                                        <div className="flex items-center space-x-2">
                                            {isDuplicate && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                    Ya Existe
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${rule.level === 'critical' ? 'bg-red-100 text-red-800' :
                                                    rule.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {rule.level.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                        <div>
                                            <span className="font-medium">Sensor:</span> {rule.sensorType}
                                        </div>
                                        <div>
                                            <span className="font-medium">Condición:</span> {rule.condition} {rule.value}
                                        </div>
                                        <div>
                                            <span className="font-medium">Notificaciones:</span>
                                            {rule.emailNotification && ' 📧'}
                                            {rule.smsNotification && ' 📱'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Zonas:</span> {rule.zones.length > 0 ? rule.zones.join(', ') : 'Todas'}
                                        </div>
                                    </div>

                                    {rule.autoActions.length > 0 && (
                                        <div>
                                            <span className="font-medium text-sm">Acciones Automáticas:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {rule.autoActions.map((action, actionIndex) => (
                                                    <span key={actionIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        {action}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Módulos de Seguridad</h1>
                        <p className="text-gray-600 mt-2">
                            Selecciona y aplica módulos predefinidos de reglas de seguridad
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{PREDEFINED_PROFILES.length}</div>
                        <div className="text-sm text-gray-600">Módulos Disponibles</div>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar módulos..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Filter className="text-gray-400 mt-2" size={20} />
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {getCategoryName(category)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid de Módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredModules.map(module => {
                    const isApplied = isModuleApplied(module.id);
                    const existingRulesCount = getExistingRulesCount(module);
                    const isApplying = applyingModule === module.id;

                    return (
                        <div
                            key={module.id}
                            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-300 border-2 ${isApplied
                                    ? 'border-green-500 hover:border-green-600'
                                    : 'border-transparent hover:border-blue-300 hover:shadow-xl'
                                }`}
                            onClick={() => setSelectedModule(module)}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl">{module.icon}</span>
                                <div className="flex items-center space-x-2">
                                    {isApplied && (
                                        <Check className="text-green-500" size={16} />
                                    )}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(module.category)}`}>
                                        {getCategoryName(module.category)}
                                    </div>
                                </div>
                            </div>

                            {/* Contenido */}
                            <h3 className="font-semibold text-gray-900 text-lg mb-2">{module.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>

                            {/* Estadísticas */}
                            <div className="space-y-2 text-sm text-gray-500 mb-4">
                                <div className="flex justify-between">
                                    <span>Total Reglas:</span>
                                    <span className="font-medium">{module.rules.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Críticas:</span>
                                    <span className="text-red-600 font-medium">
                                        {module.rules.filter(r => r.level === 'critical').length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Advertencias:</span>
                                    <span className="text-yellow-600 font-medium">
                                        {module.rules.filter(r => r.level === 'warning').length}
                                    </span>
                                </div>
                                {existingRulesCount > 0 && !isApplied && (
                                    <div className="flex justify-between text-orange-600">
                                        <span>Reglas existentes:</span>
                                        <span className="font-medium">{existingRulesCount}</span>
                                    </div>
                                )}
                            </div>

                            {/* Botón de Acción */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isApplied) {
                                        applyModule(module);
                                    }
                                }}
                                disabled={isApplying}
                                className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${isApplied
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : isApplying
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
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
                                        <span>Aplicado</span>
                                    </div>
                                ) : (
                                    `Aplicar Módulo`
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Mensaje si no hay resultados */}
            {filteredModules.length === 0 && (
                <div className="text-center py-12">
                    <Info className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron módulos</h3>
                    <p className="text-gray-600">Intenta con otros términos de búsqueda o categorías</p>
                </div>
            )}
        </div>
    );
};