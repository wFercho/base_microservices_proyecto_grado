import { ApiResponse, AuthResponse, LoginCredentials, User, UserCreate, UserUpdate } from "../interfaces/Users";

const API_BASE_URL = import.meta.env.VITE_API_URL
class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headerInit: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar token si existe
    if (this.token) {
      headerInit['Authorization'] = `Bearer ${this.token}`;
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

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
   

    const result = await this.request<AuthResponse>('/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (result.data) {
      this.setToken(result.data.access_token);
    }

    return result;
  }

  async register(userData: UserCreate): Promise<ApiResponse<User>> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me');
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

  // Gestión del token
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  removeToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();