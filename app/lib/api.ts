import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.8:3000/api';
//const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.client = axios.create(config);

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log('[API] Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('[API] Response:', response.status, response.config.url);
        return response;
      },
      (error: AxiosError) => {
        console.error('[API] Response error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
        if (error.response?.status === 401) {
          // Handle unauthorized
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  clearToken(): void {
    this.token = null;
    delete this.client.defaults.headers.common.Authorization;
  }

  getToken(): string | null {
    return this.token;
  }

  async get(url: string, config?: any) {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config);
  }

  async delete(url: string, config?: any) {
    return this.client.delete(url, config);
  }
}

const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
