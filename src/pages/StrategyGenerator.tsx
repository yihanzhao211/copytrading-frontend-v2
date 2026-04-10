import { useState } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, Minus, Target, ShieldAlert, 
  DollarSign, Clock, Loader2, Activity
} from 'lucide-react';
import { api } from '../lib/api';

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

interface StrategyResult {
  symbol: string;
  timeframe: string;
  current_price: number;
  trend: string;
  trend_score: number;
  rsi: number;
  ma7: number;
  ma25: number;
  support: number;
  resistance: number;
  volatility_24h: number;
  suggestion: string;
  entry: number;
  stop_loss: number;
  take_profit: number;
  risk_level: string;
  generated_at: string;
}

export default function StrategyGenerator() {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StrategyResult | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.strategy.generate(symbol, timeframe);
      setResult(res.data);
    } catch (e: any) {
      setError(e.message || '策略生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes('涨') || trend.includes('多')) return <TrendingUp className="w-6 h-6" />;
    if (trend.includes('跌') || trend.includes('空')) return <TrendingDown className="w-6 h-6" />;
    return <Minus className="w-6 h-6" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend.includes('涨') || trend.includes('多')) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (trend.includes('跌') || trend.includes('空')) return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  };

  const getRiskColor = (risk: string) => {
    if (risk === '低') return 'text-green-400 bg-green-400/10';
    if (risk === '中等') return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 mb-4">
            <Brain className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI 策略分析</h1>
          <p className="text-neutral-400">选择币种和时间周期，一键生成交易策略</p>
        </div>

        {/* 控制面板 */}
        <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 mb-8">
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
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-black font-semibold text-base transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                生成策略
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
            {/* 趋势卡片 */}
            <div className={`glass rounded-2xl p-6 border ${getTrendColor(result.trend)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-black/30 flex items-center justify-center">
                    {getTrendIcon(result.trend)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{result.trend}</p>
                    <p className="text-sm opacity-80">趋势判断</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{result.trend_score}</p>
                  <p className="text-sm opacity-80">信心指数</p>
                </div>
              </div>
            </div>

            {/* 关键指标 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4 border border-white/10 text-center">
                <p className="text-xs text-neutral-400 mb-1">当前价格</p>
                <p className="text-lg font-semibold text-white">${result.current_price.toLocaleString()}</p>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10 text-center">
                <p className="text-xs text-neutral-400 mb-1">RSI</p>
                <p className={`text-lg font-semibold ${result.rsi > 70 ? 'text-red-400' : result.rsi < 30 ? 'text-green-400' : 'text-white'}`}>
                  {result.rsi}
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10 text-center">
                <p className="text-xs text-neutral-400 mb-1">MA7</p>
                <p className="text-lg font-semibold text-white">${result.ma7.toLocaleString()}</p>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10 text-center">
                <p className="text-xs text-neutral-400 mb-1">MA25</p>
                <p className="text-lg font-semibold text-white">${result.ma25.toLocaleString()}</p>
              </div>
            </div>

            {/* 支撑阻力 */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target size={18} className="text-cyan-400" />
                关键价位
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 mb-1">支撑位</p>
                  <p className="text-xl font-bold text-white">${result.support.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 mb-1">阻力位</p>
                  <p className="text-xl font-bold text-white">${result.resistance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* 策略建议 */}
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Brain size={18} className="text-cyan-400" />
                策略建议
              </h3>
              <p className="text-neutral-300 leading-relaxed mb-6">{result.suggestion}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-xs text-cyan-400 mb-1 flex items-center justify-center gap-1">
                    <DollarSign size={12} /> 建议入场
                  </p>
                  <p className="text-lg font-bold text-white">${result.entry.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 mb-1">止损位</p>
                  <p className="text-lg font-bold text-white">${result.stop_loss.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 mb-1">止盈位</p>
                  <p className="text-lg font-bold text-white">${result.take_profit.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* 风险等级 */}
            <div className="flex items-center justify-between glass rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-300">风险等级</span>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getRiskColor(result.risk_level)}`}>
                {result.risk_level}
              </span>
            </div>

            {/* 生成时间 */}
            <p className="text-center text-xs text-neutral-500">
              生成时间: {new Date(result.generated_at).toLocaleString('zh-CN')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
