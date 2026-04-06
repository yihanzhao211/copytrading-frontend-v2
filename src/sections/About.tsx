import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  '实时跟单技术',
  '高级风险管理',
  '透明表现追踪',
  '机构级安全',
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const contentElements = contentRef.current?.querySelectorAll('.animate-item');
      if (contentElements) {
        gsap.fromTo(
          contentElements,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              once: true,
            },
          }
        );
      }

      gsap.fromTo(
        imageRef.current,
        { rotateY: -30, x: 100, opacity: 0 },
        {
          rotateY: 0,
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            once: true,
          },
        }
      );

      gsap.to(imageRef.current, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div ref={contentRef} className="space-y-8">
            <div className="animate-item inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
              <span className="text-sm text-cyan-400 font-medium">关于我们</span>
            </div>

            <h2 className="animate-item text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">
              用智能工具
              <br />
              <span className="text-gradient">革新交易</span>
            </h2>

            <p className="animate-item text-lg text-neutral-400 leading-relaxed max-w-lg">
              我们结合尖端技术与专业交易专业知识，为每个人创造无缝的跟单交易体验。
              无论您是新手还是资深交易者，都能在这里找到适合自己的交易方式。
            </p>

            <div className="animate-item grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <Check size={14} className="text-cyan-400" />
                  </div>
                  <span className="text-neutral-300 group-hover:text-white transition-colors">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={imageRef} className="relative perspective-1200" style={{ transformStyle: 'preserve-3d' }}>
            <div className="relative">
              <div className="card-dark p-6 rounded-2xl">
                <div className="flex gap-4 mb-6">
                  <div className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">持仓</div>
                  <div className="px-4 py-2 rounded-lg text-neutral-400 text-sm">平仓</div>
                </div>
                <div className="space-y-4">
                  {[
                    { symbol: 'BTC', qty: 0.5, price: 43250, pnl: 1250 },
                    { symbol: 'ETH', qty: 5, price: 2580, pnl: -320 },
                    { symbol: 'SOL', qty: 100, price: 98.5, pnl: 580 },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white font-medium">{row.symbol}</span>
                      <span className="text-neutral-400">{row.qty}</span>
                      <span className="text-neutral-400">${row.price}</span>
                      <span className={row.pnl > 0 ? 'text-cyan-400' : 'text-red-400'}>
                        {row.pnl > 0 ? '+' : ''}{row.pnl}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-32 flex items-end gap-2">
                  {[30, 45, 35, 50, 40, 60, 55, 70, 65, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/50 to-cyan-500/20 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="absolute -inset-4 bg-cyan-500/10 rounded-3xl blur-2xl -z-10" />
              <div className="absolute -bottom-6 -left-6 card-dark p-4 rounded-xl border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">+</span>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white">156%</p>
                    <p className="text-sm text-neutral-500">平均年化收益</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
