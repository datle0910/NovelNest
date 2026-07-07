import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Eye, User, FileText, PlayCircle, List, Star, Hash } from 'lucide-react';
import { getStoryDetail, getStoryChapters } from '../api/storyApi';
import { StoryDetail } from '../types/story';
import { ChapterSummary } from '../types/chapter';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import ChapterList from '../components/ChapterList';
import FavoriteButton from '../components/FavoriteButton';
import RatingBox from '../components/RatingBox';
import CommentList from '../components/CommentList';
import { getStoryHistory } from '../api/readingHistoryApi';
import { useAuthStore } from '../store/authStore';
import { ReadingHistoryResponse } from '../types/readingHistory';

const StoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ReadingHistoryResponse | null>(null);
  const [imgError, setImgError] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const [storyRes, chaptersRes] = await Promise.all([
          getStoryDetail(slug),
          getStoryChapters(slug)
        ]);
        setStory(storyRes.data);
        setChapters(chaptersRes.data);

        if (isAuthenticated && storyRes.data) {
          try {
            const histRes = await getStoryHistory(storyRes.data.id);
            setHistory(histRes.data);
          } catch (e) { /* No history */ }
        }

        setError('');
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug, isAuthenticated]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen pb-16 pt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSkeleton type="detail" />
        </div>
      </div>
    );
  }
  if (error) return <div className="bg-slate-50 min-h-screen pt-6"><div className="max-w-6xl mx-auto px-4"><ErrorMessage message={error} /></div></div>;
  if (!story) return <div className="bg-slate-50 min-h-screen pt-6"><div className="max-w-6xl mx-auto px-4"><ErrorMessage message="Không tìm thấy truyện" /></div></div>;

  const firstChapter = chapters.length > 0 ? chapters[0] : null;

  const statusConfig: Record<string, { label: string; badgeClass: string; dotClass: string }> = {
    ONGOING: { label: 'Đang ra', badgeClass: 'from-green-500 to-emerald-500', dotClass: 'bg-green-400' },
    COMPLETED: { label: 'Hoàn thành', badgeClass: 'from-blue-500 to-cyan-500', dotClass: 'bg-blue-400' },
    PAUSED: { label: 'Tạm dừng', badgeClass: 'from-amber-500 to-orange-500', dotClass: 'bg-amber-400' },
  };
  const status = statusConfig[story.status] || statusConfig.ONGOING;

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-6 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Info Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="shrink-0 w-48 md:w-56 mx-auto md:mx-0">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100">
                {story.coverImage && !imgError ? (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <BookOpen className="w-12 h-12 text-slate-300 mb-2" />
                    <span className="text-xs font-bold text-slate-300 tracking-widest">NOVELNEST</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-slate-900 leading-tight">
                  {story.title}
                </h1>
                <FavoriteButton storyId={story.id} />
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${status.badgeClass} shadow-sm`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass} animate-pulse`} />
                  {status.label}
                </span>
                {story.categories.map((cat, idx) => (
                  <Link key={idx} to={`/categories/${cat}`} className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 border border-slate-200 transition-colors flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {cat}
                  </Link>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <User className="w-4 h-4 text-brand-500" /> Tác giả
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate">{story.author?.name || 'Vô danh'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <FileText className="w-4 h-4 text-accent-500" /> Chương
                  </p>
                  <p className="text-sm font-bold text-slate-800">{story.totalChapters}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Eye className="w-4 h-4 text-cyan-500" /> Lượt xem
                  </p>
                  <p className="text-sm font-bold text-slate-800">{story.viewCount.toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {firstChapter ? (
                  <Link
                    to={`/stories/${story.slug}/chapters/${firstChapter.chapterNumber}`}
                    className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" /> Đọc Ngay
                  </Link>
                ) : (
                  <button disabled className="bg-slate-100 text-slate-400 border border-slate-200 px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed">
                    Chưa có chương
                  </button>
                )}
                {history && (
                  <Link
                    to={`/stories/${story.slug}/chapters/${history.chapterNumber}`}
                    className="bg-white border border-slate-200 hover:border-brand-200 hover:text-brand-600 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" /> Đọc Tiếp Chương {history.chapterNumber}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left */}
          <div className="xl:col-span-8 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="p-2 bg-brand-50 rounded-lg">
                  <List className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-lg font-display font-bold text-slate-800">Tóm Tắt</h2>
              </div>
              <div
                className="text-sm text-slate-600 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: story.description || 'Chưa có mô tả chi tiết.' }}
              />
            </div>

            {/* Chapters */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="p-2 bg-accent-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-lg font-display font-bold text-slate-800">Danh Sách Chương</h2>
              </div>
              <ChapterList chapters={chapters} storySlug={story.slug} />
            </div>
          </div>

          {/* Right */}
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-lg font-display font-bold text-slate-800">Đánh Giá</h2>
              </div>
              <RatingBox storyId={story.id} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <CommentList storyId={story.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailPage;
