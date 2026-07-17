import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, List, ArrowUp, Type, Sparkles, BookOpen, Settings, Headphones, Info, ArrowDown } from 'lucide-react';
import { getChapterDetail, reportChapter } from '../api/storyApi';
import { ChapterDetail } from '../types/chapter';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { saveHistory } from '../api/readingHistoryApi';
import { useAuthStore } from '../store/authStore';
import CommentList from '../components/CommentList';
import ChapterDrawer from '../components/ChapterDrawer';
import SettingsDrawer, { THEMES, ReaderSettings } from '../components/SettingsDrawer';
import AudioPlayerDrawer from '../components/AudioPlayerDrawer';
import ReportChapterModal from '../components/ReportChapterModal';

const ReadingPage: React.FC = () => {
  const { slug, chapterNumber } = useParams<{ slug: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const saved = localStorage.getItem('reader-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      theme: 'white',
      fontSize: 18,
      lineHeight: 1.8,
      textAlign: 'left',
      fontFamily: 'Roboto',
      readingMode: 'scroll'
    };
  });

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    localStorage.setItem('reader-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBackToTop(currentScrollY > 400);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY.current - 10) {
        // Scrolling up (added a small threshold to avoid jitter)
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!slug || !chapterNumber) return;
      try {
        setLoading(true);
        const res = await getChapterDetail(slug, parseInt(chapterNumber, 10));
        setChapter(res.data);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Lỗi tải nội dung chương');
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
    window.scrollTo(0, 0);
  }, [slug, chapterNumber]);

  // Save reading progress
  useEffect(() => {
    if (isAuthenticated && chapter) {
      saveHistory({
        storyId: chapter.storyId,
        chapterId: chapter.chapterId
      }).catch(() => {});
    }
  }, [chapter, isAuthenticated]);

  const handlePrev = () => {
    if (chapter?.previousChapterNumber) {
      navigate(`/stories/${slug}/chapters/${chapter.previousChapterNumber}`);
    }
  };

  const handleNext = () => {
    if (chapter?.nextChapterNumber) {
      navigate(`/stories/${slug}/chapters/${chapter.nextChapterNumber}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const ct = THEMES.find(t => t.id === settings.theme) || THEMES[0];

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-white"><Loading /></div>;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-10"><ErrorMessage message={error} /></div>;
  if (!chapter) return null;

  const getDisplayTitle = () => {
    if (!chapter) return '';
    if (!chapter.chapterTitle) return `Chương ${chapter.chapterNumber}`;
    const lowerTitle = chapter.chapterTitle.toLowerCase();
    if (lowerTitle.startsWith('chương')) return chapter.chapterTitle;
    if (lowerTitle.startsWith(`chương ${chapter.chapterNumber}`)) return chapter.chapterTitle;
    return `Chương ${chapter.chapterNumber}: ${chapter.chapterTitle}`;
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${ct.bg}`}>
      {/* Top Bar */}
      <div className={`sticky top-16 lg:top-[72px] z-40 shadow-sm ${ct.toolbarBg} ${ct.border}`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={`/stories/${slug}`} className={`flex items-center gap-2 text-sm font-bold text-brand-500 hover:underline`}>
            <BookOpen className="w-4 h-4" /> {chapter.storyTitle}
          </Link>
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1.5 ${ct.navBtn} px-2 py-1 rounded-xl`}>
              <Type className="w-3.5 h-3.5" />
              <button onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(14, s.fontSize - 2) }))} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all font-bold text-sm">−</button>
              <span className="w-8 text-center text-xs font-bold">{settings.fontSize}</span>
              <button onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(32, s.fontSize + 2) }))} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all font-bold text-sm">+</button>
            </div>
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <button onClick={() => setIsSettingsOpen(true)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${ct.navBtn}`} title="Cài đặt">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Content */}
      <div className={`max-w-3xl mx-auto px-4 py-8 md:py-12 ${ct.text}`}>
        <div className="text-center mb-10 pb-8 border-b" style={{ borderColor: 'inherit' }}>
          <h1 className={`text-2xl md:text-3xl font-display font-bold leading-tight ${ct.title}`}>
            {getDisplayTitle()}
          </h1>
        </div>

        <div
          className="reading-content max-w-none transition-all duration-300"
          style={{ 
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            textAlign: settings.textAlign,
            fontFamily: `"${settings.fontFamily}", sans-serif`
          }}
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />

        <div className="flex justify-center items-center gap-4 mt-16 opacity-40">
          <div className={`h-px w-16 bg-slate-300`} />
          <Sparkles className={`w-4 h-4 text-slate-400`} />
          <div className={`h-px w-16 bg-slate-300`} />
        </div>
      </div>

      {/* Navigation */}
      <div className={`max-w-3xl mx-auto px-4 pb-8 ${ct.text}`}>
        <div className="flex justify-between items-center gap-4 pt-6 border-t ${ct.divider}">
          <button onClick={handlePrev} disabled={!chapter.previousChapterNumber}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm ${ct.navBg}`}>
            <ChevronLeft className="w-5 h-5" /> Chương Trước
          </button>

          <button onClick={() => setIsDrawerOpen(true)} className={`p-3 rounded-xl border transition-all cursor-pointer ${ct.navBg}`} title="Danh sách chương">
            <List className="w-5 h-5" />
          </button>

          <button onClick={handleNext} disabled={!chapter.nextChapterNumber}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm ${ct.navBg}`}>
            Chương Sau <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className={`border-t ${ct.divider}`}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <CommentList storyId={chapter.storyId} />
        </div>
      </div>

      {/* Floating Sidebar (Desktop) */}
      <div className={`hidden lg:flex flex-col items-center gap-2 fixed top-1/2 -translate-y-1/2 right-8 p-3 rounded-[32px] shadow-xl border transition-all z-50 ${ct.navBg}`}>
        <button onClick={handlePrev} disabled={!chapter.previousChapterNumber} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-30">
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button onClick={() => setIsDrawerOpen(true)} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors" title="Danh sách chương">
            <List className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors" title="Cài đặt">
          <Settings className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button onClick={() => setIsAudioOpen(true)} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-brand-500 bg-brand-50/50" title="Đọc Audio (Text-to-Speech)">
          <Headphones className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button onClick={handleNext} disabled={!chapter.nextChapterNumber} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-30">
          <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button onClick={() => setIsReportModalOpen(true)} className="p-2.5 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 rounded-full transition-colors" title="Báo cáo lỗi">
          <Info className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors" title="Cuộn xuống cuối">
          <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Navigation Bar (Mobile) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-2xl transition-transform duration-300 ${isScrollingDown ? 'translate-y-full' : 'translate-y-0'} ${ct.navBg}`}>
        <div className="flex items-center justify-around p-3 pb-safe">
          <button onClick={handlePrev} disabled={!chapter.previousChapterNumber} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 flex flex-col items-center gap-1">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[10px] font-bold">Trước</span>
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex flex-col items-center gap-1">
            <List className="w-5 h-5" />
            <span className="text-[10px] font-bold">Mục lục</span>
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex flex-col items-center gap-1">
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold">Cài đặt</span>
          </button>
          <button onClick={() => setIsAudioOpen(true)} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-brand-500 flex flex-col items-center gap-1">
            <Headphones className="w-5 h-5" />
            <span className="text-[10px] font-bold">Audio</span>
          </button>
          <button onClick={handleNext} disabled={!chapter.nextChapterNumber} className="p-2.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 flex flex-col items-center gap-1">
            <ChevronRight className="w-5 h-5" />
            <span className="text-[10px] font-bold">Sau</span>
          </button>
        </div>
      </div>

      <ChapterDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        storySlug={slug || ''} 
        currentChapterNumber={chapter.chapterNumber} 
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={(newSettings) => setSettings(s => ({ ...s, ...newSettings }))}
      />

      <AudioPlayerDrawer
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
        onOpen={() => setIsAudioOpen(true)}
        htmlContent={chapter.content}
        chapterTitle={getDisplayTitle()}
        handlePrev={handlePrev}
        handleNext={handleNext}
        hasPrev={!!chapter.previousChapterNumber}
        hasNext={!!chapter.nextChapterNumber}
      />

      <ReportChapterModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={async (reasons, details) => {
          await reportChapter(chapter.chapterId, reasons, details);
          alert('Báo cáo của bạn đã được gửi thành công. Cảm ơn bạn!');
        }}
      />
    </div>
  );
};

export default ReadingPage;
