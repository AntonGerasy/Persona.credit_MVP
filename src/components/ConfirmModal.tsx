import React from 'react';

/**
 * ConfirmModal — styled replacement for window.confirm / alert (v34.15, step 3/4).
 *
 * Two modes:
 *  - Confirm: pass cancelLabel → two buttons, onConfirm fires on the primary one.
 *  - Notice:  omit cancelLabel → single button that just closes (onConfirm optional).
 *
 * `danger` renders the primary button in red — use for destructive actions.
 */
export interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, confirmLabel, cancelLabel, danger, onConfirm, onClose }) => {
  const primary = () => {
    if (onConfirm) onConfirm();
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-black text-brand-dark uppercase tracking-widest mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={primary}
            className={`flex-1 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] text-white transition-all ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-dark hover:bg-brand-dark/90'}`}
          >
            {confirmLabel}
          </button>
          {cancelLabel && (
            <button
              onClick={onClose}
              className="px-6 py-3 border border-brand-border rounded-xl font-bold uppercase tracking-widest text-[11px] text-brand-dark hover:bg-slate-50 transition-all"
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
