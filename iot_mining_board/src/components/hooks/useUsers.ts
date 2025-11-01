import { useState, useCallback } from 'react';
import { userService } from '../../services/userService';
import { User, UserCreate, UserUpdate } from '../../interfaces/Users';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: (skip?: number, limit?: number) => Promise<void>;
  createUser: (userData: UserCreate) => Promise<boolean>;
  updateUser: (userId: number, userData: UserUpdate) => Promise<boolean>;
  deleteUser: (userId: number) => Promise<boolean>;
  clearError: () => void;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (skip: number = 0, limit: number = 100) => {
    setLoading(true);
    setError(null);

    const result = await userService.getAllUsers(skip, limit);
    
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      setError(result.error || 'Error fetching users');
    }

    setLoading(false);
  }, []);

  const createUser = useCallback(async (userData: UserCreate): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await userService.createUser(userData);
    
    if (result.success && result.data) {
      setUsers(prev => [...prev, result.data!]);
      setLoading(false);
      return true;
    } else {
      setError(result.error || 'Error creating user');
    }

    setLoading(false);
    return false;
  }, []);

  const updateUser = useCallback(async (userId: number, userData: UserUpdate): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await userService.updateUser(userId, userData);
    
    if (result.success && result.data) {
      setUsers(prev => prev.map(user => 
        user.id === userId ? result.data! : user
      ));
      setLoading(false);
      return true;
    } else {
      setError(result.error || 'Error updating user');
    }

    setLoading(false);
    return false;
  }, []);

  const deleteUser = useCallback(async (userId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await userService.deleteUser(userId);
    
    if (result.success) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setLoading(false);
      return true;
    } else {
      setError(result.error || 'Error deleting user');
    }

    setLoading(false);
    return false;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
};