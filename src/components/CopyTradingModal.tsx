import { useState } from 'react';
import { X, TrendingUp, AlertCircle, DollarSign, Percent } from 'lucide-react';
import { api } from '../lib/api';

interface CopyTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trader: {
    id: number;
    name: string;
    monthlyReturn: number;
    totalReturn: number;
    winRate: number;
    followers: number;
  } | null;
}

export default function CopyTradingModal({ isOpen, onClose, trader }: CopyTradingModalProps) {
  const [copyMode, setCopyMode] = useState<'fixed' | 'ratio'>('ratio');
  const [copyRatio, setCopyRatio] = useState(1);
  const [fixedAmount, setFixedAmount] = useState(100);
  const [maxPosition, setMaxPosition] = useState(1000);
  const [stopLoss, setStopLoss] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  if (!isOpen || !trader) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResultMsg(null);
    
    try {
      const payload = {
        trader_id: trader.id,
        copy_mode: copyMode === 'ratio' ? 'ratio' : 'fixed',
        copy_ratio: copyMode === 'ratio' ? copyRatio : 1.0,
        fixed_amount: copyMode === 'fixed' ? fixedAmount : null,
        max_position_amount: maxPosition,
        stop_loss_percent: stopLoss,
      };
      
      await api.follow.create(payload);
      
      setResultMsg({
        type: 'success',
        text: `跟单设置成功！已跟随 ${trader.name}`
      });
      
      setTimeout(() => {
        onClose();
        setResultMsg(null);
      }, 1500);
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: err.message || '跟单设置失败，请重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-gray-900 rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-semibold text-white">跟单设置</h3>
            <p className="text-neutral-400 text-sm mt-1">跟随 {trader.name} 的交易</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 交易员信息 */}
        <div className="p-6 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-lg">
              {trader.name[0]}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">{trader.name}</h4>
              <div className="flex gap-4 text-sm mt-1">
                <span className="text-cyan-400">+{trader.monthlyReturn}% 月收益</span>
                <span className="text-neutral-500">|</span>
                <span className="text-green-400">{trader.winRate}% 胜率</span>
              </div>
            </div>
          </div>
        </div>

        {/* 设置表单 */}
        <div className="p-6 space-y-6">
          {/* 跟单模式 */}
          <div>
            <label className="block text-sm text-neutral-400 mb-3">跟单模式</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCopyMode('ratio')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  copyMode === 'ratio' 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Percent size={20} className={copyMode === 'ratio' ? 'text-cyan-400' : 'text-neutral-400'} />
                <p className={`mt-2 font-medium ${copyMode === 'ratio' ? 'text-white' : 'text-neutral-300'}`}>固定比例</p>
                <p className="text-xs text-neutral-500 mt-1">按交易员金额的比例跟单</p>
              </button>
              <button
                onClick={() => setCopyMode('fixed')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  copyMode === 'fixed' 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <DollarSign size={20} className={copyMode === 'fixed' ? 'text-cyan-400' : 'text-neutral-400'} />
                <p className={`mt-2 font-medium ${copyMode === 'fixed' ? 'text-white' : 'text-neutral-300'}`}>固定金额</p>
                <p className="text-xs text-neutral-500 mt-1">每笔固定金额跟单</p>
              </button>
            </div>
          </div>

          {/* 跟单比例/金额 */}
          {copyMode === 'ratio' ? (
            <div>
              <label className="block text-sm text-neutral-400 mb-3">
                跟单比例 <span className="text-cyan-400 font-medium ml-2">{(copyRatio * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={copyRatio}
                onChange={(e) => setCopyRatio(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-2">
                <span>10%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-neutral-400 mb-3">固定金额 (USDT)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 最大持仓 */}
          <div>
            <label className="block text-sm text-neutral-400 mb-3">最大持仓金额 (USDT)</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="number"
                min="100"
                max="100000"
                value={maxPosition}
                onChange={(e) => setMaxPosition(parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">达到此金额后将停止跟新开仓</p>
          </div>

          {/* 止损设置 */}
          <div>
            <label className="block text-sm text-neutral-400 mb-3">止损比例 (%)</label>
            <div className="flex gap-2">
              {[3, 5, 10, 15, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => setStopLoss(val)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    stopLoss === val 
                      ? 'bg-cyan-500 text-black' 
                      : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* 风险提示 */}
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200/80">
              跟单交易存在风险。过往业绩不代表未来表现。请根据自身风险承受能力合理设置参数。
            </p>
          </div>
        </div>

        {/* 操作结果提示 */}
        {resultMsg && (
          <div className={`flex items-start gap-3 p-4 border rounded-xl ${
            resultMsg.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <AlertCircle size={18} className={`flex-shrink-0 mt-0.5 ${
              resultMsg.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`} />
            <p className={`text-sm ${
              resultMsg.type === 'success' ? 'text-green-200/80' : 'text-red-200/80'
            }`}>
              {resultMsg.text}
            </p>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-medium text-neutral-300 bg-white/5 hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl font-medium text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <TrendingUp size={18} />
                确认跟单
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
