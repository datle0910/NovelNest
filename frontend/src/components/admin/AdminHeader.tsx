import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { User } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-surface-elevated border-b border-white/[0.04] px-6 flex items-center justify-between sticky top-0 z-10 shadow-lg text-left">
      <div className="text-xs text-text-muted font-bold uppercase tracking-wider">
        Hệ thống: <span className="text-brand-400 font-bold uppercase tracking-widest">NovelNest Panel</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">{user?.username}</span>
        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-sm shrink-0">
          <User className="w-4 h-4 text-brand-400" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
