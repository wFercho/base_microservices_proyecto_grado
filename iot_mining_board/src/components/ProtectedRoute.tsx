import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const isAuthenticated = authService.isAuthenticated();

  if (requireAuth && !isAuthenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Si no requiere auth pero está autenticado, redirigir al home
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};