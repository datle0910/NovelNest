import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { updateProfile } from '../api/authApi';
import { uploadAvatar } from '../api/mediaApi';
import ErrorMessage from '../components/ErrorMessage';
import { User, UserCircle, UploadCloud, Shield, Mail, CheckCircle2 } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh JPEG, PNG, WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Dung lượng file không được vượt quá 5MB.');
      return;
    }

    setUploadingImage(true);
    setError('');
    setSuccess('');
    try {
      const res = await uploadAvatar(file);
      setAvatar(res.data.url);
      setSuccess('Tải ảnh thành công! Nhấn Lưu để cập nhật.');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Tên hiển thị không được để trống'); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateProfile({ username: username.trim(), avatar });
      setUser(res.data);
      setSuccess('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl text-white shrink-0 shadow-sm">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Hồ Sơ Của Bạn</h1>
                <p className="text-slate-500 mt-1">Quản lý thông tin cá nhân.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
              <label htmlFor="avatarUpload" className="group relative w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-100 flex items-center justify-center cursor-pointer shadow-sm mb-5">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <UserCircle className="w-16 h-16 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                  <UploadCloud className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Đổi ảnh</span>
                </div>
                <input type="file" id="avatarUpload" accept="image/jpeg, image/png, image/webp" onChange={handleFileUpload} disabled={uploadingImage} className="hidden" />
              </label>

              <h3 className="font-display font-bold text-lg text-slate-800">{user?.username}</h3>
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${user?.role === 'ADMIN' ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                <Shield className="w-3 h-3" />
                {user?.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'ĐỘC GIẢ'}
              </div>

              {uploadingImage && (
                <div className="mt-4 flex items-center gap-2 text-xs text-brand-600 font-semibold bg-brand-50 px-3 py-1.5 rounded-full">
                  <div className="w-3 h-3 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                  Đang tải ảnh...
                </div>
              )}
            </div>

            <div className="md:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-display font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                <User className="w-5 h-5 text-brand-500" /> Thông tin cá nhân
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <ErrorMessage message={error} />}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 animate-slide-up">
                    <CheckCircle2 className="w-5 h-5" /> {success}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Email (Không thể thay đổi)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={user?.email || ''} disabled
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Tên hiển thị</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium" />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" disabled={loading || uploadingImage}
                    className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer">
                    {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
