import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CopyTradingModal from '../components/CopyTradingModal';
import { api } from '../lib/api';

gsap.registerPlugin(ScrollTrigger);

// API Response Types
interface TraderAPI {
  id: number;
  name: string;
  avatar?: string;
  rank: number;
  win_rate: number;
  total_return: number;
  followers_count: number;
  monthly_return: number;
  performance_data: number[];
  is_online: boolean;
}

// UI Types
interface Trader {
  id: number;
  name: string;
  avatar: string;
  rank: number;
  winRate: number;
  totalReturn: number;
  followers: number;
  monthlyReturn: number;
  chartData: number[];
  isOnline: boolean;
}

// Transform API data to UI format
function transformTrader(trader: TraderAPI): Trader {
  return {
    id: trader.id,
    name: trader.name,
    avatar: trader.avatar || trader.name[0],
    rank: trader.rank,
    winRate: trader.win_rate,
    totalReturn: trader.total_return,
    followers: trader.followers_count,
    monthlyReturn: trader.monthly_return,
    chartData: trader.performance_data || [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    isOnline: trader.is_online ?? true,
  };
}

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E0FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00E0FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${points} 100,100`} fill="url(#chartGradient)" />
      <polyline points={points} fill="none" stroke="#00E0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Traders() {
  const sectionRef = useRef<HTMLElement>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch traders from API
  useEffect(() => {
    async function fetchTraders() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.traders.list({ limit: 10 });
        const traderList = Array.isArray(data) ? data : data.items || [];
        const transformed = traderList.map(transformTrader);
        setTraders(transformed);
        // Set active index to middle or 0
        setActiveIndex(Math.floor(transformed.length / 2) || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取交易员列表失败');
        console.error('Failed to fetch traders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTraders();
  }, []);

  // GSAP animations
  useEffect(() => {
    if (loading || traders.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.traders-title',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.trader-card',
        { rotateY: -60, z: -500, opacity: 0 },
        {
          rotateY: 0,
          z: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, traders.length]);

  const handleOpenModal = (trader: Trader) => {
    setSelectedTrader(trader);
    setIsModalOpen(true);
  };

  const handlePrev = () => setActiveIndex((prev) => (prev > 0 ? prev - 1 : traders.length - 1));
  const handleNext = () => setActiveIndex((prev) => (prev < traders.length - 1 ? prev + 1 : 0));

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <section id="traders" ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="traders-title text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
            热门<span className="text-gradient">交易员</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">关注表现最佳的交易员并实时复制他们的交易</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-neutral-400">加载交易员数据...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md mx-auto p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-red-400 font-medium mb-2">加载失败</p>
            <p className="text-red-300/80 text-sm mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
            >
              重试
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && traders.length === 0 && (
          <div className="text-center py-16">
            <Users size={64} className="text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-lg">暂无交易员数据</p>
            <p className="text-neutral-500 text-sm mt-2">请稍后再试</p>
          </div>
        )}

        {/* Traders Carousel */}
        {!loading && !error && traders.length > 0 && (
          <div className="relative">
            <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <ChevronRight size={24} />
            </button>

            <div className="flex justify-center items-center gap-4 lg:gap-6 py-8 perspective-1200 overflow-hidden">
              {traders.map((trader, index) => {
                const offset = index - activeIndex;
                const isActive = index === activeIndex;
                const isVisible = Math.abs(offset) <= 2;
                if (!isVisible) return null;

                return (
                  <div
                    key={trader.id}
                    className={`trader-card card-dark p-6 transition-all duration-500 ${isActive ? 'scale-110 z-10 border-cyan-500/30 glow-cyan' : 'scale-90 opacity-60'}`}
                    style={{
                      transform: `translateX(${offset * 20}%) rotateY(${offset * -15}deg) ${isActive ? 'scale(1.1)' : 'scale(0.9)'}`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                      <Star size={14} className="text-black" fill="black" />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xl">
                        {trader.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{trader.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                          <span className={`w-2 h-2 rounded-full ${trader.isOnline ? 'bg-green-400' : 'bg-neutral-500'}`} />
                          {trader.isOnline ? '在线' : '离线'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-neutral-400 mb-1">胜率</p>
                        <p className="text-xl font-semibold text-cyan-400">{trader.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400 mb-1">总收益</p>
                        <p className="text-xl font-semibold text-cyan-400">+{trader.totalReturn}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400 mb-1">本月收益</p>
                        <p className="text-lg font-medium text-white">+{trader.monthlyReturn}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-400 mb-1">关注者</p>
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-neutral-400" />
                          <span className="text-lg font-medium text-white">{trader.followers.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <MiniChart data={trader.chartData} />
                    </div>

                    <button 
                      onClick={() => handleOpenModal(trader)}
                      className="w-full btn-outline text-sm py-2 flex items-center justify-center gap-2 hover:bg-cyan-500 hover:text-black transition-all"
                    >
                      <TrendingUp size={16} />
                      跟随交易
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {traders.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-cyan-400' : 'bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <CopyTradingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trader={selectedTrader}
      />
    </section>
  );
}
