// Mine3D/Node.tsx
import { Billboard, Text } from "@react-three/drei";
import { INodeIn3D, SensorStatus, ZoneCategory } from "../../interfaces/main";
import { Vector3, Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo, useEffect } from "react";

interface NodeDetailsProps {
  selectedNode: INodeIn3D;
  onClose: () => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({ selectedNode, onClose }) => {
  // Contar sensores por status
  const sensorCounts = {
    normal: selectedNode.sensors.filter(s => s.status === 'normal').length,
    warning: selectedNode.sensors.filter(s => s.status === 'warning').length,
    danger: selectedNode.sensors.filter(s => s.status === 'danger').length
  };

  // Determinar el status general del nodo
  const getOverallNodeStatus = () => {
    if (sensorCounts.danger > 0) return 'danger';
    if (sensorCounts.warning > 0) return 'warning';
    return 'normal';
  };

  const overallStatus = getOverallNodeStatus();
  const statusColor = overallStatus === 'danger' ? '#ef4444' :
    overallStatus === 'warning' ? '#f59e0b' : '#10b981';

  return (
    <div className="p-4 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-lg border">
      {/* Header con status */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <div>
          <h3 className="text-lg font-semibold">Nodo: {selectedNode.id}</h3>
          <div
            className="text-sm font-medium px-2 py-1 rounded-full inline-block mt-1"
            style={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
              border: `1px solid ${statusColor}40`
            }}
          >
            Status: {overallStatus.toUpperCase()}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      {/* Información del nodo */}
      <div className="space-y-3 mb-4">
        <p><strong>Zona:</strong> {ZoneCategory[selectedNode.zone.category]}</p>
        <p><strong>Nombre:</strong> {selectedNode.zone.name}</p>
        <p>
          <strong>Posición:</strong> X: {selectedNode.position.x.toFixed(2)},
          Y: {selectedNode.position.y.toFixed(2)},
          Z: {selectedNode.position.z.toFixed(2)}
        </p>

        {/* Resumen de sensores */}
        <div className="flex gap-2 text-sm">
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
            Normal: {sensorCounts.normal}
          </span>
          <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800">
            Warning: {sensorCounts.warning}
          </span>
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
            Danger: {sensorCounts.danger}
          </span>
        </div>
      </div>

      {/* Lista de sensores */}
      <div>
        <h4 className="font-semibold mb-2">Sensores ({selectedNode.sensors.length})</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {selectedNode.sensors.map((sensor) => (
            <div
              key={`${selectedNode.id}-${sensor.id}`}
              className="p-3 border rounded-lg"
              style={{
                borderLeftColor: sensor.alert?.color || '#d1d5db',
                borderLeftWidth: '4px',
                backgroundColor: sensor.status === 'normal' ? '#f9fafb' : 'white'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{sensor.category}</span>
                    {sensor.status && sensor.status !== 'normal' && (
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${sensor.alert?.color}20`,
                          color: sensor.alert?.color
                        }}
                      >
                        {sensor.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {sensor.id}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {sensor.value !== undefined ? `${sensor.value} ${sensor.unit}` : 'Sin datos'}
                  </div>
                  {sensor.timestamp && (
                    <div className="text-xs text-gray-500">
                      {new Date(sensor.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface NodeVisualizationProps {
  node: INodeIn3D;
  onClick: () => void;
  isDarkMode: boolean;
}

const NodeVisualization: React.FC<NodeVisualizationProps> = ({
  node,
  onClick,
  isDarkMode,
}) => {
  const meshRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const [pulseTime, setPulseTime] = useState(0);

  // Debug: verificar props
  useEffect(() => {
    console.log('🔍 NodeVisualization renderizado:', {
      nodeId: node.id,
      nodeColor: node.color,
      sensors: node.sensors?.length,
      position: node.position
    });
  }, [node]);

  // Posición del nodo - SIMPLIFICADO
  const position: [number, number, number] = [
    node.position.x,
    node.position.y,
    node.position.z
  ];

  // Obtener el status más crítico del nodo - SIMPLIFICADO
  const getNodeStatus = (): SensorStatus => {
    if (!node.sensors || node.sensors.length === 0) return 'normal';

    const hasDanger = node.sensors.some(s => s.status === 'danger');
    const hasWarning = node.sensors.some(s => s.status === 'warning');

    if (hasDanger) return 'danger';
    if (hasWarning) return 'warning';
    return 'normal';
  };

  const nodeStatus = getNodeStatus();

  // Color del nodo - USAR DIRECTAMENTE EL COLOR DEL STORE O CALCULARLO
  const nodeColor = useMemo(() => {
    // Si el nodo ya tiene un color definido (del store), usarlo
    // if (node.color) {
    //   return node.color;
    // }

    // Si no, calcular basado en el status
    switch (nodeStatus) {
      case 'danger':
        return '#ff0000'; // Rojo
      case 'warning':
        return '#ffa500'; // Naranja
      default:
        return '#22c55e'; // Verde para normal
    }
  }, [node.color, nodeStatus]);

  console.log('🎨 Color calculado para nodo', node.id, ':', nodeColor);

  // Animación simplificada
  useFrame((_, delta) => {
    if (nodeStatus !== 'normal') {
      setPulseTime(prev => prev + delta);

      if (meshRef.current) {
        const pulseValue = Math.sin(pulseTime * 5) * 0.5 + 0.5;
        const material = meshRef.current.material as any;
        if (material && material.emissiveIntensity !== undefined) {
          material.emissiveIntensity = 0.3 + pulseValue * 0.7;
        }
      }

      if (haloRef.current && nodeStatus === 'danger') {
        const material = haloRef.current.material as any;
        if (material && material.opacity !== undefined) {
          material.opacity = Math.sin(pulseTime * 4) * 0.3 + 0.3;
        }
      }
    }
  });

  // Configuración de texto de status
  const getStatusConfig = () => {
    switch (nodeStatus) {
      case 'danger':
        return { text: 'PELIGRO', color: '#ff0000' };
      case 'warning':
        return { text: 'ALERTA', color: '#ffa500' };
      default:
        return { text: 'NORMAL', color: isDarkMode ? '#22c55e' : '#16a34a' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <group>
      {/* Halo de alerta (solo para danger) */}
      {nodeStatus === 'danger' && (
        <mesh position={position} ref={haloRef}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color={nodeColor}
            transparent
            opacity={0.3}
            emissive={nodeColor}
          />
        </mesh>
      )}

      {/* Nodo principal - SIMPLIFICADO */}
      <mesh
        position={position}
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          console.log('🖱️ Nodo clickeado:', node.id, 'Color:', nodeColor);
          onClick();
        }}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={nodeStatus !== 'normal' ? 0.5 : 0.1}
        />
      </mesh>

      {/* Texto de categoría de zona */}
      <Billboard
        position={[position[0], position[1] + 0.5, position[2]]}
      >
        <Text
          fontSize={0.2} // Un poco más grande
          color={isDarkMode ? "white" : "black"}
          anchorX="center"
          anchorY="middle"
        >
          {node.zone.category}
        </Text>
      </Billboard>

      {/* Texto del nombre de la zona */}
      <Billboard
        position={[position[0], position[1] + 0.8, position[2]]}
      >
        <Text
          fontSize={0.15} // Un poco más grande
          color={isDarkMode ? "lightgray" : "gray"}
          anchorX="center"
          anchorY="middle"
        >
          {node.zone.name}
        </Text>
      </Billboard>

      {/* Indicador de status */}
      <Billboard
        position={[position[0], position[1] + 1.1, position[2]]}
      >
        <Text
          fontSize={0.18} // Más grande
          color={statusConfig.color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {statusConfig.text}
        </Text>
      </Billboard>
    </group>
  );
};

export { NodeDetails, NodeVisualization };