import { useEffect, useRef, useState } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  { id: 1, content: '这个平台彻底改变了我的交易方式。我通过跟单顶级交易员获得了稳定的利润。作为一个新手，我学到了很多专业知识。', name: '张明', role: '初级交易员', rating: 5 },
  { id: 2, content: '实时同步功能令人难以置信。我从未错过任何交易机会。风险管理工具也让我能够安心投资。', name: '李华', role: '投资爱好者', rating: 5 },
  { id: 3, content: '风险管理工具让我完全掌控。我可以在睡觉时安心赚钱。强烈推荐给所有想要进入加密货币市场的人。', name: '王芳', role: '全职妈妈', rating: 5 },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.testimonials-title',
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
        '.testimonial-card',
        { rotateY: -45, z: -300, opacity: 0 },
        {
          rotateY: 0,
          z: 0,
          opacity: 1,
          duration: 0.8,
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
  }, []);

  const handlePrev = () => setActiveIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1));
  const handleNext = () => setActiveIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="testimonials-title text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
            用户怎么<span className="text-gradient">说</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">听听我们的用户如何评价这个平台</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-20 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 z-20 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <ChevronRight size={24} />
          </button>

          <div className="perspective-1200 overflow-hidden">
            <div className="relative h-[400px]">
              {testimonials.map((testimonial, index) => {
                const offset = index - activeIndex;
                const isActive = index === activeIndex;

                return (
                  <div
                    key={testimonial.id}
                    className={`testimonial-card absolute inset-0 card-dark p-8 lg:p-12 transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                    style={{
                      transform: `translateX(${offset * 20}%) rotateY(${offset * -15}deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center animate-float">
                      <Quote size={32} className="text-cyan-400" />
                    </div>

                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={20} className="text-yellow-400" fill="currentColor" />
                      ))}
                    </div>

                    <p className="text-xl lg:text-2xl text-white leading-relaxed mb-8">"{testimonial.content}"</p>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xl">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                        <p className="text-neutral-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-cyan-400' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
