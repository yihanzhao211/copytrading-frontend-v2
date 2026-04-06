import { useEffect, useRef, useState } from 'react';
import { Users, Wallet, TrendingUp, Globe, Headphones } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Users, value: 50000, suffix: '+', label: '活跃用户' },
  { icon: Wallet, value: 2.5, suffix: 'B', prefix: '$', label: '管理资产', isDecimal: true },
  { icon: TrendingUp, value: 98, suffix: '%', label: '成功率' },
  { icon: Globe, value: 150, suffix: '+', label: '覆盖国家' },
  { icon: Headphones, value: 24, suffix: '/7', label: '全天候支持' },
];

function AnimatedNumber({ value, prefix = '', suffix = '', isDecimal = false }: {
  value: number;
  prefix?: string;
  suffix?: string;
  isDecimal?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(
          { val: 0 },
          {
            val: value,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              setDisplayValue(this.targets()[0].val);
            },
          }
        );
      },
      once: true,
    });

    return () => trigger.kill();
  }, [value]);

  const formattedValue = isDecimal
    ? displayValue.toFixed(1)
    : Math.floor(displayValue).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.stat-card');
      if (!cards) return;

      gsap.fromTo(
        cards,
        { x: -100, rotateY: 45, opacity: 0 },
        {
          x: 0,
          rotateY: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={cardsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card card-dark p-6 lg:p-8 text-center group hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 mb-4 group-hover:bg-cyan-500/20 transition-colors">
                <stat.icon size={24} />
              </div>
              <div className="text-2xl lg:text-3xl font-semibold text-white mb-1">
                <AnimatedNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  isDecimal={stat.isDecimal}
                />
              </div>
              <div className="text-sm text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
