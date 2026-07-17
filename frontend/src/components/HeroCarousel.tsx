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
      <section className="relative w-full min-h-[520px] lg:h-[630px] bg-slate-900 overflow-hidden">
        <div className="absolute inset-0" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center pt-16 md:pt-20 pb-16 md:pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full">
            
            {/* Mobile Skeleton Cover */}
            <div className="flex lg:hidden justify-center mb-2">
              <div className="w-[140px] aspect-[3/4] skeleton rounded-2xl opacity-20" />
            </div>

            <div className="lg:col-span-7 flex flex-col items-center lg:items-start space-y-4 lg:space-y-5 w-full">
              <div className="h-6 w-32 skeleton rounded-full opacity-20" />
              <div className="h-10 lg:h-12 w-full lg:w-3/4 skeleton rounded-lg opacity-20" />
              <div className="h-4 lg:h-5 w-1/2 lg:w-1/3 skeleton rounded-lg opacity-20" />
              <div className="hidden lg:block h-16 w-2/3 skeleton rounded-lg opacity-20" />
              <div className="h-12 w-full sm:w-36 skeleton rounded-xl opacity-20 mt-4" />
            </div>

            {/* Desktop Skeleton Cover */}
            <div className="hidden lg:flex lg:col-span-5 justify-center shrink-0">
              <div className="w-[240px] xl:w-[280px] aspect-[3/4] skeleton rounded-2xl opacity-20" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback hero
  if (total === 0) {
    return (
      <section className="relative w-full min-h-[520px] lg:h-[630px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-500 rounded-full blur-[120px]" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center pt-16 pb-16 lg:pb-0">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-5">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-3 tracking-tight">NovelNest</h1>
          <p className="text-base text-slate-300 max-w-lg leading-relaxed px-4">Nền tảng đọc truyện chữ trực tuyến — miễn phí, mượt mà, không quảng cáo.</p>
          <Link to="/stories" className="mt-6 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg">
            Khám Phá Ngay
          </Link>
        </div>
      </section>
    );
  }

  const story = featured[current];
  const bgImage = story.coverImage;

  return (
    <section className="relative w-full min-h-[520px] lg:h-[630px] overflow-hidden bg-slate-900">
      {/* Background */}
      {bgImage && (
        <div className="absolute inset-0 overflow-hidden">
          <img src={bgImage} alt="" className="w-full h-full object-cover opacity-40 blur-[80px] scale-110"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900" />
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-app-bg to-transparent z-10" />

      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-brand-500/10 blur-[100px]" />
      <div className="absolute bottom-0 left-[-10%] w-[300px] h-[300px] rounded-full bg-accent-500/10 blur-[100px]" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center z-20 pt-16 md:pt-20 pb-16 md:pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full">
          
          {/* Mobile Cover (Only visible on small screens) */}
          <div className="flex lg:hidden justify-center mb-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-500/30 rounded-2xl blur-2xl scale-105" />
              {bgImage ? (
                <img src={bgImage} alt={story.title}
                  className="w-[140px] md:w-[180px] aspect-[3/4] object-cover rounded-2xl shadow-2xl shadow-black/60 border border-white/10 relative z-10"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-[140px] aspect-[3/4] rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center relative z-10">
                  <BookOpen className="w-10 h-10 text-slate-600" />
                </div>
              )}
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 sm:mb-5">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" /> Truyện Nổi Bật
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight mb-2 sm:mb-3 line-clamp-2 lg:line-clamp-3 px-2 lg:px-0">
              {story.title}
            </h1>

            <p className="text-brand-300 text-xs sm:text-sm md:text-base font-medium mb-3 lg:mb-4">
              {story.authorName || 'Đang cập nhật'}
            </p>

            <p className="hidden md:block text-slate-400 text-sm lg:text-base leading-relaxed line-clamp-2 mb-6 max-w-lg">
              {story.description || 'Mô tả truyện đang được cập nhật...'}
            </p>

            <Link to={`/stories/${story.slug}`}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/30">
              <Play className="w-5 h-5 fill-white" /> Đọc Ngay
            </Link>

            {/* Desktop Navigation Arrows */}
            {total > 1 && (
              <div className="hidden lg:flex items-center gap-3 mt-8">
                <button onClick={prev} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer backdrop-blur-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-white/50">
                  <span className="text-white text-base">{String(current + 1).padStart(2, '0')}</span>
                  <span className="mx-1">/</span>
                  {String(total).padStart(2, '0')}
                </span>
                <button onClick={next} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer backdrop-blur-sm">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop Cover */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-500/20 rounded-2xl blur-3xl scale-110 transition-transform duration-700 group-hover:scale-125 group-hover:bg-brand-500/30" />
              {bgImage ? (
                <img src={bgImage} alt={story.title}
                  className="w-[240px] xl:w-[280px] aspect-[3/4] object-cover rounded-2xl shadow-2xl shadow-black/60 border border-white/10 relative z-10 transition-transform duration-500 group-hover:-translate-y-2"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-[240px] xl:w-[280px] aspect-[3/4] rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center relative z-10">
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
