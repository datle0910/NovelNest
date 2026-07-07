import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Eye } from 'lucide-react';
import { StorySummary } from '../types/story';

interface StoryCardProps {
  story: StorySummary;
  variant?: 'vertical' | 'horizontal';
}

const StoryCard: React.FC<StoryCardProps> = ({ story, variant = 'vertical' }) => {
  const [imgError, setImgError] = useState(false);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}k`;
    return views.toString();
  };

  const statusConfig: Record<string, { label: string; dot: string }> = {
    ONGOING: { label: 'Đang ra', dot: 'bg-green-400' },
    COMPLETED: { label: 'Hoàn thành', dot: 'bg-blue-400' },
    PAUSED: { label: 'Tạm ngưng', dot: 'bg-amber-400' },
  };
  const status = statusConfig[story.status] || statusConfig.ONGOING;

  if (variant === 'horizontal') {
    return (
      <Link to={`/stories/${story.slug}`} className="flex bg-white rounded-xl border border-app-border h-24 p-3 gap-3 hover:shadow-md hover:border-brand-200 transition-all group">
        <div className="w-14 h-full rounded-lg overflow-hidden bg-app-surface shrink-0">
          {story.coverImage && !imgError ? (
            <img src={story.coverImage} alt={story.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-app-surface to-slate-200">
              <BookOpen className="w-5 h-5 text-slate-300" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center min-w-0 gap-0.5">
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {story.title}
          </h3>
          <p className="text-xs text-slate-500 truncate">{story.authorName || 'Đang cập nhật'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
              story.status === 'ONGOING' ? 'bg-green-50 text-green-600' :
              story.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <span className={`w-1 h-1 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {formatViews(story.viewCount)}
            </span>
            {story.totalChapters > 0 && (
              <span className="text-[10px] text-slate-400">{story.totalChapters} chương</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Vertical variant (default)
  return (
    <Link to={`/stories/${story.slug}`} className="group block w-full">
      <div className="flex flex-col w-full">
        <div className="aspect-[3/4] w-full relative overflow-hidden rounded-xl bg-app-surface border border-app-border shadow-sm group-hover:shadow-md transition-all duration-300">
          {story.coverImage && !imgError ? (
            <img src={story.coverImage} alt={story.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              loading="lazy" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-app-surface to-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mb-1" />
              <span className="text-[8px] font-bold text-slate-300 tracking-widest">NOVELNEST</span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="absolute top-2 left-2">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/15">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className="text-[10px] font-bold text-white">{status.label}</span>
            </div>
          </div>

          <div className="absolute top-2 right-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
              <Eye className="w-3 h-3 text-white/70" />
              <span className="text-[10px] font-bold text-white/70">{formatViews(story.viewCount)}</span>
            </div>
          </div>
        </div>

        <div className="pt-2.5 px-0.5">
          <h3 className="font-display font-semibold text-sm text-slate-800 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {story.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 truncate">{story.authorName || 'Đang cập nhật'}</span>
            {story.totalChapters > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                <span className="text-xs text-slate-400 shrink-0">{story.totalChapters} chương</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoryCard;
