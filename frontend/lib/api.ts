/**
 * API Client
 * Centralized API communication
 */

const resolveApiUrl = () => {
  // Debug logging
  console.log('🔍 Resolving API URL...');
  console.log('  NEXT_PUBLIC_API_URL env:', process.env.NEXT_PUBLIC_API_URL);
  console.log('  window.location.hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A (server-side)');
  
  // HARDCODED: Force the correct API URL for production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domains - use backend subdomain
    if (hostname === 'ai.nexairalab.net' || hostname === 'airouter.rera.work') {
      const apiUrl = 'https://aib.nexairalab.net';
      console.log('✅ Production domain detected - using hardcoded:', apiUrl);
      return apiUrl;
    }
    
    // Localhost - use environment variable or default to localhost:3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (envUrl) {
        console.log('✅ Localhost with env var:', envUrl);
        return envUrl;
      }
      const port = process.env.NEXT_PUBLIC_API_PORT || '3000';
      const localUrl = `http://localhost:${port}`;
      console.log('🏠 Localhost default:', localUrl);
      return localUrl;
    }
    
    // Other domains - try environment variable first
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      console.log('✅ Using NEXT_PUBLIC_API_URL from env:', envUrl);
      return envUrl;
    }
    
    // Final fallback
    console.log('⚠️  Falling back to same domain');
    return `${window.location.protocol}//${window.location.hostname}`;
  }

  // Server-side fallback
  const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  console.log('🖥️  Server-side - using:', serverUrl);
  return serverUrl;
};

const API_URL = resolveApiUrl();

class APIClient {
  private baseURL: string;
  private token: string | null = null;
  private apiKey: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Load token and apiKey from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      this.apiKey = localStorage.getItem('apiKey');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiKey', apiKey);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('apiKey');
    }
  }

  // Make request method public for direct API calls
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Always reload token from localStorage to ensure we have the latest
    if (typeof window !== 'undefined') {
      const freshToken = localStorage.getItem('token');
      if (freshToken && freshToken !== this.token) {
        this.token = freshToken;
      }
    }

    // Always use JWT token for dashboard/management endpoints
    // API keys are ONLY for the chat completion API (external AI service usage)
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log('API Request:', { 
      url, 
      method: options.method || 'GET', 
      hasToken: !!this.token,
      tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : 'none'
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response:', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: 'Network error',
        message: `HTTP ${response.status}`
      }));
      console.error('API Error:', error);
      
      // Create a detailed error message
      const errorMessage = error.message || error.error || `HTTP ${response.status}`;
      const err = new Error(errorMessage) as any;
      err.status = response.status;
      err.details = error.details;
      throw err;
    }

    const data = await response.json();
    console.log('API Data:', data);
    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<any>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    console.log('🔐 Login response in api.ts:', response);
    
    if (response.success && response.data?.token) {
      console.log('💾 Saving token...');
      this.setToken(response.data.token);
      console.log('✅ Token saved in APIClient');
      
      // Verify it was saved
      const savedToken = localStorage.getItem('token');
      console.log('✔️ Token verification:', savedToken ? 'EXISTS' : 'MISSING');
    } else {
      console.error('❌ No token in response!');
    }
    
    return response;
  }

  async register(data: { email: string; password: string; name: string; orgName?: string }) {
    // Add default orgName if not provided
    const payload = {
      ...data,
      orgName: data.orgName || `${data.name}'s Organization`,
    };
    
    return this.request<any>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // API Keys
  async getAPIKeys() {
    return this.request<any>('/api/v1/auth/api-keys');
  }

  async createAPIKey(name: string) {
    const response = await this.request<any>('/api/v1/auth/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    
    console.log('🔑 Create API key response:', response);
    
    // Note: API keys are for external AI service usage, not dashboard access
    // The key is returned in the response but NOT automatically saved
    
    return response;
  }

  async deleteAPIKey(keyId: string) {
    return this.request<any>(`/api/v1/auth/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalyticsSummary() {
    return this.request<any>('/api/v1/analytics/summary');
  }

  async getRequestLogs(params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    const queryString = query.toString();
    return this.request<any>(`/api/v1/analytics/requests${queryString ? `?${queryString}` : ''}`);
  }

  async getAnalyticsMetrics(timeRange?: string) {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return this.request<any>(`/api/v1/analytics/metrics${params}`);
  }

  async getProviderStats() {
    return this.request<any>('/api/v1/analytics/providers');
  }

  async getModelStats() {
    return this.request<any>('/api/v1/analytics/models');
  }

  async getCostBreakdown() {
    return this.request<any>('/api/v1/analytics/cost-breakdown');
  }

  // Admin endpoints
  async getSystemStats() {
    return this.request<any>('/api/v1/admin/stats');
  }

  async getUsers() {
    return this.request<any>('/api/v1/admin/users');
  }

  async getOrganizations() {
    return this.request<any>('/api/v1/admin/organizations');
  }

  async getProviders() {
    return this.request<any>('/api/v1/admin/providers');
  }
}

export const apiClient = new APIClient(API_URL);

