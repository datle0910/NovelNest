import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchStories } from '../api/storyApi';
import { StorySummary } from '../types/story';
import { PageResponse } from '../types/api';
import StoryCard from '../components/StoryCard';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { Search, ArrowLeft } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const [pageData, setPageData] = useState<PageResponse<StorySummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!keyword) { setLoading(false); return; }
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await searchStories(keyword, pageParam, 18);
        setPageData(res.data);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Lỗi tìm kiếm');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [keyword, pageParam]);

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link to="/" className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all shrink-0 self-start">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Search className="w-6 h-6 text-brand-500" />
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Kết Quả Tìm Kiếm</h1>
                </div>
                <p className="text-slate-500">
                  {keyword ? (
                    <>Từ khóa: "<span className="font-bold text-slate-700">{keyword}</span>"</>
                  ) : 'Vui lòng nhập từ khóa tìm kiếm'}
                </p>
              </div>
            </div>
          </div>

          {!keyword ? (
            <div className="flex flex-col items-center py-16">
              <Search className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Nhập từ khóa vào ô tìm kiếm để bắt đầu.</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              <LoadingSkeleton type="card" count={10} />
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : !pageData || pageData.content.length === 0 ? (
            <EmptyState title="Không tìm thấy kết quả" description={`Không có truyện nào khớp với "${keyword}".`} actionLabel="Về trang chủ" onAction={() => window.location.href = '/'} icon={<Search className="w-16 h-16 text-slate-300" />} />
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {pageData.content.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
              {pageData.totalPages > 1 && (
                <div className="flex justify-center pt-6 border-t border-slate-200">
                  <Pagination currentPage={pageData.page} totalPages={pageData.totalPages} onPageChange={() => {}} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
