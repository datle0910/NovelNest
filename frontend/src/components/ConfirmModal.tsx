import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  // Admin page aliases
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, onClose, onConfirm, onCancel,
  title = 'Xác nhận', message,
  confirmText = 'Xác nhận', cancelText = 'Hủy',
  confirmLabel, cancelLabel,
  danger = false, isDangerous = false,
}) => {
  if (!isOpen) return null;

  const handleClose = onClose || onCancel || (() => {});
  const isDanger = danger || isDangerous;
  const confirm = confirmLabel || confirmText;
  const cancel = cancelLabel || cancelText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-600'}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-3 w-full">
            <button onClick={handleClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all cursor-pointer">
              {cancel}
            </button>
            <button onClick={onConfirm}
              className={`flex-1 py-2.5 text-white font-bold rounded-xl text-sm transition-all cursor-pointer ${
                isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700'
              }`}>
              {confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
