import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Tags, Users, LogOut, ArrowLeft, Database, BookOpen, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Quản lý truyện', path: '/admin/stories', icon: <Book className="w-5 h-5" /> },
    { name: 'Quản lý thể loại', path: '/admin/categories', icon: <Tags className="w-5 h-5" /> },
    { name: 'Quản lý tác giả', path: '/admin/authors', icon: <Users className="w-5 h-5" /> },
    { name: 'Báo cáo lỗi', path: '/admin/reports', icon: <AlertCircle className="w-5 h-5" /> },
    { name: 'Import dữ liệu', path: '/admin/import', icon: <Database className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-surface-elevated border-r border-white/[0.04] min-h-screen flex flex-col shadow-2xl shadow-black/30 shrink-0 text-left">
      <div className="p-6 border-b border-white/[0.04]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-all shadow-lg shadow-brand-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-display font-extrabold tracking-tight text-white block leading-tight">
              NovelNest
            </span>
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.15em]">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm' 
                  : 'text-text-muted hover:bg-white/[0.04] hover:text-white border border-transparent'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.04] space-y-1">
        <Link 
          to="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-text-muted hover:bg-white/[0.04] hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Về trang chủ
        </Link>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
