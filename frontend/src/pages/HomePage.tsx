import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Star, BookOpen } from 'lucide-react';
import { getCategories } from '../api/categoryApi';
import { getStories, getTrendingWeekly, getTopTrending, getTopViewsMonthly } from '../api/storyApi';
import { StorySummary } from '../types/story';
import { Category } from '../types/category';
import StoryCard from '../components/StoryCard';
import HeroCarousel from '../components/HeroCarousel';
import TrendingWeekSection from '../components/TrendingWeekSection';
import TopList from '../components/TopList';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const HomePage: React.FC = () => {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [trendingWeekly, setTrendingWeekly] = useState<StorySummary[]>([]);
  const [topTrending, setTopTrending] = useState<StorySummary[]>([]);
  const [topViewsMonthly, setTopViewsMonthly] = useState<StorySummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storiesRes, categoriesRes, weekRes, topRes, monthRes] = await Promise.all([
          getStories(0, 18),
          getCategories(),
          getTrendingWeekly(12),
          getTopTrending(6),
          getTopViewsMonthly(6)
        ]);
        setStories(storiesRes.data?.content || []);
        setCategories(categoriesRes.data || []);
        setTrendingWeekly(weekRes.data?.content || []);
        setTopTrending(topRes.data?.content || []);
        setTopViewsMonthly(monthRes.data?.content || []);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topStories = stories.slice(0, 5);
  const updatedStories = stories.slice(0, 12);
  const editorPicks = stories.slice(5, 11);

  return (
    <div className="animate-fade-in">
      <HeroCarousel stories={topStories} loading={loading && stories.length === 0} />

      <div className="bg-slate-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories Pills */}
          {categories.length > 0 && (
            <section className="py-10 -mt-6 relative z-20">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Thể loại:</span>
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.slug}`}
                    className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all shadow-sm"
                  >
                    {cat.name}
                  </Link>
                ))}
                {categories.length > 8 && (
                  <Link to="/stories" className="px-4 py-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-all flex items-center gap-1">
                    Xem thêm <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </section>
          )}

          {error && <div className="mb-8"><ErrorMessage message={error} /></div>}

          {/* Trending Week Section */}
          <TrendingWeekSection stories={trendingWeekly} loading={loading} />

          {/* Top Lists Section (Top Thịnh Hành & Top View Tháng) */}
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TopList 
                title="Top Thịnh Hành" 
                icon={<TrendingUp className="w-5 h-5 text-[#f43f5e]" />} 
                stories={topTrending} 
                viewAllLink="/stories?sort=ratingAvg,desc"
                loading={loading}
              />
              <TopList 
                title="Top View Tháng" 
                icon={<Star className="w-5 h-5 text-[#e49c18]" />} 
                stories={topViewsMonthly} 
                viewAllLink="/stories?sort=viewCountMonth,desc"
                loading={loading}
              />
            </div>
          </section>

          {/* Loading */}
          {loading && (
            <>
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-app-text">Mới Cập Nhật</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex bg-app-card rounded-xl border border-app-border h-24 p-3 gap-3">
                      <div className="w-14 h-full rounded-lg bg-app-surface animate-pulse shrink-0"></div>
                      <div className="flex-1 flex flex-col justify-center gap-2">
                        <div className="h-4 w-11/12 bg-app-surface rounded animate-pulse"></div>
                        <div className="h-3 w-3/5 bg-app-surface rounded animate-pulse"></div>
                        <div className="h-3 w-2/5 bg-app-surface rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-app-text">Biên Tập Viên Đề Cử</h2>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-32 shrink-0">
                      <div className="aspect-[3/4] bg-app-surface rounded-xl animate-pulse mb-3"></div>
                      <div className="h-4 w-full bg-app-surface rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-3/5 bg-app-surface rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Error */}
          {error && !loading && <ErrorMessage message={error} />}

          {/* Empty */}
          {!loading && !error && stories.length === 0 && (
            <EmptyState
              title="Chưa có truyện"
              description="Hệ thống chưa có tác phẩm nào. Vui lòng quay lại sau!"
              icon={<BookOpen className="w-12 h-12" />}
            />
          )}

          {/* Content */}
          {!loading && !error && stories.length > 0 && (
            <>
              {/* Mới Cập Nhật */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-app-text">Mới Cập Nhật</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {updatedStories.map((story, idx) => (
                    <div key={story.id} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                      <StoryCard story={story} variant="horizontal" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link to="/stories"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm">
                    Xem thêm <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </section>

              {/* Biên Tập Viên Đề Cử */}
              {editorPicks.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                        <Star className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-bold text-app-text">Biên Tập Viên Đề Cử</h2>
                    </div>
                  </div>
                  <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
                    {editorPicks.map((story) => (
                      <Link key={story.id} to={`/stories/${story.slug}`} className="w-32 shrink-0 group">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-app-surface border border-app-border mb-3 shadow-sm group-hover:shadow-md transition-all">
                          {story.coverImage ? (
                            <img src={story.coverImage} alt={story.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-app-surface to-slate-200">
                              <BookOpen className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
                          {story.title}
                        </h3>
                        <p className="text-xs text-slate-500 truncate mt-1">{story.authorName || 'Đang cập nhật'}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
