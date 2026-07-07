import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Check, X, Plus, Users } from 'lucide-react';
import { getAuthors } from '../../api/authorApi';
import { createAuthor, updateAuthor, deleteAuthor } from '../../api/adminAuthorApi';
import { Author } from '../../types/author';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';

const AuthorManagementPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number, name: string } | null>(null);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await getAuthors();
      setAuthors(res.data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách tác giả');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setFormVisible(true);
    setError('');
  };

  const openEditForm = (auth: Author) => {
    setEditingId(auth.id);
    setName(auth.name);
    setDescription(auth.description || '');
    setFormVisible(true);
    setError('');
  };

  const closeForm = () => {
    setFormVisible(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setSubmitting(true);
    try {
      if (editingId) {
        await updateAuthor(editingId, { name, description });
      } else {
        await createAuthor({ name, description });
      }
      await fetchAuthors();
      closeForm();
    } catch (err: any) {
      setError(err.message || 'Lỗi lưu tác giả');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAuthor(deleteTarget.id);
      setDeleteTarget(null);
      fetchAuthors();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa tác giả');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 rounded-xl border border-brand-500/20">
            <Users className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Quản Lý Tác Giả</h1>
            <p className="text-xs text-text-muted font-semibold mt-1">Tạo mới, sửa thông tin giới thiệu cho các tác giả.</p>
          </div>
        </div>
        {!formVisible && (
          <button 
            onClick={openAddForm}
            className="inline-flex items-center justify-center bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/25 gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Tác Giả
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {formVisible && (
        <div className="glass-card p-5 border-brand-500/20">
          <h3 className="text-sm font-bold text-white mb-3">
            {editingId ? 'Sửa thông tin tác giả' : 'Tạo tác giả mới'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Tên tác giả *</label>
              <input
                type="text"
                required
                placeholder="Nhập tên tác giả..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all placeholder:text-text-muted/50"
              />
            </div>
            <div className="flex-[2] w-full">
              <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Giới thiệu tác giả</label>
              <input
                type="text"
                placeholder="Nhập mô tả giới thiệu hoặc tiểu sử của tác giả..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all placeholder:text-text-muted/50"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white px-5 py-2.5 rounded-xl flex items-center gap-1.5 font-bold text-sm transition-all shadow-lg shadow-brand-500/25 disabled:opacity-50 flex-1 md:flex-none justify-center cursor-pointer"
              >
                <Check className="w-4 h-4" /> Lưu lại
              </button>
              <button 
                type="button" 
                onClick={closeForm}
                className="bg-surface-elevated text-text-secondary hover:text-white border border-white/10 px-5 py-2.5 rounded-xl flex items-center gap-1.5 font-bold text-sm transition-all flex-1 md:flex-none justify-center cursor-pointer"
              >
                <X className="w-4 h-4" /> Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="glass-card p-6">
          <LoadingSkeleton type="table" count={5} />
        </div>
      ) : authors.length === 0 ? (
        <EmptyState
          title="Không tìm thấy tác giả nào"
          description="Hiện tại hệ thống chưa có tác giả nào."
          icon={<Users className="w-10 h-10 text-text-muted" />}
          actionLabel="Tạo Tác Giả Đầu Tiên"
          onAction={openAddForm}
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary border-collapse">
              <thead className="text-xs uppercase bg-surface-base/50 border-b border-white/5 text-text-muted font-bold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tên</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Giới thiệu</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {authors.map((auth) => (
                  <tr key={auth.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{auth.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{auth.name}</td>
                    <td className="px-6 py-4 font-medium text-text-muted">{auth.slug}</td>
                    <td className="px-6 py-4 font-medium max-w-xs truncate">{auth.description || 'Chưa có giới thiệu'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => openEditForm(auth)}
                          title="Sửa tác giả"
                          className="p-1.5 hover:bg-white/5 text-text-muted hover:text-brand-400 rounded-lg transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(auth.id, auth.name)}
                          title="Xóa tác giả"
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
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Xóa Tác Giả"
          message={`Bạn có chắc chắn muốn xóa tác giả "${deleteTarget.name}" không? Hành động này không thể khôi phục.`}
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

export default AuthorManagementPage;
