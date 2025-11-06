import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Home, Settings, Grid, DoorClosed, User, Layers, Pickaxe, BookMinus, OctagonMinus, Axis3D, X, Menu } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleDevices = () => {
    setIsDevicesOpen(!isDevicesOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // Cerrar sidebar en móvil después de navegar
    if (isMobile) {
      onToggle();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isActiveParent = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  const menuItems = [
    { name: "3D", icon: <Axis3D size={20} className="mr-2" />, path: "/mines_3d" },
    { name: "Tableros", icon: <Grid size={20} className="mr-2" />, path: "/tableros" },
    { name: "Perfiles", icon: <User size={20} className="mr-2" />, path: "/perfiles" },
    { name: "Configuración", icon: <Settings size={20} className="mr-2" />, path: "/configuracion" },
  ];

  const devicePaths = ["/minas", "/gateways", "/nodos_sensores", "/sensores"];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:relative
          bg-gray-800 text-white
          w-64 h-full
          p-4
          z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isOpen ? 'block' : 'hidden md:block'}
          shadow-lg md:shadow-none
        `}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">IOT Mine System</h2>
          
          {/* Botón de cerrar en móvil */}
          {isMobile && (
            <button 
              onClick={onToggle}
              className="p-1 rounded-md hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <ul className="space-y-1">
          {/* Elemento "Inicio" */}
          <li>
            <button
              className={`flex items-center w-full p-2 rounded cursor-pointer transition duration-200 ${
                isActive("/home") ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
              onClick={() => handleNavigation("/home")}
            >
              <Home size={20} className="mr-2" />
              <span>Inicio</span>
            </button>
          </li>

          {/* Elemento "Dispositivos" con submenú */}
          <li>
            <button
              className={`flex items-center justify-between w-full p-2 rounded cursor-pointer transition duration-200 ${
                isActiveParent(devicePaths) ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
              onClick={toggleDevices}
            >
              <div className="flex items-center">
                <Layers size={20} className="mr-2" />
                <span>Dispositivos</span>
              </div>
              {isDevicesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isDevicesOpen && (
              <ul className="ml-4 mt-1 space-y-1">
                <li>
                  <button
                    className={`flex items-center w-full p-2 rounded cursor-pointer transition duration-200 ${
                      isActive("/minas") ? "bg-gray-600" : "hover:bg-gray-600"
                    }`}
                    onClick={() => handleNavigation("/minas")}
                  >
                    <Pickaxe size={20} className="mr-2" />
                    <span>Minas</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center w-full p-2 rounded cursor-pointer transition duration-200 ${
                      isActive("/gateways") ? "bg-gray-600" : "hover:bg-gray-600"
                    }`}
                    onClick={() => handleNavigation("/gateways")}
                  >
                    <DoorClosed size={20} className="mr-2" />
                    <span>Gateways</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center w-full p-2 rounded cursor-pointer transition duration-200 ${
                      isActive("/nodos_sensores") ? "bg-gray-600" : "hover:bg-gray-600"
                    }`}
                    onClick={() => handleNavigation("/nodos_sensores")}
                  >
                    <BookMinus size={20} className="mr-2" />
                    <span>Nodos Sensores</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`flex items-center w-full p-2 rounded cursor-pointer transition duration-200 ${
                      isActive("/sensores") ? "bg-gray-600" : "hover:bg-gray-600"
                    }`}
                    onClick={() => handleNavigation("/sensores")}
                  >
                    <OctagonMinus size={20} className="mr-2" />
                    <span>Sensores</span>
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* Otros elementos del menú */}
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                className={`flex items-center w-full p-2 rounded cursor-pointer transition duration-200 ${
                  isActive(item.path) ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

// Componente HamburguerButton para móvil (opcional, para usar en tu layout principal)
export const HamburgerButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-800 text-white md:hidden shadow-lg"
    >
      <Menu size={20} />
    </button>
  );
};

export default Sidebar;