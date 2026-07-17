import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { advancedSearchStories } from '../api/storyApi';
import { StorySummary } from '../types/story';
import { PageResponse } from '../types/api';
import StoryCard from '../components/StoryCard';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import TristateCategoryFilter from '../components/TristateCategoryFilter';
import { Search, ArrowLeft, SlidersHorizontal } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const [pageData, setPageData] = useState<PageResponse<StorySummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Tri-state category filter state
  const [includeCategoryIds, setIncludeCategoryIds] = useState<number[]>([]);
  const [excludeCategoryIds, setExcludeCategoryIds] = useState<number[]>([]);

  const hasActiveFilters = includeCategoryIds.length > 0 || excludeCategoryIds.length > 0;

  const handleCategoryChange = useCallback((incIds: number[], excIds: number[]) => {
    setIncludeCategoryIds(incIds);
    setExcludeCategoryIds(excIds);
    // Reset to page 0 when filters change to avoid empty page results
    const params = new URLSearchParams(searchParams);
    params.set('page', '0');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        if (hasActiveFilters || keyword) {
          // Use advanced search when category filters are active OR keyword is provided
          const res = await advancedSearchStories({
            keyword: keyword || undefined,
            includeCategoryIds: includeCategoryIds.length > 0 ? includeCategoryIds : undefined,
            excludeCategoryIds: excludeCategoryIds.length > 0 ? excludeCategoryIds : undefined,
          }, pageParam, 18);
          setPageData(res.data);
        } else {
          // No keyword and no filters: show nothing
          setPageData(null);
        }
        setError('');
      } catch (err: any) {
        setError(err.message || 'Lỗi tìm kiếm');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [keyword, pageParam, includeCategoryIds, excludeCategoryIds]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 animate-fade-in">
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
                  ) : hasActiveFilters ? (
                    'Đang lọc theo thể loại'
                  ) : (
                    'Vui lòng nhập từ khóa hoặc sử dụng bộ lọc thể loại'
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                  showFilter || hasActiveFilters
                    ? 'bg-brand-50 text-brand-600 border-brand-200 shadow-sm'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Bộ lọc
                {hasActiveFilters && (
                  <span className="bg-brand-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                    {includeCategoryIds.length + excludeCategoryIds.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Filter Panel */}
          {showFilter && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-in">
              <TristateCategoryFilter onChange={handleCategoryChange} />
            </div>
          )}

          {/* Results */}
          {!keyword && !hasActiveFilters ? (
            <div className="flex flex-col items-center py-16">
              <Search className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Nhập từ khóa vào ô tìm kiếm hoặc sử dụng <strong>Bộ lọc</strong> thể loại để bắt đầu.</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              <LoadingSkeleton type="card" count={10} />
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : !pageData || pageData.content.length === 0 ? (
            <EmptyState
              title="Không tìm thấy kết quả"
              description={keyword ? `Không có truyện nào khớp với "${keyword}" và bộ lọc hiện tại.` : 'Không có truyện nào khớp với bộ lọc thể loại hiện tại.'}
              actionLabel="Về trang chủ"
              onAction={() => window.location.href = '/'}
              icon={<Search className="w-16 h-16 text-slate-300" />}
            />
          ) : (
            <div className="space-y-10">
              <p className="text-sm text-slate-500 font-medium">
                Tìm thấy <strong className="text-slate-700">{pageData.totalElements}</strong> kết quả
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {pageData.content.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
              {pageData.totalPages > 1 && (
                <div className="flex justify-center pt-6 border-t border-slate-200">
                  <Pagination currentPage={pageData.page} totalPages={pageData.totalPages} onPageChange={handlePageChange} />
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
