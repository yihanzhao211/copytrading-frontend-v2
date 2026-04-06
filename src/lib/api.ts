// API 配置
export const API_BASE_URL = 'https://1309969847-043fcmf88j.ap-guangzhou.tencentscf.com/api/v1';

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
  },
  
  // 订单
  orders: {
    list: () => apiRequest('/orders/'),
    create: (data: any) => apiRequest('/orders/', { method: 'POST', body: JSON.stringify(data) }),
  },
};
