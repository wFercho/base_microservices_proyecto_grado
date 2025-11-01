import React, { useState } from "react";
import { ChevronDown, ChevronUp, Home, Settings, Grid, DoorClosed, User, Layers, Pickaxe, BookMinus, OctagonMinus, Axis3D } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ruta actual
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);

  const toggleDevices = () => {
    setIsDevicesOpen(!isDevicesOpen);
  };

  // Función para determinar si un ítem está activo
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { name: "3D", icon: <Axis3D size={20} className="mr-2" />, path: "/mines_3d" },
    /*     { name: "Alarmas", icon: <AlertCircle size={20} className="mr-2" />, path: "/alarmas" },
     */
    { name: "Tableros", icon: <Grid size={20} className="mr-2" />, path: "/tableros" },
    { name: "Perfiles", icon: <User size={20} className="mr-2" />, path: "/perfiles" },
    { name: "Configuración", icon: <Settings size={20} className="mr-2" />, path: "/configuracion" },
  ];

  return (
    <aside className={`bg-gray-800 text-white w-64 p-4 ${isOpen ? "block" : "hidden"}`}>
      <h2 className="text-xl font-bold">IOT Mine System</h2>
      <ul className="mt-4">
        {/* Elemento "Inicio" */}
        <li
          className={`flex items-center p-2 rounded cursor-pointer transition duration-200 ${isActive("/home") ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          onClick={() => navigate("/home")}
        >
          <Home size={20} className="mr-2" />
          <span>Inicio</span>
        </li>

        {/* Elemento "Dispositivos" con submenú */}
        <li
          className={`flex items-center justify-between p-2 rounded cursor-pointer transition duration-200 ${location.pathname.startsWith("/sensores") ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          onClick={toggleDevices}
        >
          <div className="flex items-center">
            <Layers size={20} className="mr-2" />
            <span>Dispositivos</span>
          </div>
          {isDevicesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </li>

        {isDevicesOpen && (
          <ul className="ml-4 mt-2">
            <li
              className={`flex items-center p-2 rounded cursor-pointer transition duration-200 ${isActive("/minas") ? "bg-gray-600" : "hover:bg-gray-600"}`}
              onClick={() => navigate("/minas")}

            >
              <Pickaxe size={20} className="mr-2" />
              <span>Minas</span>
            </li>
            <li
              className={`flex items-center p-2 rounded cursor-pointer transition duration-200 ${isActive("/gateways") ? "bg-gray-600" : "hover:bg-gray-600"}`}
              onClick={() => navigate("/gateways")}

            >
              <DoorClosed size={20} className="mr-2" />
              <span>Gateways</span>
            </li>
            <li className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer transition duration-200"
              onClick={() => navigate("/nodos_sensores")}
            >
              <BookMinus size={20} className="mr-2" />
              <span>Nodos Sensores</span>
            </li>
            <li className={`flex items-center p-2 rounded cursor-pointer transition duration-200 ${isActive("/sensores") ? "bg-gray-600" : "hover:bg-gray-600"}`}
              onClick={() => navigate("/sensores")}
            >
              <OctagonMinus size={20} className="mr-2" />
              <span>Sensores</span>
            </li>
          </ul>
        )}

        {/* Otros elementos */}
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={`flex items-center p-2 rounded cursor-pointer transition duration-200 ${isActive(item.path) ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;