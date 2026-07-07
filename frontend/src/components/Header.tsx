import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, Heart, Clock, Shield, BookOpen, Sun, ThumbsUp, Bookmark } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useAuthStore } from '../store/authStore';
import { getCategories } from '../api/categoryApi';
import { Category } from '../types/category';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, isAuthenticated, logout } = useAuthStore();
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const isTransparent = isHomePage && !scrolled;

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(console.error);
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
      setIsMenuOpen(false);
      setKeyword('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); setIsProfileOpen(false); };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-gradient-to-b from-black/60 to-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-app-border shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img src={logoImg} alt="NovelNest" className="h-[50px] w-[50px] rounded-[10px] object-contain" />
            <div className="hidden sm:block">
              <h1 className={`text-base font-display font-bold tracking-tight leading-tight ${isTransparent ? 'text-white' : 'text-slate-800'}`}>
                NovelNest
              </h1>
              <span className={`text-[11px] font-medium leading-tight ${isTransparent ? 'text-white/60' : 'text-slate-400'}`}>
                Đọc truyện chữ
              </span>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className={`w-4 h-4 ${isTransparent ? 'text-white/50' : 'text-slate-400'}`} />
              </div>
              <input type="text" placeholder="Tìm kiếm truyện, tác giả..."
                value={keyword} onChange={e => setKeyword(e.target.value)}
                className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all ${
                  isTransparent
                    ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30'
                    : 'bg-app-surface border border-app-border text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-300'
                }`} />
            </form>
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-0.5">
            <button className={`p-2.5 rounded-lg transition-all cursor-pointer ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-brand-500 hover:bg-brand-50'
            }`} title="Vote truyện">
              <ThumbsUp className="w-5 h-5" />
            </button>
            {isAuthenticated && (
              <Link to="/favorites" className={`p-2.5 rounded-lg transition-all ${
                isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-brand-500 hover:bg-brand-50'
              }`} title="Tủ sách">
                <Bookmark className="w-5 h-5" />
              </Link>
            )}
            <div className={`w-px h-6 mx-1 ${isTransparent ? 'bg-white/20' : 'bg-slate-200'}`} />
            <button className={`p-2.5 rounded-lg transition-all cursor-pointer ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-brand-500 hover:bg-brand-50'
            }`} title="Theme: Sáng" aria-label="Theme: Sáng">
              <Sun className="w-5 h-5" />
            </button>

            <div className="relative" ref={profileRef}>
              {isAuthenticated ? (
                <>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`p-0.5 rounded-full transition-all cursor-pointer ${
                      isTransparent ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                    }`}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-brand-400 shadow-sm" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                        isTransparent ? 'bg-white/20' : 'bg-gradient-to-br from-brand-400 to-brand-600'
                      }`}>
                        {user?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                      </div>
                    )}
                  </button>
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-app-border py-1.5 animate-scale-in origin-top-right z-50">
                      <div className="px-4 py-2.5 border-b border-app-border mb-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-all">
                        <User className="w-4 h-4" /> Hồ sơ
                      </Link>
                      <Link to="/change-password" onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-all">
                        <User className="w-4 h-4" /> Đổi mật khẩu
                      </Link>
                      <Link to="/favorites" onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-all">
                        <Heart className="w-4 h-4" /> Yêu thích
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-600 font-bold hover:bg-brand-50 transition-all">
                          <Shield className="w-4 h-4" /> Quản trị
                        </Link>
                      )}
                      <div className="border-t border-app-border mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all cursor-pointer">
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login"
                  className={`ml-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isTransparent ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}>
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>

          {/* Mobile */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-all cursor-pointer ${
              isTransparent ? 'text-white/80 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-app-border px-4 py-5 space-y-5 animate-slide-up shadow-xl max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Tìm kiếm truyện..."
              value={keyword} onChange={e => setKeyword(e.target.value)}
              className="w-full bg-app-surface border border-app-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-brand-300" />
          </form>
          <div className="flex flex-col gap-1">
            <Link to="/stories" onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg">
              <BookOpen className="w-4 h-4 text-brand-500" /> Truyện
            </Link>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 pt-2 pb-1">Thể loại</div>
            <div className="grid grid-cols-2 gap-1">
              {categories.map(cat => (
                <Link key={cat.id} to={`/categories/${cat.slug}`} onClick={() => setIsMenuOpen(false)}
                  className="text-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 px-4 py-2 rounded-lg">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-app-border pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-brand-400" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 rounded-lg transition-all">
                    <User className="w-4 h-4" /> Hồ sơ
                  </Link>
                  <Link to="/favorites" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 rounded-lg transition-all">
                    <Heart className="w-4 h-4 text-rose-500" /> Yêu thích
                  </Link>
                  <Link to="/reading-history" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 rounded-lg transition-all">
                    <Clock className="w-4 h-4" /> Lịch sử
                  </Link>
                  <Link to="/change-password" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 rounded-lg transition-all">
                    <User className="w-4 h-4" /> Mật khẩu
                  </Link>
                </div>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-brand-50 text-brand-600 border border-brand-200 text-sm font-bold rounded-lg transition-all">
                    <Shield className="w-4 h-4" /> Quản trị
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 text-sm font-bold rounded-lg hover:bg-red-100 transition-all cursor-pointer">
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-app-border transition-all">
                  Đăng nhập
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-all">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
