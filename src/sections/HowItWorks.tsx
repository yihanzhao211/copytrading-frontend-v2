import { useEffect, useRef } from 'react';
import { UserPlus, Search, Settings, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon: UserPlus, number: '01', title: '创建账户', description: '注册并验证您的身份，开启您的跟单交易之旅' },
  { icon: Search, number: '02', title: '选择交易员', description: '浏览并选择表现最佳的交易员，查看他们的历史业绩' },
  { icon: Settings, number: '03', title: '设置您的跟单', description: '自定义您的风险管理偏好，设置投资金额和止损点' },
  { icon: TrendingUp, number: '04', title: '开始赚钱', description: '自动复制所选交易员的交易，轻松获取收益' },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.how-title',
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

      gsap.fromTo(
        '.timeline-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 70%',
            once: true,
          },
        }
      );

      const steps = timelineRef.current?.querySelectorAll('.step-item');
      if (steps) {
        gsap.fromTo(
          steps,
          { x: (i) => (i % 2 === 0 ? -100 : 100), opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 60%',
              once: true,
            },
          }
        );
      }

      const nodes = timelineRef.current?.querySelectorAll('.step-node');
      if (nodes) {
        gsap.fromTo(
          nodes,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.4,
            stagger: 0.2,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 60%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="how-title text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
            开始只需<span className="text-gradient">几分钟</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">简单四步，即可开始您的智能跟单交易之旅</p>
        </div>

        <div ref={timelineRef} className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden lg:block">
            <div className="timeline-line absolute inset-0 bg-gradient-to-b from-cyan-500/50 via-cyan-500/30 to-transparent origin-top" />
          </div>

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div key={index} className={`step-item relative lg:grid lg:grid-cols-2 lg:gap-8 ${index % 2 === 0 ? '' : 'lg:direction-rtl'}`}>
                <div className={`${index % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:text-left lg:pl-16 lg:col-start-2'}`}>
                  <div className={`card-dark p-6 lg:p-8 inline-block w-full lg:w-auto ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                    <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <step.icon size={24} className="text-cyan-400" />
                      </div>
                      <span className="text-4xl font-bold text-cyan-400/30">{step.number}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-neutral-400">{step.description}</p>
                  </div>
                </div>

                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="step-node relative">
                    <div className="w-4 h-4 rounded-full bg-cyan-400" />
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-cyan-400 animate-ping opacity-50" />
                    <div className="absolute -inset-4 rounded-full border border-cyan-400/30" />
                  </div>
                </div>

                <div className={index % 2 === 0 ? 'lg:col-start-2' : 'hidden'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
