import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { getCategories } from '../../api/categoryApi';
import { getAuthors } from '../../api/authorApi';
import { getStories } from '../../api/storyApi';
import { createStory, updateStory } from '../../api/adminStoryApi';
import { generateStoryCover } from '../../api/adminStoryApi';
import { uploadCover } from '../../api/mediaApi';
import { Category } from '../../types/category';
import { Author } from '../../types/author';
import ErrorMessage from '../../components/ErrorMessage';

const StoryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [status, setStatus] = useState('ONGOING');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [catRes, authRes] = await Promise.all([
          getCategories(),
          getAuthors()
        ]);
        setCategories(catRes.data);
        setAuthors(authRes.data);

        if (isEdit) {
          const storiesRes = await getStories(0, 100);
          const story = storiesRes.data.content.find((s: any) => s.id.toString() === id);
          if (story) {
            setTitle(story.title);
            setDescription(story.description || '');
            setCoverImage(story.coverImage || '');
            setStatus(story.status);
            
            const author = authRes.data.find(a => a.name === story.authorName);
            if (author) setAuthorId(author.id.toString());
            
            const selectedCatIds = story.categories.map((catName: string) => {
              const cat = catRes.data.find(c => c.name === catName);
              return cat ? cat.id.toString() : '';
            }).filter(Boolean);
            setCategoryIds(selectedCatIds);
          } else {
            setError('Không tìm thấy truyện để sửa.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !authorId || categoryIds.length === 0) {
      setError('Vui lòng nhập đầy đủ Tên truyện, Tác giả và ít nhất 1 Thể loại.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title,
      description,
      coverImage: coverImage || null,
      authorId: parseInt(authorId),
      status,
      categoryIds: categoryIds.map(cid => parseInt(cid))
    };

    try {
      if (isEdit) {
        await updateStory(parseInt(id!), payload);
      } else {
        await createStory(payload);
      }
      navigate('/admin/stories');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu truyện');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryChange = (catId: string) => {
    if (categoryIds.includes(catId)) {
      setCategoryIds(categoryIds.filter(id => id !== catId));
    } else {
      setCategoryIds([...categoryIds, catId]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh định dạng JPEG, PNG, WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Dung lượng file không được vượt quá 5MB.');
      return;
    }

    setUploadingImage(true);
    setError('');
    try {
      const res = await uploadCover(file);
      setCoverImage(res.data.url);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploadingImage(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleGenerateAiCover = async () => {
    if (!id) return;
    setGeneratingAi(true);
    setError('');
    try {
      const res = await generateStoryCover(parseInt(id));
      if (res.data && res.data.coverImage) {
        setCoverImage(res.data.coverImage);
      } else {
        setError('Tạo ảnh thành công nhưng không lấy được link ảnh trả về.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo ảnh AI');
    } finally {
      setGeneratingAi(false);
    }
  };

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
        <Link to="/admin/stories" className="p-2 rounded-xl bg-surface-elevated border border-white/10 text-text-secondary hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            {isEdit ? 'Sửa Thông Tin Truyện' : 'Thêm Truyện Mới'}
          </h1>
          <p className="text-xs text-text-muted font-semibold mt-1">Cập nhật nội dung mô tả, ảnh bìa và phân loại thể loại cho tác phẩm.</p>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <ErrorMessage message={error} />}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-1.5">Tên truyện *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên truyện..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 text-white font-medium transition-all placeholder:text-text-muted/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-muted mb-1.5">Tác giả *</label>
                <select
                  required
                  value={authorId}
                  onChange={e => setAuthorId(e.target.value)}
                  className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 text-white font-medium transition-all"
                >
                  <option value="">-- Chọn tác giả --</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-muted mb-1.5">Trạng thái</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 text-white font-medium transition-all"
                >
                  <option value="ONGOING">Đang ra</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="PAUSED">Tạm ngưng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-muted mb-1.5">Ảnh bìa</label>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-brand-500/50 bg-surface-base/50 text-text-secondary hover:text-brand-400 text-sm font-bold transition-all cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Chọn ảnh từ máy
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/webp"
                          onChange={handleFileUpload}
                          disabled={uploadingImage || generatingAi}
                          className="hidden"
                        />
                      </label>
                      
                      {isEdit && (
                        <button
                          type="button"
                          onClick={handleGenerateAiCover}
                          disabled={uploadingImage || generatingAi}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-amber-500/50 bg-amber-500/10 text-amber-500 hover:text-amber-400 text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
                          title="Tạo ảnh bìa tự động bằng AI (dựa vào Tên và Mô tả truyện)"
                        >
                          <span>✨ Tạo Ảnh AI</span>
                        </button>
                      )}
                    </div>
                    
                    {(uploadingImage || generatingAi) && (
                      <div className="flex items-center gap-2 text-xs text-brand-400 font-semibold mt-1">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                        {generatingAi ? 'AI đang vẽ ảnh (khoảng 10-15s)...' : 'Đang tải lên...'}
                      </div>
                    )}
                    
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-text-muted font-bold uppercase tracking-wider">URL:</span>
                      <input
                        type="url"
                        value={coverImage}
                        onChange={e => setCoverImage(e.target.value)}
                        placeholder="Nhập đường dẫn URL ảnh bìa..."
                        className="w-full bg-surface-base/50 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 text-white font-medium transition-all placeholder:text-text-muted/50"
                      />
                    </div>
                  </div>

                  {coverImage && (
                    <div className="p-3 bg-surface-elevated/50 rounded-xl border border-white/5 flex items-start gap-4">
                      <img 
                        src={coverImage} 
                        alt="Preview" 
                        className="w-16 h-22 object-cover rounded-lg shadow border border-white/5 shrink-0" 
                        onError={(e) => { 
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} 
                      />
                      <div>
                        <span className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1">Preview ảnh bìa</span>
                        <p className="text-xs text-text-muted line-clamp-2 break-all">{coverImage}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-muted mb-1.5">Thể loại *</label>
                <div className="bg-surface-base/50 border border-white/10 rounded-xl p-4 h-48 overflow-y-auto space-y-2">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 py-1 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(cat.id.toString())}
                        onChange={() => handleCategoryChange(cat.id.toString())}
                        className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                      />
                      <span className="text-text-secondary text-sm font-semibold group-hover:text-white transition-colors">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-muted mb-1.5">Mô tả truyện</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Nhập nội dung giới thiệu truyện..."
                  rows={6}
                  className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 text-white font-medium transition-all resize-none placeholder:text-text-muted/50"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-white/5 flex justify-end gap-3">
            <Link 
              to="/admin/stories" 
              className="px-6 py-2.5 rounded-xl bg-surface-elevated text-text-secondary border border-white/10 hover:bg-white/10 transition-all font-bold text-sm"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {submitting ? 'Đang lưu...' : 'Lưu Truyện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryFormPage;
