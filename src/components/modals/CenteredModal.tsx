import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const centeredMotion = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
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
  maxWidth?: 'sm' | 'md';
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
  const maxW = maxWidth === 'md' ? 'max-w-md' : 'max-w-sm';

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={closeOnOverlay ? onClose : undefined}>
          <motion.div
            {...centeredMotion}
            onClick={(e) => e.stopPropagation()}
            className={`bg-surface rounded-2xl p-5 w-full shadow-2xl ${maxW} ${panelClassName}`}>
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
}
