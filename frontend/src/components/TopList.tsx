import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Crown, Star, BookOpen } from 'lucide-react';
import { StorySummary } from '../types/story';
import { formatViews, formatRating } from '../utils/formatters';

interface Props {
  title: string;
  icon: React.ReactNode;
  stories: StorySummary[];
  viewAllLink: string;
  loading?: boolean;
}

const TopStoryItem: React.FC<{ story: StorySummary; rank: number }> = ({ story, rank }) => {
  const [imgError, setImgError] = useState(false);

  const isTop1 = rank === 1;

  if (isTop1) {
    return (
      <Link to={`/stories/${story.slug}`} className="group relative block w-full rounded-2xl overflow-hidden mb-4 bg-app-surface border border-app-border">
        {/* Background Blur */}
        <div className="absolute inset-0 z-0">
          {story.coverImage && !imgError ? (
            <img src={story.coverImage} alt="" className="w-full h-full object-cover opacity-50 blur-xl scale-110" />
          ) : (
            <div className="w-full h-full bg-slate-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40" />
        </div>

        <div className="relative z-10 p-5 flex gap-4">
          <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden shrink-0 shadow-lg border border-white/10 relative">
            {story.coverImage && !imgError ? (
              <img src={story.coverImage} alt={story.title} onError={() => setImgError(true)} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <BookOpen className="w-6 h-6 text-slate-500" />
              </div>
            )}
            
            {/* Rank Badge */}
            <div className="absolute top-0 left-0 bg-[#f43f5e] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg z-20 flex items-center gap-0.5">
              #{rank}
            </div>
            
            {/* Crown Icon */}
            <div className="absolute top-1 right-1 bg-[#e49c18] rounded-full p-0.5 z-20">
               <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center text-white">
            <h3 className="text-lg font-bold font-display leading-tight mb-1.5 line-clamp-2 group-hover:text-brand-300 transition-colors">
              {story.title}
            </h3>
            <p className="text-xs text-white/70 mb-2 truncate">
              {story.authorName || 'Đang cập nhật'}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-white/80">
              <span className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded backdrop-blur-sm">
                {formatRating(story.ratingAvg)} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </span>
              <span>{formatViews(story.viewCount)} views</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/stories/${story.slug}`} className="group flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="w-12 aspect-[3/4] rounded shadow-sm overflow-hidden shrink-0 relative">
        {story.coverImage && !imgError ? (
          <img src={story.coverImage} alt={story.title} onError={() => setImgError(true)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
        )}
        
        {/* Rank Badge */}
        <div className="absolute top-0 left-0 bg-[#e49c18] text-white text-[9px] font-bold px-1 py-0.5 rounded-br z-20 flex items-center gap-0.5">
          {rank}
        </div>
        
        {/* Crown Icon */}
        <div className="absolute top-0.5 right-0.5 bg-[#e49c18] rounded-full p-0.5 z-20">
           <Crown className="w-2 h-2 text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="font-semibold text-slate-800 text-sm mb-1 truncate group-hover:text-brand-600 transition-colors">
          {story.title}
        </h4>
        <p className="text-xs text-slate-500 truncate mb-1">
          {story.authorName || 'Đang cập nhật'}
        </p>
        <p className="text-xs text-slate-400 truncate line-clamp-1">
          {story.description || 'Chưa có mô tả'}
        </p>
      </div>
      
      <div className="flex flex-col items-end justify-center shrink-0">
        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
          {formatRating(story.ratingAvg)} <Star className="w-3 h-3 text-amber-400" />
        </div>
        <div className="text-xs font-semibold text-slate-700 mt-1">
          {formatViews(story.viewCount)}
        </div>
      </div>
    </Link>
  );
};

const TopList: React.FC<Props> = ({ title, icon, stories, viewAllLink, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-app-border p-5 h-full">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-bold text-app-text">{title}</h2>
          </div>
        </div>
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-32 bg-app-surface rounded-2xl"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3">
              <div className="w-12 aspect-[3/4] bg-app-surface rounded"></div>
              <div className="flex-1 py-1">
                <div className="h-4 bg-app-surface rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-app-surface rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stories || stories.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-app-border p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-bold text-app-text">{title}</h2>
        </div>
        <Link to={viewAllLink} className="text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors flex items-center">
          Xem tất cả <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        {stories.map((story, idx) => (
          <TopStoryItem key={story.id} story={story} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
};

export default TopList;
