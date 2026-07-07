import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { getStories, getStoryChapters } from '../../api/storyApi';
import { deleteChapter } from '../../api/adminChapterApi';
import { ChapterSummary } from '../../types/chapter';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import Pagination from '../../components/Pagination';

const ChapterManagementPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [storySlug, setStorySlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number, title: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  const fetchChapters = async (slug: string) => {
    try {
      const res = await getStoryChapters(slug);
      setChapters(res.data);
      setCurrentPage(0);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách chương');
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const storiesRes = await getStories(0, 100);
        const story = storiesRes.data.content.find((s: any) => s.id.toString() === storyId);
        if (story) {
          setStoryTitle(story.title);
          setStorySlug(story.slug);
          await fetchChapters(story.slug);
        } else {
          setError('Không tìm thấy truyện');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi tải dữ liệu truyện');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [storyId]);

  const handleDeleteClick = (id: number, title: string) => {
    setDeleteTarget({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteChapter(deleteTarget.id);
      setDeleteTarget(null);
      if (storySlug) fetchChapters(storySlug);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa chương');
    }
  };

  const totalPages = Math.ceil(chapters.length / itemsPerPage);
  const currentChapters = chapters.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-4">
          <Link to="/admin/stories" className="p-2 rounded-xl bg-surface-elevated border border-white/10 text-text-secondary hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Quản Lý Chương</h1>
            <p className="text-xs text-text-muted font-semibold mt-1">Truyện: <span className="text-brand-400 font-bold">"{storyTitle}"</span></p>
          </div>
        </div>
        <Link 
          to={`/admin/stories/${storyId}/chapters/create`} 
          className="inline-flex items-center justify-center bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/25 gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Thêm Chương Mới
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="glass-card p-6">
          <LoadingSkeleton type="table" count={5} />
        </div>
      ) : chapters.length === 0 ? (
        <EmptyState
          title="Chưa có chương nào"
          description="Truyện này hiện tại chưa được đăng tải chương nào."
          icon={<BookOpen className="w-10 h-10 text-text-muted" />}
          actionLabel="Tạo Chương Đầu Tiên"
          onAction={() => navigate(`/admin/stories/${storyId}/chapters/create`)}
        />
      ) : (
        <div className="space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary border-collapse">
                <thead className="text-xs uppercase bg-surface-base/50 border-b border-white/5 text-text-muted font-bold">
                  <tr>
                    <th className="px-6 py-4">Số chương</th>
                    <th className="px-6 py-4">Tên chương</th>
                    <th className="px-6 py-4">Lượt xem</th>
                    <th className="px-6 py-4">Cập nhật</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentChapters.map((chapter) => (
                    <tr key={chapter.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">Chương {chapter.chapterNumber}</td>
                      <td className="px-6 py-4 font-semibold text-white">{chapter.title}</td>
                      <td className="px-6 py-4 font-medium">{chapter.viewCount.toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-text-muted" />
                          {formatDate(chapter.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <Link 
                            to={`/admin/chapters/edit/${chapter.id}`}
                            state={{ storyId, storySlug, chapterNumber: chapter.chapterNumber }}
                            title="Sửa chương" 
                            className="p-1.5 hover:bg-white/5 text-text-muted hover:text-brand-400 rounded-lg transition-colors border border-transparent hover:border-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(chapter.id, chapter.title)}
                            title="Xóa chương"
                            className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={(page) => setCurrentPage(page)}
                variant="dark"
              />
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Xóa Chương Truyện"
          message={`Bạn có chắc chắn muốn xóa chương "${deleteTarget.title}" không? Hành động này không thể khôi phục.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmLabel="Xóa vĩnh viễn"
          cancelLabel="Hủy bỏ"
          isDangerous={true}
        />
      )}
    </div>
  );
};

export default ChapterManagementPage;
