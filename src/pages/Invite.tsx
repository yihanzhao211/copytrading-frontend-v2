import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Users, Gift, Copy, CheckCircle, Loader2, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Invitee {
  user_id: number;
  username: string;
  nickname?: string;
  created_at: string;
  has_recharged: boolean;
  total_recharge_amount: number;
  reward_given: number;
}

export default function InvitePage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<{
    code?: string;
    total_invites: number;
    total_recharge_reward: number;
    register_reward: number;
    first_recharge_reward_rate: number;
    indirect_reward_rate: number;
  } | null>(null);
  const [records, setRecords] = useState<{ total: number; invitees: Invitee[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.invite.stats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || '获取邀请统计失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      const data = await api.invite.records();
      setRecords(data);
    } catch (err: any) {
      console.error('获取邀请记录失败', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecords();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await api.invite.generate();
      await fetchStats();
    } catch (err: any) {
      alert(err.message || '生成邀请码失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = stats?.code ? `${window.location.origin}${window.location.pathname}#community?ref=${stats.code}` : '';

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
                href="#wallet"
                className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Crown size={16} />
                会员中心
              </a>
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
            <Gift className="text-cyan-400" />
            邀请返利
          </h1>
          <p className="text-neutral-400 mt-2">邀请好友加入，赚取积分返利</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* 奖励规则 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card-dark p-5 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-1">+100</div>
            <div className="text-sm text-neutral-400">好友注册，你得积分</div>
          </div>
          <div className="card-dark p-5 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">10%</div>
            <div className="text-sm text-neutral-400">好友充值返利（直邀）</div>
          </div>
          <div className="card-dark p-5 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">5%</div>
            <div className="text-sm text-neutral-400">间接好友充值返利</div>
          </div>
        </div>

        {/* 邀请码卡片 */}
        <div className="card-dark p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-cyan-400" />
            我的邀请码
          </h2>

          {loading ? (
            <div className="py-8 text-center text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              加载中...
            </div>
          ) : stats?.code ? (
            <div className="space-y-4">
              {/* 邀请码 */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <div className="text-sm text-neutral-400 mb-2">专属邀请码</div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-2xl font-mono font-bold text-white tracking-wider">
                    {stats.code}
                  </div>
                  <button
                    onClick={() => handleCopy(stats.code!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm"
                  >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
              </div>

              {/* 分享链接 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-neutral-400 mb-2">分享链接</div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-white truncate">
                    {shareUrl}
                  </div>
                  <button
                    onClick={() => handleCopy(shareUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm shrink-0"
                  >
                    <Copy size={14} />
                    复制链接
                  </button>
                </div>
              </div>

              {/* 统计数据 */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-xs text-neutral-400">累计邀请</div>
                  <div className="text-xl font-bold text-white">{stats.total_invites} 人</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="text-xs text-neutral-400">累计返利</div>
                  <div className="text-xl font-bold text-cyan-400">{stats.total_recharge_reward.toFixed(2)} 积分</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-neutral-400 mb-4">您还没有邀请码</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-2 rounded-lg bg-cyan-500 text-black font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                {generating ? '生成中...' : '生成邀请码'}
              </button>
            </div>
          )}
        </div>

        {/* 邀请记录 */}
        <div className="card-dark overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">邀请记录</h2>
          </div>
          {!records ? (
            <div className="p-12 text-center text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              加载中...
            </div>
          ) : records.total === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <Users size={48} className="text-neutral-600 mx-auto mb-4" />
              <p>暂无邀请记录，快去分享邀请码吧</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">用户</th>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">注册时间</th>
                    <th className="text-left text-neutral-400 text-sm font-medium p-4">充值状态</th>
                    <th className="text-right text-neutral-400 text-sm font-medium p-4">累计充值</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.invitees.map((item) => (
                    <tr key={item.user_id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="text-white font-medium">{item.nickname || item.username}</div>
                      </td>
                      <td className="p-4 text-neutral-400 text-sm">
                        {new Date(item.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="p-4">
                        {item.has_recharged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                            已充值
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-neutral-500/10 text-neutral-400">
                            未充值
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right text-white font-medium">
                        {item.total_recharge_amount.toFixed(2)} USDT
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
