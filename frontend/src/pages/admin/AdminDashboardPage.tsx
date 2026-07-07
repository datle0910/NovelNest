import React, { useEffect, useState } from 'react';
import { Book, Tags, Users, Clock, TrendingUp } from 'lucide-react';
import { getStories } from '../../api/storyApi';
import { getCategories } from '../../api/categoryApi';
import { getAuthors } from '../../api/authorApi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorMessage from '../../components/ErrorMessage';
import { StorySummary } from '../../types/story';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ stories: 0, categories: 0, authors: 0 });
  const [recentStories, setRecentStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [storiesRes, categoriesRes, authorsRes] = await Promise.all([
          getStories(0, 5),
          getCategories(),
          getAuthors()
        ]);
        
        setStats({
          stories: storiesRes.data.totalElements,
          categories: categoriesRes.data.length,
          authors: authorsRes.data.length
        });
        setRecentStories(storiesRes.data.content);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Lỗi tải dữ liệu Dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="table" count={6} />;
  }
  if (error) return <ErrorMessage message={error} />;

  const statCards = [
    { title: 'Tổng số truyện', value: stats.stories, icon: <Book className="w-6 h-6" />, gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/25' },
    { title: 'Tổng số thể loại', value: stats.categories, icon: <Tags className="w-6 h-6" />, gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/25' },
    { title: 'Tổng số tác giả', value: stats.authors, icon: <Users className="w-6 h-6" />, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/25' },
  ];

  const statusStyle = (status: string) => {
    const map: Record<string, string> = {
      COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      ONGOING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      PAUSED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return map[status] || map.ONGOING;
  };

  const statusLabel = (s: string) => {
    const m: Record<string, string> = { ONGOING: 'Đang ra', COMPLETED: 'Hoàn thành', PAUSED: 'Tạm ngưng' };
    return m[s] || s;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl shadow-lg shadow-brand-500/20">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Tổng Quan Hệ Thống</h1>
          <p className="text-sm text-text-muted font-medium mt-0.5">Cập nhật số liệu thống kê truyện và phân tích nhanh.</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 flex items-center gap-5 group hover:-translate-y-1 transition-all duration-500 hover:border-white/10">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow}`}>
              <div className="text-white">{stat.icon}</div>
            </div>
            <div>
              <p className="text-text-muted text-xs font-bold uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-display font-extrabold text-white mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-white/[0.04] pb-4">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-white tracking-tight">Truyện mới cập nhật</h2>
        </div>
        
        <div className="space-y-3">
          {recentStories.map(story => (
            <div key={story.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-base/40 border border-transparent hover:border-white/[0.06] hover:bg-surface-base/60 transition-all">
              {story.coverImage ? (
                <img 
                  src={story.coverImage} 
                  alt={story.title} 
                  className="w-12 h-16 object-cover rounded-xl shadow border border-white/5 shrink-0" 
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-12 h-16 bg-surface-elevated flex items-center justify-center rounded-xl border border-white/5 shrink-0">
                  <Book className="w-6 h-6 text-text-muted/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white leading-snug truncate">{story.title}</h4>
                <p className="text-xs text-text-muted font-medium mt-0.5">{story.authorName || 'Chưa có tác giả'}</p>
              </div>
              <div>
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusStyle(story.status)}`}>
                  {statusLabel(story.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
