import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, BookOpen, Star } from 'lucide-react';
import { StorySummary } from '../types/story';

interface HeroCarouselProps {
  stories: StorySummary[];
  loading?: boolean;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ stories, loading = false }) => {
  const [current, setCurrent] = useState(0);
  const featured = stories.slice(0, 5);
  const total = featured.length;

  const goTo = useCallback((idx: number) => setCurrent(((idx % total) + total) % total), [total]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, total]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="relative w-full h-[480px] md:h-[580px] lg:h-[630px] bg-slate-900 overflow-hidden">
        <div className="absolute inset-0" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center pt-16">
          <div className="flex items-center gap-10 w-full">
            <div className="flex-1 space-y-5">
              <div className="h-8 w-40 skeleton rounded-lg opacity-30" />
              <div className="h-12 w-3/4 skeleton rounded-lg opacity-30" />
              <div className="h-5 w-1/3 skeleton rounded-lg opacity-30" />
              <div className="h-16 w-2/3 skeleton rounded-lg opacity-30" />
              <div className="h-12 w-36 skeleton rounded-full opacity-30" />
            </div>
            <div className="hidden lg:block shrink-0">
              <div className="w-[260px] aspect-[3/4] skeleton rounded-2xl opacity-30" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback hero
  if (total === 0) {
    return (
      <section className="relative w-full h-[480px] md:h-[580px] lg:h-[630px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-500 rounded-full blur-[120px]" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center pt-16">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-5">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-3 tracking-tight">NovelNest</h1>
          <p className="text-base text-slate-300 max-w-lg leading-relaxed">Nền tảng đọc truyện chữ trực tuyến — miễn phí, mượt mà, không quảng cáo.</p>
          <Link to="/stories" className="mt-6 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg">
            Khám Phá Ngay
          </Link>
        </div>
      </section>
    );
  }

  const story = featured[current];
  const bgImage = story.coverImage;

  return (
    <section className="relative w-full h-[480px] md:h-[580px] lg:h-[630px] overflow-hidden bg-slate-900">
      {/* Background */}
      {bgImage && (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/75 to-slate-900/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-app-bg to-transparent z-10" />

      {/* Decorative glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-brand-500/10 blur-[100px]" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center z-20 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left: Text */}
          <div className="lg:col-span-7 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> Truyện Nổi Bật
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-3 line-clamp-3">
              {story.title}
            </h1>

            <p className="text-brand-300 text-sm md:text-base font-medium mb-1">
              {story.authorName || 'Đang cập nhật'}
            </p>

            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-6 max-w-lg">
              {story.description || 'Mô tả truyện đang được cập nhật...'}
            </p>

            <Link to={`/stories/${story.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25">
              <Play className="w-5 h-5 fill-white" /> Đọc Ngay
            </Link>

            {total > 1 && (
              <div className="flex items-center gap-3 mt-6">
                <button onClick={prev} className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-white/60">
                  <span className="text-white text-base">{String(current + 1).padStart(2, '0')}</span>
                  <span className="mx-1">/</span>
                  {String(total).padStart(2, '0')}
                </span>
                <button onClick={next} className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Cover */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-3xl scale-110" />
              {bgImage ? (
                <img src={bgImage} alt={story.title}
                  className="w-[220px] md:w-[260px] aspect-[3/4] object-cover rounded-2xl shadow-2xl shadow-black/50 border border-white/10 relative z-10"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-[260px] aspect-[3/4] rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center relative z-10">
                  <BookOpen className="w-16 h-16 text-slate-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {total > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {featured.map((_, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === current ? 'w-8 bg-brand-500' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
