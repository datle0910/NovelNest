import React, { useState } from 'react';

interface ReportChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasons: string[], details: string) => Promise<void>;
}

const REPORT_REASONS = [
  'Sai tên',
  'Sai xưng hô',
  'Nội dung không phù hợp',
  'Lỗi hiển thị/Định dạng',
  'Khác'
];

const ReportChapterModal: React.FC<ReportChapterModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (selectedReasons.length === 0 && !details.trim()) {
      alert('Vui lòng chọn ít nhất một lý do hoặc nhập chi tiết.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(selectedReasons, details);
      setSelectedReasons([]);
      setDetails('');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi gửi báo cáo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-base rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-orange-300 text-orange-400 rounded-full flex items-center justify-center">
            <span className="text-3xl font-light">!</span>
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
            Báo cáo chương này
          </h2>

          <div className="text-left space-y-3 mb-6">
            {REPORT_REASONS.map((reason) => (
              <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-brand-500 rounded border-slate-300 dark:border-white/20 focus:ring-brand-500 bg-transparent"
                  checked={selectedReasons.includes(reason)}
                  onChange={() => toggleReason(reason)}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {reason}
                </span>
              </label>
            ))}
          </div>

          <textarea
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-white/20 bg-transparent text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 min-h-[100px] resize-y mb-6"
            placeholder="Nhập chi tiết báo cáo"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          <div className="flex justify-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors disabled:opacity-50"
            >
              OK
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportChapterModal;
