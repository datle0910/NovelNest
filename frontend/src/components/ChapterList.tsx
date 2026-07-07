import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { ChapterSummary } from '../types/chapter';

interface ChapterListProps {
  chapters: ChapterSummary[];
  storySlug: string;
}

const ChapterList: React.FC<ChapterListProps> = ({ chapters, storySlug }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 50;
  const pagesPerFloor = 30; // 30 pages * 50 items = 1500 items per floor

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Chưa có chương nào.</p>
      </div>
    );
  }

  // Sort ascending for grid view
  const sorted = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  
  const totalFloors = Math.ceil(totalPages / pagesPerFloor);
  const currentFloor = Math.floor(currentPage / pagesPerFloor);

  const startPageOfFloor = currentFloor * pagesPerFloor;
  const endPageOfFloor = Math.min(startPageOfFloor + pagesPerFloor, totalPages);
  
  const currentFloorPages = Array.from(
    { length: endPageOfFloor - startPageOfFloor },
    (_, i) => startPageOfFloor + i
  );

  const currentChapters = sorted.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const getDisplayTitle = (ch: ChapterSummary) => {
    if (!ch.title) return `Chương ${ch.chapterNumber}`;
    const lowerTitle = ch.title.toLowerCase();
    if (lowerTitle.startsWith('chương')) return ch.title;
    if (lowerTitle.startsWith(`chương ${ch.chapterNumber}`)) return ch.title;
    return `Chương ${ch.chapterNumber} - ${ch.title}`;
  };

  const handleNextFloor = () => {
    if (currentFloor < totalFloors - 1) {
      setCurrentPage((currentFloor + 1) * pagesPerFloor);
    }
  };

  const handlePrevFloor = () => {
    if (currentFloor > 0) {
      setCurrentPage((currentFloor - 1) * pagesPerFloor);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Pagination Ranges */}
      {totalPages > 1 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {currentFloorPages.map((pageIndex) => {
              const startNum = pageIndex * itemsPerPage + 1;
              const endNum = (pageIndex + 1) * itemsPerPage;
              const isActive = currentPage === pageIndex;
              return (
                <button
                  key={pageIndex}
                  onClick={() => setCurrentPage(pageIndex)}
                  className={`w-[88px] sm:w-[104px] text-center py-1.5 text-xs sm:text-sm font-medium rounded border transition-colors ${
                    isActive 
                      ? 'bg-red-600 text-white border-red-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-500'
                  }`}
                >
                  {startNum}-{endNum}
                </button>
              );
            })}
          </div>

          {/* Floor Controls */}
          {totalFloors > 1 && (
            <div className="flex flex-col items-center gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                {currentFloor > 0 && (
                  <button onClick={handlePrevFloor} className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Tầng trước
                  </button>
                )}
                {currentFloor < totalFloors - 1 && (
                  <button onClick={handleNextFloor} className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center">
                    Tầng sau <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Tầng {currentFloor + 1}/{totalFloors} • Chương {startPageOfFloor * itemsPerPage + 1} - {Math.min(endPageOfFloor * itemsPerPage, sorted.length)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentChapters.map((ch) => (
          <Link
            key={ch.chapterNumber}
            to={`/stories/${storySlug}/chapters/${ch.chapterNumber}`}
            className="flex items-center px-4 py-3 rounded-lg border border-slate-200 bg-white hover:border-red-400 hover:shadow-sm transition-all group"
            title={getDisplayTitle(ch)}
          >
            <span className="text-sm text-slate-700 group-hover:text-red-600 transition-colors line-clamp-1">
              {getDisplayTitle(ch)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;
