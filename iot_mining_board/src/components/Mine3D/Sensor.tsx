interface SensorProps {
    position: [number, number, number];
    onClick: () => void;
    category: string;
}

const Sensor: React.FC<SensorProps> = ({ position, onClick, category }) => {
    const getColorByCategory = (category: string) => {
        switch (category) {
            case "bocamina":
                return "blue";
            case "extraction":
                return "gray";
            case "tunel":
                return "#2268e0";
            default:
                return "#FFFFFF";
        }
    };

    return (
        <mesh position={position} onClick={onClick}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
                color={getColorByCategory(category)}
                emissive="red"
                emissiveIntensity={0.5}
            />
        </mesh>
    );
};

export { Sensor };