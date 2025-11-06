import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { HamburgerButton } from "./Sidebar";
import { Navbar } from "./Navbar";

interface LayoutProps {
  sidebarContent?: React.ReactNode;
  navbarContent?: React.ReactNode;
  initialSidebarOpen?: boolean;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  initialSidebarOpen = true,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(initialSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar reutilizable */}
      <HamburgerButton onClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Área principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar personalizable */}
        <Navbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        >
        </Navbar>

        {/* Contenido dinámico */}
        <div className="p-4 flex-1 overflow-y-auto bg-white dark:bg-gray-900 transition-colors duration-300">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;