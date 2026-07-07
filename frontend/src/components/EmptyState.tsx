import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Danh sách trống',
  description = 'Không tìm thấy dữ liệu tương ứng.',
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 md:p-16 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto my-6">
      <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 mb-4">
        {icon || <Inbox className="w-10 h-10" />}
      </div>
      <h3 className="text-lg font-display font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
