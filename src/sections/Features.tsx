import { useEffect, useRef } from 'react';
import { Zap, Shield, BarChart3, MessageCircle, Smartphone, Lock } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Zap, title: '实时同步', description: '毫秒级交易执行，确保您不会错过任何交易机会' },
  { icon: Shield, title: '风险管理', description: '可定制止损和止盈水平，全面保护您的投资' },
  { icon: BarChart3, title: '表现分析', description: '跟单活动的详细洞察，助您做出明智决策' },
  { icon: MessageCircle, title: '社交交易', description: '与交易员社区互动，分享经验和策略' },
  { icon: Smartphone, title: '移动应用', description: '随时随地交易，掌握市场动态' },
  { icon: Lock, title: '安全保障', description: '机构级安全措施，保护您的资产安全' },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.features-title',
        { y: 40, opacity: 0 },
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

      const cards = gridRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { scale: 0, rotate: -10 },
          {
            scale: 1,
            rotate: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 70%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="features-title text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
            强大<span className="text-gradient">功能</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">我们提供全方位的交易工具，助您在加密货币市场中获得成功</p>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card card-dark p-8 group hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 group-hover:rotate-[360deg] transition-all duration-500">
                <feature.icon size={28} className="text-cyan-400" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.description}</p>

              <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
