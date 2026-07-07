import React from 'react';
import { X, AlignLeft, AlignJustify } from 'lucide-react';

export const THEMES = [
  { id: 'white', bg: 'bg-white', hex: '#FFFFFF', text: 'text-slate-800', border: 'border-slate-200', title: 'text-slate-900', divider: 'border-slate-200', toolbarBg: 'bg-white/95', navBtn: 'text-slate-600 hover:bg-slate-100', navBg: 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50', label: 'Trắng' },
  { id: 'ivory', bg: 'bg-[#F9F7F3]', hex: '#F9F7F3', text: 'text-slate-800', border: 'border-[#EAE5D9]', title: 'text-slate-900', divider: 'border-[#EAE5D9]', toolbarBg: 'bg-[#F9F7F3]/95', navBtn: 'text-slate-600 hover:bg-[#EAE5D9]', navBg: 'bg-[#F9F7F3] border-[#EAE5D9] text-slate-700 hover:bg-[#EAE5D9]', label: 'Ngà' },
  { id: 'green', bg: 'bg-[#E8F5E9]', hex: '#E8F5E9', text: 'text-slate-800', border: 'border-[#C8E6C9]', title: 'text-slate-900', divider: 'border-[#C8E6C9]', toolbarBg: 'bg-[#E8F5E9]/95', navBtn: 'text-slate-600 hover:bg-[#C8E6C9]', navBg: 'bg-[#E8F5E9] border-[#C8E6C9] text-slate-700 hover:bg-[#C8E6C9]', label: 'Xanh nhạt' },
  { id: 'pink', bg: 'bg-[#FDF4F5]', hex: '#FDF4F5', text: 'text-slate-800', border: 'border-[#F8E3E5]', title: 'text-slate-900', divider: 'border-[#F8E3E5]', toolbarBg: 'bg-[#FDF4F5]/95', navBtn: 'text-slate-600 hover:bg-[#F8E3E5]', navBg: 'bg-[#FDF4F5] border-[#F8E3E5] text-slate-700 hover:bg-[#F8E3E5]', label: 'Hồng nhạt' },
  { id: 'yellow', bg: 'bg-[#FFF8E1]', hex: '#FFF8E1', text: 'text-slate-800', border: 'border-[#FFECB3]', title: 'text-slate-900', divider: 'border-[#FFECB3]', toolbarBg: 'bg-[#FFF8E1]/95', navBtn: 'text-slate-600 hover:bg-[#FFECB3]', navBg: 'bg-[#FFF8E1] border-[#FFECB3] text-slate-700 hover:bg-[#FFECB3]', label: 'Vàng nhạt' },
  { id: 'black', bg: 'bg-[#121212]', hex: '#121212', text: 'text-slate-300', border: 'border-slate-800', title: 'text-slate-100', divider: 'border-slate-800', toolbarBg: 'bg-[#121212]/95', navBtn: 'text-slate-400 hover:bg-slate-800', navBg: 'bg-[#121212] border-slate-800 text-slate-300 hover:bg-slate-800', label: 'Đen' },
  { id: 'dark-blue', bg: 'bg-[#0B1A2A]', hex: '#0B1A2A', text: 'text-slate-300', border: 'border-[#152B43]', title: 'text-slate-100', divider: 'border-[#152B43]', toolbarBg: 'bg-[#0B1A2A]/95', navBtn: 'text-slate-400 hover:bg-[#152B43]', navBg: 'bg-[#0B1A2A] border-[#152B43] text-slate-300 hover:bg-[#152B43]', label: 'Xanh đậm' },
  { id: 'dark-gray', bg: 'bg-[#1E1E1E]', hex: '#1E1E1E', text: 'text-slate-300', border: 'border-[#2D2D2D]', title: 'text-slate-100', divider: 'border-[#2D2D2D]', toolbarBg: 'bg-[#1E1E1E]/95', navBtn: 'text-slate-400 hover:bg-[#2D2D2D]', navBg: 'bg-[#1E1E1E] border-[#2D2D2D] text-slate-300 hover:bg-[#2D2D2D]', label: 'Xám đậm' },
  { id: 'dark-green', bg: 'bg-[#1A2E20]', hex: '#1A2E20', text: 'text-slate-300', border: 'border-[#24422D]', title: 'text-slate-100', divider: 'border-[#24422D]', toolbarBg: 'bg-[#1A2E20]/95', navBtn: 'text-slate-400 hover:bg-[#24422D]', navBg: 'bg-[#1A2E20] border-[#24422D] text-slate-300 hover:bg-[#24422D]', label: 'Xanh lá đậm' },
  { id: 'dark-brown', bg: 'bg-[#2D1F1A]', hex: '#2D1F1A', text: 'text-[#D7C8B6]', border: 'border-[#422D26]', title: 'text-[#EFE5DA]', divider: 'border-[#422D26]', toolbarBg: 'bg-[#2D1F1A]/95', navBtn: 'text-[#D7C8B6] hover:bg-[#422D26]', navBg: 'bg-[#2D1F1A] border-[#422D26] text-[#D7C8B6] hover:bg-[#422D26]', label: 'Nâu đậm' },
];

export const FONTS = [
  { id: 'Roboto', name: 'Roboto', class: 'font-sans' },
  { id: 'Noto Sans', name: 'Noto Sans', class: 'font-sans' },
  { id: 'Source Sans Pro', name: 'Source Sans Pro', class: 'font-sans' },
  { id: 'Be Vietnam Pro', name: 'Be Vietnam Pro', class: 'font-sans' },
];

export interface ReaderSettings {
  theme: string;
  fontSize: number;
  lineHeight: number;
  textAlign: 'left' | 'justify';
  fontFamily: string;
  readingMode: 'scroll' | 'page';
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onSettingsChange: (newSettings: Partial<ReaderSettings>) => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
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
          <h3 className="font-bold text-lg text-slate-800">Cài đặt đọc</h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Màu nền */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-700 text-sm">Màu nền</span>
              <span className="text-xs text-slate-400">{THEMES.find(t => t.id === settings.theme)?.label || 'Mặc định'}</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => onSettingsChange({ theme: t.id })}
                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                    settings.theme === t.id ? 'border-red-500 scale-110' : 'border-slate-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: t.hex }}
                  title={t.label}
                >
                  {settings.theme === t.id && (
                    <svg className={`w-5 h-5 ${['white', 'ivory', 'green', 'pink', 'yellow'].includes(t.id) ? 'text-slate-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cỡ chữ */}
          <div className="space-y-3 flex items-center justify-between">
            <span className="font-semibold text-slate-700 text-sm">Cỡ chữ</span>
            <select 
              value={settings.fontSize} 
              onChange={(e) => onSettingsChange({ fontSize: Number(e.target.value) })}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:border-red-500 bg-white"
            >
              {[14, 16, 18, 20, 22, 24, 26, 28, 30].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>

          {/* Khoảng cách */}
          <div className="space-y-3 flex items-center justify-between">
            <span className="font-semibold text-slate-700 text-sm">Khoảng cách</span>
            <div className="flex gap-2">
              {[
                { label: 'Gọn', val: 1.4 },
                { label: 'Tiêu chuẩn', val: 1.8 },
                { label: 'Lớn', val: 2.2 }
              ].map(lh => (
                <button
                  key={lh.val}
                  onClick={() => onSettingsChange({ lineHeight: lh.val })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    settings.lineHeight === lh.val 
                      ? 'bg-[#C85250] text-white border-[#C85250]' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {lh.label}
                </button>
              ))}
            </div>
          </div>

          {/* Căn chữ */}
          <div className="space-y-3 flex items-center justify-between">
            <span className="font-semibold text-slate-700 text-sm">Căn chữ</span>
            <div className="flex gap-2">
              <button
                onClick={() => onSettingsChange({ textAlign: 'left' })}
                className={`flex flex-col items-center gap-1 px-5 py-2 rounded-lg transition-colors border ${
                  settings.textAlign === 'left'
                    ? 'bg-[#E88C8B] text-white border-[#E88C8B]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <AlignLeft className="w-5 h-5" />
                <span className="text-xs font-medium">Trái</span>
              </button>
              <button
                onClick={() => onSettingsChange({ textAlign: 'justify' })}
                className={`flex flex-col items-center gap-1 px-5 py-2 rounded-lg transition-colors border ${
                  settings.textAlign === 'justify'
                    ? 'bg-[#E88C8B] text-white border-[#E88C8B]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <AlignJustify className="w-5 h-5" />
                <span className="text-xs font-medium">Căn đều</span>
              </button>
            </div>
          </div>

          {/* Font chữ */}
          <div className="space-y-3">
            <span className="font-semibold text-slate-700 text-sm">Font chữ</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => onSettingsChange({ fontFamily: f.id })}
                  className={`flex flex-col items-center justify-center p-3 w-20 min-w-20 rounded-xl transition-all border ${
                    settings.fontFamily === f.id
                      ? 'border-[#C85250] bg-red-50 text-[#C85250]'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl font-bold mb-1" style={{ fontFamily: f.id }}>Aa</span>
                  <span className="text-[10px] text-center">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kiểu đọc */}
          <div className="space-y-3 flex items-center justify-between">
            <span className="font-semibold text-slate-700 text-sm">Kiểu đọc</span>
            <div className="flex gap-2">
              <button
                onClick={() => onSettingsChange({ readingMode: 'scroll' })}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  settings.readingMode === 'scroll'
                    ? 'bg-[#E88C8B] text-white border-[#E88C8B]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Cuộn
              </button>
              <button
                onClick={() => onSettingsChange({ readingMode: 'page' })}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  settings.readingMode === 'page'
                    ? 'bg-[#E88C8B] text-white border-[#E88C8B]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Trang
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;
