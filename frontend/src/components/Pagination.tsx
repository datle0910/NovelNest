import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: 'light' | 'dark';
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, variant = 'light' }) => {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (currentPage > 2) pages.push('...');
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages - 1);
  }

  const isDark = variant === 'dark';
  const btnBase = "w-9 h-9 flex items-center justify-center rounded-xl border transition-all cursor-pointer";
  const btnDisabled = "disabled:opacity-30 disabled:cursor-not-allowed";
  
  const navBtnClass = `${btnBase} ${btnDisabled} ${
    isDark 
      ? 'bg-surface-elevated border-white/10 text-text-muted hover:bg-white/5 hover:text-white' 
      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
  }`;

  const ellipsisClass = `w-9 h-9 flex items-center justify-center text-xs ${isDark ? 'text-text-muted' : 'text-slate-400'}`;

  const getPageClass = (page: number) => {
    if (page === currentPage) {
      return `${btnBase} bg-brand-500 text-white border-transparent shadow-sm`;
    }
    return `${btnBase} text-sm font-bold ${
      isDark
        ? 'bg-transparent border-white/10 text-text-secondary hover:bg-white/5'
        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
    }`;
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={navBtnClass}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, idx) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${idx}`} className={ellipsisClass}>...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={getPageClass(page)}
          >
            {page + 1}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className={navBtnClass}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
