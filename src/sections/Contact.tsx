import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const contactInfo = [
  { icon: Mail, label: '邮箱', value: 'support@copytrading.com', href: 'mailto:support@copytrading.com' },
  { icon: Phone, label: '电话', value: '+86 400-123-4567', href: 'tel:+864001234567' },
  { icon: MapPin, label: '地址', value: '北京市朝阳区科技园区123号', href: '#' },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-title',
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

      const formFields = sectionRef.current?.querySelectorAll('.form-field');
      if (formFields) {
        gsap.fromTo(
          formFields,
          { x: -50, opacity: 0 },
          {
            x: 0,
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

      const contactCards = sectionRef.current?.querySelectorAll('.contact-card');
      if (contactCards) {
        gsap.fromTo(
          contactCards,
          { rotateY: -30, x: 50, opacity: 0 },
          {
            rotateY: 0,
            x: 0,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('感谢您的留言！我们会尽快回复您。');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="contact-title text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
            联系<span className="text-gradient">我们</span>
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">有问题？我们随时为您服务</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="form-field">
                <label className={`block text-sm mb-2 transition-colors ${focusedField === 'name' ? 'text-cyan-400' : 'text-neutral-500'}`}>
                  姓名
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="您的姓名"
                  required
                />
              </div>
              <div className="form-field">
                <label className={`block text-sm mb-2 transition-colors ${focusedField === 'email' ? 'text-cyan-400' : 'text-neutral-500'}`}>
                  邮箱
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className={`block text-sm mb-2 transition-colors ${focusedField === 'subject' ? 'text-cyan-400' : 'text-neutral-500'}`}>
                主题
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onFocus={() => setFocusedField('subject')}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="留言主题"
                required
              />
            </div>

            <div className="form-field">
              <label className={`block text-sm mb-2 transition-colors ${focusedField === 'message' ? 'text-cyan-400' : 'text-neutral-500'}`}>
                留言
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                placeholder="请输入您的留言..."
                required
              />
            </div>

            <button type="submit" className="form-field btn-primary w-full flex items-center justify-center gap-2">
              <Send size={18} />
              发送留言
            </button>
          </form>

          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.href}
                className="contact-card card-dark p-6 flex items-center gap-4 group hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <info.icon size={24} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{info.label}</p>
                  <p className="text-lg text-white group-hover:text-cyan-400 transition-colors">{info.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
