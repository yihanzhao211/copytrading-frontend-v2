import { useState, useEffect } from 'react';
import {
  Crown, ArrowLeft, LogOut, Loader2,
  CheckCircle, XCircle, Clock, Copy,
  History, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface RechargeRecord {
  id: number;
  amount: number;
  months: number;
  method: string;
  tx_hash: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
}

interface MembershipInfo {
  user_id: number;
  is_member: boolean;
  membership_expires_at: string | null;
  total_months_purchased: number;
  pending_orders: number;
}

const RECHARGE_ADDRESS = 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // 替换为真实地址

const monthOptions = [
  { months: 1, label: '1个月', price: 300 },
  { months: 3, label: '3个月', price: 900 },
  { months: 6, label: '6个月', price: 1800 },
  { months: 12, label: '12个月', price: 3600 },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateOnly(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400"><Clock size={12} /> 待确认</span>;
    case 'confirmed':
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400"><CheckCircle size={12} /> 已到账</span>;
    case 'rejected':
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-400"><XCircle size={12} /> 已拒绝</span>;
    case 'cancelled':
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-neutral-500/10 text-neutral-400"><XCircle size={12} /> 已取消</span>;
    default:
      return null;
  }
}

export default function WalletPage() {
  const { user, logout } = useAuth();
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [records, setRecords] = useState<RechargeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [recharging, setRecharging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'records'>('buy');

  const fetchMembership = async () => {
    try {
      setLoading(true);
      const data = await api.wallet.get();
      setMembership(data);
    } catch (err: any) {
      setError(err.message || '获取会员信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      setRecordsLoading(true);
      const data = await api.wallet.recharges({ limit: '50' });
      setRecords(data.records || []);
    } catch (err: any) {
      console.error('Failed to fetch records:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
    fetchRecords();
  }, []);

  const selectedPlan = monthOptions.find(p => p.months === selectedMonths) || monthOptions[0];

  const handleRecharge = async () => {
    try {
      setRecharging(true);
      await api.wallet.recharge({ months: selectedMonths, method: 'usdt_trc20' });
      alert('会员购买订单已创建，请在转账后等待确认');
      await fetchMembership();
      await fetchRecords();
      setActiveTab('records');
    } catch (err: any) {
      alert(err.message || '创建订单失败');
    } finally {
      setRecharging(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(RECHARGE_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async (record: RechargeRecord) => {
    if (!confirm(`确认已收到 ${record.amount} USDT 转账？\n将为您开通 ${record.months} 个月会员。`)) return;
    try {
      await api.wallet.confirm(record.id, { status: 'confirmed' });
      await fetchMembership();
      await fetchRecords();
    } catch (err: any) {
      alert(err.message || '确认失败');
    }
  };

  const handleCancel = async (record: RechargeRecord) => {
    if (!confirm('确定取消该会员购买订单？')) return;
    try {
      await api.wallet.cancel(record.id);
      await fetchMembership();
      await fetchRecords();
    } catch (err: any) {
      alert(err.message || '取消失败');
    }
  };

  const isMember = membership?.is_member;
  const expiresAt = membership?.membership_expires_at;

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => { window.location.hash = 'dashboard'; window.location.reload(); }}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Crown className="text-yellow-400" />
            会员中心
          </h1>
          <p className="text-neutral-400 mt-2">开通会员，解锁全部高级功能</p>
        </div>

        {/* 会员状态卡片 */}
        <div className="card-dark p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isMember ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-white/10'}`}>
                <Crown size={32} className={isMember ? 'text-black' : 'text-neutral-400'} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {loading ? '加载中...' : isMember ? '尊享会员' : '普通用户'}
                </h2>
                {isMember && expiresAt ? (
                  <p className="text-neutral-400 mt-1">
                    会员到期时间: <span className="text-yellow-400">{formatDateOnly(expiresAt)}</span>
                  </p>
                ) : (
                  <p className="text-neutral-400 mt-1">尚未开通会员</p>
                )}
              </div>
            </div>
            {!isMember && !loading && (
              <div className="text-sm text-neutral-500">
                开通会员后即可使用全部功能
              </div>
            )}
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
          {[
            { key: 'buy', label: '开通/续费', icon: Crown },
            { key: 'records', label: '购买记录', icon: History },
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

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {activeTab === 'buy' && (
          <div className="card-dark p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="text-yellow-400" size={20} />
              选择会员时长
            </h3>

            {/* 预设时长 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {monthOptions.map((plan) => (
                <button
                  key={plan.months}
                  onClick={() => setSelectedMonths(plan.months)}
                  className={`py-4 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                    selectedMonths === plan.months
                      ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-black'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{plan.label}</span>
                  <span className={`text-sm ${selectedMonths === plan.months ? 'text-black/70' : 'text-neutral-400'}`}>
                    {plan.price} USDT
                  </span>
                </button>
              ))}
            </div>

            {/* 价格汇总 */}
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">开通时长</span>
                <span className="text-white font-medium">{selectedPlan.label}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-neutral-400">单价</span>
                <span className="text-white font-medium">300 USDT/月</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className="text-white font-medium">应付总额</span>
                <span className="text-2xl font-bold text-cyan-400">{selectedPlan.price} USDT</span>
              </div>
            </div>

            {/* 充值地址 */}
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">转账地址 (USDT-TRC20)</span>
                <button
                  onClick={handleCopyAddress}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div className="font-mono text-sm text-white break-all">
                {RECHARGE_ADDRESS}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                请转账 <span className="text-cyan-400 font-medium">{selectedPlan.price} USDT</span> 到上方地址，转账完成后点击下方按钮创建订单。
              </p>
            </div>

            {/* 购买按钮 */}
            <button
              onClick={handleRecharge}
              disabled={recharging}
              className="w-full py-3 rounded-xl font-medium text-black bg-gradient-to-r from-cyan-400 to-cyan-500 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {recharging ? (
                <><Loader2 size={18} className="animate-spin" /> 处理中...</>
              ) : (
                <><Crown size={18} /> 确认已转账，创建订单</>
              )}
            </button>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="card-dark overflow-hidden">
            {recordsLoading ? (
              <div className="p-12 text-center text-neutral-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                加载中...
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <History size={48} className="text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400">暂无购买记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left text-neutral-400 text-sm font-medium p-4">时间</th>
                      <th className="text-left text-neutral-400 text-sm font-medium p-4">时长</th>
                      <th className="text-left text-neutral-400 text-sm font-medium p-4">金额</th>
                      <th className="text-left text-neutral-400 text-sm font-medium p-4">状态</th>
                      <th className="text-left text-neutral-400 text-sm font-medium p-4">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-neutral-400 text-sm">{formatDate(record.created_at)}</td>
                        <td className="p-4 text-white font-medium">{record.months} 个月</td>
                        <td className="p-4 text-white font-medium">{record.amount.toFixed(0)} USDT</td>
                        <td className="p-4">{getStatusBadge(record.status)}</td>
                        <td className="p-4">
                          {record.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConfirm(record)}
                                className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium"
                              >
                                确认到账
                              </button>
                              <button
                                onClick={() => handleCancel(record)}
                                className="px-3 py-1 rounded-lg bg-neutral-500/10 text-neutral-400 hover:bg-neutral-500/20 text-xs font-medium"
                              >
                                取消
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
