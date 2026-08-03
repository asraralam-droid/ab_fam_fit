import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const centeredMotion = {
  initial: { scale: 0.96, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.96, opacity: 0 }
};

export type CenteredModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  closeOnOverlay?: boolean;
  /** Replaces default title row */
  header?: React.ReactNode;
  hideHeader?: boolean;
  panelClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg';
};

export function CenteredModal({
  open,
  onClose,
  title,
  children,
  closeOnOverlay = true,
  header,
  hideHeader = false,
  panelClassName = '',
  maxWidth = 'sm'
}: CenteredModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const maxW =
    maxWidth === 'lg' ? 'max-w-2xl' : maxWidth === 'md' ? 'max-w-md' : 'max-w-sm';

  const content = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 sm:p-6"
          onClick={closeOnOverlay ? onClose : undefined}>
          <motion.div
            {...centeredMotion}
            onClick={(e) => e.stopPropagation()}
            className={`bg-surface rounded-2xl p-5 sm:p-6 w-full shadow-2xl max-h-[min(90vh,900px)] overflow-y-auto ${maxW} ${panelClassName}`}>
            {!hideHeader &&
              (header ??
                (title ? (
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text">{title}</h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 -mr-2 text-text-muted hover:text-text"
                      aria-label="Close">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : null))}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
