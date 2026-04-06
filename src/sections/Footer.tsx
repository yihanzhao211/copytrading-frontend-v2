import { useEffect, useRef } from 'react';
import { Twitter, Linkedin, MessageCircle, Users } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  产品: ['功能', '定价', 'API'],
  公司: ['关于', '博客', '招聘'],
  支持: ['帮助中心', '联系我们', '状态'],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: MessageCircle, href: '#', label: 'Telegram' },
  { icon: Users, href: '#', label: 'Discord' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-content',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            once: true,
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="footer-content grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <span className="text-black font-bold text-lg">CT</span>
              </div>
              <span className="text-xl font-semibold text-white">Copy Trading</span>
            </div>
            <p className="text-neutral-400 mb-6 max-w-sm">
              用智能跟单技术革新您的交易体验。让专业交易员为您工作，轻松实现财富增长。
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:rotate-[10deg] transition-all duration-300"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-medium mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-neutral-400 hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">© 2024 Copy Trading. 保留所有权利。</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-neutral-500 hover:text-cyan-400 transition-colors">隐私政策</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-cyan-400 transition-colors">服务条款</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
