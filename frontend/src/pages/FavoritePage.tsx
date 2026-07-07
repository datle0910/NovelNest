import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { getUserFavorites } from '../api/favoriteApi';
import { StorySummary } from '../types/story';
import StoryCard from '../components/StoryCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const FavoritePage: React.FC = () => {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchFavorites = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await getUserFavorites(currentPage, 12);
      setStories(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch favorite stories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(page); }, [page]);

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl text-white shrink-0 shadow-sm">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800 flex items-center gap-2">
                  Truyện Yêu Thích <Sparkles className="w-5 h-5 text-rose-500" />
                </h1>
                <p className="text-slate-500 mt-1">Bộ sưu tập những tác phẩm bạn tâm đắc nhất.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              <LoadingSkeleton type="card" count={10} />
            </div>
          ) : stories.length === 0 ? (
            <EmptyState title="Danh sách trống" description="Bạn chưa thêm truyện yêu thích nào." actionLabel="Khám Phá Truyện" onAction={() => window.location.href = '/stories'} icon={<Heart className="w-16 h-16 text-slate-300" />} />
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {stories.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center pt-6 border-t border-slate-200">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritePage;
