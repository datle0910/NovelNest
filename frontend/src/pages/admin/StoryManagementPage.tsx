import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, List, BookOpen } from 'lucide-react';
import { getAdminStories, deleteStory, toggleStoryDisplay } from '../../api/adminStoryApi';
import { StorySummary } from '../../types/story';
import { PageResponse } from '../../types/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';

const StoryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [pageData, setPageData] = useState<PageResponse<StorySummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number, title: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await getAdminStories(pageParam, 10);
      setPageData(res.data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách truyện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [pageParam]);

  const handleDeleteClick = (id: number, title: string) => {
    setDeleteTarget({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStory(deleteTarget.id);
      setDeleteTarget(null);
      fetchStories();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa truyện');
    }
  };

  const handleToggleDisplay = async (story: StorySummary) => {
    try {
      setUpdatingId(story.id);
      const newDisplayState = !story.display;
      await toggleStoryDisplay(story.id, newDisplayState);
      
      // Update local state to reflect change instantly
      if (pageData) {
        const newContent = pageData.content.map(s => 
          s.id === story.id ? { ...s, display: newDisplayState } : s
        );
        setPageData({ ...pageData, content: newContent });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái hiển thị');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  const statusBadge = (status: string) => {
    const config: Record<string, string> = {
      ONGOING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return config[status] || config.ONGOING;
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = { ONGOING: 'Đang ra', COMPLETED: 'Hoàn thành', PAUSED: 'Tạm ngưng' };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 rounded-xl border border-brand-500/20">
            <BookOpen className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Quản Lý Truyện</h1>
            <p className="text-xs text-text-muted font-semibold mt-1">Tạo mới, sửa thông tin truyện và xem danh sách chương.</p>
          </div>
        </div>
        <Link 
          to="/admin/stories/create" 
          className="inline-flex items-center justify-center bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/25 gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Thêm Truyện Mới
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="glass-card p-6">
          <LoadingSkeleton type="table" count={5} />
        </div>
      ) : !pageData || pageData.content.length === 0 ? (
        <EmptyState
          title="Không tìm thấy truyện nào"
          description="Hiện tại hệ thống chưa có truyện nào được khởi tạo."
          icon={<BookOpen className="w-10 h-10 text-text-muted" />}
          actionLabel="Tạo Truyện Đầu Tiên"
          onAction={() => navigate('/admin/stories/create')}
        />
      ) : (
        <div className="space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary border-collapse">
                <thead className="text-xs uppercase bg-surface-base/50 border-b border-white/5 text-text-muted font-bold">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Truyện</th>
                    <th className="px-6 py-4">Tác giả</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Hiển thị</th>
                    <th className="px-6 py-4">Chương</th>
                    <th className="px-6 py-4">Lượt xem</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pageData.content.map((story) => (
                    <tr key={story.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{story.id}</td>
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          {story.coverImage ? (
                            <img 
                              src={story.coverImage} 
                              alt="" 
                              className="w-10 h-14 object-cover rounded-lg shadow border border-white/5 shrink-0" 
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-14 bg-surface-elevated flex items-center justify-center rounded-lg border border-white/5 shrink-0">
                              <BookOpen className="w-5 h-5 text-text-muted opacity-60" />
                            </div>
                          )}
                          <span className="line-clamp-2">{story.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{story.authorName || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${statusBadge(story.status)}`}>
                          {statusLabel(story.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <label className={`relative inline-flex items-center ${updatingId === story.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`} title={story.display ? 'Đang hiển thị' : 'Đang ẩn'}>
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={story.display}
                            onChange={() => handleToggleDisplay(story)}
                            disabled={updatingId === story.id}
                          />
                          <div className="w-9 h-5 bg-surface-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500 peer-checked:after:bg-white border border-white/10"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{story.totalChapters}</td>
                      <td className="px-6 py-4 font-medium">{story.viewCount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <Link 
                            to={`/admin/stories/${story.id}/chapters`} 
                            title="Quản lý chương"
                            className="p-1.5 hover:bg-white/5 text-text-muted hover:text-brand-400 rounded-lg transition-colors border border-transparent hover:border-white/10"
                          >
                            <List className="w-4 h-4" />
                          </Link>
                          <Link 
                            to={`/admin/stories/edit/${story.id}`}
                            title="Sửa truyện" 
                            className="p-1.5 hover:bg-white/5 text-text-muted hover:text-brand-400 rounded-lg transition-colors border border-transparent hover:border-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(story.id, story.title)}
                            title="Xóa truyện"
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

          <div className="flex justify-center pt-2">
            <Pagination 
              currentPage={pageData.page} 
              totalPages={pageData.totalPages} 
              onPageChange={handlePageChange}
              variant="dark"
            />
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Xóa Truyện"
          message={`Bạn có chắc chắn muốn xóa truyện "${deleteTarget.title}" không? Hành động này sẽ xóa vĩnh viễn truyện và tất cả các chương thuộc truyện này. Dữ liệu không thể khôi phục.`}
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

export default StoryManagementPage;
