import { useEffect, useRef } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const articles = [
  { id: 1, title: '2024年加密货币交易趋势', excerpt: '探索今年最重要的加密货币交易趋势，包括DeFi、NFT和机构投资的最新发展。', date: '2024年3月15日', category: '市场分析', featured: true },
  { id: 2, title: '风险管理初学者指南', excerpt: '学习如何有效管理交易风险，保护您的投资资本。', date: '2024年3月10日', category: '风险管理', featured: false },
  { id: 3, title: '如何选择合适的交易员跟单', excerpt: '了解评估交易员的关键指标，做出明智的跟单决策。', date: '2024年3月5日', category: '跟单策略', featured: false },
  { id: 4, title: '了解交易中的技术分析', excerpt: '掌握技术分析的基础知识，提升您的交易技能。', date: '2024年2月28日', category: '技术分析', featured: false },
];

export default function Blog() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.blog-title',
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

      const cards = sectionRef.current?.querySelectorAll('.blog-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const featuredArticle = articles.find((a) => a.featured);
  const otherArticles = articles.filter((a) => !a.featured);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="blog-title flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-4">
              最新<span className="text-gradient">洞察</span>
            </h2>
            <p className="text-lg text-neutral-400 max-w-xl">获取最新的市场分析和交易策略</p>
          </div>
          <button 
            onClick={() => alert('博客列表页面\n\n在实际应用中，这里将显示所有博客文章。')}
            className="btn-outline flex items-center gap-2 self-start"
          >
            查看全部
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {featuredArticle && (
            <div className="blog-card group lg:row-span-3">
              <div className="card-dark h-full overflow-hidden">
                <div className="relative h-64 lg:h-80 overflow-hidden bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-cyan-500 text-black text-sm font-medium">
                      {featuredArticle.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                    <Calendar size={14} />
                    {featuredArticle.date}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-neutral-400 mb-4">{featuredArticle.excerpt}</p>
                  <button 
                    onClick={() => alert(`文章详情：${featuredArticle.title}\n\n在实际应用中，这里将显示完整的博客文章内容。`)}
                    className="flex items-center gap-2 text-cyan-400 font-medium group/btn"
                  >
                    阅读更多
                    <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {otherArticles.map((article) => (
              <div key={article.id} className="blog-card card-dark overflow-hidden group">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-xs text-cyan-400 font-medium">{article.category}</span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {article.date}
                      </span>
                    </div>
                    <h3 
                      onClick={() => alert(`文章详情：${article.title}`)}
                      className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {article.title}
                    </h3>
                    <p className="text-sm text-neutral-400 line-clamp-2">{article.excerpt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
