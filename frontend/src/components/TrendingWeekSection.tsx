import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Eye, Crown, BookOpen } from 'lucide-react';
import { StorySummary } from '../types/story';
import { formatViews } from '../utils/formatters';

interface Props {
  stories: StorySummary[];
  loading?: boolean;
}

const TrendingWeekCard: React.FC<{ story: StorySummary }> = ({ story }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/stories/${story.slug}`} className="group block w-full">
      <div className="flex flex-col w-full">
        <div className="aspect-[3/4] w-full relative overflow-hidden rounded-xl bg-app-surface border border-app-border shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
          {story.coverImage && !imgError ? (
            <img src={story.coverImage} alt={story.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              loading="lazy" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-app-surface to-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mb-1" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Top Left Badge: Views */}
          <div className="absolute top-2 left-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
              <Eye className="w-3 h-3 text-white/90" />
              <span className="text-[10px] font-bold text-white/90">{formatViews(story.viewCount)}</span>
            </div>
          </div>

          {/* Top Right Badge: Crown */}
          <div className="absolute top-2 right-2">
            <div className="bg-[#e49c18] rounded-full p-1 flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        <div className="pt-2 px-0.5">
          <h3 className="font-display font-semibold text-sm text-slate-800 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {story.title}
          </h3>
        </div>
      </div>
    </Link>
  );
};

const TrendingWeekSection: React.FC<Props> = ({ stories, loading }) => {
  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-app-text">Thịnh Hành Tuần</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-app-surface rounded-xl animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (!stories || stories.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-bold text-app-text">Thịnh Hành Tuần</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stories.map(story => (
          <TrendingWeekCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
};

export default TrendingWeekSection;
