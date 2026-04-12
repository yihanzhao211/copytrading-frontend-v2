import { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, Users, Activity, 
  Settings, Pause, Play, X,
  Clock, ArrowLeft, LogOut, Key,
  Loader2, RefreshCw, Zap,
  Crown, Gift, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MarketTicker from '../components/MarketTicker';
import BindApiModal from '../components/BindApiModal';
import { api, apiRequest } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// API Response Types
interface Trader {
  id: number;
  name: string;
  avatar?: string;
}

interface FollowRelation {
  id: number;
  trader: Trader;
  copy_mode: 'fixed' | 'ratio';
  copy_ratio: number;
  fixed_amount: number;
  total_invested: number;
  current_profit: number;
  profit_percent: number;
  active_positions: number;
  is_active: boolean;
  last_trade: string;
  created_at: string;
}

interface Order {
  id: number;
  trader_name: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: string;
  pnl: number;
  created_at: string;
}

// UI Types
interface FollowingTrader {
  id: number;
  name: string;
  avatar: string;
  copyMode: 'fixed' | 'ratio';
  copyRatio: number;
  fixedAmount: number;
  totalInvested: number;
  currentProfit: number;
  profitPercent: number;
  activePositions: number;
  isActive: boolean;
  lastTrade: string;
}

interface TradeHistory {
  time: string;
  trader: string;
  pair: string;
  side: 'buy' | 'sell';
  amount: string;
  pnl: number;
}

// Transform API data to UI format
function transformFollowRelation(relation: FollowRelation): FollowingTrader {
  return {
    id: relation.id,
    name: relation.trader.name,
    avatar: relation.trader.avatar || relation.trader.name[0],
    copyMode: relation.copy_mode,
    copyRatio: relation.copy_ratio,
    fixedAmount: relation.fixed_amount,
    totalInvested: relation.total_invested,
    currentProfit: relation.current_profit,
    profitPercent: relation.profit_percent,
    activePositions: relation.active_positions,
    isActive: relation.is_active,
    lastTrade: relation.last_trade,
  };
}

function transformOrder(order: Order): TradeHistory {
  return {
    time: new Date(order.created_at).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    trader: order.trader_name,
    pair: order.symbol,
    side: order.side,
    amount: order.amount,
    pnl: order.pnl,
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'following' | 'history'>('overview');
  const [followingList, setFollowingList] = useState<FollowingTrader[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [profitData, setProfitData] = useState<{date: string; value: number}[]>([]);
  const [profitLoading, setProfitLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBindApi, setShowBindApi] = useState(false);
  const [engineStatus, setEngineStatus] = useState<{engine_running: boolean; active_traders: number; active_follows: number; total_copy_trades: number} | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [membershipExpiresAt, setMembershipExpiresAt] = useState<string | null>(null);
  const { user, logout } = useAuth();

  // Fetch following list
  useEffect(() => {
    async function fetchFollowing() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.follow.list();
        const transformed = (data || []).map(transformFollowRelation);
        setFollowingList(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取跟单列表失败');
        console.error('Failed to fetch following:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFollowing();
  }, []);

  // Fetch profit chart data
  useEffect(() => {
    async function fetchProfitData() {
      try {
        setProfitLoading(true);
        const data = await apiRequest('/traders/1/history?days=30');
        if (data && Array.isArray(data.history)) {
          setProfitData(data.history.map((item: any) => ({
            date: item.date.slice(5),
            value: item.value
          })));
        }
      } catch (err) {
        console.error('Failed to fetch profit data:', err);
      } finally {
        setProfitLoading(false);
      }
    }

    fetchProfitData();
  }, []);

  // Fetch copy engine status
  useEffect(() => {
    async function fetchEngineStatus() {
      try {
        const data = await api.copyEngine.status();
        setEngineStatus(data);
      } catch (err) {
        console.error('Failed to fetch engine status:', err);
      }
    }

    fetchEngineStatus();
    const interval = setInterval(fetchEngineStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch membership status
  useEffect(() => {
    async function fetchMembership() {
      try {
        const data = await api.wallet.get();
        setIsMember(data.is_member);
        setMembershipExpiresAt(data.membership_expires_at);
      } catch (err) {
        console.error('Failed to fetch membership:', err);
      }
    }

    fetchMembership();
  }, []);

  // Fetch trade history when history tab is active
  useEffect(() => {
    if (activeTab !== 'history') return;

    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.orders.list();
        const transformed = (data || []).map(transformOrder);
        setTradeHistory(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取交易历史失败');
        console.error('Failed to fetch trade history:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [activeTab]);

  const toggleTrader = async (id: number) => {
    const trader = followingList.find(t => t.id === id);
    if (!trader) return;
    
    try {
      if (trader.isActive) {
        await api.follow.pause(id);
      } else {
        await api.follow.resume(id);
      }
      setFollowingList(prev => prev.map(t => 
        t.id === id ? { ...t, isActive: !t.isActive } : t
      ));
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const removeTrader = async (id: number) => {
    if (!confirm('确定要停止跟单这位交易员吗？已开仓位将保持。')) return;
    
    try {
      await api.follow.delete(id);
      setFollowingList(prev => prev.filter(trader => trader.id !== id));
    } catch (err: any) {
      alert(err.message || '取消跟单失败');
    }
  };

  const totalInvested = followingList.reduce((sum, t) => sum + t.totalInvested, 0);
  const totalProfit = followingList.reduce((sum, t) => sum + t.currentProfit, 0);
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const handleRetry = () => {
    if (activeTab === 'history') {
      setActiveTab('overview');
      setTimeout(() => setActiveTab('history'), 0);
    } else {
      window.location.reload();
    }
  };

  const handleManualSync = async (traderId?: number) => {
    try {
      setSyncing(true);
      setSyncResult(null);
      if (traderId) {
        await api.copyEngine.syncTrader(traderId);
        setSyncResult(`交易员 #${traderId} 同步完成`);
      } else {
        await api.copyEngine.syncAll();
        setSyncResult('全部交易员同步完成');
      }
      // 刷新引擎状态
      const status = await api.copyEngine.status();
      setEngineStatus(status);
    } catch (err: any) {
      setSyncResult(err.message || '同步失败');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => { window.location.hash = ''; window.location.reload(); }}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              返回首页
            </button>
            <div className="flex items-center gap-4">
              <a
                href="#invite"
                className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Gift size={16} />
                邀请返利
              </a>
              {user?.role === 'admin' && (
                <a
                  href="#admin/recharges"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <ShieldCheck size={16} />
                  充值审核
                </a>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="text-white font-medium hidden sm:block">{user?.name || '用户'}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="退出登录"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">我的仪表盘</h1>
          <p className="text-neutral-400 mt-2">管理您的跟单交易和投资组合</p>
        </div>

        {/* 实时行情 */}
        <div className="mb-8">
          <MarketTicker />
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl w-fit">
          {[
            { key: 'overview', label: '总览', icon: Activity },
            { key: 'following', label: '我的跟单', icon: Users },
            { key: 'history', label: '交易历史', icon: Clock },
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

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 font-medium">加载失败</p>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="ml-3 text-neutral-400">加载中...</span>
          </div>
        )}

        {activeTab === 'overview' && !loading && (
          <>
            {/* 资产总览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Wallet size={20} className="text-cyan-400" />
                  </div>
                  <span className="text-neutral-400">总资产</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${(totalInvested + totalProfit).toLocaleString()}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  本金: ${totalInvested.toLocaleString()}
                </p>
              </div>

              <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMember ? 'bg-yellow-500/10' : 'bg-white/10'}`}>
                    <Crown size={20} className={isMember ? 'text-yellow-400' : 'text-neutral-400'} />
                  </div>
                  <span className="text-neutral-400">会员状态</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {isMember === null ? '-' : isMember ? '已开通' : '未开通'}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  {membershipExpiresAt ? `到期: ${new Date(membershipExpiresAt).toLocaleDateString('zh-CN')}` : '开通会员解锁全部功能'}
                </p>
              </div>

              <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp size={20} className="text-green-400" />
                  </div>
                  <span className="text-neutral-400">累计收益</span>
                </div>
                <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
                </p>
                <p className={`text-sm mt-1 ${totalProfitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
                </p>
              </div>

              <div className="card-dark p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Users size={20} className="text-purple-400" />
                  </div>
                  <span className="text-neutral-400">跟随交易员</span>
                </div>
                <p className="text-3xl font-bold text-white">{followingList.length}</p>
                <p className="text-sm text-neutral-500 mt-1">
                  {followingList.filter(t => t.isActive).length} 位活跃中
                </p>
              </div>
            </div>

            {/* 会员入口 */}
            <div className="card-dark p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    开通会员
                  </h3>
                  <p className="text-neutral-400 text-sm">300 USDT/月，解锁全部高级功能</p>
                </div>
                <button
                  onClick={() => { window.location.hash = 'wallet'; window.location.reload(); }}
                  className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition-colors flex items-center gap-2"
                >
                  <Crown size={18} />
                  {isMember ? '去续费' : '去开通'}
                </button>
              </div>
            </div>

            {/* 今日数据 */}
            <div className="card-dark p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-6">今日数据</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-neutral-400 text-sm mb-1">今日盈亏</p>
                  <p className="text-xl font-bold text-green-400">+$128.50</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm mb-1">今日收益率</p>
                  <p className="text-xl font-bold text-green-400">+2.14%</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm mb-1">成交笔数</p>
                  <p className="text-xl font-bold text-white">8</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm mb-1">当前持仓</p>
                  <p className="text-xl font-bold text-white">5</p>
                </div>
              </div>
            </div>

            {/* 币安API绑定 */}
            <div className="card-dark p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <Key className="w-5 h-5 text-cyan-400" />
                    币安API绑定
                  </h3>
                  <p className="text-neutral-400 text-sm">绑定您的币安API以开始自动跟单交易</p>
                </div>
                <button
                  onClick={() => setShowBindApi(true)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors flex items-center gap-2"
                >
                  <Key size={18} />
                  绑定API
                </button>
              </div>
            </div>

            {/* 自动跟单引擎状态 */}
            <div className="card-dark p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    自动跟单引擎
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    {engineStatus?.engine_running ? '引擎运行中，每60秒自动同步持仓' : '引擎未运行'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleManualSync()}
                    disabled={syncing}
                    className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 font-medium hover:bg-yellow-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    手动同步
                  </button>
                </div>
              </div>
              
              {syncResult && (
                <div className={`text-sm mb-3 ${syncResult.includes('失败') ? 'text-red-400' : 'text-green-400'}`}>
                  {syncResult}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-neutral-400 text-xs mb-1">活跃交易员</p>
                  <p className="text-xl font-bold text-white">{engineStatus?.active_traders ?? '-'}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-1">活跃跟单</p>
                  <p className="text-xl font-bold text-white">{engineStatus?.active_follows ?? '-'}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs mb-1">总跟单笔数</p>
                  <p className="text-xl font-bold text-white">{engineStatus?.total_copy_trades ?? '-'}</p>
                </div>
              </div>
            </div>

            {/* 收益曲线 */}
            <div className="card-dark p-6">
              <h3 className="text-lg font-semibold text-white mb-6">收益曲线</h3>
              <div className="h-64">
                {profitLoading ? (
                  <div className="flex items-center justify-center h-full text-neutral-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    加载中...
                  </div>
                ) : profitData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={profitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#737373" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#737373" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        itemStyle={{ color: '#22d3ee' }}
                        labelStyle={{ color: '#a3a3a3' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#22d3ee" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500">
                    暂无收益数据
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'following' && !loading && (
          <div className="space-y-4">
            {followingList.length === 0 ? (
              <div className="card-dark p-12 text-center">
                <Users size={48} className="text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400">您还没有跟随任何交易员</p>
                <button 
                  onClick={() => document.querySelector('#traders')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary mt-4"
                >
                  去挑选交易员
                </button>
              </div>
            ) : (
              followingList.map(trader => (
                <div key={trader.id} className="card-dark p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* 交易员信息 */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold">
                        {trader.avatar}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{trader.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                          <span className={trader.isActive ? 'text-green-400' : 'text-yellow-400'}>
                            {trader.isActive ? '● 跟单中' : '● 已暂停'}
                          </span>
                          <span>|</span>
                          <span>{trader.activePositions} 个活跃仓位</span>
                        </div>
                      </div>
                    </div>

                    {/* 收益数据 */}
                    <div className="flex gap-8">
                      <div>
                        <p className="text-neutral-400 text-sm">累计投入</p>
                        <p className="text-white font-medium">${trader.totalInvested.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">当前收益</p>
                        <p className={`font-medium ${trader.currentProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.currentProfit >= 0 ? '+' : ''}${trader.currentProfit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">收益率</p>
                        <p className={`font-medium ${trader.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.profitPercent >= 0 ? '+' : ''}{trader.profitPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleTrader(trader.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          trader.isActive 
                            ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        }`}
                        title={trader.isActive ? '暂停跟单' : '恢复跟单'}
                      >
                        {trader.isActive ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button 
                        className="p-2 rounded-lg bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                        title="设置"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => removeTrader(trader.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="停止跟单"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* 最近交易 */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-sm text-neutral-500">
                      最近交易: <span className="text-neutral-300">{trader.lastTrade}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && !loading && (
          <div className="card-dark overflow-hidden">
            {tradeHistory.length === 0 ? (
              <div className="p-12 text-center">
                <Clock size={48} className="text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400">暂无交易历史</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">时间</th>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">交易员</th>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">交易对</th>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">方向</th>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">数量</th>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">盈亏</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tradeHistory.map((trade, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-neutral-400 text-sm">{trade.time}</td>
                      <td className="p-4 text-white">{trade.trader}</td>
                      <td className="p-4 text-white">{trade.pair}</td>
                      <td className="p-4">
                        <span className={`text-sm ${trade.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.side === 'buy' ? '买入' : '卖出'}
                        </span>
                      </td>
                      <td className="p-4 text-white">{trade.amount}</td>
                      <td className="p-4">
                        <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 绑定API弹窗 */}
        <BindApiModal
          isOpen={showBindApi}
          onClose={() => setShowBindApi(false)}
          traderId={1}
        />
      </div>
    </div>
  );
}
