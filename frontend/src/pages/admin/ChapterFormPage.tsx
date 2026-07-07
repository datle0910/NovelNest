import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createChapter, updateChapter } from '../../api/adminChapterApi';
import { getChapterDetail } from '../../api/storyApi';
import ErrorMessage from '../../components/ErrorMessage';

const ChapterFormPage: React.FC = () => {
  const { storyId, id } = useParams<{ storyId: string; id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { storyId?: string; storySlug?: string; chapterNumber?: number } | null;

  const [title, setTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number | ''>('');
  const [content, setContent] = useState('');
  
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchChapterData = async () => {
        try {
          if (state && state.storySlug && state.chapterNumber) {
            const res = await getChapterDetail(state.storySlug, state.chapterNumber);
            setTitle(res.data.chapterTitle);
            setChapterNumber(res.data.chapterNumber);
            setContent(res.data.content);
          } else {
            setError('Không thể lấy dữ liệu chương do thiếu thông tin slug. Vui lòng quay lại danh sách chương và thử lại.');
          }
        } catch (err: any) {
          setError(err.message || 'Lỗi tải dữ liệu chương');
        } finally {
          setLoading(false);
        }
      };
      fetchChapterData();
    }
  }, [isEdit, state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !chapterNumber || !content) {
      setError('Vui lòng nhập đầy đủ Tên chương, Số chương và Nội dung.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title,
      chapterNumber: Number(chapterNumber),
      content
    };

    try {
      if (isEdit) {
        await updateChapter(parseInt(id!), payload);
        navigate(`/admin/stories/${state?.storyId}/chapters`);
      } else {
        await createChapter(parseInt(storyId!), payload);
        navigate(`/admin/stories/${storyId}/chapters`);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu chương');
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = isEdit && state?.storyId 
    ? `/admin/stories/${state.storyId}/chapters` 
    : storyId 
    ? `/admin/stories/${storyId}/chapters` 
    : '/admin/stories';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-card p-6 h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-white/5 pb-5">
        <Link to={backLink} className="p-2 rounded-xl bg-surface-elevated border border-white/10 text-text-secondary hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            {isEdit ? 'Sửa Nội Dung Chương' : 'Thêm Chương Mới'}
          </h1>
          <p className="text-xs text-text-muted font-semibold mt-1">Cập nhật số thứ tự chương, tên tiêu đề chương và nội dung truyện.</p>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <ErrorMessage message={error} />}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-text-muted mb-1.5">Số chương *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="VD: 1, 2, 3..."
                value={chapterNumber}
                onChange={e => setChapterNumber(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 text-white font-medium transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-text-muted mb-1.5">Tên chương *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="VD: Khởi đầu mới..."
                className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 text-white font-medium transition-all placeholder:text-text-muted/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-muted mb-1.5">Nội dung chương *</label>
            <textarea
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={16}
              className="w-full bg-surface-base/50 border border-white/10 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 text-text-primary resize-y font-serif text-base leading-relaxed placeholder:text-text-muted/50"
              placeholder="Nhập hoặc dán nội dung chữ của chương truyện tại đây..."
            />
          </div>

          <div className="pt-5 border-t border-white/5 flex justify-end gap-3">
            <Link 
              to={backLink} 
              className="px-6 py-2.5 rounded-xl bg-surface-elevated text-text-secondary border border-white/10 hover:bg-white/10 transition-all font-bold text-sm"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {submitting ? 'Đang lưu...' : 'Lưu Chương'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterFormPage;
