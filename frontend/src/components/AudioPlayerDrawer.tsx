import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Square, SkipBack, SkipForward, Clock, Settings, Volume2, Zap } from 'lucide-react';
import { useAudioReader } from '../hooks/useAudioReader';

interface AudioPlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  chapterTitle: string;
  handlePrev: () => void;
  handleNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const TIMER_OPTIONS = [
  { label: 'Tắt', value: 0 },
  { label: '15 phút', value: 15 },
  { label: '30 phút', value: 30 },
  { label: '45 phút', value: 45 },
  { label: '60 phút', value: 60 },
];

const AudioPlayerDrawer: React.FC<AudioPlayerDrawerProps> = ({
  isOpen,
  onClose,
  htmlContent,
  chapterTitle,
  handlePrev,
  handleNext,
  hasPrev,
  hasNext
}) => {
  const [autoNext, setAutoNext] = useState(true);
  const [sleepTimer, setSleepTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    voices,
    selectedVoiceURI,
    isPlaying,
    isPaused,
    progress,
    rate,
    setRate,
    play,
    pause,
    stop,
    selectVoice,
    seek
  } = useAudioReader(htmlContent, {
    onComplete: () => {
      if (autoNext && hasNext) {
        handleNext();
      }
    }
  });

  // Handle sleep timer
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (sleepTimer > 0 && isPlaying && !isPaused) {
      timerRef.current = setTimeout(() => {
        stop();
        setSleepTimer(0);
      }, sleepTimer * 60 * 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sleepTimer, isPlaying, isPaused, stop]);

  // Clean up audio when drawer closes completely
  // Actually, we might want audio to keep playing even if drawer is closed.
  // But if they navigate away from reading page, useAudioReader's cleanup handles it.

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
          <div className="flex items-center gap-2 text-slate-800">
            <Volume2 className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-lg">Đọc Audio</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Now Playing Info */}
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Đang phát</p>
            <h4 className="text-sm font-bold text-slate-800 line-clamp-2 px-4">{chapterTitle}</h4>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div 
              className="h-2 w-full bg-slate-100 rounded-full overflow-hidden cursor-pointer group relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                seek(x / rect.width);
              }}
              title="Nhấn để tua"
            >
              <div 
                className="h-full bg-brand-500 transition-all duration-300 group-hover:bg-brand-600"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>{progress}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 py-2">
            <button 
              onClick={() => {
                stop();
                handlePrev();
              }}
              disabled={!hasPrev}
              className="p-3 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all disabled:opacity-30"
              title="Chương trước"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            {!isPlaying || isPaused ? (
              <button 
                onClick={play}
                className="p-4 bg-brand-500 text-white hover:bg-brand-600 rounded-full shadow-lg shadow-brand-500/30 transition-all transform hover:scale-105"
                title="Phát"
              >
                <Play className="w-8 h-8 ml-1" />
              </button>
            ) : (
              <button 
                onClick={pause}
                className="p-4 bg-brand-500 text-white hover:bg-brand-600 rounded-full shadow-lg shadow-brand-500/30 transition-all transform hover:scale-105"
                title="Tạm dừng"
              >
                <Pause className="w-8 h-8" />
              </button>
            )}

            <button 
              onClick={() => {
                stop();
                handleNext();
              }}
              disabled={!hasNext}
              className="p-3 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all disabled:opacity-30"
              title="Chương sau"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center">
             <button onClick={stop} className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 border border-slate-200 rounded-full flex items-center gap-1">
               <Square className="w-3 h-3" /> Dừng hẳn
             </button>
          </div>

          <hr className="border-slate-100" />

          {/* Voice Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase">Giọng đọc</label>
            {voices.length > 0 ? (
              <select
                value={selectedVoiceURI}
                onChange={(e) => selectVoice(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-500 bg-white"
              >
                {voices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} {voice.lang.startsWith('vi') ? '(Tiếng Việt)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-500 text-center border border-slate-100">
                Không tìm thấy giọng đọc nào trên thiết bị của bạn.
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4 pt-2">
            
            {/* Speed Control */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Tốc độ đọc</span>
              </div>
              <select
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium outline-none focus:border-brand-500 bg-white"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(r => (
                  <option key={r} value={r}>{r}x</option>
                ))}
              </select>
            </div>

            {/* Auto Next */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Tự động chuyển chương</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={autoNext}
                  onChange={(e) => setAutoNext(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

            {/* Sleep Timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Hẹn giờ tắt</span>
              </div>
              <select
                value={sleepTimer}
                onChange={(e) => setSleepTimer(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium outline-none focus:border-brand-500 bg-white"
              >
                {TIMER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            {sleepTimer > 0 && isPlaying && (
              <p className="text-[11px] text-brand-500 text-right animate-pulse">
                Audio sẽ tự tắt sau {sleepTimer} phút nữa
              </p>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default AudioPlayerDrawer;
