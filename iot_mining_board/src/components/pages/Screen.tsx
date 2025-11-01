// components/Scene.tsx
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import { INodeIn3D } from "../../interfaces/main";
import { Canvas } from "@react-three/fiber";
import { Connection3DAdvanced } from "../Mine3D/Connection3D";
import { NodeDetails, NodeVisualization } from "../Mine3D/Node";
import Layout from "../MainLayout";
import { useParams } from "react-router-dom";
import { useMineNodes3D } from "../hooks/useMineNodes3D";

const Scene = () => {
  const { id: mine_id } = useParams<{ id: string }>();
  const isDarkMode = false;
  const [selectedNode, setSelectedNode] = useState<INodeIn3D | null>(null);
  const orbitControlsRef = useRef<any>(null);
  const {
    nodes3D,
    loading,
    error,
    wsConnected,
    connectionState,
    reconnectWebSocket
  } = useMineNodes3D(mine_id);

  const nodes3dData = nodes3D?.nodes;
  const sceneContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedNode(null);
    console.log(`📍 Mina cambiada a: ${mine_id}, reseteando selección`);
  }, [mine_id]);
  
  // Efecto para debuggear cambios en los datos
  useEffect(() => {
    if (nodes3dData) {
      console.log('📊 Scene - Datos actualizados:', {
        totalNodos: nodes3dData.length,
        nodosConSensores: nodes3dData.filter(n => n.sensors?.length > 0).length,
        totalSensores: nodes3dData.reduce((acc, node) => acc + (node.sensors?.length || 0), 0),
        colores: nodes3dData.map(n => ({ id: n.id, color: n.color, status: n.nodeStatus }))
      });

      // Log del primer nodo para ver estructura
      if (nodes3dData.length > 0) {
        console.log('🔍 Primer nodo detalle:', {
          id: nodes3dData[0].id,
          color: nodes3dData[0].color,
          sensors: nodes3dData[0].sensors?.map(s => ({
            id: s.id,
            value: s.value,
            status: s.status,
            alert: s.alert
          }))
        });
      }
    }
  }, [nodes3dData]);

  // Efecto para mantener actualizado el nodo seleccionado
  useEffect(() => {
    if (selectedNode && nodes3dData) {
      const updatedNode = nodes3dData.find(node => node.id === selectedNode.id);
      if (updatedNode) {
        console.log('🔄 Actualizando nodo seleccionado:', updatedNode.id);
        setSelectedNode(updatedNode);
      } else {
        console.warn('❌ Nodo seleccionado no encontrado en datos actualizados');
        setSelectedNode(null);
      }
    }
  }, [nodes3dData, selectedNode]);
  // Resetear nodo seleccionado cuando cambian los datos
  useEffect(() => {
    if (selectedNode && nodes3dData) {
      const updatedNode = nodes3dData.find(node => node.id === selectedNode.id);
      setSelectedNode(updatedNode || null);
    }
  }, [nodes3dData]);

  // Control de cámara
  useEffect(() => {
    if (orbitControlsRef.current && selectedNode) {
      orbitControlsRef.current.target.set(
        selectedNode.position.x,
        selectedNode.position.y,
        selectedNode.position.z
      );
      orbitControlsRef.current.update();
    }
  }, [selectedNode]);

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </Layout>
  );

  if (!nodes3dData || nodes3dData.length === 0) return (
    <Layout>
      <div className="text-center py-8">
        <p>Sin datos de nodos disponibles</p>
        <p className="text-sm text-gray-600 mt-2">Mine ID: {mine_id}</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="h-full flex flex-col" ref={sceneContainerRef}>
        {/* Header */}
        {/* <div className="w-full px-4 py-2 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${wsConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm">
                {wsConnected ? "Conectado" : "Desconectado"}
              </span>
            </div>
            {!connectionState && (
              <button
                onClick={reconnectWebSocket}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Reconectar
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {nodes3dData.length} nodos
          </div>
        </div> */}

        {error && (
          <div className="w-full p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <div className="flex justify-between items-center">
              <p>{error}</p>
              <button
                onClick={reconnectWebSocket}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Contenedor principal con posición relativa para el modal */}
        <div className="flex-1 relative bg-gray-50">
          <Canvas
            style={{ width: "100%", height: "100%" }}
            camera={{ position: [7, 7, 7] }}
            onPointerMissed={() => setSelectedNode(null)}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Conexiones */}
            {nodes3dData.map((node) =>
              node.connections.map((connId) => {
                const endNode = nodes3dData.find((s) => s.id === connId);
                if (!endNode) return null;

                return (
                  <Connection3DAdvanced
                    key={`connection-${node.id}-${connId}`}
                    startPos={[node.position.x, node.position.y, node.position.z]}
                    endPos={[endNode.position.x, endNode.position.y, endNode.position.z]}
                    color="#666666"
                  />
                );
              })
            )}

            {/* Nodos */}
            {nodes3dData.map((node) => (
              <NodeVisualization
                key={node.id}
                node={node}
                onClick={() => setSelectedNode(node)}
                isDarkMode={isDarkMode}
              />
            ))}

            <OrbitControls
              ref={orbitControlsRef}
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
            />
          </Canvas>

          {/* Modal de detalles DEL NODO - ahora dentro del contenedor relativo */}
          {selectedNode && (
            <div className="absolute top-4 right-4 max-w-md bg-white rounded-lg shadow-lg border">
              <NodeDetails
                selectedNode={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export { Scene };