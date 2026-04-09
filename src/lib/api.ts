// API 配置
export const API_BASE_URL = 'https://copytrading-backend-production.up.railway.app/api/v1';

// 通用请求封装
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.detail || error.message || '请求失败');
  }
  
  return response.json();
}

// API 方法
export const api = {
  // 认证
  auth: {
    login: (email: string, password: string) => 
      apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: any) => 
      apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => apiRequest('/auth/me'),
  },
  
  // 交易员
  traders: {
    list: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/traders/?${query}`);
    },
    detail: (id: number) => apiRequest(`/traders/${id}`),
  },
  
  // 跟单
  follow: {
    list: () => apiRequest('/follow/'),
    create: (data: any) => apiRequest('/follow/', { method: 'POST', body: JSON.stringify(data) }),
    pause: (id: number) => apiRequest(`/follow/${id}/pause`, { method: 'POST' }),
    resume: (id: number) => apiRequest(`/follow/${id}/resume`, { method: 'POST' }),
    delete: (id: number) => apiRequest(`/follow/${id}`, { method: 'DELETE' }),
  },
  
  // 订单
  orders: {
    list: () => apiRequest('/orders/'),
    create: (data: any) => apiRequest('/orders/', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  // 跟单引擎
  copyEngine: {
    status: () => apiRequest('/copy-engine/status'),
    syncTrader: (id: number) => apiRequest(`/copy-engine/sync/${id}`, { method: 'POST' }),
    syncAll: () => apiRequest('/copy-engine/sync-all', { method: 'POST' }),
  },
};
