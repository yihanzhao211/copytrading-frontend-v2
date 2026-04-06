import { useState } from 'react';
import { Key, Shield, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface BindApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  traderId?: number;
}

const API_BASE_URL = 'https://copytrading-backend-production.up.railway.app/api/v1';

export default function BindApiModal({ isOpen, onClose, traderId = 1 }: BindApiModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [testnet, setTestnet] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string; balance?: any} | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/trader-api/${traderId}/bind-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          api_secret: apiSecret,
          testnet: testnet
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: 'API绑定成功！',
          balance: data.balance
        });
        // 清空输入
        setApiKey('');
        setApiSecret('');
      } else {
        setResult({
          success: false,
          message: data.detail || data.message || '绑定失败'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || '网络错误'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-gray-900 rounded-2xl border border-white/10 p-6">
        {/* 标题 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">绑定币安API</h2>
            <p className="text-neutral-400 text-sm">连接您的币安账户以开始跟单</p>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="flex items-start gap-3 p-4 mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-400/90">
            <p className="font-medium mb-1">安全提示</p>
            <ul className="space-y-1 text-yellow-400/70">
              <li>• 请使用<b>只读权限</b>的API Key</li>
              <li>• 不要将API Key分享给他人</li>
              <li>• 建议先使用测试网进行验证</li>
            </ul>
          </div>
        </div>

        {/* 结果提示 */}
        {result && (
          <div className={`flex items-start gap-3 p-4 mb-6 rounded-xl ${
            result.success 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            {result.success ? (
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div>
              <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                {result.message}
              </p>
              {result.balance && (
                <p className="text-green-400/70 text-sm mt-1">
                  USDT余额: {result.balance.USDT}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                placeholder="输入您的币安API Key"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* API Secret */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">API Secret</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none"
                placeholder="输入您的币安API Secret"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 测试网选项 */}
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <input
              type="checkbox"
              id="testnet"
              checked={testnet}
              onChange={(e) => setTestnet(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500"
            />
            <label htmlFor="testnet" className="text-neutral-300">
              使用币安测试网（推荐先测试）
            </label>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-neutral-400 hover:bg-white/5 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {loading ? '绑定中...' : '绑定API'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
