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

  // 行情
  market: {
    tickers: () => apiRequest('/market/tickers'),
  },

  // 策略分析
  strategy: {
    generate: (symbol: string, timeframe: string) =>
      apiRequest('/strategy/generate', { method: 'POST', body: JSON.stringify({ symbol, timeframe }) }),
    backtest: (symbol: string, timeframe: string, days?: number) =>
      apiRequest('/strategy/backtest', { method: 'POST', body: JSON.stringify({ symbol, timeframe, days }) }),
    wickAnalysis: (symbol: string, timeframe: string) =>
      apiRequest('/strategy/wick-analysis', { method: 'POST', body: JSON.stringify({ symbol, timeframe }) }),
  },

  // 会员
  wallet: {
    get: () => apiRequest('/wallet/'),
    recharge: (data: { months: number; method?: string }) =>
      apiRequest('/wallet/recharge', { method: 'POST', body: JSON.stringify(data) }),
    recharges: (params?: { limit?: number; offset?: number }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return apiRequest(`/wallet/recharges?${query}`);
    },
    confirm: (id: number, data: { status: string; note?: string }) =>
      apiRequest(`/wallet/recharge/${id}/confirm`, { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: number) =>
      apiRequest(`/wallet/recharge/${id}/cancel`, { method: 'POST' }),
  },

  // 邀请
  invite: {
    generate: () => apiRequest('/invite/generate', { method: 'POST' }),
    stats: () => apiRequest('/invite/stats'),
    records: () => apiRequest('/invite/records'),
  },

  // 社区
  community: {
    sections: () => apiRequest('/community/sections'),
    posts: (params?: { section_id?: number; sort?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return apiRequest(`/community/posts?${query}`);
    },
    postDetail: (id: number) => apiRequest(`/community/posts/${id}`),
    createPost: (data: any) => apiRequest('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
    createComment: (postId: number, content: string) =>
      apiRequest(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    likePost: (postId: number) => apiRequest(`/community/posts/${postId}/like`, { method: 'POST' }),
    checkIn: () => apiRequest('/community/check-in', { method: 'POST' }),
    traderPosts: (traderId: number) => apiRequest(`/community/traders/${traderId}/posts`),
  },
};
