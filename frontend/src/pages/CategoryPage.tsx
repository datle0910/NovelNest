import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getStoriesByCategory } from '../api/storyApi';
import { getCategories } from '../api/categoryApi';
import { StorySummary } from '../types/story';
import { PageResponse } from '../types/api';
import { Category } from '../types/category';
import StoryCard from '../components/StoryCard';
import Pagination from '../components/Pagination';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { Tags, ArrowLeft } from 'lucide-react';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const [pageData, setPageData] = useState<PageResponse<StorySummary> | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categorySlug) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storiesRes, categoriesRes] = await Promise.all([
          getStoriesByCategory(categorySlug, pageParam, 18),
          getCategories()
        ]);
        setPageData(storiesRes.data);
        setAllCategories(categoriesRes.data);
        const found = categoriesRes.data.find(c => c.slug === categorySlug);
        setCategory(found || null);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Lỗi tải danh sách');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [categorySlug, pageParam]);

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link to="/stories" className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all shrink-0 self-start">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Tags className="w-6 h-6 text-brand-500" />
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">
                    {category?.name || 'Danh mục'}
                  </h1>
                </div>
                <p className="text-slate-500">
                  {category?.description || `Truyện thuộc thể loại ${category?.name || categorySlug}`}
                </p>
              </div>
            </div>
          </div>

          {/* Category tabs */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allCategories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    cat.slug === categorySlug
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-200 hover:text-brand-600'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              <LoadingSkeleton type="card" count={10} />
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : !pageData || pageData.content.length === 0 ? (
            <EmptyState title="Danh mục trống" description={`Chưa có truyện nào trong thể loại "${category?.name || categorySlug}".`} icon={<Tags className="w-16 h-16 text-slate-300" />} />
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {pageData.content.map(s => <StoryCard key={s.id} story={s} />)}
              </div>
              {pageData.totalPages > 1 && (
                <div className="flex justify-center pt-6 border-t border-slate-200">
                  <Pagination currentPage={pageData.page} totalPages={pageData.totalPages} onPageChange={(p) => setSearchParams({ page: p.toString() })} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
