import { useState } from 'react';
import { 
  ArrowLeft, Shield, AlertTriangle, DollarSign, 
  TrendingDown, Percent, Activity, Save, Loader2,
  CheckCircle, Gauge
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RiskSettings {
  maxPositionLimit: number;
  maxPositionUnit: 'fixed' | 'percent';
  dailyStopLoss: number;
  dailyStopLossEnabled: boolean;
  maxSingleTradeAmount: number;
  maxSingleTradeEnabled: boolean;
  maxLeverage: number;
  leverageLimitEnabled: boolean;
  autoStopLoss: boolean;
  autoStopLossPercent: number;
  maxOpenPositions: number;
  maxDailyTrades: number;
  pauseOnConsecutiveLosses: boolean;
  consecutiveLossesThreshold: number;
}

export default function RiskSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState<RiskSettings>({
    maxPositionLimit: 10000,
    maxPositionUnit: 'fixed',
    dailyStopLoss: 500,
    dailyStopLossEnabled: true,
    maxSingleTradeAmount: 2000,
    maxSingleTradeEnabled: true,
    maxLeverage: 20,
    leverageLimitEnabled: true,
    autoStopLoss: true,
    autoStopLossPercent: 5,
    maxOpenPositions: 10,
    maxDailyTrades: 50,
    pauseOnConsecutiveLosses: true,
    consecutiveLossesThreshold: 3,
  });

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('确定要重置所有风控设置吗？')) {
      setSettings({
        maxPositionLimit: 10000,
        maxPositionUnit: 'fixed',
        dailyStopLoss: 500,
        dailyStopLossEnabled: true,
        maxSingleTradeAmount: 2000,
        maxSingleTradeEnabled: true,
        maxLeverage: 20,
        leverageLimitEnabled: true,
        autoStopLoss: true,
        autoStopLossPercent: 5,
        maxOpenPositions: 10,
        maxDailyTrades: 50,
        pauseOnConsecutiveLosses: true,
        consecutiveLossesThreshold: 3,
      });
    }
  };

  const goBack = () => {
    window.location.hash = 'dashboard';
    window.location.reload();
  };

  const calculateRiskLevel = () => {
    let score = 0;
    if (settings.dailyStopLossEnabled) score += 20;
    if (settings.maxSingleTradeEnabled) score += 20;
    if (settings.leverageLimitEnabled) score += 20;
    if (settings.autoStopLoss) score += 20;
    if (settings.pauseOnConsecutiveLosses) score += 20;
    return score;
  };

  const riskLevel = calculateRiskLevel();
  const riskLevelText = riskLevel >= 80 ? '低风险' : riskLevel >= 50 ? '中等风险' : '高风险';
  const riskLevelColor = riskLevel >= 80 ? 'text-green-400' : riskLevel >= 50 ? 'text-yellow-400' : 'text-red-400';
  const riskLevelBg = riskLevel >= 80 ? 'bg-green-500/10' : riskLevel >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10';

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={goBack}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              返回仪表盘
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="text-white font-medium hidden sm:block">{user?.name || '用户'}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">风控设置</h1>
          <p className="text-neutral-400 mt-2">管理您的交易风险控制参数</p>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 font-medium flex items-center gap-2">
              <CheckCircle size={18} />
              风控设置已保存
            </p>
          </div>
        )}

        <div className="card-dark p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${riskLevelBg} flex items-center justify-center`}>
              <Gauge size={32} className={riskLevelColor} />
            </div>
            <div>
              <p className="text-neutral-400 text-sm">当前风险等级</p>
              <p className={`text-2xl font-bold ${riskLevelColor}`}>{riskLevelText}</p>
              <p className="text-neutral-500 text-sm">风控覆盖率 {riskLevel}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-dark p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <DollarSign size={20} className="text-cyan-400" />
              持仓限制
            </h3>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-medium">最大持仓限制</p>
                <p className="text-neutral-400 text-sm">限制单个交易对的最大持仓金额</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, maxPositionUnit: prev.maxPositionUnit === 'fixed' ? 'percent' : 'fixed' }))}
                className="px-3 py-1 rounded-lg bg-white/5 text-neutral-300 hover:bg-white/10 transition-colors text-sm"
              >
                {settings.maxPositionUnit === 'fixed' ? '固定金额' : '账户百分比'}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-cyan-400 text-xl font-medium">
                {settings.maxPositionUnit === 'fixed' ? '$' : ''}
              </span>
              <input
                type="number"
                value={settings.maxPositionLimit}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPositionLimit: parseInt(e.target.value) || 0 }))}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
              />
              <span className="text-neutral-400">
                {settings.maxPositionUnit === 'fixed' ? 'USDT' : '%'}
              </span>
            </div>
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingDown size={20} className="text-red-400" />
                每日止损
              </h3>
              <button
                onClick={() => setSettings(prev => ({ ...prev, dailyStopLossEnabled: !prev.dailyStopLossEnabled }))}
                className={`w-14 h-7 rounded-full transition-colors relative ${
                  settings.dailyStopLossEnabled ? 'bg-cyan-500' : 'bg-neutral-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                  settings.dailyStopLossEnabled ? 'left-8' : 'left-1'
                }`} />
              </button>
            </div>

            {settings.dailyStopLossEnabled && (
              <div>
                <p className="text-neutral-400 text-sm mb-2">当每日亏损达到此金额时，自动停止交易</p>
                <div className="flex items-center gap-4">
                  <span className="text-red-400 text-xl font-medium">$</span>
                  <input
                    type="number"
                    value={settings.dailyStopLoss}
                    onChange={(e) => setSettings(prev => ({ ...prev, dailyStopLoss: parseInt(e.target.value) || 0 }))}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500/50"
                  />
                  <span className="text-neutral-400">USDT</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity size={20} className="text-cyan-400" />
                单笔交易限制
              </h3>
              <button
                onClick={() => setSettings(prev => ({ ...prev, maxSingleTradeEnabled: !prev.maxSingleTradeEnabled }))}
                className={`w-14 h-7 rounded-full transition-colors relative ${
                  settings.maxSingleTradeEnabled ? 'bg-cyan-500' : 'bg-neutral-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                  settings.maxSingleTradeEnabled ? 'left-8' : 'left-1'
                }`} />
              </button>
            </div>

            {settings.maxSingleTradeEnabled && (
              <div>
                <p className="text-neutral-400 text-sm mb-2">限制单笔交易的最大金额</p>
                <div className="flex items-center gap-4">
                  <span className="text-cyan-400 text-xl font-medium">$</span>
                  <input
                    type="number"
                    value={settings.maxSingleTradeAmount}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxSingleTradeAmount: parseInt(e.target.value) || 0 }))}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                  <span className="text-neutral-400">USDT</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Percent size={20} className="text-purple-400" />
                杠杆限制
              </h3>
              <button
                onClick={() => setSettings(prev => ({ ...prev, leverageLimitEnabled: !prev.leverageLimitEnabled }))}
                className={`w-14 h-7 rounded-full transition-colors relative ${
                  settings.leverageLimitEnabled ? 'bg-cyan-500' : 'bg-neutral-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                  settings.leverageLimitEnabled ? 'left-8' : 'left-1'
                }`} />
              </button>
            </div>

            {settings.leverageLimitEnabled && (
              <div>
                <p className="text-neutral-400 text-sm mb-2">限制交易员使用的最大杠杆倍数</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="125"
                    value={settings.maxLeverage}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxLeverage: parseInt(e.target.value) }))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="text-cyan-400 font-bold text-xl w-16 text-right">{settings.maxLeverage}x</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                  <span>1x</span>
                  <span>50x</span>
                  <span>100x</span>
                  <span>125x</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-dark p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-orange-400" />
                自动停损
              </h3>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoStopLoss: !prev.autoStopLoss }))}
                className={`w-14 h-7 rounded-full transition-colors relative ${
                  settings.autoStopLoss ? 'bg-cyan-500' : 'bg-neutral-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                  settings.autoStopLoss ? 'left-8' : 'left-1'
                }`} />
              </button>
            </div>

            {settings.autoStopLoss && (
              <div>
                <p className="text-neutral-400 text-sm mb-2">当亏损达到设定百分比时自动平仓</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.autoStopLossPercent}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStopLossPercent: parseInt(e.target.value) }))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-orange-400 font-bold text-xl w-16 text-right">{settings.autoStopLossPercent}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-dark p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield size={20} className="text-green-400" />
              额外风控
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-neutral-400 text-sm mb-2">最大同时持仓数</label>
                <input
                  type="number"
                  value={settings.maxOpenPositions}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxOpenPositions: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-neutral-400 text-sm mb-2">每日最大交易次数</label>
                <input
                  type="number"
                  value={settings.maxDailyTrades}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxDailyTrades: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">连续亏损暂停</p>
                  <p className="text-neutral-400 text-sm">连续亏损超过设定次数时自动暂停跟单</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, pauseOnConsecutiveLosses: !prev.pauseOnConsecutiveLosses }))}
                  className={`w-14 h-7 rounded-full transition-colors relative ${
                    settings.pauseOnConsecutiveLosses ? 'bg-cyan-500' : 'bg-neutral-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                    settings.pauseOnConsecutiveLosses ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>

              {settings.pauseOnConsecutiveLosses && (
                <div className="mt-4">
                  <label className="block text-neutral-400 text-sm mb-2">连续亏损次数阈值</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.consecutiveLossesThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, consecutiveLossesThreshold: parseInt(e.target.value) || 3 }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-white/5 text-neutral-300 hover:bg-white/10 transition-colors"
            >
              重置默认
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-xl bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              保存风控设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
