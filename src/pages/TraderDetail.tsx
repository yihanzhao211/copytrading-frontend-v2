import { useState } from 'react';
import { 
  ArrowLeft, TrendingUp, Users, Star, Activity, 
  Target, Clock, Copy, CheckCircle,
  BarChart3, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CopyTradingModal from '../components/CopyTradingModal';

// 模拟交易员详细数据
const traderDetail = {
  id: 1,
  name: '陈明远',
  avatar: '陈',
  rank: 1,
  status: 'online',
  winRate: 87.5,
  totalReturn: 156.8,
  monthlyReturn: 12.3,
  weeklyReturn: 3.2,
  dailyReturn: 0.8,
  followers: 12580,
  totalTrades: 328,
  profitableTrades: 287,
  lossTrades: 41,
  avgProfit: 125.5,
  avgLoss: -45.2,
  profitFactor: 2.34,
  sharpeRatio: 1.87,
  maxDrawdown: 12.5,
  tradingSince: '2022-06-15',
  lastTrade: '2分钟前',
  bio: '专注BTC/ETH合约交易，擅长趋势跟踪策略。拥有5年加密货币交易经验，风控严格。',
  specialties: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
  riskLevel: '中等',
  tradingStyle: '趋势跟踪',
  timeFrame: '4H/1D',
};

// 历史业绩数据（用于图表）
const performanceData = [
  { month: '1月', return: 8.5, cumulative: 8.5 },
  { month: '2月', return: 12.3, cumulative: 21.8 },
  { month: '3月', return: -3.2, cumulative: 18.2 },
  { month: '4月', return: 15.7, cumulative: 36.2 },
  { month: '5月', return: 9.8, cumulative: 47.0 },
  { month: '6月', return: 11.2, cumulative: 59.4 },
  { month: '7月', return: 6.5, cumulative: 67.2 },
  { month: '8月', return: -2.1, cumulative: 64.8 },
  { month: '9月', return: 14.3, cumulative: 82.1 },
  { month: '10月', return: 18.9, cumulative: 105.5 },
  { month: '11月', return: 22.1, cumulative: 131.2 },
  { month: '12月', return: 12.3, cumulative: 156.8 },
];

// 当前持仓数据
const currentPositions = [
  { symbol: 'BTC/USDT', side: 'long', entryPrice: 43250, markPrice: 43890, size: 0.5, pnl: 320, pnlPercent: 1.48, leverage: 10 },
  { symbol: 'ETH/USDT', side: 'long', entryPrice: 2580, markPrice: 2615, size: 5, pnl: 175, pnlPercent: 1.36, leverage: 5 },
  { symbol: 'SOL/USDT', side: 'short', entryPrice: 98.5, markPrice: 96.2, size: 50, pnl: 115, pnlPercent: 2.33, leverage: 8 },
];

// 历史交易记录
const recentTrades = [
  { time: '2024-03-15 14:30', symbol: 'BTC/USDT', side: 'buy', entry: 42800, exit: 43200, size: 0.3, pnl: 120, status: 'closed' },
  { time: '2024-03-15 11:20', symbol: 'ETH/USDT', side: 'sell', entry: 2620, exit: 2580, size: 2, pnl: 80, status: 'closed' },
  { time: '2024-03-14 16:45', symbol: 'SOL/USDT', side: 'buy', entry: 95.2, exit: 98.5, size: 30, pnl: 99, status: 'closed' },
  { time: '2024-03-14 09:30', symbol: 'BTC/USDT', side: 'sell', entry: 43500, exit: 42800, size: 0.2, pnl: 140, status: 'closed' },
  { time: '2024-03-13 20:15', symbol: 'ETH/USDT', side: 'buy', entry: 2550, exit: 2620, size: 3, pnl: 210, status: 'closed' },
];

// 柱状图组件
function BarChart({ data }: { data: { month: string; return: number; cumulative: number }[] }) {
  const maxReturn = Math.max(...data.map(d => Math.abs(d.return)));
  
  return (
    <div className="flex items-end justify-between h-40 gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div 
            className={`w-full rounded-t transition-all duration-500 ${
              item.return >= 0 ? 'bg-cyan-500/60 hover:bg-cyan-400' : 'bg-red-500/60 hover:bg-red-400'
            }`}
            style={{ height: `${(Math.abs(item.return) / maxReturn) * 80}%` }}
          />
          <span className="text-xs text-neutral-500 mt-2">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function TraderDetail() {
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'history'>('overview');
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('1y');
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useAuth();

  const handleCopyTrade = () => {
    setIsCopyModalOpen(true);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const goBack = () => {
    window.location.hash = 'dashboard';
    window.location.reload();
  };

  // 计算统计数据
  const totalPositionValue = currentPositions.reduce((sum, pos) => sum + (pos.size * pos.markPrice), 0);
  const totalUnrealizedPnl = currentPositions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      {/* 导航栏 */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 交易员头部信息 */}
        <div className="card-dark p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-3xl">
                  {traderDetail.avatar}
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Star size={14} className="text-black" fill="black" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-black" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{traderDetail.name}</h1>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium border border-cyan-500/20">
                    排名 #{traderDetail.rank}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    在线
                  </span>
                </div>
                <p className="text-neutral-400 max-w-xl">{traderDetail.bio}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {traderDetail.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 rounded-lg bg-white/5 text-neutral-300 text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleFollow}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isFollowing 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {isFollowing ? <CheckCircle size={18} /> : <Users size={18} />}
                {isFollowing ? '已关注' : '关注'}
              </button>
              <button 
                onClick={handleCopyTrade}
                className="btn-primary flex items-center gap-2"
              >
                <Copy size={18} />
                跟单交易
              </button>
            </div>
          </div>

          {/* 关键数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8 pt-8 border-t border-white/5">
            <div>
              <p className="text-neutral-400 text-sm mb-1">总收益</p>
              <p className="text-2xl font-bold text-cyan-400">+{traderDetail.totalReturn}%</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">月收益</p>
              <p className="text-2xl font-bold text-cyan-400">+{traderDetail.monthlyReturn}%</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">胜率</p>
              <p className="text-2xl font-bold text-green-400">{traderDetail.winRate}%</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">跟随者</p>
              <p className="text-2xl font-bold text-white">{traderDetail.followers.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">总交易</p>
              <p className="text-2xl font-bold text-white">{traderDetail.totalTrades}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">盈利因子</p>
              <p className="text-2xl font-bold text-cyan-400">{traderDetail.profitFactor}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">夏普比率</p>
              <p className="text-2xl font-bold text-cyan-400">{traderDetail.sharpeRatio}</p>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">最大回撤</p>
              <p className="text-2xl font-bold text-red-400">-{traderDetail.maxDrawdown}%</p>
            </div>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl w-fit">
          {[
            { key: 'overview', label: '总览', icon: Activity },
            { key: 'positions', label: '当前持仓', icon: Target },
            { key: 'history', label: '历史交易', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key 
                  ? 'bg-cyan-500 text-black' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* 收益图表 */}
            <div className="card-dark p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-cyan-400" />
                  收益走势
                </h3>
                <div className="flex gap-2">
                  {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        timeRange === range 
                          ? 'bg-cyan-500 text-black' 
                          : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                      }`}
                    >
                      {range === '7d' ? '7天' : range === '30d' ? '30天' : range === '90d' ? '90天' : '1年'}
                    </button>
                  ))}
                </div>
              </div>
              <BarChart data={performanceData} />
              <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/5">
                <div className="text-center">
                  <p className="text-neutral-400 text-sm mb-1">最佳月份</p>
                  <p className="text-xl font-bold text-green-400">+22.1%</p>
                  <p className="text-xs text-neutral-500">2024年11月</p>
                </div>
                <div className="text-center">
                  <p className="text-neutral-400 text-sm mb-1">最差月份</p>
                  <p className="text-xl font-bold text-red-400">-3.2%</p>
                  <p className="text-xs text-neutral-500">2024年3月</p>
                </div>
                <div className="text-center">
                  <p className="text-neutral-400 text-sm mb-1">平均月收益</p>
                  <p className="text-xl font-bold text-cyan-400">+13.1%</p>
                  <p className="text-xs text-neutral-500">过去12个月</p>
                </div>
              </div>
            </div>

            {/* 交易统计 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 size={20} className="text-cyan-400" />
                  交易统计
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">盈利交易</span>
                    <span className="text-green-400 font-medium">{traderDetail.profitableTrades} 笔</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">亏损交易</span>
                    <span className="text-red-400 font-medium">{traderDetail.lossTrades} 笔</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">平均盈利</span>
                    <span className="text-green-400 font-medium">+${traderDetail.avgProfit}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">平均亏损</span>
                    <span className="text-red-400 font-medium">${traderDetail.avgLoss}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">交易风格</span>
                    <span className="text-white font-medium">{traderDetail.tradingStyle}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">时间周期</span>
                    <span className="text-white font-medium">{traderDetail.timeFrame}</span>
                  </div>
                </div>
              </div>

              <div className="card-dark p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-cyan-400" />
                  风险评估
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">风险等级</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium">
                      {traderDetail.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">最大回撤</span>
                    <span className="text-red-400 font-medium">-{traderDetail.maxDrawdown}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">夏普比率</span>
                    <span className="text-cyan-400 font-medium">{traderDetail.sharpeRatio}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">交易经验</span>
                    <span className="text-white font-medium">5年+</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">加入时间</span>
                    <span className="text-white font-medium">{traderDetail.tradingSince}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-neutral-400">最近交易</span>
                    <span className="text-white font-medium">{traderDetail.lastTrade}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'positions' && (
          <div className="card-dark overflow-hidden">
            {/* 持仓汇总 */}
            <div className="p-6 border-b border-white/5">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-neutral-400 text-sm mb-1">持仓总值</p>
                  <p className="text-2xl font-bold text-white">${totalPositionValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm mb-1">未实现盈亏</p>
                  <p className={`text-2xl font-bold ${totalUnrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm mb-1">活跃仓位</p>
                  <p className="text-2xl font-bold text-white">{currentPositions.length}</p>
                </div>
              </div>
            </div>

            {/* 持仓列表 */}
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">交易对</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">方向</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">杠杆</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">开仓价格</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">标记价格</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">数量</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">未实现盈亏</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentPositions.map((position, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{position.symbol}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                        position.side === 'long' 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {position.side === 'long' ? '做多' : '做空'}
                      </span>
                    </td>
                    <td className="p-4 text-white">{position.leverage}x</td>
                    <td className="p-4 text-neutral-400">${position.entryPrice.toLocaleString()}</td>
                    <td className="p-4 text-white">${position.markPrice.toLocaleString()}</td>
                    <td className="p-4 text-white">{position.size}</td>
                    <td className="p-4">
                      <div className={`font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
                        <span className="text-sm ml-1">({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}%)</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card-dark overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">时间</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">交易对</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">方向</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">开仓价格</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">平仓价格</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">数量</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">盈亏</th>
                  <th className="text-left text-neutral-400 text-sm font-medium p-4">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTrades.map((trade, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-neutral-400 text-sm">{trade.time}</td>
                    <td className="p-4 text-white font-medium">{trade.symbol}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                        trade.side === 'buy' 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {trade.side === 'buy' ? '买入' : '卖出'}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400">${trade.entry.toLocaleString()}</td>
                    <td className="p-4 text-neutral-400">${trade.exit.toLocaleString()}</td>
                    <td className="p-4 text-white">{trade.size}</td>
                    <td className="p-4">
                      <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-lg text-sm font-medium bg-neutral-500/10 text-neutral-400">
                        已平仓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 跟单弹窗 */}
        <CopyTradingModal
          isOpen={isCopyModalOpen}
          onClose={() => setIsCopyModalOpen(false)}
          trader={traderDetail}
        />
      </div>
    </div>
  );
}
