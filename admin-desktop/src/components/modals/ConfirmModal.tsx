import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const confirmMotion = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 }
};

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  message?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmModal({
  open,
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel'
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const content = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}>
          <motion.div
            {...confirmMotion}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-text text-lg mb-2">{title}</h3>
            {message && (
              <p className="text-sm text-text-muted mb-5 line-clamp-2">{message}</p>
            )}
            {!message && <div className="mb-5" />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-border text-text font-bold text-sm hover:bg-surface-2">
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600">
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
