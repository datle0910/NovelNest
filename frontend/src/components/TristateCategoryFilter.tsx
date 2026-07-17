import React, { useEffect, useState } from 'react';
import { getCategories } from '../api/categoryApi';
import { Category } from '../types/category';
import { Check, X } from 'lucide-react';

/**
 * Tri-state: 0 = Neutral (grey), 1 = Include/Must Have (green), 2 = Exclude/Must Not Have (red)
 */
export type CategoryState = 0 | 1 | 2;

export interface TristateCategoryFilterProps {
  onChange: (includeIds: number[], excludeIds: number[]) => void;
}

const TristateCategoryFilter: React.FC<TristateCategoryFilterProps> = ({ onChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<Record<number, CategoryState>>({});

  useEffect(() => {
    getCategories().then((res) => {
      setCategories(res.data);
      const initial: Record<number, CategoryState> = {};
      res.data.forEach((c: Category) => { initial[c.id] = 0; });
      setStates(initial);
    }).catch(console.error);
  }, []);

  const handleClick = (id: number) => {
    setStates(prev => {
      const next = { ...prev };
      // Cycle: 0 -> 1 -> 2 -> 0
      next[id] = ((prev[id] + 1) % 3) as CategoryState;

      // Emit changes
      const includeIds: number[] = [];
      const excludeIds: number[] = [];
      Object.entries(next).forEach(([key, val]) => {
        const numKey = Number(key);
        if (val === 1) includeIds.push(numKey);
        if (val === 2) excludeIds.push(numKey);
      });
      onChange(includeIds, excludeIds);

      return next;
    });
  };

  const handleReset = () => {
    const reset: Record<number, CategoryState> = {};
    categories.forEach((c) => { reset[c.id] = 0; });
    setStates(reset);
    onChange([], []);
  };

  const hasActiveFilters = Object.values(states).some(v => v !== 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Lọc theo Thể loại</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors cursor-pointer"
          >
            Đặt lại
          </button>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 inline-block"></span>
          Bỏ qua
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
          Bắt buộc
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
          Loại trừ
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const state = states[cat.id] ?? 0;
          let className = '';
          let icon = null;

          if (state === 0) {
            className = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
          } else if (state === 1) {
            className = 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/30';
            icon = <Check className="w-3 h-3 shrink-0" />;
          } else {
            className = 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400/30 line-through';
            icon = <X className="w-3 h-3 shrink-0" />;
          }

          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.id)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all duration-150 select-none ${className}`}
            >
              {icon}
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TristateCategoryFilter;
