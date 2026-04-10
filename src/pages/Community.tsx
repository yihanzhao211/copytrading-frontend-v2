import { useEffect, useState } from 'react';
import { 
  Flame, Clock, MessageSquare, Heart, Eye, PenSquare, 
  TrendingUp, Users, Calendar, ChevronRight, Award,
  X, Send, ArrowLeft, Zap
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

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
  level?: number;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author: Author;
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

interface PostDetail {
  post: Post;
  comments: Comment[];
  is_liked: boolean;
}

export default function Community() {
  const { user, isAuthenticated, login } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', section_id: 1 });
  const [prices, setPrices] = useState({ btc: 0, eth: 0 });
  
  // 帖子详情
  const [detailPost, setDetailPost] = useState<PostDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchSections();
    fetchPosts();
    fetchPrices();
  }, [activeSection, sort]);

  const fetchSections = async () => {
    try {
      const data = await api.community.sections();
      setSections(data);
      if (data.length > 0 && !newPost.section_id) {
        setNewPost(prev => ({ ...prev, section_id: data[0].id }));
      }
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
    setPrices({ btc: 71234.5, eth: 3456.2 });
  };

  const handleCheckIn = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await api.community.checkIn();
      if (res.success) {
        setCheckedIn(true);
        // 更新本地用户经验
        const saved = localStorage.getItem('user');
        if (saved) {
          const u = JSON.parse(saved);
          u.exp = (u.exp || 0) + res.exp_added;
          localStorage.setItem('user', JSON.stringify(u));
          login(u);
        }
      } else {
        setCheckedIn(true);
      }
    } catch (e) {
      console.error('签到失败', e);
    }
  };

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    try {
      await api.community.createPost(newPost);
      setShowPostModal(false);
      setNewPost({ title: '', content: '', section_id: sections[0]?.id || 1 });
      fetchPosts();
    } catch (e) {
      console.error('发帖失败', e);
    }
  };

  const openPostDetail = async (postId: number) => {
    setDetailLoading(true);
    try {
      const data = await api.community.postDetail(postId);
      setDetailPost(data);
    } catch (e) {
      console.error('获取帖子详情失败', e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleLikePost = async (postId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await api.community.likePost(postId);
      // 更新列表中的点赞数
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes: res.likes };
        }
        return p;
      }));
      // 更新详情中的点赞状态
      if (detailPost && detailPost.post.id === postId) {
        setDetailPost({
          ...detailPost,
          post: { ...detailPost.post, likes: res.likes },
          is_liked: res.liked
        });
      }
    } catch (err) {
      console.error('点赞失败', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!detailPost || !newComment.trim()) return;
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    try {
      await api.community.createComment(detailPost.post.id, newComment);
      setNewComment('');
      // 刷新详情
      openPostDetail(detailPost.post.id);
      // 刷新列表中的评论数
      setPosts(prev => prev.map(p => {
        if (p.id === detailPost.post.id) {
          return { ...p, comments_count: p.comments_count + 1 };
        }
        return p;
      }));
    } catch (e) {
      console.error('评论失败', e);
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

  const getExpToNext = (level: number = 1, exp: number = 0) => {
    const need = level * 10;
    return { need, progress: Math.min(100, Math.round((exp / need) * 100)) };
  };

  const currentExp = getExpToNext(user?.level, user?.exp);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部简化导航 */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10">
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
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm text-white">{user.name || '用户'}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium">
                        Lv.{user.level || 1}
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                    {user.name?.[0] || 'U'}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  登录 / 注册
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧导航 */}
          <aside className="hidden lg:block lg:col-span-2 space-y-4">
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
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowAuthModal(true);
                  } else {
                    setShowPostModal(true);
                  }
                }}
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
                    onClick={() => openPostDetail(post.id)}
                    className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-neutral-300">
                            {post.section?.name}
                          </span>
                          {post.is_auto_generated && (
                            <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                              <Zap size={10} />
                              自动同步
                            </span>
                          )}
                          {post.author?.level && post.author.level > 1 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-medium">
                              Lv.{post.author.level}
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
                          <span 
                            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                            onClick={(e) => handleLikePost(post.id, e)}
                          >
                            <Heart size={12} />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {post.comments_count}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-neutral-600 group-hover:text-cyan-400 transition-colors shrink-0 mt-1" />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          {/* 右侧边栏 */}
          <aside className="lg:col-span-3 space-y-4">
            {/* 用户信息卡片（登录后显示） */}
            {isAuthenticated && user && (
              <div className="glass rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-lg">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{user.name || '用户'}</p>
                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">等级</span>
                    <span className="text-cyan-400 font-semibold">Lv.{user.level || 1}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all"
                      style={{ width: `${currentExp.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>EXP {user.exp || 0}</span>
                    <span>升级需 {currentExp.need - (user.exp || 0)} EXP</span>
                  </div>
                </div>
              </div>
            )}

            {/* 签到卡片 */}
            <div className="glass rounded-xl p-5 border border-white/10 text-center">
              <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">每日签到</h3>
              <p className="text-xs text-neutral-400 mb-4">连续签到获取经验值</p>
              <button
                onClick={handleCheckIn}
                disabled={checkedIn}
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
                {[
                  { name: '欧阳君尧', level: 4 },
                  { name: '枫~', level: 2 },
                  { name: '清风1', level: 2 },
                ].map((u) => (
                  <div key={u.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xs">
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{u.name}</p>
                      <p className="text-xs text-amber-400">Lv.{u.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 帖子详情弹窗 */}
      {detailPost && (
        <div className="fixed inset-0 z-[50] bg-black/90 overflow-y-auto">
          <div className="min-h-screen px-4 py-6">
            <div className="max-w-3xl mx-auto">
              {/* 返回按钮 */}
              <button
                onClick={() => setDetailPost(null)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4 sticky top-4"
              >
                <ArrowLeft size={20} />
                返回广场
              </button>

              {detailLoading ? (
                <div className="text-center py-20 text-neutral-500">加载中...</div>
              ) : (
                <div className="space-y-4">
                  {/* 帖子主体 */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs bg-white/10 text-neutral-300">
                        {detailPost.post.section?.name}
                      </span>
                      {detailPost.post.is_auto_generated && (
                        <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                          <Zap size={10} />
                          自动同步
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl font-bold text-white mb-4">{detailPost.post.title}</h1>
                    <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap mb-6">
                      {detailPost.post.content}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                          {detailPost.post.author?.username?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm text-white">{detailPost.post.author?.nickname || detailPost.post.author?.username}</p>
                          <p className="text-xs text-neutral-500">{formatTime(detailPost.post.created_at)}</p>
                        </div>
                        {detailPost.post.author?.level && detailPost.post.author.level > 1 && (
                          <span className="ml-2 px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 font-medium">
                            Lv.{detailPost.post.author.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikePost(detailPost.post.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            detailPost.is_liked
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/5 text-neutral-400 hover:text-red-400'
                          }`}
                        >
                          <Heart size={16} className={detailPost.is_liked ? 'fill-current' : ''} />
                          {detailPost.post.likes}
                        </button>
                        <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                          <Eye size={16} />
                          {detailPost.post.views}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 评论区域 */}
                  <div className="glass rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MessageSquare size={18} className="text-cyan-400" />
                      评论 ({detailPost.comments.length})
                    </h3>

                    {/* 评论输入 */}
                    <div className="flex gap-3 mb-6">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm shrink-0">
                        {user?.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                            placeholder={isAuthenticated ? '写下你的评论...' : '登录后发表评论'}
                            disabled={!isAuthenticated}
                            className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none placeholder:text-neutral-600 disabled:opacity-50"
                          />
                          <button
                            onClick={handleSubmitComment}
                            disabled={!isAuthenticated || !newComment.trim()}
                            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:text-neutral-400 text-black text-sm font-semibold transition-colors"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 评论列表 */}
                    <div className="space-y-4">
                      {detailPost.comments.length === 0 ? (
                        <p className="text-center text-neutral-500 py-8">暂无评论，来说两句吧</p>
                      ) : (
                        detailPost.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm shrink-0">
                              {comment.author?.username?.[0] || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-white font-medium">
                                  {comment.author?.nickname || comment.author?.username}
                                </span>
                                {comment.author?.level && comment.author.level > 1 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400">
                                    Lv.{comment.author.level}
                                  </span>
                                )}
                                <span className="text-xs text-neutral-500">{formatTime(comment.created_at)}</span>
                              </div>
                              <p className="text-sm text-neutral-300">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 发帖弹窗 */}
      {showPostModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="glass rounded-2xl p-6 border border-white/10 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">发布新帖</h3>
              <button onClick={() => setShowPostModal(false)} className="text-neutral-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
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

      {/* 登录弹窗 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => login(u)}
      />
    </div>
  );
}