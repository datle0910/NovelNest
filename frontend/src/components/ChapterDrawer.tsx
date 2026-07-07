import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getStoryChapters } from '../api/storyApi';
import { ChapterSummary } from '../types/chapter';

interface ChapterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storySlug: string;
  currentChapterNumber: number;
}

const ChapterDrawer: React.FC<ChapterDrawerProps> = ({ isOpen, onClose, storySlug, currentChapterNumber }) => {
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const itemsPerPage = 50;

  useEffect(() => {
    if (isOpen && chapters.length === 0) {
      const fetchChapters = async () => {
        try {
          setLoading(true);
          const res = await getStoryChapters(storySlug);
          // sort ascending
          const sorted = [...res.data].sort((a, b) => a.chapterNumber - b.chapterNumber);
          setChapters(sorted);
          
          // Set initial page based on current chapter
          if (sorted.length > 0) {
            const index = sorted.findIndex(c => c.chapterNumber === currentChapterNumber);
            if (index !== -1) {
              setCurrentPage(Math.floor(index / itemsPerPage));
            }
          }
        } catch (error) {
          console.error("Failed to load chapters", error);
        } finally {
          setLoading(false);
        }
      };
      fetchChapters();
    }
  }, [isOpen, storySlug, chapters.length, currentChapterNumber]);

  // When chapter changes externally (e.g., clicking next), update the page if drawer is open
  useEffect(() => {
    if (isOpen && chapters.length > 0) {
      const index = chapters.findIndex(c => c.chapterNumber === currentChapterNumber);
      if (index !== -1) {
        setCurrentPage(Math.floor(index / itemsPerPage));
      }
    }
  }, [currentChapterNumber, isOpen, chapters]);

  const totalPages = Math.ceil(chapters.length / itemsPerPage);
  const currentChapters = useMemo(() => {
    return chapters.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  }, [chapters, currentPage]);

  const getDisplayTitle = (ch: ChapterSummary) => {
    if (!ch.title) return `Chương ${ch.chapterNumber}`;
    const lowerTitle = ch.title.toLowerCase();
    if (lowerTitle.startsWith('chương')) return ch.title;
    if (lowerTitle.startsWith(`chương ${ch.chapterNumber}`)) return ch.title;
    return `Chương ${ch.chapterNumber} - ${ch.title}`;
  };

  // Scroll to active chapter when pagination changes
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isOpen, currentPage, currentChapters]);

  // Pages array for simple pagination (limit to 5 visible buttons around current page)
  const visiblePages = useMemo(() => {
    const pages = [];
    let start = Math.max(0, currentPage - 1);
    let end = Math.min(totalPages - 1, start + 3);
    
    if (end - start < 3) {
      start = Math.max(0, end - 3);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-4 bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-[120%]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg text-slate-800">Danh sách chương</h3>
            <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
              {chapters.length} chương
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar scroll-smooth snap-x justify-start px-1">
              {visiblePages.map(pageIndex => {
                const isActive = pageIndex === currentPage;
                const startNum = pageIndex * itemsPerPage + 1;
                const endNum = Math.min((pageIndex + 1) * itemsPerPage, chapters.length);
                return (
                  <button
                    key={pageIndex}
                    onClick={() => setCurrentPage(pageIndex)}
                    className={`whitespace-nowrap px-3 py-1.5 text-[13px] font-medium rounded transition-colors snap-center shrink-0 ${
                      isActive
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    {startNum}-{endNum}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto p-4" ref={listRef}>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {currentChapters.map(ch => {
                const isActive = ch.chapterNumber === currentChapterNumber;
                return (
                  <Link
                    key={ch.chapterNumber}
                    to={`/stories/${storySlug}/chapters/${ch.chapterNumber}`}
                    onClick={onClose}
                    data-active={isActive}
                    className={`px-4 py-3 rounded-lg text-sm transition-all border ${
                      isActive 
                        ? 'border-red-500 text-red-600 font-semibold shadow-[0_2px_10px_-3px_rgba(239,68,68,0.2)] bg-white' 
                        : 'border-transparent text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="line-clamp-2">{getDisplayTitle(ch)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChapterDrawer;
