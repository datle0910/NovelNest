import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { verifyForgotPasswordOtp } from '../api/authApi';
import ErrorMessage from '../components/ErrorMessage';

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) { setError('Vui lòng nhập mã OTP.'); return; }
    setLoading(true);
    setError('');
    try {
      await verifyForgotPasswordOtp({ email, otp });
      navigate('/forgot-password/reset', { state: { email, otp } });
    } catch (err: any) {
      setError(err.message || 'Mã OTP không hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-all">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-800">Xác Thực OTP</h1>
            <p className="text-slate-500 text-sm mt-1">Nhập mã OTP được gửi đến email của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorMessage message={error} />}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mã OTP</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 transition-all text-center text-lg tracking-[0.3em]"
                placeholder="• • • • • •" maxLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer text-sm">
              {loading ? 'Đang xác thực...' : 'Xác Thực'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
