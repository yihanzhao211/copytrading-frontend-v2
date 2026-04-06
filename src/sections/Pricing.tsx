import { useEffect, useRef, useState } from 'react';
import { Check, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  { name: '基础版', price: 9, description: '适合刚入门的交易者', features: ['最多跟单3位交易员', '基础分析', '邮件支持', '标准执行速度'], popular: false },
  { name: '专业版', price: 29, description: '适合活跃的交易者', features: ['无限跟单', '高级分析', '优先支持', '风险管理工具', '实时通知', 'API访问'], popular: true },
  { name: '企业版', price: 99, description: '适合专业团队', features: ['专业版全部功能', '专属客户经理', '自定义集成', '高级API访问', '白标解决方案', 'SLA保障'], popular: false },
];

function AnimatedPrice({ price }: { price: number }) {
  const [displayPrice, setDisplayPrice] = useState(0);
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
            val: price,
            duration: 1,
            ease: 'power2.out',
            onUpdate: function () {
              setDisplayPrice(Math.floor(this.targets()[0].val));
            },
          }
        );
      },
      once: true,
    });

    return () => trigger.kill();
  }, [price]);

  return <span ref={ref}>${displayPrice}</span>;
}

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pricing-title',
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

      const cards = sectionRef.current?.querySelectorAll('.pricing-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { rotateY: (i) => (i === 1 ? 0 : i === 0 ? 15 : -15), z: -200, opacity: 0 },
          {
            rotateY: (i) => (i === 1 ? 0 : i === 0 ? 5 : -5),
            z: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
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
    <section id="pricing" ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pricing-title text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
            简单透明的<span className="text-gradient">定价</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-8">选择适合您的计划，开始您的跟单交易之旅</p>

          <div className="inline-flex items-center gap-4 p-1 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-cyan-500 text-black' : 'text-white hover:text-cyan-400'}`}
            >
              月付
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-cyan-500 text-black' : 'text-white hover:text-cyan-400'}`}
            >
              年付
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">省20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 perspective-1200">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card relative card-dark p-8 transition-all duration-300 hover:-translate-y-2 ${plan.popular ? 'border-cyan-500/50 glow-cyan scale-105 z-10' : 'border-white/10'}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-cyan-500 text-black text-sm font-medium">
                    <Zap size={14} fill="currentColor" />
                    最受欢迎
                  </div>
                </div>
              )}

              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-neutral-500 mb-6">{plan.description}</p>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-bold text-white">
                    <AnimatedPrice price={billingCycle === 'yearly' ? Math.floor(plan.price * 0.8 * 12) : plan.price} />
                  </span>
                  <span className="text-neutral-500">/{billingCycle === 'yearly' ? '年' : '月'}</span>
                </div>
                {billingCycle === 'yearly' && <p className="text-sm text-green-400 mt-1">相当于 ${Math.floor(plan.price * 0.8)}/月</p>}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mt-0.5">
                      <Check size={12} className="text-cyan-400" />
                    </div>
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => alert(`您选择了${plan.name}方案\n\n价格：$${billingCycle === 'yearly' ? Math.floor(plan.price * 0.8 * 12) : plan.price}/${billingCycle === 'yearly' ? '年' : '月'}\n\n在实际应用中，这里将跳转到注册/支付页面。`)}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
              >
                开始使用
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
