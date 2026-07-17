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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    // Replace <br> and <p> with punctuation to create natural pauses instead of abrupt cuts
    const structuredHtml = htmlContent
      .replace(/<br\s*\/?>/gi, ', ')
      .replace(/<\/p>/gi, '. ')
      .replace(/<p>/gi, ' ');
      
    tempDiv.innerHTML = structuredHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    // Split text into phrases strictly at punctuation marks (comma, period, etc.) followed by space
    // This cross-browser regex captures the punctuation and spaces so we can reconstruct phrases
    const parts = plainText.split(/([.,!?;:\n]+(?:\s+|$))/);
    const phrases: string[] = [];
    let currentPhrase = '';
    
    for (let i = 0; i < parts.length; i++) {
      currentPhrase += parts[i];
      // Every odd index is the captured punctuation delimiter
      if (i % 2 !== 0 || i === parts.length - 1) {
        if (currentPhrase.trim()) {
          phrases.push(currentPhrase.trim());
        }
        currentPhrase = '';
      }
    }

    const mergedChunks: string[] = [];
    let currentChunk = '';
    
    for (const phrase of phrases) {
      // Group phrases into ~300 character chunks to avoid Chrome's 15-second speech bug.
      // By ONLY splitting chunks at phrase boundaries (punctuation), the browser's 
      // internal delay between chunks perfectly masks as a natural comma/period pause!
      if (currentChunk.length + phrase.length > 300 && currentChunk.length > 0) {
        mergedChunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += (currentChunk ? ' ' : '') + phrase;
    }
    
    if (currentChunk.trim()) {
      mergedChunks.push(currentChunk.trim());
    }
    
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

  const queueChunk = useCallback((index: number, overrideVoiceURI?: string, overrideRate?: number) => {
    if (index >= chunksRef.current.length) {
      return;
    }

    const text = chunksRef.current[index];
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Prevent garbage collection
    
    const targetVoiceURI = overrideVoiceURI || selectedVoiceURI;
    // VERY IMPORTANT: Always fetch fresh voices from the browser instead of using React state
    // because SpeechSynthesisVoice objects can become stale and be silently ignored by the browser.
    const freshVoices = window.speechSynthesis.getVoices();
    const voice = freshVoices.find(v => v.voiceURI === targetVoiceURI);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'vi-VN'; // Fallback
    }

    // Adjust rate and pitch
    utterance.rate = overrideRate !== undefined ? overrideRate : rate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      currentIndexRef.current = index;
      setProgress(Math.round((index / chunksRef.current.length) * 100));
      
      // Queue the next chunk immediately so there is no gap in audio playback
      if (index + 1 < chunksRef.current.length && !isCancelingRef.current) {
        queueChunk(index + 1, overrideVoiceURI, overrideRate);
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
      // Ignore 'interrupted' errors because we trigger them intentionally with cancel()
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn("SpeechSynthesis error:", e);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [voices, selectedVoiceURI, options, rate]);

  const play = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      isCancelingRef.current = true;
      window.speechSynthesis.cancel(); // Clear any stale queue
      setTimeout(() => {
        isCancelingRef.current = false;
        queueChunk(currentIndexRef.current);
      }, 50);
      
      setIsPlaying(true);
      setIsPaused(false);
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
        queueChunk(currentIndexRef.current, undefined, newRate);
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
