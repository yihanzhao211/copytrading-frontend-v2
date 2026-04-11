import { useState } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, User, 
  ArrowLeft, AlertCircle 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name: string; username?: string; level?: number; exp?: number; points?: number; membership_expires_at?: string | null; role?: string }) => void;
}

// API 配置
const API_BASE_URL = 'https://copytrading-backend-production.up.railway.app/api/v1';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 验证
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致');
        setIsLoading(false);
        return;
      }
      if (!formData.agreeTerms) {
        setError('请同意服务条款');
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        setError('密码至少需要8位');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // 调用后端登录API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.error || '登录失败');
        }

        // 保存token和用户信息
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({
          email: data.user.email,
          name: data.user.nickname || data.user.username,
          username: data.user.username,
          level: data.user.level,
          exp: data.user.exp,
          points: data.user.points,
          membership_expires_at: data.user.membership_expires_at || null,
          role: data.user.role || 'user',
        }));

        onSuccess({
          email: data.user.email,
          name: data.user.nickname || data.user.username,
          username: data.user.username,
          level: data.user.level,
          exp: data.user.exp,
          points: data.user.points,
          membership_expires_at: data.user.membership_expires_at || null,
          role: data.user.role || 'user',
        });
      } else {
        // 调用后端注册API
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.email.split('@')[0], // 使用邮箱前缀作为用户名
            password: formData.password,
            nickname: formData.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.error || '注册失败');
        }

        // 注册成功后自动登录
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem('token', loginData.access_token);
          localStorage.setItem('user', JSON.stringify({
            email: loginData.user.email,
            name: loginData.user.nickname || loginData.user.username,
            username: loginData.user.username,
            level: loginData.user.level,
            exp: loginData.user.exp,
            points: loginData.user.points,
            membership_expires_at: loginData.user.membership_expires_at || null,
            role: loginData.user.role || 'user',
          }));

          onSuccess({
            email: loginData.user.email,
            name: loginData.user.nickname || loginData.user.username,
            username: loginData.user.username,
            level: loginData.user.level,
            exp: loginData.user.exp,
            points: loginData.user.points,
            membership_expires_at: loginData.user.membership_expires_at || null,
            role: loginData.user.role || 'user',
          });
        } else {
          // 注册成功但登录失败，提示用户手动登录
          setIsLogin(true);
          setError('注册成功，请登录');
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            返回
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-black font-bold text-sm">CT</span>
            </div>
            <span className="text-white font-medium">Copy Trading</span>
          </div>
        </div>

        <div className="p-6">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? '欢迎回来' : '创建账户'}
            </h2>
            <p className="text-neutral-400 text-sm">
              {isLogin ? '登录您的账户继续交易' : '注册账户开始跟单之旅'}
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 姓名 - 仅注册时显示 */}
            {!isLogin && (
              <div>
                <label className="block text-sm text-neutral-400 mb-2">姓名</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                    placeholder="请输入您的姓名"
                    required
                  />
                </div>
              </div>
            )}

            {/* 邮箱 */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">邮箱</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="请输入密码"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-neutral-500 mt-1">密码至少8位，包含字母和数字</p>
              )}
            </div>

            {/* 确认密码 - 仅注册时显示 */}
            {!isLogin && (
              <div>
                <label className="block text-sm text-neutral-400 mb-2">确认密码</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                    placeholder="请再次输入密码"
                    required
                  />
                </div>
              </div>
            )}

            {/* 同意条款 - 仅注册时显示 */}
            {!isLogin && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                />
                <label className="text-sm text-neutral-400">
                  我已阅读并同意
                  <a href="#" className="text-cyan-400 hover:underline">服务条款</a>
                  和
                  <a href="#" className="text-cyan-400 hover:underline">隐私政策</a>
                </label>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-medium text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  处理中...
                </>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <p className="text-neutral-400 text-sm">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-1 text-cyan-400 hover:underline"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
