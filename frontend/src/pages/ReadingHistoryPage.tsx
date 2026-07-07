import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, PlayCircle, Calendar } from 'lucide-react';
import { getUserHistory } from '../api/readingHistoryApi';
import { ReadingHistoryResponse } from '../types/readingHistory';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const ReadingHistoryPage: React.FC = () => {
  const [histories, setHistories] = useState<ReadingHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [failedCovers, setFailedCovers] = useState<Record<number, boolean>>({});

  const fetchHistory = async (currentPage: number) => {
    try {
      setLoading(true);
      const res = await getUserHistory(currentPage, 12);
      setHistories(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch reading history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(page); }, [page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const handleImageError = (id: number) => setFailedCovers(prev => ({ ...prev, [id]: true }));

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl text-white shrink-0 shadow-sm">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Lịch Sử Đọc</h1>
                <p className="text-slate-500 mt-1">Tiếp tục cuộc hành trình dang dở của bạn.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <LoadingSkeleton type="list" count={6} />
            </div>
          ) : histories.length === 0 ? (
            <EmptyState title="Lịch sử trống" description="Bạn chưa đọc tác phẩm nào gần đây." actionLabel="Khám Phá Ngay" onAction={() => window.location.href = '/stories'} icon={<Clock className="w-16 h-16 text-slate-300" />} />
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {histories.map(h => (
                  <div key={h.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4 items-center hover:shadow-md transition-all duration-300 group">
                    <Link to={`/stories/${h.storySlug}`} className="shrink-0 w-16 h-22 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                      {h.coverImage && !failedCovers[h.id] ? (
                        <img src={h.coverImage} alt={h.storyTitle} onError={() => handleImageError(h.id)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-white" />
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/stories/${h.storySlug}`} className="block font-display font-semibold text-sm text-slate-800 hover:text-brand-600 line-clamp-2 transition-colors leading-snug">
                        {h.storyTitle}
                      </Link>
                      <div className="text-xs font-medium text-brand-600 mt-1.5 bg-brand-50 inline-block px-2 py-0.5 rounded-md">
                        Chương {h.chapterNumber}: {h.chapterTitle}
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(h.lastReadAt)}
                        </span>
                        <Link to={`/stories/${h.storySlug}/chapters/${h.chapterNumber}`}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                          Đọc tiếp <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
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

export default ReadingHistoryPage;
