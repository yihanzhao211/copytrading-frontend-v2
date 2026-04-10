import { useEffect, useState } from 'react';
import { 
  Flame, Clock, MessageSquare, Heart, Eye, PenSquare, 
  TrendingUp, Users, Calendar, ChevronRight, Award
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Section {
  id: number;
  name: string;
  description: string;
}

interface Author {
  id: number;
  username: string;
  nickname?: string;
  avatar_url?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  views: number;
  likes: number;
  comments_count: number;
  is_auto_generated: boolean;
  created_at: string;
  author: Author;
  section: Section;
}

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', section_id: 1 });
  const [prices, setPrices] = useState({ btc: 0, eth: 0 });

  useEffect(() => {
    fetchSections();
    fetchPosts();
    fetchPrices();
  }, [activeSection, sort]);

  const fetchSections = async () => {
    try {
      const data = await api.community.sections();
      setSections(data);
    } catch (e) {
      console.error('获取版块失败', e);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = { sort, limit: 20 };
      if (activeSection) params.section_id = activeSection;
      const data = await api.community.posts(params);
      setPosts(data);
    } catch (e) {
      console.error('获取帖子失败', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    // 模拟价格，后续可接入真实行情API
    setPrices({ btc: 71234.5, eth: 3456.2 });
  };

  const handleCheckIn = async () => {
    if (!isAuthenticated) return;
    try {
      await api.community.checkIn();
      setCheckedIn(true);
    } catch (e) {
      console.error('签到失败', e);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    try {
      await api.community.createPost(newPost);
      setShowPostModal(false);
      setNewPost({ title: '', content: '', section_id: 1 });
      fetchPosts();
    } catch (e) {
      console.error('发帖失败', e);
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部简化导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <span className="text-black font-bold text-sm">CT</span>
              </div>
              <span className="text-lg font-semibold text-white">Copy Trading</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#community" className="text-sm text-white font-medium">广场</a>
              <a href="#dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">仪表盘</a>
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xs">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="text-sm text-neutral-300 hidden sm:block">{user?.name || '用户'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧导航 */}
          <aside className="hidden lg:block lg:col-span-2 space-y-2">
            <div className="glass rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">导航</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === null ? 'bg-cyan-500/20 text-cyan-400' : 'text-neutral-300 hover:bg-white/5'
                  }`}
                >
                  社区广场
                </button>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === s.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-neutral-300 hover:bg-white/5'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">快捷入口</h3>
              <div className="space-y-2">
                <a href="#dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-white/5 transition-colors">
                  <TrendingUp size={16} />
                  我的跟单
                </a>
                <a href="#dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-300 hover:bg-white/5 transition-colors">
                  <Users size={16} />
                  交易员
                </a>
              </div>
            </div>
          </aside>

          {/* 中间帖子流 */}
          <main className="lg:col-span-7 space-y-4">
            {/* 头部横幅 */}
            <div className="glass rounded-2xl p-6 border border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <h1 className="text-2xl font-bold text-white mb-2">社区广场</h1>
              <p className="text-neutral-400 text-sm">分享经验判断，交流策略想法，与志同道合的交易者共同成长</p>
            </div>

            {/* Tab & 发帖 */}
            <div className="glass rounded-xl p-3 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSort('latest')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sort === 'latest' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Clock size={16} />
                  最新
                </button>
                <button
                  onClick={() => setSort('hot')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sort === 'hot' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Flame size={16} />
                  最热
                </button>
              </div>
              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold transition-colors"
              >
                <PenSquare size={16} />
                发布新帖
              </button>
            </div>

            {/* 帖子列表 */}
            {loading ? (
              <div className="text-center py-12 text-neutral-500">加载中...</div>
            ) : posts.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center border border-white/10">
                <p className="text-neutral-400">暂无帖子，来做第一个发帖的人吧</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-neutral-300">
                            {post.section?.name}
                          </span>
                          {post.is_auto_generated && (
                            <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">
                              自动同步
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-neutral-400 line-clamp-2 mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-[10px]">
                              {post.author?.username?.[0] || 'U'}
                            </div>
                            <span className="text-neutral-300">{post.author?.nickname || post.author?.username}</span>
                          </div>
                          <span>{formatTime(post.created_at)}</span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {post.comments_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={12} />
                            {post.likes}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-neutral-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          {/* 右侧边栏 */}
          <aside className="lg:col-span-3 space-y-4">
            {/* 签到卡片 */}
            <div className="glass rounded-xl p-5 border border-white/10 text-center">
              <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">每日签到</h3>
              <p className="text-xs text-neutral-400 mb-4">连续签到获取经验值</p>
              <button
                onClick={handleCheckIn}
                disabled={checkedIn || !isAuthenticated}
                className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                  checkedIn
                    ? 'bg-white/10 text-neutral-400 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                }`}
              >
                {checkedIn ? '今日已签到' : '立即签到'}
              </button>
            </div>

            {/* 行情卡片 */}
            <div className="glass rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-cyan-400" />
                行情数据
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">BTC/USDT</span>
                  <span className="text-sm font-medium text-white">${prices.btc.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">ETH/USDT</span>
                  <span className="text-sm font-medium text-white">${prices.eth.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 公告 */}
            <div className="glass rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">公告</h3>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-xs text-cyan-400 font-medium mb-1">欢迎加入社区</p>
                <p className="text-xs text-neutral-400">遇到问题请联系客服获取支持</p>
              </div>
            </div>

            {/* 活跃用户 */}
            <div className="glass rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Award size={16} className="text-cyan-400" />
                活跃用户
              </h3>
              <div className="space-y-3">
                {['欧阳君尧', '枫~', '清风1'].map((name, i) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xs">
                      {name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{name}</p>
                      <p className="text-xs text-neutral-500">等级 {4 - i}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 发帖弹窗 */}
      {showPostModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="glass rounded-2xl p-6 border border-white/10 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-white mb-4">发布新帖</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">选择版块</label>
                <select
                  value={newPost.section_id}
                  onChange={(e) => setNewPost({ ...newPost, section_id: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id} className="bg-black">{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">标题</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="请输入标题"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none placeholder:text-neutral-600"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">内容</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="分享你的观点..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none placeholder:text-neutral-600 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreatePost}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold transition-colors"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
