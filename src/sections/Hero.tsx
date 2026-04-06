import { useEffect, useRef } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current?.querySelectorAll('.word') || [],
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'expo.out',
          delay: 0.3,
        }
      );

      gsap.fromTo(
        descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.7 }
      );

      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.9 }
      );

      gsap.fromTo(
        cardRef.current,
        { rotateY: -30, rotateX: 15, z: -200, opacity: 0 },
        {
          rotateY: 0,
          rotateX: 0,
          z: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'expo.out',
          delay: 0.4,
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden bg-black">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm text-cyan-400 font-medium">加密货币跟单交易</span>
            </div>

            <h1 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-white leading-tight">
              <span className="word inline-block">像专业人士</span>
              <br />
              <span className="word inline-block">一样交易，</span>
              <br />
              <span className="word inline-block text-gradient">无需经验</span>
            </h1>

            <p ref={descRef} className="text-lg text-neutral-400 max-w-xl leading-relaxed">
              实时关注并复制顶级加密货币交易员。让专家为您交易，同时您学习技巧。
              通过智能跟单技术，轻松实现财富增长。
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <button 
                onClick={() => document.querySelector('#traders')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary flex items-center gap-2 group"
              >
                开始跟单
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => document.querySelector('#traders')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline"
              >
                查看交易员
              </button>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-neutral-800 to-neutral-600 flex items-center justify-center">
                    <Users size={16} className="text-neutral-400" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-medium">50,000+</p>
                <p className="text-sm text-neutral-500">全球交易者的信赖</p>
              </div>
            </div>
          </div>

          <div className="perspective-1200 flex justify-center lg:justify-end">
            <div ref={cardRef} className="relative preserve-3d animate-float" style={{ transformStyle: 'preserve-3d' }}>
              <div className="relative w-full max-w-md">
                <div className="card-dark p-6 rounded-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xl">
                      A
                    </div>
                    <div>
                      <p className="text-white font-semibold">交易员A</p>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        在线
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-neutral-400">总利润</p>
                      <p className="text-3xl font-bold text-cyan-400">+12.5%</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400">本月利润</p>
                      <p className="text-2xl font-bold text-white">+8.3%</p>
                    </div>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {[40, 60, 45, 70, 55, 80, 65, 75, 60, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-cyan-500/30 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="absolute -inset-4 bg-cyan-500/20 rounded-3xl blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
