import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllStories } from '../api/storyApi';
import { StorySummary } from '../types/story';
import { PageResponse } from '../types/api';
import StoryCard from '../components/StoryCard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { BookOpen, Filter } from 'lucide-react';

const StoryListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const sortParam = searchParams.get('sort') || 'updatedAt,desc';
  
  const [pageData, setPageData] = useState<PageResponse<StorySummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const res = await getAllStories(pageParam, 24, sortParam);
        setPageData(res.data);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
    window.scrollTo(0, 0);
  }, [pageParam, sortParam]);

  const handlePageChange = (p: number) => {
    setSearchParams(prev => {
      prev.set('page', p.toString());
      return prev;
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 animate-fade-in">
          
          {/* Header and Filter */}
          <div className="bg-white rounded-xl border border-app-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              Bộ lọc
            </button>
          </div>

          {/* Title Bar */}
          <div className="bg-white rounded-xl border border-app-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <h1 className="text-lg font-bold text-slate-800">
                Tất cả truyện <span className="text-sm font-normal text-slate-500">({pageData?.totalElements || 0} truyện)</span>
              </h1>
            </div>
            <button className="text-sm text-slate-500 hover:text-brand-600">
              Không tìm thấy? Vote ngay &rsaquo;
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-xl border border-app-border p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex bg-app-surface rounded-xl border border-app-border h-24 p-3 gap-3 animate-pulse">
                    <div className="w-14 h-full rounded-lg bg-slate-200"></div>
                    <div className="flex-1 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && <ErrorMessage message={error} />}

          {/* Empty */}
          {!loading && !error && pageData && pageData.content.length === 0 && (
            <div className="bg-white rounded-xl border border-app-border p-10">
              <EmptyState title="Không tìm thấy truyện" description="Chưa có truyện nào phù hợp với tiêu chí của bạn." icon={<BookOpen className="w-16 h-16 text-slate-300" />} />
            </div>
          )}

          {/* Grid */}
          {!loading && !error && pageData && pageData.content.length > 0 && (
            <div className="bg-white rounded-xl border border-app-border p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pageData.content.map(s => <StoryCard key={s.id} story={s} variant="horizontal" />)}
              </div>
              <div className="flex justify-center pt-8 mt-6 border-t border-slate-100">
                <Pagination currentPage={pageData.page} totalPages={pageData.totalPages} onPageChange={handlePageChange} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryListPage;
