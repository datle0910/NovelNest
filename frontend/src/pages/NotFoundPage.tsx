import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Frown } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Frown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-display font-extrabold text-slate-800 mb-2">404</h1>
        <p className="text-lg text-slate-600 mb-8">Trang bạn tìm kiếm không tồn tại.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl transition-all shadow-sm">
          <Home className="w-5 h-5" /> Về Trang Chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
