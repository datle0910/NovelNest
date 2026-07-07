import { useState, useEffect, useCallback, useRef } from 'react';

interface AudioReaderOptions {
  onComplete?: () => void;
}

export const useAudioReader = (htmlContent: string, options?: AudioReaderOptions) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [rate, setRate] = useState<number>(1.0);
  
  const chunksRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const isCancelingRef = useRef(false);

  // Initialize and get voices
  useEffect(() => {
    const loadVoices = () => {
      let allVoices = window.speechSynthesis.getVoices();
      
      // Filter out non-Vietnamese voices
      let availableVoices = allVoices.filter(v => v.lang.startsWith('vi'));
      
      if (availableVoices.length > 0) {
        availableVoices.sort((a, b) => a.name.localeCompare(b.name));
        setVoices(availableVoices);
        
        // Auto-select first Vietnamese voice
        if (!selectedVoiceURI) {
          setSelectedVoiceURI(availableVoices[0].voiceURI);
        }
      } else {
        setVoices([]);
      }
    };

    loadVoices();
    // Chrome sometimes fires voiceschanged asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel(); // Stop speaking if unmounted
    };
  }, []);

  // Parse HTML content into text chunks when content changes
  useEffect(() => {
    if (!htmlContent) return;
    
    // Convert HTML to plain text blocks
    const tempDiv = document.createElement('div');
    // Replace <br> and <p> with newlines to preserve structure before stripping
    const structuredHtml = htmlContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p>/gi, '');
      
    tempDiv.innerHTML = structuredHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    // Split by newlines or sentence endings (., !, ?)
    const rawChunks = plainText.split(/(?<=[.!?\n])\s+/);
    
    const mergedChunks: string[] = [];
    let currentChunk = '';
    
    // Group into ~500 character chunks to minimize SpeechSynthesis queue overhead
    for (const sentence of rawChunks) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      if ((currentChunk + ' ' + trimmed).length < 500) {
        currentChunk += (currentChunk ? ' ' : '') + trimmed;
      } else {
        if (currentChunk) mergedChunks.push(currentChunk);
        currentChunk = trimmed;
      }
    }
    if (currentChunk) mergedChunks.push(currentChunk);
    
    chunksRef.current = mergedChunks;
      
    currentIndexRef.current = 0;
    setProgress(0);
    
    // If it was playing, restart with new text
    if (isPlaying && !isPaused) {
      isCancelingRef.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        isCancelingRef.current = false;
        queueChunk(0);
      }, 50);
    }
  }, [htmlContent]);

  const queueChunk = useCallback((index: number, overrideVoiceURI?: string) => {
    if (index >= chunksRef.current.length) {
      return;
    }

    const text = chunksRef.current[index];
    const utterance = new SpeechSynthesisUtterance(text);
    
    const targetVoiceURI = overrideVoiceURI || selectedVoiceURI;
    const voice = voices.find(v => v.voiceURI === targetVoiceURI);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'vi-VN'; // Fallback
    }

    // Adjust rate and pitch
    utterance.rate = rate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      currentIndexRef.current = index;
      setProgress(Math.round((index / chunksRef.current.length) * 100));
      
      // Queue the next chunk immediately so there is no gap in audio playback
      if (index + 1 < chunksRef.current.length && !isCancelingRef.current) {
        queueChunk(index + 1, overrideVoiceURI);
      }
    };

    utterance.onend = () => {
      // If this is the last chunk, finish playback
      if (index === chunksRef.current.length - 1 && !isCancelingRef.current) {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        if (options?.onComplete) {
          options.onComplete();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
    };

    window.speechSynthesis.speak(utterance);
  }, [voices, selectedVoiceURI, options, rate]);

  const play = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      isCancelingRef.current = true;
      window.speechSynthesis.cancel(); // Clear queue
      setTimeout(() => {
        isCancelingRef.current = false;
        queueChunk(currentIndexRef.current);
        setIsPlaying(true);
        setIsPaused(false);
      }, 50);
    }
  }, [isPaused, queueChunk]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const stop = useCallback(() => {
    isCancelingRef.current = true;
    window.speechSynthesis.cancel();
    setTimeout(() => isCancelingRef.current = false, 50);
    setIsPlaying(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
    setProgress(0);
  }, []);

  const selectVoice = useCallback((voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    if (isPlaying) {
      isCancelingRef.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        isCancelingRef.current = false;
        queueChunk(currentIndexRef.current, voiceURI);
      }, 50);
    }
  }, [isPlaying, queueChunk]);

  const seek = useCallback((percentage: number) => {
    const targetIndex = Math.floor(Math.max(0, Math.min(1, percentage)) * (chunksRef.current.length - 1));
    if (targetIndex >= 0 && targetIndex < chunksRef.current.length) {
      currentIndexRef.current = targetIndex;
      setProgress(Math.round((targetIndex / chunksRef.current.length) * 100));
      
      if (isPlaying && !isPaused) {
        isCancelingRef.current = true;
        window.speechSynthesis.cancel();
        setTimeout(() => {
          isCancelingRef.current = false;
          queueChunk(targetIndex);
        }, 50);
      }
    }
  }, [isPlaying, isPaused, queueChunk]);

  const changeRate = useCallback((newRate: number) => {
    setRate(newRate);
    if (isPlaying && !isPaused) {
      isCancelingRef.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        isCancelingRef.current = false;
        queueChunk(currentIndexRef.current);
      }, 50);
    }
  }, [isPlaying, isPaused, queueChunk]);

  return {
    voices,
    selectedVoiceURI,
    isPlaying,
    isPaused,
    progress,
    rate,
    setRate: changeRate,
    play,
    pause,
    stop,
    selectVoice,
    seek
  };
};
