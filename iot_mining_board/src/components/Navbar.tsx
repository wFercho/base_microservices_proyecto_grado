import { useState, useEffect } from 'react';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../Context/NotificationsContext';
import { UserProfileDropdown } from './UserProfile/UserProfileDropdown';
import { useAlerts } from './hooks/useAlerts';

interface NavbarProps {
  toggleSidebar: () => void;
  onThemeChange?: (isDark: boolean) => void;
}

export const Navbar = ({ toggleSidebar, onThemeChange }: NavbarProps) => {
  const { alerts, markAsRead, unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const {
    alerts: alertList,
  } = useAlerts();
  // Verificar el tema inicial
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark);

    setIsDarkMode(shouldBeDark);
    onThemeChange?.(shouldBeDark);

    // Aplicar clase dark al html
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [onThemeChange]);

  const handleNotificationClick = (sensorId: string) => {
    console.log(sensorId, "sensorId");
    navigate(`/home?alert=${sensorId}&showAlerts=true`);
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    markAsRead();
    setShowNotifications(false);
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    onThemeChange?.(newDarkMode);

    // Aplicar/remover clase dark
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md dark:shadow-lg p-4 flex justify-between items-center w-full relative transition-colors duration-300">

      <button
        onClick={toggleSidebar}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
        aria-label="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>

      <h1 className="text-xl font-bold">
        Sistema de Monitoreo
      </h1>

      <div className="flex items-center space-x-2">
        {/* Botón de tema - SÚPER SIMPLE */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-600 cursor-pointer dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
          aria-label={isDarkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        {/* Notificaciones */}
        <div className="relative">
          <button
            className="p-2 text-gray-600 cursor-pointer dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200 relative"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (showNotifications && unreadCount > 0) {
                markAsRead();
              }
            }}
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50">

              <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-md flex justify-between items-center">
                <h3 className="font-medium text-gray-700 dark:text-gray-200">
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {alerts.length > 0 ? (
                  <>
                    {alerts.length > 50 && (
                      <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20">
                        Mostrando las últimas 50  de {alerts.length} notificaciones
                      </div>
                    )}
                    {alerts
                      .slice(50)

                      .map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 border-b border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${alert.type === 'DANGER' || alert.type === 'ERROR'
                            ? 'bg-red-50 dark:bg-red-900/20'
                            : 'bg-yellow-50 dark:bg-yellow-900/20'
                            }`}
                          onClick={() => handleNotificationClick(alert.sensorId)}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${alert.type === 'DANGER' || alert.type === 'ERROR'
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-yellow-700 dark:text-yellow-300'
                              }`}>
                              {alert.message}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${alert.type === 'DANGER' || alert.type === 'ERROR'
                              ? 'bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-200'
                              : 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200'
                              }`}>
                              {alert.type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' • '}
                            {alert.timestamp.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      ))
                    }
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No hay notificaciones nuevas
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <UserProfileDropdown />

      </div>
    </nav>
  );
};