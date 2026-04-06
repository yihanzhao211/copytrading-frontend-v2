import { useEffect, useRef, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  { question: '什么是跟单交易？', answer: '跟单交易是一种投资策略，允许您自动复制经验丰富的交易员的交易操作。当您跟随一位交易员时，他们的每笔交易都会按比例自动复制到您的账户中。' },
  { question: '如何开始跟单交易员？', answer: '首先创建账户并完成身份验证，然后浏览我们的交易员列表，查看他们的历史业绩和风险指标。选择适合您风险偏好的交易员，设置投资金额，点击"跟随"即可开始。' },
  { question: '跟单交易有最低金额要求吗？', answer: '是的，最低跟单金额为100美元。这确保了有足够的资金来复制交易员的操作，同时分散风险。不同的交易员可能有不同的最低跟单要求。' },
  { question: '我可以随时停止跟单吗？', answer: '当然可以。您可以随时停止跟单任何交易员。停止跟单后，系统将不再复制该交易员的新交易，但您已持有的仓位将保留在您的账户中。' },
  { question: '你们如何保护我的资金？', answer: '我们采用机构级安全措施，包括冷存储、多重签名、SSL加密和定期安全审计。此外，我们提供风险管理工具，如止损和止盈设置，帮助您控制投资风险。' },
  { question: '我可以同时跟单多位交易员吗？', answer: '是的，您可以同时跟单多位交易员。基础版支持最多3位，专业版和企业版支持无限跟单。分散跟单可以帮助您分散风险，获得更稳定的收益。' },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.faq-title',
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

      const items = sectionRef.current?.querySelectorAll('.faq-item');
      if (items) {
        gsap.fromTo(
          items,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
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

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="faq-title text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
            常见<span className="text-gradient">问题</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">找不到答案？请随时联系我们的客服团队</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item card-dark overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left group"
              >
                <span className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors pr-4">
                  {faq.question}
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openIndex === index ? 'bg-cyan-500 text-black rotate-180' : 'bg-white/10 text-white'
                  }`}
                >
                  {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <p className="text-neutral-400 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
