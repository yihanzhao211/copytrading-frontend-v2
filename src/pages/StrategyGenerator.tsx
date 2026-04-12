import { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Target, ShieldAlert, 
  DollarSign, Clock, Loader2, Activity, Lock, Zap, BarChart3, Layers, History, Activity as ActivityIcon, ArrowUp, ArrowDown, ScanSearch
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const SYMBOLS = [
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT',
  'DOGE/USDT', 'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'MATIC/USDT'
];

const TIMEFRAMES = [
  { key: '15m', label: '15分钟' },
  { key: '1h', label: '1小时' },
  { key: '4h', label: '4小时' },
  { key: '1d', label: '1天' },
];

const STRATEGY_NAMES: Record<string, string> = {
  triple_resonance: '三重共振',
  momentum: '动量策略',
  breakout: '突破策略',
  mean_reversion: '均值回归',
};

interface Signal {
  strategy: string;
  symbol: string;
  direction: 'long' | 'short' | string;
  confidence: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  rr_ratio: number;
  timeframe: string;
  layers?: any;
}

interface AnalysisItem {
  status: string;
  [key: string]: any;
}

interface StrategyData {
  symbol: string;
  timeframe: string;
  generated_at: string;
  remaining_points?: number;
  best_signal?: Signal | null;
  strategies: Record<string, Signal[]>;
  analysis: Record<string, AnalysisItem>;
}

interface BacktestStrategyStat {
  signals: number;
  win_rate: number;
  avg_pnl: number;
}

interface BacktestSummary {
  win_rate: number;
  profit_factor: number | null;
  avg_win: number;
  avg_loss: number;
  max_drawdown: number;
  sharpe_ratio: number;
  total_return: number;
}

interface BacktestBreakdown {
  wins: number;
  losses: number;
  timeouts: number;
  opens: number;
}

interface BacktestData {
  symbol: string;
  timeframe: string;
  days: number;
  total_signals: number;
  breakdown: BacktestBreakdown;
  strategies: Record<string, BacktestStrategyStat>;
  summary: BacktestSummary;
  remaining_points?: number;
}

interface WickLevel {
  price: number;
  distance_pct: number;
  probability: number;
  score: number;
  sample_count: number;
  avg_wick: number;
  max_wick: number;
}

interface WickAnalysisData {
  symbol: string;
  timeframe: string;
  current_price: number;
  rounding_step: number;
  upper_levels: WickLevel[];
  lower_levels: WickLevel[];
  stats: {
    total_candles: number;
    significant_upper_wicks: number;
    significant_lower_wicks: number;
    avg_upper_wick_pct: number;
    avg_lower_wick_pct: number;
  };
  remaining_points?: number;
}

interface MembershipInfo {
  is_member: boolean;
  daily_usage: Record<string, { used: number; limit: number; remaining: number }>;
}

export default function StrategyGenerator() {
  const { isAuthenticated, refreshUser, user, login } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StrategyData | null>(null);
  const [error, setError] = useState('');
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestData | null>(null);
  const [backtestError, setBacktestError] = useState('');
  const [wickLoading, setWickLoading] = useState(false);
  const [wickResult, setWickResult] = useState<WickAnalysisData | null>(null);
  const [wickError, setWickError] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState('');
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubStrategy, setNewSubStrategy] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.wallet.get().then((data) => {
        setMembership({
          is_member: data.is_member,
          daily_usage: data.daily_usage || {},
        });
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.strategy.generate(symbol, timeframe);
      setResult(res.data);
      if (user && res.data.remaining_points !== undefined) {
        login({ ...user, points: res.data.remaining_points });
      }
    } catch (e: any) {
      if (e.message?.includes('无效的认证令牌') || e.message?.includes('认证')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      } else {
        setError(e.message || '策略生成失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBacktest = async () => {
    setBacktestLoading(true);
    setBacktestError('');
    try {
      const res = await api.strategy.backtest(symbol, timeframe, 30);
      setBacktestResult(res.data);
      if (user && res.data.remaining_points !== undefined) {
        login({ ...user, points: res.data.remaining_points });
      }
    } catch (e: any) {
      if (e.message?.includes('无效的认证令牌') || e.message?.includes('认证')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      } else {
        setBacktestError(e.message || '回测运行失败，请稍后重试');
      }
    } finally {
      setBacktestLoading(false);
    }
  };

  const handleWickAnalysis = async () => {
    setWickLoading(true);
    setWickError('');
    try {
      const res = await api.strategy.wickAnalysis(symbol, timeframe);
      setWickResult(res.data);
      if (user && res.data.remaining_points !== undefined) {
        login({ ...user, points: res.data.remaining_points });
      }
    } catch (e: any) {
      if (e.message?.includes('无效的认证令牌') || e.message?.includes('认证')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      } else {
        setWickError(e.message || '针型探测分析失败，请稍后重试');
      }
    } finally {
      setWickLoading(false);
    }
  };

  const handleScan = async () => {
    setScanLoading(true);
    setScanError('');
    try {
      const res = await api.strategy.scan(timeframe);
      setScanResult(res.data);
      if (user && res.data.remaining_points !== undefined) {
        login({ ...user, points: res.data.remaining_points });
      }
      // 更新 membership 的 daily_usage
      setMembership(prev => prev ? {
        ...prev,
        daily_usage: {
          ...prev.daily_usage,
          strategy_generate: {
            ...(prev.daily_usage?.strategy_generate || { used: 0, limit: 1, remaining: 0 }),
            remaining: Math.max(0, (prev.daily_usage?.strategy_generate?.remaining || 0) - 1)
          }
        }
      } : prev);
    } catch (e: any) {
      if (e.message?.includes('无效的认证令牌') || e.message?.includes('认证')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      } else {
        setScanError(e.message || '批量扫描失败，请稍后重试');
      }
    } finally {
      setScanLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await api.subscription.list();
      setSubscriptions(res.subscriptions || []);
    } catch (e: any) {
      console.error('获取订阅失败', e);
    }
  };

  useEffect(() => {
    if (subscriptionModalOpen) {
      fetchSubscriptions();
      if (user?.email) setNewSubEmail(user.email);
    }
  }, [subscriptionModalOpen]);

  const handleAddSubscription = async () => {
    if (!newSubEmail) return;
    setSubLoading(true);
    try {
      await api.subscription.create({
        symbol,
        timeframe,
        strategy: newSubStrategy || undefined,
        email: newSubEmail,
      });
      await fetchSubscriptions();
    } catch (e: any) {
      alert(e.message || '订阅失败');
    } finally {
      setSubLoading(false);
    }
  };

  const handleToggleSubscription = async (id: number) => {
    try {
      await api.subscription.toggle(id);
      await fetchSubscriptions();
    } catch (e: any) {
      alert(e.message || '操作失败');
    }
  };

  const handleDeleteSubscription = async (id: number) => {
    try {
      await api.subscription.delete(id);
      await fetchSubscriptions();
    } catch (e: any) {
      alert(e.message || '取消失败');
    }
  };

  const getDirectionLabel = (dir?: string) => {
    if (dir === 'long') return { text: '做多', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
    if (dir === 'short') return { text: '做空', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
    return { text: '观望', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
  };

  const renderAnalysis = (name: string, a: AnalysisItem) => {
    if (!a) return null;
    if (name === 'momentum') {
      return (
        <div className="text-xs text-neutral-400 space-y-1">
          <div className="flex justify-between"><span>RSI</span><span className="text-white">{a.rsi}</span></div>
          <div className="flex justify-between"><span>MACD</span><span className="text-white">{a.macd_cross}</span></div>
          <div className="flex justify-between"><span>成交量比</span><span className="text-white">{a.volume_ratio}x</span></div>
          <div className="flex justify-between"><span>日线趋势</span><span className="text-white">{a.daily_trend === 'up' ? '上涨' : a.daily_trend === 'down' ? '下跌' : '震荡'}</span></div>
        </div>
      );
    }
    if (name === 'breakout') {
      return (
        <div className="text-xs text-neutral-400 space-y-1">
          <div className="flex justify-between"><span>当前价</span><span className="text-white">${a.current}</span></div>
          <div className="flex justify-between"><span>20期高点</span><span className="text-white">${a.recent_high}</span></div>
          <div className="flex justify-between"><span>20期低点</span><span className="text-white">${a.recent_low}</span></div>
          <div className="flex justify-between"><span>成交量比</span><span className="text-white">{a.volume_ratio}x</span></div>
        </div>
      );
    }
    if (name === 'mean_reversion') {
      return (
        <div className="text-xs text-neutral-400 space-y-1">
          <div className="flex justify-between"><span>布林带位置</span><span className="text-white">{a.bb_position_pct}%</span></div>
          <div className="flex justify-between"><span>上轨</span><span className="text-white">${a.bb_upper}</span></div>
          <div className="flex justify-between"><span>下轨</span><span className="text-white">${a.bb_lower}</span></div>
          <div className="flex justify-between"><span>市场状态</span><span className="text-white">{a.regime} (ADX {a.adx})</span></div>
        </div>
      );
    }
    if (name === 'triple_resonance') {
      return (
        <div className="text-xs text-neutral-400 space-y-1">
          <div className="flex justify-between"><span>趋势</span><span className="text-white">{a.trend === 'bullish' ? '看涨' : a.trend === 'bearish' ? '看跌' : '震荡'}</span></div>
          <div className="flex justify-between"><span>EMA20</span><span className="text-white">${a.ema20}</span></div>
          <div className="flex justify-between"><span>EMA50</span><span className="text-white">${a.ema50}</span></div>
          <div className="flex justify-between"><span>阻力/支撑</span><span className="text-white">${a.resistance} / ${a.support}</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 mb-4">
            <Brain className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI 策略分析</h1>
          <p className="text-neutral-400">集成4套实盘交易策略，智能筛选最优信号</p>
        </div>

        {!isAuthenticated && (
          <div className="glass rounded-2xl p-8 sm:p-12 border border-white/10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-4">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">登录后使用 AI 策略分析</h2>
            <p className="text-neutral-400 mb-6">注册并登录账户，即可使用4套实盘交易策略分析市场</p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
            >
              立即登录 / 注册
            </button>
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              onSuccess={() => {
                refreshUser();
                setAuthModalOpen(false);
              }}
            />
          </div>
        )}

        {isAuthenticated && (
          <>
            {/* 控制面板 */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="text-sm text-neutral-400">
                  {membership?.is_member ? (
                    <span className="text-green-400 font-semibold">会员尊享：功能无限次使用</span>
                  ) : (
                    <>
                      免费用户每日可生成 <span className="text-cyan-400 font-semibold">1 次</span>策略，
                      回测与针型探测为 <span className="text-cyan-400 font-semibold">会员专享</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!membership?.is_member && membership?.daily_usage?.strategy_generate && (
                    <div className="text-xs px-2 py-1 rounded-full bg-white/10 text-neutral-400">
                      今日剩余: {membership.daily_usage.strategy_generate.remaining} 次
                    </div>
                  )}
                  <button
                    onClick={() => setSubscriptionModalOpen(true)}
                    className="text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 font-medium transition-colors"
                  >
                    订阅管理
                  </button>
                  <div className="text-sm px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                    我的积分: {user?.points ?? 0}
                  </div>
                </div>
              </div>

              {/* 币种选择 */}
              <div className="mb-6">
                <label className="block text-sm text-neutral-400 mb-3 flex items-center gap-2">
                  <Activity size={16} className="text-cyan-400" />
                  选择币种
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SYMBOLS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSymbol(s)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        symbol === s
                          ? 'bg-cyan-500 text-black'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      {s.split('/')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 时间周期 */}
              <div className="mb-8">
                <label className="block text-sm text-neutral-400 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-cyan-400" />
                  时间周期
                </label>
                <div className="flex gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf.key}
                      onClick={() => setTimeframe(tf.key)}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        timeframe === tf.key
                          ? 'bg-cyan-500 text-black'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 生成按钮 */}
              <button
                onClick={handleGenerate}
                disabled={loading || (!membership?.is_member && (membership?.daily_usage?.strategy_generate?.remaining ?? 0) <= 0) || (user?.points ?? 0) < (membership?.is_member ? 0 : 10)}
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 disabled:cursor-not-allowed text-black font-semibold text-base transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    分析中...
                  </>
                ) : membership?.is_member ? (
                  <>
                    <Brain className="w-5 h-5" />
                    生成策略（会员免费）
                  </>
                ) : (membership?.daily_usage?.strategy_generate?.remaining ?? 0) <= 0 ? (
                  <>
                    <Lock className="w-5 h-5" />
                    今日次数已用完，开通会员解锁
                  </>
                ) : (user?.points ?? 0) < 10 ? (
                  <>
                    <DollarSign className="w-5 h-5" />
                    积分不足（需 10 积分）
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    生成策略（-10 积分）
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>

            {/* 结果展示 */}
            {result && (
              <div className="space-y-6">
                {/* 最佳信号 */}
                {result.best_signal ? (
                  <div className={`glass rounded-2xl p-6 border ${getDirectionLabel(result.best_signal.direction).color}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-6 h-6" />
                      <h2 className="text-xl font-bold">最优信号 — {STRATEGY_NAMES[result.best_signal.strategy] || result.best_signal.strategy}</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-neutral-400 mb-1">方向</div>
                        <div className="text-lg font-semibold">{getDirectionLabel(result.best_signal.direction).text}</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-400 mb-1">置信度</div>
                        <div className="text-lg font-semibold">{(result.best_signal.confidence * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-400 mb-1">盈亏比</div>
                        <div className="text-lg font-semibold">{result.best_signal.rr_ratio?.toFixed(2) || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-400 mb-1">建议入场</div>
                        <div className="text-lg font-semibold">${result.best_signal.entry_price}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-black/20 rounded-xl p-3">
                        <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1"><Target size={12}/> 建议入场</div>
                        <div className="text-xl font-bold">${result.best_signal.entry_price}</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3">
                        <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1"><ShieldAlert size={12}/> 止损位</div>
                        <div className="text-xl font-bold text-red-400">${result.best_signal.stop_loss}</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-3">
                        <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1"><TrendingUp size={12}/> 止盈位</div>
                        <div className="text-xl font-bold text-green-400">${result.best_signal.take_profit}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-8 border border-white/10 text-center">
                    <BarChart3 className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">当前市场暂无明确交易信号</h3>
                    <p className="text-neutral-400 text-sm mb-2">4套策略均未触发入场条件，建议观望</p>
                    <p className="text-neutral-500 text-xs">下方卡片显示了各策略的实时分析指标</p>
                  </div>
                )}

                {/* 4套策略详情 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.strategies || {}).map(([name, signals]) => {
                    const dirInfo = getDirectionLabel(signals[0]?.direction);
                    const analysis = result.analysis?.[name];
                    return (
                      <div key={name} className="glass rounded-xl p-5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <h4 className="font-semibold text-white">{STRATEGY_NAMES[name] || name}</h4>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${signals.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-neutral-400'}`}>
                            {signals.length > 0 ? `${signals.length} 个信号` : analysis?.status || '观望'}
                          </span>
                        </div>
                        {signals.length === 0 ? (
                          <div className="mt-2">
                            {analysis ? renderAnalysis(name, analysis) : <p className="text-sm text-neutral-500">当前暂无信号 — 条件未满足</p>}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {signals.map((s, i) => (
                              <div key={i} className={`text-sm p-3 rounded-lg border ${dirInfo.color}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{dirInfo.text}</span>
                                  <span className="text-xs opacity-80">置信度 {(s.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="text-xs opacity-80 grid grid-cols-3 gap-2 mt-2">
                                  <div>入场 <span className="text-white">${s.entry_price}</span></div>
                                  <div>止损 <span className="text-white">${s.stop_loss}</span></div>
                                  <div>止盈 <span className="text-white">${s.take_profit}</span></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 历史回测 */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <History className="w-6 h-6 text-cyan-400" />
                      <h2 className="text-xl font-bold text-white">近30天历史回测</h2>
                    </div>
                    <button
                      onClick={handleBacktest}
                      disabled={backtestLoading || !membership?.is_member || (user?.points ?? 0) < (membership?.is_member ? 0 : 10)}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors flex items-center gap-2"
                    >
                      {backtestLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> 回测中...</>
                      ) : membership?.is_member ? (
                        <><History className="w-4 h-4" /> 运行回测（会员免费）</>
                      ) : (
                        <><Lock className="w-4 h-4" /> 会员专享</>
                      )}
                    </button>
                  </div>

                  {backtestError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {backtestError}
                    </div>
                  )}

                  {backtestResult ? (
                    <div className="space-y-6">
                      {/* 总览统计 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">{backtestResult.total_signals}</div>
                          <div className="text-xs text-neutral-400 mt-1">总信号数</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className={`text-2xl font-bold ${backtestResult.summary.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                            {backtestResult.summary.win_rate}%
                          </div>
                          <div className="text-xs text-neutral-400 mt-1">胜率</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-cyan-400">
                            {backtestResult.summary.profit_factor ?? '—'}
                          </div>
                          <div className="text-xs text-neutral-400 mt-1">盈亏比</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <div className={`text-2xl font-bold ${backtestResult.summary.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {backtestResult.summary.total_return > 0 ? '+' : ''}{backtestResult.summary.total_return}%
                          </div>
                          <div className="text-xs text-neutral-400 mt-1">累计收益</div>
                        </div>
                      </div>

                      {/* 胜负分布 */}
                      <div>
                        <h3 className="text-sm font-medium text-neutral-300 mb-2">交易结果分布</h3>
                        <div className="flex h-4 rounded-full overflow-hidden bg-white/5">
                          {backtestResult.total_signals > 0 && (
                            <>
                              <div
                                className="bg-green-500"
                                style={{ width: `${(backtestResult.breakdown.wins / backtestResult.total_signals) * 100}%` }}
                              />
                              <div
                                className="bg-red-500"
                                style={{ width: `${(backtestResult.breakdown.losses / backtestResult.total_signals) * 100}%` }}
                              />
                              <div
                                className="bg-yellow-500"
                                style={{ width: `${(backtestResult.breakdown.timeouts / backtestResult.total_signals) * 100}%` }}
                              />
                            </>
                          )}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span className="text-neutral-400">盈利 <span className="text-white">{backtestResult.breakdown.wins}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-neutral-400">亏损 <span className="text-white">{backtestResult.breakdown.losses}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                            <span className="text-neutral-400">超时/持仓 <span className="text-white">{backtestResult.breakdown.timeouts + backtestResult.breakdown.opens}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* 详细指标 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-xs text-neutral-400">平均盈利</div>
                          <div className="text-lg font-semibold text-green-400">+{backtestResult.summary.avg_win}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-xs text-neutral-400">平均亏损</div>
                          <div className="text-lg font-semibold text-red-400">{backtestResult.summary.avg_loss}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-xs text-neutral-400">最大回撤</div>
                          <div className="text-lg font-semibold text-red-400">-{backtestResult.summary.max_drawdown}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <div className="text-xs text-neutral-400">夏普比率</div>
                          <div className="text-lg font-semibold text-white">{backtestResult.summary.sharpe_ratio}</div>
                        </div>
                      </div>

                      {/* 各策略统计 */}
                      <div>
                        <h3 className="text-sm font-medium text-neutral-300 mb-3">各策略表现</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(backtestResult.strategies).map(([name, stat]) => (
                            <div key={name} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-white">{STRATEGY_NAMES[name] || name}</div>
                                <div className="text-xs text-neutral-400">{stat.signals} 个信号</div>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-semibold ${stat.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                  {stat.win_rate}%
                                </div>
                                <div className="text-xs text-neutral-400">胜率</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-neutral-500">
                      <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      {!membership?.is_member ? (
                        <>
                          <p>历史回测为会员专享功能</p>
                          <p className="text-xs mt-1 opacity-70">开通会员后可无限次运行策略回测与针型探测</p>
                        </>
                      ) : (
                        <>
                          <p>点击上方按钮，运行近 30 天历史回测</p>
                          <p className="text-xs mt-1 opacity-70">基于真实 OHLCV 数据，模拟 4 套策略的历史表现</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 插针分析 */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ActivityIcon className="w-6 h-6 text-cyan-400" />
                      <h2 className="text-xl font-bold text-white">针型探测</h2>
                    </div>
                    <button
                      onClick={handleWickAnalysis}
                      disabled={wickLoading || !membership?.is_member || (user?.points ?? 0) < (membership?.is_member ? 0 : 10)}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors flex items-center gap-2"
                    >
                      {wickLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> 分析中...</>
                      ) : membership?.is_member ? (
                        <><ActivityIcon className="w-4 h-4" /> 运行分析（会员免费）</>
                      ) : (
                        <><Lock className="w-4 h-4" /> 会员专享</>
                      )}
                    </button>
                  </div>

                  {wickError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {wickError}
                    </div>
                  )}

                  {wickResult ? (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <div className="text-sm text-neutral-400">当前价格</div>
                          <div className="text-2xl font-bold text-white">${wickResult.current_price}</div>
                        </div>
                        <div className="text-right text-xs text-neutral-500">
                          <div>分析K线数: {wickResult.stats.total_candles}</div>
                          <div>上插针: {wickResult.stats.significant_upper_wicks} 次</div>
                          <div>下插针: {wickResult.stats.significant_lower_wicks} 次</div>
                        </div>
                      </div>

                      {/* 上方插针价位 */}
                      <div>
                        <h3 className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2">
                          <ArrowUp className="w-4 h-4 text-green-400" />
                          上方潜在插针价位
                        </h3>
                        {wickResult.upper_levels.length === 0 ? (
                          <p className="text-sm text-neutral-500">暂无显著上方插针阻力位</p>
                        ) : (
                          <div className="space-y-2">
                            {wickResult.upper_levels.map((lvl, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                                <div>
                                  <div className="text-base font-semibold text-white">${lvl.price}</div>
                                  <div className="text-xs text-neutral-400">+{lvl.distance_pct}% · 样本 {lvl.sample_count} 次</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-cyan-400">{lvl.score}分</div>
                                  <div className="text-xs text-neutral-400">概率 {lvl.probability}%</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 下方插针价位 */}
                      <div>
                        <h3 className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2">
                          <ArrowDown className="w-4 h-4 text-red-400" />
                          下方潜在插针价位
                        </h3>
                        {wickResult.lower_levels.length === 0 ? (
                          <p className="text-sm text-neutral-500">暂无显著下方插针支撑位</p>
                        ) : (
                          <div className="space-y-2">
                            {wickResult.lower_levels.map((lvl, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                                <div>
                                  <div className="text-base font-semibold text-white">${lvl.price}</div>
                                  <div className="text-xs text-neutral-400">-{lvl.distance_pct}% · 样本 {lvl.sample_count} 次</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-cyan-400">{lvl.score}分</div>
                                  <div className="text-xs text-neutral-400">概率 {lvl.probability}%</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-neutral-500">
                      <ActivityIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      {!membership?.is_member ? (
                        <>
                          <p>针型探测为会员专享功能</p>
                          <p className="text-xs mt-1 opacity-70">开通会员后可无限次运行针型探测分析</p>
                        </>
                      ) : (
                        <>
                          <p>点击上方按钮，运行针型探测分析</p>
                          <p className="text-xs mt-1 opacity-70">基于近 1000 根 K 线数据，识别上下方潜在针型价位与概率</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 批量扫描 */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ScanSearch className="w-6 h-6 text-cyan-400" />
                      <h2 className="text-xl font-bold text-white">批量扫描</h2>
                    </div>
                    <button
                      onClick={handleScan}
                      disabled={scanLoading || (!membership?.is_member && (membership?.daily_usage?.strategy_generate?.remaining ?? 0) <= 0) || (user?.points ?? 0) < (membership?.is_member ? 0 : 10)}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors flex items-center gap-2"
                    >
                      {scanLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> 扫描中...</>
                      ) : membership?.is_member ? (
                        <><ScanSearch className="w-4 h-4" /> 一键扫描（会员免费）</>
                      ) : (membership?.daily_usage?.strategy_generate?.remaining ?? 0) <= 0 ? (
                        <><Lock className="w-4 h-4" /> 今日次数已用完</>
                      ) : (user?.points ?? 0) < 10 ? (
                        <><DollarSign className="w-4 h-4" /> 积分不足</>
                      ) : (
                        <><ScanSearch className="w-4 h-4" /> 一键扫描（-10积分）</>
                      )}
                    </button>
                  </div>

                  {scanError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {scanError}
                    </div>
                  )}

                  {scanResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-neutral-400">
                        <span>扫描币种: {scanResult.scanned_count} 个</span>
                        <span>周期: {scanResult.timeframe}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {scanResult.results.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSymbol(item.symbol);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                              item.has_signal
                                ? 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-white">{item.symbol}</div>
                              {item.has_signal ? (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                                  有信号
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-400">
                                  观望
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-neutral-300">{item.summary}</div>
                            {item.best_signal && (
                              <div className="mt-2 text-xs text-neutral-500">
                                策略: {STRATEGY_NAMES[item.best_signal.strategy] || item.best_signal.strategy}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-neutral-500">
                      <ScanSearch className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>点击上方按钮，一键扫描市场机会</p>
                      <p className="text-xs mt-1 opacity-70">自动分析 Top 20 币种，按信号强度排序</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 订阅管理 Modal */}
      {subscriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-white/10 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ScanSearch className="w-5 h-5 text-cyan-400" />
                信号订阅管理
              </h3>
              <button
                onClick={() => setSubscriptionModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-neutral-300 mb-3">我的订阅</h4>
              {subscriptions.length === 0 ? (
                <p className="text-sm text-neutral-500">暂无订阅，请在下方添加</p>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="font-medium text-white text-sm">{sub.symbol} · {sub.timeframe}</div>
                        <div className="text-xs text-neutral-400">
                          {sub.strategy ? STRATEGY_NAMES[sub.strategy] || sub.strategy : '所有策略'} · {sub.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSubscription(sub.id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${sub.is_active ? 'bg-green-500/20 text-green-400' : 'bg-neutral-700 text-neutral-400'}`}
                        >
                          {sub.is_active ? '已启用' : '已暂停'}
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium text-neutral-300 mb-3">添加新订阅</h4>
              <div className="space-y-3">
                <div className="text-sm text-neutral-400">
                  币种: <span className="text-white font-medium">{symbol}</span> · 周期: <span className="text-white font-medium">{timeframe}</span>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">策略类型</label>
                  <select
                    value={newSubStrategy}
                    onChange={(e) => setNewSubStrategy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">所有策略</option>
                    <option value="triple_resonance">三重共振</option>
                    <option value="momentum">动量策略</option>
                    <option value="breakout">突破策略</option>
                    <option value="mean_reversion">均值回归</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">接收邮箱</label>
                  <input
                    type="email"
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={handleAddSubscription}
                  disabled={subLoading || !newSubEmail}
                  className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/30 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
                >
                  {subLoading ? '添加中...' : '添加订阅'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
