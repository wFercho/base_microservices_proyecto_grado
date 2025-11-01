import { useEffect, useMemo, useRef } from "react";
import { Matrix4, Mesh, Vector3 } from "three";

interface Connection3DAdvancedProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  color?: string;
}

const Connection3DAdvanced: React.FC<Connection3DAdvancedProps> = ({
  startPos,
  endPos,
  color = "#FFFFFF",
}) => {
  const start = useMemo(
    () => new Vector3(startPos[0], startPos[1], startPos[2]),
    [startPos]
  );

  const end = useMemo(
    () => new Vector3(endPos[0], endPos[1], endPos[2]),
    [endPos]
  );

  const direction = useMemo(
    () => new Vector3().subVectors(end, start),
    [start, end]
  );

  const length = useMemo(() => direction.length(), [direction]);

  const midPoint = useMemo(
    () => new Vector3().addVectors(start, end).multiplyScalar(0.5),
    [start, end]
  );

  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const lookAt = new Matrix4().lookAt(start, end, new Vector3(0, 1, 0));
    meshRef.current.quaternion.setFromRotationMatrix(lookAt);
    meshRef.current.rotateX(Math.PI / 2);
  }, [start, end]);

  return (
    <mesh ref={meshRef} position={midPoint}>
      <cylinderGeometry args={[0.05, 0.05, length, 8]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

export { Connection3DAdvanced };