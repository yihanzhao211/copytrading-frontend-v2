import { useState, useRef } from 'react';
import { 
  ArrowLeft, User, Bell, Shield, Key, Mail, 
  Camera, Save, Loader2, Eye, EyeOff, Trash2,
  Smartphone, Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 个人资料状态
  const [profile, setProfile] = useState({
    nickname: user?.name || '',
    email: user?.email || '',
    avatar: null as string | null,
    bio: '',
  });

  // 通知设置状态
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    pushEnabled: true,
    tradeAlerts: true,
    priceAlerts: true,
    newsletter: false,
    securityAlerts: true,
  });

  // 安全设置状态
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
  });

  // API Keys 状态
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: '交易机器人',
      key: 'ak_******************************7f3a',
      createdAt: '2024-01-15',
      lastUsed: '2024-03-15 14:30',
    },
  ]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      alert('新密码与确认密码不匹配');
      return;
    }
    if (security.newPassword.length < 8) {
      alert('密码长度至少8位');
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setSecurity({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showNewPassword: false,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `ak_${'******************************'}${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: '从未使用',
    };
    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setShowNewKeyModal(false);
    setIsLoading(false);
  };

  const handleDeleteApiKey = (id: string) => {
    if (confirm('确定要删除此API Key吗？此操作不可恢复。')) {
      setApiKeys(prev => prev.filter(key => key.id !== id));
    }
  };

  const goBack = () => {
    window.location.hash = 'dashboard';
    window.location.reload();
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">设置</h1>
          <p className="text-neutral-400 mt-2">管理您的账户设置和偏好</p>
        </div>

        {/* 保存成功提示 */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 font-medium flex items-center gap-2">
              <Save size={18} />
              设置已保存
            </p>
          </div>
        )}

        {/* 标签切换 */}
        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl w-fit">
          {[
            { key: 'profile', label: '个人资料', icon: User },
            { key: 'notifications', label: '通知设置', icon: Bell },
            { key: 'security', label: '安全设置', icon: Shield },
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

        {/* 个人资料设置 */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card-dark p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-cyan-400" />
                个人资料
              </h3>
              
              {/* 头像设置 */}
              <div className="flex items-center gap-6 mb-8">
                <div 
                  onClick={handleAvatarClick}
                  className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-2xl cursor-pointer group overflow-hidden"
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0] || 'U'
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div>
                  <p className="text-white font-medium mb-1">头像</p>
                  <p className="text-neutral-400 text-sm mb-3">点击头像上传新图片</p>
                  <button 
                    onClick={handleAvatarClick}
                    className="px-4 py-2 rounded-lg bg-white/5 text-neutral-300 hover:bg-white/10 transition-colors text-sm"
                  >
                    更换头像
                  </button>
                </div>
              </div>

              {/* 昵称和邮箱 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">昵称</label>
                  <input
                    type="text"
                    value={profile.nickname}
                    onChange={(e) => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="输入昵称"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-sm mb-2">邮箱</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="输入邮箱地址"
                  />
                </div>
              </div>

              {/* 个人简介 */}
              <div className="mt-6">
                <label className="block text-neutral-400 text-sm mb-2">个人简介</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                  placeholder="介绍一下自己..."
                />
              </div>

              {/* 保存按钮 */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  保存更改
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 通知设置 */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="card-dark p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Bell size={20} className="text-cyan-400" />
                通知设置
              </h3>

              {/* 邮件通知 */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">邮件通知</p>
                    <p className="text-neutral-400 text-sm">接收重要更新的邮件通知</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }))}
                  className={`w-14 h-7 rounded-full transition-colors relative ${
                    notifications.emailEnabled ? 'bg-cyan-500' : 'bg-neutral-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                    notifications.emailEnabled ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* 推送通知 */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Smartphone size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">推送通知</p>
                    <p className="text-neutral-400 text-sm">接收实时推送通知</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, pushEnabled: !prev.pushEnabled }))}
                  className={`w-14 h-7 rounded-full transition-colors relative ${
                    notifications.pushEnabled ? 'bg-cyan-500' : 'bg-neutral-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                    notifications.pushEnabled ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="border-t border-white/10 my-6" />

              {/* 交易提醒 */}
              <h4 className="text-white font-medium mb-4">通知类型</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">交易提醒</p>
                    <p className="text-neutral-400 text-sm">交易员开仓/平仓时通知</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, tradeAlerts: !prev.tradeAlerts }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      notifications.tradeAlerts ? 'bg-cyan-500' : 'bg-neutral-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      notifications.tradeAlerts ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">价格提醒</p>
                    <p className="text-neutral-400 text-sm">价格达到设定值时通知</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, priceAlerts: !prev.priceAlerts }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      notifications.priceAlerts ? 'bg-cyan-500' : 'bg-neutral-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      notifications.priceAlerts ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">安全提醒</p>
                    <p className="text-neutral-400 text-sm">账户安全相关通知</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, securityAlerts: !prev.securityAlerts }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      notifications.securityAlerts ? 'bg-cyan-500' : 'bg-neutral-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      notifications.securityAlerts ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">营销邮件</p>
                    <p className="text-neutral-400 text-sm">接收产品更新和优惠信息</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, newsletter: !prev.newsletter }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      notifications.newsletter ? 'bg-cyan-500' : 'bg-neutral-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      notifications.newsletter ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* 保存按钮 */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  保存设置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 安全设置 */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* 修改密码 */}
            <div className="card-dark p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Key size={20} className="text-cyan-400" />
                修改密码
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-neutral-400 text-sm mb-2">当前密码</label>
                  <input
                    type={security.showCurrentPassword ? 'text' : 'password'}
                    value={security.currentPassword}
                    onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all pr-12"
                    placeholder="输入当前密码"
                  />
                  <button
                    onClick={() => setSecurity(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                    className="absolute right-4 top-9 text-neutral-400 hover:text-white"
                  >
                    {security.showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-neutral-400 text-sm mb-2">新密码</label>
                  <input
                    type={security.showNewPassword ? 'text' : 'password'}
                    value={security.newPassword}
                    onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all pr-12"
                    placeholder="输入新密码（至少8位）"
                  />
                  <button
                    onClick={() => setSecurity(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                    className="absolute right-4 top-9 text-neutral-400 hover:text-white"
                  >
                    {security.showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div>
                  <label className="block text-neutral-400 text-sm mb-2">确认新密码</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="再次输入新密码"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading || !security.currentPassword || !security.newPassword || !security.confirmPassword}
                  className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                  修改密码
                </button>
              </div>
            </div>

            {/* API Key 管理 */}
            <div className="card-dark p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Globe size={20} className="text-cyan-400" />
                  API Key 管理
                </h3>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors text-sm"
                >
                  创建新 Key
                </button>
              </div>

              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{apiKey.name}</p>
                      <p className="text-neutral-400 text-sm font-mono mt-1">{apiKey.key}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                        <span>创建于: {apiKey.createdAt}</span>
                        <span>最后使用: {apiKey.lastUsed}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-neutral-400">
                    <Key size={48} className="mx-auto mb-4 opacity-30" />
                    <p>暂无 API Key</p>
                  </div>
                )}
              </div>
            </div>

            {/* 账户安全 */}
            <div className="card-dark p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Shield size={20} className="text-cyan-400" />
                账户安全
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Shield size={20} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">双重验证 (2FA)</p>
                      <p className="text-neutral-400 text-sm">增强账户安全性</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-white/5 text-neutral-300 hover:bg-white/10 transition-colors text-sm">
                    启用
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Trash2 size={20} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">删除账户</p>
                      <p className="text-neutral-400 text-sm">永久删除您的账户和数据</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建 API Key 弹窗 */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="card-dark p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">创建新的 API Key</h3>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="输入 API Key 名称"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-neutral-300 hover:bg-white/10 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateApiKey}
                disabled={isLoading || !newKeyName.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
