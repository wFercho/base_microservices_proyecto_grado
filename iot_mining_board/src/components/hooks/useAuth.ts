import { useState, useEffect, useCallback } from 'react';
import { LoginCredentials, User, UserCreate } from '../../interfaces/Users';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: UserCreate) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Cargar usuario actual al iniciar
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser();
        if (result.success && result.data) {
          setUser(result.data);
        } else {
          authService.removeToken();
        }
      }
      setLoading(false);
    };

    loadCurrentUser();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await authService.login(credentials);
    
    if (result.success && result.data) {
      const userResult = await authService.getCurrentUser();
      if (userResult.success && userResult.data) {
        setUser(userResult.data);
        return true;
      }
    } else {
      setError(result.error || 'Error during login');
    }

    setLoading(false);
    return false;
  }, []);

  const register = useCallback(async (userData: UserCreate): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await authService.register(userData);
    
    if (result.success && result.data) {
      setUser(result.data);
      return true;
    } else {
      setError(result.error || 'Error during registration');
    }

    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    authService.removeToken();
    setUser(null);
    setError(null);
    navigate("/login");
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
  };
};