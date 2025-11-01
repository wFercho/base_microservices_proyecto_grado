import { ApiResponse, User, UserCreate, UserUpdate } from '../interfaces/Users';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL

class UserService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = authService.getToken();

        const headerInit: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Agregar token si existe
        if (token) {
            headerInit['Authorization'] = `Bearer ${token}`;
        }

        // Combinar con headers de options
        const headers: HeadersInit = {
            ...headerInit,
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { data, success: true };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                success: false,
            };
        }
    }

    async getAllUsers(skip: number = 0, limit: number = 100): Promise<ApiResponse<User[]>> {
        return this.request<User[]>(`/users?skip=${skip}&limit=${limit}`);
    }

    async getUserById(userId: number): Promise<ApiResponse<User>> {
        return this.request<User>(`/users/${userId}`);
    }

    async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
        return this.request<User>('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(userId: number, userData: UserUpdate): Promise<ApiResponse<User>> {
        return this.request<User>(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(userId: number): Promise<ApiResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/users/${userId}`, {
            method: 'DELETE',
        });
    }
}

export const userService = new UserService();