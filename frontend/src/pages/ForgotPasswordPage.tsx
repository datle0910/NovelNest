import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldQuestion } from 'lucide-react';
import { requestForgotPasswordOtp } from '../api/authApi';
import ErrorMessage from '../components/ErrorMessage';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Vui lòng nhập email.'); return; }
    setLoading(true);
    setError('');
    try {
      await requestForgotPasswordOtp({ email });
      navigate('/forgot-password/verify', { state: { email } });
    } catch (err: any) {
      setError(err.message || 'Email không tồn tại trong hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-all">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <ShieldQuestion className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-800">Quên Mật Khẩu</h1>
            <p className="text-slate-500 text-sm mt-1">Nhập email để nhận mã xác thực</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorMessage message={error} />}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  placeholder="your@email.com" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer text-sm">
              {loading ? 'Đang gửi...' : 'Gửi Mã Xác Thực'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
