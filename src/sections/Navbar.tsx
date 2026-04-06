import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const navLinks = [
  { name: '首页', href: '#hero' },
  { name: '关于', href: '#about' },
  { name: '交易员', href: '#traders' },
  { name: '定价', href: '#pricing' },
  { name: '功能', href: '#features' },
];

// 临时方案：通过修改 window.location.hash 来切换页面
const goToDashboard = () => {
  window.location.hash = 'dashboard';
  window.location.reload();
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className={`flex items-center gap-2 transition-transform duration-500 ${
            isScrolled ? 'scale-90' : 'scale-100'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-black font-bold text-lg">CT</span>
            </div>
            <span className="text-xl font-semibold text-white">Copy Trading</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="relative text-sm text-neutral-400 hover:text-white transition-colors duration-200 group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </button>
            ))}
            <button
              onClick={goToDashboard}
              className="relative text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
            >
              仪表盘
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={goToDashboard}
                  className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xs">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span>{user?.name || '用户'}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  登录
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary text-sm"
                >
                  立即开始
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden absolute top-full left-0 right-0 glass border-b border-white/10 transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.href)}
              className="block w-full text-left text-neutral-400 hover:text-white transition-colors py-2"
            >
              {link.name}
            </button>
          ))}
          {!isAuthenticated && (
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="btn-primary w-full text-sm mt-4"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />
    </nav>
  );
}
