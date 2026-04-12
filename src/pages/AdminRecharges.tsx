import { useState, useEffect } from 'react';
import {
  ArrowLeft, LogOut, Loader2, CheckCircle, XCircle,
  Clock, ImageIcon, X, Search, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface AdminRechargeRecord {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  amount: number;
  months: number;
  method: string;
  tx_hash: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  note: string | null;
  screenshot_url: string | null;
  created_at: string;
  confirmed_at: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
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

export default function AdminRecharges() {
  const { user, logout } = useAuth();
  const [records, setRecords] = useState<AdminRechargeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [noteInput, setNoteInput] = useState<Record<number, string>>({});
  const [stats, setStats] = useState({ total: 0, pending_total: 0 });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.wallet.adminRecharges(filterStatus || undefined, 100, 0);
      setRecords(data.records || []);
      setStats({ total: data.total || 0, pending_total: data.pending_total || 0 });
    } catch (err: any) {
      alert(err.message || '获取充值记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterStatus]);

  const handleConfirm = async (record: AdminRechargeRecord, status: 'confirmed' | 'rejected') => {
    if (status === 'confirmed') {
      if (!confirm(`确认已收到 ${record.amount} USDT 转账？\n将为 ${record.user_name} 开通 ${record.months} 个月会员。`)) return;
    } else {
      if (!confirm(`确定拒绝该充值订单？`)) return;
    }
    try {
      setProcessingId(record.id);
      await api.wallet.confirm(record.id, { status, note: noteInput[record.id] || '' });
      await fetchRecords();
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = records.filter(r => r.status === 'pending').length;

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
              <span className="text-sm text-neutral-400 hidden sm:block">管理员后台</span>
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
          <h1 className="text-3xl font-bold text-white">充值审核后台</h1>
          <p className="text-neutral-400 mt-2">审核用户会员充值订单</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card-dark p-5">
            <div className="text-sm text-neutral-400">待审核订单</div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending_total}</div>
          </div>
          <div className="card-dark p-5">
            <div className="text-sm text-neutral-400">当前筛选记录</div>
            <div className="text-2xl font-bold text-white mt-1">{records.length}</div>
          </div>
          <div className="card-dark p-5">
            <div className="text-sm text-neutral-400">总充值记录</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.total}</div>
          </div>
        </div>

        {/* 筛选 */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Filter size={16} />
            状态筛选:
          </div>
          {[
            { key: '', label: '全部' },
            { key: 'pending', label: '待确认' },
            { key: 'confirmed', label: '已到账' },
            { key: 'rejected', label: '已拒绝' },
            { key: 'cancelled', label: '已取消' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === key
                  ? 'bg-cyan-500 text-black'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            加载中...
          </div>
        ) : records.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <Search size={48} className="text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">暂无充值记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="card-dark p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* 左侧信息 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(record.status)}
                      <span className="text-lg font-bold text-white">{record.amount.toFixed(0)} USDT</span>
                      <span className="text-sm text-neutral-400">/ {record.months} 个月会员</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="text-neutral-400">
                        用户: <span className="text-white">{record.user_name}</span>
                      </div>
                      <div className="text-neutral-400">
                        邮箱: <span className="text-white">{record.user_email}</span>
                      </div>
                      <div className="text-neutral-400">
                        时间: <span className="text-white">{formatDate(record.created_at)}</span>
                      </div>
                      <div className="text-neutral-400">
                        方式: <span className="text-white">{record.method.toUpperCase()}</span>
                      </div>
                    </div>
                    {record.note && (
                      <div className="text-sm text-neutral-500">
                        备注: {record.note}
                      </div>
                    )}
                  </div>

                  {/* 右侧截图 + 操作 */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start gap-4">
                    {record.screenshot_url ? (
                      <button
                        onClick={() => setPreviewImage(record.screenshot_url)}
                        className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5 w-32 h-24 flex items-center justify-center hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={record.screenshot_url}
                          alt="截图"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-xs text-white">
                          <ImageIcon size={14} className="mr-1" /> 查看
                        </div>
                      </button>
                    ) : (
                      <div className="w-32 h-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-xs text-neutral-500">
                        无截图
                      </div>
                    )}

                    {record.status === 'pending' && (
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <input
                          type="text"
                          placeholder="处理备注（可选）"
                          value={noteInput[record.id] || ''}
                          onChange={(e) => setNoteInput(prev => ({ ...prev, [record.id]: e.target.value }))}
                          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
                        />
                        <button
                          onClick={() => handleConfirm(record, 'confirmed')}
                          disabled={processingId === record.id}
                          className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-medium disabled:opacity-50"
                        >
                          {processingId === record.id ? '处理中...' : '确认到账'}
                        </button>
                        <button
                          onClick={() => handleConfirm(record, 'rejected')}
                          disabled={processingId === record.id}
                          className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium disabled:opacity-50"
                        >
                          拒绝
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 截图预览弹窗 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img src={previewImage} alt="截图预览" className="w-full rounded-lg" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-neutral-300"
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
